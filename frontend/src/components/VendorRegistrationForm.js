// In frontend/src/components/VendorRegistrationForm.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Import all necessary icons
import { FaUser, FaEnvelope, FaLock, FaStore, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import API_URL from '../apiConfig';

// --- Password Strength Meter Component ---
const PasswordStrengthMeter = ({ password }) => {
    const [strength, setStrength] = useState({ score: 0, label: '', color: '' });

    useEffect(() => {
        let score = 0;
        let suggestions = [];

        if (password.length >= 8) score++;
        else suggestions.push("8+ characters");

        if (/[A-Z]/.test(password)) score++;
        else suggestions.push("uppercase letter");

        if (/[a-z]/.test(password)) score++;
        else suggestions.push("lowercase letter");
        
        if (/[0-9]/.test(password)) score++;
        else suggestions.push("number");

        if (/[^A-Za-z0-9]/.test(password)) score++;
        else suggestions.push("special character");

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
                <span>Password Strength: <strong>{strength.label}</strong></span>
                {strength.score < 5 && 
                    <span style={{fontSize: '0.75rem', color: '#6b7280'}}>
                        Suggestions: {strength.suggestions.join(', ')}
                    </span>
                }
            </div>
        </div>
    );
};


function VendorRegistrationForm() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '', // New field
        store: {
            name: '',
            category: 'FOOD',
            address: '',
        },
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (['name', 'category', 'address'].includes(name)) {
            setFormData(prev => ({ ...prev, store: { ...prev.store, [name]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // --- Password validation ---
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        // Exclude confirmPassword from the data sent to the backend
        const { confirmPassword, ...dataToSend } = formData;

        try {
            await axios.post(`${API_URL}/api/vendor/register/`, dataToSend);
            setSuccess('Registration successful! You can now log in.');
        } catch (err) {
            const errorData = err.response?.data;
            const errorMessage = errorData ? Object.keys(errorData).map(key =>
                `${key}: ${Array.isArray(errorData[key]) ? errorData[key].join(', ') : errorData[key]}`
            ).join('; ') : 'Registration failed. Please check your details.';
            setError(errorMessage);
            console.error(err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.formContainer}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2 style={styles.title}>Register Your Store</h2>
                <p style={styles.subtitle}>Your store will be reviewed by an admin before it goes live.</p>

                {/* User Details */}
                <div style={styles.inputContainer}><FaUser style={styles.icon} /><input name="username" onChange={handleChange} placeholder="Your Username" required style={styles.input} /></div>
                <div style={styles.inputContainer}><FaEnvelope style={styles.icon} /><input type="email" name="email" onChange={handleChange} placeholder="Your Email" required style={styles.input} /></div>
                <div style={styles.inputContainer}><FaLock style={styles.icon} /><input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required style={styles.input} /></div>
                
                {/* Password Strength Meter */}
                <PasswordStrengthMeter password={formData.password} />

                {/* Confirm Password Field */}
                <div style={styles.inputContainer}><FaLock style={styles.icon} /><input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" required style={styles.input} /></div>

                <hr style={styles.hr} />

                {/* Store Details */}
                <div style={styles.inputContainer}><FaStore style={styles.icon} /><input name="name" value={formData.store.name} onChange={handleChange} placeholder="Store Name" required style={styles.input} /></div>
                <div style={styles.inputContainer}><FaMapMarkerAlt style={styles.icon} /><textarea name="address" value={formData.store.address} onChange={handleChange} placeholder="Store Address" required style={{...styles.input, ...styles.textarea}} /></div>
                <select name="category" onChange={handleChange} value={formData.store.category} style={styles.input}>
                    <option value="FOOD">Food & Dining</option>
                    <option value="GROCERY">Grocery</option>
                    <option value="FASHION">Fashion & Apparel</option>
                    <option value="SALON">Salon & Spa</option>
                    <option value="OTHER">Other</option>
                </select>

                {error && <p style={styles.errorMessage}>{error}</p>}
                {success && <p style={styles.successMessage}>{success}</p>}

                <button type="submit" style={styles.button} disabled={loading}>{loading ? 'Submitting...' : 'Register Store'}</button>
            </form>
             <p style={styles.toggleText}>
                Already a member? <Link to="/auth" style={styles.toggleLink}>Login Here</Link>
            </p>
        </div>
    );
}

const styles = {
    formContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    form: {
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        backgroundColor: '#FFFDF6',
        display: 'flex',
        flexDirection: 'column',
        width: '400px',
    },
    title: { fontFamily: 'var(--font-heading)', color: '#333', textAlign: 'center', marginBottom: '10px', fontSize: '28px' },
    subtitle: { fontFamily: 'var(--font-body)', textAlign: 'center', color: '#666', marginTop: '0', marginBottom: '25px'},
    hr: { border: 'none', borderTop: '1px solid #eee', margin: '25px 0' },
    inputContainer: { position: 'relative', marginBottom: '20px' },
    icon: { position: 'absolute', top: '15px', left: '15px', color: '#aaa' },
    input: {
        width: '100%',
        padding: '12px 12px 12px 45px',
        boxSizing: 'border-box',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontFamily: 'var(--font-body)',
        fontSize: '16px',
        backgroundColor: '#fff',
    },
    textarea: { height: '80px', paddingTop: '15px' },
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
    errorMessage: { color: '#D32F2F', backgroundColor: 'rgba(211, 47, 47, 0.1)', padding: '10px', borderRadius: '8px', textAlign: 'center', fontSize: '14px', margin: '10px 0' },
    successMessage: { color: '#388E3C', backgroundColor: 'rgba(56, 142, 60, 0.1)', padding: '10px', borderRadius: '8px', textAlign: 'center', fontSize: '14px', margin: '10px 0' },
    toggleText: { marginTop: '20px', fontFamily: 'var(--font-body)', color: '#555' },
    toggleLink: { color: '#A0C878', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'none' },
    // Styles for Password Strength Meter
    strengthContainer: { marginTop: '-10px', marginBottom: '20px' },
    strengthBarBackground: { height: '8px', width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px' },
    strengthBar: { height: '100%', borderRadius: '4px', transition: 'width 0.3s ease-in-out' },
    strengthText: { display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.8rem', color: '#4b5563' },
};


export default VendorRegistrationForm;
