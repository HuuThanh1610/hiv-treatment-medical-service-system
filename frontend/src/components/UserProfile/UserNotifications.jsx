import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaRegBell, FaCheckCircle, FaTrashAlt } from 'react-icons/fa';
import dayjs from 'dayjs';

const TABS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'today', label: 'Hôm nay' },
    { key: 'history', label: 'Lịch sử' },
];

const UserNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [patientId, setPatientId] = useState(null);
    const missTimeouts = useRef({});
    const [selectedMonth, setSelectedMonth] = useState(dayjs()); // dayjs object
    const [compliance, setCompliance] = useState(null);
    const [complianceLoading, setComplianceLoading] = useState(false);
    const [complianceError, setComplianceError] = useState(null);
    // Thêm hàm lấy báo cáo compliance cho các mốc thời gian
    const [complianceStats, setComplianceStats] = useState({ week: null, month: null, quarter: null });
    const [complianceStatsLoading, setComplianceStatsLoading] = useState(false);
    const [complianceStatsError, setComplianceStatsError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const fetchPatientIdAndNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            // 1. Lấy user hiện tại
            const userRes = await axios.get('http://localhost:8080/api/patients/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const id = userRes.data.id;
            setPatientId(id);

            // 2. Lấy thông báo của patient theo activeTab
            let apiUrl;
            if (activeTab === 'all') {
                // Tab "Tất cả" - chỉ lấy những reminder có status SENT
                apiUrl = `http://localhost:8080/api/treatment-reminders/patient/${id}/status/SENT`;
            } else if (activeTab === 'today') {
                // Tab "Hôm nay" - lấy reminders của hôm nay có status SENT
                apiUrl = `http://localhost:8080/api/treatment-reminders/patient/${id}/status/SENT`;
            } else if (activeTab === 'history') {
                // Tab "Lịch sử" - lấy tất cả reminder theo từng trạng thái
                const [sentRes, completedRes, missedRes] = await Promise.all([
                    axios.get(`http://localhost:8080/api/treatment-reminders/patient/${id}/status/SENT`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`http://localhost:8080/api/treatment-reminders/patient/${id}/status/COMPLETED`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`http://localhost:8080/api/treatment-reminders/patient/${id}/status/MISSED`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                // Gộp và sắp xếp tất cả reminder
                const allReminders = [
                    ...sentRes.data,
                    ...completedRes.data,
                    ...missedRes.data
                ].sort((a, b) => new Date(b.reminderDate) - new Date(a.reminderDate));

                setNotifications(allReminders);
                return;
            }

            if (apiUrl) {
            const res = await axios.get(apiUrl, {
                headers: { Authorization: `Bearer ${token}` }
            });
                
                // Sắp xếp thông báo theo thời gian mới nhất lên đầu
                const sortedNotifications = res.data.sort((a, b) => 
                    new Date(b.reminderDate) - new Date(a.reminderDate)
                );
                
                setNotifications(sortedNotifications);
            }
        } catch (err) {
            setError('Không thể tải thông báo.');
            setNotifications([]);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatientIdAndNotifications();
        // eslint-disable-next-line
    }, [activeTab]);

    // Lấy báo cáo tuân thủ
    useEffect(() => {
        if (!patientId) return;
        const fetchCompliance = async () => {
            setComplianceLoading(true);
            setComplianceError(null);
            try {
                const token = localStorage.getItem('token');
                const startDate = selectedMonth.startOf('month').format('YYYY-MM-DD');
                const endDate = selectedMonth.endOf('month').format('YYYY-MM-DD');
                const res = await axios.get(`http://localhost:8080/api/treatment-reminders/reports/patient/${patientId}/compliance?startDate=${startDate}&endDate=${endDate}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCompliance(res.data);
            } catch (err) {
                setComplianceError('Không thể tải báo cáo tuân thủ.');
                setCompliance(null);
            } finally {
                setComplianceLoading(false);
            }
        };
        fetchCompliance();
    }, [patientId, selectedMonth]);

    // Thêm hàm lấy báo cáo compliance cho các mốc thời gian
    useEffect(() => {
        if (!patientId) return;
        const fetchStats = async () => {
            setComplianceStatsLoading(true);
            setComplianceStatsError(null);
            try {
                const token = localStorage.getItem('token');
                const now = dayjs();
                // Tuần này
                const weekStart = now.startOf('week').format('YYYY-MM-DD');
                const weekEnd = now.endOf('week').format('YYYY-MM-DD');
                // Tháng này
                const monthStart = now.startOf('month').format('YYYY-MM-DD');
                const monthEnd = now.endOf('month').format('YYYY-MM-DD');
                // 3 tháng qua
                const quarterStart = now.subtract(2, 'month').startOf('month').format('YYYY-MM-DD');
                const quarterEnd = now.endOf('month').format('YYYY-MM-DD');
                const [weekRes, monthRes, quarterRes] = await Promise.all([
                    axios.get(`http://localhost:8080/api/treatment-reminders/reports/patient/${patientId}/compliance?startDate=${weekStart}&endDate=${weekEnd}`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`http://localhost:8080/api/treatment-reminders/reports/patient/${patientId}/compliance?startDate=${monthStart}&endDate=${monthEnd}`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`http://localhost:8080/api/treatment-reminders/reports/patient/${patientId}/compliance?startDate=${quarterStart}&endDate=${quarterEnd}`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                setComplianceStats({
                    week: weekRes.data,
                    month: monthRes.data,
                    quarter: quarterRes.data,
                });
            } catch (err) {
                setComplianceStatsError('Không thể tải thống kê tuân thủ.');
                setComplianceStats({ week: null, month: null, quarter: null });
            } finally {
                setComplianceStatsLoading(false);
            }
        };
        fetchStats();
    }, [patientId]);

    // Hàm chuyển tháng
    const handlePrevMonth = () => setSelectedMonth(m => m.subtract(1, 'month'));
    const handleNextMonth = () => setSelectedMonth(m => m.add(1, 'month'));

    const isToday = (dateStr) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        const now = new Date();
        return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    };
    const isPast = (dateStr) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        const now = new Date();
        return d < now && !isToday(dateStr);
    };

    // Xử lý đánh dấu đã đọc
    const handleMarkAsRead = async (reminderId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/treatment-reminders/${reminderId}/send`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPatientIdAndNotifications();
        } catch (err) {
            alert('Không thể đánh dấu đã đọc!');
        }
    };

    // Xử lý xóa thông báo
    const handleDelete = async (reminderId) => {
        if (!window.confirm('Bạn có chắc muốn xóa thông báo này?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/treatment-reminders/${reminderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPatientIdAndNotifications();
        } catch (err) {
            console.error('Không thể xóa thông báo:', err);
        }
    };

    // Thêm hàm xử lý uống thuốc
    const handleComplete = async (reminderId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/treatment-reminders/${reminderId}/complete`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPatientIdAndNotifications();
        } catch (err) {
            console.error('Không thể đánh dấu đã uống:', err);
        }
    };

    // Tự động miss nếu quá 2 tiếng sau giờ uống mà chưa ấn "Uống"
    const handleMiss = async (reminderId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/treatment-reminders/${reminderId}/miss`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPatientIdAndNotifications();
        } catch (err) {
            // Có thể alert hoặc log
        }
    };

    let filteredNotifications = notifications;
    if (activeTab === 'today') {
        // Filter chỉ lấy reminders của hôm nay từ những reminder có status SENT
        filteredNotifications = notifications.filter(n => isToday(n.reminderDate));
    } else if (activeTab === 'history') {
        // Lấy tất cả thông báo, không cần filter
        filteredNotifications = notifications;
    }

    // Thêm component progress bar
    const ProgressBar = ({ percent }) => (
        <div style={{ background: '#f2f2f2', borderRadius: 6, height: 8, width: '100%', margin: '8px 0' }}>
            <div style={{ background: '#111', height: 8, borderRadius: 6, width: `${percent}%`, transition: 'width 0.5s' }} />
        </div>
    );

    // Component phân trang
    const Pagination = ({ totalItems }) => {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        if (totalPages <= 1) return null;

        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                marginTop: '20px',
                padding: '10px'
            }}>
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{
                        padding: '8px 16px',
                        border: '1px solid #1976d2',
                        borderRadius: '4px',
                        background: currentPage === 1 ? '#e3f2fd' : '#fff',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        color: currentPage === 1 ? '#90caf9' : '#1976d2',
                        fontWeight: 500,
                        minWidth: '80px',
                        transition: 'all 0.2s ease'
                    }}
                >
                    Trước
                </button>

                <div style={{ 
                    display: 'flex', 
                    gap: '5px', 
                    alignItems: 'center',
                    background: '#f5f5f5',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontWeight: 500,
                    color: '#1976d2'
                }}>
                    Trang {currentPage} / {totalPages}
                </div>

                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={{
                        padding: '8px 16px',
                        border: '1px solid #1976d2',
                        borderRadius: '4px',
                        background: currentPage === totalPages ? '#e3f2fd' : '#fff',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        color: currentPage === totalPages ? '#90caf9' : '#1976d2',
                        fontWeight: 500,
                        minWidth: '80px',
                        transition: 'all 0.2s ease'
                    }}
                >
                    Sau
                </button>
            </div>
        );
    };

    return (
        <div className="user-notifications" style={{ textAlign: 'left', width: 'auto', maxWidth: 'none', marginLeft: 20, marginRight: 25, marginTop: 0, marginBottom: 0 }}>
            <h2 style={{ marginBottom: 16 }}>Thông báo</h2>
            {/* Báo cáo tuân thủ */}
            <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 24 }}>
                <button onClick={handlePrevMonth} style={{ fontSize: 18, border: 'none', background: 'none', cursor: 'pointer', color: '#1976d2' }}>&lt;</button>
                <div style={{ minWidth: 120, fontWeight: 600 }}>{selectedMonth.format('MM/YYYY')}</div>
                <button onClick={handleNextMonth} style={{ fontSize: 18, border: 'none', background: 'none', cursor: 'pointer', color: '#1976d2' }} disabled={selectedMonth.isSame(dayjs(), 'month') || selectedMonth.isAfter(dayjs(), 'month')}>&gt;</button>
                <div style={{ flex: 1 }}>
                    {complianceLoading ? (
                        <span>Đang tải báo cáo...</span>
                    ) : complianceError ? (
                        <span style={{ color: 'red' }}>{complianceError}</span>
                    ) : compliance ? (
                        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                            <div><b>Ngày báo cáo:</b> {compliance.reportDate}</div>
                            <div><b>Đơn thuốc:</b> {compliance.totalReminders}</div>
                            <div><b>Số lần tuân thủ:</b> {compliance.completedReminders}</div>
                            <div><b>Không tuân thủ:</b> {compliance.missedReminders}</div>
                            <div><b>Còn lại:</b> {compliance.pendingReminders}</div>
                            <div><b>Tỉ lệ tuân thủ:</b> {compliance.complianceRate}%</div>
                        </div>
                    ) : null}
                </div>
            </div>
            {/* Thêm phần hiển thị thống kê tuân thủ điều trị */}
            <div style={{ marginBottom: 32 }}>
                <h3 style={{ margin: 0, fontWeight: 600 }}>Tuân thủ điều trị</h3>
                <div style={{ color: '#555', fontSize: 14, marginBottom: 12 }}>Thống kê tuân thủ điều trị ARV</div>
                {complianceStatsLoading ? (
                    <div>Đang tải...</div>
                ) : complianceStatsError ? (
                    <div style={{ color: 'red' }}>{complianceStatsError}</div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <div style={{ minWidth: 90 }}>Tháng này</div>
                        <ProgressBar percent={complianceStats.month?.complianceRate || 0} />
                        <div style={{ minWidth: 40, textAlign: 'right' }}>{complianceStats.month?.complianceRate ? `${Math.round(complianceStats.month.complianceRate)}%` : '--'}</div>
                    </div>
                )}
            </div>
            {/* TODO: Comment code cũ để chuẩn bị code mới cho các tab */}
            {/*
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            padding: '6px 16px',
                            borderRadius: 4,
                            border: activeTab === tab.key ? '2px solid #1976d2' : '1px solid #ccc',
                            background: activeTab === tab.key ? '#e3f2fd' : '#fff',
                            color: activeTab === tab.key ? '#1976d2' : '#333',
                            fontWeight: activeTab === tab.key ? 'bold' : 'normal',
                            cursor: 'pointer',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            {loading ? (
                <div>Đang tải thông báo...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : filteredNotifications.length === 0 ? (
                <div>Không có thông báo nào.</div>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {filteredNotifications.map(n => (
                        <li key={n.id} style={{ marginBottom: 18, padding: 12, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <FaRegBell size={22} style={{ marginTop: 2, flexShrink: 0, color: '#444' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 2 }}>
                                    {n.reminderType === 'MEDICATION'
                                        ? 'Nhắc nhở uống thuốc'
                                        : n.reminderType === 'APPOINTMENT'
                                            ? 'Nhắc nhở tái khám'
                                            : 'Nhắc nhở'}
                                </div>
                                <div style={{ color: '#555', fontSize: 14, marginBottom: 4 }}>
                                    {n.message
                                        ? n.message
                                        : n.reminderType === 'MEDICATION'
                                            ? 'Đã đến giờ uống thuốc ARV buổi tối (8:00 PM).'
                                            : n.reminderType === 'APPOINTMENT'
                                                ? 'Bạn có lịch tái khám sắp tới.'
                                                : ''}
                                </div>
                                <div style={{ fontSize: 13, color: '#888' }}>
                                    {n.reminderDate ? new Date(n.reminderDate).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                                </div>
                                {activeTab === 'today' && n.reminderType === 'MEDICATION' && n.status === 'SENT' && (() => {
                                    const now = new Date();
                                    const reminderTime = new Date(n.reminderDate);
                                    const diffMs = reminderTime - now;
                                    const diffHours = diffMs / (1000 * 60 * 60);
                                    if (diffHours >= -1 && diffHours <= 2) {
                                        if (!n._sentMarked) {
                                            n._sentMarked = true;
                                            axios.put(`http://localhost:8080/api/treatment-reminders/${n.id}/send`, {}, {
                                                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                            }).catch(() => { });
                                        }
                                        return (
                                            <button style={{ marginTop: 6, padding: '4px 12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                                onClick={() => handleComplete(n.id)}>
                                                Uống
                                            </button>
                                        );
                                    }
                                    return null;
                                })()}
                                {activeTab === 'history' && (
                                    <div style={{ marginTop: 6, fontWeight: 500, color: n.status === 'COMPLETED' ? '#388e3c' : '#e53935' }}>
                                        {n.status === 'COMPLETED' ? 'Đã hoàn thành' : n.status === 'MISSED' ? 'Bỏ lỡ' : ''}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 12, marginLeft: 8, alignItems: 'center' }}>
                                {activeTab === 'all' && n.status !== 'SENT' && (
                                    <FaCheckCircle
                                        size={20}
                                        style={{ color: '#1976d2', cursor: 'pointer' }}
                                        title="Đánh dấu đã đọc"
                                        onClick={() => handleMarkAsRead(n.id)}
                                    />
                                )}
                                <FaTrashAlt
                                    size={18}
                                    style={{ color: '#e53935', cursor: 'pointer' }}
                                    title="Xóa thông báo"
                                    onClick={() => handleDelete(n.id)}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            */}

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            padding: '6px 16px',
                            borderRadius: 4,
                            border: activeTab === tab.key ? '2px solid #1976d2' : '1px solid #ccc',
                            background: activeTab === tab.key ? '#e3f2fd' : '#fff',
                            color: activeTab === tab.key ? '#1976d2' : '#333',
                            fontWeight: activeTab === tab.key ? 'bold' : 'normal',
                            cursor: 'pointer',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'all' && (
                <div>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>Đang tải thông báo...</div>
                    ) : error ? (
                        <div style={{ color: 'red', textAlign: 'center', padding: 20 }}>{error}</div>
                    ) : filteredNotifications.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>Không có thông báo nào.</div>
                    ) : (
                        <div style={{ display: 'grid', gap: 16 }}>
                            {filteredNotifications.map(reminder => (
                                <div
                                    key={reminder.id}
                                    style={{
                                        background: '#fff',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 8,
                                        padding: 16,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        position: 'relative'
                                    }}
                                >
                                    {/* Header */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <FaRegBell size={20} style={{ color: '#1976d2' }} />
                                            <span style={{ fontWeight: 600, fontSize: 16 }}>
                                                {reminder.reminderType === 'MEDICATION' ? 'Nhắc nhở uống thuốc' : 'Nhắc nhở tái khám'}
                                            </span>
                                        </div>
                                        <div style={{
                                            padding: '4px 8px',
                                            borderRadius: 4,
                                            fontSize: 12,
                                            fontWeight: 500,
                                            background: reminder.status === 'SENT' ? '#e3f2fd' : '#f5f5f5',
                                            color: reminder.status === 'SENT' ? '#1976d2' : '#666'
                                        }}>
                                            {reminder.status === 'SENT' ? 'Đã gửi' : reminder.status}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div style={{ marginBottom: 12 }}>
                                        {reminder.reminderType === 'MEDICATION' && (
                                            <div>
                                                <div style={{ marginBottom: 8 }}>
                                                    <strong>Thuốc:</strong> {reminder.medicationName || 'Không có thông tin'}
                                                </div>
                                                <div style={{ marginBottom: 8 }}>
                                                    <strong>Liều dùng:</strong> {reminder.dosage || 'Không có thông tin'}
                                                </div>
                                                <div style={{ marginBottom: 8 }}>
                                                    <strong>Thời gian:</strong> {reminder.reminderDate ? new Date(reminder.reminderDate).toLocaleString('vi-VN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    }) : 'Không có thông tin'}
                                                </div>
                                            </div>
                                        )}

                                        {reminder.message && (
                                            <div style={{
                                                background: '#f8f9fa',
                                                padding: 8,
                                                borderRadius: 4,
                                                fontSize: 14,
                                                color: '#555'
                                            }}>
                                                {reminder.message}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                        {reminder.reminderType === 'MEDICATION' && reminder.status === 'SENT' && (
                                            <button
                                                onClick={() => handleComplete(reminder.id)}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: '#4caf50',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: 4,
                                                    cursor: 'pointer',
                                                    fontSize: 14,
                                                    fontWeight: 500
                                                }}
                                            >
                                                Đã uống
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleDelete(reminder.id)}
                                            style={{
                                                padding: '6px 12px',
                                                background: '#f44336',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: 4,
                                                cursor: 'pointer',
                                                fontSize: 14
                                            }}
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Thay thế phần TODO bằng implementation mới */}
            {activeTab === 'today' && (
                <div>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>Đang tải thông báo...</div>
                    ) : error ? (
                        <div style={{ color: 'red', textAlign: 'center', padding: 20 }}>{error}</div>
                    ) : filteredNotifications.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>Không có thông báo nào cho hôm nay.</div>
                    ) : (
                        <>
                            <div style={{ display: 'grid', gap: 16 }}>
                                {filteredNotifications
                                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                    .map(reminder => (
                                        <div
                                            key={reminder.id}
                                            style={{
                                                background: '#fff',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: 8,
                                                padding: 16,
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <FaRegBell size={20} style={{ color: '#1976d2' }} />
                                                    <span style={{ fontWeight: 600, fontSize: 16 }}>
                                                        {reminder.reminderType === 'MEDICATION' ? 'Nhắc nhở uống thuốc' : 'Nhắc nhở tái khám'}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    padding: '4px 8px',
                                                    borderRadius: 4,
                                                    fontSize: 12,
                                                    fontWeight: 500,
                                                    background: '#e3f2fd',
                                                    color: '#1976d2'
                                                }}>
                                                    Hôm nay
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: 12 }}>
                                                {reminder.reminderType === 'MEDICATION' && (
                                                    <div>
                                                        <div style={{ marginBottom: 8 }}>
                                                            <strong>Thuốc:</strong> {reminder.medicationName || 'Không có thông tin'}
                                                        </div>
                                                        <div style={{ marginBottom: 8 }}>
                                                            <strong>Liều dùng:</strong> {reminder.dosage || 'Không có thông tin'}
                                                        </div>
                                                        <div>
                                                            <strong>Thời gian:</strong> {new Date(reminder.reminderDate).toLocaleTimeString('vi-VN', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => handleComplete(reminder.id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#4caf50',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: 4,
                                                        cursor: 'pointer',
                                                        fontSize: 14,
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    Đã uống
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(reminder.id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#f44336',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: 4,
                                                        cursor: 'pointer',
                                                        fontSize: 14
                                                    }}
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        </div>
                                ))}
                            </div>
                            {/* Pagination */}
                            {filteredNotifications.length > itemsPerPage && (
                                <Pagination totalItems={filteredNotifications.length} />
                            )}
                        </>
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>Đang tải thông báo...</div>
                    ) : error ? (
                        <div style={{ color: 'red', textAlign: 'center', padding: 20 }}>{error}</div>
                    ) : filteredNotifications.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>Không có lịch sử thông báo.</div>
                    ) : (
                        <>
                            <div style={{ display: 'grid', gap: 16 }}>
                                {filteredNotifications
                                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                    .map(reminder => (
                                        <div
                                            key={reminder.id}
                                            style={{
                                                background: '#fff',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: 8,
                                                padding: 16,
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <FaRegBell size={20} style={{ color: '#666' }} />
                                                    <span style={{ fontWeight: 600, fontSize: 16 }}>
                                                        {reminder.reminderType === 'MEDICATION' ? 'Nhắc nhở uống thuốc' : 'Nhắc nhở tái khám'}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    padding: '4px 8px',
                                                    borderRadius: 4,
                                                    fontSize: 12,
                                                    fontWeight: 500,
                                                    background: reminder.status === 'COMPLETED' ? '#e8f5e9' : '#ffebee',
                                                    color: reminder.status === 'COMPLETED' ? '#2e7d32' : '#c62828'
                                                }}>
                                                    {reminder.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Bỏ lỡ'}
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: 12 }}>
                                                {reminder.reminderType === 'MEDICATION' && (
                                                    <div>
                                                        <div style={{ marginBottom: 8 }}>
                                                            <strong>Thuốc:</strong> {reminder.medicationName || 'Không có thông tin'}
                                                        </div>
                                                        <div style={{ marginBottom: 8 }}>
                                                            <strong>Liều dùng:</strong> {reminder.dosage || 'Không có thông tin'}
                                                        </div>
                                                        <div>
                                                            <strong>Thời gian:</strong> {new Date(reminder.reminderDate).toLocaleString('vi-VN', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric'
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => handleDelete(reminder.id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#f44336',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: 4,
                                                        cursor: 'pointer',
                                                        fontSize: 14
                                                    }}
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        </div>
                                ))}
                            </div>
                            {/* Pagination */}
                            {filteredNotifications.length > itemsPerPage && (
                                <Pagination totalItems={filteredNotifications.length} />
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserNotifications; 