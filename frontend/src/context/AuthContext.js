// In frontend/src/context/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import API_URL from '../apiConfig'; // Import the new config file

export const AuthContext = createContext();

// Create a reusable axios instance
const axiosInstance = axios.create({
    baseURL: API_URL,
});

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() =>
        localStorage.getItem('authTokens')
            ? JSON.parse(localStorage.getItem('authTokens'))
            : null
    );

    const [user, setUser] = useState(() =>
        localStorage.getItem('authTokens')
            ? jwtDecode(JSON.parse(localStorage.getItem('authTokens')).access)
            : null
    );

    const loginUser = (tokens) => {
        setAuthTokens(tokens);
        setUser(jwtDecode(tokens.access));
        localStorage.setItem('authTokens', JSON.stringify(tokens));
    };

    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
    };

    useEffect(() => {
        const requestInterceptor = axiosInstance.interceptors.request.use(
            (config) => {
                if (authTokens) {
                    config.headers['Authorization'] = `Bearer ${authTokens.access}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        const responseInterceptor = axiosInstance.interceptors.response.use(
            (response) => {
                return response;
            },
            async (error) => {
                const originalRequest = error.config;
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        const response = await axios.post(`${API_URL}/api/token/refresh/`, {
                            refresh: authTokens.refresh,
                        });
                        const newTokens = response.data;
                        loginUser(newTokens);
                        originalRequest.headers['Authorization'] = `Bearer ${newTokens.access}`;
                        return axiosInstance(originalRequest);
                    } catch (refreshError) {
                        logoutUser();
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosInstance.interceptors.request.eject(requestInterceptor);
            axiosInstance.interceptors.response.eject(responseInterceptor);
        };
    }, [authTokens]);

    const contextData = {
        user: user,
        authTokens: authTokens,
        loginUser: loginUser,
        logoutUser: logoutUser,
        axiosInstance: axiosInstance, // Provide the instance to the rest of the app
    };

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};
