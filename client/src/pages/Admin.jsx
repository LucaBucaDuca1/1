import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/Admin.css';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [storage, setStorage] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/');
      return;
    }
    loadData();
  }, [user, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await axios.get('/api/admin/users');
        setUsers(res.data);
      } else if (activeTab === 'storage') {
        const res = await axios.get('/api/admin/storage');
        setStorage(res.data);
      } else if (activeTab === 'audit') {
        const res = await axios.get('/api/audit-log?limit=50');
        setAuditLog(res.data);
      } else if (activeTab === 'apikeys') {
        const res = await axios.get('/api/api-keys');
        setApiKeys(res.data);
      } else if (activeTab === 'sessions') {
        const res = await axios.get('/api/sessions');
        setSessions(res.data);
      }
    } catch (error) {
      toast.error('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
      toast.success('Role updated');
      loadData();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      toast.success('User deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleScanLibrary = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/admin/scan-library');
      toast.success(`Scan complete: ${res.data.moviesFound} movies, ${res.data.showsFound} shows`);
    } catch (error) {
      toast.error('Scan failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async () => {
    const name = prompt('API Key name:');
    if (!name) return;
    try {
      const res = await axios.post('/api/api-keys', { name });
      toast.success('API Key created');
      alert(`Your API Key (save it, it won't be shown again):\n\n${res.data.key}`);
      loadData();
    } catch (error) {
      toast.error('Failed to create API key');
    }
  };

  const handleDeleteApiKey = async (id) => {
    try {
      await axios.delete(`/api/api-keys/${id}`);
      toast.success('API Key deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete API key');
    }
  };

  const handleRevokeSession = async (id) => {
    try {
      await axios.delete(`/api/sessions/${id}`);
      toast.success('Session revoked');
      loadData();
    } catch (error) {
      toast.error('Failed to revoke session');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>System management and monitoring</p>
      </div>

      <div className="admin-tabs">
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
          Users
        </button>
        <button className={activeTab === 'storage' ? 'active' : ''} onClick={() => setActiveTab('storage')}>
          Storage
        </button>
        <button className={activeTab === 'audit' ? 'active' : ''} onClick={() => setActiveTab('audit')}>
          Audit Log
        </button>
        <button className={activeTab === 'apikeys' ? 'active' : ''} onClick={() => setActiveTab('apikeys')}>
          API Keys
        </button>
        <button className={activeTab === 'sessions' ? 'active' : ''} onClick={() => setActiveTab('sessions')}>
          Sessions
        </button>
      </div>

      <div className="admin-content">
        {loading && <div className="loading">Loading...</div>}

        {activeTab === 'users' && !loading && (
          <div className="admin-section">
            <h2>Users ({users.length})</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={u.id === user.id}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="uploader">Uploader</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.id === user.id}
                        className="btn-danger-small"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'storage' && !loading && storage && (
          <div className="admin-section">
            <h2>Storage Stats</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Storage</h3>
                <p className="stat-value">{storage.totalStorageGB} GB</p>
              </div>
              <div className="stat-card">
                <h3>Media Count</h3>
                <p className="stat-value">{storage.mediaCount}</p>
              </div>
              <div className="stat-card">
                <h3>User Count</h3>
                <p className="stat-value">{storage.userCount}</p>
              </div>
            </div>

            <button onClick={handleScanLibrary} className="btn-primary" style={{ marginTop: '20px' }}>
              Scan Library for New Files
            </button>
          </div>
        )}

        {activeTab === 'audit' && !loading && (
          <div className="admin-section">
            <h2>Recent Actions</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.map(log => (
                  <tr key={log.id}>
                    <td>{new Date(log.created_at).toLocaleString()}</td>
                    <td>{log.username || 'Unknown'}</td>
                    <td>{log.action}</td>
                    <td>{log.resource_type} #{log.resource_id}</td>
                    <td>{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'apikeys' && !loading && (
          <div className="admin-section">
            <h2>API Keys</h2>
            <button onClick={handleCreateApiKey} className="btn-primary" style={{ marginBottom: '20px' }}>
              Create New API Key
            </button>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Key</th>
                  <th>Created</th>
                  <th>Last Used</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map(key => (
                  <tr key={key.id}>
                    <td>{key.name}</td>
                    <td><code>{key.key.substring(0, 20)}...</code></td>
                    <td>{new Date(key.created_at).toLocaleDateString()}</td>
                    <td>{key.last_used ? new Date(key.last_used).toLocaleDateString() : 'Never'}</td>
                    <td>
                      <button onClick={() => handleDeleteApiKey(key.id)} className="btn-danger-small">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'sessions' && !loading && (
          <div className="admin-section">
            <h2>Active Sessions</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Device</th>
                  <th>IP</th>
                  <th>Created</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(session => (
                  <tr key={session.id}>
                    <td>{session.device_name || 'Unknown'}</td>
                    <td>{session.ip_address}</td>
                    <td>{new Date(session.created_at).toLocaleDateString()}</td>
                    <td>{new Date(session.last_active).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => handleRevokeSession(session.id)} className="btn-danger-small">
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
