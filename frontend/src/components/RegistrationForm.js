// In frontend/src/components/RegistrationForm.js

import React, { useState } from 'react';
import axios from 'axios';
// Import icons for a better UI
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import API_URL from '../apiConfig';
function RegistrationForm() {
    // State to hold the form input data
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    // New state variables for loading and feedback messages
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
        // 1. Reset states and start loading indicator
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post(`${API_URL}/api/register/`, formData);
            // 2. Handle success
            setSuccess('Registration successful! You can now log in.');
            console.log('Registration successful:', response.data);
            // Clear form on success
            setFormData({ username: '', email: '', password: '' });

        } catch (err) {
            // 3. Handle errors
            console.error('Registration failed:', err.response);
            if (err.response && err.response.data) {
                // Extract error message from Django backend
                // This could be for a username that already exists, an invalid email, etc.
                const errorData = err.response.data;
                const errorMessage = Object.keys(errorData).map(key =>
                    `${key}: ${errorData[key].join(', ')}`
                ).join('; ');
                setError(errorMessage);
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            // 4. Stop loading indicator regardless of outcome
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2 style={styles.title}>Create Your Account</h2>

                {/* --- Input for Username --- */}
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

                {/* --- Input for Email --- */}
                <div style={styles.inputContainer}>
                    <FaEnvelope style={styles.icon} />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email Address"
                        required
                        style={styles.input}
                    />
                </div>

                {/* --- Input for Password --- */}
                <div style={styles.inputContainer}>
                    <FaLock style={styles.icon} />
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        required
                        style={styles.input}
                    />
                </div>

                {/* --- Inline Feedback Messages --- */}
                {error && <p style={styles.errorMessage}>{error}</p>}
                {success && <p style={styles.successMessage}>{success}</p>}

                {/* --- Submit Button with Loading State --- */}
                <button type="submit" style={styles.button} disabled={loading}>
                    {loading ? 'Registering...' : 'Create Account'}
                </button>
            </form>
        </div>
    );
}


// --- A more "top-notch" styling object ---
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
        padding: '12px 12px 12px 45px', // Left padding for icon
        boxSizing: 'border-box', // Important for padding and width calculation
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
        color: '#D32F2F', // A standard error red
        backgroundColor: 'rgba(211, 47, 47, 0.1)',
        padding: '10px',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '14px',
        marginBottom: '20px',
    },
    successMessage: {
        color: '#388E3C', // A standard success green
        backgroundColor: 'rgba(56, 142, 60, 0.1)',
        padding: '10px',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '14px',
        marginBottom: '20px',
    },
};

export default RegistrationForm;