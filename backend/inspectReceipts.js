const pool = require('./config/db');
(async () => {
  try {
    const res = await pool.query('SELECT id,file_path,file_type,created_at FROM receipts ORDER BY created_at DESC LIMIT 10');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
})();
