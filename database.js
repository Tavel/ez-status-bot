const path = require('path');

const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'data', 'ez.sqlite');

const db = new sqlite3.Database(dbPath);

//const db = new sqlite3.Database(':memory:');

db.serialize(() => 
{
  db.run("CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY AUTOINCREMENT, chat_id TEXT UNIQUE, client_key TEXT)");
});

module.exports = db;
