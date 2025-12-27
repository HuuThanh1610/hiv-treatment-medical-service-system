/**
 * Component hiển thị lịch sử điều trị của bệnh nhân
 * Gồm 2 tab: Lịch sử thay đổi phác đồ và Lịch sử thay đổi đơn thuốc
 *
 * Backend APIs sử dụng:
 * - /api/prescription-history/patient/{id} - Lấy lịch sử đơn thuốc (có createdAt và oldMedications)
 * - /api/treatment-history/patient/{id} - Lấy lịch sử phác đồ
 * - /api/doctors - Map tên bác sĩ
 * - /api/arv-protocol/active - Map tên phác đồ
 */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaHistory, FaPills, FaExchangeAlt, FaCalendarAlt, FaUser, FaStethoscope, FaUserMd } from 'react-icons/fa';
import './PatientTreatmentHistory.scss';

const PatientTreatmentHistory = () => {
    // State quản lý loading và error
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State dữ liệu chính
    const [patientId, setPatientId] = useState(null);
    const [treatmentHistory, setTreatmentHistory] = useState([]); // Lịch sử phác đồ
    const [prescriptionHistory, setPrescriptionHistory] = useState([]); // Lịch sử đơn thuốc (có createdAt)
    const [prescriptionDetails, setPrescriptionDetails] = useState({}); // Chi tiết thuốc (fallback)

    // State UI
    const [activeTab, setActiveTab] = useState('treatment');

    // State mapping data
    const [doctorMap, setDoctorMap] = useState({}); // Map doctorId -> doctorName
    const [protocolMap, setProtocolMap] = useState({}); // Map protocolId -> protocolName

    // Effect hooks để load dữ liệu khi component mount
    useEffect(() => {
        fetchPatientData(); // Lấy patientId từ token
    }, []);

    useEffect(() => {
        if (patientId) {
            fetchHistoryData(); // Lấy lịch sử khi có patientId
        }
    }, [patientId]);

    /**
     * Lấy thông tin bệnh nhân từ JWT token
     * API: /api/patients/me - trả về patient info với id
     */
    const fetchPatientData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/patients/me', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data?.id) {
                setPatientId(response.data.id); // Set patientId để trigger fetchHistoryData
            } else {
                setError('Không thể xác định thông tin bệnh nhân');
            }
        } catch (error) {
            console.error('Error fetching patient data:', error);
            setError('Không thể tải thông tin bệnh nhân');
        }
    };

    const fetchHistoryData = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');

            // Gọi API song song để lấy dữ liệu lịch sử điều trị
            const [doctorRes, protocolRes, treatmentHistoryRes, prescriptionHistoryRes] = await Promise.all([
                // API lấy danh sách bác sĩ để map tên bác sĩ
                axios.get('http://localhost:8080/api/doctors', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                // API lấy danh sách phác đồ ARV để map tên phác đồ
                axios.get('http://localhost:8080/api/arv-protocol/active', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                // API lấy lịch sử thay đổi phác đồ điều trị của bệnh nhân
                axios.get(`http://localhost:8080/api/treatment-history/patient/${patientId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                // API lấy lịch sử thay đổi đơn thuốc của bệnh nhân (có createdAt và oldMedications)
                axios.get(`http://localhost:8080/api/prescription-history/patient/${patientId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            // Tạo map bác sĩ: id -> tên để hiển thị tên bác sĩ trong lịch sử
            const doctorMapObj = {};
            (doctorRes.data || []).forEach(d => {
                doctorMapObj[d.id] = d.fullName || d.username;
            });
            setDoctorMap(doctorMapObj);

            // Tạo map phác đồ: id -> tên để hiển thị tên phác đồ trong lịch sử
            const protocolMapObj = {};
            (protocolRes.data || []).forEach(p => {
                protocolMapObj[p.id] = p.name;
            });
            setProtocolMap(protocolMapObj);

            // Set dữ liệu lịch sử từ API response
            setTreatmentHistory(treatmentHistoryRes.data || []);
            setPrescriptionHistory(prescriptionHistoryRes.data || []); // Đã có createdAt và oldMedications

            // Lấy thông tin chi tiết thuốc cho các đơn thuốc (fallback nếu oldMedications không có)
            await fetchPrescriptionDetails(prescriptionHistoryRes.data || []);

        } catch (error) {
            console.error('Error fetching history data:', error);
            setError('Không thể tải lịch sử điều trị');
        } finally {
            setLoading(false);
        }
    };

    // Lấy chi tiết thuốc trong đơn thuốc (fallback nếu API prescription-history không trả về oldMedications)
    const fetchPrescriptionDetails = async (prescriptionHistoryList) => {
        const token = localStorage.getItem('token');
        const details = {};

        for (const history of prescriptionHistoryList) {
            try {
                // API lấy danh sách thuốc trong đơn thuốc cụ thể
                const response = await axios.get(
                    `http://localhost:8080/api/prescription-medications/prescription/${history.prescriptionId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                details[history.prescriptionId] = response.data || [];
            } catch (error) {
                console.warn(`Could not fetch details for prescription ${history.prescriptionId}:`, error);
                details[history.prescriptionId] = [];
            }
        }

        setPrescriptionDetails(details);
    };

    /**
     * Tạo tên đơn thuốc để hiển thị
     * Backend API /api/prescription-history/patient/{id} trả về:
     * - createdAt: thời gian tạo lịch sử
     * - oldMedications: danh sách thuốc trong đơn thuốc cũ (từ PrescriptionHistoryMapper)
     *
     * Logic: Ưu tiên oldMedications từ API, fallback về prescriptionDetails
     */
    const getPrescriptionName = (prescriptionId, history = null) => {
        // Ưu tiên sử dụng oldMedications từ API response (đã được map trong backend)
        if (history && history.oldMedications && history.oldMedications.length > 0) {
            const medications = history.oldMedications;
            if (medications.length === 1) {
                return medications[0].name || '';
            } else {
                const firstMed = medications[0].name || '';
                return `${firstMed} + ${medications.length - 1} thuốc khác`;
            }
        }

        // Fallback về prescriptionDetails nếu không có oldMedications
        const medications = prescriptionDetails[prescriptionId] || [];
        if (medications.length === 0) return '';

        if (medications.length === 1) {
            return medications[0].medicationName || medications[0].name || '';
        } else {
            const firstMed = medications[0].medicationName || medications[0].name || '';
            return `${firstMed} + ${medications.length - 1} thuốc khác`;
        }
    };

    // Format ngày tháng cho hiển thị
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // Format ngày giờ từ createdAt (2025-08-05T22:07:55.525108) thành "05/08/2025 22:07"
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'N/A';
        try {
            const date = new Date(dateTimeString);
            return date.toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'N/A';
        }
    };

    // Loading và error states
    if (loading) {
        return <div className="treatment-history-loading">Đang tải lịch sử điều trị...</div>;
    }

    if (error) {
        return <div className="treatment-history-error">{error}</div>;
    }

    return (
        <div className="patient-treatment-history">
            {/* Header section */}
            <div className="history-header">
                <h2><FaHistory /> Lịch sử điều trị</h2>
                <p>Xem lại các thay đổi trong quá trình điều trị của bạn</p>
            </div>

            {/* Tab navigation - 2 tabs: phác đồ và đơn thuốc */}
            <div className="history-tabs">
                <button
                    className={`tab-button ${activeTab === 'treatment' ? 'active' : ''}`}
                    onClick={() => setActiveTab('treatment')}
                >
                    <FaExchangeAlt /> Lịch sử thay đổi phác đồ
                </button>
                <button
                    className={`tab-button ${activeTab === 'prescription' ? 'active' : ''}`}
                    onClick={() => setActiveTab('prescription')}
                >
                    <FaPills /> Lịch sử thay đổi đơn thuốc
                </button>
            </div>

            <div className="history-content">
                {activeTab === 'treatment' && (
                    <div className="treatment-history-tab">
                        <h3>Lịch sử thay đổi phác đồ điều trị</h3>
                        {treatmentHistory.length === 0 ? (
                            <div className="no-history">
                                <FaExchangeAlt />
                                <p>Chưa có thay đổi nào trong phác đồ điều trị</p>
                            </div>
                        ) : (
                            <div className="history-list">
                                {treatmentHistory.map((history, index) => (
                                    <div key={index} className="history-item">
                                        <div className="history-timeline">
                                            <div className="timeline-dot"></div>
                                            {index < treatmentHistory.length - 1 && <div className="timeline-line"></div>}
                                        </div>
                                        <div className="history-card">
                                            <div className="history-date">
                                                <FaCalendarAlt /> {formatDateTime(history.createdAt)}
                                            </div>
                                            
                                            <div className="protocol-change">
                                                <div className="protocol-from">
                                                    <span className="label">Phác đồ cũ:</span>
                                                    <span className="value">{history.oldArvProtocolName || protocolMap[history.oldArvProtocolId] || `Protocol ${history.oldArvProtocolId}`}</span>
                                                </div>
                                                <FaExchangeAlt className="arrow-icon" />
                                                <div className="protocol-to">
                                                    <span className="label">Phác đồ mới:</span>
                                                    <span className="value">{history.newArvProtocolName || protocolMap[history.newArvProtocolId] || `Protocol ${history.newArvProtocolId}`}</span>
                                                </div>
                                            </div>

                                            {history.reason && (
                                                <div className="change-reason">
                                                    <span className="label">Lý do thay đổi:</span>
                                                    <span className="value">{history.reason}</span>
                                                </div>
                                            )}

                                            {history.doctorName && (
                                                <div className="doctor-info">
                                                    <span className="label"><FaUserMd /> Bác sĩ thay đổi:</span>
                                                    <span className="value">{history.doctorName}</span>
                                                </div>
                                            )}

                                            {history.notes && (
                                                <div className="history-notes">
                                                    <span className="label">Ghi chú:</span>
                                                    <span className="value">{history.notes}</span>
                                                </div>
                                            )}

                                            <div className="treatment-period">
                                                <span className="label">Ngày bắt đầu:</span>
                                                <span className="value">{formatDate(history.startDate)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab hiển thị lịch sử thay đổi đơn thuốc - Tab chính được sửa */}
                {activeTab === 'prescription' && (
                    <div className="prescription-history-tab">
                        <h3>Lịch sử thay đổi đơn thuốc</h3>
                        {prescriptionHistory.length === 0 ? (
                            <div className="no-history">
                                <FaPills />
                                <p>Chưa có thay đổi nào trong đơn thuốc</p>
                            </div>
                        ) : (
                            <div className="history-list">
                                {/*
                                    Map qua prescriptionHistory từ API /api/prescription-history/patient/{id}
                                    Mỗi history có: createdAt, prescriptionId, oldMedications
                                */}
                                {prescriptionHistory.map((history, index) => {
                                    // Fallback medications từ prescriptionDetails nếu oldMedications không có
                                    const medications = prescriptionDetails[history.prescriptionId] || [];
                                    return (
                                        <div key={index} className="history-item">
                                            {/* Timeline UI */}
                                            <div className="history-timeline">
                                                <div className="timeline-dot"></div>
                                                {index < prescriptionHistory.length - 1 && <div className="timeline-line"></div>}
                                            </div>
                                            <div className="history-card">
                                                <div className="history-date">
                                                    {/*
                                                        ✅ QUAN TRỌNG: Hiển thị ngày từ createdAt thay vì N/A
                                                        Backend trả về: "createdAt": "2025-08-05T22:07:55.525108"
                                                        Frontend hiển thị: "05/08/2025 22:07"
                                                    */}
                                                    <FaCalendarAlt /> {formatDateTime(history.createdAt || history.modifiedDate || history.createdDate || history.changeDate)}
                                                </div>

                                                <div className="prescription-info">
                                                    <div className="prescription-id">
                                                        <span className="label">Đơn thuốc:</span>
                                                        <span className="value">
                                                            #{history.prescriptionId}
                                                            {/*
                                                                ✅ QUAN TRỌNG: Hiển thị tên đơn thuốc từ oldMedications
                                                                Backend trả về: oldMedications: [{name: "Lamivudine", ...}]
                                                                Frontend hiển thị: "#2 (Lamivudine)" hoặc "#2 (Lamivudine + 2 thuốc khác)"
                                                            */}
                                                            {getPrescriptionName(history.prescriptionId, history) &&
                                                                ` (${getPrescriptionName(history.prescriptionId, history)})`
                                                            }
                                                        </span>
                                                    </div>
                                                    {history.doctorId && doctorMap[history.doctorId] && (
                                                        <div className="doctor-info">
                                                            <span className="label">Bác sĩ kê đơn:</span>
                                                            <span className="value">{doctorMap[history.doctorId]}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {medications.length > 0 ? (
                                                    <div className="prescription-medications">
                                                        <span className="label">Thuốc trong đơn:</span>
                                                        <div className="medications-list">
                                                            {medications.map((med, medIndex) => (
                                                                <div key={medIndex} className="medication-item">
                                                                    <span className="med-name">
                                                                        {med.name || med.medicationName || `Thuốc ID: ${med.medicationId}`}
                                                                    </span>
                                                                    <span className="med-dosage">{med.dosage || 'N/A'}</span>
                                                                    <span className="med-frequency">{med.frequency || 'N/A'}</span>
                                                                    {med.notes && <span className="med-notes">{med.notes}</span>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="no-medications">
                                                        <span className="label">Thuốc trong đơn:</span>
                                                        <span className="value">Không có thông tin thuốc</span>
                                                    </div>
                                                )}

                                                {history.changeReason && (
                                                    <div className="change-reason">
                                                        <span className="label">Lý do thay đổi:</span>
                                                        <span className="value">{history.changeReason}</span>
                                                    </div>
                                                )}

                                                {history.notes && (
                                                    <div className="history-notes">
                                                        <span className="label">Ghi chú:</span>
                                                        <span className="value">{history.notes}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientTreatmentHistory;
