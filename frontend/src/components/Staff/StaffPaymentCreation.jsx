import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaMoneyBillWave, FaTimes, FaCalendarCheck, FaFlask } from 'react-icons/fa';
import './StaffPaymentCreation.scss';

const StaffPaymentCreation = () => {
    const [paymentType, setPaymentType] = useState('appointment'); // 'appointment' or 'lab'
    const [appointments, setAppointments] = useState([]);
    const [labRequests, setLabRequests] = useState([]);
    const [form, setForm] = useState({
        appointmentId: '',
        labRequestId: '',
        method: 'CASH',
        amount: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const token = localStorage.getItem('token');

    // Fetch eligible appointments (CHECKED_IN and no payment)
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

    // Fetch lab requests without payment
    const fetchLabRequestsWithoutPayment = async () => {
        try {
            // Get all lab requests
            const labRequestsResponse = await axios.get('http://localhost:8080/api/lab-requests', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Get all payments to filter out paid lab requests
            const paymentsResponse = await axios.get('http://localhost:8080/api/payments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const allLabRequests = labRequestsResponse.data;
            const payments = paymentsResponse.data;
            
            // Filter out lab requests that already have payments
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

    useEffect(() => {
        if (showForm) {
            if (paymentType === 'appointment') {
                fetchEligibleAppointments();
            } else {
                fetchLabRequestsWithoutPayment();
            }
        }
    }, [showForm, paymentType]);

    const handleTypeChange = (type) => {
        setPaymentType(type);
        setForm({
            appointmentId: '',
            labRequestId: '',
            method: 'CASH',
            amount: '',
            notes: ''
        });
        setSelectedItem(null);
    };

    const handleItemSelection = async (itemId) => {
        try {
            if (paymentType === 'appointment') {
                const appointment = appointments.find(a => a.id === parseInt(itemId));
                if (appointment) {
                    setSelectedItem(appointment);
                    setForm(prev => ({
                        ...prev,
                        appointmentId: itemId,
                        labRequestId: '',
                        amount: appointment.medicalServicePrice || ''
                    }));
                }
            } else {
                // For lab requests, get the total cost from lab request items
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
                
                setForm(prev => ({
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let paymentData;
            
            if (paymentType === 'appointment') {
                paymentData = {
                    appointmentId: parseInt(form.appointmentId),
                    patientId: selectedItem.patientId,
                    method: form.method,
                    amount: parseFloat(form.amount),
                    notes: form.notes || `Thanh toán cho lịch hẹn #${form.appointmentId}`
                };
            } else {
                paymentData = {
                    labRequestId: parseInt(form.labRequestId),
                    patientId: selectedItem.patientId,
                    method: form.method,
                    amount: parseFloat(form.amount),
                    notes: form.notes || `Thanh toán cho xét nghiệm #${form.labRequestId}`
                };
            }

            // Kiểm tra xem phương thức thanh toán là gì
            if (form.method === 'VNPAY') {
                // Nếu là VNPAY, gọi API endpoint VNPAY riêng
                const res = await axios.post('http://localhost:8080/api/payments/vnpay', paymentData, {
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
                // Nếu là CASH, sử dụng API endpoint thông thường
                await axios.post('http://localhost:8080/api/payments', paymentData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                toast.success('Tạo thanh toán tiền mặt thành công!');
            }
            
            // Đóng form và reset state
            setShowForm(false);
            setForm({
                appointmentId: '',
                labRequestId: '',
                method: 'CASH',
                amount: '',
                notes: ''
            });
            setSelectedItem(null);

        } catch (error) {
            console.error('Error creating payment:', error);
            toast.error(error.response?.data?.message || 'Tạo thanh toán thất bại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="staff-payment-creation">
            <div className="page-header">
                <h2>
                    <FaMoneyBillWave /> Tạo thanh toán
                </h2>
                <button 
                    className="btn btn-primary"
                    onClick={() => setShowForm(true)}
                >
                    Tạo thanh toán mới
                </button>
            </div>

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Tạo thanh toán mới</h3>
                            <button 
                                className="close-button"
                                onClick={() => setShowForm(false)}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="payment-form">
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
                                        value={form.appointmentId}
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
                                        value={form.labRequestId}
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
                    value={form.method}
                    onChange={(e) => setForm(prev => ({ ...prev, method: e.target.value }))}
                    required
                >
                    <option value="CASH">Tiền mặt</option>
                    <option value="VNPAY">VNPay</option>
                </select>
            </div>                            <div className="form-group">
                                <label>Số tiền (VNĐ)</label>
                                <input
                                    type="number"
                                    value={form.amount}
                                    onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                                    required
                                    min="1000"
                                    step="1000"
                                />
                            </div>

                            <div className="form-group">
                                <label>Ghi chú</label>
                                <textarea
                                    value={form.notes}
                                    onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Nhập ghi chú cho thanh toán..."
                                    rows="3"
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowForm(false)}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading || !selectedItem}
                                >
                                    {loading ? 'Đang tạo...' : 'Tạo thanh toán'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffPaymentCreation;
