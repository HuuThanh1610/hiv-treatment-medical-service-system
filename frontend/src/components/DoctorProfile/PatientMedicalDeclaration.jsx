import React, { useState, useEffect } from 'react';
import { FaHeartbeat, FaPrescriptionBottleAlt, FaAllergies, FaPhone, FaUser, FaStickyNote } from 'react-icons/fa';
import { MdPregnantWoman } from 'react-icons/md';
import AppointmentDeclarationService from '../../Services/AppointmentDeclarationService';
import './PatientMedicalDeclaration.scss';

const PatientMedicalDeclaration = ({ patientId }) => {
    const [declaration, setDeclaration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDeclaration();
    }, [patientId]); // Chỉ depend vào patientId

    const fetchDeclaration = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Luôn lấy khai báo mới nhất của bệnh nhân
            if (patientId) {
                const declarations = await AppointmentDeclarationService.getDeclarationsByPatientId(patientId);
                if (declarations && declarations.length > 0) {
                    // Lấy khai báo mới nhất (đã được sắp xếp theo ngày giảm dần từ backend)
                    setDeclaration(declarations[0]);
                } else {
                    setDeclaration(null);
                }
            } else {
                setDeclaration(null);
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setDeclaration(null); // Không có khai báo
            } else {
                setError('Không thể tải thông tin khai báo y tế');
                console.error('Error fetching declaration:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="medical-declaration">
                <div className="medical-declaration__header">
                    <FaHeartbeat className="icon" />
                    <h3>Thông tin khai báo y tế</h3>
                </div>
                <div className="medical-declaration__loading">
                    Đang tải thông tin...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="medical-declaration">
                <div className="medical-declaration__header">
                    <FaHeartbeat className="icon" />
                    <h3>Thông tin khai báo y tế</h3>
                </div>
                <div className="medical-declaration__error">
                    {error}
                </div>
            </div>
        );
    }

    if (!declaration) {
        return (
            <div className="medical-declaration">
                <div className="medical-declaration__header">
                    <FaHeartbeat className="icon" />
                    <h3>Thông tin khai báo y tế</h3>
                </div>
                <div className="medical-declaration__empty">
                    Bệnh nhân chưa có khai báo y tế nào.
                </div>
            </div>
        );
    }

    return (
        <div className="medical-declaration">
            <div className="medical-declaration__header">
                <FaHeartbeat className="icon" />
                <h3>Khai báo y tế mới nhất</h3>
                <span className="declaration-date">
                    {new Date(declaration.createdAt).toLocaleDateString('vi-VN')}
                </span>
            </div>

            <div className="medical-declaration__content">
                {/* Tình trạng mang thai */}
                <div className="declaration-item">
                    <div className="declaration-item__label">
                        <MdPregnantWoman className="icon" />
                        Tình trạng mang thai
                    </div>
                    <div className={`declaration-item__value ${declaration.isPregnant ? 'pregnant' : 'not-pregnant'}`}>
                        {declaration.isPregnant ? 'Có mang thai' : 'Không mang thai'}
                    </div>
                </div>

                {/* Triệu chứng */}
                {declaration.symptoms && (
                    <div className="declaration-item">
                        <div className="declaration-item__label">
                            <FaHeartbeat className="icon" />
                            Triệu chứng hiện tại
                        </div>
                        <div className="declaration-item__value">
                            {declaration.symptoms}
                        </div>
                    </div>
                )}

                {/* Ghi chú sức khỏe */}
                {declaration.healthNotes && (
                    <div className="declaration-item">
                        <div className="declaration-item__label">
                            <FaStickyNote className="icon" />
                            Ghi chú sức khỏe
                        </div>
                        <div className="declaration-item__value">
                            {declaration.healthNotes}
                        </div>
                    </div>
                )}

                {/* Thuốc đang sử dụng */}
                {declaration.currentMedications && (
                    <div className="declaration-item">
                        <div className="declaration-item__label">
                            <FaPrescriptionBottleAlt className="icon" />
                            Thuốc đang sử dụng
                        </div>
                        <div className="declaration-item__value">
                            {declaration.currentMedications}
                        </div>
                    </div>
                )}

                {/* Dị ứng */}
                {declaration.allergies && (
                    <div className="declaration-item">
                        <div className="declaration-item__label">
                            <FaAllergies className="icon" />
                            Tiền sử dị ứng
                        </div>
                        <div className="declaration-item__value allergy">
                            {declaration.allergies}
                        </div>
                    </div>
                )}

                {/* Liên hệ khẩn cấp */}
                {(declaration.emergencyContact || declaration.emergencyPhone) && (
                    <div className="declaration-item">
                        <div className="declaration-item__label">
                            <FaPhone className="icon" />
                            Liên hệ khẩn cấp
                        </div>
                        <div className="declaration-item__value">
                            {declaration.emergencyContact && (
                                <div className="emergency-contact">
                                    <FaUser className="icon" />
                                    {declaration.emergencyContact}
                                </div>
                            )}
                            {declaration.emergencyPhone && (
                                <div className="emergency-phone">
                                    <FaPhone className="icon" />
                                    {declaration.emergencyPhone}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientMedicalDeclaration;
