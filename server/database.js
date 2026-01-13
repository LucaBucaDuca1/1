const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || './database.sqlite';
const db = new sqlite3.Database(dbPath);

function initDatabase() {
  db.serialize(() => {
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
        video_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS seasons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        media_id INTEGER,
        season_number INTEGER,
        title TEXT,
        FOREIGN KEY (media_id) REFERENCES media(id)
      )
    `);

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
        FOREIGN KEY (season_id) REFERENCES seasons(id)
      )
    `);

    // Insert sample data
    db.get('SELECT COUNT(*) as count FROM media', (err, row) => {
      if (!err && row.count === 0) {
        insertSampleData();
      }
    });
  });
}

function insertSampleData() {
  const sampleMovies = [
    {
      title: 'Sample Action Movie',
      description: 'An exciting action-packed adventure',
      type: 'movie',
      genre: 'Action',
      year: 2023,
      rating: 8.5,
      duration: 120,
      thumbnail: 'https://via.placeholder.com/300x450/FF6B6B/FFFFFF?text=Action+Movie',
      backdrop: 'https://via.placeholder.com/1920x1080/FF6B6B/FFFFFF?text=Action+Movie',
      video_url: 'sample.mp4'
    },
    {
      title: 'Sample Drama Series',
      description: 'A compelling dramatic story',
      type: 'series',
      genre: 'Drama',
      year: 2023,
      rating: 9.0,
      duration: 45,
      thumbnail: 'https://via.placeholder.com/300x450/4ECDC4/FFFFFF?text=Drama+Series',
      backdrop: 'https://via.placeholder.com/1920x1080/4ECDC4/FFFFFF?text=Drama+Series',
      video_url: null
    },
    {
      title: 'Sample Comedy Movie',
      description: 'A hilarious comedy that will make you laugh',
      type: 'movie',
      genre: 'Comedy',
      year: 2024,
      rating: 7.8,
      duration: 95,
      thumbnail: 'https://via.placeholder.com/300x450/FFE66D/FFFFFF?text=Comedy',
      backdrop: 'https://via.placeholder.com/1920x1080/FFE66D/FFFFFF?text=Comedy',
      video_url: 'sample.mp4'
    },
    {
      title: 'Sample Sci-Fi Adventure',
      description: 'Journey through space and time',
      type: 'movie',
      genre: 'Sci-Fi',
      year: 2024,
      rating: 8.2,
      duration: 140,
      thumbnail: 'https://via.placeholder.com/300x450/A8E6CF/FFFFFF?text=Sci-Fi',
      backdrop: 'https://via.placeholder.com/1920x1080/A8E6CF/FFFFFF?text=Sci-Fi',
      video_url: 'sample.mp4'
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO media (title, description, type, genre, year, rating, duration, thumbnail, backdrop, video_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sampleMovies.forEach(movie => {
    stmt.run(
      movie.title,
      movie.description,
      movie.type,
      movie.genre,
      movie.year,
      movie.rating,
      movie.duration,
      movie.thumbnail,
      movie.backdrop,
      movie.video_url
    );
  });

  stmt.finalize();

  // Add sample season and episodes for the series
  db.get('SELECT id FROM media WHERE type = "series" LIMIT 1', (err, row) => {
    if (!err && row) {
      db.run('INSERT INTO seasons (media_id, season_number, title) VALUES (?, ?, ?)',
        [row.id, 1, 'Season 1'], function(err) {
          if (!err) {
            const seasonId = this.lastID;
            const episodeStmt = db.prepare(`
              INSERT INTO episodes (season_id, episode_number, title, description, duration, thumbnail, video_url)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `);

            for (let i = 1; i <= 8; i++) {
              episodeStmt.run(
                seasonId,
                i,
                `Episode ${i}`,
                `Description for episode ${i}`,
                45,
                'https://via.placeholder.com/300x169/4ECDC4/FFFFFF?text=Ep' + i,
                'sample.mp4'
              );
            }
            episodeStmt.finalize();
          }
        }
      );
    }
  });
}

module.exports = { db, initDatabase };
