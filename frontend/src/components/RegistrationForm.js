// In frontend/src/components/RegistrationForm.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Import icons for a better UI
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import API_URL from '../apiConfig';

// --- Password Strength Meter Component ---
const PasswordStrengthMeter = ({ password }) => {
    const [strength, setStrength] = useState({ score: 0, label: '', color: '', suggestions: [] });

    useEffect(() => {
        let score = 0;
        let suggestions = [];

        if (!password) {
            setStrength({ score: 0, label: '', color: '', suggestions: [] });
            return;
        }

        if (password.length >= 8) score++; else suggestions.push("8+ characters");
        if (/[A-Z]/.test(password)) score++; else suggestions.push("uppercase letter");
        if (/[a-z]/.test(password)) score++; else suggestions.push("lowercase letter");
        if (/[0-9]/.test(password)) score++; else suggestions.push("number");
        if (/[^A-Za-z0-9]/.test(password)) score++; else suggestions.push("special character");

        let label = 'Weak';
        let color = '#ef4444'; // Red

        if (score >= 5) {
            label = 'Very Strong';
            color = '#22c55e'; // Green
        } else if (score >= 4) {
            label = 'Strong';
            color = '#84cc16'; // Lime
        } else if (score >= 3) {
            label = 'Medium';
            color = '#f59e0b'; // Amber
        }
        
        setStrength({ score, label, color, suggestions });

    }, [password]);

    if (!password) return null;

    return (
        <div style={styles.strengthContainer}>
            <div style={styles.strengthBarBackground}>
                <div style={{...styles.strengthBar, width: `${strength.score * 20}%`, backgroundColor: strength.color }}></div>
            </div>
            <div style={styles.strengthText}>
                <span>Strength: <strong>{strength.label}</strong></span>
                {strength.score < 5 && strength.suggestions.length > 0 &&
                    <span style={{fontSize: '0.75rem', color: '#6b7280'}}>
                        Add: {strength.suggestions.join(', ')}
                    </span>
                }
            </div>
        </div>
    );
};


function RegistrationForm() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '', // New field for confirmation
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // 1. Check if passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match. Please try again.');
            return;
        }

        setLoading(true);

        // Exclude confirmPassword from the data sent to the backend
        const { confirmPassword, ...dataToSend } = formData;

        try {
            const response = await axios.post(`${API_URL}/api/register/`, dataToSend);
            setSuccess('Registration successful! You can now log in.');
            setFormData({ username: '', email: '', password: '', confirmPassword: '' }); // Clear form
        } catch (err) {
            console.error('Registration failed:', err.response);
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                const errorMessage = Object.keys(errorData).map(key =>
                    `${key}: ${errorData[key].join(', ')}`
                ).join('; ');
                setError(errorMessage);
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2 style={styles.title}>Create Your Account</h2>

                <div style={styles.inputContainer}>
                    <FaUser style={styles.icon} />
                    <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Username" required style={styles.input} />
                </div>

                <div style={styles.inputContainer}>
                    <FaEnvelope style={styles.icon} />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" required style={styles.input} />
                </div>

                <div style={styles.inputContainer}>
                    <FaLock style={styles.icon} />
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required style={styles.input} />
                </div>
                
                {/* Password Strength Meter */}
                <PasswordStrengthMeter password={formData.password} />

                {/* Confirm Password Field */}
                <div style={styles.inputContainer}>
                    <FaLock style={styles.icon} />
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" required style={styles.input} />
                </div>

                {error && <p style={styles.errorMessage}>{error}</p>}
                {success && <p style={styles.successMessage}>{success}</p>}

                <button type="submit" style={styles.button} disabled={loading}>
                    {loading ? 'Registering...' : 'Create Account'}
                </button>
            </form>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'var(--font-body)',
        backgroundColor: '#FAF6E9',
    },
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
        transition: 'border-color 0.3s',
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
        transition: 'background-color 0.3s',
        marginTop: '10px',
    },
    errorMessage: {
        color: '#D32F2F',
        backgroundColor: 'rgba(211, 47, 47, 0.1)',
        padding: '10px',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '14px',
        marginBottom: '20px',
    },
    successMessage: {
        color: '#388E3C',
        backgroundColor: 'rgba(56, 142, 60, 0.1)',
        padding: '10px',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '14px',
        marginBottom: '20px',
    },
    // Styles for Password Strength Meter
    strengthContainer: { marginTop: '-15px', marginBottom: '20px' },
    strengthBarBackground: { height: '8px', width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px' },
    strengthBar: { height: '100%', borderRadius: '4px', transition: 'width 0.3s ease-in-out, background-color 0.3s ease-in-out' },
    strengthText: { display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.8rem', color: '#4b5563' },
};

export default RegistrationForm;
