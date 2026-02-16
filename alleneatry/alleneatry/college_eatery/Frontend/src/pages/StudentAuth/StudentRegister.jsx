import React, { useContext, useState } from 'react';
import { StoreContext } from '../../components/Context/StoreContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './StudentAuth.css';

const StudentRegister = () => {
  const { url, setToken, setUser } = useContext(StoreContext);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const sendOtp = async (e) => {
    e && e.preventDefault();
    setError('');
    if (!phone) return setError('Phone number is required');
    setLoading(true);
    try {
      const res = await axios.post(url + '/api/user/otp/send', { phone });
      if (res.data && res.data.success) {
        setStep('otp');
      } else {
        setError(res.data?.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Send OTP error', err);
      setError(err.response?.data?.message || 'An error occurred');
    } finally { setLoading(false); }
  };

  const verifyOtp = async (e) => {
    e && e.preventDefault();
    setError('');
    if (!otp) return setError('Enter the OTP');
    setLoading(true);
    try {
      const res = await axios.post(url + '/api/user/otp/verify', { phone, otp });
      if (res.data && res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        navigate('/');
      } else {
        setError(res.data?.message || 'OTP verification failed');
      }
    } catch (err) {
      console.error('Verify OTP error', err);
      setError(err.response?.data?.message || 'An error occurred');
    } finally { setLoading(false); }
  };

  return (
    <div className="student-auth-page">
      <div className="auth-card">
        <h2>Sign in with Phone</h2>
        {error && <div className="auth-error">{error}</div>}
        {step === 'phone' && (
          <form onSubmit={sendOtp} className="auth-form">
            <label>Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter phone number" />
            <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</button>
            <div className="auth-footer">
              <Link to="/student/login">Use email/password instead</Link>
            </div>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={verifyOtp} className="auth-form">
            <label>OTP</label>
            <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter OTP" />
            <button type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify & Sign In'}</button>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => setStep('phone')} className="link-like">Change phone</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudentRegister;
