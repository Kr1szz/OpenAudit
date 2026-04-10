const pool = require('../config/db');

class Receipt {
    static async create({ user_id, org_id, file_path, file_type, vendor, amount, currency, receipt_date, timestamp, category, items, confidence_score, is_flagged, anomaly_reasons, source = 'web', is_shared = false }) {
        const query = `
            INSERT INTO receipts (user_id, org_id, file_path, file_type, vendor, amount, currency, receipt_date, transaction_time, category, items, confidence_score, is_flagged, anomaly_reasons, source, is_shared)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING *
        `;
        const values = [user_id, org_id || null, file_path, file_type || 'image/jpeg', vendor, amount, currency, receipt_date || null, timestamp || null, category, JSON.stringify(items || []), confidence_score, is_flagged, anomaly_reasons || [], source, is_shared];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async findAll(userId = null) {
        let query = 'SELECT * FROM receipts';
        let values = [];
        if (userId) {
            query += ' WHERE user_id = $1';
            values = [userId];
        }
        query += ' ORDER BY created_at DESC';
        const result = await pool.query(query, values);
        return result.rows;
    }

    static async findById(id, userId) {
        const query = 'SELECT * FROM receipts WHERE id = $1 AND user_id = $2';
        const result = await pool.query(query, [id, userId]);
        return result.rows[0] || null;
    }

    static async deleteById(id, userId) {
        const query = 'DELETE FROM receipts WHERE id = $1 AND user_id = $2 RETURNING *';
        const result = await pool.query(query, [id, userId]);
        return result.rows[0] || null;
    }

    static async findDuplicates(vendor, amount, userId) {
        const query = 'SELECT * FROM receipts WHERE vendor = $1 AND amount = $2 AND user_id = $3';
        const result = await pool.query(query, [vendor, amount, userId]);
        return result.rows.length > 0;
    }
}

module.exports = Receipt;