// In frontend/src/components/VendorRegistrationForm.js

import React, { useState } from 'react';
import axios from 'axios';
// Import all necessary icons
import { FaUser, FaEnvelope, FaLock, FaStore, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import API_URL from '../apiConfig';
function VendorRegistrationForm() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        store: {
            name: '',
            category: 'FOOD', // Default category
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
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await axios.post(`${API_URL}/api/vendor/register/`, formData);
            setSuccess('Registration successful! Your store is pending admin approval. You can now log in.');
        } catch (err) {
            const errorData = err.response.data;
            const errorMessage = Object.keys(errorData).map(key =>
                `${key}: ${typeof errorData[key] === 'object' ? JSON.stringify(errorData[key]) : errorData[key]}`
            ).join('; ');
            setError(errorMessage || 'Registration failed. Please check your details.');
            console.error(err.response.data);
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
                <div style={styles.inputContainer}><FaLock style={styles.icon} /><input type="password" name="password" onChange={handleChange} placeholder="Password" required style={styles.input} /></div>

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

// Using the same professional styles from our other forms
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
};


export default VendorRegistrationForm;