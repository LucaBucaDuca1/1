const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = process.env.DB_PATH || './database.sqlite';
const db = new sqlite3.Database(dbPath);

function initDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        display_name TEXT,
        avatar TEXT DEFAULT 'avatar1.svg',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
      )
    `);

    // Media table (enhanced)
    db.run(`
      CREATE TABLE IF NOT EXISTS media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        genre TEXT,
        year INTEGER,
        rating REAL,
        duration INTEGER,
        thumbnail TEXT,
        backdrop TEXT,
        logo TEXT,
        trailer_url TEXT,
        video_url TEXT,
        cast TEXT,
        director TEXT,
        maturity_rating TEXT DEFAULT 'PG-13',
        tags TEXT,
        view_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seasons table
    db.run(`
      CREATE TABLE IF NOT EXISTS seasons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        media_id INTEGER,
        season_number INTEGER,
        title TEXT,
        description TEXT,
        year INTEGER,
        episode_count INTEGER,
        thumbnail TEXT,
        FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
      )
    `);

    // Episodes table
    db.run(`
      CREATE TABLE IF NOT EXISTS episodes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        season_id INTEGER,
        episode_number INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        duration INTEGER,
        thumbnail TEXT,
        video_url TEXT,
        air_date DATE,
        FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE
      )
    `);

    // Watch history table
    db.run(`
      CREATE TABLE IF NOT EXISTS watch_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        media_id INTEGER NOT NULL,
        episode_id INTEGER,
        progress REAL DEFAULT 0,
        duration REAL DEFAULT 0,
        completed BOOLEAN DEFAULT 0,
        last_watched DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
        FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
        UNIQUE(user_id, media_id, episode_id)
      )
    `);

    // My List (favorites) table
    db.run(`
      CREATE TABLE IF NOT EXISTS my_list (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        media_id INTEGER NOT NULL,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
        UNIQUE(user_id, media_id)
      )
    `);

    // User preferences table
    db.run(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        autoplay_next BOOLEAN DEFAULT 1,
        autoplay_previews BOOLEAN DEFAULT 1,
        subtitle_language TEXT DEFAULT 'en',
        audio_language TEXT DEFAULT 'en',
        video_quality TEXT DEFAULT 'auto',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id)
      )
    `);

    // Create default user
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (!err && row.count === 0) {
        createDefaultUser();
      }
    });
  });
}

async function createDefaultUser() {
  const hashedPassword = await bcrypt.hash('demo123', 10);

  db.run(
    `INSERT INTO users (username, email, password, display_name, avatar)
     VALUES (?, ?, ?, ?, ?)`,
    ['demo', 'demo@homeflix.local', hashedPassword, 'Demo User', 'avatar1.svg'],
    function(err) {
      if (!err) {
        console.log('✓ Default user created - Username: demo, Password: demo123');

        // Create default preferences
        db.run(
          `INSERT INTO user_preferences (user_id) VALUES (?)`,
          [this.lastID]
        );
      }
    }
  );
}

// Helper functions for queries
const dbHelpers = {
  // Get user by username
  getUserByUsername: (username) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // Get user by ID
  getUserById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, username, email, display_name, avatar, created_at FROM users WHERE id = ?',
        [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // Create user
  createUser: async (username, email, password, displayName) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (username, email, password, display_name) VALUES (?, ?, ?, ?)`,
        [username, email, hashedPassword, displayName],
        function(err) {
          if (err) reject(err);
          else {
            // Create default preferences
            db.run(`INSERT INTO user_preferences (user_id) VALUES (?)`, [this.lastID]);
            resolve(this.lastID);
          }
        }
      );
    });
  },

  // Update watch progress
  updateWatchProgress: (userId, mediaId, episodeId, progress, duration) => {
    return new Promise((resolve, reject) => {
      const completed = progress / duration > 0.9;
      db.run(
        `INSERT INTO watch_history (user_id, media_id, episode_id, progress, duration, completed, last_watched)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(user_id, media_id, episode_id)
         DO UPDATE SET progress = ?, duration = ?, completed = ?, last_watched = CURRENT_TIMESTAMP`,
        [userId, mediaId, episodeId, progress, duration, completed ? 1 : 0, progress, duration, completed ? 1 : 0],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  },

  // Get watch history for user
  getWatchHistory: (userId, limit = 20) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT wh.*, m.title, m.thumbnail, m.type, m.duration as media_duration,
                e.title as episode_title, e.episode_number, s.season_number
         FROM watch_history wh
         JOIN media m ON wh.media_id = m.id
         LEFT JOIN episodes e ON wh.episode_id = e.id
         LEFT JOIN seasons s ON e.season_id = s.id
         WHERE wh.user_id = ? AND wh.completed = 0
         ORDER BY wh.last_watched DESC
         LIMIT ?`,
        [userId, limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  // Get my list
  getMyList: (userId) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT m.*, ml.added_at
         FROM my_list ml
         JOIN media m ON ml.media_id = m.id
         WHERE ml.user_id = ?
         ORDER BY ml.added_at DESC`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  // Add to my list
  addToMyList: (userId, mediaId) => {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO my_list (user_id, media_id) VALUES (?, ?)`,
        [userId, mediaId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  },

  // Remove from my list
  removeFromMyList: (userId, mediaId) => {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM my_list WHERE user_id = ? AND media_id = ?`,
        [userId, mediaId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  },

  // Check if in my list
  isInMyList: (userId, mediaId) => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT id FROM my_list WHERE user_id = ? AND media_id = ?`,
        [userId, mediaId],
        (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        }
      );
    });
  }
};

module.exports = { db, initDatabase, dbHelpers };
