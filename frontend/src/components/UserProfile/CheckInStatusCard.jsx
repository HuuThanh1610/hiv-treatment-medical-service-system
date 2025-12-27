import React from 'react';
import './CheckInStatusCard.scss';

const CheckInStatusCard = ({ appointment, onCheckIn, isCheckingIn }) => {
    if (!appointment || appointment.status !== 'CONFIRMED') {
        return null;
    }

    const today = new Date();
    const appointmentDate = new Date(appointment.appointmentDate);
    const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
    const currentTime = new Date();
    
    // Thời gian cho phép check-in (30 phút trước đến 1 giờ sau)
    const earliestCheckInTime = new Date(appointmentDateTime.getTime() - 30 * 60 * 1000);
    const latestCheckInTime = new Date(appointmentDateTime.getTime() + 60 * 60 * 1000);
    
    const isToday = appointment.appointmentDate === today.toISOString().split('T')[0];
    const canCheckIn = isToday && currentTime >= earliestCheckInTime && currentTime <= latestCheckInTime;
    const isTooEarly = isToday && currentTime < earliestCheckInTime;
    const isTooLate = isToday && currentTime > latestCheckInTime;
    const isNotToday = !isToday;

    const formatTime = (date) => {
        return date.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusMessage = () => {
        if (isNotToday) {
            if (appointmentDate < today) {
                return {
                    type: 'error',
                    message: 'Lịch hẹn đã quá hạn',
                    detail: 'Không thể check-in cho lịch hẹn đã qua'
                };
            } else {
                return {
                    type: 'info',
                    message: 'Chưa đến ngày hẹn',
                    detail: `Lịch hẹn vào ${formatDate(appointmentDate)}`
                };
            }
        }

        if (isTooEarly) {
            return {
                type: 'warning',
                message: 'Chưa đến thời gian check-in',
                detail: `Có thể check-in từ ${formatTime(earliestCheckInTime)}`
            };
        }

        if (isTooLate) {
            return {
                type: 'error',
                message: 'Đã quá thời gian check-in',
                detail: `Thời gian check-in kết thúc lúc ${formatTime(latestCheckInTime)}`
            };
        }

        if (canCheckIn) {
            return {
                type: 'success',
                message: 'Có thể check-in ngay bây giờ',
                detail: `Thời gian check-in: ${formatTime(earliestCheckInTime)} - ${formatTime(latestCheckInTime)}`
            };
        }
    };

    const status = getStatusMessage();

    return (
        <div className={`checkin-status-card ${status.type}`}>
            <div className="checkin-status-header">
                <div className="appointment-info">
                    <h4>{appointment.doctorName}</h4>
                    <p>{appointment.medicalServiceName}</p>
                    <p className="appointment-time">
                        {formatDate(appointmentDateTime)} lúc {appointment.appointmentTime}
                    </p>
                </div>
                <div className={`status-indicator ${status.type}`}>
                    {status.type === 'success' && '✓'}
                    {status.type === 'warning' && '⏰'}
                    {status.type === 'error' && '✕'}
                    {status.type === 'info' && 'ℹ'}
                </div>
            </div>
            
            <div className="checkin-status-body">
                <div className={`status-message ${status.type}`}>
                    <strong>{status.message}</strong>
                    <p>{status.detail}</p>
                </div>
                
                {canCheckIn && (
                    <button 
                        className="checkin-action-button"
                        onClick={() => onCheckIn(appointment.id, appointment.appointmentDate, appointment.appointmentTime)}
                        disabled={isCheckingIn}
                        title="Click để check-in ngay lập tức"
                    >
                        {isCheckingIn ? (
                            <>
                                <span className="spinner-small"></span>
                                Đang check-in...
                            </>
                        ) : (
                            <>
                                ✓ Check-in ngay
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default CheckInStatusCard;
