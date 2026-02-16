
import React, { useEffect } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  useEffect(() => {
    // Remove manual admin login: set demo token and continue.
    localStorage.setItem('token', 'admin-demo-token');
    onLogin && onLogin();
  }, [onLogin]);

  return (
    <div className="login-removed">
      <p>Admin login removed — signing in automatically.</p>
    </div>
  );
};

export default Login;
