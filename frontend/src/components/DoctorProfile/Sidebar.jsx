import React from 'react';
import './Sidebar.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser,
    faCalendarCheck,
    faCalendarAlt,
    faUserFriends,
    faFlask,
    faHeartbeat,
    faCommentDots,
    faBell,
    faLock,
    faQuestionCircle,
    faUserCircle,
    faBlog
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ activeContent, setActiveContent }) => {
    const fullName = localStorage.getItem('fullName');
    const menuItems = [
        { id: 'profile', label: 'Quản lý hồ sơ', icon: faUser },
        { id: 'appointments', label: 'Lịch hẹn', icon: faCalendarCheck },
        { id: 'schedule', label: 'Thời gian biểu', icon: faCalendarAlt },
        { id: 'patients', label: 'Danh sách bệnh nhân', icon: faUserFriends },
        { id: 'tests', label: 'Xét nghiệm', icon: faFlask },
        { id: 'treatment', label: 'Phác đồ điều trị', icon: faHeartbeat },
        { id: 'consultation', label: 'Tư vấn', icon: faCommentDots },
        { id: 'blog', label: 'Blog', icon: faBlog },
        { id: 'notifications', label: 'Thông báo', icon: faBell },
        { id: 'privacy', label: 'Riêng tư', icon: faLock },
        { id: 'support', label: 'Hỗ trợ', icon: faQuestionCircle }
    ];

    return (
        <div className="sidebar">
            <div className="sidebar__header">
                <div className="sidebar__user-info">
                    <div className="sidebar__avatar">
                        <FontAwesomeIcon icon={faUserCircle} size="3x" />
                    </div>
                    <div className="sidebar__user-details">
                        <h3>Tài khoản bác sĩ</h3>
                        <p>{fullName}</p>
                    </div>
                </div>
            </div>

            <nav className="sidebar__menu">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className={`sidebar__menu-item ${activeContent === item.id ? 'active' : ''}`}
                        onClick={() => setActiveContent(item.id)}
                    >
                        <span className="sidebar__menu-icon">
                            <FontAwesomeIcon icon={item.icon} />
                        </span>
                        <span className="sidebar__menu-label">{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar; 