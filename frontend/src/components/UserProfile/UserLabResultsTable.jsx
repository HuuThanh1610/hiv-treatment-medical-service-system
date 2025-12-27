import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserAppointmentTable.scss'; // Reusing styles
import './UserLabResultsTable.scss';

const groupResultsByLabRequest = (labRequests) => {
    // Nhóm các labRequestItems theo từng labRequest
    return labRequests.map(lr => ({
        id: lr.id,
        requestDate: lr.requestDate,
        doctorName: lr.doctorName,
        labRequestItems: lr.labRequestItems || [],
    })).filter(lr => lr.labRequestItems.length > 0);
};

const getStatus = (resultValue, normalRange) => {
    if (!resultValue || !normalRange || normalRange.toLowerCase().includes('âm tính')) {
        if (resultValue?.toLowerCase().includes('dương')) return 'Abnormal';
        if (resultValue?.toLowerCase().includes('âm')) return 'Normal';
        return 'N/A';
    }
    const rangeParts = normalRange.match(/[\d.]+/g);
    if (!rangeParts || rangeParts.length < 2) return 'Unknown';
    const [min, max] = rangeParts.map(parseFloat);
    const value = parseFloat(resultValue);
    if (isNaN(value)) return 'Unknown';
    if (value >= min && value <= max) {
        return 'Normal';
    } else {
        return 'Abnormal';
    }
};

const UserLabResultsTable = () => {
    const [labRequests, setLabRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedResult, setSelectedResult] = useState(null);
    const [patientId, setPatientId] = useState(null);
    const [selectedTestType, setSelectedTestType] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [labResultMessages, setLabResultMessages] = useState({});
    const [loadingMessages, setLoadingMessages] = useState({});

    useEffect(() => {
        const fetchLabResults = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token found');
                // Lấy danh sách kết quả xét nghiệm của chính bệnh nhân đang đăng nhập
                const response = await axios.get('http://localhost:8080/api/lab-requests/patient/my-results', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLabRequests(response.data);
            } catch (err) {
                setError('Không thể tải kết quả xét nghiệm.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLabResults();
    }, []);

    // Fetch đánh giá cho từng kết quả xét nghiệm
    useEffect(() => {
        if (labRequests && labRequests.length > 0) {
            const fetchAll = async () => {
                const token = localStorage.getItem('token');
                const newMessages = {};
                const newLoading = {};
                await Promise.all(labRequests.map(async (item) => {
                    if (!item.id || !item.resultValue) return;
                    newLoading[item.id] = true;
                    try {
                        const url = `http://localhost:8080/api/lab-result-messages/analyze/${item.id}?resultValue=${item.resultValue}`;
                        const res = await fetch(url, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const data = await res.json();
                        newMessages[item.id] = data;
                    } catch {
                        newMessages[item.id] = { error: true };
                    } finally {
                        newLoading[item.id] = false;
                    }
                }));
                setLabResultMessages(newMessages);
                setLoadingMessages(newLoading);
            };
            fetchAll();
        }
    }, [labRequests]);

    const grouped = groupResultsByLabRequest(labRequests).sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

    // Lấy danh sách loại xét nghiệm duy nhất
    const testTypeOptions = Array.from(new Set(labRequests.map(item => item.testTypeName))).filter(Boolean);
    // Lấy danh sách tháng duy nhất (YYYY-MM)
    const monthOptions = Array.from(new Set(labRequests.map(item => item.resultDate ? item.resultDate.slice(0, 7) : ''))).filter(Boolean);

    // Lọc dữ liệu theo loại xét nghiệm và tháng
    const filtered = labRequests.filter(item => {
        let matchType = true, matchMonth = true;
        if (selectedTestType) matchType = item.testTypeName === selectedTestType;
        if (selectedMonth) matchMonth = item.resultDate && item.resultDate.startsWith(selectedMonth);
        return matchType && matchMonth;
    });
    // Sort theo ngày giảm dần
    const sorted = [...filtered].sort((a, b) => new Date(b.resultDate) - new Date(a.resultDate));

    return (
        <div className="user-lab-results-table">
            <div className="table-header">
                <h2>Lịch sử kết quả xét nghiệm</h2>
                <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                    <select value={selectedTestType} onChange={e => setSelectedTestType(e.target.value)}>
                        <option value="">Tất cả loại xét nghiệm</option>
                        {testTypeOptions.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
                        <option value="">Tất cả tháng</option>
                        {monthOptions.map(month => (
                            <option key={month} value={month}>{month}</option>
                        ))}
                    </select>
                </div>
            </div>
            {loading && <div>Đang tải...</div>}
            {error && <div className="error-message">{error}</div>}
            {!loading && !error && sorted.length === 0 && (
                <div style={{ textAlign: 'center', margin: '2rem 0' }}>Không có kết quả phù hợp.</div>
            )}
            {!loading && !error && sorted.length > 0 && (
                <table className="lab-results-table">
                    <thead>
                        <tr>
                            <th>Ngày xét nghiệm</th>
                            <th>Tên xét nghiệm</th>
                            <th>Mô tả</th>
                            <th>Kết quả</th>
                            <th>Ghi chú</th>
                            <th>Giá</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map(item => {
                            let assessment = '';
                            let color = '#222';
                            const msg = labResultMessages[item.id];
                            if (loadingMessages[item.id]) {
                                assessment = 'Đang tải đánh giá...';
                                color = '#007bff';
                            } else if (msg && !msg.error) {
                                assessment = msg.message;
                                if (msg.severityLevel === 'HIGH') color = 'red';
                                else if (msg.severityLevel === 'LOW') color = 'orange';
                                else color = 'green';
                            } else if (msg && msg.error) {
                                assessment = 'Không lấy được đánh giá';
                                color = 'red';
                            }
                            return (
                                <tr key={item.id}>
                                    <td>{item.resultDate ? new Date(item.resultDate).toLocaleDateString('vi-VN') : ''}</td>
                                    <td>{item.testTypeName}</td>
                                    <td>{item.testTypeDescription}</td>
                                    <td style={{ color, fontWeight: 500 }}>{assessment}</td>
                                    <td>{item.notes || 'Không có'}</td>
                                    <td>{item.testTypePrice ? item.testTypePrice.toLocaleString('vi-VN') + ' đ' : ''}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UserLabResultsTable; 