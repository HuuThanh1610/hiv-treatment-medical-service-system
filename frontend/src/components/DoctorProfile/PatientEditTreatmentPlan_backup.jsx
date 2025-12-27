import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PatientAddTreatmentPlan.scss';

const PatientEditTreatmentPlan = ({ onClose, onSuccess, patientId, editPlan }) => {
    console.log('PatientEditTreatmentPlan received editPlan:', editPlan);
    console.log('PatientEditTreatmentPlan received patientId:', patientId);
    
    const [arvProtocols, setArvProtocols] = useState([]);
    const [arvMedications, setArvMedications] = useState([]);
    const [form, setForm] = useState({
        arvProtocolId: editPlan?.arvProtocolId || '',
        startDate: editPlan?.startDate || '',
        notes: editPlan?.notes || '',
        patientId: patientId || '',
        doctorId: editPlan?.doctorId || ''
    });
    console.log('Initial form state:', form);
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        // Fetch doctor info to get doctorId if not provided
        if (!editPlan?.doctorId) {
            axios.get('http://localhost:8080/api/doctors/me', { headers: { Authorization: `Bearer ${token}` } })
                .then(res => {
                    setForm(f => ({ ...f, doctorId: res.data.id, patientId: patientId }));
                })
                .catch(err => {
                    console.error('Error fetching doctor info:', err);
                    setError('Không thể lấy thông tin bác sĩ');
                });
        }
        
        // Fetch ARV protocols
        axios.get('http://localhost:8080/api/arv-protocol/active', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setArvProtocols(res.data))
            .catch(() => setArvProtocols([]));

        // Fetch ARV medications (active only for doctors)
        axios.get('http://localhost:8080/api/arv-medications/active', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setArvMedications(res.data))
            .catch(err => {
                console.error('Error fetching medications:', err);
                setArvMedications([]);
            });

        // If editing, populate with existing medications data
        if (editPlan?.medications) {
            console.log('Setting medications from editPlan:', editPlan.medications);
            setMedications(editPlan.medications);
        }
    }, [patientId, editPlan]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const addMedication = () => {
        setMedications([...medications, { medicationId: '', dosage: '', frequency: '', notes: '' }]);
    };

    const removeMedication = (index) => {
        setMedications(medications.filter((_, i) => i !== index));
    };

    const updateMedication = (index, field, value) => {
        const updated = medications.map((med, i) => 
            i === index ? { ...med, [field]: value } : med
        );
        setMedications(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const planData = {
                ...form,
                medications: medications.filter(med => med.medicationId && med.dosage && med.frequency)
            };

            console.log('Submitting treatment plan update:', planData);
            
            const response = await axios.put(
                `http://localhost:8080/api/patient-treatment-plans/${editPlan.id}`,
                planData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('Treatment plan updated successfully:', response.data);
            setSuccess('Cập nhật kế hoạch điều trị thành công!');
            
            setTimeout(() => {
                onSuccess && onSuccess();
                onClose();
            }, 1500);
            
        } catch (error) {
            console.error('Error updating treatment plan:', error);
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật kế hoạch điều trị';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-treatment-plan-modal-overlay">
            <div className="add-treatment-plan-modal">
                <div className="form-header">
                    <h2>Chỉnh sửa kế hoạch điều trị</h2>
                    <button type="button" onClick={onClose} className="close-btn">×</button>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form className="add-treatment-plan-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Phác đồ ARV <span className="required">*</span></label>
                        <select 
                            name="arvProtocolId" 
                            value={form.arvProtocolId} 
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Chọn --</option>
                            {arvProtocols.map(protocol => (
                                <option key={protocol.id} value={protocol.id}>
                                    {protocol.name} - {protocol.description}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Ngày bắt đầu <span className="required">*</span></label>
                        <input 
                            type="date" 
                            name="startDate" 
                            value={form.startDate} 
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label>Ghi chú</label>
                        <textarea 
                            name="notes" 
                            value={form.notes} 
                            onChange={handleChange}
                            rows="3"
                            placeholder="Ghi chú về kế hoạch điều trị..."
                        />
                    </div>

                    <div className="form-group medications-group">
                        <label>Danh sách thuốc</label>
                        <div className="medications-controls">
                            <button type="button" className="add-medication-btn" onClick={addMedication}>
                                Thêm thuốc
                            </button>
                        </div>

                        <div className="medications-list">
                            {medications.map((medication, index) => (
                                <div key={index} className="medication-item">
                                    <div className="medication-row">
                                        <div className="form-group">
                                            <label>Thuốc</label>
                                            <select 
                                                value={medication.medicationId} 
                                                onChange={(e) => updateMedication(index, 'medicationId', e.target.value)}
                                                required
                                            >
                                                <option value="">Chọn thuốc</option>
                                                {arvMedications.map(med => (
                                                    <option key={med.id} value={med.id}>
                                                        {med.name} ({med.drugClass})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Liều dùng</label>
                                            <input 
                                                type="text" 
                                                value={medication.dosage} 
                                                onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                                placeholder="Ví dụ: 1 viên"
                                                required 
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Tần suất</label>
                                            <input 
                                                type="text" 
                                                value={medication.frequency} 
                                                onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                                placeholder="Ví dụ: 2 lần/ngày"
                                                required 
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Ghi chú thuốc</label>
                                            <input 
                                                type="text" 
                                                value={medication.notes} 
                                                onChange={(e) => updateMedication(index, 'notes', e.target.value)}
                                                placeholder="Ghi chú về cách sử dụng thuốc..."
                                            />
                                        </div>

                                        <button 
                                            type="button" 
                                            className="remove-medication-btn" 
                                            onClick={() => removeMedication(index)}
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {medications.length === 0 && (
                                <div className="no-medications">
                                    Chưa có thuốc nào được thêm. Nhấn "Thêm thuốc" để bắt đầu.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">
                            Hủy bỏ
                        </button>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Đang cập nhật...' : 'Cập nhật kế hoạch điều trị'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatientEditTreatmentPlan;
