import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCalendarCheck, FaPills, FaRegClock } from 'react-icons/fa';
import Button from '../Common/Button';
import './Medication.scss';

const PatientTreatmentPlans = () => {
    const [treatmentPlans, setTreatmentPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMedications, setModalMedications] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState(null);
    const [modalPlan, setModalPlan] = useState(null);
    const [doctorMap, setDoctorMap] = useState({});
    const [arvProtocolMap, setArvProtocolMap] = useState({});
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [modalSchedules, setModalSchedules] = useState([]);
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [scheduleError, setScheduleError] = useState(null);

    // Fetch data function
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8080/api/patients/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const patientId = res.data?.id;
            if (!patientId) {
                setError('Không thể xác định bệnh nhân.');
                setLoading(false);
                return;
            }
            const doctorRes = await axios.get('http://localhost:8080/api/doctors', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const doctorMapObj = {};
            (doctorRes.data || []).forEach(d => { doctorMapObj[d.id] = d.fullName; });
            setDoctorMap(doctorMapObj);
            const arvRes = await axios.get('http://localhost:8080/api/arv-protocol/active', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const arvMapObj = {};
            (arvRes.data || []).forEach(p => { arvMapObj[p.id] = p.name; });
            setArvProtocolMap(arvMapObj);
            const planRes = await axios.get(`http://localhost:8080/api/patient-treatment-plans/patient/${patientId}/active`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTreatmentPlans(planRes.data || []);
        } catch (err) {
            setError('Không thể tải dữ liệu.');
            setTreatmentPlans([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle showing medications
    const handleShowMedications = async (plan) => {
        setShowModal(true);
        setModalPlan(plan);
        setModalLoading(true);
        setModalError(null);
        setModalMedications([]);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8080/api/prescriptions/treatment-plan/${plan.id}/medications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setModalMedications(res.data || []);
        } catch (err) {
            setModalError('Không thể tải thông tin thuốc.');
        } finally {
            setModalLoading(false);
        }
    };

    const handleShowSchedules = async (plan) => {
        setShowScheduleModal(true);
        setModalPlan(plan);
        setScheduleLoading(true);
        setScheduleError(null);
        setModalSchedules([]);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8080/api/medication-schedules/treatment-plan/${plan.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setModalSchedules(res.data || []);
        } catch (err) {
            setScheduleError('Không thể tải lịch uống thuốc.');
        } finally {
            setScheduleLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalPlan(null);
        setModalMedications([]);
    };

    const handleCloseScheduleModal = () => {
        setShowScheduleModal(false);
        setModalPlan(null);
        setModalSchedules([]);
    };

    // Auto-fetch data on mount
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="treatment-plan-list">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>📋 Kế hoạch điều trị của tôi</h2>
            </div>

            {/* Treatment Plans Content */}
            <div className="tab-content">
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '8px' }}>
                        <div>🔄 Đang tải dữ liệu...</div>
                    </div>
                ) : error ? (
                    <div className="error-message" style={{ padding: '20px', background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '8px', color: '#856404' }}>
                        ⚠️ {error}
                    </div>
                ) : !Array.isArray(treatmentPlans) ? (
                    <div className="error-message" style={{ padding: '20px', background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '8px', color: '#721c24' }}>
                        ❌ Dữ liệu trả về không phải mảng!
                    </div>
                ) : treatmentPlans.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                        📋 Không có kế hoạch điều trị nào đang hoạt động.
                        <br/>
                        <small style={{ color: '#6c757d', marginTop: '8px', display: 'block' }}>Vui lòng liên hệ bác sĩ để thiết lập kế hoạch điều trị.</small>
                    </div>
                ) : (
                    treatmentPlans.map(plan => (
                        <div className="treatment-plan-card" key={plan.id} style={{ background: '#fff', padding: '20px', marginBottom: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <div className="plan-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div className="plan-dates">
                                    <span className="plan-date" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '500' }}>
                                        <FaCalendarCheck /> {plan.startDate}
                                    </span>
                                    {plan.endDate && <span className="plan-date"> → {plan.endDate}</span>}
                                </div>
                                <div className="plan-actions" style={{ display: 'flex', gap: '12px' }}>
                                    <div className="plan-icon" onClick={() => handleShowMedications(plan)} title="Xem danh sách thuốc" style={{ cursor: 'pointer', padding: '8px', background: '#e3f2fd', borderRadius: '6px', color: '#1976d2' }}>
                                        <FaPills />
                                    </div>
                                    <div className="plan-icon" onClick={() => handleShowSchedules(plan)} title="Xem lịch uống thuốc" style={{ cursor: 'pointer', padding: '8px', background: '#f3e5f5', borderRadius: '6px', color: '#7b1fa2' }}>
                                        <FaRegClock />
                                    </div>
                                </div>
                            </div>
                            <div className="plan-details">
                                <table className="plan-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <tbody>
                                        <tr>
                                            <td className="plan-label" style={{ padding: '8px', fontWeight: '500', color: '#666', width: '150px' }}>Phác đồ ARV:</td>
                                            <td className="plan-value" style={{ padding: '8px' }}>{plan.arvProtocolName || arvProtocolMap[plan.arvProtocolId] || plan.arvProtocolId}</td>
                                            <td className="plan-label" style={{ padding: '8px', fontWeight: '500', color: '#666', width: '150px' }}>Thời gian điều trị:</td>
                                            <td className="plan-value" style={{ padding: '8px' }}>{plan.startDate} - {plan.endDate || '...'}</td>
                                        </tr>
                                        <tr>
                                            <td className="plan-label" style={{ padding: '8px', fontWeight: '500', color: '#666' }}>Bác sĩ điều trị:</td>
                                            <td className="plan-value" style={{ padding: '8px' }}>{plan.doctorName || doctorMap[plan.doctorId] || plan.doctorId}</td>
                                            <td className="plan-label" style={{ padding: '8px', fontWeight: '500', color: '#666' }}>Trạng thái:</td>
                                            <td className="plan-value" style={{ padding: '8px' }}>
                                                <span style={{ background: '#d4edda', color: '#155724', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                                                    Đang hoạt động
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="plan-label" style={{ padding: '8px', fontWeight: '500', color: '#666' }}>Ghi chú:</td>
                                            <td className="plan-value" style={{ padding: '8px' }} colSpan="3">{plan.notes || 'Không có ghi chú'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal hiển thị danh sách thuốc */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ minWidth: 600, maxWidth: '90vw', background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', maxHeight: '80vh', overflow: 'auto' }}>
                        <h3 style={{ marginBottom: 16, color: '#333' }}>💊 Danh sách thuốc của phác đồ</h3>
                        {modalLoading ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>🔄 Đang tải...</div>
                        ) : modalError ? (
                            <div className="error-message" style={{ padding: '20px', background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '8px', color: '#856404' }}>⚠️ {modalError}</div>
                        ) : modalMedications.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                                📋 Không có thuốc nào cho phác đồ này.<br />
                                <span style={{ color: '#888', fontSize: 13 }}>Có thể bác sĩ chưa kê đơn thuốc cho kế hoạch điều trị này.</span>
                            </div>
                        ) : (
                            <div style={{ overflow: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #dee2e6' }}>
                                    <thead>
                                        <tr style={{ background: '#f8f9fa' }}>
                                            <th style={{ textAlign: 'left', padding: 12, border: '1px solid #dee2e6', fontWeight: '600' }}>Tên thuốc</th>
                                            <th style={{ textAlign: 'left', padding: 12, border: '1px solid #dee2e6', fontWeight: '600' }}>Liều dùng</th>
                                            <th style={{ textAlign: 'left', padding: 12, border: '1px solid #dee2e6', fontWeight: '600' }}>Tần suất</th>
                                            <th style={{ textAlign: 'left', padding: 12, border: '1px solid #dee2e6', fontWeight: '600' }}>Số ngày</th>
                                            <th style={{ textAlign: 'left', padding: 12, border: '1px solid #dee2e6', fontWeight: '600' }}>Ghi chú</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {modalMedications.map((med, idx) => (
                                            <tr key={idx}>
                                                <td style={{ padding: 12, border: '1px solid #dee2e6' }}>{med.name || med.medicationName || 'N/A'}</td>
                                                <td style={{ padding: 12, border: '1px solid #dee2e6' }}>{med.dosage || 'N/A'}</td>
                                                <td style={{ padding: 12, border: '1px solid #dee2e6' }}>{med.frequency || 'N/A'}</td>
                                                <td style={{ padding: 12, border: '1px solid #dee2e6' }}>{med.durationDays || 'N/A'}</td>
                                                <td style={{ padding: 12, border: '1px solid #dee2e6' }}>{med.notes || 'Không có'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div style={{ textAlign: 'right', marginTop: 24 }}>
                            <Button variant="primary" onClick={handleCloseModal}>Đóng</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal hiển thị lịch uống thuốc */}
            {showScheduleModal && (
                <div className="modal-overlay" onClick={handleCloseScheduleModal} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ minWidth: 800, maxWidth: '90vw', background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', maxHeight: '80vh', overflow: 'auto' }}>
                        <h3 style={{ marginBottom: 16, color: '#333' }}>⏰ Lịch uống thuốc của phác đồ</h3>
                        {scheduleLoading ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>🔄 Đang tải...</div>
                        ) : scheduleError ? (
                            <div className="error-message" style={{ padding: '20px', background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '8px', color: '#856404' }}>⚠️ {scheduleError}</div>
                        ) : modalSchedules.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>📋 Không có lịch uống thuốc nào cho phác đồ này.</div>
                        ) : (
                            <div style={{ overflow: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #dee2e6' }}>
                                    <thead>
                                        <tr style={{ background: '#f8f9fa' }}>
                                            <th style={{ textAlign: 'left', padding: 12, border: '1px solid #dee2e6', fontWeight: '600' }}>Tên thuốc</th>
                                            <th style={{ textAlign: 'left', padding: 12, border: '1px solid #dee2e6', fontWeight: '600' }}>Liều dùng</th>
                                            <th style={{ textAlign: 'left', padding: 12, border: '1px solid #dee2e6', fontWeight: '600' }}>Tần suất</th>
                                            <th style={{ textAlign: 'left', padding: 12, border: '1px solid #dee2e6', fontWeight: '600' }}>Thời điểm uống</th>
                                            <th style={{ textAlign: 'left', padding: 12, border: '1px solid #dee2e6', fontWeight: '600' }}>Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {modalSchedules.map((sch, idx) => (
                                            <tr key={idx}>
                                                <td style={{ padding: 12, border: '1px solid #dee2e6' }}>{sch.medicationName}</td>
                                                <td style={{ padding: 12, border: '1px solid #dee2e6' }}>{sch.dosage}</td>
                                                <td style={{ padding: 12, border: '1px solid #dee2e6' }}>{sch.frequency}</td>
                                                <td style={{ padding: 12, border: '1px solid #dee2e6' }}>{sch.timeOfDay}</td>
                                                <td style={{ padding: 12, border: '1px solid #dee2e6', textAlign: 'center' }}>
                                                    {sch.reminderId ? (
                                                        <span style={{ background: '#d4edda', color: '#155724', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                                                            Đã có nhắc nhở
                                                        </span>
                                                    ) : (
                                                        <span style={{ background: '#f8d7da', color: '#721c24', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                                                            Chưa có nhắc nhở
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div style={{ textAlign: 'right', marginTop: 24 }}>
                            <Button variant="primary" onClick={handleCloseScheduleModal}>Đóng</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientTreatmentPlans;
