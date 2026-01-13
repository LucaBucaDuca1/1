import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Watch.css';

const Watch = () => {
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
    <div className="watch">
      <button className="back-button" onClick={() => navigate(-1)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back
      </button>

      <div className="player-container">
        <div className="video-wrapper">
          {media.video_url ? (
            <video
              controls
              autoPlay
              className="video-player"
              poster={media.backdrop}
            >
              <source src={`/media/${media.video_url}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="no-video">
              <img src={media.backdrop} alt={media.title} />
              <div className="no-video-overlay">
                <h2>Video not available</h2>
                <p>Please add a video file to play this content</p>
              </div>
            </div>
          )}
        </div>

        <div className="watch-info">
          <h1>{media.title}</h1>
          <div className="watch-meta">
            <span className="watch-rating">★ {media.rating}</span>
            <span className="watch-year">{media.year}</span>
            <span className="watch-genre">{media.genre}</span>
            <span className="watch-duration">{media.duration} min</span>
          </div>
          <p className="watch-description">{media.description}</p>
        </div>
      </div>
    </div>
  );
};

export default Watch;
