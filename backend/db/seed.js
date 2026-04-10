const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const fs = require('fs');
const pool = require('../config/db');

async function seedDatabase() {
    try {
        const schemaPath = path.join(__dirname, '../../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('Initializing database schema...');
        await pool.query(schema);
        console.log('Database successfully initialized!');
        
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

seedDatabase();