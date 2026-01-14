require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { db, initDatabase, dbHelpers } = require('./database');
const { authenticateToken, optionalAuth, requireRole, login, register } = require('./auth');
const crypto = require('crypto');

if (process.env.JWT_SECRET === 'your-secret-key-change-in-production' || !process.env.JWT_SECRET) {
  console.error('\n❌ SECURITY WARNING: JWT_SECRET not set or using default!');
  console.error('   Set JWT_SECRET in server/.env before running in production.\n');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/media', express.static(path.join(__dirname, 'media')));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// simple rate limiting - prevents spam/abuse
// allows 100 requests per minute per ip, should be enough for normal use
const rateLimit = {};
app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const minute = 60 * 1000;

  if (!rateLimit[ip]) {
    rateLimit[ip] = { count: 1, resetTime: now + minute };
  } else if (now > rateLimit[ip].resetTime) {
    rateLimit[ip] = { count: 1, resetTime: now + minute };
  } else {
    rateLimit[ip].count++;
    if (rateLimit[ip].count > 100) {
      return res.status(429).json({ error: 'Too many requests, slow down' });
    }
  }
  next();
});

// file upload setup - supports up to 5gb which should be enough for most movies
// tested with a bunch of different video files, seems to work fine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'media', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024,
    files: 10
  },
  fileFilter: function (req, file, cb) {
    const allowedVideoExts = ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.m4v', '.flv', '.wmv'];
    const allowedImageExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const allowedVideoMimes = ['video/mp4', 'video/x-matroska', 'video/x-msvideo', 'video/quicktime', 'video/webm', 'video/x-m4v'];
    const allowedImageMimes = ['image/jpeg', 'image/png', 'image/webp'];

    const ext = path.extname(file.originalname).toLowerCase();
    const isVideo = allowedVideoExts.includes(ext) && (allowedVideoMimes.includes(file.mimetype) || file.mimetype.startsWith('video/'));
    const isImage = allowedImageExts.includes(ext) && allowedImageMimes.includes(file.mimetype);

    if (isVideo || isImage) {
      return cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${ext}`));
    }
  }
});

initDatabase();

// AUTH STUFF
app.post('/api/auth/login', login);
app.post('/api/auth/register', register);

// get logged in user info
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbHelpers.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MEDIA ROUTES

// upload endpoint - handles video + poster + backdrop images
// this took forever to get working with multer but it's solid now
app.post('/api/media/upload', authenticateToken, requireRole('uploader', 'admin'), upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'poster', maxCount: 1 },
  { name: 'backdrop', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, type, genre, year, duration, rating, cast, director, tags } = req.body;

    // basic validation
    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required' });
    }

    // sanitize inputs - remove any weird characters that might cause issues
    const sanitize = (str) => str ? String(str).trim().substring(0, 500) : '';
    const cleanTitle = sanitize(title);
    const cleanDesc = sanitize(description);
    const cleanGenre = sanitize(genre);
    const cleanCast = sanitize(cast);
    const cleanDirector = sanitize(director);
    const cleanTags = sanitize(tags);

    const videoFile = req.files['video'] ? req.files['video'][0] : null;
    const posterFile = req.files['poster'] ? req.files['poster'][0] : null;
    const backdropFile = req.files['backdrop'] ? req.files['backdrop'][0] : null;

    const videoUrl = videoFile ? `/media/uploads/${videoFile.filename}` : '';
    const posterUrl = posterFile ? `/media/uploads/${posterFile.filename}` : '/media/placeholders/poster.jpg';
    const backdropUrl = backdropFile ? `/media/uploads/${backdropFile.filename}` : '/media/placeholders/backdrop.jpg';

    const query = `
      INSERT INTO media (title, description, type, genre, year, duration, rating, poster_url, backdrop_url, video_url, cast, director, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [
      cleanTitle,
      cleanDesc,
      type,
      cleanGenre || 'Other',
      year || new Date().getFullYear(),
      duration || 0,
      rating || 'NR',
      posterUrl,
      backdropUrl,
      videoUrl,
      cleanCast,
      cleanDirector,
      cleanTags
    ], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      logAudit(req.user.id, 'media.upload', 'media', this.lastID, { title: cleanTitle, type }, req.ip);

      res.json({
        success: true,
        message: 'Media uploaded successfully',
        id: this.lastID,
        videoUrl,
        posterUrl,
        backdropUrl
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all media
app.get('/api/media', optionalAuth, (req, res) => {
  const { type, genre, search, limit = 50, sortBy = 'created_at', sortOrder = 'DESC', year, minRating } = req.query;
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

  if (year) {
    query += ' AND year = ?';
    params.push(parseInt(year));
  }

  if (minRating) {
    query += ' AND rating >= ?';
    params.push(parseFloat(minRating));
  }

  if (search) {
    query += ' AND (title LIKE ? OR description LIKE ? OR cast LIKE ? OR director LIKE ? OR tags LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }

  const validSortFields = ['title', 'year', 'rating', 'duration', 'created_at', 'view_count'];
  const validSortOrders = ['ASC', 'DESC'];
  const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
  const safeSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

  query += ` ORDER BY ${safeSortBy} ${safeSortOrder} LIMIT ?`;
  params.push(parseInt(limit));

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get media by ID
app.get('/api/media/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    db.get('SELECT * FROM media WHERE id = ?', [id], async (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        res.status(404).json({ error: 'Media not found' });
        return;
      }

      // Check if in user's list
      let inMyList = false;
      if (req.user) {
        inMyList = await dbHelpers.isInMyList(req.user.id, id);
      }

      // Increment view count
      db.run('UPDATE media SET view_count = view_count + 1 WHERE id = ?', [id]);

      // If it's a series, get seasons and episodes
      if (row.type === 'series') {
        db.all('SELECT * FROM seasons WHERE media_id = ? ORDER BY season_number', [id], (err, seasons) => {
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
              res.json({ ...row, seasons: seasonsWithEpisodes, inMyList });
            })
            .catch(err => {
              res.status(500).json({ error: err.message });
            });
        });
      } else {
        res.json({ ...row, inMyList });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get featured/trending media
app.get('/api/featured', (req, res) => {
  db.all('SELECT * FROM media ORDER BY rating DESC, view_count DESC LIMIT 10', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get media by genre
app.get('/api/genres', (req, res) => {
  db.all('SELECT DISTINCT genre FROM media WHERE genre IS NOT NULL ORDER BY genre', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => row.genre));
  });
});

app.get('/api/recommendations/:id', optionalAuth, (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  db.get('SELECT * FROM media WHERE id = ?', [id], (err, sourceMedia) => {
    if (err || !sourceMedia) {
      res.status(404).json({ error: 'Media not found' });
      return;
    }

    const tags = sourceMedia.tags ? sourceMedia.tags.split(',').map(t => t.trim()) : [];
    const cast = sourceMedia.cast ? sourceMedia.cast.split(',').map(c => c.trim()) : [];

    let query = `
      SELECT m.*,
        (CASE WHEN m.genre = ? THEN 3 ELSE 0 END) +
        (CASE WHEN m.director = ? AND m.director IS NOT NULL THEN 2 ELSE 0 END) +
        (CASE WHEN m.type = ? THEN 1 ELSE 0 END) +
        (CASE WHEN m.rating >= ? THEN 1 ELSE 0 END)
        as score
      FROM media m
      WHERE m.id != ?
    `;

    const params = [sourceMedia.genre, sourceMedia.director, sourceMedia.type, sourceMedia.rating - 1, id];

    if (tags.length > 0) {
      const tagConditions = tags.map(() => 'm.tags LIKE ?').join(' OR ');
      query += ` AND (${tagConditions})`;
      tags.forEach(tag => params.push(`%${tag}%`));
    }

    if (cast.length > 0 && cast.length <= 5) {
      const castConditions = cast.slice(0, 3).map(() => 'm.cast LIKE ?').join(' OR ');
      query += ` OR (${castConditions})`;
      cast.slice(0, 3).forEach(actor => params.push(`%${actor}%`));
    }

    if (userId) {
      query = `
        WITH scored_media AS (
          ${query}
        ),
        user_prefs AS (
          SELECT m.genre, COUNT(*) as genre_count
          FROM watch_history wh
          JOIN media m ON wh.media_id = m.id
          WHERE wh.user_id = ? AND wh.progress > 300
          GROUP BY m.genre
        )
        SELECT sm.*,
          sm.score + COALESCE(up.genre_count * 0.5, 0) as final_score
        FROM scored_media sm
        LEFT JOIN user_prefs up ON sm.genre = up.genre
        ORDER BY final_score DESC, sm.rating DESC, sm.year DESC
        LIMIT 12
      `;
      params.push(userId);
    } else {
      query += ' ORDER BY score DESC, m.rating DESC, m.year DESC LIMIT 12';
    }

    db.all(query, params, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  });
});

app.post('/api/media', authenticateToken, requireRole('uploader', 'admin'), (req, res) => {
  const {
    title, description, type, genre, year, rating, duration,
    thumbnail, backdrop, video_url, cast, director, maturity_rating, tags
  } = req.body;

  db.run(
    `INSERT INTO media (title, description, type, genre, year, rating, duration, thumbnail, backdrop, video_url, cast, director, maturity_rating, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, description, type, genre, year, rating, duration, thumbnail, backdrop, video_url, cast, director, maturity_rating, tags],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Media added successfully' });
    }
  );
});

// ==================== WATCH HISTORY ROUTES ====================

// Get continue watching for user
app.get('/api/watch-history', authenticateToken, async (req, res) => {
  try {
    const history = await dbHelpers.getWatchHistory(req.user.id, 20);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update watch progress
app.post('/api/watch-history', authenticateToken, async (req, res) => {
  try {
    const { mediaId, episodeId, progress, duration } = req.body;

    if (!mediaId || progress === undefined || !duration) {
      return res.status(400).json({ error: 'mediaId, progress, and duration required' });
    }

    await dbHelpers.updateWatchProgress(
      req.user.id,
      mediaId,
      episodeId || null,
      progress,
      duration
    );

    res.json({ message: 'Progress updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get watch progress for specific media
app.get('/api/watch-history/:mediaId', authenticateToken, (req, res) => {
  const { mediaId } = req.params;
  const { episodeId } = req.query;

  let query = `
    SELECT progress, duration, completed, last_watched
    FROM watch_history
    WHERE user_id = ? AND media_id = ?
  `;
  const params = [req.user.id, mediaId];

  if (episodeId) {
    query += ' AND episode_id = ?';
    params.push(episodeId);
  } else {
    query += ' AND episode_id IS NULL';
  }

  db.get(query, params, (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row || { progress: 0, duration: 0, completed: false });
  });
});

// ==================== MY LIST ROUTES ====================

// Get user's list
app.get('/api/my-list', authenticateToken, async (req, res) => {
  try {
    const list = await dbHelpers.getMyList(req.user.id);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add to my list
app.post('/api/my-list/:mediaId', authenticateToken, async (req, res) => {
  try {
    const { mediaId } = req.params;
    await dbHelpers.addToMyList(req.user.id, mediaId);
    res.json({ message: 'Added to My List' });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      res.status(409).json({ error: 'Already in My List' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Remove from my list
app.delete('/api/my-list/:mediaId', authenticateToken, async (req, res) => {
  try {
    const { mediaId } = req.params;
    await dbHelpers.removeFromMyList(req.user.id, mediaId);
    res.json({ message: 'Removed from My List' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if in my list
app.get('/api/my-list/check/:mediaId', authenticateToken, async (req, res) => {
  try {
    const { mediaId } = req.params;
    const inList = await dbHelpers.isInMyList(req.user.id, mediaId);
    res.json({ inList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== USER PREFERENCES ROUTES ====================

// Get user preferences
app.get('/api/preferences', authenticateToken, (req, res) => {
  db.get(
    'SELECT * FROM user_preferences WHERE user_id = ?',
    [req.user.id],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(row || {});
    }
  );
});

// Update user preferences
app.put('/api/preferences', authenticateToken, (req, res) => {
  const { autoplay_next, autoplay_previews, subtitle_language, audio_language, video_quality } = req.body;

  db.run(
    `INSERT INTO user_preferences (user_id, autoplay_next, autoplay_previews, subtitle_language, audio_language, video_quality)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       autoplay_next = ?,
       autoplay_previews = ?,
       subtitle_language = ?,
       audio_language = ?,
       video_quality = ?`,
    [req.user.id, autoplay_next, autoplay_previews, subtitle_language, audio_language, video_quality,
     autoplay_next, autoplay_previews, subtitle_language, audio_language, video_quality],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Preferences updated successfully' });
    }
  );
});

// ==================== USER PROFILE ROUTES ====================

// Update user profile
app.put('/api/profile', authenticateToken, (req, res) => {
  const { display_name, avatar } = req.body;

  let query = 'UPDATE users SET ';
  const updates = [];
  const params = [];

  if (display_name !== undefined) {
    updates.push('display_name = ?');
    params.push(display_name);
  }

  if (avatar !== undefined) {
    updates.push('avatar = ?');
    params.push(avatar);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No updates provided' });
  }

  query += updates.join(', ') + ' WHERE id = ?';
  params.push(req.user.id);

  db.run(query, params, async (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    try {
      const user = await dbHelpers.getUserById(req.user.id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

// ==================== STATS ROUTES ====================

// Get user stats
app.get('/api/stats', authenticateToken, (req, res) => {
  const queries = {
    watchTime: new Promise((resolve, reject) => {
      db.get(
        'SELECT SUM(duration) as total FROM watch_history WHERE user_id = ?',
        [req.user.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(Math.floor((row.total || 0) / 60)); // Convert to minutes
        }
      );
    }),
    myListCount: new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as count FROM my_list WHERE user_id = ?',
        [req.user.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count || 0);
        }
      );
    }),
    completedCount: new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(DISTINCT media_id) as count FROM watch_history WHERE user_id = ? AND completed = 1',
        [req.user.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count || 0);
        }
      );
    })
  };

  Promise.all([queries.watchTime, queries.myListCount, queries.completedCount])
    .then(([watchTime, myListCount, completedCount]) => {
      res.json({
        watchTimeMinutes: watchTime,
        myListCount,
        completedCount
      });
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
});

app.post('/api/auth/request-reset', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.json({ message: 'If email exists, reset link sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000);

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
        [resetToken, expires.toISOString(), user.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({
      message: 'If email exists, reset link sent',
      resetToken
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > datetime("now")',
        [token],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
        [hashedPassword, user.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/media/recently-added', optionalAuth, (req, res) => {
  const limit = parseInt(req.query.limit) || 20;

  db.all(
    'SELECT * FROM media ORDER BY created_at DESC LIMIT ?',
    [limit],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

app.get('/api/media/trending', optionalAuth, (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const days = parseInt(req.query.days) || 7;

  db.all(
    `SELECT m.*, COUNT(wh.id) as view_count
     FROM media m
     LEFT JOIN watch_history wh ON m.id = wh.media_id
     WHERE wh.last_watched > datetime('now', '-${days} days') OR wh.last_watched IS NULL
     GROUP BY m.id
     ORDER BY view_count DESC, m.created_at DESC
     LIMIT ?`,
    [limit],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

app.put('/api/media/:id', authenticateToken, requireRole('uploader', 'admin'), (req, res) => {
  const { id } = req.params;
  const { title, description, genre, year, rating, duration, cast, director, tags, maturity_rating } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  db.run(
    `UPDATE media SET title = ?, description = ?, genre = ?, year = ?, rating = ?, duration = ?, cast = ?, director = ?, tags = ?, maturity_rating = ? WHERE id = ?`,
    [title, description, genre, year, rating, duration, cast, director, tags, maturity_rating, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Media not found' });
      }
      res.json({ message: 'Media updated', changes: this.changes });
    }
  );
});

app.delete('/api/media/:id', authenticateToken, requireRole('uploader', 'admin'), (req, res) => {
  const { id } = req.params;

  db.get('SELECT video_url, thumbnail, backdrop FROM media WHERE id = ?', [id], (err, media) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    db.run('DELETE FROM media WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      [media.video_url, media.thumbnail, media.backdrop].forEach(fileUrl => {
        if (fileUrl && fileUrl.startsWith('/media/uploads/')) {
          const filePath = path.join(__dirname, fileUrl.replace('/media/', 'media/'));
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
          });
        }
      });

      logAudit(req.user.id, 'media.delete', 'media', id, { video_url: media.video_url }, req.ip);

      res.json({ message: 'Media deleted' });
    });
  });
});

app.get('/api/media/random', optionalAuth, (req, res) => {
  db.get(
    'SELECT * FROM media ORDER BY RANDOM() LIMIT 1',
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(row || null);
    }
  );
});

app.get('/api/admin/users', authenticateToken, requireRole('admin'), (req, res) => {
  db.all(
    'SELECT id, username, email, display_name, avatar, role, created_at, last_login FROM users ORDER BY created_at DESC',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

app.put('/api/admin/users/:id/role', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['viewer', 'uploader', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  db.run(
    'UPDATE users SET role = ? WHERE id = ?',
    [role, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Role updated', changes: this.changes });
    }
  );
});

app.delete('/api/admin/users/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params;

  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  db.run(
    'DELETE FROM users WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'User deleted', changes: this.changes });
    }
  );
});

app.get('/api/admin/storage', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const mediaPath = path.join(__dirname, 'media');

    const getDirectorySize = (dirPath) => {
      let totalSize = 0;
      const files = fs.readdirSync(dirPath);

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          totalSize += getDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      }

      return totalSize;
    };

    const totalSize = getDirectorySize(mediaPath);

    const mediaCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM media', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    const userCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    res.json({
      totalStorageBytes: totalSize,
      totalStorageGB: (totalSize / (1024 * 1024 * 1024)).toFixed(2),
      mediaCount,
      userCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/collections', authenticateToken, (req, res) => {
  db.all(
    `SELECT c.*, COUNT(ci.id) as item_count
     FROM collections c
     LEFT JOIN collection_items ci ON c.id = ci.collection_id
     WHERE c.user_id = ? OR c.is_public = 1
     GROUP BY c.id
     ORDER BY c.created_at DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

app.post('/api/collections', authenticateToken, (req, res) => {
  const { name, description, isPublic } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Collection name required' });
  }

  db.run(
    'INSERT INTO collections (user_id, name, description, is_public) VALUES (?, ?, ?, ?)',
    [req.user.id, name, description || '', isPublic ? 1 : 0],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, name, description, isPublic });
    }
  );
});

app.get('/api/collections/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT c.*, COUNT(ci.id) as item_count
     FROM collections c
     LEFT JOIN collection_items ci ON c.id = ci.collection_id
     WHERE c.id = ? AND (c.user_id = ? OR c.is_public = 1)
     GROUP BY c.id`,
    [id, req.user.id],
    (err, collection) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
      }

      db.all(
        `SELECT m.* FROM media m
         JOIN collection_items ci ON m.id = ci.media_id
         WHERE ci.collection_id = ?
         ORDER BY ci.added_at DESC`,
        [id],
        (err, items) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ ...collection, items });
        }
      );
    }
  );
});

app.post('/api/collections/:id/items', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { mediaId } = req.body;

  db.get('SELECT * FROM collections WHERE id = ? AND user_id = ?', [id, req.user.id], (err, collection) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    db.run(
      'INSERT INTO collection_items (collection_id, media_id) VALUES (?, ?)',
      [id, mediaId],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint')) {
            return res.status(409).json({ error: 'Item already in collection' });
          }
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Item added to collection' });
      }
    );
  });
});

app.delete('/api/collections/:id/items/:mediaId', authenticateToken, (req, res) => {
  const { id, mediaId } = req.params;

  db.get('SELECT * FROM collections WHERE id = ? AND user_id = ?', [id, req.user.id], (err, collection) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    db.run(
      'DELETE FROM collection_items WHERE collection_id = ? AND media_id = ?',
      [id, mediaId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Item removed from collection' });
      }
    );
  });
});

app.delete('/api/collections/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run(
    'DELETE FROM collections WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Collection deleted' });
    }
  );
});

app.delete('/api/admin/media/bulk', authenticateToken, requireRole('admin'), (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Invalid media IDs' });
  }

  const placeholders = ids.map(() => '?').join(',');

  db.run(
    `DELETE FROM media WHERE id IN (${placeholders})`,
    ids,
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Media deleted', deleted: this.changes });
    }
  );
});

app.get('/api/api-keys', authenticateToken, (req, res) => {
  db.all(
    'SELECT id, name, key, created_at, last_used, expires_at FROM api_keys WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

app.post('/api/api-keys', authenticateToken, (req, res) => {
  const { name, expiresIn } = req.body;
  const apiKey = 'hf_' + crypto.randomBytes(32).toString('hex');
  let expiresAt = null;

  if (expiresIn) {
    expiresAt = new Date(Date.now() + parseInt(expiresIn) * 24 * 60 * 60 * 1000).toISOString();
  }

  db.run(
    'INSERT INTO api_keys (user_id, key, name, expires_at) VALUES (?, ?, ?, ?)',
    [req.user.id, apiKey, name || 'Unnamed Key', expiresAt],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      logAudit(req.user.id, 'api_key.create', 'api_key', this.lastID, { name: name || 'Unnamed Key' }, req.ip);

      res.status(201).json({
        id: this.lastID,
        key: apiKey,
        name: name || 'Unnamed Key',
        expiresAt
      });
    }
  );
});

app.delete('/api/api-keys/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run(
    'DELETE FROM api_keys WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'API key deleted' });
    }
  );
});

app.get('/api/sessions', authenticateToken, (req, res) => {
  db.all(
    'SELECT id, device_name, ip_address, created_at, last_active FROM sessions WHERE user_id = ? ORDER BY last_active DESC',
    [req.user.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

app.delete('/api/sessions/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run(
    'DELETE FROM sessions WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Session revoked' });
    }
  );
});

app.get('/api/audit-log', authenticateToken, requireRole('admin'), (req, res) => {
  const limit = parseInt(req.query.limit) || 100;

  db.all(
    `SELECT al.*, u.username
     FROM audit_log al
     LEFT JOIN users u ON al.user_id = u.id
     ORDER BY al.created_at DESC
     LIMIT ?`,
    [limit],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

function logAudit(userId, action, resourceType, resourceId, details, ipAddress) {
  db.run(
    'INSERT INTO audit_log (user_id, action, resource_type, resource_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, action, resourceType, resourceId, JSON.stringify(details), ipAddress]
  );
}

app.get('/api/health', (req, res) => {
  const dbCheck = new Promise((resolve) => {
    db.get('SELECT 1', (err) => {
      resolve(!err);
    });
  });

  dbCheck.then(dbHealthy => {
    res.json({
      status: 'ok',
      message: 'HomeFlix server running',
      database: dbHealthy ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      memory: {
        used: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + 'MB',
        total: (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2) + 'MB'
      }
    });
  });
});

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║         🎬  HomeFlix Server v2.0 🎬                 ║
║                                                      ║
║  Server running on port ${PORT}                          ║
║  API available at http://localhost:${PORT}/api       ║
║                                                      ║
║  Features:                                           ║
║  ✓ User Authentication                               ║
║  ✓ Watch History & Resume Playback                   ║
║  ✓ My List (Favorites)                               ║
║  ✓ Recommendations                                   ║
║  ✓ User Preferences                                  ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
  `);
});
