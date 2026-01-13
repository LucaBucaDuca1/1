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

    // Check if we need to seed data
    db.get('SELECT COUNT(*) as count FROM media', (err, row) => {
      if (!err && row.count === 0) {
        insertSampleData();
      }
    });

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
    ['demo', 'demo@mediaflix.com', hashedPassword, 'Demo User', 'avatar1.svg'],
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

function insertSampleData() {
  const sampleMedia = [
    {
      title: 'Quantum Horizon',
      description: 'A mind-bending journey through space and time as a team of scientists discovers a portal to parallel universes. Their mission to save humanity takes them through breathtaking cosmic landscapes.',
      type: 'movie',
      genre: 'Sci-Fi',
      year: 2024,
      rating: 9.2,
      duration: 148,
      thumbnail: 'https://via.placeholder.com/300x450/667eea/FFFFFF?text=Quantum+Horizon',
      backdrop: 'https://via.placeholder.com/1920x1080/667eea/FFFFFF?text=Quantum+Horizon',
      cast: 'Emma Stone, Ryan Gosling, Michael B. Jordan',
      director: 'Denis Villeneuve',
      maturity_rating: 'PG-13',
      tags: 'space,adventure,thriller',
      video_url: 'sample.mp4'
    },
    {
      title: 'The Last Kingdom',
      description: 'An epic tale of power, betrayal, and redemption set in a medieval fantasy world. Follow the journey of a young prince as he fights to reclaim his throne.',
      type: 'series',
      genre: 'Fantasy',
      year: 2024,
      rating: 9.5,
      duration: 55,
      thumbnail: 'https://via.placeholder.com/300x450/f093fb/FFFFFF?text=The+Last+Kingdom',
      backdrop: 'https://via.placeholder.com/1920x1080/f093fb/FFFFFF?text=The+Last+Kingdom',
      cast: 'Tom Holland, Zendaya, Benedict Cumberbatch',
      director: 'Peter Jackson',
      maturity_rating: 'TV-MA',
      tags: 'fantasy,drama,medieval',
      video_url: null
    },
    {
      title: 'Neon Nights',
      description: 'A stylish cyberpunk thriller following a hacker in a dystopian future who uncovers a conspiracy that threatens the entire city.',
      type: 'movie',
      genre: 'Thriller',
      year: 2024,
      rating: 8.7,
      duration: 132,
      thumbnail: 'https://via.placeholder.com/300x450/4facfe/FFFFFF?text=Neon+Nights',
      backdrop: 'https://via.placeholder.com/1920x1080/4facfe/FFFFFF?text=Neon+Nights',
      cast: 'Keanu Reeves, Ana de Armas, Idris Elba',
      director: 'Ridley Scott',
      maturity_rating: 'R',
      tags: 'cyberpunk,action,mystery',
      video_url: 'sample.mp4'
    },
    {
      title: 'Laugh Track',
      description: 'A hilarious comedy series about a struggling comedian trying to make it big while dealing with eccentric friends and family.',
      type: 'series',
      genre: 'Comedy',
      year: 2024,
      rating: 8.9,
      duration: 30,
      thumbnail: 'https://via.placeholder.com/300x450/f6e58d/000000?text=Laugh+Track',
      backdrop: 'https://via.placeholder.com/1920x1080/f6e58d/000000?text=Laugh+Track',
      cast: 'Chris Pratt, Awkwafina, Bill Hader',
      director: 'Judd Apatow',
      maturity_rating: 'TV-14',
      tags: 'comedy,sitcom,standup',
      video_url: null
    },
    {
      title: 'Shadow Protocol',
      description: 'An elite special forces team must stop a terrorist organization from unleashing a devastating weapon. Packed with intense action sequences.',
      type: 'movie',
      genre: 'Action',
      year: 2023,
      rating: 8.4,
      duration: 125,
      thumbnail: 'https://via.placeholder.com/300x450/ff6b6b/FFFFFF?text=Shadow+Protocol',
      backdrop: 'https://via.placeholder.com/1920x1080/ff6b6b/FFFFFF?text=Shadow+Protocol',
      cast: 'Tom Cruise, Charlize Theron, John Boyega',
      director: 'Christopher McQuarrie',
      maturity_rating: 'R',
      tags: 'action,military,thriller',
      video_url: 'sample.mp4'
    },
    {
      title: 'Echoes of Tomorrow',
      description: 'A thought-provoking drama about a family dealing with loss and redemption over three generations.',
      type: 'movie',
      genre: 'Drama',
      year: 2024,
      rating: 9.0,
      duration: 142,
      thumbnail: 'https://via.placeholder.com/300x450/a8e6cf/FFFFFF?text=Echoes',
      backdrop: 'https://via.placeholder.com/1920x1080/a8e6cf/FFFFFF?text=Echoes',
      cast: 'Meryl Streep, Timothée Chalamet, Saoirse Ronan',
      director: 'Greta Gerwig',
      maturity_rating: 'PG-13',
      tags: 'drama,family,emotional',
      video_url: 'sample.mp4'
    },
    {
      title: 'Mystery Bay',
      description: 'A detective series where a small coastal town harbors dark secrets. Each season unravels a new mystery.',
      type: 'series',
      genre: 'Mystery',
      year: 2023,
      rating: 8.8,
      duration: 45,
      thumbnail: 'https://via.placeholder.com/300x450/c7ceea/FFFFFF?text=Mystery+Bay',
      backdrop: 'https://via.placeholder.com/1920x1080/c7ceea/FFFFFF?text=Mystery+Bay',
      cast: 'Kate Winslet, Matthew McConaughey, Lupita Nyongo',
      director: 'Rian Johnson',
      maturity_rating: 'TV-MA',
      tags: 'mystery,detective,suspense',
      video_url: null
    },
    {
      title: 'Starlight Academy',
      description: 'Follow young students at a prestigious performing arts school as they chase their dreams of becoming stars.',
      type: 'series',
      genre: 'Musical',
      year: 2024,
      rating: 8.3,
      duration: 50,
      thumbnail: 'https://via.placeholder.com/300x450/ffeaa7/000000?text=Starlight',
      backdrop: 'https://via.placeholder.com/1920x1080/ffeaa7/000000?text=Starlight',
      cast: 'Zendaya, Harry Styles, Ariana Grande',
      director: 'Kenny Ortega',
      maturity_rating: 'TV-PG',
      tags: 'musical,drama,teen',
      video_url: null
    },
    {
      title: 'Blood Moon Rising',
      description: 'A chilling horror film about a cursed mansion where supernatural forces terrorize anyone who enters.',
      type: 'movie',
      genre: 'Horror',
      year: 2024,
      rating: 7.9,
      duration: 108,
      thumbnail: 'https://via.placeholder.com/300x450/2d3436/FFFFFF?text=Blood+Moon',
      backdrop: 'https://via.placeholder.com/1920x1080/2d3436/FFFFFF?text=Blood+Moon',
      cast: 'Anya Taylor-Joy, Oscar Isaac, Tilda Swinton',
      director: 'Ari Aster',
      maturity_rating: 'R',
      tags: 'horror,supernatural,scary',
      video_url: 'sample.mp4'
    },
    {
      title: 'Love in Paris',
      description: 'A heartwarming romantic comedy about two strangers who meet by chance in the City of Light and embark on an unforgettable adventure.',
      type: 'movie',
      genre: 'Romance',
      year: 2024,
      rating: 8.1,
      duration: 115,
      thumbnail: 'https://via.placeholder.com/300x450/fd79a8/FFFFFF?text=Love+in+Paris',
      backdrop: 'https://via.placeholder.com/1920x1080/fd79a8/FFFFFF?text=Love+in+Paris',
      cast: 'Florence Pugh, Henry Golding',
      director: 'Richard Curtis',
      maturity_rating: 'PG-13',
      tags: 'romance,comedy,travel',
      video_url: 'sample.mp4'
    },
    {
      title: 'Tech Wars',
      description: 'A documentary series exploring the fierce competition between tech giants and their impact on society.',
      type: 'series',
      genre: 'Documentary',
      year: 2024,
      rating: 8.6,
      duration: 55,
      thumbnail: 'https://via.placeholder.com/300x450/74b9ff/FFFFFF?text=Tech+Wars',
      backdrop: 'https://via.placeholder.com/1920x1080/74b9ff/FFFFFF?text=Tech+Wars',
      cast: 'Documentary',
      director: 'Alex Gibney',
      maturity_rating: 'TV-14',
      tags: 'documentary,technology,business',
      video_url: null
    },
    {
      title: 'Wild Frontier',
      description: 'An adventurous western film set in the 1880s, following a bounty hunter seeking redemption.',
      type: 'movie',
      genre: 'Western',
      year: 2023,
      rating: 8.5,
      duration: 138,
      thumbnail: 'https://via.placeholder.com/300x450/d63031/FFFFFF?text=Wild+Frontier',
      backdrop: 'https://via.placeholder.com/1920x1080/d63031/FFFFFF?text=Wild+Frontier',
      cast: 'Josh Brolin, Margot Robbie, Jeff Bridges',
      director: 'Taylor Sheridan',
      maturity_rating: 'R',
      tags: 'western,adventure,action',
      video_url: 'sample.mp4'
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO media (title, description, type, genre, year, rating, duration, thumbnail, backdrop,
                       video_url, cast, director, maturity_rating, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sampleMedia.forEach(media => {
    stmt.run(
      media.title, media.description, media.type, media.genre, media.year,
      media.rating, media.duration, media.thumbnail, media.backdrop,
      media.video_url, media.cast, media.director, media.maturity_rating, media.tags
    );
  });

  stmt.finalize();

  // Add sample seasons and episodes for series
  setTimeout(() => {
    db.all('SELECT id, title FROM media WHERE type = "series"', (err, series) => {
      if (!err && series) {
        series.forEach((show, idx) => {
          // Add 2 seasons per show
          for (let s = 1; s <= 2; s++) {
            db.run(
              `INSERT INTO seasons (media_id, season_number, title, description, episode_count, year)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [show.id, s, `Season ${s}`, `The ${s === 1 ? 'first' : 'second'} season of ${show.title}`, 8, 2024 - (2 - s)],
              function(err) {
                if (!err) {
                  const seasonId = this.lastID;

                  // Add episodes
                  const episodeStmt = db.prepare(`
                    INSERT INTO episodes (season_id, episode_number, title, description, duration, thumbnail, video_url, air_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                  `);

                  for (let e = 1; e <= 8; e++) {
                    episodeStmt.run(
                      seasonId,
                      e,
                      `Episode ${e}: ${getEpisodeTitle(e)}`,
                      `In this episode, ${getEpisodeDescription(e)}`,
                      45 + Math.floor(Math.random() * 15),
                      `https://via.placeholder.com/300x169/4facfe/FFFFFF?text=S${s}E${e}`,
                      'sample.mp4',
                      `2024-0${s}-${e < 10 ? '0' + e : e}`
                    );
                  }
                  episodeStmt.finalize();
                }
              }
            );
          }
        });
      }
    });
  }, 500);

  console.log('✓ Sample media data inserted');
}

function getEpisodeTitle(num) {
  const titles = [
    'The Beginning', 'Rising Tensions', 'Revelations', 'Breaking Point',
    'Turning Tide', 'Dark Secrets', 'Confrontation', 'The Finale'
  ];
  return titles[num - 1] || `Episode ${num}`;
}

function getEpisodeDescription(num) {
  const descriptions = [
    'the story begins and characters are introduced',
    'tensions rise as conflicts emerge',
    'shocking truths come to light',
    'everything comes to a head',
    'the situation changes dramatically',
    'hidden secrets are revealed',
    'characters face their biggest challenges',
    'the season reaches its climax'
  ];
  return descriptions[num - 1] || 'events unfold';
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
