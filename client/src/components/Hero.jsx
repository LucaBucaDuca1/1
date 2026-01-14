import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Hero.css';

const Hero = ({ media, onRandomMovie }) => {
  const navigate = useNavigate();
  const [loadingRandom, setLoadingRandom] = useState(false);

  const handleRandomMovie = async () => {
    setLoadingRandom(true);
    try {
      const res = await axios.get('/api/media/random');
      if (res.data) {
        if (onRandomMovie) {
          onRandomMovie(res.data);
        } else {
          navigate(`/details/${res.data.id}`);
        }
      }
    } catch (error) {
      console.error('Error fetching random movie:', error);
    } finally {
      setLoadingRandom(false);
    }
  };

  if (!media) return null;

  return (
    <div
      className="hero"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%), url(${media.backdrop})`
      }}
    >
      <div className="hero-content">
        <h1 className="hero-title">{media.title}</h1>
        <div className="hero-meta">
          <span className="hero-rating">★ {media.rating}</span>
          <span className="hero-year">{media.year}</span>
          <span className="hero-genre">{media.genre}</span>
        </div>
        <p className="hero-description">{media.description}</p>
        <div className="hero-buttons">
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/watch/${media.id}`)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Play
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/details/${media.id}`)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            More Info
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleRandomMovie}
            disabled={loadingRandom}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
            {loadingRandom ? 'Loading...' : 'Random'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
