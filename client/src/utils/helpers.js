// Format time in seconds to MM:SS or HH:MM:SS
export const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Format duration in minutes to hours and minutes
export const formatDuration = (minutes) => {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Calculate progress percentage
export const calculateProgress = (current, total) => {
  if (!total || total === 0) return 0;
  return Math.min((current / total) * 100, 100);
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Get avatar URL
export const getAvatarUrl = (avatar) => {
  if (!avatar) return '/avatars/avatar1.svg';
  if (avatar.startsWith('http')) return avatar;
  return `/avatars/${avatar}`;
};

// Truncate text
export const truncate = (str, length = 100) => {
  if (!str || str.length <= length) return str;
  return str.substring(0, length) + '...';
};

// Group media by genre
export const groupByGenre = (mediaList) => {
  return mediaList.reduce((acc, item) => {
    const genre = item.genre || 'Other';
    if (!acc[genre]) {
      acc[genre] = [];
    }
    acc[genre].push(item);
    return acc;
  }, {});
};

// Get maturity rating color
export const getMaturityColor = (rating) => {
  switch (rating) {
    case 'G':
    case 'PG':
    case 'TV-G':
    case 'TV-PG':
      return '#4CAF50';
    case 'PG-13':
    case 'TV-14':
      return '#FFC107';
    case 'R':
    case 'TV-MA':
      return '#F44336';
    default:
      return '#9E9E9E';
  }
};
