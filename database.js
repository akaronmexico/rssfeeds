const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite','OPEN_READWRITE');

module.exports = db;
