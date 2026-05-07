import React, { useContext, useState } from 'react';
import { StoreContext } from '../../components/Context/StoreContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './StudentAuth.css';

const StudentRegister = () => {
  const { url, setToken, setUser } = useContext(StoreContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      return setError('Name, email, password, and confirm password are required');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (!strongPasswordPattern.test(password)) {
      return setError('Password must include uppercase, lowercase, numbers, and special symbols');
    }

    setLoading(true);
    try {
      const res = await axios.post(url + '/api/user/student/register', {
        name,
        email,
        password,
        college,
        branch,
      });

      if (res.data && res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        navigate('/');
      } else {
        setError(res.data?.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Register error', err);
      setError(err.response?.data?.message || 'An error occurred');
    } finally { setLoading(false); }
  };

  return (
    <div className="student-auth-page">
      <div className="auth-card">
        <h2>Create your account</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={onSubmit} className="auth-form">
          <label>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />

          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" />

          <label>Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Create a strong password" />

          <label>Confirm Password</label>
          <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type="password" placeholder="Re-enter your password" />

          <label>College</label>
          <input value={college} onChange={e => setCollege(e.target.value)} placeholder="College name (optional)" />

          <label>Branch</label>
          <input value={branch} onChange={e => setBranch(e.target.value)} placeholder="Branch (optional)" />

          <p style={{ margin: 0, fontSize: '0.9rem', color: '#555', lineHeight: 1.4 }}>
            Use at least 8 characters with uppercase, lowercase, a number, and a special symbol.
          </p>

          <button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Register'}</button>
        </form>
        <div className="auth-footer">
          <Link to="/student/login">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;
