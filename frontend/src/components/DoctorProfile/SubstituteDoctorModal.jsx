import React, { useEffect, useState } from 'react';
import DoctorService from '../../Services/DoctorService';
import ConfirmModal from '../Common/ConfirmModal';

const SubstituteDoctorModal = ({ show, onClose, appointment, onSave }) => {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState(appointment?.substituteDoctorId || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [confirm, setConfirm] = useState(false);

    useEffect(() => {
        if (show) {
            DoctorService.getAllDoctors()
                .then(data => setDoctors(data))
                .catch(() => setDoctors([]));
        }
    }, [show]);

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            await onSave(selectedDoctorId);
            onClose();
        } catch (err) {
            setError('Không thể cập nhật bác sĩ thay thế.');
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ minWidth: 350 }}>
                <h3>Chọn bác sĩ thay thế</h3>
                <select
                    value={selectedDoctorId}
                    onChange={e => setSelectedDoctorId(e.target.value)}
                    style={{ width: '100%', padding: 8, margin: '16px 0' }}
                >
                    <option value="">-- Chọn bác sĩ --</option>
                    {doctors.filter(d => d.id !== appointment.doctorId).map(doctor => (
                        <option key={doctor.id} value={doctor.id}>{doctor.fullName}</option>
                    ))}
                </select>
                {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button onClick={onClose} style={{ padding: '6px 16px' }}>Huỷ</button>
                    <button onClick={() => setConfirm(true)} style={{ padding: '6px 16px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: 4 }} disabled={loading || !selectedDoctorId}>
                        Lưu
                    </button>
                </div>
                <ConfirmModal
                    show={confirm}
                    message="Bạn có chắc muốn đổi bác sĩ thay thế cho lịch này?"
                    onConfirm={handleSave}
                    onCancel={() => setConfirm(false)}
                />
            </div>
        </div>
    );
};

export default SubstituteDoctorModal;
