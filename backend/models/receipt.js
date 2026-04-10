const pool = require('../config/db');

class Receipt {
    static async create({ vendor, amount, date, flag, image_url, user_id }) {
        const query = `
            INSERT INTO receipts (vendor, amount, date, flag, image_url, user_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [vendor, amount, date, flag, image_url, user_id];
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

    static async findDuplicates(vendor, amount, userId) {
        const query = 'SELECT * FROM receipts WHERE vendor = $1 AND amount = $2 AND user_id = $3';
        const result = await pool.query(query, [vendor, amount, userId]);
        return result.rows.length > 0;
    }
}

module.exports = Receipt;