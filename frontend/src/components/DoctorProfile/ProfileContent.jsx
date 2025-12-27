import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateCurrentUser, updatePassword } from '../../Services/UserService.js';
import axios from 'axios';
import './ProfileContent.scss';
import { toast } from 'react-toastify';
import { FaEdit } from 'react-icons/fa';

const SPECIALTIES = [
    'Truyen nhiem',
    'Mien dich',
    'Tong quat',
    'Nhi khoa',
    'Chuyen khoa HIV/AIDS',
    'Khác'
];

const ProfileContent = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showProfilePopup, setShowProfilePopup] = useState(false);
    const [profileFormData, setProfileFormData] = useState({
        specialty: '',
        qualifications: '',
        maxAppointmentsPerDay: 1
    });
    const [selectedSpecialty, setSelectedSpecialty] = useState('Khác');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        birthday: '',
        gender: '',
        specialization: '',
        licenseNumber: '',
        yearsOfExperience: '',
        isActive: true,
        address: '',
        isAnonymous: false
    });
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

    useEffect(() => {
        fetchDoctorData();
    }, []);

    const fetchDoctorData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/doctors/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const doctorData = response.data;
            setUser(doctorData);
            setFormData({
                fullName: doctorData.fullName || '',
                email: doctorData.email || '',
                phone: doctorData.phoneNumber || '',
                birthday: doctorData.birthday ? new Date(doctorData.birthday).toISOString().split('T')[0] : '',
                gender: doctorData.gender || '',
                specialization: doctorData.specialty || '',
                licenseNumber: '',
                yearsOfExperience: '',
                isActive: true,
                address: doctorData.address || '',
                isAnonymous: doctorData.anonymous || false
            });
            setError(null);
        } catch (err) {
            console.error('Lỗi khi gọi API:', err, err?.response?.status);
            if (err.response?.status === 404) {
                setTimeout(() => setShowProfilePopup(true), 200);
            } else {
                setError('Không thể tải thông tin bác sĩ');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const data = {
                specialty: selectedSpecialty === 'Khác' ? profileFormData.specialty : selectedSpecialty,
                qualifications: profileFormData.qualifications,
                maxAppointmentsPerDay: profileFormData.maxAppointmentsPerDay
            };
            await axios.post('http://localhost:8080/api/doctors/me/profile', data, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setShowProfilePopup(false);
            setProfileFormData({ specialty: '', qualifications: '', maxAppointmentsPerDay: 1 });
            setSelectedSpecialty('Khác');
            await new Promise(res => setTimeout(res, 300));
            await fetchDoctorData();
            toast.success('Tạo hồ sơ chuyên ngành thành công!');
        } catch (err) {
            setError('Không thể tạo hồ sơ bác sĩ');
            console.error('Error creating doctor profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileInputChange = (e) => {
        const { name, value } = e.target;
        setProfileFormData(prev => ({ ...prev, [name]: value }));
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

    const validateUserForm = () => {
        const errors = {};
        if (!formData.fullName || formData.fullName.trim().length < 3) {
            errors.fullName = 'Họ tên phải từ 3 ký tự trở lên';
        }
        if (!formData.phone || !/^[0-9]{9,15}$/.test(formData.phone)) {
            errors.phone = 'Số điện thoại phải từ 9-15 số và chỉ chứa số';
        }
        if (!formData.address || !formData.address.trim()) {
            errors.address = 'Địa chỉ không được để trống';
        }
        if (!formData.gender) {
            errors.gender = 'Giới tính là bắt buộc';
        }
        if (!formData.birthday) {
            errors.birthday = 'Ngày sinh là bắt buộc';
        }
        setError(errors);
        return Object.keys(errors).length === 0;
    };

    const validateDoctorForm = () => {
        const errors = {};
        if (!formData.specialty || !formData.specialty.trim()) {
            errors.specialty = 'Chuyên khoa không được để trống';
        }
        if (!formData.qualifications || !formData.qualifications.trim()) {
            errors.qualifications = 'Bằng cấp không được để trống';
        }
        if (!formData.maxAppointmentsPerDay || isNaN(Number(formData.maxAppointmentsPerDay)) || Number(formData.maxAppointmentsPerDay) < 1) {
            errors.maxAppointmentsPerDay = 'Số lịch/ngày phải là số nguyên dương';
        }
        setError(prev => ({ ...prev, ...errors }));
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateUserForm() || !validateDoctorForm()) return;
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            // 1. Cập nhật thông tin user (nếu có thay đổi)
            const userUpdateData = {
                fullName: formData.fullName,
                phoneNumber: String(formData.phone),
                isAnonymous: formData.isAnonymous ?? false,
                birthday: formData.birthday || null,
                gender: formData.gender,
                address: formData.address
            };
            await updateCurrentUser(userUpdateData); // hàm này đã import từ UserService.js
            // 2. Cập nhật thông tin chuyên ngành bác sĩ
            const doctorUpdateData = {
                specialty: formData.specialty,
                qualifications: formData.qualifications,
                maxAppointmentsPerDay: Number(formData.maxAppointmentsPerDay)
            };
            await axios.put('http://localhost:8080/api/doctors/me/profile', doctorUpdateData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUpdateSuccess(true);
            toast.success('Cập nhật thông tin thành công!');
            setIsEditing(false);
            localStorage.setItem('fullName', formData.fullName);
            await fetchDoctorData();
            setTimeout(() => setUpdateSuccess(false), 3000);
        } catch (err) {
            setError('Không thể cập nhật thông tin');
            console.error('Error updating doctor:', err);
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
            toast.success('Mật khẩu đã được cập nhật thành công!');
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

    if (loading && !user) return <div className="loading">Đang tải...</div>;

    return (
        <div className="profile-content google-profile-style">
            {typeof error === 'string' && <div className="error-message">{error}</div>}
            {error && typeof error === 'object' && error !== null && Object.values(error).map((msg, idx) => (
                <div className="error-message" key={idx}>{msg}</div>
            ))}
            {updateSuccess && <div className="success-message">Cập nhật thành công!</div>}
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}

            {/* Popup bổ sung hồ sơ chuyên ngành */}
            {showProfilePopup && (
                <div className="form-overlay">
                    <div className="form-container">
                        <h2>Bổ sung hồ sơ chuyên ngành</h2>
                        <p>Vui lòng bổ sung thông tin chuyên ngành để hoàn tất hồ sơ bác sĩ.</p>
                        <form onSubmit={handleProfileSubmit}>
                            <div className="form-group">
                                <label htmlFor="specialty">Chuyên khoa:</label>
                                <select
                                    id="specialty"
                                    value={selectedSpecialty}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSelectedSpecialty(value);
                                        if (value !== 'Khác') {
                                            setProfileFormData(prev => ({ ...prev, specialty: value }));
                                        }
                                    }}
                                    required
                                >
                                    <option value="">-- Chọn chuyên khoa --</option>
                                    {SPECIALTIES.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                            {selectedSpecialty === 'Khác' && (
                                <div className="form-group">
                                    <label htmlFor="specialtyInput">Nhập chuyên khoa khác:</label>
                                    <input
                                        id="specialtyInput"
                                        type="text"
                                        name="specialty"
                                        value={profileFormData.specialty}
                                        placeholder="Nhập chuyên khoa khác"
                                        onChange={handleProfileInputChange}
                                        required
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label htmlFor="qualifications">Bằng cấp:</label>
                                <textarea
                                    id="qualifications"
                                    name="qualifications"
                                    value={profileFormData.qualifications}
                                    onChange={handleProfileInputChange}
                                    rows="3"
                                    placeholder="Ví dụ: Bác sĩ chuyên khoa II, Thạc sĩ Y khoa"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="maxAppointmentsPerDay">Số lịch/ngày:</label>
                                <input
                                    id="maxAppointmentsPerDay"
                                    type="number"
                                    name="maxAppointmentsPerDay"
                                    value={profileFormData.maxAppointmentsPerDay}
                                    onChange={handleProfileInputChange}
                                    min="1"
                                    max="50"
                                    required
                                />
                            </div>
                            <div className="form-buttons">
                                <button type="submit" disabled={loading}>
                                    {loading ? 'Đang tạo...' : 'Tạo hồ sơ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="profile-section profile-section--basic">
                <div className="profile-section__header">
                    <div>
                        <h2>Thông tin bác sĩ</h2>
                    </div>
                    {!isEditing && !showPasswordPopup && !showProfilePopup && (
                        <div className="profile-actions">
                            <button className="edit-button" onClick={() => setIsEditing(true)}>
                                chỉnh sửa thông tin
                            </button>
                            <button className="change-password-button" onClick={() => setShowPasswordPopup(true)}>
                                Đổi mật khẩu
                            </button>
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-group">
                            <label>Họ và tên</label>
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
                            {error?.fullName && <div className="error-message">{error.fullName}</div>}
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" name="email" value={formData.email} disabled />
                        </div>
                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
                            {error?.phone && <div className="error-message">{error.phone}</div>}
                        </div>
                        <div className="form-group">
                            <label>Địa chỉ</label>
                            <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
                            {error?.address && <div className="error-message">{error.address}</div>}
                        </div>
                        <div className="form-group">
                            <label>Ngày sinh</label>
                            <input type="date" name="birthday" value={formData.birthday} onChange={handleInputChange} />
                            {error?.birthday && <div className="error-message">{error.birthday}</div>}
                        </div>
                        <div className="form-group">
                            <label>Giới tính</label>
                            <select name="gender" value={formData.gender} onChange={handleInputChange}>
                                <option value="">Chọn giới tính</option>
                                <option value="Male">Nam</option>
                                <option value="Female">Nữ</option>
                                <option value="Other">Khác</option>
                            </select>
                            {error?.gender && <div className="error-message">{error.gender}</div>}
                        </div>
                        <div className="form-group">
                            <label>Ẩn danh</label>
                            <input
                                type="checkbox"
                                name="isAnonymous"
                                checked={formData.isAnonymous}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Chuyên khoa</label>
                            <input type="text" name="specialty" value={formData.specialty} onChange={handleInputChange} />
                            {error?.specialty && <div className="error-message">{error.specialty}</div>}
                        </div>
                        <div className="form-group">
                            <label>Bằng cấp</label>
                            <input type="text" name="qualifications" value={formData.qualifications} onChange={handleInputChange} />
                            {error?.qualifications && <div className="error-message">{error.qualifications}</div>}
                        </div>
                        <div className="form-group">
                            <label>Số lịch/ngày</label>
                            <input type="number" name="maxAppointmentsPerDay" value={formData.maxAppointmentsPerDay} onChange={handleInputChange} min="1" />
                            {error?.maxAppointmentsPerDay && <div className="error-message">{error.maxAppointmentsPerDay}</div>}
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="save-button" disabled={loading}>
                                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                            <button type="button" className="cancel-button" onClick={() => { setIsEditing(false); fetchDoctorData(); }}>
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
                                {loading ? 'Đang lưu...' : 'Cập nhật mật khẩu'}
                            </button>
                            <button type="button" className="cancel-button" onClick={() => setShowPasswordPopup(false)}>
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
                            <div className="profile-label">Ngày sinh</div>
                            <div className="profile-value">{user?.birthday ? new Date(user.birthday).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</div>
                        </div>
                        <div className="profile-row">
                            <div className="profile-label">Giới tính</div>
                            <div className="profile-value">{user?.gender === 'Male' ? 'Nam' : user?.gender === 'Female' ? 'Nữ' : user?.gender === 'Other' ? 'Khác' : 'Chưa cập nhật'}</div>
                        </div>
                        <div className="profile-row">
                            <div className="profile-label">Ẩn danh</div>
                            <div className="profile-value">{user?.anonymous === true ? 'Có' : user?.anonymous === false ? 'Không' : 'Chưa cập nhật'}</div>
                        </div>
                        <div className="profile-row">
                            <div className="profile-label">Chuyên khoa</div>
                            <div className="profile-value">{user?.specialty || 'Chưa cập nhật'}</div>
                        </div>
                        <div className="profile-row">
                            <div className="profile-label">Bằng cấp</div>
                            <div className="profile-value">{user?.qualifications || 'Chưa cập nhật'}</div>
                        </div>
                        <div className="profile-row">
                            <div className="profile-label">Số lịch/ngày</div>
                            <div className="profile-value">{user?.maxAppointmentsPerDay !== undefined && user?.maxAppointmentsPerDay !== null ? user.maxAppointmentsPerDay : 'Chưa cập nhật'}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileContent;