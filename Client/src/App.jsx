import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// IMPORT BOOTSTRAP AND FONT AWESOME
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';

// IMPORT CSS
import './App.css';
import './assets/css/nav-sidebar.css';
import './assets/css/button.css';
import './assets/css/table.css';
import './assets/css/dashboard.css';

// IMPORT PAGES
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';

import OfficerDashboard from './pages/officer/OfficerDashboard';
import OfficerFee from './pages/officer/OfficerFee';
import OfficerStudents from './pages/officer/OfficerStudents';
import OfficerAddStud from './pages/officer/OfficerAddStud';
import OfficerEditStud from './pages/officer/OfficerEditStud';
import OfficerEvents from './pages/officer/OfficerEvents';
import OfficerAddEvent from './pages/officer/OfficerAddEvent';
import OfficerEditEvent from './pages/officer/OfficerEditEvent';
import OfficerReports from './pages/officer/OfficerReports';
import OfficerProfile from './pages/officer/OfficerProfile';

import TreasurerDashboard from './pages/treasurer/TreasurerDashboard';
import TreasurerFee from './pages/treasurer/TreasurerFee';
import TreasurerFeeAmount from './pages/treasurer/TreasurerFeeAmount';
import TreasurerFeeCategory from './pages/treasurer/TreasurerFeeCategory';
import TreasurerAddCategory from './pages/treasurer/TreasurerAddCategory';
import TreasurerEditCategory from './pages/treasurer/TreasurerEditCategory';
import TreasurerStudents from './pages/treasurer/TreasurerStudents';
import TreasurerAddStud from './pages/treasurer/TreasurerAddStud';
import TreasurerEditStud from './pages/treasurer/TreasurerEditStud';
import TreasurerReports from './pages/treasurer/TreasurerReports';
import TreasurerDues from './pages/treasurer/TreasurerDues';
import TreasurerProfile from './pages/treasurer/TreasurerProfile';

import GovDashboard from './pages/governor/GovDashboard';
import GovStudents from './pages/governor/GovStudents';
import GovAddStud from './pages/governor/GovAddStud';
import GovEditStud from './pages/governor/GovEditStud';
import GovOfficers from './pages/governor/GovOfficers';
import GovAddOfficer from './pages/governor/GovAddOfficer';
import GovEditOfficer from './pages/governor/GovEditOfficer';
import GovProfile from './pages/governor/GovProfile';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminAddStud from './pages/admin/AdminAddStud';
import AdminEditStud from './pages/admin/AdminEditStud';
import AdminOfficers from './pages/admin/AdminOfficers';
import AdminAddOfficer from './pages/admin/AdminAddOfficer';
import AdminEditOfficer from './pages/admin/AdminEditOfficer';
import AdminAdmins from './pages/admin/AdminAdmins';
import AdminAddAdmin from './pages/admin/AdminAddAdmin';
import AdminEditAdmin from './pages/admin/AdminEditAdmin';
import AdminSchoolYear from './pages/admin/AdminSchoolYear';
import AdminProfile from './pages/admin/AdminProfile';

// FOR CUSTOMIZED DOCUMENT TITLE
const App = () => {
    return (
        <Router>
            <Routes>

                {/* LANDING PAGE */}
                <Route path="/sbo-fee-collection" element={<LandingPage />} />

                {/* LOGIN */}
                <Route path="/sbo-fee-collection/login" element={<Login />} />

                
                {/* OFFICER ROUTES */}
                <Route path="/officer/dashboard" element={<OfficerDashboard />} />
                <Route path="/officer/review-fee" element={<OfficerFee />} />
                <Route path="/officer/students" element={<OfficerStudents/>} />
                <Route path="/officer/students/add-new" element={<OfficerAddStud/>} />
                <Route path="/officer/students/edit/:id" element={<OfficerEditStud/>} />
                <Route path="/officer/events" element={<OfficerEvents/>} />
                <Route path="/officer/events/add-new" element={<OfficerAddEvent/>} />
                <Route path="/officer/events/edit/:id" element={<OfficerEditEvent/>} />s
                <Route path="/officer/reports" element={<OfficerReports/>} />
                <Route path="/officer/profile" element={<OfficerProfile/>} />

                {/* TREASURER ROUTES*/}
                <Route path="/treasurer/dashboard" element={<TreasurerDashboard />} />
                <Route path="/treasurer/manage-fee" element={<TreasurerFee />} />
                <Route path="/treasurer/manage-fee/amount/:id" element={<TreasurerFeeAmount />} />
                <Route path="/treasurer/manage-fee/payment-category" element={<TreasurerFeeCategory />} />
                <Route path="/treasurer/manage-fee/payment-category/add-new" element={<TreasurerAddCategory />} />
                <Route path="/treasurer/manage-fee/payment-category/edit/:id" element={<TreasurerEditCategory />} />
                <Route path="/treasurer/students" element={<TreasurerStudents/>} />
                <Route path="/treasurer/students/add-new" element={<TreasurerAddStud/>} />
                <Route path="/treasurer/students/edit/:id" element={<TreasurerEditStud/>} />
                <Route path="/treasurer/reports" element={<TreasurerReports/>} />
                <Route path="/treasurer/daily-dues" element={<TreasurerDues/>} />
                <Route path="/treasurer/profile" element={<TreasurerProfile/>} />

                {/* GOVERNOR ROUTES */}
                <Route path="/governor/dashboard" element={<GovDashboard />} />
                <Route path="/governor/students" element={<GovStudents/>} />
                <Route path="/governor/students/add-new" element={<GovAddStud/>} />
                <Route path="/governor/students/edit/:id" element={<GovEditStud/>} />
                <Route path="/governor/officers" element={<GovOfficers/>} />
                <Route path="/governor/officers/add-new" element={<GovAddOfficer/>} />
                <Route path="/governor/officers/edit/:id" element={<GovEditOfficer/>} />
                <Route path="/governor/profile" element={<GovProfile/>} />

                {/* ADMIN ROUTES */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/students" element={<AdminStudents/>} />
                <Route path="/admin/students/add-new" element={<AdminAddStud/>} />
                <Route path="/admin/students/edit/:id" element={<AdminEditStud/>} />
                <Route path="/admin/officers" element={<AdminOfficers/>} />
                <Route path="/admin/officers/add-new" element={<AdminAddOfficer/>} />
                <Route path="/admin/officers/edit/:id" element={<AdminEditOfficer/>} />
                <Route path="/admin/admins" element={<AdminAdmins/>} />
                <Route path="/admin/admins/add-new" element={<AdminAddAdmin/>} />
                <Route path="/admin/admins/edit/:id" element={<AdminEditAdmin/>} />
                <Route path="/admin/school-year" element={<AdminSchoolYear/>} />
                <Route path="/admin/profile" element={<AdminProfile/>} />
                

                <Route path="*" element={<div>404 Page Not Found 'o'</div>} />

            </Routes>
        </Router>
    );
};

export default App;