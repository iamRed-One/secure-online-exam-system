const fs = require('fs');
const path = require('path');
const pool = require('./client');

async function migrate() {
  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    console.log(`Running migration: ${file}`);
    await pool.query(sql);
  }
  console.log('All migrations complete');
  await pool.end();
}

migrate().catch(err => { console.error(err); process.exit(1); });