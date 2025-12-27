import React, { useState } from 'react';
import { FaHeart, FaPills, FaExclamationTriangle, FaPhone, FaUser, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import './AppointmentDeclarationForm.scss';

const AppointmentDeclarationForm = ({ onClose, onSubmit, initialData = {}, userInfo = {} }) => {
    const [formData, setFormData] = useState({
        isPregnant: initialData?.isPregnant || false,
        healthNotes: initialData?.healthNotes || '',
        symptoms: initialData?.symptoms || '',
        currentMedications: initialData?.currentMedications || '',
        allergies: initialData?.allergies || '',
        emergencyContact: initialData?.emergencyContact || '',
        emergencyPhone: initialData?.emergencyPhone || ''
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPregnancyConfirm, setShowPregnancyConfirm] = useState(false);

    // Check if user is female (can be pregnant) - more flexible check
    const canBePregnant = userInfo?.gender && (
        userInfo.gender.toLowerCase() === 'female' || 
        userInfo.gender.toLowerCase() === 'nữ' ||
        userInfo.gender === 'FEMALE' ||
        userInfo.gender === 'NỮ'
    );
    

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // Special handling for pregnancy checkbox
        if (name === 'isPregnant' && type === 'checkbox' && canBePregnant) {
            if (checked) {
                // Show pregnancy confirmation when checking the box
                setShowPregnancyConfirm(true);
                return; // Don't update state yet, wait for confirmation
            }
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handlePregnancyConfirm = async (isPregnant) => {
        try {
            // Update pregnancy status in backend
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:8080/api/patients/me/pregnancy-status', 
                { isPregnant }, 
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            // Update form data
            setFormData(prev => ({
                ...prev,
                isPregnant
            }));

            setShowPregnancyConfirm(false);
        } catch (error) {
            console.error('Error updating pregnancy status:', error);
            alert('Có lỗi khi cập nhật thông tin. Vui lòng thử lại.');
            setShowPregnancyConfirm(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Emergency contact validation
        if (!formData.emergencyContact.trim()) {
            newErrors.emergencyContact = 'Vui lòng nhập tên người liên hệ khẩn cấp';
        }
        
        if (!formData.emergencyPhone.trim()) {
            newErrors.emergencyPhone = 'Vui lòng nhập số điện thoại khẩn cấp';
        } else if (!/^[0-9+\-\s()]{10,15}$/.test(formData.emergencyPhone.trim())) {
            newErrors.emergencyPhone = 'Số điện thoại không hợp lệ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        console.log('=== DEBUG: AppointmentDeclarationForm submit ===');
        console.log('formData:', formData);
        console.log('formData.healthNotes:', formData.healthNotes);
        console.log('formData.symptoms:', formData.symptoms);
        console.log('formData.currentMedications:', formData.currentMedications);
        console.log('formData.allergies:', formData.allergies);
        console.log('formData.emergencyContact:', formData.emergencyContact);
        console.log('formData.emergencyPhone:', formData.emergencyPhone);

        setLoading(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Error submitting declaration:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="appointment-declaration-overlay">
            <div className="appointment-declaration-modal">
                <div className="declaration-header">
                    <h2><FaHeart /> Khai báo tình trạng sức khỏe (Bắt buộc)</h2>
                    <p>Vui lòng cung cấp thông tin sức khỏe để chúng tôi phục vụ bạn tốt hơn. Đây là bước bắt buộc để hoàn tất đặt lịch khám.</p>
                    <button type="button" onClick={onClose} className="close-btn">
                        <FaTimes />
                    </button>
                </div>

                <form className="declaration-form" onSubmit={handleSubmit}>
                    <div className="form-grid">
                        {/* Pregnancy Status - Show for females */}
                        {canBePregnant && (
                            <div className="form-section">
                                <div className="form-group checkbox-group">
                                    <button
                                        type="button"
                                        className={`pregnancy-toggle-btn${formData.isPregnant ? ' active' : ''}`}
                                        style={{width:'100%',padding:'18px 24px',borderRadius:'12px',border:'2px solid #ffb3b3',background:formData.isPregnant?'#ffeaea':'#fff6f6',fontWeight:600,fontSize:'1.08rem',color:'#222',display:'flex',alignItems:'center',gap:'16px',cursor:'pointer',transition:'all 0.2s'}} 
                                        onClick={() => {
                                            setShowPregnancyConfirm(true);
                                        }}
                                        disabled={!canBePregnant}
                                    >
                                        <span style={{
                                            width:22,
                                            height:22,
                                            borderRadius:'50%',
                                            border:'2.5px solid #ff6b6b',
                                            background:formData.isPregnant?'#ff6b6b':'#fff',
                                            display:'flex',
                                            alignItems:'center',
                                            justifyContent:'center',
                                            transition:'background 0.2s, border 0.2s',
                                            flexShrink:0
                                        }}>
                                            {formData.isPregnant && <span style={{width:10,height:10,borderRadius:'50%',background:'#fff',display:'block'}}></span>}
                                        </span>
                                        <span style={{flex:1}}>Tôi đang mang thai</span>
                                    </button>
                                    {showPregnancyConfirm && (
                                        <div className="pregnancy-confirm-modal" style={{marginTop:'8px',background:'#fffbe6',border:'1px solid #ffe58f',padding:'12px',borderRadius:'6px'}}>
                                            <div>Bạn muốn {formData.isPregnant ? 'hủy chọn' : 'xác nhận'} trạng thái đang mang thai?</div>
                                            <button type="button" onClick={()=>{
                                                handlePregnancyConfirm(!formData.isPregnant);
                                            }} style={{marginRight:8}}>Xác nhận</button>
                                            <button type="button" onClick={()=>setShowPregnancyConfirm(false)}>Hủy</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Health Notes */}
                        <div className="form-section">
                            <div className="form-group">
                                <label><FaHeart /> Ghi chú về tình trạng sức khỏe</label>
                                <textarea
                                    name="healthNotes"
                                    value={formData.healthNotes}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: Tiểu đường, cao huyết áp, các bệnh mãn tính khác..."
                                    rows="3"
                                />
                            </div>
                        </div>

                        {/* Current Symptoms */}
                        <div className="form-section">
                            <div className="form-group">
                                <label><FaExclamationTriangle /> Triệu chứng hiện tại</label>
                                <textarea
                                    name="symptoms"
                                    value={formData.symptoms}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: Sốt, ho, đau đầu, mệt mỏi..."
                                    rows="3"
                                />
                            </div>
                        </div>

                        {/* Current Medications */}
                        <div className="form-section">
                            <div className="form-group">
                                <label><FaPills /> Thuốc đang sử dụng</label>
                                <textarea
                                    name="currentMedications"
                                    value={formData.currentMedications}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: Thuốc ARV, thuốc huyết áp, vitamin..."
                                    rows="3"
                                />
                            </div>
                        </div>

                        {/* Allergies */}
                        <div className="form-section">
                            <div className="form-group">
                                <label><FaExclamationTriangle /> Dị ứng (nếu có)</label>
                                <textarea
                                    name="allergies"
                                    value={formData.allergies}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: Dị ứng thuốc kháng sinh, thức ăn, chất tương phản..."
                                    rows="2"
                                />
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="form-section emergency-section">
                            <h3>Thông tin liên hệ khẩn cấp</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label><FaUser /> Tên người liên hệ <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="emergencyContact"
                                        value={formData.emergencyContact}
                                        onChange={handleChange}
                                        placeholder="Họ và tên người thân"
                                        className={errors.emergencyContact ? 'error' : ''}
                                    />
                                    {errors.emergencyContact && (
                                        <span className="error-message">{errors.emergencyContact}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label><FaPhone /> Số điện thoại <span className="required">*</span></label>
                                    <input
                                        type="tel"
                                        name="emergencyPhone"
                                        value={formData.emergencyPhone}
                                        onChange={handleChange}
                                        placeholder="Số điện thoại liên hệ khẩn cấp"
                                        className={errors.emergencyPhone ? 'error' : ''}
                                    />
                                    {errors.emergencyPhone && (
                                        <span className="error-message">{errors.emergencyPhone}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">
                            Hủy bỏ
                        </button>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Đang xử lý...' : 'Tiếp tục đặt lịch'}
                        </button>
                    </div>
                </form>

                <div className="declaration-note">
                    <p><strong>Lưu ý:</strong> Thông tin này sẽ được giữ bảo mật và chỉ được sử dụng cho mục đích chăm sóc y tế.</p>
                </div>
            </div>

            {/* Pregnancy Confirmation Modal */}
            {showPregnancyConfirm && (
                <div className="pregnancy-confirm-overlay">
                    <div className="pregnancy-confirm-modal">
                        <div className="pregnancy-confirm-header">
                            <h3>Xác nhận tình trạng mang thai</h3>
                            <button 
                                type="button" 
                                className="close-btn"
                                onClick={() => setShowPregnancyConfirm(false)}
                            >
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className="pregnancy-confirm-content">
                            <FaHeart className="pregnancy-icon" />
                            <p>Bạn có đang mang thai không?</p>
                            <p className="note">Thông tin này rất quan trọng để bác sĩ có thể đưa ra phác đồ điều trị phù hợp.</p>
                        </div>
                        
                        <div className="pregnancy-confirm-actions">
                            <button 
                                type="button"
                                className="pregnancy-btn no-btn"
                                onClick={() => handlePregnancyConfirm(false)}
                            >
                                Không
                            </button>
                            <button 
                                type="button"
                                className="pregnancy-btn yes-btn"
                                onClick={() => handlePregnancyConfirm(true)}
                            >
                                Có
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentDeclarationForm;
