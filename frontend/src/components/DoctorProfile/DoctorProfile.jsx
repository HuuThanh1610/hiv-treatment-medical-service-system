import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DoctorSidebar from './DoctorSidebar';
import ProfileContent from './ProfileContent';
import DoctorAppointmentTable from './DoctorAppointmentTable';
import DoctorLabRequestView from './DoctorLabRequestView';
import PatientList from './PatientList';
import ConsultationChat from './ConsultationChat';
import ARVProtocol from './ARVProtocol';
import DoctorScheduleTable from './DoctorScheduleTable';
import PatientListView from './PatientListView';
import DoctorBlog from './DoctorBlog';
import { getCurrentUser, updateUser, updatePassword } from '../../Services/UserService';
import LogoutButton from '../Auth/LogoutButton';
import './DoctorProfile.scss';


const DoctorProfile = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('appointments');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state && location.state.defaultTab === 'profile') {
            setActiveTab('profile');
        }
    }, [location.state]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const response = await getCurrentUser();
                setUser(response.data);
                setError(null);
            } catch (err) {
                setError('Không thể tải thông tin bác sĩ');
                console.error('Error fetching doctor:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleUpdateUser = async (updatedData) => {
        try {
            const response = await updateUser(user.id, updatedData);
            setUser(response.data);
            return true;
        } catch (err) {
            console.error('Error updating doctor:', err);
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

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'doctor_info':
                return <ProfileContent />;
            case 'profile':
                return (
                    <ProfileContent
                        userData={user}
                        onUpdateUser={handleUpdateUser}
                        onUpdatePassword={handleUpdatePassword}
                    />
                );
            case 'appointments':
                return <DoctorAppointmentTable />;
            case 'patients':
                return <PatientList />;
            case 'tests':
                return <DoctorLabRequestView />;
            case 'treatment':
                return <ARVProtocol />;
            case 'consultation':
                return <ConsultationChat active={activeTab === 'consultation'} />;
            case 'schedule':
                return <DoctorScheduleTable />;
            case 'lab_requests':
                return <DoctorLabRequestView />;
            case 'blog':
                return <DoctorBlog />;
            default:
                return <div className="placeholder-content">Chức năng đang được phát triển.</div>;
        }
    };


    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="header-left">
                    <button className="menu-toggle" onClick={toggleSidebar}>
                        <span className="menu-icon"></span>
                    </button>
                    <h1>Doctor Dashboard</h1>
                    <p>Xin chào, {user?.fullName || localStorage.getItem('fullName')}</p>
                </div>
                <div className="header-right">
                    <LogoutButton />
                </div>
            </header>
            <div className="dashboard-body">
                <DoctorSidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} />
                <main className={`main-content ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default DoctorProfile; 