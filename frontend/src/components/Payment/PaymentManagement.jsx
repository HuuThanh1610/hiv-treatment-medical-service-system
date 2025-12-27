import React, { useState, useEffect } from 'react';
import './PaymentManagement.scss';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaEye } from 'react-icons/fa';

const PaymentManagement = () => {
    const [payments, setPayments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ amount: '', method: '', labRequestId: '' });
    const [labRequests, setLabRequests] = useState([]);
    const [labRequestItems, setLabRequestItems] = useState([]);
    const [labRequestDetail, setLabRequestDetail] = useState(null);
    const [total, setTotal] = useState(0);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
    const [showDetail, setShowDetail] = useState(false);
    const [detailPayment, setDetailPayment] = useState(null);
    const [editPayment, setEditPayment] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        // Lấy danh sách thanh toán khi load trang (phân biệt role bệnh nhân)
        const fetchPayments = async () => {
            try {
                // Lấy role từ localStorage hoặc decode token nếu cần
                const role = localStorage.getItem('role');
                const url = role === 'PATIENT'
                    ? 'http://localhost:8080/api/payments/patient/my-payments'
                    : 'http://localhost:8080/api/payments';
                const res = await axios.get(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setPayments(res.data);
            } catch {
                toast.error('Lỗi lấy danh sách thanh toán!');
            }
        };
        fetchPayments();
    }, []);

    useEffect(() => {
        if (showForm) {
            axios.get('http://localhost:8080/api/lab-requests', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => {
                    // Lọc lab requests chưa có payment
                    const labRequestsAll = res.data;
                    const paidLabRequestIds = payments.filter(p => p.labRequestId).map(p => p.labRequestId);
                    const filtered = labRequestsAll.filter(lr => !paidLabRequestIds.includes(lr.id));
                    setLabRequests(filtered);
                })
                .catch(() => toast.error('Lỗi lấy danh sách Lab Request!'));
        }
    }, [showForm, token, payments]);

    useEffect(() => {
        if (form.labRequestId) {
            axios.get(`http://localhost:8080/api/lab-requests/${form.labRequestId}/items`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => {
                    const items = res.data;
                    console.log('LabRequestItems:', items);
                    setLabRequestItems(items);
                    setTotal(items.reduce((sum, item) => sum + (item.testTypePrice || 0), 0));
                    setLabRequestDetail(labRequests.find(lr => lr.id.toString() === form.labRequestId));
                })
                .catch(() => toast.error('Lỗi lấy chi tiết Lab Request!'));
        } else {
            setLabRequestItems([]);
            setTotal(0);
            setLabRequestDetail(null);
        }
    }, [form.labRequestId, token, labRequests]);

    const handleAddClick = () => {
        setForm({ amount: '', method: '', labRequestId: '' });
        setLabRequestDetail(null);
        setLabRequestItems([]);
        setTotal(0);
        setShowForm(true);
    };

    const handleFormChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLabRequestChange = (e) => {
        const labRequestId = e.target.value;
        setForm({ ...form, labRequestId });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!labRequestDetail || !form.labRequestId || !form.method) {
            toast.error('Vui lòng chọn đầy đủ thông tin!');
            return;
        }
        const token = localStorage.getItem('token');
        const body = {
            patientId: labRequestDetail.patientId,
            labRequestId: Number(form.labRequestId),
            method: form.method === 'BANK_TRANSFER' ? 'ONLINE' : form.method,
            amount: total // truyền tổng tiền từ lab request
        };
        try {
            if (form.method === 'VNPAY') {
                // Nếu là VNPAY, gọi API endpoint VNPAY riêng
                const res = await axios.post('http://localhost:8080/api/payments/vnpay', body, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (res.data && res.data.length > 0) {
                    // Mở cửa sổ mới để chuyển đến trang thanh toán VNPAY
                    window.open(res.data, '_blank');
                    toast.success('Đã tạo yêu cầu thanh toán VNPAY! Vui lòng kiểm tra cửa sổ mới để hoàn tất thanh toán.');
                } else {
                    toast.error('Không thể khởi tạo thanh toán VNPAY!');
                }
            } else {
                // Nếu là CASH hoặc ONLINE, sử dụng API endpoint thông thường
                await axios.post('http://localhost:8080/api/payments', body, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                toast.success('Tạo thanh toán thành công!');
            }
            
            setShowForm(false);
            setForm({ amount: '', method: '', labRequestId: '' });
            setLabRequestDetail(null);
            setLabRequestItems([]);
            setTotal(0);
            // Reload danh sách thanh toán
            axios.get('http://localhost:8080/api/payments', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => setPayments(res.data))
                .catch(() => toast.error('Lỗi lấy danh sách thanh toán!'));
        } catch (err) {
            toast.error('Tạo thanh toán thất bại!');
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setForm({ amount: '', method: '', labRequestId: '' });
        setLabRequestDetail(null);
    };

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const filteredPayments = payments.filter(p => {
        const search = searchTerm.toLowerCase();
        return (
            p.patientName.toLowerCase().includes(search) ||
            p.method.toLowerCase().includes(search) ||
            p.status.toLowerCase().includes(search)
        );
    });

    const sortedPayments = [...filteredPayments].sort((a, b) => {
        const { key, direction } = sortConfig;
        let valA = a[key];
        let valB = b[key];
        if (key === 'amount' || key === 'id') {
            valA = Number(valA);
            valB = Number(valB);
        } else {
            valA = valA ? valA.toString().toLowerCase() : '';
            valB = valB ? valB.toString().toLowerCase() : '';
        }
        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const renderSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    };

    const handleShowDetail = (payment) => {
        setDetailPayment(payment);
        setShowDetail(true);
    };

    const handleEditClick = (payment) => {
        setEditPayment({ ...payment });
        setShowEditForm(true);
    };

    const handleEditFormChange = (e) => {
        setEditPayment({ ...editPayment, [e.target.name]: e.target.value });
    };

    const handleEditFormClose = () => {
        setShowEditForm(false);
        setEditPayment(null);
    };

    const handleEditFormSubmit = async (e) => {
        e.preventDefault();
        if (!editPayment || !editPayment.id || !editPayment.method || !editPayment.status) {
            toast.error('Vui lòng nhập đầy đủ thông tin!');
            return;
        }
        try {
            await axios.put(`http://localhost:8080/api/payments/${editPayment.id}`, {
                method: editPayment.method === 'BANK_TRANSFER' ? 'ONLINE' : editPayment.method,
                notes: editPayment.notes || '',
                status: editPayment.status,
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Cập nhật thanh toán thành công!');
            setShowEditForm(false);
            setEditPayment(null);
            // Reload danh sách thanh toán
            const res = await axios.get('http://localhost:8080/api/payments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setPayments(res.data);
        } catch {
            toast.error('Cập nhật thanh toán thất bại!');
        }
    };

    const handleCloseDetail = () => {
        setShowDetail(false);
        setDetailPayment(null);
    };

    return (
        <div className="medical-services-table">
            <div className="table-header">
                <h2>Quản lý thanh toán</h2>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, phương thức, trạng thái..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button onClick={handleAddClick} className="add-button">+ Thêm thanh toán</button>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>ID{renderSortIcon('id')}</th>
                        <th onClick={() => handleSort('patientName')} style={{ cursor: 'pointer' }}>Bệnh nhân{renderSortIcon('patientName')}</th>
                        <th onClick={() => handleSort('amount')} style={{ cursor: 'pointer' }}>Số tiền{renderSortIcon('amount')}</th>
                        <th onClick={() => handleSort('method')} style={{ cursor: 'pointer' }}>Phương thức{renderSortIcon('method')}</th>
                        <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Trạng thái{renderSortIcon('status')}</th>
                        <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>Ngày{renderSortIcon('createdAt')}</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedPayments.map((p) => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.patientName}</td>
                            <td>{formatPrice(p.amount)}</td>
                            <td>{p.method === 'CASH' ? 'Tiền mặt' : p.method === 'ONLINE' ? 'Chuyển khoản' : p.method === 'VNPAY' ? 'VNPAY' : p.method}</td>
                            <td>{p.status === 'PENDING' ? 'Chưa thanh toán' : p.status === 'PAID' ? 'Đã thanh toán' : p.status}</td>
                            <td>{p.createdAt}</td>
                            <td>
                                <button className="view-btn" onClick={() => handleShowDetail(p)} title="Xem chi tiết">
                                    <FaEye />
                                </button>
                                <button
                                    className="edit-btn"
                                    style={{ marginLeft: 8, background: '#faad14', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}
                                    onClick={() => handleEditClick(p)}
                                >
                                    Sửa
                                </button>
                                {p.status === 'PENDING' && (
                                    <button
                                        className="confirm-btn"
                                        style={{ marginLeft: 8, background: '#13c2c2', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}
                                        onClick={async () => {
                                            try {
                                                await axios.put(`http://localhost:8080/api/payments/${p.id}`, {
                                                    ...p,
                                                    status: 'PAID',
                                                }, {
                                                    headers: { Authorization: `Bearer ${token}` }
                                                });
                                                toast.success('Xác nhận thanh toán thành công!');
                                                // Reload danh sách thanh toán
                                                const res = await axios.get('http://localhost:8080/api/payments', {
                                                    headers: { Authorization: `Bearer ${token}` }
                                                });
                                                setPayments(res.data);
                                            } catch {
                                                toast.error('Xác nhận thanh toán thất bại!');
                                            }
                                        }}
                                    >
                                        Xác nhận
                                    </button>
                                )}
            {showEditForm && editPayment && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <form onSubmit={handleEditFormSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <h3>Sửa đơn thanh toán</h3>
                            <div>
                                <label>Mã thanh toán:</label>
                                <input value={editPayment.id} readOnly />
                            </div>
                            <div>
                                <label>Bệnh nhân:</label>
                                <input value={editPayment.patientName} readOnly />
                            </div>
                            <div>
                                <label>Số tiền:</label>
                                <input value={formatPrice(editPayment.amount)} readOnly />
                            </div>
                            <div>
                                <label>Phương thức:</label>
                                <select name="method" value={editPayment.method} onChange={handleEditFormChange} required>
                                    <option value="">--Chọn--</option>
                                    <option value="CASH">Tiền mặt</option>
                                    <option value="BANK_TRANSFER">Chuyển khoản</option>
                                    <option value="VNPAY">VNPAY</option>
                                </select>
                            </div>
                            <div>
                                <label>Trạng thái:</label>
                                <select name="status" value={editPayment.status} onChange={handleEditFormChange} required>
                                    <option value="">--Chọn--</option>
                                    <option value="PENDING">Chưa thanh toán</option>
                                    <option value="PAID">Đã thanh toán</option>
                                </select>
                            </div>
                            <div>
                                <label>Ghi chú:</label>
                                <textarea name="notes" value={editPayment.notes || ''} onChange={handleEditFormChange} rows={2} />
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                <button type="submit" className="add-button">Lưu</button>
                                <button type="button" className="delete-button" onClick={handleEditFormClose}>Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <form onSubmit={handleFormSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <h3>Tạo thanh toán mới</h3>
                            <label>Chọn Lab Request:</label>
                            <select name="labRequestId" value={form.labRequestId} onChange={handleLabRequestChange} required>
                                <option value="">--Chọn--</option>
                                {labRequests.map((lr) => (
                                    <option key={lr.id} value={lr.id}>
                                        {lr.id} - {lr.patientName}
                                    </option>
                                ))}
                            </select>
                            {labRequestDetail && (
                                <div className="lab-request-detail">
                                    <p><b>Thông tin Lab Request:</b></p>
                                    <p>ID: {labRequestDetail.id}</p>
                                    <p>Bệnh nhân: {labRequestDetail.patientName}</p>
                                    <p>Ngày tạo: {labRequestDetail.createdAt || labRequestDetail.requestDate}</p>
                                    <p>Ghi chú: {labRequestDetail.info || ''}</p>
                                    <div style={{ marginTop: 8 }}>
                                        <b>Các loại xét nghiệm yêu cầu:</b>
                                        {labRequestItems.length > 0 ? (
                                            <span className="tests-list">
                                                {labRequestItems.map(item => item.testTypeName).join(', ')}
                                            </span>
                                        ) : (
                                            <span className="no-note">Chưa có xét nghiệm</span>
                                        )}
                                    </div>
                                    <div style={{ marginTop: 8 }}>
                                        <b>Chi tiết xét nghiệm và giá:</b>
                                        {labRequestItems.length > 0 ? (
                                            <ul>
                                                {labRequestItems.map(item => (
                                                    <li key={item.id}>
                                                        <span>{item.testTypeName || 'Không rõ tên loại'} - </span>
                                                        <span>{item.testTypePrice !== undefined ? item.testTypePrice.toLocaleString() : 'Không có giá'} VND</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : null}
                                        <b>Tổng tiền: {total.toLocaleString()} VND</b>
                                    </div>
                                </div>
                            )}
                            <label>Phương thức:</label>
                            <select name="method" value={form.method} onChange={handleFormChange} required>
                                <option value="">--Chọn--</option>
                                <option value="CASH">Tiền mặt</option>
                                <option value="BANK_TRANSFER">Chuyển khoản</option>
                                <option value="VNPAY">VNPAY</option>
                            </select>
                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                <button type="submit" className="add-button">Tạo</button>
                                <button type="button" className="delete-button" onClick={handleFormClose}>Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showDetail && detailPayment && (
                <div className="payment-detail-modal-overlay">
                    <div className="payment-detail-modal">
                        <div className="payment-detail-modal__header">
                            <h3>Chi tiết đơn thanh toán</h3>
                            <button className="payment-detail-modal__close-btn" onClick={handleCloseDetail} title="Đóng">×</button>
                        </div>
                        <div className="payment-detail-modal__content">
                            <div className="payment-detail-modal__info-grid">
                                <div className="payment-detail-modal__info-item">
                                    <label>Mã thanh toán:</label>
                                    <input value={detailPayment.id} readOnly />
                                </div>
                                <div className="payment-detail-modal__info-item">
                                    <label>Bệnh nhân:</label>
                                    <input value={detailPayment.patientName} readOnly />
                                </div>
                                <div className="payment-detail-modal__info-item">
                                    <label>Số tiền:</label>
                                    <input value={formatPrice(detailPayment.amount)} readOnly />
                                </div>
                                <div className="payment-detail-modal__info-item">
                                    <label>Phương thức:</label>
                                    <input value={detailPayment.method === 'CASH' ? 'Tiền mặt' : detailPayment.method === 'ONLINE' ? 'Chuyển khoản' : detailPayment.method === 'VNPAY' ? 'VNPAY' : detailPayment.method} readOnly />
                                </div>
                                <div className="payment-detail-modal__info-item">
                                    <label>Trạng thái:</label>
                                    <input value={detailPayment.status === 'PENDING' ? 'Chưa thanh toán' : detailPayment.status === 'PAID' ? 'Đã thanh toán' : detailPayment.status} readOnly />
                                </div>
                                <div className="payment-detail-modal__info-item">
                                    <label>Ngày tạo:</label>
                                    <input value={detailPayment.createdAt} readOnly />
                                </div>
                                {detailPayment.paymentDate && (
                                    <div className="payment-detail-modal__info-item">
                                        <label>Ngày thanh toán:</label>
                                        <input value={detailPayment.paymentDate} readOnly />
                                    </div>
                                )}
                                {detailPayment.transferTime && (
                                    <div className="payment-detail-modal__info-item">
                                        <label>Thời gian chuyển khoản:</label>
                                        <input value={detailPayment.transferTime} readOnly />
                                    </div>
                                )}
                                {detailPayment.method === 'BANK_TRANSFER' && (
                                    <>
                                        <div className="payment-detail-modal__info-item">
                                            <label>Mã giao dịch:</label>
                                            <input value={detailPayment.transactionCode || ''} readOnly />
                                        </div>
                                        <div className="payment-detail-modal__info-item">
                                            <label>Ngân hàng:</label>
                                            <input value={detailPayment.bankName || ''} readOnly />
                                        </div>
                                        <div className="payment-detail-modal__info-item">
                                            <label>Số tài khoản:</label>
                                            <input value={detailPayment.accountNumber || ''} readOnly />
                                        </div>
                                        <div className="payment-detail-modal__info-item">
                                            <label>Chủ tài khoản:</label>
                                            <input value={detailPayment.accountHolderName || ''} readOnly />
                                        </div>
                                    </>
                                )}
                                <div className="payment-detail-modal__info-item" style={{ gridColumn: '1/-1' }}>
                                    <label>Ghi chú:</label>
                                    <textarea value={detailPayment.notes || ''} readOnly rows={2} />
                                </div>
                            </div>
                        </div>
                        <div className="payment-detail-modal__footer">
                            <button className="cancel-btn" onClick={handleCloseDetail}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentManagement; 