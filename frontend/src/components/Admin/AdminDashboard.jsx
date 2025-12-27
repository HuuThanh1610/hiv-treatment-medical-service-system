import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import SidebarMenu from './SidebarMenu.jsx';
import DoctorTable from './DoctorTable';
import DoctorScheduleManagement from './DoctorScheduleManagement';
import DoctorScheduleRequestApproval from './DoctorScheduleRequestApproval';
import DoctorForm from './DoctorForm';
import Settings from './Settings';
import LogoutButton from '../Auth/LogoutButton';
import DoctorService from '../../Services/DoctorService';
import PatientService from '../../Services/PatientService';
import api from '../../Services/api';
import './AdminDashboard.scss';
import PatientTable from './PatientTable';
import PatientForm from './PatientForm';
import UserService from '../../Services/UserService';
import TestTypeTable from './TestTypeTable';
// import axios from 'axios';
import ARVProtocol from '../DoctorProfile/ARVProtocol';
import AdminARVProtocolTable from './AdminARVProtocolTable';
import DrugManagement from './DrugManagement';
import FeedbackList from './FeedbackList';
import { toast } from 'react-toastify';


const AdminDashboard = () => {
    // Đặt overviewStats lên đầu tiên
    const [overviewStats, setOverviewStats] = useState({
        totalAppointmentsToday: 0,
        totalAppointmentsThisWeek: 0,
        totalAppointmentsThisMonth: 0,
        totalCompletedAppointments: 0,
        totalPendingAppointments: 0,
        totalCancelledAppointments: 0,
        totalActiveDoctors: 0,
        totalActivePatients: 0,
        totalPendingDayOffRequests: 0,
        totalConfirmedAppointments: 0,
        totalCheckedInAppointments: 0,
        totalPaidRevenue: 0.0
    });

    const [appointmentStatusStats, setAppointmentStatusStats] = useState([
      { name: 'Completed', value: 0, color: '#4caf50' },
      { name: 'Confirmed', value: 0, color: '#1976d2' },
      { name: 'Checked In', value: 0, color: '#00bcd4' },
      { name: 'Pending', value: 0, color: '#ffb300' },
      { name: 'Cancelled', value: 0, color: '#e53935' }
    ]);

    useEffect(() => {
      setAppointmentStatusStats([
        { name: 'Completed', value: overviewStats.totalCompletedAppointments || 0, color: '#4caf50' },
        { name: 'Confirmed', value: overviewStats.totalConfirmedAppointments || 0, color: '#1976d2' },
        { name: 'Pending', value: overviewStats.totalPendingAppointments || 0, color: '#ffb300' },
        { name: 'Cancelled', value: overviewStats.totalCancelledAppointments || 0, color: '#e53935' }
      ]);
    }, [overviewStats]);

    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Bác sĩ
    const [doctors, setDoctors] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [doctorFormData, setDoctorFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        address: '',
        avatar: '',
        specialty: '',
        experience: 0,
        department: '',
        status: 'ACTIVE',
        maxAppointments: '',
        qualifications: '',
    });

    // Bệnh nhân
    const [patients, setPatients] = useState([]);
    const [showPatientForm, setShowPatientForm] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);
    const [patientFormData, setPatientFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: '',
        address: '',
    });


    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load users
    const [users, setUsers] = useState([]);

    // State lưu thông tin user đang sửa
    const [editingUser, setEditingUser] = useState(null);

    // Load bác sĩ
    const fetchDoctors = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await DoctorService.getAllDoctors();
            if (Array.isArray(data)) {
                setDoctors(data);
            } else {
                setError('Dữ liệu trả về không đúng định dạng');
            }
        } catch (error) {
            console.error('Lỗi tải danh sách bác sĩ:', error);
            setError('Không thể tải danh sách bác sĩ. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    // Load bệnh nhân
    const fetchPatients = async () => {
        try {
            const data = await PatientService.getAllPatients();
            setPatients(data);
        } catch (error) {
            console.error('Lỗi tải bệnh nhân:', error);
        }
    };

    // Tổng quan
    const fetchOverview = async () => {
        try {
            const response = await api.get('/api/admin/users/overview');
            setOverviewStats(response.data);
        } catch (error) {
            console.error('Lỗi tải dữ liệu tổng quan:', error);
        }
    };


    useEffect(() => {
        fetchOverview(); // Chỉ gọi API tổng quan, không gọi /api/appointments/all
    }, []);

    // Update chart data when overviewStats changes
    useEffect(() => {
        setAppointmentStatusStats([
            { name: 'Completed', value: overviewStats.totalCompletedAppointments, color: '#4caf50' },
            { name: 'Confirmed', value: overviewStats.totalConfirmedAppointments, color: '#1976d2' },
            { name: 'Checked In', value: overviewStats.totalCheckedInAppointments, color: '#00bcd4' },
            { name: 'Pending', value: overviewStats.totalPendingAppointments, color: '#ffb300' },
            { name: 'Cancelled', value: overviewStats.totalCancelledAppointments, color: '#e53935' }
        ]);
    }, [overviewStats]);

    // Xử lý bác sĩ
    const handleEdit = (doctor) => {
        setDoctorFormData({
            username: doctor.username || '',
            password: '',
            fullName: doctor.fullName || '',
            email: doctor.email || '',
            phoneNumber: doctor.phoneNumber || '',
            address: doctor.address || '',
            avatar: doctor.avatar || '',
            specialty: doctor.specialty || '',
            experience: doctor.experience || 0,
            department: doctor.department || '',
            status: doctor.status || 'ACTIVE',
            maxAppointments: doctor.maxAppointments || '',
            qualifications: doctor.qualifications || '',
        });
        setEditingDoctor(doctor);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Xác nhận xoá bác sĩ?')) {
            try {
                await DoctorService.deleteDoctor(id);
                fetchDoctors();
            } catch (error) {
                console.error('Lỗi xoá bác sĩ:', error);
                alert('Không thể xóa bác sĩ. Vui lòng thử lại sau.');
            }
        }
    };

    const handleSubmit = async (data) => {
        try {
            const submissionData = {
                ...data,
                address: data.address || '',
            };
            if (editingDoctor) {
                await DoctorService.updateDoctor(editingDoctor.id, submissionData);
            } else {
                await DoctorService.addDoctor(submissionData);
            }
            setShowForm(false);
            setEditingDoctor(null);
            fetchDoctors();
        } catch (error) {
            console.error('Lỗi lưu bác sĩ:', error);
            toast.error('Không thể lưu thông tin bác sĩ. Vui lòng thử lại sau.');
        }
    };

    // Xử lý bệnh nhân
    const handlePatientEdit = (patient) => {
        setPatientFormData({
            fullName: patient.fullName || '',
            email: patient.email || '',
            phoneNumber: patient.phoneNumber || '',
            dateOfBirth: patient.dateOfBirth || '',
            gender: patient.gender || '',
            address: patient.address || '',
        });
        setEditingPatient(patient);
        setShowPatientForm(true);
    };

    const handlePatientDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xoá bệnh nhân này?')) {
            await PatientService.deletePatient(id);
            fetchPatients();
        }
    };

    const handlePatientSubmit = async (data) => {
        try {
            if (editingPatient) {
                await PatientService.updatePatient(editingPatient.id, data);
            } else {
                await PatientService.addPatient(data);
            }
            setShowPatientForm(false);
            setEditingPatient(null);
            fetchPatients();
        } catch (error) {
            console.error('Lỗi lưu bệnh nhân:', error);
        }
    };

    // Xử lý thêm user mới
    const handleAddUser = () => {
        setEditingUser(null);
        setShowPatientForm(true);
    };

    // Xử lý sửa user
    const handleEditUser = (user) => {
        if (!user || !user.id) {
            console.error('User không có id:', user);
            return;
        }
        setEditingUser({ ...user });
        setShowPatientForm(true);
    };

    // Xử lý submit form
    const handleUserSubmit = async (formData) => {
        try {
            if (!formData.id) {
                throw new Error('Không tìm thấy ID người dùng');
            }

            await UserService.updateUser(formData.id, {
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber,
                isAnonymous: formData.isAnonymous,
                roleName: formData.roleName,
                birthday: formData.birthday,
                gender: formData.gender,
                active: formData.active
            });

            await fetchUsers(); // làm mới danh sách
            setShowPatientForm(false);
            setEditingUser(null);
            alert('Cập nhật thông tin người dùng thành công!');
        } catch (err) {
            console.error('❌ Lỗi cập nhật user:', err);
            setError(err.response?.data?.message || 'Không thể cập nhật thông tin người dùng.');
            alert('Cập nhật thông tin người dùng thất bại!');
        }
    };

    // Xử lý deactivate user
    const handleDeactivateUser = async (userId) => {
        if (window.confirm('Bạn có chắc muốn deactivate người dùng này?')) {
            try {
                await UserService.deactivateUser(userId);
                await fetchUsers(); // Refresh the user list
                alert('Deactivate người dùng thành công!');
            } catch (error) {
                console.error('Lỗi deactivate user:', error);
                alert('Không thể deactivate người dùng. Vui lòng thử lại sau.');
            }
        }
    };

    // Xử lý hủy form
    const handleCancel = () => {
        setShowPatientForm(false);
        setEditingUser(null);
    };

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
                    <h1>Admin Dashboard</h1>
                    <p>Xin chào, {localStorage.getItem('fullName')}</p>
                </div>
                <div className="header-right">
                    <LogoutButton />
                </div>
            </header>
            <div className="dashboard-body">
                <SidebarMenu
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isOpen={isSidebarOpen}
                />
                <main className={`main-content ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>

                  {activeTab === 'overview' && (
                    <div className="dashboard-overview">
                      <div className="dashboard-header">
                        <h2>📊 Tổng quan hệ thống</h2>
                      </div>

                      <div className="dashboard-grid">
                        {/* Card 1: Thống kê lịch hẹn */}
                        <div className="dashboard-card">
                          <div className="card-header">
                            <h3>📅 Thống kê lịch hẹn</h3>
                          </div>
                          <div className="card-content">
                            <div className="stats-grid-3">
                              <div className="stat-card" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white'}}>
                                <div className="stat-number">{overviewStats.totalAppointmentsToday}</div>
                                <div className="stat-label">Lịch hẹn hôm nay</div>
                              </div>
                              <div className="stat-card" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white'}}>
                                <div className="stat-number">{overviewStats.totalAppointmentsThisWeek}</div>
                                <div className="stat-label">Lịch hẹn tuần này</div>
                              </div>
                              <div className="stat-card" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white'}}>
                                <div className="stat-number">{overviewStats.totalAppointmentsThisMonth}</div>
                                <div className="stat-label">Lịch hẹn tháng này</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card 2: Trạng thái lịch hẹn */}
                        <div className="dashboard-card">
                          <div className="card-header">
                            <h3>📋 Trạng thái lịch hẹn</h3>
                          </div>
                          <div className="card-content">
                            <div className="stats-grid-5">
                              <div className="stat-card" style={{background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)', color: 'white'}}>
                                <div className="stat-number">{overviewStats.totalCompletedAppointments}</div>
                                <div className="stat-label">Đã hoàn thành</div>
                              </div>
                              <div className="stat-card" style={{background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)', color: 'white'}}>
                                <div className="stat-number">{overviewStats.totalConfirmedAppointments}</div>
                                <div className="stat-label">Đã xác nhận</div>
                              </div>
                              <div className="stat-card" style={{background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)', color: 'white'}}>
                                <div className="stat-number">{overviewStats.totalCheckedInAppointments}</div>
                                <div className="stat-label">Đã check-in</div>
                              </div>
                              <div className="stat-card" style={{background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', color: 'white'}}>
                                <div className="stat-number">{overviewStats.totalPendingAppointments}</div>
                                <div className="stat-label">Đang chờ</div>
                              </div>
                              <div className="stat-card" style={{background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)', color: 'white'}}>
                                <div className="stat-number">{overviewStats.totalCancelledAppointments}</div>
                                <div className="stat-label">Đã hủy</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card 3: Thống kê người dùng */}
                        <div className="dashboard-card">
                          <div className="card-header">
                            <h3>👥 Thống kê người dùng</h3>
                          </div>
                          <div className="card-content">
                            <div className="stats-grid-3">
                              <div className="stat-card" style={{background: 'linear-gradient(135deg, #8360c3 0%, #2ebf91 100%)', color: 'white'}}>
                                <div className="stat-number">{overviewStats.totalActiveDoctors}</div>
                                <div className="stat-label">Bác sĩ hoạt động</div>
                              </div>
                              <div className="stat-card" style={{background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', color: '#333'}}>
                                <div className="stat-number">{overviewStats.totalActivePatients}</div>
                                <div className="stat-label">Bệnh nhân hoạt động</div>
                              </div>
                              <div className="stat-card" style={{background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', color: 'white'}}>
                                <div className="stat-number">{overviewStats.totalPendingDayOffRequests}</div>
                                <div className="stat-label">Đơn nghỉ chờ duyệt</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card 4: Thống kê doanh thu */}
                        <div className="dashboard-card">
                          <div className="card-header">
                            <h3>💰 Thống kê doanh thu</h3>
                          </div>
                          <div className="card-content">
                            <div className="stats-grid-1">
                              <div className="stat-card revenue-card" style={{background: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)', color: '#333', padding: '24px'}}>
                                <div className="stat-number" style={{fontSize: '28px', fontWeight: '700'}}>
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(overviewStats.totalPaidRevenue)}
                                </div>
                                <div className="stat-label" style={{fontSize: '16px', fontWeight: '600'}}>Tổng doanh thu đã thu</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card 5: Biểu đồ tỷ lệ */}
                        <div className="dashboard-card chart-card">
                          <div className="card-header">
                            <h3>📈 Tỷ lệ lịch hẹn theo trạng thái</h3>
                          </div>
                          <div className="card-content">
                            <div className="chart-container">
                              <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                  <Pie
                                    data={appointmentStatusStats}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                  >
                                    {appointmentStatusStats.map((entry, idx) => (
                                      <Cell key={`cell-${idx}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                  <Legend />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                    {activeTab === 'doctors' && (
                        <DoctorTable />
                    )}

                    {activeTab === 'doctor-schedule' && (
                        <DoctorScheduleManagement />
                    )}
                    {activeTab === 'doctor-schedule-requests' && (
                        <DoctorScheduleRequestApproval />
                    )}

                    {activeTab === 'patients' && (
                        <>
                            <PatientTable
                                patients={patients}
                                onEdit={handlePatientEdit}
                                onDelete={handlePatientDelete}
                                onAdd={() => {
                                    setPatientFormData({
                                        fullName: '',
                                        email: '',
                                        phoneNumber: '',
                                        dateOfBirth: '',
                                        gender: '',
                                        address: ''
                                    });
                                    setEditingPatient(null);
                                    setShowPatientForm(true);
                                }}
                            />

                            {showPatientForm && (
                                <PatientForm
                                    data={patientFormData}
                                    onChange={setPatientFormData}
                                    onSubmit={() => handlePatientSubmit(patientFormData)}
                                    onCancel={() => setShowPatientForm(false)}
                                    editing={Boolean(editingPatient)}
                                />
                            )}
                        </>
                    )}

                    {activeTab === 'users' && (
                        <div className="users-section">
                            {loading ? (
                                <div>Đang tải...</div>
                            ) : error ? (
                                <div className="error-message">{error}</div>
                            ) : (
                                <>
                                    <PatientTable
                                        users={users}
                                        onEdit={handleEditUser}
                                        onAdd={handleAddUser}
                                        onDeactivate={handleDeactivateUser}
                                    />

                                    {showPatientForm && (
                                        <PatientForm
                                            data={editingUser}
                                            onSubmit={handleUserSubmit}
                                            onCancel={handleCancel}
                                            editing={Boolean(editingUser)}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'feedbacks' && <FeedbackList />}
                    {activeTab === 'test-types' && <TestTypeTable />}
                    {activeTab === 'arv-protocol' && <AdminARVProtocolTable />}
                    {activeTab === 'drug-management' && <DrugManagement />}
                    {activeTab === 'settings' && <Settings />}

                    {showForm && (
                        <DoctorForm
                            data={doctorFormData}
                            onChange={setDoctorFormData}
                            onSubmit={() => handleSubmit(doctorFormData)}
                            onCancel={() => setShowForm(false)}
                            editing={Boolean(editingDoctor)}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
