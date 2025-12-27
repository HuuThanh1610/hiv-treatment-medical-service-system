/**
 * Navbar.jsx - Navigation bar chính của ứng dụng
 *
 * Chức năng:
 * - Navigation menu với responsive design
 * - User authentication status display
 * - Role-based navigation items
 * - Notifications bell icon
 * - Logout functionality
 * - User dropdown menu
 */
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaBell } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

// Services và assets
import { logout } from '../../Services/AuthService'; // Logout API service
import logo from '../../assets/SWPLogo.png';         // App logo

import './Navbar.scss';

const Navbar = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isAuthenticated = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const fullName = localStorage.getItem('fullName');
    const userRole = localStorage.getItem('role');
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const notificationRef = useRef();
    const unreadCount = notifications.filter(n => !n.read).length;
    const [reminders, setReminders] = useState([]);
    const [reminderLoading, setReminderLoading] = useState(false);
    const [reminderError, setReminderError] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [appointmentLoading, setAppointmentLoading] = useState(false);
    const [appointmentError, setAppointmentError] = useState(null);
    const [lastAppointmentCount, setLastAppointmentCount] = useState(0);
    const [viewedNotifications, setViewedNotifications] = useState(false);
    const [previousNotificationCount, setPreviousNotificationCount] = useState(0);

    const fetchReminders = async () => {
        setReminderLoading(true);
        setReminderError(null);
        try {
            const token = localStorage.getItem('token');
            // Lấy patientId từ user hiện tại
            const userRes = await axios.get('http://localhost:8080/api/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const patientId = userRes.data.id;
            const res = await axios.get(`http://localhost:8080/api/treatment-reminders/patient/${patientId}/type/Medication`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReminders(res.data);
        } catch (err) {
            setReminderError('Không thể tải nhắc nhở uống thuốc.');
            setReminders([]);
        } finally {
            setReminderLoading(false);
        }
    };

    const fetchAppointments = async () => {
        setAppointmentLoading(true);
        setAppointmentError(null);
        try {
            const token = localStorage.getItem('token');
            let res;
            if (userRole === 'PATIENT') {
                res = await axios.get('http://localhost:8080/api/appointments/my-appointments', {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else if (userRole === 'DOCTOR') {
                res = await axios.get('http://localhost:8080/api/appointments/my-doctor-appointments', {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else if (userRole === 'STAFF') {
                // STAFF - lấy tất cả lịch hẹn
                res = await axios.get('http://localhost:8080/api/appointments/all', {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                // ADMIN - không gọi API này
                res = { data: [] };
            }
            setAppointments(res.data);

            // Thông báo toast cho bác sĩ khi có lịch hẹn mới
            if (userRole === 'DOCTOR') {
                const newAppointments = res.data.filter(apt => apt.status === 'PENDING');
                if (newAppointments.length > lastAppointmentCount && lastAppointmentCount > 0) {
                    const newCount = newAppointments.length - lastAppointmentCount;
                    toast.info(`Bạn có ${newCount} lịch hẹn mới cần xác nhận!`, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                }
                setLastAppointmentCount(newAppointments.length);
            }
        } catch (err) {
            setAppointmentError('Không thể tải lịch hẹn.');
            setAppointments([]);
        } finally {
            setAppointmentLoading(false);
        }
    };

    // Polling để kiểm tra lịch hẹn mới cho bác sĩ
    useEffect(() => {
        if (userRole === 'DOCTOR' && isAuthenticated) {
            // Fetch lần đầu
            fetchAppointments();

            // Polling mỗi 30 giây
            const interval = setInterval(() => {
                fetchAppointments();
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [userRole, isAuthenticated]);

    // Auto-fetch notifications và appointments khi component mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchReminders();
            fetchAppointments();

            // Polling cho tất cả user roles
            const interval = setInterval(() => {
                fetchReminders();
                fetchAppointments();
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const handleBellClick = () => {
        setShowNotifications(v => !v);
        // Khi click vào chuông, reset số thông báo về 0
        setLastAppointmentCount(0);
        setViewedNotifications(true);
    };

    // Xử lý click vào lịch hẹn trong thông báo
    const handleAppointmentClick = (appointment) => {
        setShowNotifications(false); // Đóng popup thông báo

        // Chuyển đến trang lịch hẹn theo role
        if (userRole === 'PATIENT') {
            navigate('/profile?tab=appointments');
        } else if (userRole === 'DOCTOR') {
            navigate('/doctorprofile?tab=appointments');
        } else if (userRole === 'STAFF') {
            navigate('/staff/dashboard?tab=appointments');
        } else if (userRole === 'ADMIN') {
            navigate('/admin/dashboard?tab=appointments');
        }
    };

    // Lấy lịch hẹn mới (chưa đọc/xác nhận)
    const getNewAppointments = () => {
        if (userRole === 'PATIENT') {
            return appointments.filter(apt => apt.status === 'PENDING' || apt.status === 'CONFIRMED');
        } else if (userRole === 'DOCTOR') {
            return appointments.filter(apt => apt.status === 'PENDING');
        } else {
            return appointments.filter(apt => apt.status === 'PENDING');
        }
    };

    const newAppointments = getNewAppointments();
    // Chỉ hiển thị số thông báo chưa xem
    const totalNotifications = viewedNotifications ? 0 : (reminders.filter(r => r.status === 'Pending').length + newAppointments.length);

    // Cập nhật previousNotificationCount khi totalNotifications thay đổi
    useEffect(() => {
        const currentCount = reminders.filter(r => r.status === 'Pending').length + newAppointments.length;
        if (currentCount > previousNotificationCount && viewedNotifications) {
            setViewedNotifications(false);
        }
        setPreviousNotificationCount(currentCount);
    }, [reminders, newAppointments]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        }
        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showNotifications]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleProfileClick = () => {
        if (userRole === 'DOCTOR') {
            navigate('/doctorprofile');
        } else {
            navigate('/profile');
        }
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <Link to="/" className="logo">
                        <img
                            src={logo}
                            alt="HIV Care Logo"
                            className="logo-image"
                        />
                        <span className="logo-text">HIV Care</span>
                    </Link>

                    <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
                        <ul className="nav-list">
                            <li><a href="/">TRANG CHỦ</a></li>
                            <li><Link to="/services">DỊCH VỤ</Link></li>
                            <li><Link to="/about">GIỚI THIỆU</Link></li>
                            <li><Link to="/user/blog">BLOG</Link></li>
                            {userRole === 'ADMIN' && (
                                <li><Link to="/admin/dashboard">ADMINDASHBOARD</Link></li>
                            )}
                            {userRole === 'STAFF' && (
                                <li><Link to="/staff/dashboard">STAFFDASHBOARD</Link></li>
                            )}
                            <li><Link to="/contact">LIÊN HỆ</Link></li>
                        </ul>
                    </nav>

                    <div className="header-actions">
                        <div className="notification-wrapper" ref={notificationRef}>
                            <button className="notification-btn" title="Thông báo" onClick={handleBellClick}>
                                <FaBell size={20} color="#1a237e" />
                                {totalNotifications > 0 && (
                                    <span className="notification-badge">{totalNotifications}</span>
                                )}
                            </button>
                            {showNotifications && (
                                <div className="notification-popup">
                                    <div className="notification-popup-header">Thông báo</div>

                                    {/* Phần lịch hẹn mới */}
                                    <div className="notification-section">
                                        <div className="notification-section-title">Lịch hẹn mới</div>
                                        {appointmentLoading ? (
                                            <div>Đang tải...</div>
                                        ) : appointmentError ? (
                                            <div className="notification-empty">{appointmentError}</div>
                                        ) : newAppointments.length === 0 ? (
                                            <div className="notification-empty">Không có lịch hẹn mới</div>
                                        ) : (
                                            <ul className="notification-list">
                                                {newAppointments.slice(0, 5).map(apt => (
                                                    <li key={apt.id} className="notification-unread"
                                                        onClick={() => handleAppointmentClick(apt)}
                                                        style={{ cursor: 'pointer' }}>
                                                        <div className="notification-item">
                                                            <div className="notification-title">
                                                                {userRole === 'PATIENT' ? `Lịch hẹn với BS. ${apt.doctorName}` : `Lịch hẹn của BN. ${apt.patientName}`}
                                                            </div>
                                                            <div className="notification-details">
                                                                {apt.appointmentDate} - {apt.appointmentTime}
                                                            </div>
                                                            <div className="notification-status">
                                                                {apt.status === 'PENDING' ? 'Chờ xác nhận' : apt.status === 'CONFIRMED' ? 'Đã xác nhận' : apt.status}
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    {/* Phần nhắc nhở uống thuốc */}
                                    <div className="notification-section">
                                        <div className="notification-section-title">Nhắc nhở uống thuốc</div>
                                        {reminderLoading ? (
                                            <div>Đang tải...</div>
                                        ) : reminderError ? (
                                            <div className="notification-empty">{reminderError}</div>
                                        ) : reminders.length === 0 ? (
                                            <div className="notification-empty">Không có nhắc nhở nào</div>
                                        ) : (
                                            <ul className="notification-list">
                                                {reminders.map(r => (
                                                    <li key={r.id} className={r.status === 'Pending' ? 'notification-unread' : 'notification-read'}>
                                                        {new Date(r.reminderDate).toLocaleString()} - {r.status === 'Pending' ? 'Chưa uống' : r.status === 'Completed' ? 'Đã uống' : 'Bỏ lỡ'}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        {isAuthenticated ? (
                            <div className="user-info">
                                <FaUser className="user-icon" />
                                <span
                                    className="username-link"
                                    onClick={handleProfileClick}
                                    style={{ cursor: 'pointer' }}
                                    title={email}
                                >
                                    {fullName || 'Người dùng'}
                                </span>
                                <button className="logout-btn" onClick={handleLogout}>
                                    <FaSignOutAlt />
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="login-btn">Đăng nhập</Link>
                                <Link to="/signup" className="signup-btn">Đăng ký</Link>
                            </>
                        )}
                    </div>

                    <button className="menu-toggle" onClick={toggleMenu}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar; 