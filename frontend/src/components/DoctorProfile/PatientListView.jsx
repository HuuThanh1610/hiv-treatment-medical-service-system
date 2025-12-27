import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PatientCard from './PatientCard';
import PatientDetailModal from './PatientDetailModal';
import './PatientListView.scss';

const PatientListView = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // State for the modal
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchPatients = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                // 1. Fetch appointments using the correct endpoint
                const response = await axios.get('http://localhost:8080/api/appointments/my-doctor-appointments', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // 2. Process appointments to get a unique list of patients
                const patientMap = new Map();
                response.data.forEach(appointment => {
                    if (!patientMap.has(appointment.patientId)) {
                        patientMap.set(appointment.patientId, {
                            id: appointment.patientId,
                            name: appointment.patientName,
                            // Add other patient details if available in the appointment DTO
                            // For example: email, phone, etc.
                        });
                    }
                });

                // 3. Set the unique patient list to state
                setPatients(Array.from(patientMap.values()));

            } catch (err) {
                setError('Không thể tải danh sách bệnh nhân.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    const handleViewProfile = (patient) => {
        setSelectedPatient(patient);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPatient(null);
    };

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="loading-message">Đang tải danh sách bệnh nhân...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="patient-list-view">
            <div className="view-header">
                <h2>Danh sách bệnh nhân</h2>
                <input
                    type="text"
                    placeholder="Tìm kiếm bệnh nhân..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>
            <div className="patient-grid">
                {filteredPatients.length > 0 ? (
                    filteredPatients.map(patient => (
                        <PatientCard
                            key={patient.id}
                            patient={patient}
                            onViewProfile={() => handleViewProfile(patient)}
                        />
                    ))
                ) : (
                    <div className="no-results-message">Không tìm thấy bệnh nhân nào.</div>
                )}
            </div>

            {isModalOpen && selectedPatient && (
                <PatientDetailModal
                    patientId={selectedPatient.id}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default PatientListView; 