import React from 'react';
import { FaHome, FaUserMd, FaCalendarAlt, FaCog, FaUser, FaFlask, FaCapsules, FaPills, FaStar } from 'react-icons/fa';
import './AdminDashboard.scss';

const SidebarMenu = ({ activeTab, setActiveTab, isOpen }) => {
    const menuItems = [
        { id: 'overview', label: 'Tổng quan', icon: <FaHome /> },
        { id: 'doctors', label: 'Quản lý bác sĩ', icon: <FaUserMd /> },
        { id: 'doctor-schedule', label: 'Lịch làm việc bác sĩ', icon: <FaCalendarAlt /> },
        { id: 'doctor-schedule-requests', label: 'Duyệt đơn xin nghỉ', icon: <FaCalendarAlt /> },
        { id: 'patients', label: 'Quản lý người dùng', icon: <FaUser /> },
        { id: 'feedbacks', label: 'Quản lý đánh giá', icon: <FaStar /> },
        { id: 'test-types', label: 'Loại xét nghiệm', icon: <FaFlask /> },
        // { id: 'arv-protocol', label: 'Quản lý phác đồ ARV', icon: <FaCapsules /> },
        { id: 'drug-management', label: 'Quản lý thuốc', icon: <FaPills /> },
        // { id: 'appointments', label: 'Lịch hẹn', icon: <FaCalendarAlt /> },
        { id: 'settings', label: 'Cài đặt', icon: <FaCog /> }
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

export default SidebarMenu;
