const pool = require('../config/db');
const bcrypt = require('bcrypt');

class User {
    static async create({ name, email, password, role = 'user' }) {
        const passwordHash = await bcrypt.hash(password, 10);
        const query = `
            INSERT INTO users (name, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, email, role
        `;
        const values = [name, email, passwordHash, role];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows[0];
    }

    static async findById(id) {
        const query = 'SELECT id, name, email, role FROM users WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async verifyPassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }
}

module.exports = User;