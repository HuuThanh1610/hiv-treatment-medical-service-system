import React, { useState } from 'react';
import StaffSidebar from './StaffSidebar';
import AppointmentApprovalTable from './AppointmentApprovalTable';
import LabResultsTable from './LabResultsTable';
import AppointmentStatusTable from './AppointmentStatusTable';
import MedicalServicesTable from './MedicalServicesTable';
import PaymentList from '../Payment/PaymentList';
import '../Admin/AdminDashboard.scss';
import LogoutButton from '../Auth/LogoutButton';
import StaffARVProtocolTable from './StaffARVProtocolTable';
import DrugManagement from './DrugManagement';
import AppointmentManagementTabs from './AppointmentManagementTabs';

const StaffDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('appointment-management');

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="header-left">
                    <button className="menu-toggle" onClick={toggleSidebar}>
                        <span className="menu-icon"></span>
                    </button>
                    <h1>Staff Dashboard</h1>
                    <p>Xin chào, {localStorage.getItem('username')}</p>
                </div>
                <div className="header-right">
                    <LogoutButton />
                </div>
            </header>
            <div className="dashboard-body">
                <StaffSidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} />
                <main className={`main-content ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
                    {activeTab === 'appointment-management' && <AppointmentManagementTabs />}
                    {activeTab === 'appointments' && <AppointmentApprovalTable />}
                    {activeTab === 'lab-results' && <LabResultsTable />}
                    {activeTab === 'appointment-status' && <AppointmentStatusTable />}
                    {activeTab === 'medical-services' && <MedicalServicesTable />}
                    {activeTab === 'arv-protocol' && <StaffARVProtocolTable />}
                    {activeTab === 'drug-management' && <DrugManagement />}
                    {activeTab === 'payment-management' && <PaymentList />}
                </main>
            </div>
        </div>
    );
};

export default StaffDashboard; 