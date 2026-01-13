import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MediaRow.css';

const MediaRow = ({ title, items }) => {
  const navigate = useNavigate();
  const rowRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -800 : 800;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });

      setTimeout(() => {
        const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
      }, 300);
    }
  };

  const handleItemClick = (id) => {
    navigate(`/details/${id}`);
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="media-row">
      <h2 className="row-title">{title}</h2>
      <div className="row-container">
        {showLeftArrow && (
          <button
            className="row-arrow row-arrow-left"
            onClick={() => scroll('left')}
          >
            ‹
          </button>
        )}

        <div className="row-items" ref={rowRef}>
          {items.map((item) => (
            <div
              key={item.id}
              className="row-item"
              onClick={() => handleItemClick(item.id)}
            >
              <img
                src={item.thumbnail}
                alt={item.title}
                loading="lazy"
              />
              <div className="item-overlay">
                <h3>{item.title}</h3>
                <div className="item-meta">
                  <span className="item-rating">★ {item.rating}</span>
                  <span className="item-year">{item.year}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showRightArrow && (
          <button
            className="row-arrow row-arrow-right"
            onClick={() => scroll('right')}
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
};

export default MediaRow;
