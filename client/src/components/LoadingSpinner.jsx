import React from 'react';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = ({ fullScreen = false }) => {
  return (
    <div className={`loading-spinner-container ${fullScreen ? 'fullscreen' : ''}`}>
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
