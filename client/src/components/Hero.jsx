import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Hero.css';

const Hero = ({ media }) => {
  const navigate = useNavigate();

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
        </div>
      </div>
    </div>
  );
};

export default Hero;
