
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaInfoCircle } from 'react-icons/fa';
import ConfirmModal from '../Common/ConfirmModal';
import './StaffARVProtocolTable.scss';
import '../Staff/DrugManagement.scss';
import { toast } from 'react-toastify';

const initialForm = {
    name: '',
    description: '',
    recommendation: '',
    treatmentLevel: '',
    sideEffects: '',
    contraindications: '',
    targetGroup: '',
    active: true,
    arvProtocolMedicationsDTO: [], // Array để chứa danh sách thuốc của phác đồ
};

const StaffARVProtocolTable = () => {
    const [protocols, setProtocols] = useState([]);
    const [medications, setMedications] = useState([]); // Danh sách thuốc ARV
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [search, setSearch] = useState('');
    const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });
    const [activeTab, setActiveTab] = useState('protocols');
    const [detailModal, setDetailModal] = useState({ show: false, protocol: null });
    const [editMode, setEditMode] = useState(false);

    const fetchProtocols = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8080/api/arv-protocol', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProtocols(res.data || []);
        } catch (err) {
            setError('Không thể tải danh sách phác đồ ARV.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchProtocols();
        fetchMedications(); 
    }, []);
    
    // Lấy danh sách thuốc ARV
    const fetchMedications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8080/api/arv-medications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMedications(res.data || []);
        } catch (err) {
            console.error('Error fetching medications:', err);
        }
    };

    const handleAdd = () => {
        setEditing(null);
        setForm(initialForm);
        setShowForm(true);
    };
    const handleEdit = (item) => {
        setEditing(item);
        setForm({
            name: item.name,
            description: item.description,
            recommendation: item.recommendation,
            treatmentLevel: item.treatmentLevel,
            sideEffects: item.sideEffects,
            contraindications: item.contraindications,
            targetGroup: item.targetGroup,
            active: item.active,
            arvProtocolMedicationsDTO: item.arvProtocolMedicationsDTO || []
        });
        setShowForm(true);
    };

    const handleShowDetail = (item) => {
        setDetailModal({ show: true, protocol: item });
        setEditMode(false);
    };

    const handleCloseDetail = () => {
        setDetailModal({ show: false, protocol: null });
        setEditMode(false);
    };

    const handleDeleteProtocol = async (id) => {
        setConfirmModal({
            show: true,
            message: 'Bạn có chắc muốn xóa phác đồ này?',
            onConfirm: async () => {
                setConfirmModal({ show: false });
                try {
                    const token = localStorage.getItem('token');
                    await axios.delete(`http://localhost:8080/api/arv-protocol/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    toast.success('Xóa phác đồ thành công!');
                    fetchProtocols();
                    handleCloseDetail();
                } catch {
                    setError('Xóa phác đồ thất bại!');
                }
            }
        });
    };

    const handleRestoreProtocol = async (id) => {
        try {
            const token = localStorage.getItem('token');
            arvProtocolMedicationsDTOText: '', // Reset the text field when editing
            await axios.put(`http://localhost:8080/api/arv-protocol/active/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Khôi phục phác đồ thành công!');
            fetchProtocols();
            handleCloseDetail();
        } catch {
            setError('Khôi phục phác đồ thất bại!');
        }
    };
    const handleDelete = (id) => {
        setConfirmModal({
            show: true,
            message: 'Bạn có chắc muốn xóa phác đồ này?',
            onConfirm: async () => {
                setConfirmModal({ show: false });
                try {
                    const token = localStorage.getItem('token');
                    await axios.delete(`http://localhost:8080/api/arv-protocol/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    toast.success('Xóa phác đồ thành công!');
                    fetchProtocols();
                } catch {
                    setError('Xóa phác đồ thất bại!');
                }
            }
        });
    };
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = { ...form, arvProtocolMedicationsDTO: form.arvProtocolMedicationsDTO || [] };
            if (editing) {
                await axios.put(`http://localhost:8080/api/arv-protocol/${editing.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Cập nhật phác đồ thành công!');
            } else {
                // Ensure 'active' is always sent as true when creating
                await axios.post('http://localhost:8080/api/arv-protocol', { ...payload, active: true }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Thêm phác đồ mới thành công!');
            }
            setShowForm(false);
            setEditing(null);
            fetchProtocols();
        } catch {
            setError('Lưu phác đồ thất bại!');
        }
    };
    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        // Ensure targetGroup is always uppercase (ADULT, CHILD, PREGNANT)
        if (name === 'targetGroup') {
            setForm(prev => ({ ...prev, [name]: value ? value.toUpperCase() : '' }));
        } else {
            setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };
    
    // Thêm thuốc vào phác đồ
    const handleAddMedication = (medicationId) => {
        const medication = medications.find(m => m.id === parseInt(medicationId));
        if (!medication) return;
        
        const newMedication = {
            medicationId: medication.id,
            medicationName: medication.name, // Để hiển thị tên thuốc
            dosage: '',
            frequency: '',
            duration: '',
            sideEffects: '',
            notes: ''
        };
        
        setForm({
            ...form,
            arvProtocolMedicationsDTO: [...form.arvProtocolMedicationsDTO, newMedication]
        });
    };
    
    // Cập nhật thông tin thuốc trong phác đồ
    const handleUpdateMedication = (index, field, value) => {
        const updatedMedications = [...form.arvProtocolMedicationsDTO];
        updatedMedications[index] = {
            ...updatedMedications[index],
            [field]: value
        };
        
        setForm({
            ...form,
            arvProtocolMedicationsDTO: updatedMedications
        });
    };
    
    // Xóa thuốc khỏi phác đồ
    const handleRemoveMedication = (index) => {
        const updatedMedications = [...form.arvProtocolMedicationsDTO];
        updatedMedications.splice(index, 1);
        
        setForm({
            ...form,
            arvProtocolMedicationsDTO: updatedMedications
        });
    };
    const filtered = protocols.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(search.toLowerCase())
    );
    // UI giống mẫu: Tabs, header, table, badge, info button

    return (
        <div className="drug-management-table">
            <div className="table-header">
                <h2>Phác đồ ARV</h2>
                <div className="header-actions">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Tìm kiếm phác đồ hoặc thuốc..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button onClick={handleAdd} className="add-button"><FaPlus style={{ marginRight: 4 }} /> Thêm phác đồ</button>
                </div>
            </div>
            {loading ? <div className="loading">Đang tải...</div> : error ? <div className="error-message">{error}</div> : (
                <div style={{overflowX:'auto'}}>
                    <table>
                        <colgroup>
                            <col style={{ width: '18%' }} /> {/* Tên phác đồ */}
                            <col style={{ width: '10%' }} /> {/* Bậc */}
                            <col style={{ width: '16%' }} /> {/* Khuyến cáo */}
                            <col style={{ width: '22%' }} /> {/* Tác dụng phụ */}
                            <col style={{ width: '16%' }} /> {/* Đối tượng */}
                            <col style={{ width: '18%' }} /> {/* Actions */}
                        </colgroup>
                        <thead>
                            <tr>
                                <th>Tên phác đồ</th>
                                <th>Bậc</th>
                                <th>Khuyến cáo</th>
                                <th>Tác dụng phụ</th>
                                <th>Đối tượng</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map(item => (
                                <tr key={item.id}>
                                    <td>{item.name || '—'}</td>
                                    <td>{
                                        item.treatmentLevel === 'LEVEL1' ? 'Bậc 1' :
                                        item.treatmentLevel === 'LEVEL2' ? 'Bậc 2' :
                                        item.treatmentLevel === 'LEVEL3' ? 'Bậc 3' : 
                                        item.treatmentLevel || '—'
                                    }</td>
                                    <td>
                                        {item.recommendation === 'PRIORITY' && <span className="arv-protocol-staff__badge primary">Ưu tiên</span>}
                                        {item.recommendation === 'ALTERNATIVE' && <span className="arv-protocol-staff__badge secondary">Thay thế</span>}
                                        {!item.recommendation && '—'}
                                    </td>
                                    <td>{item.sideEffects || '—'}</td>
                                    <td>{
                                        item.targetGroup === 'ADULT' ? 'Người lớn' :
                                        item.targetGroup === 'PREGNANT' ? 'Mang thai' :
                                        item.targetGroup === 'CHILD' ? 'Trẻ em' : '—'
                                    }</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                className="edit-button"
                                                title="Chi tiết"
                                                onClick={() => handleShowDetail(item)}
                                            >
                                                <FaInfoCircle />
                                            </button>
                                            <button
                                                className="edit-button"
                                                title="Cập nhật"
                                                onClick={() => handleEdit(item)}
                                            >
                                                <FaEdit />
                                            </button>
                                            {item.active ? (
                                                <button
                                                    className="delete-button"
                                                    title="Xóa"
                                                    onClick={() => handleDeleteProtocol(item.id)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            ) : (
                                                <button
                                                    className="edit-button"
                                                    title="Khôi phục"
                                                    onClick={() => handleRestoreProtocol(item.id)}
                                                >
                                                    ↺
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="6">Không có phác đồ nào.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal xem chi tiết phác đồ */}
            {detailModal.show && detailModal.protocol && (
                <div className="modal-overlay">
                    <div className="modal-content modal-content-lg">
                        <div className="modal-header">
                            <h3>Chi tiết phác đồ ARV</h3>
                            <button onClick={handleCloseDetail} className="close-button">&times;</button>
                        </div>
                        <div className="protocol-detail-container">
                            <div className="protocol-detail-header">
                                <div className="protocol-name-section">
                                    <h2>{detailModal.protocol.name || '—'}</h2>
                                    <div className="protocol-badges">
                                        {detailModal.protocol.recommendation === 'PRIORITY' && 
                                            <span className="protocol-badge priority">Ưu tiên</span>}
                                        {detailModal.protocol.recommendation === 'ALTERNATIVE' && 
                                            <span className="protocol-badge alternative">Thay thế</span>}
                                        <span className={`protocol-badge status ${detailModal.protocol.active ? 'active' : 'inactive'}`}>
                                            {detailModal.protocol.active ? 'Đang hoạt động' : 'Đã xóa'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="protocol-detail-actions">
                                    <button className="edit-detail-button" onClick={() => {
                                        handleCloseDetail();
                                        handleEdit(detailModal.protocol);
                                    }}>
                                        <FaEdit /> Chỉnh sửa
                                    </button>
                                    {detailModal.protocol.active ? (
                                        <button className="delete-detail-button" onClick={() => handleDeleteProtocol(detailModal.protocol.id)}>
                                            <FaTrash /> Xóa
                                        </button>
                                    ) : (
                                        <button className="restore-detail-button" onClick={() => handleRestoreProtocol(detailModal.protocol.id)}>
                                            <span>↺</span> Khôi phục
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="protocol-info-card">
                                <h4 className="detail-section-title">Thông tin phác đồ</h4>
                                <div className="protocol-info-grid">
                                    <div className="info-item">
                                        <div className="info-label">Bậc</div>
                                        <div className="info-value">{
                                            detailModal.protocol.treatmentLevel === 'LEVEL1' ? 'Bậc 1' :
                                            detailModal.protocol.treatmentLevel === 'LEVEL2' ? 'Bậc 2' :
                                            detailModal.protocol.treatmentLevel === 'LEVEL3' ? 'Bậc 3' : 
                                            detailModal.protocol.treatmentLevel || '—'
                                        }</div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-label">Đối tượng</div>
                                        <div className="info-value">{
                                            detailModal.protocol.targetGroup === 'ADULT' ? 'Người lớn' :
                                            detailModal.protocol.targetGroup === 'PREGNANT' ? 'Mang thai' :
                                            detailModal.protocol.targetGroup === 'CHILD' ? 'Trẻ em' : '—'
                                        }</div>
                                    </div>
                                    <div className="info-item full-width">
                                        <div className="info-label">Mô tả</div>
                                        <div className="info-value">{detailModal.protocol.description || '—'}</div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-label">Tác dụng phụ</div>
                                        <div className="info-value">{detailModal.protocol.sideEffects || '—'}</div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-label">Chống chỉ định</div>
                                        <div className="info-value">{detailModal.protocol.contraindications || '—'}</div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Hiển thị danh sách thuốc trong phác đồ */}
                            <div className="protocol-medications-card">
                                <h4 className="detail-section-title">Danh sách thuốc trong phác đồ</h4>
                                {detailModal.protocol.arvProtocolMedicationsDTO && detailModal.protocol.arvProtocolMedicationsDTO.length > 0 ? (
                                    <table className="detail-medications-table">
                                        <thead>
                                            <tr>
                                                <th>Tên thuốc</th>
                                                <th>Liều lượng</th>
                                                <th>Tần suất</th>
                                                <th>Thời gian</th>
                                                <th>Tác dụng phụ</th>
                                                <th>Ghi chú</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detailModal.protocol.arvProtocolMedicationsDTO.map((med, index) => {
                                                // Debug log to check the actual data
                                                console.log('Medication data:', med);
                                                return (
                                                <tr key={index}>
                                                    <td className="med-name" title={med.medicationName || med.medicationId || '—'}>
                                                        {med.medicationName || med.medicationId || '—'}
                                                    </td>
                                                    <td title={med.dosage || '—'}>{med.dosage || '—'}</td>
                                                    <td title={med.frequency || '—'}>{med.frequency || '—'}</td>
                                                    <td title={med.duration || '—'}>{med.duration || '—'}</td>
                                                    <td title={med.sideEffects || '—'}>{med.sideEffects || '—'}</td>
                                                    <td title={med.notes || med.note || '—'}>{med.notes || med.note || '—'}</td>
                                                </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="no-medications-detail">
                                        <p>Không có thuốc nào trong phác đồ này.</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="form-actions detail-actions">
                                <button className="close-detail-button" onClick={handleCloseDetail}>Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal thêm/sửa phác đồ */}
            {showForm && (
                <div className="modal-overlay arv-protocol-modal">
                    <div className="modal-content modal-content-lg arv-protocol-form-container">
                        <div className="modal-header">
                            <h3>{editing ? 'Cập nhật' : 'Thêm'} phác đồ ARV</h3>
                            <button onClick={() => setShowForm(false)} className="close-button">&times;</button>
                        </div>
                        
                        <div className="protocol-form-container">
                            <form onSubmit={handleFormSubmit} className="service-form" id="protocol-form">
                                <div className="protocol-info-section">
                                    <h4 className="section-title">Thông tin phác đồ</h4>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="name">Tên phác đồ <span className="required">*</span></label>
                                            <input
                                                id="name"
                                                name="name"
                                                className="styled-input"
                                                value={form.name}
                                                onChange={handleFormChange}
                                                required
                                                placeholder="Nhập tên phác đồ"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="form-row form-row-two-cols">
                                        <div className="form-group">
                                            <label htmlFor="treatmentLevel">Bậc</label>
                                            <select
                                                id="treatmentLevel"
                                                name="treatmentLevel"
                                                className="styled-select"
                                                value={form.treatmentLevel || ''}
                                                onChange={handleFormChange}
                                            >
                                                <option value="">-- Chọn bậc phác đồ --</option>
                                                <option value="LEVEL1">Bậc 1</option>
                                                <option value="LEVEL2">Bậc 2</option>
                                                <option value="LEVEL3">Bậc 3</option>
                                            </select>
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="recommendation">Khuyến cáo</label>
                                            <select
                                                id="recommendation"
                                                name="recommendation"
                                                className="styled-select"
                                                value={form.recommendation || ''}
                                                onChange={handleFormChange}
                                            >
                                                <option value="">-- Chọn khuyến cáo --</option>
                                                <option value="PRIORITY">Ưu tiên</option>
                                                <option value="ALTERNATIVE">Thay thế</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="targetGroup">Đối tượng <span className="required">*</span></label>
                                            <select
                                                id="targetGroup"
                                                name="targetGroup"
                                                className="styled-select"
                                                value={form.targetGroup || ''}
                                                onChange={handleFormChange}
                                                required
                                            >
                                                <option value="">-- Chọn đối tượng --</option>
                                                <option value="ADULT">Người lớn</option>
                                                <option value="PREGNANT">Mang thai</option>
                                                <option value="CHILD">Trẻ em</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="description">Mô tả</label>
                                            <textarea
                                                id="description"
                                                name="description"
                                                className="styled-textarea"
                                                value={form.description || ''}
                                                onChange={handleFormChange}
                                                placeholder="Nhập mô tả chi tiết về phác đồ"
                                                rows={4}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="form-row form-row-two-cols">
                                        <div className="form-group">
                                            <label htmlFor="sideEffects">Tác dụng phụ</label>
                                            <textarea
                                                id="sideEffects"
                                                name="sideEffects"
                                                className="styled-textarea"
                                                value={form.sideEffects || ''}
                                                onChange={handleFormChange}
                                                placeholder="Nhập thông tin về tác dụng phụ"
                                                rows={4}
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="contraindications">Chống chỉ định</label>
                                            <textarea
                                                id="contraindications"
                                                name="contraindications"
                                                className="styled-textarea"
                                                value={form.contraindications || ''}
                                                onChange={handleFormChange}
                                                placeholder="Nhập thông tin về chống chỉ định"
                                                rows={4}
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Phần quản lý thuốc ARV trong phác đồ */}
                                <div className="protocol-medications-section">
                                    <h4 className="section-title">Thuốc ARV trong phác đồ</h4>
                                    <div className="medication-container">
                                        {/* Thêm thuốc mới */}
                                        <div className="add-medication">
                                            <select
                                                id="medicationSelect"
                                                className="styled-select"
                                                onChange={(e) => e.target.value && handleAddMedication(e.target.value)}
                                                value=""
                                            >
                                                <option value="">-- Chọn thuốc ARV --</option>
                                                {medications.map(med => (
                                                    <option key={med.id} value={med.id}>{med.name}</option>
                                                ))}
                                            </select>
                                            <button 
                                                type="button" 
                                                className="add-medication-button"
                                                onClick={() => document.getElementById('medicationSelect').value && 
                                                          handleAddMedication(document.getElementById('medicationSelect').value)}
                                            >
                                                <FaPlus style={{ marginRight: '4px' }} /> Thêm thuốc
                                            </button>
                                        </div>
                                        
                                        {/* Danh sách thuốc đã thêm - Card style */}
                                        {form.arvProtocolMedicationsDTO.length > 0 ? (
                                            <div className="medications-list">
                                                {form.arvProtocolMedicationsDTO.map((med, index) => (
                                                    <div key={index} className="medication-card">
                                                        <div className="medication-header">
                                                            <div className="medication-number">
                                                                Thuốc #{index + 1}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="remove-button"
                                                                onClick={() => handleRemoveMedication(index)}
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                        
                                                        <div className="medication-form-row">
                                                            <div className="medication-form-group">
                                                                <label>Tên Thuốc</label>
                                                                <input
                                                                    type="text"
                                                                    value={med.medicationName || medications.find(m => m.id === med.medicationId)?.name || `ID: ${med.medicationId}`}
                                                                    disabled
                                                                    className="medication-input"
                                                                />
                                                            </div>
                                                            <div className="medication-form-group">
                                                                <label>Liều Lượng</label>
                                                                <input
                                                                    type="text"
                                                                    className="medication-input"
                                                                    value={med.dosage || ''}
                                                                    onChange={(e) => handleUpdateMedication(index, 'dosage', e.target.value)}
                                                                    placeholder="Nhập liều lượng"
                                                                />
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="medication-form-row">
                                                            <div className="medication-form-group">
                                                                <label>Tần Suất</label>
                                                                <input
                                                                    type="text"
                                                                    className="medication-input"
                                                                    value={med.frequency || ''}
                                                                    onChange={(e) => handleUpdateMedication(index, 'frequency', e.target.value)}
                                                                    placeholder="Nhập tần suất"
                                                                />
                                                            </div>
                                                            <div className="medication-form-group">
                                                                <label>Thời Gian</label>
                                                                <input
                                                                    type="text"
                                                                    className="medication-input"
                                                                    value={med.duration || ''}
                                                                    onChange={(e) => handleUpdateMedication(index, 'duration', e.target.value)}
                                                                    placeholder="Nhập thời gian"
                                                                />
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="medication-form-row">
                                                            <div className="medication-form-group">
                                                                <label>Tác Dụng Phụ</label>
                                                                <textarea
                                                                    className="medication-input"
                                                                    value={med.sideEffects || ''}
                                                                    onChange={(e) => handleUpdateMedication(index, 'sideEffects', e.target.value)}
                                                                    placeholder="Nhập tác dụng phụ"
                                                                ></textarea>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="medication-form-row">
                                                            <div className="medication-form-group">
                                                                <label>Ghi Chú</label>
                                                                <textarea
                                                                    className="medication-input"
                                                                    value={med.notes || ''}
                                                                    onChange={(e) => handleUpdateMedication(index, 'notes', e.target.value)}
                                                                    placeholder="Nhập ghi chú"
                                                                ></textarea>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="no-medications">
                                                <p>Chưa có thuốc nào trong phác đồ.</p>
                                                <p>Vui lòng chọn thuốc ARV từ danh sách để thêm vào phác đồ.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                        
                        <div className="protocol-form-actions">
                            <button type="button" className="cancel-button" onClick={() => setShowForm(false)}>Hủy</button>
                            <button type="submit" form="protocol-form" className="save-button">
                                {editing ? 'Cập nhật' : 'Thêm mới'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                show={confirmModal.show}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal({ show: false })}
            />
        </div>
    );
}

export default StaffARVProtocolTable;