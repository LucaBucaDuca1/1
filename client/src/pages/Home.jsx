import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Hero from '../components/Hero';
import MediaRow from '../components/MediaRow';
import '../styles/Home.css';

const Home = () => {
  const [featured, setFeatured] = useState(null);
  const [allMedia, setAllMedia] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [trending, setTrending] = useState([]);
  const [moviesByGenre, setMoviesByGenre] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [featuredRes, mediaRes, recentRes, trendingRes] = await Promise.all([
        axios.get('/api/featured'),
        axios.get('/api/media'),
        axios.get('/api/media/recently-added?limit=20'),
        axios.get('/api/media/trending?limit=20')
      ]);

      if (featuredRes.data.length > 0) {
        setFeatured(featuredRes.data[0]);
      }

      const mediaItems = mediaRes.data.items || mediaRes.data;
      setAllMedia(mediaItems);
      setRecentlyAdded(recentRes.data);
      setTrending(trendingRes.data);

      const genres = {};
      mediaItems.forEach(item => {
        if (item.genre) {
          if (!genres[item.genre]) {
            genres[item.genre] = [];
          }
          genres[item.genre].push(item);
        }
      });

      setMoviesByGenre(genres);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home">
      <Hero media={featured} />

      <div className="rows-container">
        {trending.length > 0 && (
          <MediaRow title="🔥 Trending Now" items={trending} />
        )}

        {recentlyAdded.length > 0 && (
          <MediaRow title="🆕 Recently Added" items={recentlyAdded} />
        )}

        <MediaRow title="Popular on HomeFlix" items={allMedia.slice(0, 10)} />

        {Object.entries(moviesByGenre).map(([genre, items]) => (
          <MediaRow key={genre} title={genre} items={items} />
        ))}
      </div>
    </div>
  );
};

export default Home;
