import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.scss';
import logo from '../../assets/SWPLogo.png'; // Adjust the path as necessary
import { FaBell } from 'react-icons/fa';
import axios from 'axios';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const [hasNew, setHasNew] = useState(false);

    useEffect(() => {
        // Map API lấy số lượng thông báo mới (nếu có)
        // Giả sử có API: /api/notifications/user/unread-count hoặc /api/notifications/user
        // Nếu chưa có, để sẵn code này, khi backend bổ sung chỉ cần mở comment
        // const fetchNotifications = async () => {
        //     try {
        //         const token = localStorage.getItem('token');
        //         const res = await axios.get('http://localhost:8080/api/notifications/user', {
        //             headers: { Authorization: `Bearer ${token}` }
        //         });
        //         setNotificationCount(res.data.filter(n => !n.read).length);
        //         setHasNew(res.data.some(n => !n.read));
        //     } catch (err) {
        //         setNotificationCount(0);
        //         setHasNew(false);
        //     }
        // };
        // fetchNotifications();
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
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
                            <li><a href="#services">DỊCH VỤ</a></li>
                            <li><Link to="/about">GIỚI THIỆU</Link></li>
                            <li><Link to="/blog">BLOG</Link></li>
                            <li><Link to="/admin" >Admin</Link></li>
                            <li><Link to="/contact" >LIÊN HỆ</Link></li>
                        </ul>
                    </nav>

                    <div className="header-actions">
                        <Link to="/notifications" className="notification-icon" style={{ color: '#222' }}>
                            <FaBell size={22} />
                            {notificationCount > 0 && (
                                <span className="notification-badge">{notificationCount}</span>
                            )}
                        </Link>
                        <Link to="/login" className="login-btn">Đăng nhập</Link>
                        <Link to="/signup" className="signup-btn">Đăng ký</Link>
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

export default Header;