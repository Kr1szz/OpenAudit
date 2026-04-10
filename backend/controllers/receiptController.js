const fs = require('fs');
const db = require('../config/db');
const Receipt = require('../models/receipt');
const { parseReceipt } = require('../services/geminiServices.js');

async function uploadReceipt(req, res) {
  const filePath = req.file && req.file.path;

  if (!filePath) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  try {
    const data = await parseReceipt(filePath);
    console.log(data);
    const { vendor, amount, date, timestamp, category, items, confidence_score, currency } = data;
    const result = await Receipt.create({
      user_id: req.user.id,
      org_id: req.user.org_id,
      file_path: filePath,
      file_type: req.file.mimetype,
      vendor,
      amount,
      currency,
      receipt_date: date,
      timestamp,
      category,
      items,
      confidence_score,
      is_flagged: false,
      anomaly_reasons: [],
      source: 'web',
      is_shared: false
    });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      type: err.type || 'SERVER_ERROR',
      error: err.message,
    });
  } finally {
    fs.unlink(filePath, () => { });
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

module.exports = { uploadReceipt, getAllReceipts };