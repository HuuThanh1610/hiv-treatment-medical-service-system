import React, { useState, useEffect } from 'react';
import './PatientTreatmentPlan.scss';
import axios from 'axios';
import PatientService from '../../Services/PatientService';
import DoctorService from '../../Services/DoctorService';
import { FaEdit, FaTrash, FaEye, FaPlus, FaHistory } from 'react-icons/fa';
import { toast } from 'react-toastify';

const PatientTreatmentPlan = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        patientId: '',
        doctorId: '',
        arvProtocolId: '',
        sourceLabRequestId: '',
        decisionSummary: '',
        startDate: '',
        endDate: '',
        notes: ''
    });
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [arvProtocols, setArvProtocols] = useState([]);
    const [labRequests, setLabRequests] = useState([]);
    const [labRequestError, setLabRequestError] = useState(null);
    const [arvProtocolError, setArvProtocolError] = useState(null);
    const [editPlan, setEditPlan] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    const [editSuccess, setEditSuccess] = useState('');
    
    // Tab management and treatment history state
    const [activeTab, setActiveTab] = useState('plans');
    const [treatmentHistory, setTreatmentHistory] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        const fetchPlans = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:8080/api/patient-treatment-plans/all', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Không thể tải treatment plan');
                const data = await res.json();
                setPlans(data);
            } catch (err) {
                setError('Không thể tải treatment plan');
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    // Fetch all patients, doctors, ARV protocols, and lab requests for mapping
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setLabRequestError('Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại.');
                    setArvProtocolError('Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại.');
                    return;
                }
                const [patientsRes, doctorsRes, arvRes, labReqRes] = await Promise.all([
                    PatientService.getAllPatients().catch(e => []),
                    DoctorService.getAllDoctors().catch(e => []),
                    axios.get('http://localhost:8080/api/arv-protocol', {
                        headers: { Authorization: `Bearer ${token}` }
                    }).then(res => res.data).catch(e => { setArvProtocolError('Không lấy được danh sách phác đồ ARV'); return []; }),
                    axios.get('http://localhost:8080/api/lab-requests', {
                        headers: { Authorization: `Bearer ${token}` }
                    }).then(res => res.data).catch(e => { setLabRequestError('Không lấy được danh sách Lab Request'); return []; })
                ]);
                setPatients(patientsRes);
                setDoctors(doctorsRes);
                setArvProtocols(arvRes);
                setLabRequests(labReqRes);
                console.log('DEBUG labRequests:', labReqRes);
                console.log('DEBUG arvProtocols:', arvRes);
            } catch (err) {
                setLabRequestError('Lỗi không xác định khi lấy dữ liệu Lab Request');
                setArvProtocolError('Lỗi không xác định khi lấy dữ liệu ARV Protocol');
            }
        };
        fetchAll();
    }, []);

    // Debug useEffect to check editPlan data
    useEffect(() => {
        if (editPlan) {
            console.log('EditPlan data:', editPlan);
            console.log('Available fields:', Object.keys(editPlan));
        }
    }, [editPlan]);

    // Helper functions to map id to name
    const getPatientName = (id) => {
        const p = patients.find(u => u.id === id);
        return p ? p.fullName || p.name || p.username || p.email || id : id;
    };
    const getDoctorName = (id) => {
        const d = doctors.find(u => u.id === id || u.userId === id);
        return d ? d.fullName || d.name || d.username || d.email || id : id;
    };
    const getARVProtocolName = (id) => {
        const a = arvProtocols.find(p => p.id === id);
        return a ? a.name || id : id;
    };

    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateFormData, setUpdateFormData] = useState({
        id: '',
        patientId: '',
        doctorId: '',
        arvProtocolId: '',
        sourceLabRequestId: '',
        decisionSummary: '',
        startDate: '',
        endDate: '',
        notes: ''
    });

    const filteredPlans = plans.filter(plan =>
        plan.patientId?.toString().includes(searchTerm) ||
        plan.doctorId?.toString().includes(searchTerm) ||
        plan.arvProtocolId?.toString().includes(searchTerm) ||
        (plan.decisionSummary && plan.decisionSummary.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (plan.notes && plan.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddPlan = (e) => {
        e.preventDefault();
        setPlans(prev => [
            {
                id: Date.now(),
                ...formData,
                patientId: Number(formData.patientId),
                doctorId: Number(formData.doctorId),
                arvProtocolId: Number(formData.arvProtocolId),
                sourceLabRequestId: formData.sourceLabRequestId ? Number(formData.sourceLabRequestId) : '',
            },
            ...prev
        ]);
        setShowAddModal(false);
        setFormData({
            patientId: '', doctorId: '', arvProtocolId: '', sourceLabRequestId: '', decisionSummary: '', startDate: '', endDate: '', notes: ''
        });
        toast.success('Thêm kế hoạch điều trị thành công!');
    };

    const handleLabRequestChange = (e) => {
        const labRequestId = e.target.value;
        setFormData(prev => ({ ...prev, sourceLabRequestId: labRequestId }));
        const selected = labRequests.find(lr => String(lr.id) === String(labRequestId));
        if (selected) {
            setFormData(prev => ({
                ...prev,
                sourceLabRequestId: labRequestId,
                patientId: selected.patientId,
                doctorId: selected.doctorId
            }));
        }
    };

    // Function to fetch treatment history for a patient
    const fetchTreatmentHistory = async (patientId) => {
        if (!patientId) return;
        
        setHistoryLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/treatment-history/patient/${patientId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTreatmentHistory(response.data);
        } catch (error) {
            console.error('Error fetching treatment history:', error);
            toast.error('Không thể tải lịch sử điều trị');
            setTreatmentHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    // Handle viewing treatment history
    const handleViewHistory = (patientId) => {
        setSelectedPatientId(patientId);
        setActiveTab('history');
        fetchTreatmentHistory(patientId);
    };

    // Function to fetch detailed treatment plan data for editing
    const fetchDetailedPlanData = async (patientId, planId) => {
        setEditLoading(true);
        try {
            const token = localStorage.getItem('token');
            console.log('Token being used:', token ? 'Token exists' : 'No token found');
            
            const response = await axios.get(`http://localhost:8080/api/patient-treatment-plans/patient/${patientId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Find the specific plan by ID from the response
            const detailedPlans = response.data;
            console.log('All detailed plans from API:', detailedPlans);
            
            const detailedPlan = detailedPlans.find(p => p.id === planId);
            
            if (detailedPlan) {
                console.log('Detailed plan data from API:', detailedPlan);
                setEditPlan(detailedPlan);
            } else {
                console.error('Plan not found in detailed response');
                toast.error('Không tìm thấy thông tin chi tiết kế hoạch điều trị');
            }
        } catch (error) {
            console.error('Error fetching detailed plan data:', error);
            if (error.response?.status === 403) {
                toast.error('Không có quyền truy cập. Vui lòng đăng nhập lại.');
            } else {
                toast.error('Không thể tải thông tin chi tiết kế hoạch điều trị');
            }
        } finally {
            setEditLoading(false);
        }
    };

    // Handle edit plan with detailed data fetch
    const handleEditPlan = (plan) => {
        console.log('Original plan data:', plan);
        fetchDetailedPlanData(plan.patientId, plan.id);
    };

    return (
        <div className="patient-treatment-plan-table">
            <div className="table-header">
                <h2>Kế hoạch điều trị bệnh nhân</h2>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã bệnh nhân, bác sĩ, phác đồ..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button className="add-button" onClick={() => setShowAddModal(true)}>
                        <FaPlus style={{ marginRight: 4 }} /> Thêm kế hoạch
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation" style={{ 
                display: 'flex', 
                borderBottom: '1px solid #e8e8e8', 
                marginBottom: '20px' 
            }}>
                <button 
                    className={`tab-button ${activeTab === 'plans' ? 'active' : ''}`}
                    onClick={() => setActiveTab('plans')}
                    style={{
                        padding: '12px 24px',
                        border: 'none',
                        background: activeTab === 'plans' ? '#1890ff' : 'transparent',
                        color: activeTab === 'plans' ? 'white' : '#666',
                        cursor: 'pointer',
                        borderRadius: '4px 4px 0 0'
                    }}
                >
                    Kế hoạch điều trị
                </button>
                <button 
                    className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                    style={{
                        padding: '12px 24px',
                        border: 'none',
                        background: activeTab === 'history' ? '#1890ff' : 'transparent',
                        color: activeTab === 'history' ? 'white' : '#666',
                        cursor: 'pointer',
                        borderRadius: '4px 4px 0 0',
                        marginLeft: '4px'
                    }}
                >
                    Lịch sử điều trị {selectedPatientId && `(Bệnh nhân ${getPatientName(selectedPatientId)})`}
                </button>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'plans' && (
                <>
                    {loading ? (
                        <div>Đang tải...</div>
                    ) : error ? (
                        <div style={{ color: 'red' }}>{error}</div>
                    ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Tên bệnh nhân</th>
                            <th>Tên bác sĩ</th>
                            <th>Tên phác đồ ARV</th>
                            <th>Source Lab Request ID</th>
                            <th>Decision Summary</th>
                            <th>Thời gian</th>
                            <th>Notes</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPlans.map(plan => (
                            <tr key={plan.id}>
                                <td>{plan.patientName}</td>
                                <td>{plan.doctorName}</td>
                                <td>{plan.arvProtocolName}</td>
                                <td>{plan.sourceLabRequestId}</td>
                                <td>{plan.decisionSummary}</td>
                                <td>{plan.startDate || ''}{plan.startDate && plan.endDate ? ' - ' : ''}{plan.endDate || ''}</td>
                                <td>{plan.notes}</td>
                                <td>
                                    <button 
                                        onClick={() => handleEditPlan(plan)} 
                                        title="Sửa kế hoạch" 
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1890ff', marginRight: '8px' }}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button 
                                        onClick={() => handleViewHistory(plan.patientId)} 
                                        title="Xem lịch sử điều trị" 
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52c41a' }}
                                    >
                                        <FaHistory />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredPlans.length === 0 && (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center' }}>
                                    Không có kế hoạch điều trị nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                    )}
                </>
            )}

            {/* Treatment History Tab */}
            {activeTab === 'history' && (
                <div className="treatment-history">
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '20px' 
                    }}>
                        <h3>Lịch sử điều trị - Bệnh nhân: {selectedPatientId && getPatientName(selectedPatientId)}</h3>
                        <button 
                            onClick={() => setActiveTab('plans')}
                            style={{
                                padding: '8px 16px',
                                background: '#f0f0f0',
                                border: '1px solid #d9d9d9',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Quay lại kế hoạch điều trị
                        </button>
                    </div>

                    {historyLoading ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải lịch sử điều trị...</div>
                    ) : treatmentHistory.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                            Không có lịch sử điều trị nào.
                        </div>
                    ) : (
                        <div className="history-timeline">
                            {treatmentHistory.map((history, index) => (
                                <div key={history.id} className="history-item" style={{
                                    background: '#f9f9f9',
                                    border: '1px solid #e8e8e8',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    marginBottom: '16px',
                                    position: 'relative'
                                }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'flex-start',
                                        marginBottom: '12px'
                                    }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 8px 0', color: '#1890ff' }}>
                                                Thay đổi kế hoạch điều trị #{history.id}
                                            </h4>
                                            <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                                                Ngày thay đổi: {new Date(history.changedAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                        <span style={{
                                            background: '#52c41a',
                                            color: 'white',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px'
                                        }}>
                                            Lịch sử
                                        </span>
                                    </div>

                                    <div className="history-details" style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: '1fr 1fr', 
                                        gap: '16px' 
                                    }}>
                                        <div>
                                            <strong>Phác đồ ARV cũ:</strong> {history.oldProtocolName || 'N/A'}
                                            <br />
                                            <strong>Phác đồ ARV mới:</strong> {history.newProtocolName || 'N/A'}
                                            <br />
                                            {history.reason && (
                                                <>
                                                    <strong>Lý do thay đổi:</strong>
                                                    <div style={{ 
                                                        background: '#fff', 
                                                        padding: '8px', 
                                                        border: '1px solid #e8e8e8', 
                                                        borderRadius: '4px',
                                                        marginTop: '4px',
                                                        fontSize: '14px'
                                                    }}>
                                                        {history.reason}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div>
                                            <strong>Bác sĩ thực hiện:</strong> {getDoctorName(history.doctorId)}
                                            <br />
                                            <strong>Ngày bắt đầu cũ:</strong> {history.oldStartDate ? new Date(history.oldStartDate).toLocaleDateString('vi-VN') : 'N/A'}
                                            <br />
                                            <strong>Ngày kết thúc cũ:</strong> {history.oldEndDate ? new Date(history.oldEndDate).toLocaleDateString('vi-VN') : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Thêm kế hoạch điều trị</h3>
                            <button className="close-button" onClick={() => setShowAddModal(false)}>&times;</button>
                        </div>
                        <form className="service-form" onSubmit={handleAddPlan}>
                            {/* Ẩn patientId và doctorId, chỉ hiển thị khi debug */}
                            {/* <div className="form-group">
                                <label>Patient ID *</label>
                                <input type="number" name="patientId" value={formData.patientId} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Doctor ID *</label>
                                <input type="number" name="doctorId" value={formData.doctorId} onChange={handleInputChange} required />
                            </div> */}
                            <div className="form-group">
                                <label>Chọn yêu cầu xét nghiệm (Lab Request) *</label>
                                {labRequestError && <div style={{ color: 'red', marginBottom: 8 }}>{labRequestError}</div>}
                                <select name="sourceLabRequestId" value={formData.sourceLabRequestId} onChange={handleLabRequestChange} required>
                                    <option value="">-- Chọn Lab Request --</option>
                                    {(formData.patientId ? labRequests.filter(lr => lr.patientId === Number(formData.patientId)) : labRequests).map(lr => {
                                        const patient = patients.find(p => p.id === lr.patientId);
                                        const doctor = doctors.find(d => d.id === lr.doctorId);
                                        return (
                                            <option key={lr.id} value={lr.id}>
                                                {`#${lr.id} | BN: ${patient ? patient.fullName : lr.patientId} | BS: ${doctor ? doctor.fullName : lr.doctorId} | Ngày: ${lr.requestDate ? new Date(lr.requestDate).toLocaleDateString('vi-VN') : ''}`}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Phác đồ ARV *</label>
                                {arvProtocolError && <div style={{ color: 'red', marginBottom: 8 }}>{arvProtocolError}</div>}
                                <select name="arvProtocolId" value={formData.arvProtocolId} onChange={handleInputChange} required>
                                    <option value="">-- Chọn phác đồ ARV --</option>
                                    {arvProtocols && arvProtocols.length > 0 ? arvProtocols.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    )) : <option disabled>Không có phác đồ ARV nào</option>}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Decision Summary</label>
                                <input type="text" name="decisionSummary" value={formData.decisionSummary} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Start Date</label>
                                <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>End Date</label>
                                <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <textarea name="notes" value={formData.notes} onChange={handleInputChange} />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="save-button">Thêm mới</button>
                                <button type="button" className="cancel-button" onClick={() => setShowAddModal(false)}>Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal sửa kế hoạch điều trị */}
            {editPlan && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Sửa kế hoạch điều trị</h3>
                            <button className="close-button" onClick={() => setEditPlan(null)}>&times;</button>
                        </div>
                        <div className="alert-info" style={{ 
                            background: '#e6f7ff', 
                            border: '1px solid #91d5ff', 
                            borderRadius: '4px', 
                            padding: '12px', 
                            marginBottom: '16px',
                            fontSize: '14px',
                            color: '#1890ff'
                        }}>
                            <strong>Lưu ý:</strong> Khi cập nhật kế hoạch điều trị, hệ thống sẽ tự động lưu thông tin cũ vào lịch sử điều trị. 
                            Vui lòng nhập lý do thay đổi để tạo bản ghi lịch sử đầy đủ.
                        </div>
                        <form className="service-form" onSubmit={async (e) => {
                            e.preventDefault();
                            setEditLoading(true);
                            setEditError('');
                            setEditSuccess('');
                            try {
                                const token = localStorage.getItem('token');
                                const body = {
                                    patientId: Number(editPlan.patientId),
                                    doctorId: Number(editPlan.doctorId),
                                    arvProtocolId: Number(editPlan.arvProtocolId),
                                    sourceLabRequestId: Number(editPlan.sourceLabRequestId),
                                    decisionSummary: editPlan.decisionSummary,
                                    startDate: editPlan.startDate,
                                    endDate: editPlan.endDate,
                                    notes: editPlan.notes,
                                    arvProtocolChangeReason: editPlan.arvProtocolChangeReason || null,
                                    prescriptionChangeReason: editPlan.prescriptionChangeReason || null
                                };
                                await axios.put(`http://localhost:8080/api/patient-treatment-plans/${editPlan.id}`, body, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                setEditSuccess('Cập nhật thành công!');
                                // Reload plans
                                const res = await fetch('http://localhost:8080/api/patient-treatment-plans/all', {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                });
                                const data = await res.json();
                                setPlans(data);
                                setTimeout(() => setEditPlan(null), 1000);
                                toast.success('Cập nhật kế hoạch điều trị thành công!');
                            } catch (err) {
                                setEditError('Không thể cập nhật kế hoạch điều trị.');
                            } finally {
                                setEditLoading(false);
                            }
                        }}>
                            {editLoading && !editPlan.patientId ? (
                                <div style={{ padding: '20px', textAlign: 'center' }}>
                                    <div>Đang tải thông tin chi tiết...</div>
                                </div>
                            ) : (
                                <>
                                    <div className="form-row">
                                <div className="form-group">
                                    <label>Bệnh nhân *</label>
                                    <select value={editPlan.patientId || ''} onChange={e => setEditPlan({ ...editPlan, patientId: e.target.value })} required>
                                        <option value="">-- Chọn bệnh nhân --</option>
                                        {patients.map(p => (
                                            <option key={p.id} value={p.id}>{getPatientName(p.id)} (ID: {p.id})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Bác sĩ *</label>
                                    <select value={editPlan.doctorId || ''} onChange={e => setEditPlan({ ...editPlan, doctorId: e.target.value })} required>
                                        <option value="">-- Chọn bác sĩ --</option>
                                        {doctors.map(d => (
                                            <option key={d.id || d.userId} value={d.id || d.userId}>{getDoctorName(d.id || d.userId)} (ID: {d.id || d.userId})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Lab Request</label>
                                <select value={editPlan.sourceLabRequestId || ''} onChange={e => setEditPlan({ ...editPlan, sourceLabRequestId: e.target.value })}>
                                    <option value="">-- Chọn Lab Request (tùy chọn) --</option>
                                    {labRequests.map(lr => (
                                        <option key={lr.id} value={lr.id}>ID: {lr.id} - Bệnh nhân: {getPatientName(lr.patientId)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Phác đồ ARV *</label>
                                <select value={editPlan.arvProtocolId || ''} onChange={e => setEditPlan({ ...editPlan, arvProtocolId: e.target.value })} required>
                                    <option value="">-- Chọn phác đồ ARV --</option>
                                    {arvProtocols.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Lý do thay đổi phác đồ ARV</label>
                                <textarea 
                                    value={editPlan.arvProtocolChangeReason || ''} 
                                    onChange={e => setEditPlan({ ...editPlan, arvProtocolChangeReason: e.target.value })} 
                                    rows={3}
                                    placeholder="Nhập lý do thay đổi phác đồ ARV (ví dụ: kháng thuốc, tác dụng phụ, cải thiện hiệu quả...)"
                                    style={{ resize: 'vertical' }}
                                />
                                <small style={{ color: '#666', fontSize: '12px' }}>
                                    Thông tin này sẽ được lưu vào lịch sử điều trị để theo dõi quá trình thay đổi
                                </small>
                            </div>
                            <div className="form-group">
                                <label>Lý do thay đổi đơn thuốc</label>
                                <textarea 
                                    value={editPlan.prescriptionChangeReason || ''} 
                                    onChange={e => setEditPlan({ ...editPlan, prescriptionChangeReason: e.target.value })} 
                                    rows={3}
                                    placeholder="Nhập lý do thay đổi đơn thuốc (ví dụ: điều chỉnh liều, thêm thuốc hỗ trợ, dừng thuốc...)"
                                    style={{ resize: 'vertical' }}
                                />
                                <small style={{ color: '#666', fontSize: '12px' }}>
                                    Thông tin này sẽ được lưu vào lịch sử đơn thuốc để theo dõi quá trình thay đổi
                                </small>
                            </div>
                            <div className="form-group">
                                <label>Tóm tắt quyết định</label>
                                <input type="text" value={editPlan.decisionSummary || ''} onChange={e => setEditPlan({ ...editPlan, decisionSummary: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ngày bắt đầu</label>
                                    <input type="date" value={editPlan.startDate || ''} onChange={e => setEditPlan({ ...editPlan, startDate: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Ngày kết thúc</label>
                                    <input type="date" value={editPlan.endDate || ''} onChange={e => setEditPlan({ ...editPlan, endDate: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Ghi chú</label>
                                <textarea value={editPlan.notes || ''} onChange={e => setEditPlan({ ...editPlan, notes: e.target.value })} rows={2} />
                            </div>
                            {editError && <div className="form-error">{editError}</div>}
                            {editSuccess && <div className="form-success">{editSuccess}</div>}
                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setEditPlan(null)} disabled={editLoading}>Hủy</button>
                                <button type="submit" className="btn-submit" disabled={editLoading}>{editLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
                            </div>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientTreatmentPlan; 