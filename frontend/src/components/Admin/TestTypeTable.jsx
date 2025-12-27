import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TestTypeTable.scss';
import './ActionButtons.scss';
import ConfirmModal from '../Common/ConfirmModal';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';

const TestTypeTable = () => {
    const [testTypes, setTestTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingTestType, setEditingTestType] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: ''
    });

    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [onlyWithDescription, setOnlyWithDescription] = useState(false);
    const [sortField, setSortField] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    const priceRanges = [
        { label: 'Tất cả', value: 'ALL' },
        { label: '< 50.000', value: '0-50000' },
        { label: '50.000 - 100.000', value: '50000-100000' },
        { label: '100.000 - 200.000', value: '100000-200000' },
        { label: '200.000 - 500.000', value: '200000-500000' },
        { label: '500.000 - 1.000.000', value: '500000-1000000' },
        { label: '> 1.000.000', value: '1000000-' }
    ];
    const [selectedPriceRange, setSelectedPriceRange] = useState('ALL');

    useEffect(() => {
        fetchTestTypes();
    }, []);

    const fetchTestTypes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/lab-test-types', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTestTypes(response.data);
        } catch (err) {
            setError('Không thể tải danh sách loại xét nghiệm');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validate trước khi gửi
        if (!formData.name || formData.name.length < 2) {
            setError('Tên loại xét nghiệm phải từ 2 ký tự trở lên');
            setLoading(false);
            return;
        }
        if (!formData.price || isNaN(formData.price)) {
            setError('Giá phải là số hợp lệ');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const data = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price)
            };

            if (editingTestType) {
                // Update existing test type
                await axios.put(`http://localhost:8080/api/lab-test-types/${editingTestType.id}`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Cập nhật loại xét nghiệm thành công!');
            } else {
                // Create new test type
                await axios.post('http://localhost:8080/api/lab-test-types', data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Thêm loại xét nghiệm thành công!');
            }

            setShowModal(false);
            setEditingTestType(null);
            resetForm();
            fetchTestTypes();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Có lỗi xảy ra. Vui lòng thử lại.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (testType) => {
        setEditingTestType(testType);
        setFormData({
            name: testType.name,
            description: testType.description || '',
            price: testType.price.toString()
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        setConfirmModal({
            show: true,
            message: 'Bạn có chắc chắn muốn xóa loại xét nghiệm này?',
            onConfirm: async () => {
                setConfirmModal({ show: false });
                try {
                    const token = localStorage.getItem('token');
                    await axios.delete(`http://localhost:8080/api/lab-test-types/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    toast.success('Xóa loại xét nghiệm thành công!');
                    fetchTestTypes();
                } catch (err) {
                    setError('Không thể xóa loại xét nghiệm');
                    console.error(err);
                }
            }
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: ''
        });
    };

    const openCreateModal = () => {
        setEditingTestType(null);
        resetForm();
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingTestType(null);
        resetForm();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' ? value : value
        }));
    };

    const filteredTestTypes = testTypes.filter(testType => {
        const matchText = testType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            testType.description?.toLowerCase().includes(searchTerm.toLowerCase());
        let matchPrice = true;
        if (selectedPriceRange !== 'ALL') {
            const [min, max] = selectedPriceRange.split('-');
            if (min && max) {
                matchPrice = testType.price >= Number(min) && testType.price < Number(max);
            } else if (min && !max) {
                matchPrice = testType.price >= Number(min);
            } else if (!min && max) {
                matchPrice = testType.price < Number(max);
            }
        }
        const matchDesc = !onlyWithDescription || (testType.description && testType.description.trim() !== '');
        return matchText && matchPrice && matchDesc;
    });

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const sortedTestTypes = [...filteredTestTypes].sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    if (loading && testTypes.length === 0) {
        return <div className="loading">Đang tải...</div>;
    }

    return (
        <div className="test-type-table">
            <div className="table-header">
                <h2>Quản lý Loại Xét nghiệm</h2>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, mô tả..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <select value={selectedPriceRange} onChange={e => setSelectedPriceRange(e.target.value)} style={{ marginLeft: 8 }}>
                        {priceRanges.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                    </select>
                    <label style={{ marginLeft: 8 }}>
                        {/* <input type="checkbox" checked={onlyWithDescription} onChange={e => setOnlyWithDescription(e.target.checked)} /> Có mô tả */}
                    </label>
                    <button onClick={openCreateModal} className="add-button">
                        + Thêm Loại Xét nghiệm
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {!loading && !error && (
                <div className="table-wrapper">
                    <table>
                        <colgroup>
                            <col style={{ width: '60px' }} /> {/* ID */}
                            <col style={{ width: '250px' }} /> {/* Tên loại xét nghiệm */}
                            <col style={{ width: '300px' }} /> {/* Mô tả */}
                            <col style={{ width: '120px' }} /> {/* Giá */}
                            <col style={{ width: '140px', minWidth: '140px' }} /> {/* Hành động - fixed width */}
                        </colgroup>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>ID {sortField === 'id' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
                                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Tên loại xét nghiệm {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
                                <th onClick={() => handleSort('description')} style={{ cursor: 'pointer' }}>Mô tả {sortField === 'description' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
                                <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>Giá (VNĐ) {sortField === 'price' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
                                <th className="actions-column">Hành động</th>
                            </tr>
                        </thead>
                    <tbody>
                        {sortedTestTypes.map((testType) => (
                            <tr key={testType.id}>
                                <td>{testType.id}</td>
                                <td>{testType.name}</td>
                                <td>{testType.description || 'Không có mô tả'}</td>
                                <td>{formatPrice(testType.price || 0)}</td>
                                <td className="actions-cell">
                                    <div className="action-buttons">
                                        <button onClick={() => handleEdit(testType)} className="edit-button" title="Chỉnh sửa">
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleDelete(testType.id)} className="delete-button" title="Xóa">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {sortedTestTypes.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center' }}>
                                    Không có loại xét nghiệm nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingTestType ? 'Sửa Loại Xét nghiệm' : 'Thêm Loại Xét nghiệm Mới'}</h3>
                            <button onClick={closeModal} className="close-button">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="service-form">
                            <div className="form-group">
                                <label>Tên loại xét nghiệm *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Nhập tên loại xét nghiệm"
                                />
                            </div>

                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Nhập mô tả loại xét nghiệm"
                                    rows="3"
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
                                    placeholder="Nhập giá"
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={closeModal} className="cancel-button">
                                    Hủy
                                </button>
                                <button type="submit" disabled={loading} className="save-button">
                                    {loading ? 'Đang lưu...' : (editingTestType ? 'Cập nhật' : 'Thêm')}
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

export default TestTypeTable; 