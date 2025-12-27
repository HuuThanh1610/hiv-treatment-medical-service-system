/**
 * UserProfile.jsx - Trang profile chính của bệnh nhân
 *
 * Chức năng:
 * - Dashboard với sidebar navigation
 * - Multiple tabs: profile, appointments, lab results, payments, etc.
 * - URL-based tab switching (?tab=appointments)
 * - Responsive layout
 * - Real-time notifications và reminders
 * - Medical services integration
 */
import React, { useState, useEffect, useRef, createContext } from 'react';
import { useNavigate } from 'react-router-dom';

// Layout components
import Sidebar from './Sidebar';                    // Left sidebar navigation
import ProfileContent from './ProfileContent';      // Profile info tab

// Services
import { getCurrentUser, updateUser, updatePassword } from '../../Services/UserService';

// Medical service components
import OnlineConsultRoom from '../MedicalService/OnlineConsultRoom';     // Consultation room
import PatientMedication from '../MedicalService/PatientMedication';     // Medication management
import PatientTreatmentPlans from '../MedicalService/PatientTreatmentPlans'; // Treatment plans
import PatientTreatmentHistory from '../MedicalService/PatientTreatmentHistory'; // Treatment history
import PatientMedicationReminders from '../MedicalService/PatientMedicationReminders'; // Medication reminders

// User profile tabs
import UserAppointmentTable from './UserAppointmentTable'; // Appointments table
import MyAppointments from './MyAppointments';             // Appointments management
import UserLabResultsTable from './UserLabResultsTable';   // Lab results table
import UserPaymentTable from './UserPaymentTable';         // Payment history
import UserNotifications from './UserNotifications';       // Notifications tab

// Communication components
import ConsultationChat from '../DoctorProfile/ConsultationChat'; // Chat with doctor
import BlogCommunity from './BlogCommunity';                      // Blog/community tab
import CheckInNotification from './CheckInNotification';
import PaymentSuccessModal from './PaymentSuccessModal';
import './UserProfile.scss';
import { useSearchParams } from 'react-router-dom';

export const UserProfileTabContext = createContext('profile');

const UserProfile = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const response = await getCurrentUser();
                setUser(response.data);
                setError(null);
            } catch (err) {
                setError('Không thể tải thông tin người dùng');
                console.error('Error fetching user:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const tabFromQuery = searchParams.get('tab');
        if (tabFromQuery) {
            setActiveTab(tabFromQuery);
        }
    }, [searchParams]);

    // Check for payment success parameters
    useEffect(() => {
        const paymentSuccess = searchParams.get('paymentSuccess');
        const paymentId = searchParams.get('paymentId');
        const amount = searchParams.get('amount');
        const transactionCode = searchParams.get('transactionCode');
        const method = searchParams.get('method');
        const status = searchParams.get('status');
        const appointmentId = searchParams.get('appointmentId');
        const error = searchParams.get('error');

        if (paymentSuccess === 'true' && paymentId) {
            // Show success modal
            setPaymentInfo({
                id: paymentId,
                amount: parseFloat(amount),
                transactionCode,
                method,
                status,
                appointmentId
            });
            setShowPaymentModal(true);
            
            // Clean URL parameters
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('paymentSuccess');
            newSearchParams.delete('paymentId');
            newSearchParams.delete('amount');
            newSearchParams.delete('transactionCode');
            newSearchParams.delete('method');
            newSearchParams.delete('status');
            newSearchParams.delete('appointmentId');
            setSearchParams(newSearchParams);
            
        } else if (paymentSuccess === 'false' && error) {
            // Show error message
            alert('Thanh toán thất bại: ' + error);
            
            // Clean URL parameters
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('paymentSuccess');
            newSearchParams.delete('error');
            setSearchParams(newSearchParams);
        }
    }, [searchParams, setSearchParams]);

    const handleUpdateUser = async (updatedData) => {
        try {
            const response = await updateUser(user.id, updatedData);
            setUser(response.data);
            return true;
        } catch (err) {
            console.error('Error updating user:', err);
            return false;
        }
    };

    const handleUpdatePassword = async (passwordData) => {
        try {
            await updatePassword(user.id, passwordData);
            return true;
        } catch (err) {
            console.error('Error updating password:', err);
            return false;
        }
    };

    const handleSidebarTab = (tab) => {
        setActiveTab(tab);
    };

    const handleClosePaymentModal = () => {
        setShowPaymentModal(false);
        setPaymentInfo(null);
    };

    // Use refs to access child methods
    const medicationRef = useRef();
    const appointmentRef = useRef();
    const medicationRemindersRef = useRef();

    // Only fetch data when tab is active
    useEffect(() => {
        if (activeTab === 'medication' && medicationRef.current) {
            medicationRef.current.fetchData && medicationRef.current.fetchData();
        }
        if (activeTab === 'appointments') {
            if (appointmentRef.current) {
                appointmentRef.current.fetchAppointments && appointmentRef.current.fetchAppointments();
            }
        }
        if (activeTab === 'notifications') {
            if (medicationRemindersRef.current) {
                medicationRemindersRef.current.fetchReminders && medicationRemindersRef.current.fetchReminders();
            }
        }
    }, [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileContent
                    activeTab={activeTab}
                    userData={user}
                    onUpdateUser={handleUpdateUser}
                    onUpdatePassword={handleUpdatePassword}
                />;
            case 'medication':
                return <PatientTreatmentPlans />;
            case 'treatment-history':
                return <PatientTreatmentHistory />;
            case 'consultation':
                // Chỉ render ConsultationChat khi tab thực sự active
                return <ConsultationChat active={true} />;
            case 'user-payments':
                return <UserPaymentTable />;
            case 'appointments':
                return <MyAppointments />;
            case 'lab-tests':
                return <UserLabResultsTable />;
            case 'reminders':
                return <UserReminders ref={remindersRef} />;
            case 'notifications':
                return (
                    <div className="reminders-section">
                        <PatientMedicationReminders ref={medicationRemindersRef} />
                    </div>
                );
            case 'blog':
                return <BlogCommunity />;
            default:
                return <div>Chức năng đang được phát triển.</div>;
        }
    };

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <UserProfileTabContext.Provider value={activeTab}>
            <div className="user-profile">
                <div className="user-profile__container">
                    <Sidebar activeTab={activeTab} setActiveTab={handleSidebarTab} />
                    <div className="user-profile__content">
                        <CheckInNotification />
                        {renderContent()}
                    </div>
                </div>
            </div>
            
            {/* Payment Success Modal */}
            <PaymentSuccessModal 
                isOpen={showPaymentModal}
                onClose={handleClosePaymentModal}
                paymentInfo={paymentInfo}
            />
        </UserProfileTabContext.Provider>
    );
};

export default UserProfile;
