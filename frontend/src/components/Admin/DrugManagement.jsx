import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DrugManagement.scss';
import './ActionButtons.scss';
import ConfirmModal from '../Common/ConfirmModal';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';

const DrugManagement = () => {
    const [drugs, setDrugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingDrug, setEditingDrug] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailDrug, setDetailDrug] = useState(null);
    const [filterActive, setFilterActive] = useState('ALL'); // ALL, ACTIVE, INACTIVE
    const [manufacturerFilter, setManufacturerFilter] = useState('');
    const [sortField, setSortField] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        quantity: '',
        manufacturer: ''
    });

    useEffect(() => {
        fetchDrugs();
    }, []);

    const fetchDrugs = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/arv-medications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDrugs(response.data);
        } catch (err) {
            setError('Không thể tải danh sách thuốc');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        // Kiểm tra mã thuốc đã tồn tại chưa (chỉ khi thêm mới)
        if (!editingDrug) {
            const codeExists = drugs.some(drug => (drug.code || '').toLowerCase() === (formData.code || '').toLowerCase());
            if (codeExists) {
                setError('Mã thuốc đã tồn tại. Vui lòng nhập mã khác!');
                setLoading(false);
                return;
            }
        }
        try {
            const token = localStorage.getItem('token');
            const data = {
                name: formData.name,
                description: formData.description,
                manufacturer: formData.manufacturer,
                code: formData.code || '',
                form: formData.form || '',
                strength: formData.strength || '',
                active: formData.active !== undefined ? formData.active : true
            };
            if (editingDrug) {
                await axios.put(`http://localhost:8080/api/arv-medications/${editingDrug.id}`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Cập nhật thuốc thành công!');
                await fetchDrugs();
            } else {
                await axios.post('http://localhost:8080/api/arv-medications', data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Thêm thuốc mới thành công!');
                await fetchDrugs();
            }
            setShowModal(false);
            setEditingDrug(null);
            resetForm();
        } catch (err) {
            setError('Có lỗi xảy ra. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (drug) => {
        setEditingDrug(drug);
        setFormData({
            name: drug.name,
            description: drug.description || '',
            quantity: drug.quantity?.toString() || '',
            manufacturer: drug.manufacturer || '',
            code: drug.code || '',
            form: drug.form || '',
            strength: drug.strength || '',
            active: typeof drug.active === 'boolean' ? drug.active : true
        });
        setShowModal(true);
    };

    const handleShowDetail = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/arv-medications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDetailDrug(response.data);
            setShowDetailModal(true);
        } catch (err) {
            setError('Không thể lấy thông tin chi tiết thuốc');
            console.error(err);
        }
    };

    // Hàm thực thi xóa thuốc
    const executeDelete = async (id) => {
        setConfirmModal({ show: false });
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/arv-medications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Xóa thuốc thành công!');
            fetchDrugs();
        } catch (err) {
            setError('Không thể xóa thuốc');
            console.error(err);
        }
    };

    const handleDelete = (id) => {
        setConfirmModal({
            show: true,
            message: 'Bạn có chắc chắn muốn xóa thuốc này?',
            onConfirm: () => executeDelete(id)
        });
    };

    // Hàm thực thi cập nhật trạng thái hoạt động
    const updateActiveStatus = async (drug, newStatus) => {
        setConfirmModal({ show: false });
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/arv-medications/${drug.id}`, {
                ...drug,
                active: newStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(newStatus ? 'Kích hoạt thuốc thành công!' : 'Đã ngưng hoạt động thuốc!');
            fetchDrugs();
        } catch (err) {
            setError('Không thể cập nhật trạng thái thuốc');
            console.error(err);
        }
    };

    const handleToggleActive = (drug) => {
        if (drug.active) {
            setConfirmModal({
                show: true,
                message: 'Bạn có chắc chắn muốn ngưng hoạt động thuốc này?',
                onConfirm: () => updateActiveStatus(drug, false)
            });
        } else {
            setConfirmModal({
                show: true,
                message: 'Bạn có chắc chắn muốn kích hoạt lại thuốc này?',
                onConfirm: () => updateActiveStatus(drug, true)
            });
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            quantity: '',
            manufacturer: '',
            code: '',
            form: '',
            strength: '',
            active: true
        });
    };

    const openCreateModal = () => {
        setEditingDrug(null);
        resetForm();
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingDrug(null);
        resetForm();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const filteredDrugs = drugs.filter(drug =>
        (drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            drug.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterActive === 'ALL' || (filterActive === 'ACTIVE' ? drug.active : !drug.active)) &&
        (manufacturerFilter === '' || (drug.manufacturer || '').toLowerCase().includes(manufacturerFilter.toLowerCase()))
    );

    const sortedDrugs = [...filteredDrugs].sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    if (loading && drugs.length === 0) {
        return <div className="loading">Đang tải...</div>;
    }

    return (
        <div className="drug-management-table">
            <div className="table-header">
                <h2>Quản lý Thuốc</h2>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, mô tả..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <select value={filterActive} onChange={e => setFilterActive(e.target.value)} style={{ marginLeft: 8 }}>
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="ACTIVE">Đang hoạt động</option>
                        <option value="INACTIVE">Ngừng hoạt động</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Hãng sản xuất..."
                        value={manufacturerFilter}
                        onChange={e => setManufacturerFilter(e.target.value)}
                        style={{ marginLeft: 8, width: 140 }}
                    />
                    <button onClick={openCreateModal} className="add-button">
                        + Thêm Thuốc
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {!loading && !error && (
                <table>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>ID {sortField === 'id' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
                            <th onClick={() => handleSort('code')} style={{ cursor: 'pointer' }}>Code {sortField === 'code' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
                            <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Tên thuốc {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
                            <th onClick={() => handleSort('description')} style={{ cursor: 'pointer' }}>Mô tả {sortField === 'description' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
                            <th onClick={() => handleSort('form')} style={{ cursor: 'pointer' }}>Dạng thuốc {sortField === 'form' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
                            <th onClick={() => handleSort('manufacturer')} style={{ cursor: 'pointer' }}>Hãng sản xuất {sortField === 'manufacturer' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
                            <th onClick={() => handleSort('active')} style={{ cursor: 'pointer' }}>Trạng thái {sortField === 'active' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedDrugs.map((drug) => (
                            <tr key={drug.id}>
                                <td>{drug.id}</td>
                                <td>{drug.code}</td>
                                <td>{drug.name}</td>
                                <td>{drug.description}</td>
                                <td>{drug.form}</td>
                                <td>{drug.manufacturer}</td>
                                <td>{drug.active ? 'Đang hoạt động' : 'Ngừng hoạt động'}</td>
                                <td>
                                    <button onClick={() => handleShowDetail(drug.id)} className="view-button"><FaEye /></button>
                                    <button onClick={() => handleEdit(drug)} className="edit-button"><FaEdit /></button>
                                    <button onClick={() => handleDelete(drug.id)} className="delete-button"><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                        {sortedDrugs.length === 0 && (
                            <tr>
                                <td colSpan="9" style={{ textAlign: 'center' }}>
                                    Không có thuốc nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingDrug ? 'Sửa Thuốc' : 'Thêm Thuốc Mới'}</h3>
                            <button onClick={closeModal} className="close-button">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="service-form">
                            <div className="form-group">
                                <label>Mã thuốc *</label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code || ''}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Nhập mã thuốc"
                                />
                            </div>
                            <div className="form-group">
                                <label>Tên thuốc *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Nhập tên thuốc"
                                />
                            </div>
                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Nhập mô tả thuốc"
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Dạng thuốc</label>
                                <input
                                    type="text"
                                    name="form"
                                    value={formData.form || ''}
                                    onChange={handleInputChange}
                                    placeholder="Nhập dạng thuốc (viên, dung dịch, ... )"
                                />
                            </div>
                            <div className="form-group">
                                <label>Hàm lượng</label>
                                <input
                                    type="text"
                                    name="strength"
                                    value={formData.strength || ''}
                                    onChange={handleInputChange}
                                    placeholder="Nhập hàm lượng (vd: 300mg)"
                                />
                            </div>
                            <div className="form-group">
                                <label>Nhà sản xuất</label>
                                <input
                                    type="text"
                                    name="manufacturer"
                                    value={formData.manufacturer}
                                    onChange={handleInputChange}
                                    placeholder="Nhập tên nhà sản xuất"
                                />
                            </div>
                            <div className="form-group">
                                <label>Trạng thái hoạt động</label>
                                <select
                                    name="active"
                                    value={formData.active ? 'true' : 'false'}
                                    onChange={e => setFormData(prev => ({ ...prev, active: e.target.value === 'true' }))}
                                >
                                    <option value="true">Đang hoạt động</option>
                                    <option value="false">Ngừng hoạt động</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="save-button">
                                    {editingDrug ? 'Lưu thay đổi' : 'Thêm mới'}
                                </button>
                                <button type="button" className="cancel-button" onClick={closeModal}>
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDetailModal && detailDrug && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Thông tin chi tiết thuốc</h3>
                            <button onClick={() => setShowDetailModal(false)} className="close-button">&times;</button>
                        </div>
                        <div className="service-form">
                            <table style={{ width: '100%' }}>
                                <tbody>
                                    <tr><td style={{ width: '180px', textAlign: 'left' }}>ID</td><td>{detailDrug.id}</td></tr>
                                    <tr><td style={{ textAlign: 'left' }}>Mã thuốc</td><td>{detailDrug.code}</td></tr>
                                    <tr><td style={{ textAlign: 'left' }}>Tên thuốc</td><td>{detailDrug.name}</td></tr>
                                    <tr><td style={{ textAlign: 'left' }}>Mô tả</td><td>{detailDrug.description}</td></tr>
                                    <tr><td style={{ textAlign: 'left' }}>Dạng thuốc</td><td>{detailDrug.form}</td></tr>
                                    <tr><td style={{ textAlign: 'left' }}>Hàm lượng</td><td>{detailDrug.strength}</td></tr>
                                    <tr><td style={{ textAlign: 'left' }}>Nhà sản xuất</td><td>{detailDrug.manufacturer}</td></tr>
                                    <tr><td style={{ textAlign: 'left' }}>Trạng thái hoạt động</td><td>{detailDrug.active ? 'Đang hoạt động' : 'Ngừng hoạt động'}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {confirmModal.show && (
                <ConfirmModal
                    show={confirmModal.show}
                    message={confirmModal.message}
                    onConfirm={confirmModal.onConfirm}
                    onCancel={() => setConfirmModal({ show: false })}
                />
            )}
        </div>
    );
};

export default DrugManagement; 