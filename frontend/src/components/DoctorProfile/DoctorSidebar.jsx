import React from 'react';
import { FaCalendarAlt, FaFlask, FaClipboardList, FaHospital, FaCapsules, FaPills, FaUserInjured, FaUserMd, FaUserFriends, FaBlog, FaHeartbeat, FaCommentDots } from 'react-icons/fa';
import '../Admin/AdminDashboard.scss';

const DoctorSidebar = ({ activeTab, setActiveTab, isOpen }) => {
    const menuItems = [
        { id: 'doctor_info', label: 'Thông tin bác sĩ', icon: <FaUserMd /> },
        { id: 'appointments', label: 'Lịch hẹn', icon: <FaClipboardList /> },
        { id: 'schedule', label: 'Thời gian biểu', icon: <FaCalendarAlt /> },
        { id: 'patients', label: 'Danh sách bệnh nhân', icon: <FaUserFriends /> },
        { id: 'tests', label: 'Xét nghiệm', icon: <FaFlask /> },
        { id: 'consultation', label: 'Tư vấn', icon: <FaCommentDots /> },
        { id: 'blog', label: 'Blog', icon: <FaBlog /> },
    ];

    return (
        <aside className={`sidebar ${isOpen ? '' : 'closed'}`}>
            <nav className="sidebar-nav">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

export default DoctorSidebar;
