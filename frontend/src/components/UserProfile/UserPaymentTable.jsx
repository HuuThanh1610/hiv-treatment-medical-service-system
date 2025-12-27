import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UserPaymentTable.scss';
import { toast } from 'react-toastify';

const PAYMENT_METHODS = [
    { value: 'VNPAY', label: 'VNPAY (Thanh toán online)' },
    { value: 'CASH_CONFIRM', label: 'Xác nhận đã thanh toán tiền mặt' }
];

const UserPaymentTable = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [payingId, setPayingId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalPayment, setModalPayment] = useState(null);
    const [filter, setFilter] = useState('all');
    const [form, setForm] = useState({ method: '', transactionCode: '', bankName: '', accountNumber: '', accountHolderName: '', notes: '' });

    const fetchPayments = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8080/api/payments/patient/my-payments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setPayments(res.data);
        } catch (err) {
            setError('Không thể tải danh sách thanh toán.');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchPayments();
    }, []);

    // Tìm payment PENDING duy nhất cho mỗi appointmentId hoặc labRequestId
    const pendingPaymentsByType = {};
    payments.forEach(p => {
        if (p.status === 'PENDING') {
            if (p.appointmentId) {
                pendingPaymentsByType[`appointment_${p.appointmentId}`] = p;
            } else if (p.labRequestId) {
                pendingPaymentsByType[`lab_${p.labRequestId}`] = p;
            }
        }
    });

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const openPayModal = (payment) => {
        setModalPayment(payment);
        setForm({ method: payment.method || '', transactionCode: '', bankName: '', accountNumber: '', accountHolderName: '', notes: payment.notes || '' });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalPayment(null);
        setPayingId(null); // Đặt lại trạng thái đang xử lý
        setForm({ method: '', transactionCode: '', bankName: '', accountNumber: '', accountHolderName: '', notes: '' });
    };

    const handleFormChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePay = async (e) => {
        e.preventDefault();
        setPayingId(modalPayment.id);
        const token = localStorage.getItem('token');
        try {
            if (form.method === 'VNPAY') {
                // Kiểm tra xem đã có thanh toán tiền mặt đang chờ không
                const isUpdatingCashPayment = modalPayment.method === 'CASH' && modalPayment.status === 'PENDING';
                
                if (isUpdatingCashPayment) {
                    // Thông báo rằng đang chuyển đổi từ thanh toán tiền mặt sang VNPAY
                    toast.info('Đang chuyển đổi từ thanh toán tiền mặt sang thanh toán VNPAY...');
                }
                
                // Gọi API khởi tạo thanh toán VNPAY (sẽ cập nhật nếu đã tồn tại)
                const res = await axios.post('http://localhost:8080/api/payments/vnpay', {
                    appointmentId: modalPayment.appointmentId,
                    labRequestId: modalPayment.labRequestId,
                    amount: modalPayment.amount,
                    method: 'VNPAY',
                    patientId: modalPayment.patientId, // Thêm patientId vào request
                    notes: form.notes + (isUpdatingCashPayment ? ' (Chuyển từ thanh toán tiền mặt)' : '')
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                // API trả về trực tiếp URL thanh toán từ VNPAY
                if (res.data && res.data.length > 0) {
                    toast.success('Đang chuyển đến cổng thanh toán VNPAY...');
                    window.location.href = res.data; // Chuyển đến trang thanh toán VNPAY
                } else {
                    toast.error('Không thể khởi tạo thanh toán VNPAY!');
                }
            } else if (form.method === 'CASH_CONFIRM') {
                // Xác nhận đã thanh toán tiền mặt
                await axios.put(`http://localhost:8080/api/payments/${modalPayment.id}`, {
                    status: 'PAID',
                    notes: form.notes + ' (Xác nhận đã thanh toán tiền mặt)'
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                toast.success('Xác nhận thanh toán thành công!');
                closeModal();
                fetchPayments(); // Cập nhật lại danh sách thanh toán
            } else {
                // Nếu có thêm phương thức khác trong tương lai
                await axios.post('http://localhost:8080/api/payments', {
                    appointmentId: modalPayment.appointmentId,
                    labRequestId: modalPayment.labRequestId,
                    method: form.method,
                    notes: form.notes
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                toast.success('Đã gửi yêu cầu thanh toán thành công!');
                // Reload lại bảng
                const res2 = await axios.get('http://localhost:8080/api/payments/patient/my-payments', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setPayments(res2.data);
                closeModal();
            }
        } catch (err) {
            toast.error('Thanh toán thất bại hoặc chưa cấu hình cổng thanh toán!');
        } finally {
            setPayingId(null);
        }
    };

    const filteredPayments = payments.filter(p => filter === 'all' ? true : p.status === filter);

    const getStatusBadge = (status) => {
        const statusConfig = {
            'PENDING': { text: 'Chờ thanh toán', class: 'status-pending' },
            'PAID': { text: 'Đã thanh toán', class: 'status-paid' },
            'FAILED': { text: 'Thanh toán thất bại', class: 'status-failed' },
            'REFUNDED': { text: 'Đã hoàn tiền', class: 'status-refunded' }
        };
        const config = statusConfig[status] || { text: status, class: 'status-unknown' };
        return <span className={`status-badge ${config.class}`}>{config.text}</span>;
    };

    const getPaymentType = (payment) => {
        if (payment.appointmentId) {
            return 'Lịch hẹn khám';
        } else if (payment.labRequestId) {
            return 'Xét nghiệm';
        }
        return 'Khác';
    };

    const getPaymentDescription = (payment) => {
        if (payment.appointmentId) {
            return `Lịch hẹn #${payment.appointmentId}`;
        } else if (payment.labRequestId) {
            return `Xét nghiệm #${payment.labRequestId}`;
        }
        return payment.notes || 'Không có mô tả';
    };

    if (loading) return <div className="loading">Đang tải danh sách thanh toán...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="user-payment-table">
            <div className="table-header">
                <h3>Lịch sử thanh toán</h3>
                <div className="filter-controls">
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">Tất cả</option>
                        <option value="PENDING">Chờ thanh toán</option>
                        <option value="PAID">Đã thanh toán</option>
                        <option value="FAILED">Thất bại</option>
                        <option value="REFUNDED">Đã hoàn tiền</option>
                    </select>
                </div>
            </div>

            {filteredPayments.length === 0 ? (
                <div className="no-payments">
                    <p>Chưa có giao dịch thanh toán nào.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Loại</th>
                                <th>Mô tả</th>
                                <th>Số tiền</th>
                                <th>Phương thức</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.map(p => (
                                <tr key={p.id}>
                                    <td>{getPaymentType(p)}</td>
                                    <td>{getPaymentDescription(p)}</td>
                                    <td className="amount">{formatPrice(p.amount)}</td>
                                    <td>{p.method}</td>
                                    <td>{getStatusBadge(p.status)}</td>
                                    <td>{new Date(p.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td>
                                        {p.status === 'PENDING' && (
                                            <button
                                                className="pay-btn"
                                                onClick={() => openPayModal(p)}
                                                disabled={payingId === p.id}
                                            >
                                                {payingId === p.id ? 'Đang xử lý...' : 'Thanh toán'}
                                            </button>
                                        )}
                                        {p.status === 'PAID' && (
                                            <span className="paid-text">✓ Hoàn tất</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Payment Modal */}
            {showModal && modalPayment && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Thanh toán</h3>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="payment-info">
                                <p><strong>Loại:</strong> {getPaymentType(modalPayment)}</p>
                                <p><strong>Mô tả:</strong> {getPaymentDescription(modalPayment)}</p>
                                <p><strong>Số tiền:</strong> {formatPrice(modalPayment.amount)}</p>
                            </div>
                            <form onSubmit={handlePay}>
                                <div className="form-group">
                                    <label>Phương thức thanh toán</label>
                                    <select name="method" value={form.method} onChange={handleFormChange} required>
                                        <option value="">Chọn phương thức</option>
                                        {PAYMENT_METHODS.map(method => {
                                            // Hiển thị tùy chọn xác nhận tiền mặt chỉ khi thanh toán hiện tại là CASH và PENDING
                                            if (method.value === 'CASH_CONFIRM' && 
                                                (modalPayment.method !== 'CASH' || modalPayment.status !== 'PENDING')) {
                                                return null;
                                            }
                                            return (
                                                <option key={method.value} value={method.value}>
                                                    {method.label}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                {/* Đã xóa phương thức chuyển khoản ngân hàng */}
                                <div className="form-group">
                                    <label>Ghi chú</label>
                                    <textarea
                                        name="notes"
                                        value={form.notes}
                                        onChange={handleFormChange}
                                        placeholder="Ghi chú thêm (tùy chọn)"
                                        rows="3"
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={closeModal} className="cancel-btn">
                                        Hủy
                                    </button>
                                    <button type="submit" className="confirm-btn" disabled={payingId === modalPayment.id}>
                                        {payingId === modalPayment.id ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPaymentTable; 