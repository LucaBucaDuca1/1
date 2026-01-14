// upload page for adding new movies/shows to the library
// took a while to get the form looking good but i think it turned out nice

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Upload.css';

function Upload() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'movie',
    genre: 'Action',
    year: new Date().getFullYear(),
    duration: '',
    rating: 'NR',
    cast: '',
    director: '',
    tags: ''
  });
  const [files, setFiles] = useState({
    video: null,
    poster: null,
    backdrop: null
  });
  const [uploadProgress, setUploadProgress] = useState('');

  const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Documentary', 'Animation', 'Fantasy', 'Crime', 'Adventure'];
  const ratings = ['G', 'PG', 'PG-13', 'R', 'NC-17', 'NR', 'TV-MA', 'TV-14', 'TV-PG'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      setFiles(prev => ({ ...prev, [name]: selectedFiles[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress('Preparing upload...');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to upload media');
        navigate('/login');
        return;
      }

      const formDataToSend = new FormData();

      // Append form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Append files
      if (files.video) {
        setUploadProgress('Uploading video file...');
        formDataToSend.append('video', files.video);
      }
      if (files.poster) {
        formDataToSend.append('poster', files.poster);
      }
      if (files.backdrop) {
        formDataToSend.append('backdrop', files.backdrop);
      }

      setUploadProgress('Uploading to server...');

      const response = await fetch('http://localhost:3001/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        setUploadProgress('Upload successful!');
        alert('Media uploaded successfully!');
        navigate('/');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
      setUploadProgress('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-container">
        <h1>Upload Media</h1>
        <p className="upload-subtitle">Add movies, TV shows, and more to your library</p>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-section">
            <h2>Basic Information</h2>

            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Enter description"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Type *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="movie">Movie</option>
                  <option value="series">TV Series</option>
                  <option value="documentary">Documentary</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="genre">Genre</label>
                <select
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                >
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="year">Year</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div className="form-group">
                <label htmlFor="duration">Duration (minutes)</label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 120"
                />
              </div>

              <div className="form-group">
                <label htmlFor="rating">Rating</label>
                <select
                  id="rating"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                >
                  {ratings.map(rating => (
                    <option key={rating} value={rating}>{rating}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Additional Details</h2>

            <div className="form-group">
              <label htmlFor="cast">Cast (comma separated)</label>
              <input
                type="text"
                id="cast"
                name="cast"
                value={formData.cast}
                onChange={handleInputChange}
                placeholder="Actor 1, Actor 2, Actor 3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="director">Director</label>
              <input
                type="text"
                id="director"
                name="director"
                value={formData.director}
                onChange={handleInputChange}
                placeholder="Director name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags (comma separated)</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Files</h2>

            <div className="form-group">
              <label htmlFor="video">Video File</label>
              <input
                type="file"
                id="video"
                name="video"
                onChange={handleFileChange}
                accept="video/*,.mp4,.mkv,.avi,.mov,.webm"
              />
              {files.video && <p className="file-name">Selected: {files.video.name}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="poster">Poster Image</label>
              <input
                type="file"
                id="poster"
                name="poster"
                onChange={handleFileChange}
                accept="image/*"
              />
              {files.poster && <p className="file-name">Selected: {files.poster.name}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="backdrop">Backdrop Image</label>
              <input
                type="file"
                id="backdrop"
                name="backdrop"
                onChange={handleFileChange}
                accept="image/*"
              />
              {files.backdrop && <p className="file-name">Selected: {files.backdrop.name}</p>}
            </div>
          </div>

          {uploadProgress && (
            <div className="upload-progress">
              {uploadProgress}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Media'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Upload;
