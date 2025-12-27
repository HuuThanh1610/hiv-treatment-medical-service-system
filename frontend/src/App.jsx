/**
 * App.jsx - Entry point chính của ứng dụng React
 *
 * Chức năng:
 * - Cấu hình routing cho toàn bộ ứng dụng
 * - Layout chung: Header/Navbar + Content
 * - ThemeProvider cho dark/light mode
 * - Protected routes cho authentication
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Layout components
import Header from './components/Header/Header';
import Navbar from './components/Common/Navbar';

// Page components
import Homepage from './components/Homepage/Homepage';
import About from './components/About/About';

// Auth components
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import ForgotPassword from './components/Auth/ForgotPassword';

// Dashboard components
import AdminDashboard from './components/Admin/AdminDashboard';
import UserProfile from './components/UserProfile/UserProfile';
import DoctorProfile from './components/DoctorProfile/DoctorProfile';
import StaffDashboard from './components/Staff/StaffDashboard';

// Medical service components
import Services from './components/MedicalService/Services';
import AppointmentForm from './components/MedicalService/AppointmentForm';
import LabRequestForm from './components/MedicalService/LabRequestForm';
import Medication from './components/MedicalService/Medication';
import LabResults from './components/MedicalService/LabResults';
import DoctorList from './components/MedicalService/DoctorList';
import PatientTreatmentHistory from './components/MedicalService/PatientTreatmentHistory';

// Consultation components
import ConsultOnline from './components/ConsultOnline/ConsultOnline';
import OnlineConsultRoom from './components/MedicalService/OnlineConsultRoom';

// Utility components
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/Common/ScrollToTop';


// Additional components
import { ThemeProvider } from './context/ThemeContext';
import Contact from './components/Contact/Contact';
import DoctorScheduleTable from './components/DoctorProfile/DoctorScheduleTable';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Privacy from './components/Privacy/Privacy';
import Terms from './components/Privacy/terms';
import ConsultationChat from './components/DoctorProfile/ConsultationChat';
import GlobalNotificationProvider from './context/GlobalNotificationProvider';
import BlogCommunity from './components/UserProfile/BlogCommunity';
import BlogDetail from './components/UserProfile/BlogDetail';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <GlobalNotificationProvider>
          <ScrollToTop />
          <div className="app">
            {/* Render Navbar/Footer outside, hide on dashboard pages */}
            <Routes>
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/staff/dashboard" element={<ProtectedRoute allowedRoles={['STAFF']}><StaffDashboard /></ProtectedRoute>} />
              <Route path="/doctorprofile" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorProfile /></ProtectedRoute>} />
              {/* All other routes show Navbar/Footer */}
              <Route path="/*" element={<><Navbar /><Routes>
                <Route path="/" element={<main className="main-content"><Homepage /></main>} />
                <Route path="contact" element={<main className="main-content"><Contact /></main>} />
                <Route path="about" element={<main className="main-content"><About /></main>} />
                <Route path="login" element={<main className="main-content"><Login /></main>} />
                <Route path="signup" element={<main className="main-content"><Signup /></main>} />
                <Route path="forgot-password" element={<main className="main-content"><ForgotPassword /></main>} />
                <Route path="profile" element={<main className="main-content"><ProtectedRoute><UserProfile /></ProtectedRoute></main>} />
                <Route path="consult-online" element={<main className="main-content"><ProtectedRoute><ConsultationChat /></ProtectedRoute></main>} />
                <Route path="services" element={<main className="main-content"><Services /></main>} />
                <Route path="medication" element={<main className="main-content"><ProtectedRoute><Medication /></ProtectedRoute></main>} />
                <Route path="treatment-history" element={<main className="main-content"><ProtectedRoute allowedRoles={['PATIENT']}><PatientTreatmentHistory /></ProtectedRoute></main>} />
                <Route path="lab-results" element={<main className="main-content"><ProtectedRoute><LabResults /></ProtectedRoute></main>} />
                <Route path="services/DoctorList" element={<main className="main-content"><DoctorList /></main>} />
                <Route path="services/appointments" element={<main className="main-content"><AppointmentForm /></main>} />
                <Route path="lab-requests/create" element={<main className="main-content"><ProtectedRoute allowedRoles={['PATIENT']}><LabRequestForm /></ProtectedRoute></main>} />
                <Route path="blog" element={<main className="main-content"><BlogCommunity /></main>} />
                <Route path="blog/:id" element={<main className="main-content"><BlogDetail /></main>} />
                <Route path="privacy" element={<main className="main-content"><Privacy /></main>} />
                <Route path="terms" element={<main className="main-content"><Terms /></main>} />
                <Route path="consultation-online" element={<main className="main-content"><ConsultationChat /></main>} />
                <Route path="user/blog" element={<main className="main-content"><BlogCommunity /></main>} />
                <Route path="user/blog/:id" element={<main className="main-content"><BlogDetail /></main>} />
              </Routes></>} />
            </Routes>
            <ToastContainer />
          </div>
        </GlobalNotificationProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;