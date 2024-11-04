import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

// IMPORT BOOTSTRAP
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 
import 'bootstrap/dist/css/bootstrap.min.css';

// IMPORT CSS
import './assets/css/nav-sidebar.css';
import './assets/css/button.css';
import './assets/css/table.css';
import './assets/css/dashboard.css';

// IMPORT COMPONENTS
import EventList from './components/EventList'; 
import CalendarView from './components/CalendarView';

// IMPORT PAGES
import LandingPage from './pages/LandingPage';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

import GovernorLogin from './pages/governor/GovernorLogin';

import OfficerLogin from './pages/officer/OfficerLogin';
import OfficerDashboard from './pages/officer/OfficerDashboard';
import OfficerFee from './pages/officer/OfficerFee';
import OfficerStudents from './pages/officer/OfficerStudents';
import OfficerAddStud from './pages/officer/OfficerAddStud';
import OfficerEditStud from './pages/officer/OfficerEditStud';
import OfficerReports from './pages/officer/OfficerReports';
import OfficerProfile from './pages/officer/OfficerProfile';


import TreasurerLogin from './pages/treasurer/TreasurerLogin';
import TreasurerDashboard from './pages/treasurer/TreasurerDashboard';
import TreasurerFee from './pages/treasurer/TreasurerFee';
import TreasurerFeeAmount from './pages/treasurer/TreasurerFeeAmount';
import TreasurerStudents from './pages/treasurer/TreasurerStudents';
import TreasurerAddStud from './pages/treasurer/TreasurerAddStud';
import TreasurerEditStud from './pages/treasurer/TreasurerEditStud';
import TreasurerReports from './pages/treasurer/TreasurerReports';
import TreasurerDues from './pages/treasurer/TreasurerDues';
import TreasurerProfile from './pages/treasurer/TreasurerProfile';

// FOR CUSTOMIZED DOCUMENT TITLE
const App = () => {
    return (
        <Router>
            <Routes>

                {/* LANDING PAGE */}
                <Route path="/sbo-fee-collection" element={<LandingPage />} />

                {/* ADMIN ROUTES */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />

                {/* GOVERNOR ROUTES */}
                <Route path="/governor/login" element={<GovernorLogin />} />

                {/* OFFICER ROUTES */}
                <Route path="/officer/login" element={<OfficerLogin />} />
                <Route path="/officer/dashboard" element={<OfficerDashboard />} />
                <Route path="/officer/review-fee" element={<OfficerFee />} />
                <Route path="/officer/students" element={<OfficerStudents/>} />
                <Route path="/officer/students/add-new" element={<OfficerAddStud/>} />
                <Route path="/officer/students/edit/:id" element={<OfficerEditStud/>} />
                <Route path="/officer/reports" element={<OfficerReports/>} />
                <Route path="/officer/profile" element={<OfficerProfile/>} />


                {/* TREASURER ROUTES*/}
                <Route path="/treasurer/login" element={<TreasurerLogin />} />
                <Route path="/treasurer/dashboard" element={<TreasurerDashboard />} />
                <Route path="/treasurer/manage-fee" element={<TreasurerFee />} />
                <Route path="/treasurer/manage-fee/amount/:id" element={<TreasurerFeeAmount />} />
                <Route path="/treasurer/students" element={<TreasurerStudents/>} />
                <Route path="/treasurer/students/add-new" element={<TreasurerAddStud/>} />
                <Route path="/treasurer/students/edit/:id" element={<TreasurerEditStud/>} />
                <Route path="/treasurer/reports" element={<TreasurerReports/>} />
                <Route path="/treasurer/daily-dues" element={<TreasurerDues/>} />
                <Route path="/treasurer/profile" element={<TreasurerProfile/>} />
                

                <Route path="*" element={<div>404 Page Not Found 'o'</div>} />

            </Routes>
        </Router>
    );
};

export default App;