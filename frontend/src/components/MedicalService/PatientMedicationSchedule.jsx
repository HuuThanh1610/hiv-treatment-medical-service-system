import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../Common/Button';
import './PatientMedicationSchedule.scss';

const PatientMedicationSchedule = ({ treatmentPlan, onReminderCreated }) => {
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedMedication, setSelectedMedication] = useState(null);
    const [scheduleForm, setScheduleForm] = useState({
        timeOfDay: '',
        selectedTimes: ['08:00'] // Array of time strings
    });
    const [createLoading, setCreateLoading] = useState(false);
    const [success, setSuccess] = useState('');

    // Helper functions for time management
    const addTimeSlot = () => {
        setScheduleForm(prev => {
            const currentTimes = prev.selectedTimes || [];
            const newTimes = [...currentTimes, '12:00'];
            return {
                ...prev,
                selectedTimes: newTimes,
                timeOfDay: newTimes.join(',')
            };
        });
    };

    const removeTimeSlot = (index) => {
        setScheduleForm(prev => {
            const currentTimes = prev.selectedTimes || [];
            const newTimes = currentTimes.filter((_, i) => i !== index);
            return {
                ...prev,
                selectedTimes: newTimes,
                timeOfDay: newTimes.join(',')
            };
        });
    };

    const updateTimeSlot = (index, newTime) => {
        setScheduleForm(prev => {
            const currentTimes = prev.selectedTimes || [];
            const newTimes = [...currentTimes];
            newTimes[index] = newTime;
            return {
                ...prev,
                selectedTimes: newTimes,
                timeOfDay: newTimes.join(',')
            };
        });
    };

    useEffect(() => {
        if (treatmentPlan?.id) {
            fetchPrescriptionMedications();
        }
    }, [treatmentPlan]);

    const fetchPrescriptionMedications = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:8080/api/prescriptions/treatment-plan/${treatmentPlan.id}/medications`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setMedications(response.data || []);
        } catch (err) {
            setError('Không thể tải danh sách thuốc');
            console.error('Error fetching medications:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSchedule = (medication) => {
        setSelectedMedication(medication);
        setShowScheduleModal(true);
        setScheduleForm({ 
            timeOfDay: '08:00',
            selectedTimes: ['08:00']
        });
        setSuccess('');
        setError(null);
    };

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:8080/api/medication-schedules/from-prescription',
                {
                    treatmentPlanId: treatmentPlan?.id,
                    medicationId: selectedMedication.medicationId,
                    timeOfDay: scheduleForm.timeOfDay
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            setSuccess('Đã tạo nhắc nhở uống thuốc thành công!');
            setShowScheduleModal(false);
            setSelectedMedication(null);
            setScheduleForm({ 
                timeOfDay: '',
                selectedTimes: ['08:00']
            });
            
            // Gọi callback để refresh danh sách nhắc nhở
            if (onReminderCreated) {
                onReminderCreated();
            }
        } catch (err) {
            setError('Không thể tạo nhắc nhở uống thuốc');
            console.error('Error creating schedule:', err);
        } finally {
            setCreateLoading(false);
        }
    };

    const formatTimeOfDay = (timeString) => {
        if (!timeString) return '';
        return timeString.split(',').map(time => time.trim()).join(', ');
    };

    if (loading) {
        return <div className="loading">Đang tải danh sách thuốc...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="patient-medication-schedule">
            <h3>Danh sách thuốc trong kế hoạch điều trị</h3>
            
            {success && (
                <div className="success-message">
                    {success}
                </div>
            )}

            {medications.length === 0 ? (
                <div className="no-medications">
                    Chưa có thuốc nào trong kế hoạch điều trị này.
                </div>
            ) : (
                <div className="medications-list">
                    {medications.map((medication, index) => (
                        <div key={`medication-${medication.medicationId || index}-${medication.medicationName || index}`} className="medication-card">
                            <div className="medication-info">
                                <h4>{medication.medicationName}</h4>
                                <p><strong>Liều dùng:</strong> {medication.dosage}</p>
                                <p><strong>Tần suất:</strong> {medication.frequency}</p>
                                <p><strong>Thời gian điều trị:</strong> {medication.durationDays} ngày</p>
                                {medication.notes && (
                                    <p><strong>Ghi chú:</strong> {medication.notes}</p>
                                )}
                            </div>
                            <div className="medication-actions">
                                <Button
                                    variant="primary"
                                    size="small"
                                    onClick={() => handleCreateSchedule(medication)}
                                    disabled={createLoading}
                                >
                                    Tạo nhắc nhở
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal tạo lịch nhắc nhở */}
            {showScheduleModal && selectedMedication && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Tạo lịch nhắc nhở uống thuốc</h3>
                        
                        <div className="selected-medication">
                            <h4>{selectedMedication.medicationName}</h4>
                            <p>Liều dùng: {selectedMedication.dosage}</p>
                            <p>Tần suất: {selectedMedication.frequency}</p>
                        </div>

                        <form onSubmit={handleScheduleSubmit}>
                            <div className="form-group">
                                <label>Thời gian nhắc nhở uống thuốc</label>
                                
                                {/* Quick preset options */}
                                <div className="preset-times">
                                    <button
                                        type="button"
                                        onClick={() => setScheduleForm({
                                            selectedTimes: ['08:00'],
                                            timeOfDay: '08:00'
                                        })}
                                        className="preset-btn"
                                    >
                                        🌅 Sáng (8:00)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setScheduleForm({
                                            selectedTimes: ['08:00', '20:00'],
                                            timeOfDay: '08:00,20:00'
                                        })}
                                        className="preset-btn"
                                    >
                                        🌅🌙 Sáng & Tối
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setScheduleForm({
                                            selectedTimes: ['08:00', '14:00', '20:00'],
                                            timeOfDay: '08:00,14:00,20:00'
                                        })}
                                        className="preset-btn"
                                    >
                                        ☀️ 3 lần/ngày
                                    </button>
                                </div>
                                
                                <div className="time-slots">
                                    {(scheduleForm.selectedTimes || []).map((time, index) => (
                                        <div key={`time-slot-${index}-${time}`} className="time-slot">
                                            <input
                                                type="time"
                                                value={time}
                                                onChange={(e) => updateTimeSlot(index, e.target.value)}
                                                className="time-input"
                                                required
                                            />
                                            {(scheduleForm.selectedTimes || []).length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTimeSlot(index)}
                                                    className="remove-time-btn"
                                                    title="Xóa thời gian này"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={addTimeSlot}
                                    className="add-time-btn"
                                    disabled={(scheduleForm.selectedTimes || []).length >= 4}
                                >
                                    ➕ Thêm thời gian khác
                                </button>

                                <small className="form-hint">
                                    Chọn tối đa 4 thời gian nhắc nhở trong ngày
                                </small>
                                
                                {scheduleForm.timeOfDay && (
                                    <div className="preview">
                                        <strong>Xem trước:</strong> {scheduleForm.timeOfDay}
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="error-message">
                                    {error}
                                </div>
                            )}

                            <div className="modal-actions">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowScheduleModal(false)}
                                    disabled={createLoading}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={createLoading}
                                    loading={createLoading}
                                >
                                    Tạo nhắc nhở
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientMedicationSchedule;
