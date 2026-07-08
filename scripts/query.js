const { Pool } = require('pg');
require('dotenv').config({path: '.env.local'});
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT title, type, body, "imageUrl" FROM konten ORDER BY "createdAt" DESC LIMIT 1', (err, res) => {
  if (err) console.error(err);
  else console.log(JSON.stringify(res.rows, null, 2));
  pool.end();
});
