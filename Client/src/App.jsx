import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

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

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// FOR CUSTOMIZED DOCUMENT TITLE
const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/sbo-fee-collection" element={<LandingPage />} />
                    <Route path="/sbo-fee-collection/login" element={<Login />} />

                    {/* Admin Routes */}
                    <Route path="/admin/*" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Routes>
                                <Route path="dashboard" element={<AdminDashboard />} />
                                <Route path="students" element={<AdminStudents />} />
                                <Route path="students/add-new" element={<AdminAddStud />} />
                                <Route path="students/edit/:id" element={<AdminEditStud />} />
                                <Route path="officers" element={<AdminOfficers />} />
                                <Route path="officers/add-new" element={<AdminAddOfficer />} />
                                <Route path="officers/edit/:id" element={<AdminEditOfficer />} />
                                <Route path="admins" element={<AdminAdmins />} />
                                <Route path="admins/add-new" element={<AdminAddAdmin />} />
                                <Route path="admins/edit/:id" element={<AdminEditAdmin />} />
                                <Route path="school-year" element={<AdminSchoolYear />} />
                                <Route path="profile" element={<AdminProfile />} />
                            </Routes>
                        </ProtectedRoute>
                    } />

                    {/* Treasurer Routes */}
                    <Route path="/treasurer/*" element={
                        <ProtectedRoute allowedRoles={['Treasurer']}>
                            <Routes>
                                <Route path="dashboard" element={<TreasurerDashboard />} />
                                <Route path="manage-fee" element={<TreasurerFee />} />
                                <Route path="manage-fee/amount/:id" element={<TreasurerFeeAmount />} />
                                <Route path="manage-fee/payment-category" element={<TreasurerFeeCategory />} />
                                <Route path="manage-fee/payment-category/add-new" element={<TreasurerAddCategory />} />
                                <Route path="manage-fee/payment-category/edit/:id" element={<TreasurerEditCategory />} />
                                <Route path="students" element={<TreasurerStudents />} />
                                <Route path="students/add-new" element={<TreasurerAddStud />} />
                                <Route path="students/edit/:id" element={<TreasurerEditStud />} />
                                <Route path="reports" element={<TreasurerReports />} />
                                <Route path="daily-dues" element={<TreasurerDues />} />
                                <Route path="profile" element={<TreasurerProfile />} />
                            </Routes>
                        </ProtectedRoute>
                    } />

                    {/* Similar structure for officer and governor routes */}

                    <Route path="*" element={<Navigate to="/sbo-fee-collection" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;