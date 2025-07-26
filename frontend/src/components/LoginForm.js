import React, { useState } from 'react';
import axios from 'axios';
import { FaUser, FaLock } from 'react-icons/fa';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import API_URL from '../apiConfig'; // Adjust path if needed

function LoginForm({ onLoginSuccess }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);  // 👁️ Show/hide toggle

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/login/`, formData);
      onLoginSuccess(response.data);
    } catch (err) {
      console.error('Login failed:', err.response);
      setError('Login failed. Please check your username and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>Welcome Back</h2>

      {/* Username */}
      <div style={styles.inputContainer}>
        <FaUser style={styles.icon} />
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
          required
          style={styles.input}
        />
      </div>

      {/* Password */}
      <div style={{ ...styles.inputContainer, position: 'relative' }}>
        <FaLock style={styles.icon} />
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
          style={styles.input}
        />
        <div
          onClick={() => setShowPassword(prev => !prev)}
          style={styles.eyeIcon}
          title={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
        </div>
      </div>

      {/* Error message */}
      {error && <p style={styles.errorMessage}>{error}</p>}

      {/* Submit */}
      <button type="submit" style={styles.button} disabled={loading}>
        {loading ? 'Logging In…' : 'Login'}
      </button>
    </form>
  );
}

// Styles
const styles = {
  form: {
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    backgroundColor: '#FFFDF6',
    display: 'flex',
    flexDirection: 'column',
    width: '380px',
  },
  title: {
    fontFamily: 'var(--font-heading)',
    color: '#333',
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '28px',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: '20px',
  },
  icon: {
    position: 'absolute',
    top: '15px',
    left: '15px',
    color: '#aaa',
  },
  input: {
    width: '100%',
    padding: '12px 12px 12px 45px',
    boxSizing: 'border-box',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontFamily: 'var(--font-body)',
    fontSize: '16px',
  },
  eyeIcon: {
    position: 'absolute',
    right: '15px',
    top: '12px',
    fontSize: '1.25rem',
    color: '#999',
    cursor: 'pointer',
  },
  button: {
    padding: '15px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#A0C878',
    color: 'white',
    fontFamily: 'var(--font-heading)',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
  errorMessage: {
    color: '#D32F2F',
    backgroundColor: 'rgba(211, 47, 47, 0.08)',
    padding: '10px',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '14px',
    marginBottom: '20px',
  },
};

export default LoginForm;
