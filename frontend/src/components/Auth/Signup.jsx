import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../Common/FormInput.jsx';
import Button from '../Common/Button.jsx';
import './Auth.scss';
import logo from '../../assets/SWPlogo.png'; // Assuming you have a logo image
import googleLogo from '../../assets/GoogleLogo.png'; // Thêm dòng này
import { register } from '../../Services/AuthService';
import api from '../../Services/api';
import { toast } from 'react-toastify';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        birthday: '',
        gender: '',
        agreeTerms: false,
        isAnonymous: false,
        code: '',
        address: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Họ và tên là bắt buộc';
        }

        if (!formData.email) {
            newErrors.email = 'Email là bắt buộc';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.phoneNumber) {
            newErrors.phoneNumber = 'Số điện thoại là bắt buộc';
        } else if (!/^[0-9]{9,15}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
        }

        if (!formData.password) {
            newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        if (!formData.birthday) {
            newErrors.birthday = 'Ngày sinh là bắt buộc';
        }

        if (!formData.gender) {
            newErrors.gender = 'Giới tính là bắt buộc';
        }

        if (!formData.agreeTerms) {
            newErrors.agreeTerms = 'Bạn phải đồng ý với điều khoản sử dụng';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSendVerification = async () => {
        if (!formData.email) {
            setErrors(prev => ({ ...prev, email: 'Vui lòng nhập email trước!' }));
            return;
        }
        setSendingCode(true);
        try {
            await api.post(`/api/auth/send-verification?email=${formData.email}`);
            setVerificationSent(true);
            toast.success('Đã gửi mã xác thực đến email!');
        } catch (err) {
            toast.error('Email đã tồn tại!');
        }
        setSendingCode(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        if (!formData.code) {
            setErrors(prev => ({ ...prev, code: 'Vui lòng nhập mã xác thực!' }));
            return;
        }

        setLoading(true);

        try {
            const userData = {
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber, // Đổi từ phone sang phoneNumber
                birthday: formData.birthday,
                gender: formData.gender,
                isAnonymous: false,
                address: formData.address
            };
            await api.post(`/api/auth/register-with-verification?code=${formData.code}`, userData);
            toast.success('Đăng ký thành công!');
            navigate('/login'); // Chuyển hướng đến trang đăng nhập
        } catch (error) {
            console.error('Signup error:', error);
            if (error.response?.data) {
                // Hiển thị lỗi từ server
                setErrors(prev => ({
                    ...prev,
                    server: error.response.data.message || 'Đăng ký thất bại!'
                }));
            } else {
                toast.error('Đăng ký thất bại! Vui lòng thử lại sau.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-wrapper">
                <div className="auth-card signup-card">
                    <div className="auth-header">
                        <div className="logo">
                            <img src={logo} alt="HIV Treatment Management Logo" className="logo-icon" />
                            <span className="logo-text">HIV Care</span>
                        </div>
                        <h1>Đăng ký tài khoản</h1>
                        <p>Tạo tài khoản để bắt đầu hành trình chăm sóc sức khỏe của bạn.</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {errors.server && (
                            <div className="error-message server-error">
                                {errors.server}
                            </div>
                        )}

                        <div className="form-grid">
                            <div className="form-column">

                                <FormInput
                                    type="text"
                                    name="fullName"
                                    placeholder="Nhập họ và tên"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    error={errors.fullName}
                                    required
                                />

                                <div className="form-row" style={{ display: 'flex', gap: 8 }}>
                                    <FormInput
                                        type="email"
                                        name="email"
                                        placeholder="Nhập email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        error={errors.email}
                                        required
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSendVerification}
                                        disabled={sendingCode}
                                        style={{ height: 40 }}
                                    >
                                        {sendingCode ? 'Đang gửi...' : 'Gửi mã'}
                                    </button>
                                </div>

                                <FormInput
                                    type="text"
                                    name="code"
                                    placeholder="Nhập mã xác thực"
                                    value={formData.code}
                                    onChange={handleChange}
                                    error={errors.code}
                                    required
                                />

                            </div>
                            <div className="form-column">

                                <FormInput
                                    type="tel"
                                    name="phoneNumber"
                                    placeholder="Nhập số điện thoại"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    error={errors.phoneNumber}
                                    required
                                />


                                <FormInput
                                    type="password"
                                    name="password"
                                    placeholder="Nhập mật khẩu"
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={errors.password}
                                    required
                                />


                                <FormInput
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Nhập lại mật khẩu"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    error={errors.confirmPassword}
                                    required
                                />

                            </div>
                        </div>

                        <div className="">
                            <FormInput
                                type="address"
                                name="address"
                                placeholder="Nhập địa chỉ"
                                value={formData.address}
                                onChange={handleChange}
                                error={errors.address}
                                required
                            />

                        </div>

                        <div className="form-grid">
                            <div className="form-column">

                                <FormInput
                                    type="date"
                                    name="birthday"
                                    placeholder="Nhập ngày sinh"
                                    value={formData.birthday}
                                    onChange={handleChange}
                                    error={errors.birthday}
                                    required
                                />

                            </div>
                            <div className="form-column">

                                <FormInput
                                    type="select"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    error={errors.gender}
                                    required
                                    options={[
                                        { value: '', label: 'Chọn giới tính' },
                                        { value: 'Male', label: 'Nam' },
                                        { value: 'Female', label: 'Nữ' }
                                    ]}
                                />

                            </div>
                        </div>

                        <div className="form-options">
                            <label className="checkbox-wrapper">
                                <input
                                    type="checkbox"
                                    name="agreeTerms"
                                    checked={formData.agreeTerms}
                                    onChange={handleChange}
                                />
                                <span className="checkmark"></span>
                                <span className="terms-text">
                                    Tôi đồng ý với{' '}
                                    <Link to="/terms" className="text-link">Điều khoản sử dụng</Link>
                                    {' '}và{' '}
                                    <Link to="/privacy" className="text-link">Chính sách bảo mật</Link>
                                </span>
                            </label>
                            {errors.agreeTerms && <span className="error-message">{errors.agreeTerms}</span>}
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="large"
                            className="btn-full"
                            loading={loading}
                        >
                            Đăng ký
                        </Button>

                        <div className="divider">
                            <span>hoặc</span>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="large"
                            className="btn-full social-btn"
                        >
                            <img src={googleLogo} alt="Google Logo" className="google-logo" />
                            Đăng ký với Google
                        </Button>

                        <div className="auth-footer">
                            <p>
                                Đã có tài khoản?
                                <Link to="/login" className="auth-link"> Đăng nhập ngay</Link>
                            </p>
                        </div>
                    </form>
                </div>

                <div className="auth-image">
                    <div className="image-content">
                        <h2>Bắt đầu hành trình chăm sóc sức khỏe</h2>
                        <p>Tham gia cộng đồng hàng nghìn người đang tin tưởng sử dụng dịch vụ của chúng tôi.</p>
                        <div className="stats">
                            <div className="stat">
                                <h3>10,000+</h3>
                                <p>Người dùng tin tưởng</p>
                            </div>
                            <div className="stat">
                                <h3>24/7</h3>
                                <p>Hỗ trợ liên tục</p>
                            </div>
                            <div className="stat">
                                <h3>100%</h3>
                                <p>Bảo mật thông tin</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;