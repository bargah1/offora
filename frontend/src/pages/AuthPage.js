// In frontend/src/pages/AuthPage.js

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import LoginForm from '../components/LoginForm';
import RegistrationForm from '../components/RegistrationForm';
import { Link } from 'react-router-dom';
function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const { loginUser } = useContext(AuthContext); // Get the login function from context

    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

    return (
        <div style={styles.container}>
            {isLogin ? <LoginForm onLoginSuccess={loginUser} /> : <RegistrationForm />}
            <p style={styles.toggleText}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <span onClick={toggleForm} style={styles.toggleLink}>
                    {isLogin ? ' Sign Up' : ' Login'}
                </span>
            </p>
                        <div style={{marginTop: '30px', textAlign: 'center'}}>
                <Link to="/vendor-signup">Are you a business owner? Register your store here.</Link>
            </div>

        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#FAF6E9',
    },
    toggleText: {
        marginTop: '20px',
        fontFamily: 'var(--font-body)',
        color: '#555',
    },
    toggleLink: {
        color: '#A0C878',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
};

export default AuthPage;