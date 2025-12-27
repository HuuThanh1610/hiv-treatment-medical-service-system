import React from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faUserCircle, faIdCard, faFileMedical } from '@fortawesome/free-solid-svg-icons';
import './PatientListView.scss'; // Re-use the same SCSS file

const PatientCard = ({ patient, onViewProfile }) => {
    return (
        <div className="patient-card">
            <div className="card-header">
                <FontAwesomeIcon icon={faUserCircle} className="patient-avatar" />
                <div className="patient-info">
                    <h3 className="patient-name">{patient.name}</h3>
                    <span className="patient-id">
                        <FontAwesomeIcon icon={faIdCard} /> ID Bệnh nhân: {patient.id}
                    </span>
                </div>
            </div>
            <div className="card-body">
                {/* You can add more patient details here if they become available */}
                <p>Thông tin bổ sung về bệnh nhân có thể được hiển thị ở đây.</p>
            </div>
            <div className="card-actions">
                <button className="action-button primary" onClick={onViewProfile}>
                    <FontAwesomeIcon icon={faFileMedical} />
                    Xem hồ sơ
                </button>
            </div>
        </div>
    );
};

export default PatientCard; 