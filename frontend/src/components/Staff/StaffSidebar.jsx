import React from 'react';
import { FaCalendarAlt, FaFlask, FaClipboardList, FaHospital, FaCapsules, FaPills, FaUserInjured, FaMoneyBillWave, FaPlusCircle } from 'react-icons/fa';
import '../Admin/AdminDashboard.scss';

const StaffSidebar = ({ activeTab, setActiveTab, isOpen }) => {
    const menuItems = [
        { id: 'appointment-management', label: 'Quản lý lịch hẹn', icon: <FaClipboardList /> },
        // { id: 'appointments', label: 'Duyệt cuộc hẹn', icon: <FaCalendarAlt /> },
        { id: 'lab-results', label: 'Kết quả xét nghiệm', icon: <FaFlask /> },
        // { id: 'appointment-status', label: 'Trạng thái cuộc hẹn', icon: <FaClipboardList /> },
        { id: 'medical-services', label: 'Dịch vụ y tế', icon: <FaHospital /> },
        { id: 'arv-protocol', label: 'Quản lý phác đồ ARV', icon: <FaCapsules /> },
        { id: 'drug-management', label: 'Quản lý thuốc', icon: <FaPills /> },
        { id: 'payment-management', label: 'Quản lý thanh toán', icon: <FaMoneyBillWave /> },
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

export default StaffSidebar; 