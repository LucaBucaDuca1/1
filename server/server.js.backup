require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { db, initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/media', express.static(path.join(__dirname, 'media')));

// Initialize database
initDatabase();

// Get all media
app.get('/api/media', (req, res) => {
  const { type, genre, search } = req.query;
  let query = 'SELECT * FROM media WHERE 1=1';
  const params = [];

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }

  if (genre) {
    query += ' AND genre = ?';
    params.push(genre);
  }

  if (search) {
    query += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get media by ID
app.get('/api/media/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM media WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Media not found' });
      return;
    }

    // If it's a series, get seasons and episodes
    if (row.type === 'series') {
      db.all('SELECT * FROM seasons WHERE media_id = ?', [id], (err, seasons) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        const seasonPromises = seasons.map(season => {
          return new Promise((resolve, reject) => {
            db.all('SELECT * FROM episodes WHERE season_id = ? ORDER BY episode_number',
              [season.id],
              (err, episodes) => {
                if (err) reject(err);
                else resolve({ ...season, episodes });
              }
            );
          });
        });

        Promise.all(seasonPromises)
          .then(seasonsWithEpisodes => {
            res.json({ ...row, seasons: seasonsWithEpisodes });
          })
          .catch(err => {
            res.status(500).json({ error: err.message });
          });
      });
    } else {
      res.json(row);
    }
  });
});

// Get featured/trending media
app.get('/api/featured', (req, res) => {
  db.all('SELECT * FROM media ORDER BY rating DESC LIMIT 10', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get media by genre
app.get('/api/genres', (req, res) => {
  db.all('SELECT DISTINCT genre FROM media WHERE genre IS NOT NULL', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => row.genre));
  });
});

// Add new media
app.post('/api/media', (req, res) => {
  const { title, description, type, genre, year, rating, duration, thumbnail, backdrop, video_url } = req.body;

  db.run(
    `INSERT INTO media (title, description, type, genre, year, rating, duration, thumbnail, backdrop, video_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, description, type, genre, year, rating, duration, thumbnail, backdrop, video_url],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Media added successfully' });
    }
  );
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Media server is running' });
});

app.listen(PORT, () => {
  console.log(`Media server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
