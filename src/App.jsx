import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';

// IMPORT BOOTSTRAP
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 
import 'bootstrap/dist/css/bootstrap.min.css';

// IMPORT SYSTEM CSS
import './assets/css/nav-sidebar.css';
import './assets/css/button.css';
import './assets/css/dashboard.css';


// IMPORT PAGES
import LandingPage from './pages/LandingPage';

import AdminLogin from './pages/admin/AdminLogin';
import GovernorLogin from './pages/governor/GovernorLogin';
import OfficerLogin from './pages/officer/OfficerLogin';

import TreasurerLogin from './pages/treasurer/TreasurerLogin';
import TreasurerDashboard from './pages/treasurer/TreasurerDashboard';
import TreasurerFee from './pages/treasurer/TreasurerFee';
import TreasurerStudents from './pages/treasurer/TreasurerStudents';
import TreasurerReports from './pages/treasurer/TreasurerReports';
import TreasurerDues from './pages/treasurer/TreasurerDues';
import TreasurerProfile from './pages/treasurer/TreasurerProfile';

// FOR CUSTOMIZED DOCUMENT TITLE
const App = () => {
    useEffect(() => {
        switch (location.pathname) {
            // ADMIN    
            case '/admin/login':
                document.title = "Login as Admin";
                break;
            
            // GOVERNOR
            case '/governor/login':
                document.title = "Login as Governor";
                break;
            
            // OFFICER
            case '/officer/login':
                document.title = "Login as Officer";
                break;
            
            // TREASURER
            case '/treasurer/login':
                document.title = "Login as Treasurer";
                break;

            case '/treasurer/dashboard':
                document.title = "Treasurer | Dashboard";
                break;
            
            case '/treasurer/manage-fee':
                document.title = "Treasurer | Manage Fee";
            break;

            case '/treasurer/students':
                document.title = "Treasurer | Students";
            break;

            case '/treasurer/reports':
                document.title = "Treasurer | Reports";
            break;

            case '/treasurer/daily-dues':
                document.title = "Treasurer | Daily Dues";
            break;

            case '/treasurer/profile':
                document.title = "Treasurer | Profile";
            break;
            
            default:
                document.title = "SBO Fee Collection Management System"; 
        }
    }, [location]);

    return (
        <Router>
            <Routes>

                {/* LANDING PAGE */}
                <Route path="/sbofeecollection" element={<LandingPage />} />

                {/* ADMIN ROUTES */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* GOVERNOR ROUTES */}
                <Route path="/governor/login" element={<GovernorLogin />} />

                {/* OFFICER ROUTES */}
                <Route path="/officer/login" element={<OfficerLogin />} />


                {/* TREASURER ROUTES*/}
                <Route path="/treasurer/login" element={<TreasurerLogin />} />
                <Route path="/treasurer/dashboard" element={<TreasurerDashboard />} />
                <Route path="/treasurer/manage-fee" element={<TreasurerFee />} />
                <Route path="/treasurer/students" element={<TreasurerStudents/>} />
                <Route path="/treasurer/reports" element={<TreasurerReports/>} />
                <Route path="/treasurer/daily-dues" element={<TreasurerDues/>} />
                <Route path="/treasurer/profile" element={<TreasurerProfile/>} />
                

                <Route path="*" element={<div>404 Page Not Found 'o'</div>} />

            </Routes>
        </Router>
    );
};

export default App;