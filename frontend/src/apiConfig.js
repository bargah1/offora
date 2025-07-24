// In frontend/src/apiConfig.js

// This line automatically chooses the correct URL.
// On Render, it will use your REACT_APP_API_URL environment variable.
// On your local computer, it will use http://127.0.0.1:8000.
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

export default API_URL;
