import React, { useState, useImperativeHandle, forwardRef } from 'react';
import axios from 'axios';


const UserReminders = forwardRef((props, ref) => {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [patientId, setPatientId] = useState(null);

    const fetchReminders = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const userRes = await axios.get('http://localhost:8080/api/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const id = userRes.data.id;
            setPatientId(id);
            // Lấy nhắc nhở có trạng thái SENT
            const res = await axios.get(`http://localhost:8080/api/treatment-reminders/patient/${id}/status/SENT`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReminders(res.data);
        } catch (err) {
            setError('Không thể tải nhắc nhở uống thuốc.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        fetchReminders
    }));

    const handleComplete = async (reminderId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/treatment-reminders/${reminderId}/complete`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReminders(reminders.map(r => r.id === reminderId ? { ...r, status: 'Completed' } : r));
        } catch (err) {
            console.error('Đánh dấu thất bại:', err);
        }
    };

    const handleMiss = async (reminderId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/treatment-reminders/${reminderId}/miss`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReminders(reminders.map(r => r.id === reminderId ? { ...r, status: 'Missed' } : r));
        } catch (err) {
            console.error('Đánh dấu thất bại:', err);
        }
    };

    if (loading) return <div>Đang tải nhắc nhở...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="user-reminders">
            <h2>Nhắc nhở uống thuốc</h2>
            {reminders.length === 0 ? (
                <div>Không có nhắc nhở nào.</div>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Thời gian</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reminders.map(reminder => (
                            <tr key={reminder.id}>
                                <td>{new Date(reminder.reminderDate).toLocaleString()}</td>
                                <td>{reminder.status}</td>
                                <td>
                                    {reminder.status === 'Pending' && (
                                        <>
                                            <button onClick={() => handleComplete(reminder.id)}>Đã uống</button>
                                            <button onClick={() => handleMiss(reminder.id)} style={{ marginLeft: 8 }}>Bỏ lỡ</button>
                                        </>
                                    )}
                                    {reminder.status !== 'Pending' && <span>--</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
});

export default UserReminders;