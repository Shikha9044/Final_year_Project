import React, { useContext, useState } from 'react';
import { StoreContext } from '../../components/Context/StoreContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './StudentAuth.css';

const StudentLogin = () => {
  const { url, setToken, setUser } = useContext(StoreContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Email and password are required');
    setLoading(true);
    try {
      const res = await axios.post(url + '/api/user/login', { email, password });
      if (res.data && res.data.success) {
        setToken(res.data.token);
        const userInfo = res.data.user || { name, email };
        setUser(userInfo);
        localStorage.setItem('token', res.data.token);
        navigate('/');
      } else {
        setError(res.data?.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error', err);
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-auth-page">
      <div className="auth-card">
        <h2>Login</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={onSubmit} className="auth-form">
          <label>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name (optional)" />

          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />

          <label>Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />

          <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <div className="auth-footer">
          <Link to="/student/register">Don't have an account? Register</Link>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
