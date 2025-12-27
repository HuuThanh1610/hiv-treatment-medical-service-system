import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateCurrentUser, updatePassword } from '../../Services/UserService.js';
import axios from 'axios';
import UserAppointmentTable from './UserAppointmentTable';
import UserPaymentTable from './UserPaymentTable';
import './ProfileContent.scss';
import { toast } from 'react-toastify';

const ProfileContent = ({ activeTab, userData, onUpdateUser, onUpdatePassword }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '', // Đổi từ phone sang phoneNumber
        birthday: '',
        gender: '',
        address: '', // Thêm trường address
        isActive: true,
        isAnonymous: false,
        isPregnant: false // Thêm trường isPregnant
    });
    const [errors, setErrors] = useState({}); // Thêm state errors để hiển thị lỗi
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [userRole, setUserRole] = useState(''); // Thêm state để lưu role của user

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            // Kiểm tra role từ token hoặc localStorage
            const token = localStorage.getItem('token');
            const userRoleFromStorage = localStorage.getItem('userRole'); // Nếu có lưu role

            let response;
            if (userRoleFromStorage === 'PATIENT') {
                // Nếu biết là PATIENT, gọi trực tiếp API patient
                response = await axios.get('http://localhost:8080/api/patients/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserRole('PATIENT');
            } else {
                // Thử lấy thông tin user thường trước
                try {
                    response = await getCurrentUser();

                    // Kiểm tra role từ response
                    if (response.data.roleName === 'PATIENT') {
                        // Nếu là PATIENT, gọi lại API patient
                        response = await axios.get('http://localhost:8080/api/patients/me', {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        setUserRole('PATIENT');
                    } else {
                        setUserRole('USER');
                    }
                } catch (err) {
                    // Nếu không phải user thường, thử lấy thông tin patient
                    try {
                        response = await axios.get('http://localhost:8080/api/patients/me', {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        setUserRole('PATIENT');
                    } catch (patientErr) {
                        throw new Error('Không thể xác định loại tài khoản');
                    }
                }
            }

            const userData = response.data;
            setUser(userData);
            setFormData({
                fullName: userData.fullName || '',
                email: userData.email || '',
                phoneNumber: userData.phoneNumber || '',
                birthday: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
                gender: userData.gender || '',
                address: userData.address || '',
                isActive: userData.isActive ?? true,
                isAnonymous: userData.anonymous ?? false,
                isPregnant: userData.isPregnant ?? false
            });
            setError(null);
        } catch (err) {
            setError('Không thể tải thông tin người dùng');
            console.error('Error fetching user data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleToggleAnonymous = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.patch('http://localhost:8080/api/users/me/anonymous', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUser(response.data);
            toast.success(`Đã ${response.data.anonymous ? 'bật' : 'tắt'} chế độ ẩn danh thành công!`);
        } catch (err) {
            console.error('Error toggling anonymous:', err);
            toast.error('Không thể thay đổi trạng thái ẩn danh');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Họ và tên là bắt buộc';
        }
        if (!formData.phoneNumber || !/^[0-9]{9,15}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
        }
        if (!formData.birthday) {
            newErrors.birthday = 'Ngày sinh là bắt buộc';
        }
        if (!formData.gender) {
            newErrors.gender = 'Giới tính là bắt buộc';
        }
        if (!formData.address || !formData.address.trim()) {
            newErrors.address = 'Địa chỉ là bắt buộc';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return; // Nếu validate lỗi thì không submit
        try {
            setLoading(true);
            const updateData = {
                fullName: formData.fullName || '',
                phoneNumber: formData.phoneNumber || '',
                dateOfBirth: formData.birthday || '',
                gender: formData.gender || '',
                address: formData.address || '',
                isAnonymous: formData.isAnonymous,
                isPregnant: formData.gender === 'Female' ? formData.isPregnant : false // Gửi isPregnant nếu là nữ
            };
            console.log('DEBUG: updateData being sent:', updateData);

            // Gọi API tương ứng với role
            if (userRole === 'PATIENT') {
                const token = localStorage.getItem('token');
                await axios.put('http://localhost:8080/api/patients/me', updateData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await updateCurrentUser(updateData);
            }

            setUpdateSuccess(true);
            toast.success('Cập nhật thông tin cá nhân thành công!');
            setIsEditing(false);
            localStorage.setItem('fullName', formData.fullName);
            await fetchUserData();
            setTimeout(() => setUpdateSuccess(false), 3000);
        } catch (err) {
            setError('Không thể cập nhật thông tin');
            console.error('Error updating user:', err);
            if (err.response && err.response.data) {
                console.error('Lỗi chi tiết từ backend:', err.response.data);
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Mật khẩu mới không khớp');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        try {
            await updatePassword(passwordData, user);
            setPasswordSuccess('Mật khẩu đã được cập nhật thành công');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setShowPasswordPopup(false);
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    setPasswordError('Mật khẩu hiện tại không đúng');
                } else if (error.response.status === 400) {
                    setPasswordError(error.response.data.message || 'Mật khẩu mới không hợp lệ');
                } else {
                    setPasswordError('Có lỗi xảy ra khi cập nhật mật khẩu');
                }
            } else {
                setPasswordError('Không thể kết nối đến máy chủ');
            }
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <>
                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="profile-form">
                                {/* Form fields go here, same as before */}
                                <div className="form-group">
                                    <label>Họ và tên</label>
                                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
                                    {errors.fullName && <div className="error-message">{errors.fullName}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" name="email" value={formData.email} disabled />
                                </div>
                                <div className="form-group">
                                    <label>Số điện thoại</label>
                                    <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
                                    {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Địa chỉ</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
                                    {errors.address && <div className="error-message">{errors.address}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Ngày sinh</label>
                                    <input type="date" name="birthday" value={formData.birthday} onChange={handleInputChange} />
                                    {errors.birthday && <div className="error-message">{errors.birthday}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Giới tính</label>
                                    <select name="gender" value={formData.gender} onChange={handleInputChange}>
                                        <option value="">Chọn giới tính</option>
                                        <option value="Male">Nam</option>
                                        <option value="Female">Nữ</option>
                                        <option value="Other">Khác</option>
                                    </select>
                                    {errors.gender && <div className="error-message">{errors.gender}</div>}
                                </div>
                                {/* Checkbox Mang thai, chỉ hiển thị nếu là nữ */}
                                {formData.gender === 'Female' && (
                                    <div className="form-group">
                                        <label>
                                            <input
                                                type="checkbox"
                                                name="isPregnant"
                                                checked={formData.isPregnant || false}
                                                onChange={handleInputChange}
                                            />
                                            Tôi đang mang thai
                                        </label>
                                    </div>
                                )}
                                {/* Checkbox Ẩn danh */}
                                <div className="form-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="isAnonymous"
                                            checked={formData.isAnonymous || false}
                                            onChange={handleInputChange}
                                        />
                                        Sử dụng chế độ ẩn danh (thông tin cá nhân sẽ được ẩn khỏi bác sĩ và nhân viên y tế)
                                    </label>
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="save-button" disabled={loading}>
                                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                    </button>
                                    <button type="button" className="cancel-button" onClick={() => { setIsEditing(false); fetchUserData(); }}>
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        ) : showPasswordPopup ? (
                            <form onSubmit={handlePasswordSubmit} className="password-form">
                                <div className="form-group">
                                    <label>Mật khẩu hiện tại</label>
                                    <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Mật khẩu mới</label>
                                    <div className="password-input-group">
                                        <input type={showNewPassword ? 'text' : 'password'} name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required />
                                        <button type="button" className="toggle-password" onClick={() => setShowNewPassword(!showNewPassword)}>
                                            {showNewPassword ? 'Ẩn' : 'Hiện'}
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Xác nhận mật khẩu mới</label>
                                    <div className="password-input-group">
                                        <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required />
                                        <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                            {showConfirmPassword ? 'Ẩn' : 'Hiện'}
                                        </button>
                                    </div>
                                </div>
                                {passwordError && <div className="error-message">{passwordError}</div>}
                                {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
                                <div className="form-actions">
                                    <button type="submit" className="save-button" disabled={loading}>
                                        {loading ? 'Đang lưu...' : 'Đổi mật khẩu'}
                                    </button>
                                    <button type="button" className="cancel-button" onClick={() => {
                                        setShowPasswordPopup(false);
                                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                        setPasswordError('');
                                    }}>
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="profile-table">
                                <div className="profile-row">
                                    <div className="profile-label">Họ và tên</div>
                                    <div className="profile-value">{user?.fullName || 'Chưa cập nhật'}</div>
                                </div>
                                <div className="profile-row">
                                    <div className="profile-label">Email</div>
                                    <div className="profile-value">{user?.email || 'Chưa cập nhật'}</div>
                                </div>
                                <div className="profile-row">
                                    <div className="profile-label">Số điện thoại</div>
                                    <div className="profile-value">{user?.phoneNumber || 'Chưa cập nhật'}</div>
                                </div>
                                <div className="profile-row">
                                    <div className="profile-label">Địa chỉ</div>
                                    <div className="profile-value">{user?.address || 'Chưa cập nhật'}</div>
                                </div>
                                <div className="profile-row">
                                    <div className="profile-label">Ngày sinh</div>
                                    <div className="profile-value">{user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Chưa cập nhật'}</div>
                                </div>
                                <div className="profile-row">
                                    <div className="profile-label">Giới tính</div>
                                    <div className="profile-value">
                                        {user?.gender === 'Male' ? 'Nam' :
                                         user?.gender === 'Female' ? 'Nữ' :
                                         user?.gender === 'Other' ? 'Khác' :
                                         'Chưa cập nhật'}
                                    </div>
                                </div>
                                {/* Hiển thị trạng thái mang thai chỉ khi là nữ */}
                                {user?.gender === 'Female' && (
                                    <div className="profile-row">
                                        <div className="profile-label">Trạng thái mang thai</div>
                                        <div className="profile-value">
                                            {user?.isPregnant === true ? 'Có' : user?.isPregnant === false ? 'Không' : 'Chưa cập nhật'}
                                        </div>
                                    </div>
                                )}
                                {/* Hiển thị trạng thái ẩn danh */}
                                <div className="profile-row">
                                    <div className="profile-label">Chế độ ẩn danh</div>
                                    <div className="profile-value">
                                        <div className="anonymous-control">
                                            <span className={`anonymous-status ${user?.anonymous ? 'active' : 'inactive'}`}>
                                                {user?.anonymous ? '🔒 Đang bật' : '🔓 Đang tắt'}
                                            </span>
                                            <button
                                                className={`toggle-anonymous-btn ${user?.anonymous ? 'active' : 'inactive'}`}
                                                onClick={handleToggleAnonymous}
                                                disabled={loading}
                                            >
                                                {user?.anonymous ? 'Tắt ẩn danh' : 'Bật ẩn danh'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                );
            case 'appointments':
                return <UserAppointmentTable />;
            case 'payments':
                return <UserPaymentTable />;
            case 'lab-tests':
                return <div>Chức năng xem kết quả xét nghiệm sẽ sớm được cập nhật.</div>;
            default:
                return <div>Chọn một mục từ menu</div>;
        }
    };

    if (loading && !user) return <div className="loading">Đang tải...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="profile-content google-profile-style">
            {updateSuccess && <div className="success-message">Cập nhật thành công!</div>}
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}

            <div className="profile-section profile-section--basi    c">
                <div className="profile-section__header">
                    <div>
                        <h2>{activeTab === 'profile' ? 'Thông tin người dùng' : 'Lịch sử xét nghiệm'}</h2>
                    </div>
                    {activeTab === 'profile' && !isEditing && !showPasswordPopup && (
                        <div className="profile-actions">
                            <button className="edit-button" onClick={() => setIsEditing(true)}>
                                Chỉnh sửa thông tin
                            </button>
                            <button className="change-password-button" onClick={() => setShowPasswordPopup(true)}>
                                Đổi mật khẩu
                            </button>
                        </div>
                    )}
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default ProfileContent;
