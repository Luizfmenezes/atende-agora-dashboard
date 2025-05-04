
const path = require('path');
const fs = require('fs');
const BetterSqlite3 = require('better-sqlite3');

// Ensure the data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dataDir, 'banco.db');

// Initialize database connection
const db = new BetterSqlite3(dbPath);

// Create tables if they don't exist
const initDb = () => {
  // Create usuarios table
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      matricula TEXT UNIQUE,
      nome TEXT,
      cargo TEXT,
      setor TEXT,
      senha TEXT
    )
  `);

  // Create atendimentos table
  db.exec(`
    CREATE TABLE IF NOT EXISTS atendimentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      horario DATETIME DEFAULT CURRENT_TIMESTAMP,
      setor TEXT,
      motivo TEXT,
      attended BOOLEAN DEFAULT 0,
      attendedAt DATETIME,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);
  
  console.log('Database initialized successfully.');
};

// Initialize the database
initDb();

module.exports = db;
