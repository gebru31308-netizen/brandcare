
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import AuthLayout from './AuthLayout';

function Login({ onLogin, onRegister }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load remembered phone and password
  useEffect(() => {
    const savedPhone = localStorage.getItem('brandcare_phone');
    const savedPassword = localStorage.getItem('brandcare_password');

    if (savedPhone && savedPassword) {
      setPhone(savedPhone);
      setPassword(savedPassword);
      setRememberMe(true);
    } else if (savedPhone) {
      setPhone(savedPhone);
      setRememberMe(true);
    }
  }, []);

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrorMessage('');

    try {
      const cleanPhone = phone.trim();

      const { data, error } = await supabase
        .from('users')
        .select('id, phone')
        .eq('phone', cleanPhone)
        .eq('password', password)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setErrorMessage('Incorrect phone number or password.');
        return;
      }

      // Remember phone and password only if selected
      if (rememberMe) {
        localStorage.setItem('brandcare_phone', cleanPhone);
        localStorage.setItem('brandcare_password', password);
      } else {
        localStorage.removeItem('brandcare_phone');
        localStorage.removeItem('brandcare_password');
      }

      // Pass customer information and credentials to App.jsx
      onLogin(data, {
        phone: cleanPhone,
        password: password
      });

    } catch (error) {
      console.error('Login error:', error);

      setErrorMessage(
        error.message || 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      activeTab="login"
      onLoginTab={() => {}}
      onRegisterTab={onRegister}
    >
      {/* Error Message */}
      {errorMessage && (
        <div className="alert alert-danger rounded-3 small py-2">
          <i className="bi bi-exclamation-circle me-2"></i>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleLogin}>
        {/* Phone Number */}
        <div className="mb-3">
          <div
            className="d-flex align-items-center rounded-3 px-3"
            style={{
              background: '#ffffff',
              border: '1px solid #dedaf8',
              height: '55px'
            }}
          >
            <i
              className="bi bi-telephone-fill me-3"
              style={{
                color: '#6654e8',
                fontSize: '18px'
              }}
            ></i>

            <input
              type="tel"
              className="form-control border-0 shadow-none p-0"
              style={{
                background: 'transparent',
                fontSize: '15px'
              }}
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-3">
          <div
            className="d-flex align-items-center rounded-3 px-3"
            style={{
              background: '#ffffff',
              border: '1px solid #dedaf8',
              height: '55px'
            }}
          >
            <i
              className="bi bi-lock-fill me-3"
              style={{
                color: '#6654e8',
                fontSize: '18px'
              }}
            ></i>

            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control border-0 shadow-none p-0"
              style={{
                background: 'transparent',
                fontSize: '15px'
              }}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              className="btn border-0 p-0 ms-2"
              style={{ color: '#6654e8' }}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword ? 'Hide password' : 'Show password'
              }
            >
              <i
                className={`bi ${
                  showPassword
                    ? 'bi-eye-slash-fill'
                    : 'bi-eye-fill'
                }`}
              ></i>
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />

            <label
              className="form-check-label small"
              htmlFor="rememberMe"
            >
              Remember Me
            </label>
          </div>

          <span className="small text-primary">
            <i className="bi bi-shield-lock me-1"></i>
            Secure Login
          </span>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="btn w-100 text-white py-3 rounded-3 fw-bold"
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #6654e8, #8d70ff)',
            border: 'none',
            boxShadow: '0 6px 15px rgba(102,84,232,0.25)'
          }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Signing In...
            </>
          ) : (
            <>
              Login
              <i className="bi bi-arrow-right ms-2"></i>
            </>
          )}
        </button>
      </form>

      {/* Create Account */}
      <div className="text-center mt-4">
        <span className="text-muted small">
          Don't have an account?
        </span>

        <button
          type="button"
          className="btn btn-link fw-bold text-decoration-none"
          style={{ color: '#6654e8' }}
          onClick={onRegister}
        >
          Create Account
        </button>
      </div>
    </AuthLayout>
  );
}

export default Login;
