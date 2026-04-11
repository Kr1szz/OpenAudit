const db = require('../config/db');
const { generateTaxPdf } = require('../services/pdfService');
const jwt = require('jsonwebtoken');
const { cloudinary } = require('../config/cloudinary');

const REPORT_SHARE_SECRET = process.env.REPORT_SHARE_SECRET || process.env.JWT_SECRET || 'report-share-secret';
const REPORT_SHARE_EXPIRES_IN = process.env.REPORT_SHARE_EXPIRES_IN || '7d';

function parseNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildTaxResultFromTransaction(tx) {
  const annualIncome = parseNumber(tx.annualincome);
  const investments = parseNumber(tx.investments_80c);
  const otherDeductions = parseNumber(tx.other_deductions);
  const rentPaid = parseNumber(tx.rent_paid);
  const standardDeductionOld = 50000;
  const basicSalary = annualIncome * 0.5;
  const hraReceived = basicSalary * 0.4;
  const rentMinusBasic = rentPaid - (basicSalary * 0.1);
  const hraExemption = Math.max(0, Math.min(hraReceived, rentMinusBasic, basicSalary * 0.4));
  const standardDeductionNew = 75000;

  const oldTaxableIncome = Math.max(0, annualIncome - standardDeductionOld - investments - hraExemption - otherDeductions);
  const newTaxableIncome = Math.max(0, annualIncome - standardDeductionNew);

  return {
    annualIncome,
    investments,
    otherDeductions,
    rentPaid,
    oldRegime: {
      taxableIncome: oldTaxableIncome,
      tax: parseNumber(tx.calculated_old_tax)
    },
    newRegime: {
      taxableIncome: newTaxableIncome,
      tax: parseNumber(tx.calculated_new_tax)
    },
    recommendation: tx.recommendation || 'N/A',
    savings: parseNumber(tx.savings)
  };
}

exports.downloadReport = async (req, res) => {
  try {
    const reportId = parseInt(req.params.id, 10);
    if (Number.isNaN(reportId) || reportId <= 0) {
      return res.status(400).json({ error: 'Invalid report id.' });
    }

    const result = await db.query(
      'SELECT * FROM transactions WHERE id=$1 AND user_id=$2',
      [reportId, req.user.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const transaction = result.rows[0];
    const taxResult = buildTaxResultFromTransaction(transaction);
    const pdfBuffer = await generateTaxPdf(taxResult);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="report.pdf"');
    res.setHeader('Cache-Control', 'private, max-age=0, no-transform');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('downloadReport error:', error?.message || error);
    res.status(500).json({ error: 'Unable to generate or download the report.' });
  }
};

exports.createShareLink = async (req, res) => {
  try {
    const reportId = parseInt(req.params.id, 10);
    if (Number.isNaN(reportId) || reportId <= 0) {
      return res.status(400).json({ error: 'Invalid report id.' });
    }

    const result = await db.query(
      'SELECT id FROM transactions WHERE id=$1 AND user_id=$2',
      [reportId, req.user.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const token = jwt.sign(
      { reportId, userId: req.user.id, purpose: 'report-share' },
      REPORT_SHARE_SECRET,
      { expiresIn: REPORT_SHARE_EXPIRES_IN }
    );

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({
      url: `${baseUrl}/api/reports/${reportId}/public/${token}/download`,
      expiresIn: REPORT_SHARE_EXPIRES_IN
    });
  } catch (error) {
    console.error('createShareLink error:', error?.message || error);
    res.status(500).json({ error: 'Unable to create report share link.' });
  }
};

exports.downloadPublicReport = async (req, res) => {
  try {
    const reportId = parseInt(req.params.id, 10);
    if (Number.isNaN(reportId) || reportId <= 0) {
      return res.status(400).json({ error: 'Invalid report id.' });
    }

    const payload = jwt.verify(req.params.token, REPORT_SHARE_SECRET);
    if (
      payload.purpose !== 'report-share' ||
      Number(payload.reportId) !== reportId ||
      !payload.userId
    ) {
      return res.status(403).json({ error: 'Invalid report share link.' });
    }

    const result = await db.query(
      'SELECT * FROM transactions WHERE id=$1 AND user_id=$2',
      [reportId, payload.userId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const taxResult = buildTaxResultFromTransaction(result.rows[0]);
    const pdfBuffer = await generateTaxPdf(taxResult);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="report.pdf"');
    res.setHeader('Cache-Control', 'private, max-age=0, no-transform');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('downloadPublicReport error:', error?.message || error);
    res.status(403).json({ error: 'Report share link is invalid or expired.' });
  }
};

exports.getCloudinaryUrl = async (req, res) => {
  try {
    const reportId = parseInt(req.params.id, 10);
    if (Number.isNaN(reportId) || reportId <= 0) {
      return res.status(400).json({ error: 'Invalid report id.' });
    }

    const result = await db.query('SELECT * FROM transactions WHERE id=$1 AND user_id=$2', [reportId, req.user.id]);
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const tx = result.rows[0];
    if (tx.report_url) {
      return res.json({ url: tx.report_url });
    }

    const taxResult = buildTaxResultFromTransaction(tx);
    const pdfBuffer = await generateTaxPdf(taxResult);

    const cloudinaryResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'raw', format: 'pdf', folder: 'open_audit_reports' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(pdfBuffer);
    });

    const reportUrl = cloudinaryResult.secure_url;
    await db.query('UPDATE transactions SET report_url=$1 WHERE id=$2', [reportUrl, reportId]);

    res.json({ url: reportUrl });
  } catch (err) {
    console.error('getCloudinaryUrl error:', err);
    res.status(500).json({ error: 'Error generating public report link.' });
  }
};
