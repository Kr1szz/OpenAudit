require('dotenv').config();
const {Pool} = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false}
});
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'receipts'").then(res => {
    console.log(res.rows);
    process.exit(0);
}).catch(console.error);
