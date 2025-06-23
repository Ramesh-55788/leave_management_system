import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../userContext';
import api from '../utils/api';
import axios from 'axios';
import '../styles/login.css';
import { notifyError} from '../utils/toast';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password }); // no retry
      login(res.data.user);
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers['Authorization'] = `Bearer ${res.data.token}`;
      navigate('/');
    }
    catch (error) {
      console.error('Login error:', error.response?.data);
      if (error.response) {
        notifyError(error.response.data.error || 'Login failed. Please try again.');
      } else {
        notifyError('Server error. Please try again.');
      }
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <button type="submit" className="submit-button">Login</button>
      </form>
    </div>
  );
}

export default Login;
