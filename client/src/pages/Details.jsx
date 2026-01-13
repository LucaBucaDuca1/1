import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Details.css';

const Details = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMediaDetails();
  }, [id]);

  const fetchMediaDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/media/${id}`);
      setMedia(response.data);
    } catch (error) {
      console.error('Error fetching media details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!media) {
    return <div className="loading">Media not found</div>;
  }

  return (
    <div className="details">
      <div
        className="details-hero"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.9) 100%), url(${media.backdrop})`
        }}
      >
        <div className="details-content">
          <h1 className="details-title">{media.title}</h1>

          <div className="details-meta">
            <span className="details-rating">★ {media.rating}</span>
            <span className="details-year">{media.year}</span>
            <span className="details-duration">
              {media.duration} min
            </span>
            <span className="details-genre">{media.genre}</span>
          </div>

          <p className="details-description">{media.description}</p>

          <div className="details-buttons">
            <button
              className="btn btn-play"
              onClick={() => navigate(`/watch/${media.id}`)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Play
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
          </div>

          {media.seasons && media.seasons.length > 0 && (
            <div className="seasons-container">
              <h2>Seasons & Episodes</h2>
              {media.seasons.map(season => (
                <div key={season.id} className="season">
                  <h3>{season.title || `Season ${season.season_number}`}</h3>
                  <div className="episodes-grid">
                    {season.episodes && season.episodes.map(episode => (
                      <div key={episode.id} className="episode-card">
                        <img src={episode.thumbnail} alt={episode.title} />
                        <div className="episode-info">
                          <h4>
                            {episode.episode_number}. {episode.title}
                          </h4>
                          <p>{episode.description}</p>
                          <span className="episode-duration">
                            {episode.duration} min
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Details;
