import React, { useState, useEffect } from 'react';
import './PaymentList.scss';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaEye, FaEdit, FaSearch, FaCheck, FaPlus, FaCalendarCheck, FaFlask, FaTimes } from 'react-icons/fa';

const PaymentList = () => {
    const [payments, setPayments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
    const [showDetail, setShowDetail] = useState(false);
    const [detailPayment, setDetailPayment] = useState(null);
    const [editPayment, setEditPayment] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [paymentToConfirm, setPaymentToConfirm] = useState(null);
    
    // States for payment creation
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [paymentType, setPaymentType] = useState('appointment');
    const [appointments, setAppointments] = useState([]);
    const [labRequests, setLabRequests] = useState([]);
    const [createForm, setCreateForm] = useState({
        appointmentId: '',
        labRequestId: '',
        method: 'CASH',
        amount: '',
        notes: ''
    });
    const [selectedItem, setSelectedItem] = useState(null);
    const [creating, setCreating] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
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
            p.patientName?.toLowerCase().includes(search) ||
            p.method?.toLowerCase().includes(search) ||
            p.status?.toLowerCase().includes(search) ||
            p.notes?.toLowerCase().includes(search) ||
            p.id?.toString().includes(search)
        );
    });

    const sortedPayments = [...filteredPayments].sort((a, b) => {
        if (sortConfig.direction === 'asc') {
            return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
        }
        return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
    });

    const handleViewDetail = (payment) => {
        setDetailPayment(payment);
        setShowDetail(true);
    };

    const handleEditClick = (payment) => {
        setEditPayment({ ...payment });
        setShowEditForm(true);
    };

    const handleConfirmPayment = (payment) => {
        if (payment.status === 'PAID') {
            toast.info('Thanh toán này đã được xác nhận!');
            return;
        }
        setPaymentToConfirm(payment);
        setShowConfirmModal(true);
    };

    const confirmPaymentStatus = async () => {
        try {
            await axios.put(`http://localhost:8080/api/payments/${paymentToConfirm.id}`, {
                method: paymentToConfirm.method,
                notes: paymentToConfirm.notes || '',
                status: 'PAID',
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Xác nhận thanh toán thành công!');
            setShowConfirmModal(false);
            setPaymentToConfirm(null);
            fetchPayments();
        } catch (error) {
            console.error('Error confirming payment:', error);
            toast.error('Xác nhận thanh toán thất bại!');
        }
    };

    // Functions for payment creation
    const fetchEligibleAppointments = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/payments/eligible-appointments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAppointments(response.data);
        } catch (error) {
            console.error('Error fetching eligible appointments:', error);
            toast.error('Không thể tải danh sách lịch hẹn khả dụng!');
        }
    };

    const fetchLabRequestsWithoutPayment = async () => {
        try {
            const labRequestsResponse = await axios.get('http://localhost:8080/api/lab-requests', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const paymentsResponse = await axios.get('http://localhost:8080/api/payments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const allLabRequests = labRequestsResponse.data;
            const payments = paymentsResponse.data;
            
            const paidLabRequestIds = payments
                .filter(p => p.labRequestId)
                .map(p => p.labRequestId);
            
            const unpaidLabRequests = allLabRequests.filter(
                lr => !paidLabRequestIds.includes(lr.id)
            );

            setLabRequests(unpaidLabRequests);
        } catch (error) {
            console.error('Error fetching lab requests:', error);
            toast.error('Không thể tải danh sách xét nghiệm!');
        }
    };

    const handleCreatePayment = () => {
        setShowCreateForm(true);
        setPaymentType('appointment');
        setCreateForm({
            appointmentId: '',
            labRequestId: '',
            method: 'CASH',
            amount: '',
            notes: ''
        });
        setSelectedItem(null);
        fetchEligibleAppointments();
    };

    const handleTypeChange = (type) => {
        setPaymentType(type);
        setCreateForm({
            appointmentId: '',
            labRequestId: '',
            method: 'CASH',
            amount: '',
            notes: ''
        });
        setSelectedItem(null);
        
        if (type === 'appointment') {
            fetchEligibleAppointments();
        } else {
            fetchLabRequestsWithoutPayment();
        }
    };

    const handleItemSelection = async (itemId) => {
        try {
            if (paymentType === 'appointment') {
                const appointment = appointments.find(a => a.id === parseInt(itemId));
                if (appointment) {
                    setSelectedItem(appointment);
                    setCreateForm(prev => ({
                        ...prev,
                        appointmentId: itemId,
                        labRequestId: '',
                        amount: appointment.medicalServicePrice || ''
                    }));
                }
            } else {
                const response = await axios.get(`http://localhost:8080/api/lab-requests/${itemId}/items`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                const labRequest = labRequests.find(lr => lr.id === parseInt(itemId));
                const items = response.data;
                const totalCost = items.reduce((sum, item) => sum + (item.testTypePrice || 0), 0);
                
                setSelectedItem({
                    ...labRequest,
                    items,
                    totalCost
                });
                
                setCreateForm(prev => ({
                    ...prev,
                    labRequestId: itemId,
                    appointmentId: '',
                    amount: totalCost.toString()
                }));
            }
        } catch (error) {
            console.error('Error fetching item details:', error);
            toast.error('Không thể tải chi tiết!');
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setCreating(true);

        try {
            let paymentData;
            
            if (paymentType === 'appointment') {
                paymentData = {
                    appointmentId: parseInt(createForm.appointmentId),
                    patientId: selectedItem.patientId,
                    method: createForm.method,
                    amount: parseFloat(createForm.amount),
                    notes: createForm.notes || `Thanh toán cho lịch hẹn #${createForm.appointmentId}`
                };
            } else {
                paymentData = {
                    labRequestId: parseInt(createForm.labRequestId),
                    patientId: selectedItem.patientId,
                    method: createForm.method,
                    amount: parseFloat(createForm.amount),
                    notes: createForm.notes || `Thanh toán cho xét nghiệm #${createForm.labRequestId}`
                };
            }

            await axios.post('http://localhost:8080/api/payments', paymentData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            toast.success('Tạo thanh toán thành công!');
            setShowCreateForm(false);
            setCreateForm({
                appointmentId: '',
                labRequestId: '',
                method: 'CASH',
                amount: '',
                notes: ''
            });
            setSelectedItem(null);
            fetchPayments();

        } catch (error) {
            console.error('Error creating payment:', error);
            toast.error(error.response?.data?.message || 'Tạo thanh toán thất bại!');
        } finally {
            setCreating(false);
        }
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
            fetchPayments();
        } catch {
            toast.error('Cập nhật thanh toán thất bại!');
        }
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            'PENDING': 'status-pending',
            'PAID': 'status-paid',
            'CANCELLED': 'status-cancelled',
            'FAILED': 'status-failed'
        };
        return <span className={`status-badge ${statusClasses[status] || ''}`}>{status}</span>;
    };

    const getMethodBadge = (method) => {
        const methodClasses = {
            'CASH': 'method-cash',
            'VNPAY': 'method-vnpay',
            'BANK_TRANSFER': 'method-bank',
            'ONLINE': 'method-online'
        };
        return <span className={`method-badge ${methodClasses[method] || ''}`}>{method}</span>;
    };

    return (
        <div className="payment-list-container">
            <div className="table-header">
                <h2>Quản lý thanh toán</h2>
                <div className="header-actions">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo ID, tên bệnh nhân, phương thức..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <button 
                        className="btn btn-primary"
                        onClick={handleCreatePayment}
                    >
                        <FaPlus /> Tạo thanh toán mới
                    </button>
                </div>
            </div>

            <div className="table-container">
                <table className="payments-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('id')} className="sortable">
                                ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('patientName')} className="sortable">
                                Bệnh nhân {sortConfig.key === 'patientName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th>Loại thanh toán</th>
                            <th onClick={() => handleSort('amount')} className="sortable">
                                Số tiền {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th>Phương thức</th>
                            <th>Trạng thái</th>
                            <th onClick={() => handleSort('paymentDate')} className="sortable">
                                Ngày thanh toán {sortConfig.key === 'paymentDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPayments.map(payment => (
                            <tr key={payment.id}>
                                <td>#{payment.id}</td>
                                <td>{payment.patientName}</td>
                                <td>
                                    {payment.appointmentId ? (
                                        <span className="payment-type appointment">
                                            Lịch hẹn #{payment.appointmentId}
                                        </span>
                                    ) : payment.labRequestId ? (
                                        <span className="payment-type lab">
                                            Xét nghiệm #{payment.labRequestId}
                                        </span>
                                    ) : (
                                        <span className="payment-type unknown">Không xác định</span>
                                    )}
                                </td>
                                <td className="amount">{payment.amount?.toLocaleString('vi-VN')} VNĐ</td>
                                <td>{getMethodBadge(payment.method)}</td>
                                <td>{getStatusBadge(payment.status)}</td>
                                <td>{new Date(payment.paymentDate).toLocaleDateString('vi-VN')}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-view"
                                            onClick={() => handleViewDetail(payment)}
                                            title="Xem chi tiết"
                                        >
                                            <FaEye />
                                        </button>
                                        {payment.status === 'PENDING' && (
                                            <button
                                                className="btn-confirm"
                                                onClick={() => handleConfirmPayment(payment)}
                                                title="Xác nhận thanh toán"
                                            >
                                                <FaCheck />
                                            </button>
                                        )}
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleEditClick(payment)}
                                            title="Chỉnh sửa"
                                        >
                                            <FaEdit />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {sortedPayments.length === 0 && (
                    <div className="no-data">
                        <p>Không tìm thấy thanh toán nào</p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetail && detailPayment && (
                <div className="modal-overlay">
                    <div className="modal-content detail-modal">
                        <div className="modal-header">
                            <h3>Chi tiết thanh toán #{detailPayment.id}</h3>
                            <button onClick={() => setShowDetail(false)} className="close-button">×</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Bệnh nhân:</label>
                                    <span>{detailPayment.patientName}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Loại thanh toán:</label>
                                    <span>
                                        {detailPayment.appointmentId ? `Lịch hẹn #${detailPayment.appointmentId}` : 
                                         detailPayment.labRequestId ? `Xét nghiệm #${detailPayment.labRequestId}` : 'Không xác định'}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Số tiền:</label>
                                    <span className="amount">{detailPayment.amount?.toLocaleString('vi-VN')} VNĐ</span>
                                </div>
                                <div className="detail-item">
                                    <label>Phương thức:</label>
                                    <span>{getMethodBadge(detailPayment.method)}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Trạng thái:</label>
                                    <span>{getStatusBadge(detailPayment.status)}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Ngày thanh toán:</label>
                                    <span>{new Date(detailPayment.paymentDate).toLocaleString('vi-VN')}</span>
                                </div>
                                {detailPayment.notes && (
                                    <div className="detail-item full-width">
                                        <label>Ghi chú:</label>
                                        <span>{detailPayment.notes}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditForm && editPayment && (
                <div className="modal-overlay">
                    <div className="modal-content edit-modal">
                        <div className="modal-header">
                            <h3>Chỉnh sửa thanh toán #{editPayment.id}</h3>
                            <button onClick={() => setShowEditForm(false)} className="close-button">×</button>
                        </div>
                        <form onSubmit={handleEditFormSubmit} className="modal-body">
                            <div className="form-group">
                                <label>Phương thức thanh toán:</label>
                                <select
                                    value={editPayment.method}
                                    onChange={(e) => setEditPayment(prev => ({ ...prev, method: e.target.value }))}
                                    required
                                >
                                    <option value="CASH">Tiền mặt</option>
                                    <option value="VNPAY">VNPay</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Trạng thái:</label>
                                <select
                                    value={editPayment.status}
                                    onChange={(e) => setEditPayment(prev => ({ ...prev, status: e.target.value }))}
                                    required
                                >
                                    <option value="PENDING">Đang chờ</option>
                                    <option value="PAID">Đã thanh toán</option>
                                    <option value="CANCELLED">Đã hủy</option>
                                    <option value="FAILED">Thất bại</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Ghi chú:</label>
                                <textarea
                                    value={editPayment.notes || ''}
                                    onChange={(e) => setEditPayment(prev => ({ ...prev, notes: e.target.value }))}
                                    rows="3"
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowEditForm(false)} className="btn-cancel">
                                    Hủy
                                </button>
                                <button type="submit" className="btn-save">
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Payment Modal */}
            {showCreateForm && (
                <div className="modal-overlay">
                    <div className="modal-content create-modal">
                        <div className="modal-header">
                            <h3>Tạo thanh toán mới</h3>
                            <button 
                                className="close-button"
                                onClick={() => setShowCreateForm(false)}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="modal-body">
                            {/* Payment Type Selection */}
                            <div className="form-group">
                                <label>Loại thanh toán</label>
                                <div className="type-selector">
                                    <button
                                        type="button"
                                        className={`type-btn ${paymentType === 'appointment' ? 'active' : ''}`}
                                        onClick={() => handleTypeChange('appointment')}
                                    >
                                        <FaCalendarCheck />
                                        Thanh toán lịch hẹn
                                    </button>
                                    <button
                                        type="button"
                                        className={`type-btn ${paymentType === 'lab' ? 'active' : ''}`}
                                        onClick={() => handleTypeChange('lab')}
                                    >
                                        <FaFlask />
                                        Thanh toán xét nghiệm
                                    </button>
                                </div>
                            </div>

                            {/* Appointment Selection */}
                            {paymentType === 'appointment' && (
                                <div className="form-group">
                                    <label>Chọn lịch hẹn (đã check-in)</label>
                                    <select
                                        value={createForm.appointmentId}
                                        onChange={(e) => handleItemSelection(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Chọn lịch hẹn --</option>
                                        {appointments.map(appointment => (
                                            <option key={appointment.id} value={appointment.id}>
                                                #{appointment.id} - {appointment.patientName} | 
                                                {appointment.medicalServiceName} | 
                                                {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')} 
                                                {appointment.appointmentTime?.slice(0, 5)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Lab Request Selection */}
                            {paymentType === 'lab' && (
                                <div className="form-group">
                                    <label>Chọn yêu cầu xét nghiệm</label>
                                    <select
                                        value={createForm.labRequestId}
                                        onChange={(e) => handleItemSelection(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Chọn yêu cầu xét nghiệm --</option>
                                        {labRequests.map(labRequest => (
                                            <option key={labRequest.id} value={labRequest.id}>
                                                #{labRequest.id} - {labRequest.patientName} | 
                                                {new Date(labRequest.requestDate || labRequest.createdAt).toLocaleDateString('vi-VN')}
                                                {labRequest.isUrgent && ' (Khẩn cấp)'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Selected Item Details */}
                            {selectedItem && (
                                <div className="selected-item-details">
                                    <h4>Chi tiết {paymentType === 'appointment' ? 'lịch hẹn' : 'xét nghiệm'}</h4>
                                    <div className="details-content">
                                        <p><strong>Bệnh nhân:</strong> {selectedItem.patientName}</p>
                                        {paymentType === 'appointment' ? (
                                            <>
                                                <p><strong>Dịch vụ:</strong> {selectedItem.medicalServiceName}</p>
                                                <p><strong>Bác sĩ:</strong> {selectedItem.doctorName}</p>
                                                <p><strong>Ngày hẹn:</strong> {new Date(selectedItem.appointmentDate).toLocaleDateString('vi-VN')}</p>
                                                <p><strong>Giờ hẹn:</strong> {selectedItem.appointmentTime?.slice(0, 5)}</p>
                                            </>
                                        ) : (
                                            <>
                                                <p><strong>Ngày tạo:</strong> {new Date(selectedItem.requestDate || selectedItem.createdAt).toLocaleDateString('vi-VN')}</p>
                                                <p><strong>Trạng thái:</strong> {selectedItem.status}</p>
                                                {selectedItem.items && (
                                                    <div className="lab-items">
                                                        <p><strong>Các xét nghiệm:</strong></p>
                                                        <ul>
                                                            {selectedItem.items.map((item, index) => (
                                                                <li key={index}>
                                                                    {item.testTypeName} - {(item.testTypePrice || 0).toLocaleString('vi-VN')} VNĐ
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Payment Details */}
                            <div className="form-group">
                                <label>Phương thức thanh toán</label>
                                <select
                                    value={createForm.method}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, method: e.target.value }))}
                                    required
                                >
                                    <option value="CASH">Tiền mặt</option>
                                    <option value="VNPAY">VNPay</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Số tiền (VNĐ)</label>
                                <input
                                    type="number"
                                    value={createForm.amount}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, amount: e.target.value }))}
                                    required
                                    min="1000"
                                    step="1000"
                                />
                            </div>

                            <div className="form-group">
                                <label>Ghi chú</label>
                                <textarea
                                    value={createForm.notes}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Nhập ghi chú cho thanh toán..."
                                    rows="3"
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setShowCreateForm(false)}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="btn-save"
                                    disabled={creating || !selectedItem}
                                >
                                    {creating ? 'Đang tạo...' : 'Tạo thanh toán'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Payment Modal */}
            {showConfirmModal && paymentToConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content confirm-modal">
                        <div className="modal-header">
                            <h3>Xác nhận thanh toán</h3>
                            <button onClick={() => setShowConfirmModal(false)} className="close-button">×</button>
                        </div>
                        <div className="modal-body">
                            <div className="confirm-content">
                                <p>Bạn có chắc chắn muốn xác nhận thanh toán này?</p>
                                <div className="payment-info">
                                    <p><strong>ID:</strong> #{paymentToConfirm.id}</p>
                                    <p><strong>Bệnh nhân:</strong> {paymentToConfirm.patientName}</p>
                                    <p><strong>Số tiền:</strong> {paymentToConfirm.amount?.toLocaleString('vi-VN')} VNĐ</p>
                                    <p><strong>Phương thức:</strong> {paymentToConfirm.method}</p>
                                </div>
                                <p className="warning-text">
                                    <strong>Lưu ý:</strong> Sau khi xác nhận, trạng thái thanh toán sẽ chuyển sang "Đã thanh toán" và không thể hoàn tác.
                                </p>
                            </div>
                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    onClick={() => setShowConfirmModal(false)} 
                                    className="btn-cancel"
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="button" 
                                    onClick={confirmPaymentStatus} 
                                    className="btn-confirm-action"
                                >
                                    Xác nhận thanh toán
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentList;
