import React, { useState, useEffect } from 'react';
import './DoctorForm.scss';

const SPECIALTIES = [
    'Truyền nhiễm',
    'Miễn dịch',
    'Tổng quát',
    'Nhi khoa',
    'Khác'
];

const getInitialFormData = (data = {}) => ({
    email: data?.email || '',
    password: data?.password || '',
    fullName: data?.fullName || '',
    phoneNumber: data?.phoneNumber || '',
    address: data?.address || '',
    birthday: data?.birthday || '',
    gender: data?.gender || ''
});

const DoctorForm = ({ data, onChange, onSubmit, onCancel, editing, error }) => {
    const [formData, setFormData] = useState(getInitialFormData(data));
    const [selectedSpecialty, setSelectedSpecialty] = useState(
        SPECIALTIES.includes(data?.specialty) ? data.specialty : 'Khác'
    );
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState(null);

    useEffect(() => {
        const initialData = getInitialFormData(data);
        setFormData(initialData);
        setSelectedSpecialty(
            SPECIALTIES.includes(initialData.specialty) ? initialData.specialty : 'Khác'
        );
    }, [data]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updated = { ...formData, [name]: value };
        setFormData(updated);
        if (onChange) onChange(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setErrMsg(null);
        try {
            onSubmit(formData);
        } catch (err) {
            setErrMsg('Lỗi khi gửi dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-overlay">
            <div className="form-container">
                <h2>{editing ? 'Sửa thông tin bác sĩ' : 'Thêm bác sĩ mới'}</h2>
                {(error || errMsg) && <div className="error-message">{error || errMsg}</div>}
                <form onSubmit={handleSubmit}>
                    {!editing && (
                        <>
                            <div className="form-group">
                                <label htmlFor="email">Email:</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
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
                                    value={formData.password}
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
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phoneNumber">Số điện thoại:</label>
                        <input
                            id="phoneNumber"
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber}
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
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="birthday">Ngày sinh:</label>
                        <input
                            id="birthday"
                            type="date"
                            name="birthday"
                            value={formData.birthday}
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
                            value={formData.gender}
                            onChange={handleChange}
                            required
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

export default DoctorForm;
