import React from 'react';
import './Sidebar.scss';
import { FaUser, FaCalendarAlt, FaFlask, FaHeartbeat, FaCommentDots, FaBell, FaMoneyCheckAlt, FaCapsules, FaHistory } from 'react-icons/fa';
import { LuUserRound } from "react-icons/lu";
import { faBlog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const fullName = localStorage.getItem('fullName');
    const menuItems = [
        { id: 'profile', label: 'Quản lý hồ sơ', icon: <FaUser /> },
        { id: 'medication', label: 'Kế hoạch điều trị', icon: <FaCapsules /> },
        { id: 'treatment-history', label: 'Lịch sử điều trị', icon: <FaHistory /> },
        { id: 'appointments', label: 'Lịch hẹn', icon: <FaCalendarAlt /> },
        { id: 'lab-tests', label: 'Xét nghiệm', icon: <FaFlask /> },
        // { id: 'about', label: 'Phác đồ ARV', icon: <FaHeartbeat /> },
        { id: 'consultation', label: 'Tư vấn', icon: <FaCommentDots /> },
        { id: 'user-payments', label: 'Thanh toán', icon: <FaMoneyCheckAlt /> },
        // { id: 'reminders', label: 'Nhắc nhở uống thuốc', icon: <FaBell /> },
        { id: 'notifications', label: 'Uống thuốc', icon: <FaBell /> },
        { id: 'blog', label: 'Blog cộng đồng', icon: faBlog },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar__header">
                <div className="sidebar__user-info">
                    <div className="sidebar__avatar">
                        <LuUserRound size={55} />
                    </div>
                    <div className="sidebar__user-details">
                        <h3>Tài khoản của</h3>
                        <p>{fullName}</p>
                    </div>
                </div>
            </div>

            <nav className="sidebar__menu">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className={`sidebar__menu-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <span className="sidebar__menu-icon">
                            {typeof item.icon === 'object' && item.icon.prefix ? (
                                <FontAwesomeIcon icon={item.icon} />
                            ) : (
                                item.icon
                            )}
                        </span>
                        <span className="sidebar__menu-label">{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
