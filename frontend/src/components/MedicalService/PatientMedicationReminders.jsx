import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import PatientMedicationSchedule from './PatientMedicationSchedule';
import './Medication.scss';

const PatientMedicationReminders = forwardRef((props, ref) => {
    const [treatmentPlans, setTreatmentPlans] = useState([]);
    const [medicationReminders, setMedicationReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('create'); // 'create' hoặc 'view'

    // Fetch treatment plans for creating new reminders
    const fetchTreatmentPlans = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8080/api/patients/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const patientId = res.data?.id;
            if (!patientId) {
                throw new Error('Không thể xác định bệnh nhân.');
            }
            
            const planRes = await axios.get(`http://localhost:8080/api/patient-treatment-plans/patient/${patientId}/active`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTreatmentPlans(planRes.data || []);
        } catch (err) {
            console.error('Error fetching treatment plans:', err);
            setTreatmentPlans([]);
        }
    };

    // Fetch existing medication reminders
    const fetchMedicationReminders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8080/api/patients/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const patientId = res.data?.id;
            if (!patientId) {
                throw new Error('Không thể xác định bệnh nhân.');
            }

            // Sử dụng API chính: lấy nhắc nhở uống thuốc
            const reminderRes = await axios.get(`http://localhost:8080/api/treatment-reminders/patient/${patientId}/type/MEDICATION`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMedicationReminders(reminderRes.data || []);
        } catch (err) {
            console.error('Error fetching medication reminders:', err);
            setMedicationReminders([]);
        }
    };

    // Fetch all data
    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all([
                fetchTreatmentPlans(),
                fetchMedicationReminders()
            ]);
        } catch (err) {
            setError('Không thể tải dữ liệu.');
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch data on mount
    useEffect(() => {
        fetchAllData();
    }, []);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        fetchReminders: fetchAllData,
        fetchData: fetchAllData
    }));

    // Mark reminder as completed
    const markAsCompleted = async (reminderId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/treatment-reminders/${reminderId}/complete`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Refresh reminders after marking as completed
            await fetchMedicationReminders();
        } catch (err) {
            console.error('Error marking reminder as completed:', err);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status badge style
    const getStatusBadge = (status) => {
        const statusMap = {
            'PENDING': { text: 'Chờ', color: '#ffc107', bgColor: '#fff3cd' },
            'SENT': { text: 'Đã gửi', color: '#17a2b8', bgColor: '#d1ecf1' },
            'COMPLETED': { text: 'Hoàn thành', color: '#28a745', bgColor: '#d4edda' },
            'MISSED': { text: 'Bỏ lỡ', color: '#dc3545', bgColor: '#f8d7da' }
        };
        
        const statusInfo = statusMap[status] || { text: status, color: '#6c757d', bgColor: '#f8f9fa' };
        
        return (
            <span style={{
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500',
                color: statusInfo.color,
                backgroundColor: statusInfo.bgColor,
                border: `1px solid ${statusInfo.color}20`
            }}>
                {statusInfo.text}
            </span>
        );
    };

    return (
        <div className="medication-reminders">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>🔔 Nhắc nhở uống thuốc</h2>
            </div>

            {/* Tab Navigation */}
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #dee2e6' }}>
                <div style={{ display: 'flex', gap: '0' }}>
                    <button
                        onClick={() => setActiveTab('create')}
                        style={{
                            padding: '12px 24px',
                            border: 'none',
                            borderBottom: activeTab === 'create' ? '2px solid #007bff' : '2px solid transparent',
                            background: activeTab === 'create' ? '#f8f9fa' : 'transparent',
                            color: activeTab === 'create' ? '#007bff' : '#6c757d',
                            cursor: 'pointer',
                            fontWeight: activeTab === 'create' ? '600' : '400',
                            transition: 'all 0.2s'
                        }}
                    >
                        📝 Tạo nhắc nhở mới
                    </button>
                    <button
                        onClick={() => setActiveTab('view')}
                        style={{
                            padding: '12px 24px',
                            border: 'none',
                            borderBottom: activeTab === 'view' ? '2px solid #007bff' : '2px solid transparent',
                            background: activeTab === 'view' ? '#f8f9fa' : 'transparent',
                            color: activeTab === 'view' ? '#007bff' : '#6c757d',
                            cursor: 'pointer',
                            fontWeight: activeTab === 'view' ? '600' : '400',
                            transition: 'all 0.2s'
                        }}
                    >
                        📋 Danh sách nhắc nhở ({medicationReminders.length})
                    </button>
                </div>
            </div>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <div>🔄 Đang tải dữ liệu...</div>
                    </div>
                ) : error ? (
                    <div style={{ padding: '20px', background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '8px', color: '#856404' }}>
                        ⚠️ {error}
                    </div>
                ) : (
                    <>
                        {/* Tab Content */}
                        {activeTab === 'create' && (
                            <>
                                <div style={{ marginBottom: '20px', padding: '16px', background: '#e3f2fd', borderRadius: '8px', borderLeft: '4px solid #2196f3' }}>
                                    <h4 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>💡 Hướng dẫn sử dụng</h4>
                                    <p style={{ margin: 0, color: '#333', fontSize: '14px' }}>
                                        Tại đây bạn có thể tạo lịch nhắc nhở uống thuốc từ các đơn thuốc trong kế hoạch điều trị của mình.
                                        Chọn thuốc và thời gian uống, hệ thống sẽ tự động tạo nhắc nhở dựa vào thời gian điều trị.
                                    </p>
                                </div>

                                {treatmentPlans.length === 0 ? (
                                    <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                                        <p>Bạn chưa có kế hoạch điều trị nào.</p>
                                        <p style={{ fontSize: '14px' }}>Vui lòng liên hệ bác sĩ để được tạo kế hoạch điều trị.</p>
                                    </div>
                                ) : (
                                    <div>
                                        {/* Hiển thị một section duy nhất với tất cả treatment plans */}
                                        <PatientMedicationSchedule 
                                            treatmentPlan={treatmentPlans[0]} // Chỉ hiển thị treatment plan đầu tiên
                                            onReminderCreated={fetchMedicationReminders}
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'view' && (
                            <>
                                <div style={{ marginBottom: '20px', padding: '16px', background: '#e8f5e8', borderRadius: '8px', borderLeft: '4px solid #28a745' }}>
                                    <h4 style={{ margin: '0 0 8px 0', color: '#155724' }}>📋 Danh sách nhắc nhở</h4>
                                    <p style={{ margin: 0, color: '#333', fontSize: '14px' }}>
                                        Xem tất cả nhắc nhở uống thuốc của bạn được sắp xếp theo thời gian uống (từ sớm nhất đến muộn nhất). 
                                        Bạn có thể đánh dấu hoàn thành khi đã uống thuốc.
                                    </p>
                                </div>

                                {medicationReminders.length === 0 ? (
                                    <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
                                        <p>Bạn chưa có nhắc nhở uống thuốc nào.</p>
                                        <p style={{ fontSize: '14px' }}>Hãy chuyển sang tab "Tạo nhắc nhở mới" để tạo nhắc nhở từ đơn thuốc của bạn.</p>
                                    </div>
                                ) : (
                                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                        {medicationReminders
                                            .sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate)) // Sắp xếp theo ngày uống từ sớm nhất đến muộn nhất
                                            .map((reminder, index) => (
                                            <div key={reminder.id || index} style={{
                                                border: '1px solid #dee2e6',
                                                borderRadius: '8px',
                                                padding: '16px',
                                                marginBottom: '12px',
                                                background: reminder.status === 'COMPLETED' ? '#f8f9fa' : '#fff'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                    <div>
                                                        <h5 style={{ margin: '0 0 4px 0', color: '#333' }}>
                                                            💊 {reminder.medicationName || 'Thuốc điều trị'}
                                                        </h5>
                                                        <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
                                                            🕐 {formatDate(reminder.reminderDate)}
                                                        </p>
                                                        {reminder.message && (
                                                            <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                                                                📝 {reminder.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        {getStatusBadge(reminder.status)}
                                                        {reminder.status === 'SENT' && (
                                                            <button
                                                                onClick={() => markAsCompleted(reminder.id)}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    background: '#28a745',
                                                                    color: 'white',
                                                                    fontSize: '12px',
                                                                    cursor: 'pointer',
                                                                    transition: 'background 0.2s'
                                                                }}
                                                                onMouseOver={(e) => e.target.style.background = '#218838'}
                                                                onMouseOut={(e) => e.target.style.background = '#28a745'}
                                                            >
                                                                ✓ Đã uống
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {reminder.dosage && (
                                                    <div style={{ padding: '8px 12px', background: '#f8f9fa', borderRadius: '4px', fontSize: '14px' }}>
                                                        <strong>Liều dùng:</strong> {reminder.dosage}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
});

export default PatientMedicationReminders;