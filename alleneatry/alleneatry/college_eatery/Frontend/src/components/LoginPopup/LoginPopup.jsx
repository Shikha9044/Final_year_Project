import React, { useContext, useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../Context/StoreContext'
import axios from 'axios'

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken, setUser } = useContext(StoreContext)

  const [currState, setCurrState] = useState("Login")
  const [authMethod, setAuthMethod] = useState('email') // 'email' or 'phone'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [data, setData] = useState({ name: '', email: '', password: '' })
  const [phoneState, setPhoneState] = useState({ phone: '', otp: '', step: 'phone' })

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }))
    // Clear error when user starts typing
    if (error) setError("")
  }

  const onLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    
    let newUrl = url;
    let postData = {};

    // Regular user endpoints (email-based)
      if (authMethod === 'email') {
        if (currState === "Login") {
          newUrl += "/api/user/login";
        } else {
          newUrl += "/api/user/register";
        }
        postData = data;
      } else {
        // phone OTP flow handled separately
        setLoading(false);
        return;
      }

    try {
      const response = await axios.post(newUrl, postData);

      if (response.data.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        localStorage.setItem("token", response.data.token);
        setShowLogin(false);
        
        // Clear form data
        setData({
          name: "",
          email: "",
          password: ""
        });
      }
      else {
        setError(response.data.message || "An error occurred");
      }
    } catch (error) {
      console.error("Login/Register Error:", error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Phone OTP handlers
  const sendOtp = async (e) => {
    e && e.preventDefault();
    setError('');
    if (!phoneState.phone) return setError('Phone is required');
    setLoading(true);
    try {
      const res = await axios.post(url + '/api/user/otp/send', { phone: phoneState.phone });
      if (res.data && res.data.success) {
        setPhoneState(s => ({ ...s, step: 'otp' }));
        // If dev returns OTP, prefill for convenience
        if (res.data.otp) setPhoneState(s => ({ ...s, otp: res.data.otp }));
      } else {
        setError(res.data?.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setError(err.response?.data?.message || 'An error occurred');
    } finally { setLoading(false); }
  }

  const verifyOtp = async (e) => {
    e && e.preventDefault();
    setError('');
    if (!phoneState.otp) return setError('Enter OTP');
    setLoading(true);
    try {
      const res = await axios.post(url + '/api/user/otp/verify', { phone: phoneState.phone, otp: phoneState.otp });
      if (res.data && res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        setShowLogin(false);
      } else {
        setError(res.data?.message || 'OTP verification failed');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError(err.response?.data?.message || 'An error occurred');
    } finally { setLoading(false); }
  }

  const resetForm = () => {
    setData({ name: "", email: "", password: "" });
    setError("");
  };

  const switchToLogin = () => {
    setCurrState("Login");
    resetForm();
  };

  const switchToSignUp = () => {
    setCurrState("Sign Up");
    resetForm();
  };

  return (
    <div className='login-popup'>
      <form onSubmit={onLogin} className="login-popup-container">
            <div className="login-popup-title" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <h2 style={{margin:0}}>{currState}</h2>
              <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
            </div>
        
        {error && (
          <div className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>
            {error}
          </div>
        )}
        
        <div className="login-popup-inputs">
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button type="button" onClick={() => setAuthMethod('email')} className={authMethod==='email' ? 'active-type' : ''}>Email</button>
            <button type="button" onClick={() => setAuthMethod('phone')} className={authMethod==='phone' ? 'active-type' : ''}>Phone OTP</button>
          </div>

          {authMethod === 'email' ? (
            <>
              {currState === "Login" ? null : <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Your name' required />}
              <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Your email' required />
              <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Your Password' required />
            </>
          ) : (
            <>
              {phoneState.step === 'phone' ? (
                <>
                  <input name='phone' value={phoneState.phone} onChange={(e) => setPhoneState(s => ({ ...s, phone: e.target.value }))} type='text' placeholder='Phone number' />
                  <button type='button' onClick={sendOtp} disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</button>
                </>
              ) : (
                <>
                  <input name='otp' value={phoneState.otp} onChange={(e) => setPhoneState(s => ({ ...s, otp: e.target.value }))} type='text' placeholder='Enter OTP' />
                  <button type='button' onClick={verifyOtp} disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</button>
                </>
              )}
            </>
          )}
        </div>
        
        {authMethod === 'email' && (
          <button type='submit' disabled={loading}>
            {loading ? "Loading..." : (currState === "Sign Up" ? "Create Account" : "Login")}
          </button>
        )}
        
        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>By Continuing, i agree to the terms of use & privacy policy.</p>
        </div>
        
        {currState === "Login" ? (
          <p>Create a new account ? <span onClick={switchToSignUp}>Click here</span></p>
        ) : (
          <p>Already have an account ? <span onClick={switchToLogin}>Login here</span></p>
        )}
      </form>
    </div>
  )
}

export default LoginPopup;
