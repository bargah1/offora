import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Import Pages and Components
import HomePage from './pages/HomePage';
import VendorDashboard from './pages/VendorDashboard';
import AuthPage from './pages/AuthPage';
import VendorRegistrationForm from './components/VendorRegistrationForm';
import OfferDetailsPage from './pages/OfferDetailsPage';
import ShopDetailsPage from './pages/ShopDetailsPage'; // <-- Import the new page

// --- Main App Router ---
function AppRoutes() {
    const { user } = useContext(AuthContext);
    const pageContainerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#FAF6E9' };
    
    const MainRedirect = () => {
        if (!user) return <Navigate to="/auth" />;
        return user.is_vendor ? <Navigate to="/vendor/dashboard" /> : <Navigate to="/home" />;
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainRedirect />} />
                <Route path="/home" element={user && !user.is_vendor ? <HomePage /> : <Navigate to={user ? "/vendor/dashboard" : "/auth"} />} />
                <Route path="/vendor/dashboard" element={user && user.is_vendor ? <VendorDashboard /> : <Navigate to={user ? "/home" : "/auth"} />} />
                <Route path="/offer/:id" element={user ? <OfferDetailsPage /> : <Navigate to="/auth" />} />
                
                {/* --- ADD THIS NEW ROUTE --- */}
                <Route path="/shop/:id" element={user ? <ShopDetailsPage /> : <Navigate to="/auth" />} />

                <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
                <Route path="/vendor-signup" element={!user ? (<div style={pageContainerStyle}><VendorRegistrationForm /></div>) : (<Navigate to="/" />)} />
            </Routes>
        </Router>
    );
}

// --- Top-level App Component ---
function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;
