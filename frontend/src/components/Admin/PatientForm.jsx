import React, { useState, useEffect } from 'react';
import './PatientForm.scss';

const getInitialFormData = (data = {}) => ({
    id: data?.id || '',
    email: data?.email || '',
    password: data?.password || '',
    fullName: data?.fullName || '',
    phoneNumber: data?.phoneNumber || '',
    isAnonymous: data?.isAnonymous ?? false,
    roleName: data?.roleName || 'PATIENT',
    birthday: data?.birthday || '',
    gender: data?.gender || '',
    address: data?.address || '',
    active: data?.active ?? true
});

const PatientForm = ({ data, onSubmit, onCancel, editing }) => {
    const [formData, setFormData] = useState(getInitialFormData(data));
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFormData(getInitialFormData(data));
    }, [data]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData((prev) => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editing && !formData.id) {
            setError('Không tìm thấy ID người dùng');
            return;
        }
        setLoading(true);
        try {
            onSubmit({ ...formData, roleName: 'PATIENT' });
        } catch (err) {
            setError('Lỗi khi gửi dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-overlay">
            <div className="form-container">
                <h2>{editing ? 'Sửa thông tin người dùng' : 'Thêm người dùng mới'}</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input type="hidden" name="id" value={formData.id || ''} />
                    {!editing && (
                        <>
                            <div className="form-group">
                                <label htmlFor="email">Email:</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Mật khẩu:</label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={formData.password || ''}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </>
                    )}
                    <div className="form-group">
                        <label htmlFor="fullName">Họ tên:</label>
                        <input
                            id="fullName"
                            type="text"
                            name="fullName"
                            value={formData.fullName || ''}
                            onChange={handleChange}
                            required
                            minLength={3}
                            maxLength={100}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phoneNumber">Số điện thoại:</label>
                        <input
                            id="phoneNumber"
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber || ''}
                            onChange={handleChange}
                            required
                            pattern="[0-9]{9,15}"
                            title="Số điện thoại phải từ 9-15 số"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="address">Địa chỉ:</label>
                        <input
                            id="address"
                            type="text"
                            name="address"
                            value={formData.address || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="isAnonymous">Ẩn danh:</label>
                        <input
                            id="isAnonymous"
                            type="checkbox"
                            name="isAnonymous"
                            checked={formData.isAnonymous}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="birthday">Ngày sinh:</label>
                        <input
                            id="birthday"
                            type="date"
                            name="birthday"
                            value={formData.birthday || ''}
                            onChange={handleChange}
                            required
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="gender">Giới tính:</label>
                        <select
                            id="gender"
                            name="gender"
                            value={formData.gender || ''}
                            onChange={handleChange}
                        >
                            <option value="">-- Chọn --</option>
                            <option value="Male">Nam</option>
                            <option value="Female">Nữ</option>
                        </select>
                    </div>
                    <div className="form-buttons">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Đang cập nhật...' : editing ? 'Cập nhật' : 'Thêm'}
                        </button>
                        <button type="button" onClick={onCancel} disabled={loading}>
                            Huỷ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatientForm;