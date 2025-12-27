/**
 * Login.jsx - Component đăng nhập
 *
 * Chức năng:
 * - Form đăng nhập với email/password
 * - Validation input
 * - Call AuthService để authenticate
 * - Redirect theo role sau khi login thành công
 * - Google login integration
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../Common/FormInput.jsx';    // Reusable form input component
import Button from '../Common/Button.jsx';          // Reusable button component
import './Auth.scss';
import logo from '../../assets/SWPlogo.png';        // App logo
import Googlelogo from '../../assets/GoogleLogo.png'; // Google login icon
import { login } from '../../Services/AuthService.js'; // Login API service
import { getCurrentUser } from '../../Services/UserService.js';
import { toast } from 'react-toastify';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            email: '',
            password: ''
        };

        if (!formData.email) {
            newErrors.email = 'Vui lòng nhập email';
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await login(formData.email, formData.password);
            const { token, email, role } = response.data;

            // Verify token is present
            if (!token) {
                throw new Error('Token không hợp lệ');
            }

            // Save to localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('email', email);
            localStorage.setItem('role', role);

            // Get user details including fullName
            const userResponse = await getCurrentUser();
            const { fullName, id } = userResponse.data;
            localStorage.setItem('fullName', fullName);
            localStorage.setItem('userId', id); // Thêm dòng này để lưu userId

            // Save remember me preference
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            } else {
                localStorage.removeItem('rememberMe');
            }

            toast.success('Đăng nhập thành công!');

            // Redirect based on role
            if (role === 'DOCTOR') {
                navigate('/doctorprofile', { state: { defaultTab: 'profile' } });
                return;
            }
            switch (role) {
                case 'ADMIN':
                    navigate('/admin/dashboard');
                    break;
                case 'STAFF':
                    navigate('/staff/dashboard');
                    break;
                case 'PATIENT':
                    navigate('/');
                    break;
                default:
                    navigate('/profile');
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrors(prev => ({
                ...prev,
                email: error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.'
            }));
            toast.error(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-wrapper">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="login-header">
                            <img src={logo} alt="Logo" className="login-logo" />
                            <span className="login-title">HIV Treatment System</span>
                        </div>
                        <h1>Đăng nhập</h1>
                        <p>Chào mừng bạn quay trở lại! Vui lòng đăng nhập vào tài khoản của bạn.</p>
                    </div>

                    {errors.email && (
                        <div className="alert alert-danger" role="alert">
                            {errors.email}
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <FormInput
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Nhập email"
                            icon=""
                            error={errors.email}
                            required
                            disabled={loading}
                        />

                        <FormInput
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Nhập mật khẩu"
                            icon=""
                            error={errors.password}
                            required
                            disabled={loading}
                        />

                        <div className="form-group">
                            <label className="checkbox-container">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span className="checkmark"></span>
                                Ghi nhớ đăng nhập
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </Button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Chưa có tài khoản? <Link to="/signup">Đăng ký ngay</Link>
                        </p>
                        <Link to="/forgot-password" className="forgot-password">
                            Quên mật khẩu?
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
