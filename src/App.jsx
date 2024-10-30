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
    // useEffect(() => {
    //     switch (location.pathname) {
    //         // ADMIN    
    //         case '/admin/login':
    //             document.title = "Login as Admin";
    //             break;
        
    //         // GOVERNOR
    //         case '/governor/login':
    //             document.title = "Login as Governor";
    //             break;
            
    //         // OFFICER
    //         case '/officer/login':
    //             document.title = "Login as Officer";
    //             break;
    //         case '/officer/dashboard':
    //             document.title = "Officer | Dashboard";
    //             break;
    //         case '/officer/review-fee':
    //             document.title = "Officer | Review Fee";
    //             break;
    //         case '/officer/students':
    //             document.title = "Officer | Students";
    //         break;
    //         case '/officer/students/add-new':
    //             document.title = "Officer | Add Student";
    //         break;
    //         case '/officer/students/edit/:id':
    //             document.title = "Officer | Edit Student";
    //         break;
    //         case '/officer/reports':
    //             document.title = "Officer | Reports";
    //         break;
    //         case '/officer/profile':
    //             document.title = "Officer | Profile";
    //         break;
    //         // TREASURER
    //         case '/treasurer/login':
    //             document.title = "Login as Treasurer";
    //             break;
    //         case '/treasurer/dashboard':
    //             document.title = "Treasurer | Dashboard";
    //             break;
    //         case '/treasurer/manage-fee':
    //             document.title = "Treasurer | Manage Fee";
    //         break;
    //         case '/treasurer/manage-fee/amount/:id':
    //             document.title = "Treasurer | Pay in Amount";
    //         break;
    //         case '/treasurer/students':
    //             document.title = "Treasurer | Students";
    //         break;
    //         case '/treasurer/students/add-new':
    //             document.title = "Treasurer | Add Student";
    //         break;
    //         case '/treasurer/students/edit/:id':
    //             document.title = "Treasurer | Edit Student";
    //         break;
    //         case '/treasurer/reports':
    //             document.title = "Treasurer | Reports";
    //         break;
    //         case '/treasurer/daily-dues':
    //             document.title = "Treasurer | Daily Dues";
    //         break;
    //         case '/treasurer/profile':
    //             document.title = "Treasurer | Profile";
    //         break;
    //         default:
    //             document.title = "SBO Fee Collection Management System"; 
    //     }
    // }, [location]);

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