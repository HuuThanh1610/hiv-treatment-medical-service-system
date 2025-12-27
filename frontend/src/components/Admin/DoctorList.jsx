import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DoctorList.scss';

const DoctorList = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/doctors')
            .then((response) => {
                setDoctors(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Lỗi khi tải danh sách bác sĩ:", error);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Đang tải dữ liệu...</p>;

    return (
        <div className="doctor-list">
            <h2>Danh sách bác sĩ</h2>
            <table>
                <thead>
                    <tr>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>Điện thoại</th>
                        <th>Chuyên khoa</th>
                        <th>Bằng cấp</th>
                        <th>Ca khám/ngày</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    {doctors.map((doctor) => (
                        <tr key={doctor.id}>
                            <td>{doctor.fullName}</td>
                            <td>{doctor.email}</td>
                            <td>{doctor.phone}</td>
                            <td>{doctor.specialty}</td>
                            <td>{doctor.qualifications}</td>
                            <td>{doctor.maxAppointments}</td>
                            <td>{doctor.status === 'ACTIVE' ? 'Đang làm việc' : 'Nghỉ phép'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DoctorList;
