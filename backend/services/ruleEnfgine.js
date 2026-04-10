const Receipt = require('../models/receipt');

function detectFraud({ vendor, amount, date }) {
    let flag = false;

    // Rule 1: amount > 10000
    if (amount > 10000) {
        flag = true;
    }

    // Rule 2: duplicate receipt (same vendor and amount)
    // Note: This is async, but for simplicity, we'll check after extraction
    // In controller, we'll call this separately

    // Rule 3: missing fields
    if (!vendor || !date) {
        flag = true;
    }

    return flag;
}

async function checkDuplicate(vendor, amount) {
    const duplicates = await Receipt.findDuplicates(vendor, amount);
    return duplicates;
}

module.exports = { detectFraud, checkDuplicate };