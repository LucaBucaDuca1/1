import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Search.css';

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      searchMedia();
    }
  }, [query]);

  const searchMedia = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/media?search=${encodeURIComponent(query)}`);
      setResults(response.data);
    } catch (error) {
      console.error('Error searching media:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Searching...</div>;
  }

  return (
    <div className="search-page">
      <div className="search-container-page">
        <h1>Search Results for "{query}"</h1>

        {results.length === 0 ? (
          <div className="no-results">
            <p>No results found for "{query}"</p>
            <p className="suggestion">Try different keywords or browse our collection</p>
          </div>
        ) : (
          <div className="search-results">
            <p className="results-count">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
            <div className="results-grid">
              {results.map(item => (
                <div
                  key={item.id}
                  className="result-card"
                  onClick={() => navigate(`/details/${item.id}`)}
                >
                  <img src={item.thumbnail} alt={item.title} />
                  <div className="result-info">
                    <h3>{item.title}</h3>
                    <div className="result-meta">
                      <span className="result-rating">★ {item.rating}</span>
                      <span className="result-year">{item.year}</span>
                      <span className="result-type">{item.type}</span>
                    </div>
                    <p className="result-description">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
