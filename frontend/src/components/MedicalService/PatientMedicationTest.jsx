import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCalendarCheck, FaPills, FaRegClock, FaPlus } from 'react-icons/fa';
import Button from '../Common/Button';
import PatientMedicationSchedule from './PatientMedicationSchedule';
import './Medication.scss';

const PatientMedicationTest = () => {
    const [loading, setLoading] = useState(false);
    
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

export default PatientMedicationTest;
