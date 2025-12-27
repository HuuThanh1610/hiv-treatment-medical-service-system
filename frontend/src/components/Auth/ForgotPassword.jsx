import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FormInput from '../Common/FormInput';
import Button from '../Common/Button';
import './Auth.scss';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Validate email
        if (!email) {
            setError('Vui lòng nhập email');
            setIsLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Email không hợp lệ');
            setIsLoading(false);
            return;
        }

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Here you would typically call your API
            // const response = await resetPasswordAPI(email);

            setIsSubmitted(true);
        } catch (err) {
            setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h2>Kiểm tra email của bạn</h2>
                        <p>Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn.</p>
                    </div>

                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        <p>Email đã được gửi đến <strong>{email}</strong></p>
                        <p className="instruction">
                            Vui lòng kiểm tra hộp thư đến (và thư mục spam) để tìm email từ chúng tôi.
                        </p>
                    </div>

                    <div className="auth-footer">
                        <p>
                            Không nhận được email?
                            <button
                                type="button"
                                className="link-button"
                                onClick={() => setIsSubmitted(false)}
                            >
                                Gửi lại
                            </button>
                        </p>
                        <p>
                            <Link to="/login" className="auth-link">
                                Quay lại đăng nhập
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Quên mật khẩu</h2>
                    <p>Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="error-message">{error}</div>}

                    <FormInput
                        type="email"
                        placeholder="Nhập email của bạn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang gửi...' : 'Gửi hướng dẫn'}
                    </Button>
                </form>

                <div className="auth-footer">
                    <p>
                        Nhớ mật khẩu?
                        <Link to="/login" className="auth-link">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;