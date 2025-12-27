import React, { useState, useEffect } from 'react';
import './Medication.scss';
import { FaArrowLeft, FaClock, FaBell, FaCapsules, FaCalendarCheck, FaEdit, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Medication = () => {
    const [activeTab, setActiveTab] = useState('schedule');
    const navigate = useNavigate();

    const renderContent = () => {
        switch (activeTab) {
            case 'schedule':
                return <ScheduleTab />;
            case 'my-meds':
                return <MyMedsTab />;
            case 'reminders':
                return <RemindersTab />;
            default:
                return <ScheduleTab />;
        }
    };

    return (
        <div className="medication-page">
            <div className="back-link" onClick={() => navigate('/services')}>
                <FaArrowLeft /> Quay lại trang dịch vụ
            </div>
            <header className="medication-header">
                <h1>Quản lý thuốc ARV</h1>
                <p>Theo dõi và quản lý lịch uống thuốc ARV của bạn</p>
            </header>
            <div className="medication-tabs">
                <button onClick={() => setActiveTab('schedule')} className={activeTab === 'schedule' ? 'active' : ''}>
                    Lịch uống thuốc
                </button>
                <button onClick={() => setActiveTab('my-meds')} className={activeTab === 'my-meds' ? 'active' : ''}>
                    Thuốc của tôi
                </button>
                <button onClick={() => setActiveTab('reminders')} className={activeTab === 'reminders' ? 'active' : ''}>
                    Nhắc nhở
                </button>
            </div>
            <div className="medication-content">
                {renderContent()}
            </div>
        </div>
    );
};

const ScheduleTab = () => {
    const [treatmentPlans, setTreatmentPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddSchedule, setShowAddSchedule] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState('');
    const [addSuccess, setAddSuccess] = useState('');
    const [form, setForm] = useState({ medicationName: '', dosage: '', frequency: '', timeOfDay: '' });
    const [editPlanId, setEditPlanId] = useState(null);
    const [editPlanForm, setEditPlanForm] = useState({ startDate: '', endDate: '', notes: '', decisionSummary: '' });
    const [editPlanLoading, setEditPlanLoading] = useState(false);
    const [editPlanError, setEditPlanError] = useState('');
    const [editPlanSuccess, setEditPlanSuccess] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const userRes = await axios.get('http://localhost:8080/api/users/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const patientId = userRes.data.id;
                const planRes = await axios.get(`http://localhost:8080/api/patient-treatment-plans/patient/${patientId}/status/ACTIVE`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTreatmentPlans(planRes.data || []);
            } catch (err) {
                setError('Không thể tải dữ liệu.');
                setTreatmentPlans([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Thêm log debug trước khi render
    console.log('DEBUG treatmentPlans:', treatmentPlans);

    const handleAddSchedule = async (e) => {
        e.preventDefault();
        setAddLoading(true);
        setAddError('');
        setAddSuccess('');
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8080/api/medication-schedules', {
                treatmentPlanId: treatmentPlans[0].id,
                medicationName: form.medicationName,
                dosage: form.dosage,
                frequency: form.frequency,
                timeOfDay: form.timeOfDay
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAddSuccess('Thêm lịch uống thuốc thành công!');
            setShowAddSchedule(false);
            setForm({ medicationName: '', dosage: '', frequency: '', timeOfDay: '' });
        } catch (err) {
            setAddError('Không thể thêm lịch uống thuốc.');
        } finally {
            setAddLoading(false);
        }
    };

    return (
        <div className="treatment-plan-list">
            <h2>Kế hoạch điều trị đang hoạt động</h2>
            {loading ? (
                <div>Đang tải...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : Array.isArray(treatmentPlans) && treatmentPlans.length === 0 ? (
                <div>Không có kế hoạch điều trị nào đang hoạt động.</div>
            ) : (
                Array.isArray(treatmentPlans) && treatmentPlans.map(plan => (
                    <div className="treatment-plan-card" key={plan.id}>
                        <div className="treatment-plan-header">
                            <div className="treatment-plan-dates">
                                <span className="plan-date"><FaCalendarCheck /> {plan.startDate}</span>
                                <span className="plan-date">Đến: {plan.endDate || '...'}</span>
                            </div>
                            <div className="treatment-plan-status-edit">
                                <span className="plan-status">Đang điều trị</span>
                                <FaEdit className="plan-edit-icon" title="Sửa kế hoạch" onClick={() => {
                                    setEditPlanId(plan.id);
                                    setEditPlanForm({
                                        startDate: plan.startDate,
                                        endDate: plan.endDate || '',
                                        notes: plan.notes || '',
                                        decisionSummary: plan.decisionSummary || ''
                                    });
                                    setEditPlanError('');
                                    setEditPlanSuccess('');
                                }} />
                            </div>
                        </div>
                        <div className="treatment-plan-info">
                            <div><span className="plan-label">Phác đồ ARV:</span> <span className="plan-value">{plan.arvProtocolName || plan.arvProtocolId}</span></div>
                            <div><span className="plan-label">Bác sĩ điều trị:</span> <span className="plan-value">{plan.doctorName || plan.doctorId}</span></div>
                            <div><span className="plan-label">Thời gian điều trị:</span> <span className="plan-value">{plan.startDate} - {plan.endDate || '...'}</span></div>
                            <div><span className="plan-label">Ghi chú:</span> <span className="plan-value">{plan.notes || ''}</span></div>
                            <div><span className="plan-label">Tóm tắt quyết định:</span> <span className="plan-value">{plan.decisionSummary || ''}</span></div>
                        </div>
                        {editPlanId === plan.id && (
                            <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 18, marginTop: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                <h4>Sửa kế hoạch điều trị</h4>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    setEditPlanLoading(true);
                                    setEditPlanError('');
                                    setEditPlanSuccess('');
                                    try {
                                        const token = localStorage.getItem('token');
                                        await axios.put(`http://localhost:8080/api/patient-treatment-plans/${plan.id}`, {
                                            startDate: editPlanForm.startDate,
                                            endDate: editPlanForm.endDate,
                                            notes: editPlanForm.notes,
                                            decisionSummary: editPlanForm.decisionSummary
                                        }, {
                                            headers: { Authorization: `Bearer ${token}` }
                                        });
                                        setEditPlanSuccess('Cập nhật thành công!');
                                        // reload lại danh sách
                                        const userRes = await axios.get('http://localhost:8080/api/users/me', {
                                            headers: { Authorization: `Bearer ${token}` }
                                        });
                                        const patientId = userRes.data.id;
                                        const planRes = await axios.get(`http://localhost:8080/api/patient-treatment-plans/patient/${patientId}/status/ACTIVE`, {
                                            headers: { Authorization: `Bearer ${token}` }
                                        });
                                        setTreatmentPlans(planRes.data || []);
                                        setEditPlanId(null);
                                    } catch {
                                        setEditPlanError('Không thể cập nhật.');
                                    } finally {
                                        setEditPlanLoading(false);
                                    }
                                }}>
                                    <div style={{ marginBottom: 8 }}>
                                        <label>Ngày bắt đầu: </label>
                                        <input type="date" value={editPlanForm.startDate} onChange={e => setEditPlanForm(f => ({ ...f, startDate: e.target.value }))} required />
                                    </div>
                                    <div style={{ marginBottom: 8 }}>
                                        <label>Ngày kết thúc: </label>
                                        <input type="date" value={editPlanForm.endDate} onChange={e => setEditPlanForm(f => ({ ...f, endDate: e.target.value }))} />
                                    </div>
                                    <div style={{ marginBottom: 8 }}>
                                        <label>Ghi chú: </label>
                                        <input type="text" value={editPlanForm.notes} onChange={e => setEditPlanForm(f => ({ ...f, notes: e.target.value }))} />
                                    </div>
                                    <div style={{ marginBottom: 8 }}>
                                        <label>Tóm tắt quyết định: </label>
                                        <input type="text" value={editPlanForm.decisionSummary} onChange={e => setEditPlanForm(f => ({ ...f, decisionSummary: e.target.value }))} />
                                    </div>
                                    {editPlanError && <div style={{ color: 'red', marginBottom: 8 }}>{editPlanError}</div>}
                                    {editPlanSuccess && <div style={{ color: 'green', marginBottom: 8 }}>{editPlanSuccess}</div>}
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button type="button" onClick={() => setEditPlanId(null)} disabled={editPlanLoading}>Hủy</button>
                                        <button type="submit" disabled={editPlanLoading}>{editPlanLoading ? 'Đang lưu...' : 'Lưu'}</button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

const MyMedsTab = () => {
    // Chỉ hiển thị thông báo nếu chưa có API thực tế
    return (
        <div className="medication-card">
            <h2>Phác đồ ARV hiện tại</h2>
            <p>Chức năng đang được phát triển. Vui lòng liên hệ bác sĩ hoặc quản trị viên để biết thêm thông tin về thuốc của bạn.</p>
        </div>
    );
};

const RemindersTab = () => {
    // Chỉ hiển thị thông báo nếu chưa có API thực tế
    return (
        <div className="medication-card">
            <h2>Nhắc nhở uống thuốc</h2>
            <p>Chức năng đang được phát triển. Vui lòng sử dụng tính năng nhắc nhở ở trang chính hoặc liên hệ quản trị viên.</p>
        </div>
    );
};

export default Medication; 