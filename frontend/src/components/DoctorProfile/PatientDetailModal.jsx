import React, { useEffect, useState, useCallback } from 'react';
import { FaUser, FaCalendarAlt, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBirthdayCake, FaVenusMars, FaTimes, FaFlask, FaNotesMedical, FaEdit, FaTrash, FaBell, FaPlay, FaPause } from 'react-icons/fa';
import './PatientDetailModal.scss';
import axios from 'axios';
import PatientAddTreatmentPlan from './PatientAddTreatmentPlan';
import PatientEditTreatmentPlan from './PatientEditTreatmentPlan';
import PatientMedicalDeclaration from './PatientMedicalDeclaration';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

const PatientDetailModal = ({ patient, isOpen, onClose, onAddTreatmentPlan }) => {
    const [patientDetails, setPatientDetails] = useState(null);
    const [loadingPatientDetails, setLoadingPatientDetails] = useState(false);
    const [labResults, setLabResults] = useState([]);
    const [loadingLabResults, setLoadingLabResults] = useState(false);
    const [labResultMessage, setLabResultMessage] = useState(null);
    const [loadingMessage, setLoadingMessage] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    // 1. Thêm state lưu đánh giá cho từng labResult
    const [labResultMessages, setLabResultMessages] = useState({});
    const [loadingMessages, setLoadingMessages] = useState({});
    const [selectedTestType, setSelectedTestType] = useState('ALL');
    // Lấy danh sách loại xét nghiệm duy nhất từ labResults
    const testTypes = Array.from(new Set(labResults.map(item => item.testTypeName || item.testName))).filter(Boolean);
    const [activePlans, setActivePlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(false);
    const [arvProtocols, setArvProtocols] = useState([]);
    const [showAddPlan, setShowAddPlan] = useState(false);
    const [editPlan, setEditPlan] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    const [editSuccess, setEditSuccess] = useState('');
    const [showAddSchedule, setShowAddSchedule] = useState({}); // { [planId]: boolean }
    // Minimal state for disabled prescription functionality
    const [showAddScheduleModal, setShowAddScheduleModal] = useState(null);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(null);
    const [showEditMedModal, setShowEditMedModal] = useState(null);
    const [activeMedications, setActiveMedications] = useState([]);
    const [medications, setMedications] = useState([{ medicationName: '', dosage: '', frequency: '', timeOfDay: [] }]);
    const [prescriptionList, setPrescriptionList] = useState([]);
    const [editMedForm, setEditMedForm] = useState({ medicationName: '', dosage: '', frequency: '', timeOfDay: '' });
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState('');
    const [addSuccess, setAddSuccess] = useState('');
    const [prescriptionLoading, setPrescriptionLoading] = useState(false);
    const [prescriptionError, setPrescriptionError] = useState('');
    const [editMedLoading, setEditMedLoading] = useState(false);
    const [editMedError, setEditMedError] = useState('');
    const [editMedSuccess, setEditMedSuccess] = useState('');
    // Removed other unused prescription modal state variables
    const [compliance, setCompliance] = useState(null);
    const [complianceLoading, setComplianceLoading] = useState(false);
    const [complianceError, setComplianceError] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const [showCreateAppointmentModal, setShowCreateAppointmentModal] = useState(false);
    const [createAppointmentLoading, setCreateAppointmentLoading] = useState(false);
    const [createAppointmentError, setCreateAppointmentError] = useState('');
    const [createAppointmentSuccess, setCreateAppointmentSuccess] = useState('');
    const [appointmentForm, setAppointmentForm] = useState({
        appointmentDate: dayjs().format('YYYY-MM-DD'),
        appointmentTime: '',
        notes: 'Hẹn tái khám',
    });
    const [doctorId, setDoctorId] = useState(null);
    // Thêm state cho available slots và loading
    const [availableSlots, setAvailableSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    // State để lưu danh sách thuốc cho mỗi kế hoạch điều trị
    const [planMedications, setPlanMedications] = useState({});

    // Fetch thông tin chi tiết bệnh nhân
    useEffect(() => {
        if (isOpen && patient?.id) {
            setLoadingPatientDetails(true);
            const token = localStorage.getItem('token');
            fetch(`http://localhost:8080/api/patients/${patient.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    setPatientDetails(data);
                })
                .catch(err => {
                    console.error('Error fetching patient details:', err);
                    setPatientDetails(patient); // Fallback to original patient data
                })
                .finally(() => setLoadingPatientDetails(false));
        }
    }, [isOpen, patient]);

    useEffect(() => {
        if (isOpen && patient?.id) {
            setLoadingLabResults(true);
            const token = localStorage.getItem('token');
            fetch(`http://localhost:8080/api/lab-requests/patient/${patient.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    // Gộp tất cả labRequestItems lại thành 1 mảng
                    const allItems = data.flatMap(lr => lr.labRequestItems || []);
                    setLabResults(allItems);
                })
                .catch(() => setLabResults([]))
                .finally(() => setLoadingLabResults(false));
        }
    }, [isOpen, patient]);

    useEffect(() => {
        if (isOpen && patient?.id) {
            setLoadingPlans(true);
            const token = localStorage.getItem('token');
            
            // Load cả treatment plans và ARV protocols song song
            Promise.all([
                axios.get(`http://localhost:8080/api/patient-treatment-plans/patient/${patient.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:8080/api/arv-protocol/active', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ])
                .then(([plansRes, protocolsRes]) => {
                    const plans = plansRes.data || [];
                    const protocols = protocolsRes.data || [];
                    
                    setActivePlans(plans);
                    setArvProtocols(protocols);
                    
                    // Load thuốc cho mỗi kế hoạch điều trị sau khi đã có protocols
                    loadMedicationsForPlans(plans);
                })
                .catch(err => {
                    console.error('Error loading treatment plans or protocols:', err);
                    setActivePlans([]);
                    setArvProtocols([]);
                })
                .finally(() => setLoadingPlans(false));
        }
    }, [isOpen, patient]);

    // 2. useEffect tự động fetch đánh giá cho mỗi labResult khi labResults thay đổi
    useEffect(() => {
        if (labResults && labResults.length > 0) {
            const fetchAll = async () => {
                const token = localStorage.getItem('token');
                const newMessages = {};
                const newLoading = {};
                await Promise.all(labResults.map(async (item) => {
                    if (!item.resultValue) return;
                    newLoading[item.labRequestItemId || item.id] = true;
                    try {
                        const url = `http://localhost:8080/api/lab-result-messages/analyze/${item.labRequestItemId || item.id}?resultValue=${item.resultValue}`;
                        const res = await fetch(url, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const data = await res.json();
                        newMessages[item.labRequestItemId || item.id] = data;
                    } catch {
                        newMessages[item.labRequestItemId || item.id] = { error: true };
                    } finally {
                        newLoading[item.labRequestItemId || item.id] = false;
                    }
                }));
                setLabResultMessages(newMessages);
                setLoadingMessages(newLoading);
            };
            fetchAll();
        }
    }, [labResults]);

    useEffect(() => {
        if (isOpen && patient?.id) {
            const fetchCompliance = async () => {
                setComplianceLoading(true);
                setComplianceError(null);
                try {
                    const token = localStorage.getItem('token');
                    const startDate = selectedMonth.startOf('month').format('YYYY-MM-DD');
                    const endDate = selectedMonth.endOf('month').format('YYYY-MM-DD');
                    const res = await axios.get(`http://localhost:8080/api/treatment-reminders/reports/patient/${patient.id}/compliance?startDate=${startDate}&endDate=${endDate}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setCompliance(res.data);
                } catch (err) {
                    setComplianceError('Không thể tải tiến độ tuân thủ.');
                    setCompliance(null);
                } finally {
                    setComplianceLoading(false);
                }
            };
            fetchCompliance();
        }
    }, [isOpen, patient, selectedMonth]);

    // Function để load thuốc cho tất cả kế hoạch điều trị
    const loadMedicationsForPlans = async (plans) => {
        const token = localStorage.getItem('token');
        const medicationsData = {};
        
        for (const plan of plans) {
            try {
                // Lấy thuốc thực tế từ prescription medications endpoint mới  
                const res = await axios.get(`http://localhost:8080/api/prescription-medications/treatment-plan/${plan.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                medicationsData[plan.id] = res.data || [];
            } catch (err) {
                console.error(`❌ Error loading prescription medications for plan ${plan.id}:`, err);
                // Fallback: sử dụng prescriptionMedicationDTOList từ plan data nếu API call thất bại
                const prescriptionMeds = plan.prescriptionMedicationDTOList || [];
                medicationsData[plan.id] = prescriptionMeds;
            }
        }
        
        setPlanMedications(medicationsData);
    };

    // Hàm gọi API lấy message/status cho lab result
    const fetchLabResultMessage = useCallback(async (labRequestItemId, resultValue) => {
        setLoadingMessage(true);
        setShowMessageModal(true);
        setLabResultMessage(null);
        try {
            const token = localStorage.getItem('token');
            const url = `http://localhost:8080/api/lab-result-messages/analyze/${labRequestItemId}?resultValue=${resultValue}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            setLabResultMessage(data);
        } catch {
            setLabResultMessage(null);
        } finally {
            setLoadingMessage(false);
        }
    }, []);

    const getARVProtocolName = (id) => {
        const found = arvProtocols.find(p => p.id === id);
        return found ? found.name : 'Không xác định';
    };

    useEffect(() => {
        if (showAddScheduleModal) {
            // Fetch danh sách thuốc active khi mở modal
            const fetchMeds = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get('http://localhost:8080/api/arv-medications/active', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setActiveMedications(res.data || []);
                } catch {
                    setActiveMedications([]);
                }
            };
            fetchMeds();
        }
    }, [showAddScheduleModal]);

    // Lấy doctorId khi mở modal
    useEffect(() => {
        if (showCreateAppointmentModal) {
            const fetchDoctor = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get('http://localhost:8080/api/doctors/me', { headers: { Authorization: `Bearer ${token}` } });
                    setDoctorId(res.data.id);
                } catch {
                    setDoctorId(null);
                }
            };
            fetchDoctor();
        }
    }, [showCreateAppointmentModal]);

    // Fetch available slots khi doctorId hoặc appointmentDate thay đổi
    useEffect(() => {
        if (doctorId && appointmentForm.appointmentDate) {
            const fetchSlots = async () => {
                setSlotsLoading(true);
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(
                        `http://localhost:8080/api/doctors/${doctorId}/available-slots?date=${appointmentForm.appointmentDate}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    const slotsData = res.data || [];
                    const processedSlots = slotsData.map(slot => {
                        let timeValue;
                        if (typeof slot === 'object' && slot.time) timeValue = slot.time;
                        else if (typeof slot === 'string') timeValue = slot;
                        else if (typeof slot === 'object') {
                            const keys = Object.keys(slot);
                            if (keys.length > 0) timeValue = slot[keys[0]];
                        }
                        if (!timeValue) return null;
                        if (typeof timeValue === 'string') {
                            if (timeValue.split(':').length >= 2) {
                                const parts = timeValue.split(':');
                                return `${parts[0]}:${parts[1]}`;
                            }
                            return timeValue;
                        }
                        return null;
                    }).filter(slot => slot !== null);
                    setAvailableSlots(processedSlots);
                } catch {
                    setAvailableSlots([]);
                } finally {
                    setSlotsLoading(false);
                }
            };
            fetchSlots();
        } else {
            setAvailableSlots([]);
        }
    }, [doctorId, appointmentForm.appointmentDate]);

    // Khi mở modal, reset form và set ngày mặc định là hôm nay
    useEffect(() => {
        if (showCreateAppointmentModal) {
            setAppointmentForm({
                appointmentDate: dayjs().format('YYYY-MM-DD'),
                appointmentTime: '',
                notes: 'Hẹn tái khám',
            });
        }
    }, [showCreateAppointmentModal]);

    if (!isOpen || !patient) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'CONFIRMED':
                return 'confirmed';
            case 'PENDING':
                return 'pending';
            case 'COMPLETED':
                return 'completed';
            case 'CANCELLED':
                return 'cancelled';
            default:
                return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'CONFIRMED':
                return 'Đã xác nhận';
            case 'PENDING':
                return 'Chờ xác nhận';
            case 'COMPLETED':
                return 'Hoàn thành';
            case 'CANCELLED':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString.toString();
    };

    const getPlanStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE':
                return { background: '#e6fffb', color: '#13c2c2', border: '1px solid #13c2c2' };
            case 'PAUSED':
                return { background: '#fffbe6', color: '#faad14', border: '1px solid #faad14' };
            case 'DISCONTINUED':
                return { background: '#fff1f0', color: '#ff4d4f', border: '1px solid #ff4d4f' };
            default:
                return { background: '#f0f0f0', color: '#888', border: '1px solid #ccc' };
        }
    };
    const getPlanStatusText = (status) => {
        switch (status) {
            case 'ACTIVE':
                return 'Đang điều trị';
            case 'PAUSED':
                return 'Tạm ngưng';
            case 'DISCONTINUED':
                return 'Ngừng điều trị';
            default:
                return status;
        }
    };

    // Functions to handle activate/deactivate treatment plans
    const handleActivatePlan = async (planId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:8080/api/patient-treatment-plans/${planId}/activate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Reload treatment plans
            const response = await axios.get(`http://localhost:8080/api/patient-treatment-plans/patient/${patient.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActivePlans(response.data || []);
            loadMedicationsForPlans(response.data || []);
            
            toast?.success('Kích hoạt kế hoạch điều trị thành công!');
        } catch (error) {
            console.error('Error activating treatment plan:', error);
            toast?.error('Không thể kích hoạt kế hoạch điều trị!');
        }
    };

    const handleDeactivatePlan = async (planId) => {
        if (window.confirm('Bạn có chắc chắn muốn tạm ngưng kế hoạch điều trị này?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.patch(`http://localhost:8080/api/patient-treatment-plans/${planId}/deactivate`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Reload treatment plans
                const response = await axios.get(`http://localhost:8080/api/patient-treatment-plans/patient/${patient.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setActivePlans(response.data || []);
                loadMedicationsForPlans(response.data || []);
                
                toast?.success('Tạm ngưng kế hoạch điều trị thành công!');
            } catch (error) {
                console.error('Error deactivating treatment plan:', error);
                toast?.error('Không thể tạm ngưng kế hoạch điều trị!');
            }
        }
    };

    // Thêm component progress bar
    const ProgressBar = ({ percent }) => (
        <div style={{ background: '#f2f2f2', borderRadius: 6, height: 8, width: '100%', margin: '8px 0' }}>
            <div style={{ background: '#111', height: 8, borderRadius: 6, width: `${percent}%`, transition: 'width 0.5s' }} />
        </div>
    );

    return (
        <div className="patient-detail-modal-overlay" onClick={onClose}>
            <div className="patient-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="patient-detail-modal__header">
                    <h2>Thông tin chi tiết bệnh nhân</h2>
                    <button className="patient-detail-modal__close-btn" onClick={onClose}>
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="patient-detail-modal__content">
                    {/* Thông tin cơ bản */}
                    <div className="patient-detail-modal__section">
                        <h3 className="patient-detail-modal__section-title">
                            <FaUser size={16} />
                            Thông tin cá nhân
                        </h3>
                        {loadingPatientDetails ? (
                            <div className="loading-message">Đang tải thông tin bệnh nhân...</div>
                        ) : (
                            <div className="patient-detail-modal__info-grid">
                                <div className="patient-detail-modal__info-item">
                                    <label>Họ và tên:</label>
                                    <span>{patientDetails?.fullName || patient.fullName}</span>
                                </div>
                                <div className="patient-detail-modal__info-item">
                                    <label>Email:</label>
                                    <span>{patientDetails?.email === 'Ẩn' ? 'Thông tin ẩn danh' : (patientDetails?.email || patient.email || 'Chưa cập nhật')}</span>
                                </div>
                                <div className="patient-detail-modal__info-item">
                                    <label>Số điện thoại:</label>
                                    <span>{patientDetails?.phoneNumber === 'Ẩn' ? 'Thông tin ẩn danh' : (patientDetails?.phoneNumber || patient.phoneNumber || 'Chưa cập nhật')}</span>
                                </div>
                                <div className="patient-detail-modal__info-item">
                                    <label>Ngày sinh:</label>
                                    <span>{patientDetails?.dateOfBirth ? formatDate(patientDetails.dateOfBirth) : (patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'Chưa cập nhật')}</span>
                                </div>
                                <div className="patient-detail-modal__info-item">
                                    <label>Giới tính:</label>
                                    <span>{patientDetails?.gender || patient.gender || 'Chưa cập nhật'}</span>
                                </div>
                                <div className="patient-detail-modal__info-item">
                                    <label>Địa chỉ:</label>
                                    <span>{patientDetails?.address === 'Ẩn' ? 'Thông tin ẩn danh' : (patientDetails?.address || patient.address || 'Chưa cập nhật')}</span>
                                </div>
                                {/* Hiển thị trạng thái ẩn danh nếu có */}
                                {(patientDetails?.fullName === 'Bệnh nhân Ẩn danh' || patientDetails?.email === 'Ẩn') && (
                                    <div className="patient-detail-modal__info-item anonymous-notice">
                                        <label>🔒 Trạng thái:</label>
                                        <span style={{color: '#f57c00', fontWeight: 'bold'}}>Bệnh nhân đã chọn chế độ ẩn danh</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Thông tin khai báo y tế */}
                    <div className="patient-detail-modal__section">
                        <PatientMedicalDeclaration 
                            patientId={patient.id}
                        />
                    </div>

                    {/* Tiến độ tuân thủ */}
                    <div className="patient-detail-modal__section">
                        <h3 className="patient-detail-modal__section-title" style={{ marginBottom: 0 }}>
                            Tiến độ tuân thủ
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, marginTop: 12 }}>
                            <input
                                type="month"
                                value={selectedMonth.format('YYYY-MM')}
                                onChange={e => setSelectedMonth(dayjs(e.target.value + '-01'))}
                                style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #ccc', fontSize: 15 }}
                            />
                            <span style={{ color: '#888', fontSize: 14 }}>Chọn tháng/năm</span>
                        </div>
                        {complianceLoading ? (
                            <div>Đang tải...</div>
                        ) : complianceError ? (
                            <div style={{ color: 'red' }}>{complianceError}</div>
                        ) : compliance ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, marginTop: 8 }}>
                                <div style={{ minWidth: 90 }}>{selectedMonth.format('MM/YYYY')}</div>
                                <ProgressBar percent={compliance.complianceRate || 0} />
                                <div style={{ minWidth: 40, textAlign: 'right' }}>{compliance.complianceRate ? `${Math.round(compliance.complianceRate)}%` : '--'}</div>
                            </div>
                        ) : null}
                    </div>

                    {/* Thống kê lịch hẹn */}
                    <div className="patient-detail-modal__section">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 className="patient-detail-modal__section-title">
                                <FaCalendarAlt size={16} />
                                Thống kê lịch hẹn ({patient.appointments?.length || 0})
                            </h3>
                            <button
                                className="add-appointment-btn"
                                style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginLeft: 16, boxShadow: '0 1px 4px rgba(25,118,210,0.08)' }}
                                onClick={() => setShowCreateAppointmentModal(true)}
                            >
                                + Tạo lịch hẹn tái khám
                            </button>
                        </div>
                        <div className="patient-detail-modal__stats">
                            <div className="patient-detail-modal__stat-item">
                                <span className="patient-detail-modal__stat-number">
                                    {patient.appointments?.filter(app => app.status === 'CONFIRMED').length || 0}
                                </span>
                                <span className="patient-detail-modal__stat-label">Đã xác nhận</span>
                            </div>
                            <div className="patient-detail-modal__stat-item">
                                <span className="patient-detail-modal__stat-number">
                                    {patient.appointments?.filter(app => app.status === 'COMPLETED').length || 0}
                                </span>
                                <span className="patient-detail-modal__stat-label">Hoàn thành</span>
                            </div>
                            <div className="patient-detail-modal__stat-item">
                                <span className="patient-detail-modal__stat-number">
                                    {patient.appointments?.filter(app => app.status === 'PENDING').length || 0}
                                </span>
                                <span className="patient-detail-modal__stat-label">Chờ xác nhận</span>
                            </div>
                            <div className="patient-detail-modal__stat-item">
                                <span className="patient-detail-modal__stat-number">
                                    {patient.appointments?.filter(app => app.status === 'CANCELLED').length || 0}
                                </span>
                                <span className="patient-detail-modal__stat-label">Đã hủy</span>
                            </div>
                        </div>
                    </div>

                    {/* Danh sách lịch hẹn */}
                    <div className="patient-detail-modal__section">
                        <h3 className="patient-detail-modal__section-title">
                            <FaCalendarAlt size={16} />
                            Lịch sử lịch hẹn
                        </h3>
                        <div className="patient-detail-modal__appointments" style={{ maxHeight: 250, overflowY: 'auto' }}>
                            {patient.appointments && patient.appointments.length > 0 ? (
                                patient.appointments.map((appointment) => (
                                    <div key={appointment.id} className="patient-detail-modal__appointment-item">
                                        <div className="patient-detail-modal__appointment-header">
                                            <div className="patient-detail-modal__appointment-date">
                                                <FaCalendarAlt size={14} />
                                                {formatDate(appointment.appointmentDate)}
                                            </div>
                                            <div className="patient-detail-modal__appointment-time">
                                                {formatTime(appointment.appointmentTime)}
                                            </div>
                                            <div className={`patient-detail-modal__appointment-status ${getStatusColor(appointment.status)}`}>
                                                {getStatusText(appointment.status)}
                                            </div>
                                        </div>
                                        {appointment.notes && (
                                            <div className="patient-detail-modal__appointment-notes">
                                                <FaNotesMedical size={12} />
                                                <span>{appointment.notes}</span>
                                            </div>
                                        )}
                                        {appointment.medicalServiceName && (
                                            <div className="patient-detail-modal__appointment-service">
                                                <FaFlask size={12} />
                                                <span>{appointment.medicalServiceName}</span>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="patient-detail-modal__empty">
                                    <p>Chưa có lịch hẹn nào</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Kế hoạch điều trị bệnh nhân */}
                    <div className="patient-detail-modal__section patient-detail-modal__active-treatment-section">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 className="patient-detail-modal__section-title" style={{ marginBottom: 0 }}>
                                <FaNotesMedical size={16} />
                                Kế hoạch điều trị bệnh nhân
                            </h3>
                            <button
                                className="add-treatment-plan-btn"
                                style={{
                                    background: '#13c2c2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginLeft: 16, boxShadow: '0 1px 4px rgba(19,194,194,0.08)'
                                }}
                                onClick={() => setShowAddPlan(true)}
                            >
                                + Thêm kế hoạch điều trị
                            </button>
                        </div>
                        <div className="patient-detail-modal__appointments" style={{ maxHeight: 250, overflowY: 'auto' }}>
                            {loadingPlans ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                    <div>🔄 Đang tải kế hoạch điều trị...</div>
                                </div>
                            ) : activePlans.length === 0 ? (
                                <div className="patient-detail-modal__empty" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                                    <p>📋 Chưa có kế hoạch điều trị nào cho bệnh nhân này</p>
                                    <p style={{ fontSize: '14px', marginTop: '8px' }}>Nhấn "Thêm kế hoạch điều trị" để tạo kế hoạch mới</p>
                                </div>
                            ) : (
                                <>
                                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
                                        Tìm thấy {activePlans.length} kế hoạch điều trị
                                    </div>
                                    {activePlans.map(plan => (
                                        <div key={plan.id} className="patient-detail-modal__appointment-item">
                                            <div className="patient-detail-modal__appointment-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                    <div className="patient-detail-modal__appointment-date">
                                                        <FaCalendarAlt size={14} /> {plan.startDate ? formatDate(plan.startDate) : '-'}
                                                    </div>
                                                    <div className="patient-detail-modal__appointment-time">
                                                        Đến: {plan.endDate ? formatDate(plan.endDate) : '...'}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{
                                                        background: plan.active ? '#e6fffb' : '#fff1f0',
                                                        color: plan.active ? '#13c2c2' : '#ff4d4f',
                                                        border: plan.active ? '1px solid #13c2c2' : '1px solid #ff4d4f',
                                                        padding: '4px 12px',
                                                        borderRadius: 6,
                                                        fontWeight: 700,
                                                        fontSize: 13,
                                                        minWidth: 120,
                                                        textAlign: 'center'
                                                    }}>
                                                        {plan.active ? 'Đang điều trị' : 'Tạm ngưng'}
                                                    </div>
                                                    
                                                    {/* Activate/Deactivate buttons */}
                                                    {plan.active ? (
                                                        <button 
                                                            onClick={() => handleDeactivatePlan(plan.id)}
                                                            title="Tạm ngưng kế hoạch điều trị" 
                                                            style={{ 
                                                                background: 'none', 
                                                                border: 'none', 
                                                                cursor: 'pointer', 
                                                                color: '#ff4d4f', 
                                                                fontSize: 16, 
                                                                display: 'flex', 
                                                                alignItems: 'center',
                                                                padding: '4px'
                                                            }}
                                                        >
                                                            <FaPause />
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleActivatePlan(plan.id)}
                                                            title="Kích hoạt kế hoạch điều trị" 
                                                            style={{ 
                                                                background: 'none', 
                                                                border: 'none', 
                                                                cursor: 'pointer', 
                                                                color: '#52c41a', 
                                                                fontSize: 16, 
                                                                display: 'flex', 
                                                                alignItems: 'center',
                                                                padding: '4px'
                                                            }}
                                                        >
                                                            <FaPlay />
                                                        </button>
                                                    )}
                                                    
                                                    <button onClick={() => {
                                                        
                                                        // Đảm bảo format ngày đúng (YYYY-MM-DD) cho input date
                                                        const formatDateForInput = (dateString) => {
                                                            if (!dateString) return '';
                                                            try {
                                                                // Handle different date formats
                                                                const date = new Date(dateString);
                                                                if (isNaN(date.getTime())) return '';
                                                                return date.toISOString().split('T')[0];
                                                            } catch (e) {
                                                                console.error('Date format error:', e);
                                                                return '';
                                                            }
                                                        };
                                                        
                                                        // Tìm arvProtocolId từ arvProtocolName
                                                        const findArvProtocolId = (protocolName) => {
                                                            if (!protocolName || !arvProtocols.length) return '';
                                                            const protocol = arvProtocols.find(p => p.name === protocolName);
                                                            return protocol ? String(protocol.id) : '';
                                                        };
                                                        
                                                        // Tạo object editPlan với đầy đủ thông tin
                                                        const editData = {
                                                            id: plan.id,
                                                            patientId: plan.patientId || patient.id,
                                                            doctorId: plan.doctorId,
                                                            arvProtocolId: plan.arvProtocolId ? String(plan.arvProtocolId) : findArvProtocolId(plan.arvProtocolName),
                                                            arvProtocolName: plan.arvProtocolName || '',
                                                            sourceLabRequestId: plan.sourceLabRequestId || null,
                                                            decisionSummary: plan.decisionSummary || '',
                                                            startDate: formatDateForInput(plan.startDate),
                                                            endDate: formatDateForInput(plan.endDate),
                                                            notes: plan.notes || '',
                                                            status: plan.status || 'ACTIVE'
                                                        };
                                                        
                                                        setEditPlan(editData);
                                                    }} title="Sửa kế hoạch" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1890ff', fontSize: 18, display: 'flex', alignItems: 'center' }}>
                                                        <FaEdit />
                                                    </button>
                                                </div>
                                            </div>
                                            <div style={{ 
                                                backgroundColor: '#f0f8ff', 
                                                padding: '15px', 
                                                borderRadius: '8px', 
                                                marginTop: '10px',
                                                border: '1px solid #d6e4ff'
                                            }}>
                                                <div style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    marginBottom: '12px',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: '#1890ff'
                                                }}>
                                                    📋 Thông tin kế hoạch điều trị hiện tại:
                                                </div>
                                                <div style={{ 
                                                    display: 'grid', 
                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                                                    gap: '8px',
                                                    fontSize: '13px',
                                                    color: '#666',
                                                    lineHeight: '1.6'
                                                }}>
                                                    <div><strong>Phác đồ ARV:</strong> {plan.arvProtocolName || `ID: ${plan.arvProtocolId}`}</div>
                                                    <div><strong>Ngày bắt đầu:</strong> {plan.startDate ? formatDate(plan.startDate) : 'Chưa có'}</div>
                                                    <div style={{ gridColumn: '1 / -1' }}>
                                                        <strong>Ghi chú:</strong> {plan.notes || 'Kế hoạch điều trị ARV cho bệnh nhân'}
                                                    </div>
                                                    {plan.decisionSummary && (
                                                        <div style={{ gridColumn: '1 / -1' }}>
                                                            <strong>Tóm tắt quyết định:</strong> {plan.decisionSummary}
                                                        </div>
                                                    )}
                                                    {/* Hiển thị danh sách thuốc */}
                                                    {(() => {
                                                        const medications = planMedications[plan.id];
                                                        console.log(`🎯 Checking medications for plan ${plan.id}:`, medications);
                                                        console.log(`📊 Medications exists: ${!!medications}, Length: ${medications?.length}`);
                                                        return medications && medications.length > 0;
                                                    })() && (
                                                        <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                                                            <strong style={{ color: '#52c41a' }}>💊 Thuốc đang sử dụng:</strong>
                                                            <div style={{ 
                                                                marginTop: '6px',
                                                                display: 'flex',
                                                                flexWrap: 'wrap',
                                                                gap: '6px'
                                                            }}>
                                                                {planMedications[plan.id].map((med, index) => {
                                                                    return (
                                                                        <span key={index} style={{
                                                                            background: '#f0f9ff',
                                                                            border: '1px solid #91d5ff',
                                                                            borderRadius: '12px',
                                                                            padding: '2px 8px',
                                                                            fontSize: '12px',
                                                                            color: '#1890ff',
                                                                            fontWeight: '500'
                                                                        }}>
                                                                            {med.name || 'Tên thuốc không xác định'} ({med.dosage || 'Liều dùng'}) - {med.frequency || 'Tần suất'}
                                                                            {med.durationDays && ` - ${med.durationDays} ngày`}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                    {showAddPlan && (
                        <PatientAddTreatmentPlan
                            onClose={() => setShowAddPlan(false)}
                            onSuccess={() => {
                                setShowAddPlan(false);
                                // Reload danh sách kế hoạch điều trị
                                if (isOpen && patient?.id) {
                                    setLoadingPlans(true);
                                    const token = localStorage.getItem('token');
                                    axios.get(`http://localhost:8080/api/patient-treatment-plans/patient/${patient.id}`, {
                                        headers: { Authorization: `Bearer ${token}` }
                                    })
                                        .then(res => {
                                            setActivePlans(res.data || []);
                                            loadMedicationsForPlans(res.data || []);
                                        })
                                        .catch(() => setActivePlans([]))
                                        .finally(() => setLoadingPlans(false));
                                }
                            }}
                            patientId={patient.id}
                        />
                    )}
                    {editPlan && (
                        <PatientEditTreatmentPlan
                            editPlan={editPlan}
                            patientId={patient?.id}
                            onClose={() => setEditPlan(null)}
                            onSuccess={() => {
                                setEditPlan(null);
                                // Reload danh sách kế hoạch điều trị
                                if (isOpen && patient?.id) {
                                    setLoadingPlans(true);
                                    const token = localStorage.getItem('token');
                                    
                                    Promise.all([
                                        axios.get(`http://localhost:8080/api/patient-treatment-plans/patient/${patient.id}`, {
                                            headers: { Authorization: `Bearer ${token}` }
                                        }),
                                        axios.get('http://localhost:8080/api/arv-protocol/active', {
                                            headers: { Authorization: `Bearer ${token}` }
                                        })
                                    ])
                                        .then(([plansRes, protocolsRes]) => {
                                            const plans = plansRes.data || [];
                                            const protocols = protocolsRes.data || [];
                                            
                                            setActivePlans(plans);
                                            setArvProtocols(protocols);
                                            loadMedicationsForPlans(plans);
                                        })
                                        .catch(err => {
                                            console.error('Error reloading treatment plans:', err);
                                            setActivePlans([]);
                                        })
                                        .finally(() => setLoadingPlans(false));
                                }
                            }}
                            arvProtocols={arvProtocols}
                        />
                    )}

                    {/* Lịch sử xét nghiệm */}
                    <div className="patient-detail-modal__section">
                        <h3 className="patient-detail-modal__section-title">
                            <FaFlask size={16} />
                            Lịch sử xét nghiệm
                        </h3>
                        <div style={{ marginBottom: 8 }}>
                            <label>Chọn loại xét nghiệm: </label>
                            <select value={selectedTestType} onChange={e => setSelectedTestType(e.target.value)}>
                                <option value="ALL">Tất cả</option>
                                {testTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div className="patient-detail-modal__appointments" style={{ maxHeight: 250, overflowY: 'auto' }}>
                            {loadingLabResults ? (
                                <div>Đang tải...</div>
                            ) : labResults.length === 0 ? (
                                <div className="patient-detail-modal__empty"><p>Chưa có kết quả xét nghiệm nào</p></div>
                            ) : (
                                labResults
                                    .filter(item => selectedTestType === 'ALL' || (item.testTypeName || item.testName) === selectedTestType)
                                    .sort((a, b) => new Date(b.resultDate) - new Date(a.resultDate))
                                    .map(item => {
                                        // Hàm đánh giá kết quả nếu không có message/status
                                        function getResultAssessment(resultValue, normalRange) {
                                            if (!resultValue || !normalRange) return '';
                                            const [min, max] = normalRange.split('-').map(Number);
                                            const value = Number(resultValue);
                                            if (isNaN(value) || isNaN(min) || isNaN(max)) return '';
                                            if (value < min) return 'Thấp';
                                            if (value > max) return 'Cao';
                                            return 'Bình thường';
                                        }
                                        // Xác định màu sắc đánh giá
                                        let assessment = '';
                                        let color = '#222';
                                        if (item.message) {
                                            assessment = item.message;
                                            if (item.severityLevel === 'HIGH') color = 'red';
                                            else if (item.severityLevel === 'LOW') color = 'orange';
                                            else color = 'green';
                                        } else if (item.status) {
                                            if (item.status === 'NORMAL') {
                                                assessment = 'Bình thường';
                                                color = 'green';
                                            } else {
                                                assessment = item.status;
                                                color = 'red';
                                            }
                                        } else {
                                            assessment = getResultAssessment(item.resultValue, item.normalRange);
                                            if (assessment === 'Bình thường') color = 'green';
                                            else if (assessment === 'Thấp') color = 'orange';
                                            else if (assessment === 'Cao') color = 'red';
                                        }
                                        return (
                                            <div key={item.id} className="patient-detail-modal__appointment-item">
                                                <div className="patient-detail-modal__appointment-header">
                                                    <div className="patient-detail-modal__appointment-date">
                                                        <FaCalendarAlt size={14} /> {item.resultDate ? new Date(item.resultDate).toLocaleDateString('vi-VN') : '-'}
                                                    </div>
                                                    <div className="patient-detail-modal__appointment-time" style={{ color: '#222', fontWeight: 500 }}>
                                                        <FaFlask size={12} style={{ marginRight: 4 }} />{item.testTypeName || item.testName}
                                                    </div>
                                                </div>
                                                <div className="patient-detail-modal__lab-result">
                                                    {loadingMessages[item.labRequestItemId || item.id] ? (
                                                        <span style={{ color: '#007bff' }}>Đang tải đánh giá...</span>
                                                    ) : labResultMessages[item.labRequestItemId || item.id] && !labResultMessages[item.labRequestItemId || item.id].error ? (
                                                        <span style={{
                                                            fontWeight: 500,
                                                            color: labResultMessages[item.labRequestItemId || item.id].severityLevel === 'HIGH' ? 'red' : labResultMessages[item.labRequestItemId || item.id].severityLevel === 'LOW' ? 'orange' : 'green'
                                                        }}>
                                                            {labResultMessages[item.labRequestItemId || item.id].message}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: 'red' }}>Không lấy được đánh giá</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                            )}
                        </div>
                        {/* Modal nhỏ hiển thị message/status */}
                        {showMessageModal && (
                            <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%, -30%)', background: '#fff', border: '1px solid #ccc', zIndex: 9999, padding: 24, borderRadius: 8, boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }} onClick={() => setShowMessageModal(false)}>
                                <div style={{ minWidth: 250 }} onClick={e => e.stopPropagation()}>
                                    {loadingMessage ? (
                                        <div>Đang tải đánh giá...</div>
                                    ) : labResultMessage ? (
                                        <>
                                            <div><strong>Trạng thái:</strong> {labResultMessage.status}</div>
                                            <div>
                                                <strong>Đánh giá:</strong>{' '}
                                                <span style={{
                                                    color: labResultMessage.severityLevel === 'HIGH' ? 'red' : labResultMessage.severityLevel === 'LOW' ? 'orange' : 'green',
                                                    fontWeight: 500
                                                }}>{labResultMessage.message}</span>
                                            </div>
                                            <button onClick={() => setShowMessageModal(false)} style={{ marginTop: 12, padding: '4px 16px', borderRadius: 4, border: '1px solid #007bff', background: '#007bff', color: '#fff', cursor: 'pointer' }}>Đóng</button>
                                        </>
                                    ) : (
                                        <div>Không lấy được đánh giá</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Ghi chú bác sĩ */}
                    <div className="patient-detail-modal__section">
                        <h3 className="patient-detail-modal__section-title">
                            <FaNotesMedical size={16} />
                            Ghi chú bác sĩ
                        </h3>
                        <textarea
                            className="patient-detail-modal__notes-input"
                            placeholder="Nhập ghi chú về bệnh nhân..."
                            rows="3"
                        />
                    </div>
                </div>

                <div className="patient-detail-modal__footer">
                    <button className="patient-detail-modal__btn patient-detail-modal__btn--secondary" onClick={onClose}>
                        Đóng
                    </button>
                    <button className="patient-detail-modal__btn patient-detail-modal__btn--primary">
                        Lưu ghi chú
                    </button>
                </div>
            </div>
            {/* Removed medication schedule modal */}
            {false && (
                <div className="add-treatment-plan-modal-overlay" onClick={() => setShowAddScheduleModal(null)}>
                    <div className="add-treatment-plan-modal" onClick={e => e.stopPropagation()}>
                        <h2>Thêm lịch uống thuốc</h2>
                        <form className="add-treatment-plan-form" onSubmit={async (e) => {
                            e.preventDefault();
                            setAddLoading(true);
                            setAddError('');
                            setAddSuccess('');
                            try {
                                const token = localStorage.getItem('token');
                                const createdSchedules = [];
                                for (const med of medications) {
                                    const response = await axios.post('http://localhost:8080/api/medication-schedules', {
                                        treatmentPlanId: showAddScheduleModal,
                                        medicationName: med.medicationName,
                                        dosage: med.dosage,
                                        frequency: med.frequency,
                                        timeOfDay: med.timeOfDay.join(',')
                                    }, {
                                        headers: { Authorization: `Bearer ${token}` }
                                    });
                                    createdSchedules.push(response.data);
                                }

                                // // Tạo nhắc nhở hàng ngày cho từng lịch uống thuốc đã tạo
                                // for (const schedule of createdSchedules) {
                                //     try {
                                //         await axios.post(`http://localhost:8080/api/treatment-reminders/medication-schedule/${schedule.id}/daily`, {}, {
                                //             headers: { Authorization: `Bearer ${token}` }
                                //         });
                                //     } catch (reminderErr) {
                                //         console.error('Không thể tạo nhắc nhở cho lịch uống thuốc:', schedule.id, reminderErr);
                                //     }
                                // }

                                // // Gửi nhắc nhở hàng ngày sau khi tạo reminder thành công
                                // try {
                                //     await axios.post('http://localhost:8080/api/treatment-reminders/send-daily-reminders', {}, {
                                //         headers: { Authorization: `Bearer ${token}` }
                                //     });
                                // } catch (sendReminderErr) {
                                //     console.error('Không thể gửi nhắc nhở hàng ngày:', sendReminderErr);
                                // }

                                setAddSuccess('Thêm lịch uống thuốc thành công!');
                                setShowAddScheduleModal(null);
                                setMedications([{ medicationName: '', dosage: '', frequency: '', timeOfDay: [] }]);
                            } catch (err) {
                                setAddError('Không thể thêm lịch uống thuốc.');
                            } finally {
                                setAddLoading(false);
                            }
                        }}>
                            {medications.map((med, idx) => (
                                <div key={idx} style={{ border: '1.5px solid #13c2c2', borderRadius: 10, padding: 16, marginBottom: 14, position: 'relative', background: '#f8fafd' }}>
                                    <button
                                        type="button"
                                        onClick={() => setMedications(meds => meds.filter((_, i) => i !== idx))}
                                        title="Xóa thuốc"
                                        style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: '#ff4d4f', fontSize: 20, cursor: 'pointer' }}
                                        disabled={medications.length === 1}
                                    >
                                        <FaTrash />
                                    </button>
                                    <div className="form-group">
                                        <label>Tên thuốc *</label>
                                        <select value={med.medicationName} onChange={e => setMedications(meds => meds.map((m, i) => i === idx ? { ...m, medicationName: e.target.value } : m))} required>
                                            <option value="">
                                                {(() => {
                                                    // Tìm tên phác đồ ARV của treatment plan hiện tại
                                                    let protocolName = '';
                                                    if (showAddScheduleModal) {
                                                        const plan = activePlans.find(p => p.id === showAddScheduleModal);
                                                        if (plan) protocolName = getARVProtocolName(plan.arvProtocolId);
                                                    }
                                                    return protocolName ? `Chọn thuốc theo phác đồ: ${protocolName}` : '-- Chọn thuốc --';
                                                })()}
                                            </option>
                                            {activeMedications.map(med => (
                                                <option key={med.id} value={med.name}>{med.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Liều dùng *</label>
                                        <input type="text" value={med.dosage} onChange={e => setMedications(meds => meds.map((m, i) => i === idx ? { ...m, dosage: e.target.value } : m))} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Tần suất *</label>
                                        <input type="text" value={med.frequency} onChange={e => setMedications(meds => meds.map((m, i) => i === idx ? { ...m, frequency: e.target.value } : m))} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Thời điểm uống</label>
                                        {med.timeOfDay.map((time, tIdx) => (
                                            <div key={tIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                <input
                                                    type="time"
                                                    value={time}
                                                    onChange={e => setMedications(meds => meds.map((m, i) => i === idx ? {
                                                        ...m,
                                                        timeOfDay: m.timeOfDay.map((t, j) => j === tIdx ? e.target.value : t)
                                                    } : m))}
                                                    required
                                                />
                                                <button type="button" onClick={() => setMedications(meds => meds.map((m, i) => i === idx ? {
                                                    ...m,
                                                    timeOfDay: m.timeOfDay.filter((_, j) => j !== tIdx)
                                                } : m))} style={{ color: '#ff4d4f', border: 'none', background: 'none', fontSize: 16 }}>X</button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setMedications(meds => meds.map((m, i) => i === idx ? { ...m, timeOfDay: [...m.timeOfDay, ''] } : m))}
                                            style={{ color: '#13c2c2', background: 'none', border: '1px dashed #13c2c2', borderRadius: 6, padding: '2px 12px', cursor: 'pointer', fontWeight: 600, marginTop: 4 }}
                                        >
                                            + Thêm khung giờ
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={() => setMedications(meds => [...meds, { medicationName: '', dosage: '', frequency: '', timeOfDay: [] }])} style={{ margin: '8px 0', color: '#13c2c2', background: 'none', border: '1px dashed #13c2c2', borderRadius: 6, padding: '4px 16px', cursor: 'pointer', fontWeight: 600 }}>
                                + Thêm thuốc
                            </button>
                            {addError && <div className="form-error">{addError}</div>}
                            {addSuccess && <div className="form-success">{addSuccess}</div>}
                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowAddScheduleModal(null)} disabled={addLoading}>Hủy</button>
                                <button type="submit" className="btn-submit" disabled={addLoading}>{addLoading ? 'Đang lưu...' : 'Thêm'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Removed prescription modal */}
            {false && (
                <div className="add-treatment-plan-modal-overlay" onClick={() => setShowPrescriptionModal(null)}>
                    <div className="add-treatment-plan-modal" onClick={e => e.stopPropagation()} style={{ width: 700, maxWidth: '95vw' }}>
                        <h2>Đơn thuốc</h2>
                        {prescriptionLoading ? (
                            <div>Đang tải...</div>
                        ) : prescriptionError ? (
                            <div className="form-error">{prescriptionError}</div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
                                <thead>
                                    <tr style={{ background: '#f5f5f5' }}>
                                        <th style={{ padding: 8, border: '1px solid #eee' }}>Tên thuốc</th>
                                        <th style={{ padding: 8, border: '1px solid #eee' }}>Liều dùng</th>
                                        <th style={{ padding: 8, border: '1px solid #eee' }}>Tần suất</th>
                                        <th style={{ padding: 8, border: '1px solid #eee' }}>Thời điểm uống</th>
                                        <th style={{ padding: 8, border: '1px solid #eee' }}>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescriptionList.length === 0 ? (
                                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: 16 }}>Không có dữ liệu</td></tr>
                                    ) : (
                                        prescriptionList.map((item, idx) => (
                                            <tr key={item.id}>
                                                <td style={{ padding: 8, border: '1px solid #eee' }}>{item.medicationName}</td>
                                                <td style={{ padding: 8, border: '1px solid #eee' }}>{item.dosage}</td>
                                                <td style={{ padding: 8, border: '1px solid #eee' }}>{item.frequency}</td>
                                                <td style={{ padding: 8, border: '1px solid #eee' }}>{item.timeOfDay}</td>
                                                <td style={{ padding: 8, border: '1px solid #eee', display: 'flex', gap: 8 }}>
                                                    <button style={{ color: '#1890ff', border: 'none', background: 'none', fontSize: 18 }} title="Sửa" onClick={() => {
                                                        setShowEditMedModal(item.id);
                                                        setEditMedForm({ medicationName: item.medicationName, dosage: item.dosage, frequency: item.frequency, timeOfDay: item.timeOfDay });
                                                        setEditMedError('');
                                                        setEditMedSuccess('');
                                                    }}><FaEdit /></button>
                                                    <button style={{ color: '#ff4d4f', border: 'none', background: 'none', fontSize: 18 }} title="Xóa" onClick={async () => {
                                                        if (window.confirm('Bạn có chắc muốn xóa lịch uống thuốc này?')) {
                                                            try {
                                                                const token = localStorage.getItem('token');
                                                                await axios.delete(`http://localhost:8080/api/medication-schedules/${item.id}`, {
                                                                    headers: { Authorization: `Bearer ${token}` }
                                                                });
                                                                setPrescriptionList(list => list.filter(x => x.id !== item.id));
                                                            } catch {
                                                                alert('Không thể xóa!');
                                                            }
                                                        }
                                                    }}><FaTrash /></button>
                                                    <button style={{ color: '#ffc107', border: 'none', background: 'none', fontSize: 18 }} title="Bật nhắc nhở" onClick={async () => {
                                                        try {
                                                            const token = localStorage.getItem('token');
                                                            await axios.post(`http://localhost:8080/api/treatment-reminders/medication-schedule/${item.id}`, {}, {
                                                                headers: { Authorization: `Bearer ${token}` }
                                                            });
                                                            alert('Đã bật nhắc nhở cho lịch uống thuốc này!');
                                                        } catch {
                                                            alert('Không thể bật nhắc nhở!');
                                                        }
                                                    }}><FaBell /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                        <div className="form-actions" style={{ marginTop: 16 }}>
                            <button type="button" className="btn-cancel" onClick={() => setShowPrescriptionModal(null)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Removed edit medication modal */}
            {false && (
                <div className="add-treatment-plan-modal-overlay" onClick={() => setShowEditMedModal(null)}>
                    <div className="add-treatment-plan-modal" onClick={e => e.stopPropagation()} style={{ width: 500, maxWidth: '95vw' }}>
                        <h2>Sửa lịch uống thuốc</h2>
                        <form className="add-treatment-plan-form" onSubmit={async (e) => {
                            e.preventDefault();
                            setEditMedLoading(true);
                            setEditMedError('');
                            setEditMedSuccess('');
                            try {
                                const token = localStorage.getItem('token');
                                await axios.put(`http://localhost:8080/api/medication-schedules/${showEditMedModal}`, editMedForm, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                setEditMedSuccess('Cập nhật thành công!');
                                // reload list
                                const res = await axios.get(`http://localhost:8080/api/medication-schedules/treatment-plan/${showPrescriptionModal}`, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                setPrescriptionList(res.data || []);
                                setShowEditMedModal(null);
                            } catch {
                                setEditMedError('Không thể cập nhật.');
                            } finally {
                                setEditMedLoading(false);
                            }
                        }}>
                            <div className="form-group">
                                <label>Tên thuốc *</label>
                                <select value={editMedForm.medicationName} onChange={e => setEditMedForm(f => ({ ...f, medicationName: e.target.value }))} required>
                                    <option value="">
                                        {(() => {
                                            // Tìm tên phác đồ ARV của treatment plan hiện tại
                                            let protocolName = '';
                                            if (showPrescriptionModal) {
                                                const plan = activePlans.find(p => p.id === showPrescriptionModal);
                                                if (plan) protocolName = getARVProtocolName(plan.arvProtocolId);
                                            }
                                            return protocolName ? `Chọn thuốc theo phác đồ: ${protocolName}` : '-- Chọn thuốc --';
                                        })()}
                                    </option>
                                    {activeMedications.map(med => (
                                        <option key={med.id} value={med.name}>{med.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Liều dùng *</label>
                                <input type="text" value={editMedForm.dosage} onChange={e => setEditMedForm(f => ({ ...f, dosage: e.target.value }))} required />
                            </div>
                            <div className="form-group">
                                <label>Tần suất *</label>
                                <input type="text" value={editMedForm.frequency} onChange={e => setEditMedForm(f => ({ ...f, frequency: e.target.value }))} required />
                            </div>
                            <div className="form-group">
                                <label>Thời điểm uống (cách nhau dấu phẩy)</label>
                                <input type="text" value={editMedForm.timeOfDay} onChange={e => setEditMedForm(f => ({ ...f, timeOfDay: e.target.value }))} />
                            </div>
                            {editMedError && <div className="form-error">{editMedError}</div>}
                            {editMedSuccess && <div className="form-success">{editMedSuccess}</div>}
                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowEditMedModal(null)} disabled={editMedLoading}>Hủy</button>
                                <button type="submit" className="btn-submit" disabled={editMedLoading}>{editMedLoading ? 'Đang lưu...' : 'Lưu'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal tạo lịch hẹn tái khám */}
            {showCreateAppointmentModal && (
                <div className="add-treatment-plan-modal-overlay" onClick={() => setShowCreateAppointmentModal(false)}>
                    <div className="add-treatment-plan-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <h2>Tạo lịch hẹn tái khám</h2>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setCreateAppointmentLoading(true);
                            setCreateAppointmentError('');
                            setCreateAppointmentSuccess('');
                            try {
                                const token = localStorage.getItem('token');
                                let formattedTime = appointmentForm.appointmentTime;
                                if (formattedTime && formattedTime.length === 5) formattedTime += ':00';
                                if (!appointmentForm.appointmentDate || !formattedTime) {
                                    setCreateAppointmentError('Vui lòng chọn ngày và khung giờ.');
                                    setCreateAppointmentLoading(false);
                                    toast.error('Vui lòng chọn ngày và khung giờ.');
                                    return;
                                }
                                if (availableSlots.length === 0) {
                                    setCreateAppointmentError('Không có khung giờ trống cho ngày này.');
                                    setCreateAppointmentLoading(false);
                                    toast.error('Không có khung giờ trống cho ngày này.');
                                    return;
                                }
                                const body = {
                                    doctorId: doctorId,
                                    patientId: patient.id,
                                    medicalServiceId: 4,
                                    appointmentDate: appointmentForm.appointmentDate,
                                    appointmentTime: formattedTime,
                                    notes: appointmentForm.notes
                                };
                                await axios.post('http://localhost:8080/api/appointments/doctor-create', body, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                setCreateAppointmentSuccess('Tạo lịch hẹn thành công!');
                                setShowCreateAppointmentModal(false);
                                setAppointmentForm({ appointmentDate: dayjs().format('YYYY-MM-DD'), appointmentTime: '', notes: 'Hẹn tái khám' });
                                toast.success('Tạo lịch hẹn tái khám thành công!');
                                // Reload lại modal (gọi lại API lấy appointments nếu cần)
                                if (isOpen && patient?.id) {
                                    setLoadingPlans(true);
                                    const token = localStorage.getItem('token');
                                    axios.get(`http://localhost:8080/api/patient-treatment-plans/patient/${patient.id}`, {
                                        headers: { Authorization: `Bearer ${token}` }
                                    })
                                        .then(res => setActivePlans(res.data))
                                        .catch(() => setActivePlans([]))
                                        .finally(() => setLoadingPlans(false));
                                }
                            } catch (err) {
                                setCreateAppointmentError('Không thể tạo lịch hẹn.');
                                toast.error('Không thể tạo lịch hẹn tái khám.');
                            } finally {
                                setCreateAppointmentLoading(false);
                            }
                        }}>
                            <div className="form-group">
                                <label>Ngày hẹn *</label>
                                <input type="date" value={appointmentForm.appointmentDate} onChange={e => setAppointmentForm(f => ({ ...f, appointmentDate: e.target.value }))} required />
                            </div>
                            <div className="form-group">
                                <label>Chọn khung giờ *</label>
                                {slotsLoading ? (
                                    <div>Đang tải khung giờ...</div>
                                ) : availableSlots.length === 0 ? (
                                    <div style={{ color: 'red' }}>Không có khung giờ trống cho ngày này.</div>
                                ) : (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                        {availableSlots.map(slot => (
                                            <button
                                                key={slot}
                                                type="button"
                                                className={appointmentForm.appointmentTime === slot ? 'slot selected' : 'slot'}
                                                style={{
                                                    minWidth: 90,
                                                    padding: '8px 0',
                                                    border: '1.5px solid #d1d5db',
                                                    borderRadius: 8,
                                                    background: appointmentForm.appointmentTime === slot ? '#e0e7ff' : '#f9fafb',
                                                    color: appointmentForm.appointmentTime === slot ? '#1d4ed8' : '#222',
                                                    fontWeight: 500,
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => setAppointmentForm(f => ({ ...f, appointmentTime: slot }))}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Ghi chú</label>
                                <input type="text" value={appointmentForm.notes} onChange={e => setAppointmentForm(f => ({ ...f, notes: e.target.value }))} />
                            </div>
                            {createAppointmentError && <div className="form-error">{createAppointmentError}</div>}
                            {createAppointmentSuccess && <div className="form-success">{createAppointmentSuccess}</div>}
                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowCreateAppointmentModal(false)} disabled={createAppointmentLoading}>Hủy</button>
                                <button type="submit" className="btn-submit" disabled={createAppointmentLoading}>{createAppointmentLoading ? 'Đang lưu...' : 'Tạo lịch hẹn'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDetailModal; 