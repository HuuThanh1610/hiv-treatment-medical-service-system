import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PatientAddTreatmentPlan.scss';

const PatientAddTreatmentPlan = ({ onClose, onSuccess, patientId }) => {
    const [arvProtocols, setArvProtocols] = useState([]);
    const [arvMedications, setArvMedications] = useState([]);
    const [protocolSuggestions, setProtocolSuggestions] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [form, setForm] = useState({
        arvProtocolId: '',
        startDate: '',
        notes: '',
        patientId: patientId || '',
        doctorId: ''
    });
    const [medications, setMedications] = useState([]);
    const [suggestedMedications, setSuggestedMedications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        // Fetch doctor info to get doctorId
        axios.get('http://localhost:8080/api/doctors/me', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                setForm(f => ({ ...f, doctorId: res.data.id, patientId: patientId }));
            })
            .catch(err => {
                console.error('Error fetching doctor info:', err);
                setError('Không thể lấy thông tin bác sĩ');
            });
        
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
    }, [patientId]);

    // Fetch protocol suggestions khi patientId thay đổi
    const fetchProtocolSuggestions = async () => {
        if (!patientId) return;
        setSuggestionsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/protocol-suggestions/${patientId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProtocolSuggestions(response.data || []);
        } catch (error) {
            console.error('Error fetching protocol suggestions:', error);
            setProtocolSuggestions([]);
        } finally {
            setSuggestionsLoading(false);
        }
    };

    useEffect(() => {
        fetchProtocolSuggestions();
    }, [patientId]);

    // Lấy gợi ý thuốc khi chọn phác đồ
    useEffect(() => {
        if (!form.arvProtocolId) {
            setSuggestedMedications([]);
            return;
        }
        const token = localStorage.getItem('token');
        axios.get(`http://localhost:8080/api/medication-protocol/${form.arvProtocolId}/medications`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setSuggestedMedications(res.data || []))
        .catch(() => setSuggestedMedications([]));
    }, [form.arvProtocolId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    // Medication management functions
    const addMedication = () => {
        setMedications([...medications, {
            medicationId: '',
            dosage: '',
            frequency: '',
            durationDays: 30,
            notes: ''
        }]);
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
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const body = {
                patientId: Number(form.patientId),
                doctorId: Number(form.doctorId),
                arvProtocolId: Number(form.arvProtocolId),
                startDate: form.startDate,
                notes: form.notes,
                medications: medications.filter(med => med.medicationId && med.dosage && med.frequency)
            };
            await axios.post('http://localhost:8080/api/patient-treatment-plans', body, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Thêm kế hoạch điều trị thành công!');
            if (onSuccess) onSuccess();
        } catch (err) {
            setError('Không thể thêm kế hoạch điều trị.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-treatment-plan-modal-overlay">
            <div className="add-treatment-plan-modal">
                <h2>Thêm kế hoạch điều trị</h2>
                <form className="add-treatment-plan-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Chọn phác đồ ARV <span className="required">*</span></label>
                        {suggestionsLoading && <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Đang tải gợi ý phác đồ...</div>}
                        <select name="arvProtocolId" value={form.arvProtocolId} onChange={handleChange} required>
                            <option value="">-- Chọn --</option>
                            {/* Hiển thị phác đồ gợi ý trước */}
                            {protocolSuggestions.length > 0 && (
                                <optgroup label="Gợi ý phác đồ">
                                    {protocolSuggestions.map(p => (
                                        <option key={`suggested-${p.id}`} value={p.id} style={{ fontWeight: 'bold', color: '#1976d2' }}>
                                            {p.name} (Gợi ý)
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                            {/* Hiển thị tất cả phác đồ */}
                            <optgroup label="Tất cả phác đồ">
                                {arvProtocols.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </optgroup>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Ngày bắt đầu <span className="required">*</span></label>
                        <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Ghi chú</label>
                        <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Nhập ghi chú về kế hoạch điều trị..." />
                    </div>

                    {/* Medication Section */}
                    <div className="medications-section">
                        <div className="section-header">
                            <h3>Thuốc ARV (Tùy chọn)</h3>
                            <button type="button" className="btn-add-medication" onClick={addMedication}>
                                + Thêm thuốc
                            </button>
                        </div>
                        
                        {medications.map((med, index) => (
                            <div key={index} style={{
                                marginBottom: '20px',
                                padding: '15px',
                                border: '1px solid #dee2e6',
                                borderRadius: '8px',
                                backgroundColor: '#fff'
                            }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '15px',
                                    marginBottom: '10px'
                                }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Thuốc</label>
                                        <select 
                                            value={med.medicationId} 
                                            onChange={(e) => updateMedication(index, 'medicationId', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #ced4da',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}
                                        >
                                            <option value="">-- Chọn thuốc --</option>
                                            {arvMedications.map(medication => (
                                                <option key={medication.id} value={medication.id}>
                                                    {medication.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Liều dùng</label>
                                        <input 
                                            type="text" 
                                            placeholder="VD: 1 viên"
                                            value={med.dosage}
                                            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #ced4da',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Tần suất</label>
                                        <input 
                                            type="text" 
                                            placeholder="VD: 2 lần/ngày"
                                            value={med.frequency}
                                            onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #ced4da',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Số ngày</label>
                                        <input 
                                            type="number" 
                                            min="1"
                                            value={med.durationDays}
                                            onChange={(e) => updateMedication(index, 'durationDays', parseInt(e.target.value))}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #ced4da',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>
                                    
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Ghi chú</label>
                                        <input 
                                            type="text" 
                                            placeholder="VD: Uống sau ăn"
                                            value={med.notes}
                                            onChange={(e) => updateMedication(index, 'notes', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #ced4da',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>
                                </div>
                                
                                <button 
                                    type="button" 
                                    onClick={() => removeMedication(index)}
                                    style={{
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    × Xóa thuốc
                                </button>
                            </div>
                        ))}
                        
                        {medications.length === 0 && (
                            <p className="no-medications">
                                Chưa có thuốc nào được thêm. Bạn có thể thêm thuốc ngay bây giờ hoặc sau khi tạo kế hoạch điều trị.
                            </p>
                        )}
                    </div>

                    {/* Suggested Medications Section */}
                    {form.arvProtocolId && suggestedMedications.length > 0 && (
                        <div style={{
                            marginTop: '20px',
                            padding: '15px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #dee2e6',
                            borderRadius: '8px'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '15px'
                            }}>
                                <h4 style={{ margin: 0, color: '#495057' }}>
                                    💊 Gợi ý thuốc cho phác đồ đã chọn ({suggestedMedications.length} thuốc)
                                </h4>
                                {(() => {
                                    const availableToAdd = suggestedMedications.filter(med =>
                                        !medications.some(m => String(m.medicationId) === String(med.medicationId))
                                    );
                                    const allAdded = availableToAdd.length === 0;

                                    return (
                                        <button
                                            type="button"
                                            style={{
                                                backgroundColor: allAdded ? '#6c757d' : '#007bff',
                                                color: 'white',
                                                border: 'none',
                                                padding: '8px 16px',
                                                borderRadius: '4px',
                                                cursor: allAdded ? 'not-allowed' : 'pointer',
                                                fontSize: '14px'
                                            }}
                                            disabled={allAdded}
                                            onClick={() => {
                                                // Thêm tất cả thuốc gợi ý chưa có trong danh sách
                                                const newMedications = [...medications];
                                                suggestedMedications.forEach(med => {
                                                    if (!newMedications.some(m => String(m.medicationId) === String(med.medicationId))) {
                                                        newMedications.push({
                                                            medicationId: med.medicationId,
                                                            dosage: med.dosage || '',
                                                            frequency: med.frequency || '',
                                                            durationDays: med.duration ? parseInt(med.duration) : 30,
                                                            notes: med.note || ''
                                                        });
                                                    }
                                                });
                                                setMedications(newMedications);
                                            }}
                                            title={allAdded ? 'Tất cả thuốc đã được thêm' : `Thêm ${availableToAdd.length} thuốc còn lại`}
                                        >
                                            {allAdded ? '✓ Đã thêm tất cả' : `+ Thêm tất cả (${availableToAdd.length})`}
                                        </button>
                                    );
                                })()}
                            </div>
                            
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {suggestedMedications.map((med, idx) => (
                                    <div key={med.medicationId} style={{
                                        padding: '12px',
                                        backgroundColor: 'white',
                                        border: '1px solid #e9ecef',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                                {med.name} ({med.code})
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#6c757d' }}>
                                                <span>Loại: {med.drugClass}</span>
                                                {med.dosage && <span> • Liều: {med.dosage}</span>}
                                                {med.frequency && <span> • Tần suất: {med.frequency}</span>}
                                                {med.duration && <span> • Số ngày: {med.duration}</span>}
                                            </div>
                                            {med.note && (
                                                <div style={{ fontSize: '13px', color: '#495057', marginTop: '4px', fontStyle: 'italic' }}>
                                                    Ghi chú: {med.note}
                                                </div>
                                            )}
                                        </div>
                                        <button 
                                            type="button" 
                                            style={{
                                                backgroundColor: medications.some(m => String(m.medicationId) === String(med.medicationId)) ? '#6c757d' : '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                padding: '6px 12px',
                                                borderRadius: '4px',
                                                cursor: medications.some(m => String(m.medicationId) === String(med.medicationId)) ? 'not-allowed' : 'pointer',
                                                fontSize: '13px'
                                            }}
                                            disabled={medications.some(m => String(m.medicationId) === String(med.medicationId))}
                                            onClick={() => {
                                                if (!medications.some(m => String(m.medicationId) === String(med.medicationId))) {
                                                    setMedications([...medications, {
                                                        medicationId: med.medicationId,
                                                        dosage: med.dosage || '',
                                                        frequency: med.frequency || '',
                                                        durationDays: med.duration ? parseInt(med.duration) : 30,
                                                        notes: med.note || ''
                                                    }]);
                                                }
                                            }}
                                        >
                                            {medications.some(m => String(m.medicationId) === String(med.medicationId)) ? '✓ Đã thêm' : '+ Thêm'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && <div className="form-error">{error}</div>}
                    {success && <div className="form-success">{success}</div>}
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>Hủy</button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Đang lưu...' : 'Lưu kế hoạch điều trị'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatientAddTreatmentPlan;