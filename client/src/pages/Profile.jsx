import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI, preferencesAPI } from '../utils/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/Profile.css';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('avatar1.svg');

  const avatars = ['avatar1.svg', 'avatar2.svg', 'avatar3.svg', 'avatar4.svg', 'avatar5.svg'];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || '');
      setSelectedAvatar(user.avatar || 'avatar1.svg');
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, prefsRes] = await Promise.all([
        profileAPI.getStats(),
        preferencesAPI.get()
      ]);
      setStats(statsRes.data);
      setPreferences(prefsRes.data);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      await profileAPI.update({
        display_name: displayName,
        avatar: selectedAvatar
      });
      updateUser({ display_name: displayName, avatar: selectedAvatar });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handlePreferenceChange = async (key, value) => {
    try {
      await preferencesAPI.update({ ...preferences, [key]: value });
      setPreferences(prev => ({ ...prev, [key]: value }));
      toast.success('Preference updated');
    } catch (error) {
      toast.error('Failed to update preference');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1 className="profile-title">My Profile</h1>

        <div className="profile-grid">
          {/* Profile Section */}
          <div className="profile-card">
            <h2>Profile Information</h2>

            <div className="avatar-section">
              <div className="current-avatar">
                <div className="avatar-large">
                  {selectedAvatar.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="avatar-grid">
                {avatars.map((avatar) => (
                  <div
                    key={avatar}
                    className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                    onClick={() => setSelectedAvatar(avatar)}
                  >
                    {avatar.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label>Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter display name"
              />
            </div>

            <div className="form-section">
              <label>Username</label>
              <input type="text" value={user?.username || ''} disabled />
            </div>

            <div className="form-section">
              <label>Email</label>
              <input type="email" value={user?.email || ''} disabled />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleUpdateProfile}
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Update Profile'}
            </button>
          </div>

          {/* Stats Section */}
          <div className="profile-card">
            <h2>Your Stats</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-icon">⏱️</div>
                <div className="stat-value">{stats?.watchTimeMinutes || 0} min</div>
                <div className="stat-label">Watch Time</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">✓</div>
                <div className="stat-value">{stats?.completedCount || 0}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">❤️</div>
                <div className="stat-value">{stats?.myListCount || 0}</div>
                <div className="stat-label">My List</div>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="profile-card full-width">
            <h2>Playback Preferences</h2>
            <div className="preferences-grid">
              <div className="preference-item">
                <div>
                  <h3>Autoplay Next Episode</h3>
                  <p>Automatically play the next episode in a series</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={preferences?.autoplay_next ?? true}
                    onChange={(e) => handlePreferenceChange('autoplay_next', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <div>
                  <h3>Autoplay Previews</h3>
                  <p>Automatically play previews while browsing</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={preferences?.autoplay_previews ?? true}
                    onChange={(e) => handlePreferenceChange('autoplay_previews', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="profile-card danger-zone full-width">
            <h2>Account Actions</h2>
            <button className="btn btn-danger" onClick={logout}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
