const fs = require('fs');
const path = require('path');
const Receipt = require('../models/receipt');
const { parseReceipt } = require('../services/geminiServices.js');
const { evaluateDocument } = require('../services/documentRuleEngine.js');
const { detectAnomalies } = require('../services/anamolyEngine.js');
const { aggregateFinancials } = require('../services/aggregationEngine.js');

function mapReceiptRowToEngineDocument(row) {
  let items = [];
  try {
    items = Array.isArray(row.items) ? row.items : JSON.parse(row.items || '[]');
  } catch {
    items = [];
  }

  return {
    vendor: row.vendor,
    amount: row.amount,
    document_date: row.receipt_date,
    category: row.category,
    document_type: row.document_type || '',
    items,
    confidence_score: row.confidence_score,
    data: {
      amount: row.amount,
      category: row.category,
      document_date: row.receipt_date,
      currency: row.currency,
      confidence_score: row.confidence_score,
      items,
      vendor: row.vendor,
    },
  };
}

function canonicalizeCategory(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return null;

  if (raw === 'rent receipt' || raw.includes('rent') || raw.includes('hra')) return 'Rent Receipt';
  if (raw === 'form 16' || raw === 'form16' || raw.includes('form 16') || raw.includes('form16')) return 'Form 16';
  if (raw === 'investment proof' || raw.includes('invest') || raw.includes('80c') || raw.includes('proof')) return 'Investment Proof';
  if (raw === 'medical bills' || raw.includes('medical') || raw.includes('health') || raw.includes('hospital')) return 'Medical Bills';
  if (raw === 'bank statement' || raw.includes('bank') || raw.includes('statement')) return 'Bank Statement';
  if (raw === 'other') return 'Other';

  return null;
}

function normalizeCategory(parsedCategory, selectedCategory) {
  return canonicalizeCategory(selectedCategory) || canonicalizeCategory(parsedCategory) || 'Other';
}

async function uploadReceipt(req, res) {
  const filePath = req.file && req.file.path;

  if (!filePath) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  try {
    const data = await parseReceipt(filePath);
    const { vendor, amount, receipt_date, timestamp, category, items, confidence_score, currency } = data;
    const normalizedCategory = normalizeCategory(category, req.body?.category);

    const parsedDocument = {
      vendor,
      amount,
      document_date: receipt_date,
      category: normalizedCategory,
      document_type: '',
      items,
      confidence_score,
    };

    const existingReceipts = await Receipt.findAll(req.user?.id || null);
    const previousDocuments = existingReceipts.map(mapReceiptRowToEngineDocument);
    const context = {
      historicalAmounts: previousDocuments.map((doc) => doc.amount),
      previousDocuments,
      knownVendors: previousDocuments.map((doc) => doc.vendor),
    };

    const documentAnalysis = evaluateDocument(parsedDocument);
    const anomalyAnalysis = detectAnomalies(parsedDocument, context);

    const currentEngineDocument = {
      classification: documentAnalysis.classification,
      data: {
        ...parsedDocument,
        amount,
        category: normalizedCategory,
        document_date: receipt_date,
        currency,
        confidence_score,
      },
      anomaly: anomalyAnalysis,
    };

    const aggregateDocuments = previousDocuments.map((doc) => ({
      classification: 'unknown',
      data: doc.data,
      anomaly: { risk_score: 0 },
    }));
    aggregateDocuments.push(currentEngineDocument);

    const financialAggregate = aggregateFinancials(aggregateDocuments);

    // Store relative path for serving via /uploads endpoint
    const relativePath = `uploads/${req.file.filename}`;
    
    const result = await Receipt.create({
      user_id: req.user.id,
      org_id: req.user.org_id,
      file_path: relativePath,
      file_type: req.file.mimetype,
      vendor,
      amount,
      currency,
      receipt_date,
      timestamp,
      category: normalizedCategory,
      items,
      confidence_score,
      is_flagged: anomalyAnalysis.recommended_action !== 'accept',
      anomaly_reasons: anomalyAnalysis.anomalies,
      source: 'web',
      is_shared: false,
    });

    return res.status(200).json({
      success: true,
      receipt: result,
      extracted_data: data,
      document_analysis: documentAnalysis,
      anomaly_analysis: anomalyAnalysis,
      financial_aggregate: financialAggregate,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      type: err.type || 'SERVER_ERROR',
      error: err.message,
    });
  } finally {
    // deliberately left intact to permit manual downloads and frontend previews
  }
}

async function deleteReceipt(req, res) {
  const receiptId = Number(req.params.id);
  if (Number.isNaN(receiptId)) {
    return res.status(400).json({ success: false, error: 'Invalid receipt id' });
  }

  try {
    const existing = await Receipt.findById(receiptId, req.user.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Receipt not found' });
    }

    const filePath = existing.file_path;
    if (filePath) {
      const absolutePath = path.join(__dirname, '..', filePath);
      fs.unlink(absolutePath, (unlinkErr) => {
        if (unlinkErr && unlinkErr.code !== 'ENOENT') {
          console.error('Failed to delete file:', unlinkErr);
        }
      });
    }

    await Receipt.deleteById(receiptId, req.user.id);
    return res.status(200).json({ success: true, message: 'Receipt deleted' });
  } catch (err) {
    console.error('Failed to delete receipt:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete receipt' });
  }
}

async function getAllReceipts(req, res) {
  try {
    // If you want only the current user's receipts, pass req.user.id.
    // For admin users, you can pass null to fetch all receipts.
    const receipts = await Receipt.findAll(req.user?.id || null);
    return res.status(200).json({ success: true, receipts });
  } catch (err) {
    console.error('Failed to fetch receipts:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch receipts' });
  }
}

module.exports = { uploadReceipt, getAllReceipts, deleteReceipt };