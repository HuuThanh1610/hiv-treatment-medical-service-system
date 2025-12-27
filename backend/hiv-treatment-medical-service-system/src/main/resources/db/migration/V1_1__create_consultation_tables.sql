-- Migration for consultation_sessions and consultation_messages

CREATE TABLE consultation_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    created_at DATETIME NOT NULL,
    status VARCHAR(20),
    CONSTRAINT fk_consultation_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
    CONSTRAINT fk_consultation_doctor FOREIGN KEY (doctor_id) REFERENCES doctor(id)
);

CREATE TABLE consultation_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL,
    sender_type VARCHAR(20) NOT NULL, -- 'PATIENT' or 'DOCTOR'
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    sent_at DATETIME NOT NULL,
    CONSTRAINT fk_consultation_message_session FOREIGN KEY (session_id) REFERENCES consultation_sessions(id)
); 