import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCalendarCheck, FaPills, FaRegClock, FaPlus } from 'react-icons/fa';
import Button from '../Common/Button';
import PatientMedicationSchedule from './PatientMedicationSchedule';
import './Medication.scss';

const PatientMedicationNew = () => {
    const [treatmentPlans, setTreatmentPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMedications, setModalMedications] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState(null);
    const [modalPlan, setModalPlan] = useState(null);
    const [doctorMap, setDoctorMap] = useState({});
    const [arvProtocolMap, setArvProtocolMap] = useState({});
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [modalSchedules, setModalSchedules] = useState([]);
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [scheduleError, setScheduleError] = useState(null);
    const [activeTab, setActiveTab] = useState('plans'); // 'plans', 'schedule'
    
    return (
        <div>
            <h2>Patient Medication Test</h2>
            <p>Testing with React, axios, react-icons and Button</p>
            <FaPills /> <FaCalendarCheck /> <FaRegClock /> <FaPlus />
            <Button label="Test Button" />
            {loading && <p>Loading...</p>}
        </div>
    );
};

export default PatientMedicationNew;
