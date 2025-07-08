import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Database {
  constructor() {
    sqlite3.verbose();
    this.db = new sqlite3.Database(path.join(__dirname, 'traffic_analyzer.db'));
    this.init();
  }

  init() {
    // Create files table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        filepath TEXT NOT NULL,
        filesize INTEGER NOT NULL,
        upload_time TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'processing'
      )
    `);

    // Create sessions table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        file_id TEXT NOT NULL,
        src_ip TEXT NOT NULL,
        dst_ip TEXT NOT NULL,
        src_port INTEGER,
        dst_port INTEGER,
        protocol TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT,
        packet_count INTEGER DEFAULT 0,
        bytes_sent INTEGER DEFAULT 0,
        bytes_received INTEGER DEFAULT 0,
        duration REAL DEFAULT 0,
        FOREIGN KEY (file_id) REFERENCES files (id)
      )
    `);

    // Create indexes for faster queries
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_src_ip ON sessions(src_ip)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_dst_ip ON sessions(dst_ip)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_protocol ON sessions(protocol)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_file_id ON sessions(file_id)`);
  }

  insertFile(file) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO files (id, filename, filepath, filesize, upload_time, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([
        file.id,
        file.filename,
        file.filepath,
        file.filesize,
        file.upload_time,
        file.status
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
      
      stmt.finalize();
    });
  }

  insertSession(session) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO sessions (
          id, file_id, src_ip, dst_ip, src_port, dst_port, 
          protocol, start_time, end_time, packet_count, 
          bytes_sent, bytes_received, duration
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([
        session.id,
        session.file_id,
        session.src_ip,
        session.dst_ip,
        session.src_port,
        session.dst_port,
        session.protocol,
        session.start_time,
        session.end_time,
        session.packet_count,
        session.bytes_sent,
        session.bytes_received,
        session.duration
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
      
      stmt.finalize();
    });
  }

  getFiles() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT f.*, COUNT(s.id) as session_count
        FROM files f
        LEFT JOIN sessions s ON f.id = s.file_id
        GROUP BY f.id
        ORDER BY f.upload_time DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  getSessions(options = {}) {
    return new Promise((resolve, reject) => {
      const {
        page = 1,
        limit = 50,
        search = '',
        protocol = '',
        startTime = '',
        endTime = ''
      } = options;

      let query = `
        SELECT s.*, f.filename
        FROM sessions s
        JOIN files f ON s.file_id = f.id
        WHERE 1=1
      `;
      
      const params = [];

      if (search) {
        query += ` AND (s.src_ip LIKE ? OR s.dst_ip LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }

      if (protocol) {
        query += ` AND s.protocol = ?`;
        params.push(protocol);
      }

      if (startTime) {
        query += ` AND s.start_time >= ?`;
        params.push(startTime);
      }

      if (endTime) {
        query += ` AND s.start_time <= ?`;
        params.push(endTime);
      }

      query += ` ORDER BY s.start_time DESC LIMIT ? OFFSET ?`;
      params.push(limit, (page - 1) * limit);

      this.db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else {
          // Get total count for pagination
          let countQuery = `
            SELECT COUNT(*) as total
            FROM sessions s
            JOIN files f ON s.file_id = f.id
            WHERE 1=1
          `;
          
          const countParams = [];
          
          if (search) {
            countQuery += ` AND (s.src_ip LIKE ? OR s.dst_ip LIKE ?)`;
            countParams.push(`%${search}%`, `%${search}%`);
          }

          if (protocol) {
            countQuery += ` AND s.protocol = ?`;
            countParams.push(protocol);
          }

          if (startTime) {
            countQuery += ` AND s.start_time >= ?`;
            countParams.push(startTime);
          }

          if (endTime) {
            countQuery += ` AND s.start_time <= ?`;
            countParams.push(endTime);
          }

          this.db.get(countQuery, countParams, (err, countResult) => {
            if (err) reject(err);
            else {
              resolve({
                sessions: rows,
                total: countResult.total,
                page,
                limit,
                totalPages: Math.ceil(countResult.total / limit)
              });
            }
          });
        }
      });
    });
  }

  getSessionById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT s.*, f.filename
        FROM sessions s
        JOIN files f ON s.file_id = f.id
        WHERE s.id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  getFileById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(`SELECT * FROM files WHERE id = ?`, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  updateFileStatus(id, status) {
    return new Promise((resolve, reject) => {
      this.db.run(`UPDATE files SET status = ? WHERE id = ?`, [status, id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  getStats() {
    return new Promise((resolve, reject) => {
      const queries = [
        'SELECT COUNT(*) as total_files FROM files',
        'SELECT COUNT(*) as total_sessions FROM sessions',
        'SELECT COUNT(DISTINCT protocol) as unique_protocols FROM sessions',
        'SELECT protocol, COUNT(*) as count FROM sessions GROUP BY protocol ORDER BY count DESC LIMIT 5'
      ];

      Promise.all(queries.map(query => 
        new Promise((resolve, reject) => {
          this.db.all(query, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        })
      )).then(results => {
        resolve({
          totalFiles: results[0][0].total_files,
          totalSessions: results[1][0].total_sessions,
          uniqueProtocols: results[2][0].unique_protocols,
          protocolDistribution: results[3]
        });
      }).catch(reject);
    });
  }
}

export default Database;