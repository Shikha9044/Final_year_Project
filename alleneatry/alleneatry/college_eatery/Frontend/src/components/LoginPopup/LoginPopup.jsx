import React, { useContext, useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../Context/StoreContext'
import axios from 'axios'

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken, setUser } = useContext(StoreContext)

  const [currState, setCurrState] = useState("Login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [data, setData] = useState({ name: '', email: '', password: '' })

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

    if (currState === "Login") {
      newUrl += "/api/user/login";
    } else {
      newUrl += "/api/user/register";
    }
    postData = data;

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
          {currState === "Login" ? null : <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Your name' required />}
          <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Your email' required />
          <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Your Password' required />
        </div>

        <button type='submit' disabled={loading}>
          {loading ? "Loading..." : (currState === "Sign Up" ? "Create Account" : "Login")}
        </button>
        
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
