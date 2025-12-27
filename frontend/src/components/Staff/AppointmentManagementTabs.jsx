import React, { useState } from 'react';
import AppointmentApprovalTable from './AppointmentApprovalTable';
import AppointmentStatusTable from './AppointmentStatusTable';
import './AppointmentManagementTabs.scss';

const AppointmentManagementTabs = () => {
    const [activeTab, setActiveTab] = useState('approval');

    return (
        <div className="appointment-management-tabs">
            <div className="custom-tabs-header">
                <button
                    className={`custom-tab-btn${activeTab === 'approval' ? ' active' : ''}`}
                    onClick={() => setActiveTab('approval')}
                >
                    Duyệt cuộc hẹn
                </button>
                <button
                    className={`custom-tab-btn${activeTab === 'status' ? ' active' : ''}`}
                    onClick={() => setActiveTab('status')}
                >
                    Trạng thái
                </button>
            </div>
            <div className="tabs-content">
                {activeTab === 'approval' && <AppointmentApprovalTable />}
                {activeTab === 'status' && <AppointmentStatusTable />}
            </div>
        </div>
    );
};

export default AppointmentManagementTabs; 