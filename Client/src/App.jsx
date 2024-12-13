import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// IMPORT BOOTSTRAP AND FONT AWESOME
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';

// IMPORT CSS

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
import OfficerArchivedStud from './pages/officer/OfficerArchivedStud';
import OfficerAddStud from './pages/officer/OfficerAddStud';
import OfficerEditStud from './pages/officer/OfficerEditStud';
import OfficerReports from './pages/officer/OfficerReports';
import OfficerProfile from './pages/officer/OfficerProfile';
import OfficerFileUpload from './pages/officer/OfficerFileUpload';

import TreasurerDashboard from './pages/treasurer/TreasurerDashboard';
import TreasurerFee from './pages/treasurer/TreasurerFee';
import TreasurerFeeAmount from './pages/treasurer/TreasurerFeeAmount';
import TreasurerFeeCategory from './pages/treasurer/TreasurerFeeCategory';
import TreasurerAddCategory from './pages/treasurer/TreasurerAddCategory';
import TreasurerEditCategory from './pages/treasurer/TreasurerEditCategory';
import TreasurerStudents from './pages/treasurer/TreasurerStudents';
import TreasurerArchivedStud from './pages/treasurer/TreasurerArchivedStud';
import TreasurerAddStud from './pages/treasurer/TreasurerAddStud';
import TreasurerEditStud from './pages/treasurer/TreasurerEditStud';
import TreasurerReports from './pages/treasurer/TreasurerReports';
import TreasurerDues from './pages/treasurer/TreasurerDues';
import TreasurerProfile from './pages/treasurer/TreasurerProfile';
import TreasurerFileUpload from './pages/treasurer/TreasurerFileUpload';

import GovDashboard from './pages/governor/GovDashboard';
import GovStudents from './pages/governor/GovStudents';
import GovAddStud from './pages/governor/GovAddStud';
import GovEditStud from './pages/governor/GovEditStud';
import GovOfficers from './pages/governor/GovOfficers';
import GovAddOfficer from './pages/governor/GovAddOfficer';
import GovEditOfficer from './pages/governor/GovEditOfficer';
import GovProfile from './pages/governor/GovProfile';
import GovFileUpload from './pages/governor/GovFileUpload';

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
import HistoryLogs from './pages/admin/HistoryLogs';
import AdminFileUpload from './pages/admin/AdminFileUpload';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { PaymentProvider } from './context/PaymentContext';
import ManageControls from './pages/admin/ManageControls';
import Unauthorized from './components/Unauthorized';
import PermissionWrapper from './components/PermissionWrapper';

// FOR CUSTOMIZED DOCUMENT TITLE
const App = () => {
    return (
        <Router>
            <AuthProvider>
                <PaymentProvider>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/sbo-fee-collection" element={<LandingPage />} />
                        <Route path="/sbo-fee-collection/login" element={<Login />} />

                        {/* Protected Routes */}
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
                                    <Route path="history-logs" element={<HistoryLogs />} />
                                    <Route path="manage-controls" element={<ManageControls />} />
                                    <Route path="file-upload" element={<AdminFileUpload />} />
                                </Routes>
                            </ProtectedRoute>
                        } />

                        {/* Treasurer Routes */}
                        <Route path="/treasurer/*" element={
                            <ProtectedRoute allowedRoles={['treasurer']}>
                                <Routes>
                                    <Route path="dashboard" element={<TreasurerDashboard />} />
                                    <Route path="manage-fee" element={<TreasurerFee />} />
                                    <Route path="manage-fee/amount/:id" element={<TreasurerFeeAmount />} />
                                    <Route path="manage-fee/payment-category" element={<TreasurerFeeCategory />} />
                                    <Route path="manage-fee/payment-category/add-new" element={<PermissionWrapper requiredPermission="addStudent" permissionLevel="edit">
                                        <TreasurerAddCategory />
                                    </PermissionWrapper>} />
                                    <Route path="manage-fee/payment-category/edit/:id" element={<TreasurerEditCategory />} />
                                    <Route path="students" element={<TreasurerStudents />} />
                                    <Route path="students/archived" element={<TreasurerArchivedStud />} />
                                    <Route path="students/add-new" element={<PermissionWrapper requiredPermission="addStudent" permissionLevel="edit">
                                        <TreasurerAddStud />
                                    </PermissionWrapper>} />
                                    <Route path="students/edit/:id" element={<TreasurerEditStud />} />
                                    <Route path="reports" element={<TreasurerReports />} />
                                    <Route path="daily-dues" element={<TreasurerDues />} />
                                    <Route path="profile" element={<TreasurerProfile />} />
                                    <Route path="file-upload" element={<TreasurerFileUpload />} />
                                </Routes>
                            </ProtectedRoute>
                        } />

                        {/* Officer Routes */}
                        <Route path="/officer/*" element={
                            <ProtectedRoute allowedRoles={['officer']}>
                                <Routes>
                                    <Route path="dashboard" element={<OfficerDashboard />} />
                                    <Route path="review-fee" element={<OfficerFee />} />
                                    <Route path="students" element={<OfficerStudents />} />
                                    <Route path="students/archived" element={<OfficerArchivedStud />} />
                                    <Route path="students/add-new" element={<OfficerAddStud />} />
                                    <Route path="students/edit/:id" element={<OfficerEditStud />} />
                                    <Route path="reports" element={<OfficerReports />} />
                                    <Route path="profile" element={<OfficerProfile />} />
                                    <Route path="file-upload" element={<OfficerFileUpload />} />
                                </Routes>
                            </ProtectedRoute>
                        } />

                        {/* Governor Routes */}
                        <Route path="/governor/*" element={
                            <ProtectedRoute allowedRoles={['governor']}>
                                <Routes>
                                    <Route path="dashboard" element={<GovDashboard />} />
                                    <Route path="students" element={<GovStudents />} />
                                    <Route path="students/add-new" element={<GovAddStud />} />
                                    <Route path="students/edit/:id" element={<GovEditStud />} />
                                    <Route path="officers" element={<GovOfficers />} />
                                    <Route path="officers/add-new" element={<GovAddOfficer />} />
                                    <Route path="officers/edit/:id" element={<GovEditOfficer />} />
                                    <Route path="profile" element={<GovProfile />} />
                                    <Route path="file-upload" element={<GovFileUpload />} />
                                </Routes>
                            </ProtectedRoute>
                        } />

                        <Route path="/unauthorized" element={<Unauthorized />} />

                        <Route path="*" element={<Navigate to="/sbo-fee-collection" replace />} />
                    </Routes>
                </PaymentProvider>
            </AuthProvider>
        </Router>
    );
};

export default App;