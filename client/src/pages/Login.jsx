import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      navigate('/');
    }

    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setUsername('demo');
    setPassword('demo123');
    setLoading(true);

    const result = await login('demo', 'demo123');

    if (result.success) {
      navigate('/');
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-background"></div>
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <h1>HomeFlix</h1>
            <p>Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-auth btn-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <button onClick={handleDemoLogin} className="btn-auth btn-demo" disabled={loading}>
            Try Demo Account
          </button>

          <div className="auth-footer">
            <p>
              New to HomeFlix? <Link to="/register">Sign up now</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
