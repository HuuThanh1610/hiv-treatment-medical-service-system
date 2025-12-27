import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DoctorLabRequestView.scss';
import { FaTimes, FaPlus, FaFileAlt, FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const DoctorLabRequestView = () => {
    const [labRequests, setLabRequests] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [labTestTypes, setLabTestTypes] = useState([]);
    const [form, setForm] = useState({ appointmentId: '', labRequestItems: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedTestType, setSelectedTestType] = useState('');
    const [testTypeNotes, setTestTypeNotes] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // New state for redesigned table
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL', 'PENDING', 'COMPLETED'

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    const statusDisplayMap = {
        PENDING: 'Đang xử lý',
        COMPLETED: 'Hoàn thành',
    };

    // Fetch danh sách các request xét nghiệm đã tạo
    useEffect(() => {
        const fetchLabRequests = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:8080/api/lab-requests', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLabRequests(res.data);
            } catch (err) {
                setLabRequests([]);
                console.error("Failed to fetch lab requests:", err);
            }
        };
        fetchLabRequests();
    }, [showModal]);

    // Fetch danh sách cuộc hẹn của bác sĩ
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:8080/api/appointments/my-doctor-appointments', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAppointments(res.data);
            } catch (err) {
                setAppointments([]);
            }
        };
        if (showModal) fetchAppointments();
    }, [showModal]);

    // Fetch danh sách loại xét nghiệm
    useEffect(() => {
        const fetchLabTestTypes = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:8080/api/lab-test-types', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLabTestTypes(res.data);
            } catch (err) {
                setLabTestTypes([]);
            }
        };
        if (showModal) fetchLabTestTypes();
    }, [showModal]);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'appointmentId') {
            setForm(prev => ({ ...prev, appointmentId: value }));
        } else if (name === 'isUrgent') {
            setForm(prev => ({ ...prev, isUrgent: checked }));
        }
    };

    const handleAddTestType = () => {
        const id = parseInt(selectedTestType);
        if (id && !form.labRequestItems.some(item => item.testTypeId === id)) {
            setForm(prev => ({
                ...prev,
                labRequestItems: [...prev.labRequestItems, { testTypeId: id, notes: testTypeNotes }]
            }));
            setSelectedTestType('');
            setTestTypeNotes('');
        }
    };

    const handleRemoveTestType = (id) => {
        setForm(prev => ({
            ...prev,
            labRequestItems: prev.labRequestItems.filter(item => item.testTypeId !== id)
        }));
    };

    const handleTestTypeNotesChange = (e) => {
        setTestTypeNotes(e.target.value);
    };

    const handleTestTypeNoteEdit = (id, value) => {
        setForm(prev => ({
            ...prev,
            labRequestItems: prev.labRequestItems.map(item =>
                item.testTypeId === id ? { ...item, notes: value } : item
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg('');
        try {
            const token = localStorage.getItem('token');
            const selectedAppt = appointments.find(a => a.id === parseInt(form.appointmentId));
            if (!selectedAppt) throw new Error('Vui lòng chọn cuộc hẹn');
            if (!form.labRequestItems || form.labRequestItems.length === 0) throw new Error('Vui lòng chọn ít nhất một loại xét nghiệm');
            const body = {
                appointmentId: selectedAppt.id,
                patientId: selectedAppt.patientId,
                doctorId: selectedAppt.doctorId,
                isUrgent: false, // Mặc định không khẩn cấp
                labRequestItems: form.labRequestItems
            };
            await axios.post('http://localhost:8080/api/lab-requests', body, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Tạo yêu cầu xét nghiệm thành công!');
            setTimeout(() => {
                setShowModal(false);
                setForm({ appointmentId: '', labRequestItems: [] });
                setSuccessMsg('');
            }, 1200);
        } catch (err) {
            setError(err?.response?.data?.message || err.message || 'Không thể tạo request xét nghiệm.');
        } finally {
            setLoading(false);
        }
    };

    // Filtering logic
    const filteredRequests = labRequests
        .filter(req => {
            if (activeFilter === 'ALL') return true;
            // Ensure case-insensitivity
            return req.status?.toLowerCase() === activeFilter.toLowerCase();
        })
        .filter(req => {
            const search = searchTerm.toLowerCase();
            const patientName = req.patientName?.toLowerCase() || '';
            const testNames = req.labRequestItems?.map(item => item.testTypeName?.toLowerCase()).join(' ') || '';
            return patientName.includes(search) || testNames.includes(search);
        });

    // Sắp xếp tất cả các labRequests theo ngày và giờ mới nhất lên trên
    const sortedRequests = [...filteredRequests].sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

    return (
        <div className="doctor-lab-request-view appointment-table-container">
            <div className="table-header">
                <h2>Yêu cầu xét nghiệm của tôi</h2>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Tìm theo bệnh nhân, xét nghiệm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button className="add-button" onClick={() => setShowModal(true)}>+ Tạo request</button>
                </div>
            </div>

            <div className="tabs">
                <button className={`tab-btn ${activeFilter === 'ALL' ? 'active' : ''}`} onClick={() => setActiveFilter('ALL')}>Tất cả</button>
                <button className={`tab-btn ${activeFilter === 'PENDING' ? 'active' : ''}`} onClick={() => setActiveFilter('PENDING')}>Đang xử lý</button>
                <button className={`tab-btn ${activeFilter === 'COMPLETED' ? 'active' : ''}`} onClick={() => setActiveFilter('COMPLETED')}>Hoàn thành</button>
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Bệnh nhân</th>
                            <th>Các xét nghiệm</th>
                            <th>Ngày yêu cầu</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedRequests.length > 0 ? sortedRequests.map(req => (
                            <tr key={req.id}>
                                <td>{req.patientName || 'N/A'}</td>
                                <td>{req.labRequestItems?.map(item => item.testTypeName).join(', ')}</td>
                                <td>{req.requestDate ? new Date(req.requestDate).toLocaleString('vi-VN') : 'N/A'}</td>
                                <td>
                                    <span className={`status-pill ${req.status?.toLowerCase()}`}>
                                        {statusDisplayMap[req.status?.toUpperCase()] || req.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="action-btn" title="Xem chi tiết" onClick={() => setSelectedRequest(req)}>
                                        <FaFileAlt style={{ marginRight: 4 }} /> Xem chi tiết
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>Không có yêu cầu xét nghiệm nào.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content lab-request-modal" onClick={e => e.stopPropagation()}>
                        <h2 className="lab-request-title">Tạo request xét nghiệm</h2>
                        <form onSubmit={handleSubmit} className="lab-request-form">
                            <div className="form-group">
                                <label htmlFor="appointmentId">Chọn cuộc hẹn</label>
                                <select id="appointmentId" name="appointmentId" value={form.appointmentId} onChange={handleFormChange} required>
                                    <option value="">-- Chọn cuộc hẹn --</option>
                                    {appointments.map(appt => (
                                        <option key={appt.id} value={appt.id}>
                                            {appt.patientName} | {appt.medicalServiceName} | {new Date(appt.appointmentDate).toLocaleDateString()} {appt.appointmentTime?.slice(0, 5)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group testtype-row">
                                <select value={selectedTestType} onChange={e => setSelectedTestType(e.target.value)}>
                                    <option value="">-- Chọn loại xét nghiệm --</option>
                                    {labTestTypes.filter(type => !form.labRequestItems.some(item => item.testTypeId === type.id)).map(type => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Ghi chú cho loại xét nghiệm"
                                    value={testTypeNotes}
                                    onChange={handleTestTypeNotesChange}
                                    className="testtype-note-input"
                                />
                                <button type="button" className="add-button testtype-add-btn" onClick={handleAddTestType} disabled={!selectedTestType}>
                                    <FaPlus style={{ marginRight: 4 }} /> Thêm
                                </button>
                            </div>
                            <div className="selected-testtypes-list">
                                {form.labRequestItems.length === 0 ? (
                                    <span className="empty-chip">Chưa chọn loại xét nghiệm nào</span>
                                ) : (
                                    form.labRequestItems.map(item => {
                                        const type = labTestTypes.find(t => t.id === item.testTypeId);
                                        return type ? (
                                            <span key={item.testTypeId} className="selected-test-type-chip">
                                                <span className="chip-type-name">{type.name}</span>
                                                {item.notes && (
                                                    <div className="chip-note-readonly">{item.notes}</div>
                                                )}
                                                <button type="button" className="chip-remove-btn" onClick={() => handleRemoveTestType(item.testTypeId)} title="Xóa">
                                                    <FaTimes />
                                                </button>
                                            </span>
                                        ) : null;
                                    })
                                )}
                            </div>
                            {error && <div className="alert error">{error}</div>}
                            {successMsg && <div className="alert success">{successMsg}</div>}
                            <div className="form-actions">
                                <button type="button" className="cancel-button" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="save-button" disabled={loading || !form.labRequestItems.length}>
                                    {loading ? 'Đang gửi...' : 'Tạo request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedRequest && (
                <div className="form-overlay" onClick={() => setSelectedRequest(null)}>
                    <div className="form-container" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
                        <h2>Chi tiết kết quả xét nghiệm</h2>
                        <div style={{ marginBottom: 12 }}>
                            <strong>Bệnh nhân:</strong> {selectedRequest.patientName}<br />
                            <strong>Bác sĩ:</strong> {selectedRequest.doctorName}<br />
                            <strong>Ngày yêu cầu:</strong> {selectedRequest.requestDate ? new Date(selectedRequest.requestDate).toLocaleString('vi-VN') : 'N/A'}
                        </div>
                        <table className="lab-detail-table">
                            <thead>
                                <tr>
                                    <th>Loại xét nghiệm</th>
                                    <th>Kết quả</th>
                                    <th>Đơn vị</th>
                                    <th>Ngày</th>
                                    <th>Ghi chú</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedRequest.labRequestItems && selectedRequest.labRequestItems.length > 0 ? (
                                    selectedRequest.labRequestItems.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.testTypeName}</td>
                                            <td>{item.resultValue || <span style={{ color: '#aaa' }}>Chưa có</span>}</td>
                                            <td>{item.unit || '-'}</td>
                                            <td>{item.resultDate ? new Date(item.resultDate).toLocaleDateString('vi-VN') : '-'}</td>
                                            <td>{item.notes || '-'}</td>
                                            <td>
                                                <button className="action-btn" title="Xem chi tiết" onClick={() => setSelectedItem(item)}>
                                                    <FaFileAlt style={{ marginRight: 4 }} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>Không có kết quả xét nghiệm.</td></tr>
                                )}
                            </tbody>
                        </table>
                        <div className="form-actions" style={{ marginTop: 16 }}>
                            <button onClick={() => setSelectedRequest(null)} className="btn-cancel">Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {selectedItem && (
                <div className="form-overlay" onClick={() => setSelectedItem(null)}>
                    <div className="form-container lab-detail-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 650, minWidth: 350 }}>
                        <div className="lab-detail-header">
                            <h2 style={{ marginBottom: 0 }}>{selectedItem.testTypeName}</h2>
                            <button className="btn-cancel" onClick={() => setSelectedItem(null)}><FaTimes /></button>
                        </div>
                        <div className="lab-detail-meta">
                            <span><strong>Ngày xét nghiệm:</strong> {selectedItem.resultDate ? new Date(selectedItem.resultDate).toLocaleDateString('vi-VN') : 'N/A'}</span>
                            <span><strong>Bác sĩ:</strong> {selectedRequest?.doctorName || '-'}</span>
                        </div>
                        <div className="lab-detail-result-block">
                            <div className="lab-detail-result-label">Kết quả</div>
                            <div className="lab-detail-result-value">{selectedItem.resultValue || <span style={{ color: '#aaa' }}>Chưa có</span>}</div>
                            <div className="lab-detail-unit">{selectedItem.unit || '-'}</div>
                            <div className="lab-detail-range">Khoảng tham chiếu: <b>{selectedItem.normalRange || '-'}</b></div>
                            {/* Đánh giá tình trạng kết quả xét nghiệm */}
                            <div className="lab-detail-status">
                                {(() => {
                                    // Đánh giá tình trạng dựa vào resultValue và normalRange hoặc trường status nếu có
                                    let status = null;
                                    if (selectedItem.status) {
                                        status = selectedItem.status;
                                    } else if (selectedItem.resultValue && selectedItem.normalRange) {
                                        // Giả sử normalRange dạng "x - y"
                                        const match = selectedItem.normalRange.match(/([\d.]+)\s*-\s*([\d.]+)/);
                                        if (match) {
                                            const min = parseFloat(match[1]);
                                            const max = parseFloat(match[2]);
                                            const val = parseFloat(selectedItem.resultValue);
                                            if (!isNaN(val) && !isNaN(min) && !isNaN(max)) {
                                                status = (val >= min && val <= max) ? 'Normal' : 'Abnormal';
                                            }
                                        }
                                    }
                                    if (status === 'Normal' || status === 'Bình thường') {
                                        return <span className="lab-status-normal"><FaCheckCircle style={{ marginRight: 4 }} />Bình thường</span>;
                                    }
                                    if (status === 'Abnormal' || status === 'Bất thường') {
                                        return <span className="lab-status-abnormal"><FaExclamationCircle style={{ marginRight: 4 }} />Bất thường</span>;
                                    }
                                    return <span className="lab-status-unknown"><FaInfoCircle style={{ marginRight: 4 }} />Chưa đánh giá</span>;
                                })()}
                            </div>
                        </div>
                        <div className="lab-detail-note-block">
                            <div className="lab-detail-note-label">Ghi chú</div>
                            <div className="lab-detail-note-value">{selectedItem.notes || '-'}</div>
                        </div>
                        <div className="lab-detail-history-block">
                            <div className="lab-detail-history-label">Lịch sử kết quả</div>
                            <table className="lab-history-table" style={{ marginBottom: 16, width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>Ngày</th>
                                        <th>Kết quả</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedRequest?.labRequestItems?.filter(i => i.testTypeId === selectedItem.testTypeId)
                                        .sort((a, b) => new Date(b.resultDate) - new Date(a.resultDate))
                                        .map(i => (
                                            <tr key={i.id}>
                                                <td>{i.resultDate ? new Date(i.resultDate).toLocaleDateString('vi-VN') : '-'}</td>
                                                <td>{i.resultValue || <span style={{ color: '#aaa' }}>Chưa có</span>}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="lab-detail-info-block">
                            <FaInfoCircle style={{ marginRight: 8, color: '#3498db' }} />
                            <span>Kết quả xét nghiệm này chỉ mang tính chất tham khảo. Vui lòng tham khảo ý kiến bác sĩ để được tư vấn chính xác về tình trạng sức khỏe của bạn.</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorLabRequestView; 