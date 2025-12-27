import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MedicalServicesTable.scss';
import ConfirmModal from '../Common/ConfirmModal';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaEye, FaPlus } from 'react-icons/fa';

const MedicalServicesTable = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        defaultDuration: 30,
        price: 0
    });
    const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

    const fetchServices = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/medical-services', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json; charset=utf-8',
                    'Accept': 'application/json; charset=utf-8'
                }
            });
            setServices(response.data || []);
        } catch (err) {
            setError('Không thể tải danh sách dịch vụ y tế.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleAddClick = () => {
        setEditingService(null);
        setFormData({
            name: '',
            description: '',
            defaultDuration: 30,
            price: 0
        });
        setShowForm(true);
    };

    const handleEditClick = (service) => {
        setEditingService(service);
        setFormData({
            name: service.name || '',
            description: service.description || '',
            defaultDuration: service.defaultDuration || 30,
            price: service.price || 0
        });
        setShowForm(true);
    };

    const handleDeleteClick = (serviceId) => {
        setConfirmModal({
            show: true,
            message: 'Bạn có chắc muốn xóa dịch vụ này?',
            onConfirm: async () => {
                setConfirmModal({ show: false });
                try {
                    const token = localStorage.getItem('token');
                    await axios.delete(`http://localhost:8080/api/medical-services/${serviceId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    toast.success('Xóa dịch vụ thành công!');
                    fetchServices();
                } catch (err) {
                    console.error('Lỗi khi xóa dịch vụ:', err);
                    toast.error(err.response?.data?.message || 'Xóa dịch vụ thất bại!');
                }
            }
        });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');

            if (editingService) {
                // Update existing service
                await axios.put(`http://localhost:8080/api/medical-services/${editingService.id}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                toast.success('Cập nhật dịch vụ thành công!');
            } else {
                // Create new service
                await axios.post('http://localhost:8080/api/medical-services', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                toast.success('Thêm dịch vụ thành công!');
            }

            setShowForm(false);
            setEditingService(null);
            fetchServices();
        } catch (err) {
            console.error('Lỗi khi lưu dịch vụ:', err);
            toast.error(err.response?.data?.message || 'Lưu dịch vụ thất bại!');
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingService(null);
        setFormData({
            name: '',
            description: '',
            defaultDuration: 30,
            price: 0
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'defaultDuration' ? Number(value) : value
        }));
    };

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const filteredServices = services.filter(service => {
        const search = searchTerm.toLowerCase();
        return (
            service.name?.toLowerCase().includes(search) ||
            service.description?.toLowerCase().includes(search)
        );
    });

    const sortedServices = [...filteredServices].sort((a, b) => {
        const { key, direction } = sortConfig;
        let valA = a[key];
        let valB = b[key];
        if (key === 'price' || key === 'id' || key === 'defaultDuration') {
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

    const renderSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    return (
        <div className="medical-services-table">
            <div className="table-header">
                <h2>Quản lý dịch vụ y tế</h2>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, mô tả..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button onClick={handleAddClick} className="add-button">
                        <FaPlus style={{ marginRight: 4 }} /> Thêm dịch vụ
                    </button>
                </div>
            </div>

            {loading && <div className="loading">Đang tải...</div>}
            {error && <div className="error-message">{error}</div>}

            {!loading && !error && (
                <table>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>ID{renderSortIcon('id')}</th>
                            <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Tên dịch vụ{renderSortIcon('name')}</th>
                            <th onClick={() => handleSort('description')} style={{ cursor: 'pointer' }}>Mô tả{renderSortIcon('description')}</th>
                            <th onClick={() => handleSort('defaultDuration')} style={{ cursor: 'pointer' }}>Thời gian (phút){renderSortIcon('defaultDuration')}</th>
                            <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>Giá (VNĐ){renderSortIcon('price')}</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedServices.map((service) => (
                            <tr key={service.id}>
                                <td>{service.id}</td>
                                <td>{service.name}</td>
                                <td>{service.description || 'Không có mô tả'}</td>
                                <td>{service.defaultDuration || 30}</td>
                                <td>{formatPrice(service.price || 0)}</td>
                                <td>
                                    <button
                                        onClick={() => handleEditClick(service)}
                                        className="edit-button"
                                    ><FaEdit /></button>
                                    <button
                                        onClick={() => handleDeleteClick(service.id)}
                                        className="delete-button"
                                    ><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                        {sortedServices.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center' }}>
                                    Không có dịch vụ nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingService ? 'Sửa dịch vụ' : 'Thêm dịch vụ mới'}</h3>
                            <button onClick={handleFormClose} className="close-button">&times;</button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="service-form">
                            <div className="form-group">
                                <label>Tên dịch vụ *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Nhập tên dịch vụ"
                                />
                            </div>

                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Nhập mô tả dịch vụ"
                                    rows="3"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Thời gian (phút) *</label>
                                    <input
                                        type="number"
                                        name="defaultDuration"
                                        value={formData.defaultDuration}
                                        onChange={handleInputChange}
                                        required
                                        min="1"
                                        max="480"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Giá (VNĐ) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        step="1000"
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={handleFormClose} className="cancel-button">
                                    Hủy
                                </button>
                                <button type="submit" className="save-button">
                                    {editingService ? 'Cập nhật' : 'Thêm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                show={confirmModal.show}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal({ show: false })}
            />
        </div>
    );
};

export default MedicalServicesTable; 