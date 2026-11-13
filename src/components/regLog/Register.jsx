
import React, { useState } from 'react';
import { supabase } from '../../supabase';
import AuthLayout from './AuthLayout';

function Register({ onRegister }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [referralCode, setReferralCode] = useState(() => {
    return (
      new URLSearchParams(window.location.search)
        .get('ref')
        ?.trim()
        .toUpperCase() || ''
    );
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 6) {
      setErrorMessage('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const cleanPhone = phone.trim();

      const { data: existing, error: checkError } = await supabase
        .from('users')
        .select('phone')
        .eq('phone', cleanPhone)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        setErrorMessage('Phone number already registered.');
        return;
      }

      const newUser = {
        phone: cleanPhone,
        password
      };

      if (referralCode.trim()) {
        newUser.referred_by_code = referralCode.trim().toUpperCase();
      }

      const { error: registerError } = await supabase
        .from('users')
        .insert([newUser]);

      if (registerError) throw registerError;

      alert('Registration successful! Please login.');

      setPhone('');
      setPassword('');
      setConfirmPassword('');
      setReferralCode('');

      onRegister();

    } catch (error) {
      console.error('Registration error:', error);

      if (error.message?.includes('Invalid invitation code')) {
        setErrorMessage('This invitation code is invalid.');
      } else {
        setErrorMessage(error.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = {
    height: '52px',
    border: '1px solid #dedaf8',
    background: '#fff'
  };

  const labelStyle = {
    width: '125px',
    minWidth: '125px',
    fontSize: '13px',
    color: '#55516b'
  };

  return (
    <AuthLayout
      activeTab="register"
      onLoginTab={onRegister}
      onRegisterTab={() => {}}
    >
      {/* Error Message */}
      {errorMessage && (
        <div className="alert alert-danger rounded-3 small py-2">
          <i className="bi bi-exclamation-circle me-2"></i>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleRegister}>

        {/* Phone Number */}
        <div className="d-flex align-items-center mb-3">
          <div
            className="d-flex align-items-center rounded-3 px-3 flex-grow-1"
            style={fieldStyle}
          >
            <i
              className="bi bi-telephone-fill me-3"
              style={{ color: '#6654e8', fontSize: '17px' }}
            />

            <input
              type="tel"
              className="form-control border-0 shadow-none p-0"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ background: 'transparent', fontSize: '14px' }}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="d-flex align-items-center mb-3">
          <div
            className="d-flex align-items-center rounded-3 px-3 flex-grow-1"
            style={fieldStyle}
          >
            <i
              className="bi bi-lock-fill me-3"
              style={{ color: '#6654e8', fontSize: '17px' }}
            />

            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control border-0 shadow-none p-0"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              style={{ background: 'transparent', fontSize: '14px' }}
              required
            />

            <button
              type="button"
              className="btn border-0 p-0 ms-2"
              onClick={() => setShowPassword(!showPassword)}
              style={{ color: '#6654e8' }}
            >
              <i className={`bi ${
                showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'
              }`} />
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="d-flex align-items-center mb-3">
          <div
            className="d-flex align-items-center rounded-3 px-3 flex-grow-1"
            style={fieldStyle}
          >
            <i
              className="bi bi-shield-lock-fill me-3"
              style={{ color: '#6654e8', fontSize: '17px' }}
            />

            <input
              type={showConfirmPassword ? 'text' : 'password'}
              className="form-control border-0 shadow-none p-0"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              style={{ background: 'transparent', fontSize: '14px' }}
              required
            />

            <button
              type="button"
              className="btn border-0 p-0 ms-2"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ color: '#6654e8' }}
            >
              <i className={`bi ${
                showConfirmPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'
              }`} />
            </button>
          </div>
        </div>

        {/* Invitation Code */}
        <div className="d-flex align-items-center mb-4">
          <div
            className="d-flex align-items-center rounded-3 px-3 flex-grow-1"
            style={fieldStyle}
          >
            <i
              className="bi bi-gift-fill me-3"
              style={{ color: '#6654e8', fontSize: '17px' }}
            />

            <input
              type="text"
              className="form-control border-0 shadow-none p-0"
              placeholder="Enter invitation code (Optional)"
              value={referralCode}
              onChange={(e) =>
                setReferralCode(e.target.value.toUpperCase())
              }
              style={{ background: 'transparent', fontSize: '14px' }}
            />
          </div>
        </div>

        {/* Register Button */}
        <button
          type="submit"
          className="btn w-100 text-white rounded-3 fw-bold py-3"
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #6654e8, #8d70ff)',
            border: 'none',
            boxShadow: '0 6px 15px rgba(102,84,232,0.20)'
          }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Creating Account...
            </>
          ) : (
            <>
              Create Account
              <i className="bi bi-arrow-right ms-2" />
            </>
          )}
        </button>
      </form>

      {/* Login Link */}
      <div className="text-center mt-4">
        <span className="text-muted small">
          Already have an account?
        </span>

        <button
          type="button"
          className="btn btn-link fw-bold text-decoration-none"
          style={{ color: '#6654e8' }}
          onClick={onRegister}
        >
          Login
        </button>
      </div>
    </AuthLayout>
  );
}

export default Register;
