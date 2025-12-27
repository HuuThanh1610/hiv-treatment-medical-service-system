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
    const [protocolMedications, setProtocolMedications] = useState([]); // Store protocol medications for auto-fill
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        const fetchData = async () => {
            try {
                // Fetch doctor info to get doctorId if not provided
                if (!editPlan?.doctorId) {
                    const doctorRes = await axios.get('http://localhost:8080/api/doctors/me', { 
                        headers: { Authorization: `Bearer ${token}` } 
                    });
                    setForm(f => ({ ...f, doctorId: doctorRes.data.id, patientId: patientId }));
                }
                
                // Fetch ARV protocols
                const protocolsRes = await axios.get('http://localhost:8080/api/arv-protocol/active', { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                setArvProtocols(protocolsRes.data);

                // Fetch ARV medications (active only for doctors)
                const medicationsRes = await axios.get('http://localhost:8080/api/arv-medications/active', { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                setArvMedications(medicationsRes.data);

                // If editing and has protocol ID, fetch protocol medications for auto-fill
                if (editPlan?.arvProtocolId) {
                    await fetchProtocolMedications(editPlan.arvProtocolId);
                }

                // If editing, try to fetch prescription medications for this treatment plan
                if (editPlan?.id) {
                    console.log('Fetching prescription medications for treatment plan ID:', editPlan.id);
                    
                    try {
                        // Try to get prescription medications for this treatment plan
                        const prescriptionRes = await axios.get(
                            `http://localhost:8080/api/prescription-medications/treatment-plan/${editPlan.id}`, 
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        
                        console.log('Treatment plan prescription medications:', prescriptionRes.data);
                        
                        if (prescriptionRes.data && prescriptionRes.data.length > 0) {
                            const medicationData = prescriptionRes.data.map(pm => ({
                                medicationId: pm.medicationId,
                                dosage: pm.dosage,
                                frequency: pm.frequency,
                                durationDays: pm.durationDays || 30,
                                notes: pm.notes || ''
                            }));
                            console.log('Setting medications from treatment plan prescriptions:', medicationData);
                            setMedications(medicationData);
                        } else {
                            console.log('No prescription medications found for this treatment plan');
                            setMedications([]);
                        }
                        
                    } catch (prescriptionError) {
                        console.warn('Could not fetch prescription medications for treatment plan:', prescriptionError);
                        console.log('Trying alternative API endpoint...');
                        
                        try {
                            // Try alternative endpoint
                            const altRes = await axios.get(
                                `http://localhost:8080/api/prescriptions/treatment-plan/${editPlan.id}/medications`, 
                                { headers: { Authorization: `Bearer ${token}` } }
                            );
                            
                            console.log('Alternative API response:', altRes.data);
                            
                            if (altRes.data && altRes.data.length > 0) {
                                const medicationData = altRes.data.map(pm => ({
                                    medicationId: pm.medicationId,
                                    dosage: pm.dosage,
                                    frequency: pm.frequency,
                                    notes: pm.notes || ''
                                }));
                                console.log('Setting medications from alternative API:', medicationData);
                                setMedications(medicationData);
                            } else {
                                console.log('No medications found via alternative API');
                                setMedications([]);
                            }
                        } catch (altError) {
                            console.warn('Alternative API also failed:', altError);
                            console.log('Initializing with empty medications list');
                            setMedications([]);
                        }
                    }
                } else {
                    console.log('No treatment plan ID available, starting with empty medications');
                    setMedications([]);
                }
                
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Có lỗi xảy ra khi tải dữ liệu');
            }
        };

        fetchData();
    }, [patientId, editPlan]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        
        // When ARV protocol changes, fetch its medications for auto-fill
        if (name === 'arvProtocolId' && value) {
            fetchProtocolMedications(value);
            // Clear current medications when protocol changes to avoid confusion
            setMedications([]);
        }
    };

    const fetchProtocolMedications = async (protocolId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:8080/api/medication-protocol/${protocolId}/medications`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('Protocol medications:', response.data);
            setProtocolMedications(response.data);
        } catch (error) {
            console.warn('Could not fetch protocol medications:', error);
            setProtocolMedications([]);
        }
    };

    const addMedication = () => {
        setMedications([...medications, { medicationId: '', dosage: '', frequency: '', durationDays: 30, notes: '' }]);
    };

    const addSuggestedMedication = (suggestedMed) => {
        const newMedication = {
            medicationId: suggestedMed.medicationId, // Keep as number
            dosage: suggestedMed.dosage || '',
            frequency: suggestedMed.frequency || '',
            durationDays: suggestedMed.duration ? parseInt(suggestedMed.duration) : 30,
            notes: suggestedMed.note || suggestedMed.sideEffects || ''
        };

        // Check if medication already exists
        const exists = medications.some(med => String(med.medicationId) === String(newMedication.medicationId));
        if (!exists) {
            setMedications([...medications, newMedication]);
        }
    };

    const addAllSuggestedMedications = () => {
        const newMedications = protocolMedications.map(suggestedMed => ({
            medicationId: suggestedMed.medicationId, // Keep as number
            dosage: suggestedMed.dosage || '',
            frequency: suggestedMed.frequency || '',
            durationDays: suggestedMed.duration ? parseInt(suggestedMed.duration) : 30,
            notes: suggestedMed.note || suggestedMed.sideEffects || ''
        }));

        // Filter out medications that already exist
        const uniqueNewMedications = newMedications.filter(newMed =>
            !medications.some(med => String(med.medicationId) === String(newMed.medicationId))
        );

        setMedications([...medications, ...uniqueNewMedications]);
    };

    const removeMedication = (index) => {
        setMedications(medications.filter((_, i) => i !== index));
    };

    const updateMedication = (index, field, value) => {
        const updated = medications.map((med, i) => {
            if (i === index) {
                if (field === 'medicationId') {
                    // When medication is selected, auto-fill dosage and frequency from protocol
                    const protocolMed = protocolMedications.find(pm => pm.medicationId === parseInt(value));
                    if (protocolMed) {
                        console.log('Auto-filling from protocol medication:', protocolMed);
                        return {
                            ...med,
                            medicationId: value,
                            dosage: protocolMed.dosage || '',
                            frequency: protocolMed.frequency || '',
                            durationDays: protocolMed.duration ? parseInt(protocolMed.duration) : med.durationDays || 30,
                            notes: protocolMed.note || protocolMed.sideEffects || med.notes
                        };
                    } else {
                        // Fallback to basic medication info
                        const selectedMedication = arvMedications.find(m => m.id === parseInt(value));
                        if (selectedMedication) {
                            console.log('Auto-filling from basic medication:', selectedMedication);
                            return {
                                ...med,
                                medicationId: value,
                                dosage: selectedMedication.strength || '',
                                frequency: '',
                                durationDays: med.durationDays || 30,
                                notes: selectedMedication.description || med.notes
                            };
                        }
                    }
                }
                return { ...med, [field]: value };
            }
            return med;
        });
        setMedications(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            
            // Prepare medications data according to backend DTO structure
            const validMedications = medications
                .filter(med => med.medicationId && med.dosage && med.frequency)
                .map(med => ({
                    medicationId: parseInt(med.medicationId),
                    dosage: med.dosage.trim(),
                    frequency: med.frequency.trim(),
                    durationDays: med.durationDays || 30,
                    notes: med.notes ? med.notes.trim() : ''
                }));

            // Use the correct field names as per UpdatePatientTreatmentPlanDTO
            const planData = {
                arvProtocolId: parseInt(form.arvProtocolId),
                startDate: form.startDate,
                reasonChangeARV: '',
                reasonChangePrescription: '',
                notes: form.notes ? form.notes.trim() : '',
                prescriptionMedicationDTOList: validMedications
            };

            console.log('Submitting treatment plan update:', planData);
            console.log('Valid medications count:', validMedications.length);
            
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
            console.error('Error response:', error.response?.data);
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
                        
                        {protocolMedications.length > 0 && (
                            <div className="protocol-medications-suggestion">
                                <h4>Thuốc được đề xuất cho phác đồ này:</h4>
                                <div className="suggested-medications">
                                    {protocolMedications.map((med, index) => {
                                        const isAlreadyAdded = medications.some(existingMed =>
                                            String(existingMed.medicationId) === String(med.medicationId)
                                        );

                                        return (
                                            <div key={index} className="suggested-medication">
                                                <span className="med-name">{med.name || 'Unknown'}</span>
                                                <span className="med-dosage">{med.dosage || 'N/A'}</span>
                                                <span className="med-frequency">{med.frequency || 'N/A'}</span>
                                                <button
                                                    type="button"
                                                    className={`add-suggested-btn ${isAlreadyAdded ? 'disabled' : ''}`}
                                                    onClick={() => addSuggestedMedication(med)}
                                                    disabled={isAlreadyAdded}
                                                    title={isAlreadyAdded ? 'Thuốc này đã có trong danh sách' : 'Thêm thuốc vào danh sách'}
                                                >
                                                    {isAlreadyAdded ? 'Đã thêm' : 'Thêm'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        
                        <div className="medications-controls">
                            <button type="button" className="add-medication-btn" onClick={addMedication}>
                                Thêm thuốc
                            </button>
                            {protocolMedications.length > 0 && (() => {
                                const availableToAdd = protocolMedications.filter(protocolMed =>
                                    !medications.some(existingMed =>
                                        String(existingMed.medicationId) === String(protocolMed.medicationId)
                                    )
                                );
                                const allAdded = availableToAdd.length === 0;

                                return (
                                    <button
                                        type="button"
                                        className={`add-all-suggested-btn ${allAdded ? 'disabled' : ''}`}
                                        onClick={addAllSuggestedMedications}
                                        disabled={allAdded}
                                        title={allAdded ? 'Tất cả thuốc đề xuất đã được thêm' : `Thêm ${availableToAdd.length} thuốc còn lại`}
                                    >
                                        {allAdded ? 'Đã thêm tất cả' : `Thêm tất cả (${availableToAdd.length})`}
                                    </button>
                                );
                            })()}
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
                                            <label>Số ngày điều trị</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={medication.durationDays || 30}
                                                onChange={(e) => updateMedication(index, 'durationDays', parseInt(e.target.value))}
                                                placeholder="30"
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
