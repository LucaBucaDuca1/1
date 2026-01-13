import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { myListAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/MyList.css';

const MyList = () => {
  const [myList, setMyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyList();
  }, []);

  const fetchMyList = async () => {
    try {
      setLoading(true);
      const response = await myListAPI.get();
      setMyList(response.data);
    } catch (error) {
      console.error('Error fetching my list:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="my-list-page">
      <div className="my-list-container">
        <h1 className="my-list-title">My List</h1>

        {myList.length === 0 ? (
          <div className="empty-list">
            <div className="empty-icon">📋</div>
            <h2>Your list is empty</h2>
            <p>Add movies and shows to your list to watch them later</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Browse Content
            </button>
          </div>
        ) : (
          <div className="my-list-grid">
            {myList.map((item) => (
              <div
                key={item.id}
                className="list-card"
                onClick={() => navigate(`/details/${item.id}`)}
              >
                <img src={item.thumbnail} alt={item.title} />
                <div className="list-card-overlay">
                  <h3>{item.title}</h3>
                  <div className="list-card-meta">
                    <span className="rating">★ {item.rating}</span>
                    <span className="year">{item.year}</span>
                    <span className="type">{item.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyList;
