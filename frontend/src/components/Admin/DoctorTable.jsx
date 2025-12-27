import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DoctorForm from './DoctorForm';
import './DoctorTable.scss';
import './ActionButtons.scss';
import { FaSort, FaSortUp, FaSortDown, FaEdit, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import ConfirmModal from '../Common/ConfirmModal';
import { toast } from 'react-toastify';

const DoctorTable = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, ACTIVE, INACTIVE
    const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });
    const [doctorStatusMap, setDoctorStatusMap] = useState({});

    const fetchDoctors = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            // Thêm parameter để lấy tất cả bác sĩ (bao gồm inactive)
            const url = `http://localhost:8080/api/admin/users/doctors?includeInactive=true`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setDoctors(data.content || data || []);
            // Fetch status cho từng userId
            const statusMap = {};
            await Promise.all((data.content || data || []).map(async (doc) => {
                if (doc.userId) {
                    try {
                        const res = await fetch(`http://localhost:8080/api/admin/users/${doc.userId}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (res.ok) {
                            const user = await res.json();
                            statusMap[doc.userId] = user.active;
                        }
                    } catch {
                        // Nếu không lấy được status, mặc định là inactive
                        statusMap[doc.userId] = false;
                    }
                }
            }));
            setDoctorStatusMap(statusMap);
        } catch (err) {
            setError('Không thể tải danh sách bác sĩ.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const handleEditClick = (doctor) => {
        if (doctor && doctor.id) {
            setEditingDoctor(doctor);
            setShowForm(true);
        }
    };

    const handleAddClick = () => {
        setEditingDoctor(null);
        setShowForm(true);
    };

    const handleSubmit = async (formData) => {
        try {
            const token = localStorage.getItem('token');
            if (editingDoctor) {
                await axios.put(`http://localhost:8080/api/admin/users/${editingDoctor.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Cập nhật bác sĩ thành công!');
            } else {
                await axios.post('http://localhost:8080/api/admin/users', { ...formData, roleName: 'DOCTOR' }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Thêm bác sĩ thành công!');
            }
            setShowForm(false);
            setEditingDoctor(null);
            fetchDoctors();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi xử lý yêu cầu');
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingDoctor(null);
    };

    const handleDeactivate = (id) => {
        setConfirmModal({
            show: true,
            message: 'Bạn có chắc muốn vô hiệu hóa bác sĩ này?',
            onConfirm: async () => {
                setConfirmModal({ show: false });
                try {
                    const token = localStorage.getItem('token');
                    await axios.delete(`http://localhost:8080/api/admin/users/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    fetchDoctors();
                } catch (err) {
                    toast.error('Vô hiệu hóa bác sĩ thất bại!');
                }
            }
        });
    };

    const handleActivate = (id) => {
        setConfirmModal({
            show: true,
            message: 'Bạn có chắc muốn kích hoạt bác sĩ này?',
            onConfirm: async () => {
                setConfirmModal({ show: false });
                try {
                    const token = localStorage.getItem('token');
                    await axios.patch(`http://localhost:8080/api/admin/users/${id}/activate`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    fetchDoctors();
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Kích hoạt bác sĩ thất bại!');
                }
            }
        });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return <FaSort />;
        return sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />;
    };

    // Filter and sort doctors
    const filteredAndSortedDoctors = React.useMemo(() => {
        let result = [...doctors];

        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(doc =>
                doc.fullName?.toLowerCase().includes(searchLower) ||
                doc.email?.toLowerCase().includes(searchLower) ||
                doc.phoneNumber?.toLowerCase().includes(searchLower)
            );
        }

        // Filter by status
        if (statusFilter !== "ALL") {
            result = result.filter(doc => {
                const isActive = doctorStatusMap[doc.userId];
                if (statusFilter === "ACTIVE") return isActive === true;
                if (statusFilter === "INACTIVE") return isActive === false;
                return true;
            });
        }

        // Sort
        if (sortField) {
            result.sort((a, b) => {
                let aValue = a[sortField];
                let bValue = b[sortField];
                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;
                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }
                if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [doctors, searchTerm, sortField, sortOrder, statusFilter, doctorStatusMap]);

    return (
        <div className="doctor-table">
            <div className="table-header">
                <h2>Danh sách bác sĩ</h2>
                <div className="header-controls">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="status-filter"
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="ACTIVE">Đang hoạt động</option>
                        <option value="INACTIVE">Không hoạt động</option>
                    </select>
                    <button onClick={handleAddClick} className="add-button">+ Thêm bác sĩ</button>
                </div>
            </div>
            {loading ? (
                <div>Đang tải...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <>
                    <div className="table-wrapper">
                        <table>
                            <colgroup>
                                <col style={{ width: '60px' }} /> {/* ID */}
                                <col style={{ width: '200px' }} /> {/* Email */}
                                <col style={{ width: '150px' }} /> {/* Họ tên */}
                                <col style={{ width: '120px' }} /> {/* Số điện thoại */}
                                <col style={{ width: '80px' }} /> {/* Giới tính */}
                                <col style={{ width: '140px' }} /> {/* Chuyên khoa */}
                                <col style={{ width: '140px' }} /> {/* Bằng cấp */}
                                <col style={{ width: '90px' }} /> {/* Số ca/ngày */}
                                <col style={{ width: '120px' }} /> {/* Trạng thái */}
                                <col style={{ width: '140px', minWidth: '140px' }} /> {/* Hành động - fixed width */}
                            </colgroup>
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('id')}>ID {getSortIcon('id')}</th>
                                    <th onClick={() => handleSort('email')}>Email {getSortIcon('email')}</th>
                                    <th onClick={() => handleSort('fullName')}>Họ tên {getSortIcon('fullName')}</th>
                                    <th onClick={() => handleSort('phoneNumber')}>SĐT {getSortIcon('phoneNumber')}</th>
                                    <th onClick={() => handleSort('gender')}>Giới tính {getSortIcon('gender')}</th>
                                    <th onClick={() => handleSort('specialty')}>Chuyên khoa {getSortIcon('specialty')}</th>
                                    <th onClick={() => handleSort('qualifications')}>Bằng cấp {getSortIcon('qualifications')}</th>
                                    <th onClick={() => handleSort('maxAppointmentsPerDay')}>Ca/ngày {getSortIcon('maxAppointmentsPerDay')}</th>
                                    <th>Trạng thái</th>
                                    <th className="actions-column">Hành động</th>
                                </tr>
                            </thead>
                        <tbody>
                            {filteredAndSortedDoctors.length > 0 ? filteredAndSortedDoctors.map((doc) => (
                                <tr key={doc.id}>
                                    <td>{doc.id}</td>
                                    <td>{doc.email}</td>
                                    <td>{doc.fullName}</td>
                                    <td>{doc.phoneNumber}</td>
                                    <td>{doc.gender === 'Male' ? 'Nam' : doc.gender === 'Female' ? 'Nữ' : 'Khác'}</td>
                                    <td>{doc.specialty ? doc.specialty : <span style={{ color: '#e67e22' }}>Chưa bổ sung</span>}</td>
                                    <td>{doc.qualifications ? doc.qualifications : <span style={{ color: '#e67e22' }}>Chưa bổ sung</span>}</td>
                                    <td style={{ textAlign: 'center' }}>{doc.maxAppointmentsPerDay !== undefined && doc.maxAppointmentsPerDay !== null && doc.maxAppointmentsPerDay !== '' ? doc.maxAppointmentsPerDay : <span style={{ color: '#e67e22' }}>Chưa bổ sung</span>}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        {doc.userId ? (
                                            doctorStatusMap[doc.userId] !== false ? (
                                                <span className="status-badge active">Đang hoạt động</span>
                                            ) : (
                                                <span className="status-badge inactive">Không hoạt động</span>
                                            )
                                        ) : (
                                            <span className="status-badge unknown">Chưa xác định</span>
                                        )}
                                    </td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            <button onClick={() => handleEditClick(doc)} className="edit-button" title="Chỉnh sửa">
                                                <FaEdit />
                                            </button>
                                            {doc.userId ? (
                                                doctorStatusMap[doc.userId] !== false ? (
                                                    <button onClick={() => handleDeactivate(doc.userId)} className="toggle-active-btn active" title="Vô hiệu hóa">
                                                        <FaToggleOn size={18} />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleActivate(doc.userId)} className="toggle-active-btn inactive" title="Kích hoạt">
                                                        <FaToggleOff size={18} />
                                                    </button>
                                                )
                                            ) : (
                                                <span className="no-user-id">N/A</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="10">Không có bác sĩ nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                </>
            )}
            {showForm && (
                <DoctorForm
                    data={editingDoctor}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    editing={Boolean(editingDoctor)}
                />
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

export default DoctorTable; 