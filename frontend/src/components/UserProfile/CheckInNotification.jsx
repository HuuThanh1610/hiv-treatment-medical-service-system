import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import CheckInStatusCard from './CheckInStatusCard';
import './CheckInNotification.scss';

const CheckInNotification = () => {
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [checkingInId, setCheckingInId] = useState(null);

    useEffect(() => {
        fetchUpcomingAppointments();
        // Refresh every 5 minutes
        const interval = setInterval(fetchUpcomingAppointments, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchUpcomingAppointments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get('http://localhost:8080/api/appointments/patient/me', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const today = new Date().toISOString().split('T')[0];
            const confirmedTodayAppointments = response.data.filter(appt => 
                appt.status === 'CONFIRMED' && appt.appointmentDate === today
            );

            setUpcomingAppointments(confirmedTodayAppointments);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (appointmentId, appointmentDate, appointmentTime) => {
        // Validation logic (tương tự như trong UserAppointmentTable)
        const today = new Date();
        const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
        const currentTime = new Date();
        
        const earliestCheckInTime = new Date(appointmentDateTime.getTime() - 30 * 60 * 1000);
        const latestCheckInTime = new Date(appointmentDateTime.getTime() + 60 * 60 * 1000);
        
        if (appointmentDate !== today.toISOString().split('T')[0]) {
            if (appointmentDateTime < today) {
                toast.error('Lịch hẹn đã quá hạn, không thể check-in.');
                return;
            } else {
                toast.error('Chưa đến ngày hẹn, không thể check-in trước thời gian.');
                return;
            }
        }
        
        if (currentTime < earliestCheckInTime) {
            const timeString = earliestCheckInTime.toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            toast.error(`Chưa đến thời gian check-in. Có thể check-in từ ${timeString} (30 phút trước giờ hẹn).`);
            return;
        }
        
        if (currentTime > latestCheckInTime) {
            const timeString = latestCheckInTime.toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            toast.error(`Đã quá thời gian check-in. Thời gian check-in kết thúc lúc ${timeString}.`);
            return;
        }

        // Thực hiện check-in trực tiếp
        setCheckingInId(appointmentId);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8080/api/appointments/${appointmentId}/checkin`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Check-in thành công! Bác sĩ đã được thông báo.');
            fetchUpcomingAppointments(); // Refresh list
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Check-in thất bại.';
            toast.error(errorMessage);
            console.error(err);
        } finally {
            setCheckingInId(null);
        }
    };

    if (loading || upcomingAppointments.length === 0) {
        return null;
    }

    return (
        <div className="checkin-notification-container">
            <div className="checkin-notification-header">
                <h3>📋 Lịch hẹn hôm nay</h3>
                <p>Bạn có {upcomingAppointments.length} lịch hẹn cần check-in hôm nay</p>
            </div>
            
            <div className="checkin-cards-container">
                {upcomingAppointments.map(appointment => (
                    <CheckInStatusCard
                        key={appointment.id}
                        appointment={appointment}
                        onCheckIn={handleCheckIn}
                        isCheckingIn={checkingInId === appointment.id}
                    />
                ))}
            </div>
        </div>
    );
};

export default CheckInNotification;
