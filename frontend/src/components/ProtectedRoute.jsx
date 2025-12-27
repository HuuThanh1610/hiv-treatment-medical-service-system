import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }

            // Check if token exists and role is present
            if (token && role) {
                setIsAuthenticated(true);
            } else {
                // If token is invalid or expired, clear localStorage and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('email');
                localStorage.removeItem('role');
                localStorage.removeItem('fullName');
                setIsAuthenticated(false);
            }
            setIsLoading(false);
        };

        verifyToken();
    }, [token]);

    if (isLoading) {
        return <div className="loading">Đang tải...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // Redirect to appropriate dashboard based on role
        switch (role) {
            case 'DOCTOR':
                return <Navigate to="/profile" replace />;
            case 'PATIENT':
                return <Navigate to="/profile" replace />;
            default:
                return <Navigate to="/profile" replace />;
        }
    }

    return children;
};

export default ProtectedRoute; 