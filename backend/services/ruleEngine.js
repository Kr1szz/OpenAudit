const Receipt = require('../models/receipt');

function detectFraud({ vendor, amount, receipt_date }) {
    let is_flagged = false;
    let anomaly_reasons = [];

    // Rule 1: amount > 10000
    if (amount > 10000) {
        is_flagged = true;
        anomaly_reasons.push("High amount exceeding 10000 threshold");
    }

    // Rule 3: missing fields
    if (!vendor || !receipt_date) {
        is_flagged = true;
        anomaly_reasons.push("Missing vendor or receipt date");
    }

    return { is_flagged, anomaly_reasons };
}

async function checkDuplicate(vendor, amount) {
    const duplicates = await Receipt.findDuplicates(vendor, amount);
    return duplicates;
}

module.exports = { detectFraud, checkDuplicate };