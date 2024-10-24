import React from 'react';
import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminLogin from './features/admin/AdminLogin';

const App = () => {
    useEffect(() => {
        // Set the document title based on the current path
        switch (location.pathname) {
            case '/admin/login':
                document.title = "Login as Admin";
                break;
            case '/governor/Login':
                document.title = "Login as Governor";
                break;
            default:
                document.title = "SBO Fee Collection System"; 
        }
    }, [location]);

    return (
        <Router>
            <Routes>
                {/* Route for the admin login page */}
                <Route path="/admin/login" element={<AdminLogin />} />
                {/* Fallback route */}
                <Route path="/" element={<div>SBO FEE COLLECTION SYSTEM</div>} />
                <Route path="/governor/dashboard" element={<div>WELCOME BACK GOVERNOR</div>} />
            </Routes>
        </Router>
    );
};

export default App;