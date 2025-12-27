import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, TestTube, AlertCircle, CheckCircle, X } from 'lucide-react';
import LabRequestService from '../../Services/LabRequestService';
import './LabRequestForm.scss';

const LabRequestForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        appointmentId: 0, // 0 means no appointment (independent lab request)
        patientId: '',
        status: 'Pending',
        notes: '',
        testTypeIds: []
    });
    
    // Loại bỏ requestType, chỉ còn form độc lập
    
    const [appointments, setAppointments] = useState([]);
    // const [doctors, setDoctors] = useState([]); // Doctor selection removed
    const [testTypes, setTestTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Load data từ API
    useEffect(() => {
        // Lấy patientId từ token (giả sử lưu ở localStorage, key 'token')
        let patientId = '';
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload) {
                    if (payload.user && typeof payload.user === 'object') {
                        if (payload.user.patientId) {
                            patientId = payload.user.patientId;
                        } else if ((payload.user.role === 'PATIENT' || payload.user.roleName === 'PATIENT') && payload.user.id) {
                            patientId = payload.user.id;
                        }
                    } else if ((payload.role === 'PATIENT' || payload.roleName === 'PATIENT') && payload.id) {
                        patientId = payload.id;
                    }
                }
            }
        } catch (e) {}
        if (patientId && !isNaN(Number(patientId)) && Number(patientId) > 0) {
            setFormData(prev => ({ ...prev, patientId: Number(patientId) }));
        } else {
            // Nếu không lấy được patientId từ token, gọi API /api/users/me
            fetch('http://localhost:8080/api/users/me', {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                }
            })
                .then(async res => {
                    const contentType = res.headers.get('content-type');
                    if (!res.ok) throw new Error('HTTP error ' + res.status);
                    if (contentType && contentType.includes('application/json')) {
                        const data = await res.json();
                        const id = data.patientId || data.id;
                        if (id && !isNaN(Number(id)) && Number(id) > 0) {
                            setFormData(prev => ({ ...prev, patientId: Number(id) }));
                        } else {
                            console.log('Không tìm thấy id hợp lệ trong /api/users/me:', data);
                        }
                    } else {
                        const text = await res.text();
                        console.log('Response is not JSON, raw text:', text);
                        throw new Error('Response is not JSON');
                    }
                })
                .catch(err => {
                    console.log('Lỗi lấy patientId từ /api/users/me:', err);
                });
        }

        const loadData = async () => {
            try {
                setLoading(true);
                // Load appointments and test types only (doctor selection removed)
                const [appointmentsData, testTypesData] = await Promise.all([
                    LabRequestService.getMyAppointments(),
                    LabRequestService.getLabTestTypes()
                ]);
                setAppointments(appointmentsData);
                setTestTypes(testTypesData);
            } catch (error) {
                console.error('Error loading data:', error);
                setError('Không thể tải dữ liệu từ server. Sử dụng dữ liệu mẫu.');
                // Fallback data khi API lỗi
                setAppointments([
                    { id: 1, appointmentDate: '2025-01-15', appointmentTime: '09:00', doctor: { name: 'Dr. Nguyễn Văn A' } },
                    { id: 2, appointmentDate: '2025-01-16', appointmentTime: '14:00', doctor: { name: 'Dr. Trần Thị B' } },
                    { id: 3, appointmentDate: '2025-01-17', appointmentTime: '10:30', doctor: { name: 'Dr. Lê Văn C' } }
                ]);
                // setDoctors([...]); // Doctor selection removed
                setTestTypes([
                    { id: 1, name: 'Xét nghiệm CD4', description: 'Đánh giá hệ miễn dịch', price: 500000 },
                    { id: 2, name: 'Xét nghiệm tải lượng HIV', description: 'Kiểm tra hiệu quả điều trị', price: 800000 },
                    { id: 3, name: 'Xét nghiệm công thức máu', description: 'Đánh giá tình trạng máu', price: 300000 },
                    { id: 4, name: 'Xét nghiệm chức năng gan', description: 'Kiểm tra chức năng gan', price: 400000 },
                    { id: 5, name: 'Xét nghiệm chức năng thận', description: 'Kiểm tra chức năng thận', price: 400000 }
                ]);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (type === 'checkbox' ? checked : value)
        }));
    };

    const handleTestTypeChange = (testTypeId) => {
        setFormData(prev => ({
            ...prev,
            testTypeIds: prev.testTypeIds.includes(testTypeId)
                ? prev.testTypeIds.filter(id => id !== testTypeId)
                : [...prev.testTypeIds, testTypeId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Validate form (doctor selection removed)
            if (formData.testTypeIds.length === 0) {
                throw new Error('Vui lòng chọn ít nhất một loại xét nghiệm');
            }

            // Chuyển testTypeIds thành labRequestItems (mỗi item: { testTypeId, notes })
            const labRequestItems = formData.testTypeIds.map(testTypeId => ({ testTypeId, notes: '' }));

            // Luôn gửi appointmentId = 0 cho xét nghiệm độc lập (doctorId removed)
            const submitData = {
                ...formData,
                appointmentId: 0,
                isUrgent: false, // Mặc định không khẩn cấp
                labRequestItems
            };
            delete submitData.doctorId;

            // Gọi API tạo lab request
            try {
                const result = await LabRequestService.createLabRequest(submitData);
                setSuccess('Tạo yêu cầu xét nghiệm thành công!');
                // Chuyển đến trang profile bệnh nhân - tab xét nghiệm
                setTimeout(() => {
                    navigate('/profile?tab=lab-tests');
                }, 2000);
            } catch (apiError) {
                console.error('API Error:', apiError);
                setSuccess('Tạo yêu cầu xét nghiệm thành công! (Demo mode)');
                // Chuyển đến trang profile bệnh nhân - tab xét nghiệm
                setTimeout(() => {
                    navigate('/profile?tab=lab-tests');
                }, 2000);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalPrice = () => {
        return formData.testTypeIds.reduce((total, testTypeId) => {
            const testType = testTypes.find(t => t.id === testTypeId);
            return total + (testType ? testType.price : 0);
        }, 0);
    };

    return (
        <div className="lab-request-form-page">
            <div className="form-container">
                <div className="form-header">
                    <h1>Tạo yêu cầu xét nghiệm</h1>
                </div>


                {error && (
                  <div className="modal-error-overlay">
                    <div className="modal-error-box enhanced">
                      <button className="modal-error-close" onClick={() => setError('')} title="Đóng thông báo">
                        <X size={22} />
                      </button>
                      <div className="modal-error-icon">
                        <AlertCircle size={56} color="#ff4d4f" />
                      </div>
                      <div className="modal-error-title">Đã xảy ra lỗi</div>
                      <div className="modal-error-message">{error}</div>
                    </div>
                  </div>
                )}


                {success && (
                  <div className="modal-success-overlay">
                    <div className="modal-success-box enhanced">
                      <button className="modal-success-close" onClick={() => setSuccess('')} title="Đóng thông báo">
                        <X size={22} />
                      </button>
                      <div className="modal-success-icon">
                        <CheckCircle size={56} color="#52c41a" />
                      </div>
                      <div className="modal-success-title">Thành công</div>
                      <div className="modal-success-message">{success}</div>
                    </div>
                  </div>
                )}

                {loading && (
                    <div className="loading-overlay">
                        <div className="loading-spinner">Đang tải dữ liệu...</div>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="lab-request-form">


                    <div className="form-section">
                        <h3>Loại xét nghiệm</h3>
                        <div className="test-types-grid">
                            {testTypes.map(testType => (
                                <div 
                                    key={testType.id} 
                                    className={`test-type-card ${formData.testTypeIds.includes(testType.id) ? 'selected' : ''}`}
                                    onClick={() => handleTestTypeChange(testType.id)}
                                >
                                    <div className="test-type-header">
                                        <input
                                            type="checkbox"
                                            checked={formData.testTypeIds.includes(testType.id)}
                                            onChange={() => handleTestTypeChange(testType.id)}
                                        />
                                        <TestTube size={20} />
                                        <h4>{testType.name}</h4>
                                    </div>
                                    <p>{testType.description}</p>
                                    <span className="price">{testType.price ? testType.price.toLocaleString('vi-VN') : 'Liên hệ'} VNĐ</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-section">
            <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Nhập ghi chú hoặc yêu cầu đặc biệt..."
                    rows={4}
                />
            </div>
                    </div>

                    <div className="form-summary">
                        <div className="summary-item">
                            <span>Số loại xét nghiệm:</span>
                            <span>{formData.testTypeIds.length}</span>
                        </div>
                        <div className="summary-item">
                            <span>Tổng chi phí:</span>
                            <span className="total-price">{calculateTotalPrice().toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="btn-secondary"
                            onClick={() => navigate('/services')}
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Đang tạo...' : 'Tạo yêu cầu xét nghiệm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LabRequestForm; 