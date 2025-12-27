import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../Services/AuthService';
import './Auth.scss';

const LogoutButton = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <button
            onClick={handleLogout}
            className="logout-button"
        >
            Đăng xuất
        </button>
    );
};

export default LogoutButton; 