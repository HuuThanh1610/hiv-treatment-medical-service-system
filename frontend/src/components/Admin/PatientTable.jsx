import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PatientForm from './PatientForm.jsx';
import './PatientTable.scss';
import './ActionButtons.scss';
import { FaSort, FaSortUp, FaSortDown, FaEye, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import ConfirmModal from '../Common/ConfirmModal';
import { toast } from 'react-toastify';

const PatientTable = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const url = `http://localhost:8080/api/admin/users/patients`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                // Ném lỗi nếu response không thành công (vd: 500)
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // API có thể trả về một mảng trực tiếp hoặc một object có content
            setUsers(data.content || data || []);
        } catch (err) {
            console.error("Lỗi khi tải danh sách bệnh nhân:", err);
            setError('Không thể tải danh sách bệnh nhân. Vui lòng kiểm tra console để biết thêm chi tiết.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEditClick = (user) => {
        if (user && user.id) {
            setEditingUser(user);
            setShowForm(true);
        }
    };

    const handleAddClick = () => {
        setEditingUser(null);
        setShowForm(true);
    };

    const handleSubmit = async (formData) => {
        try {
            const token = localStorage.getItem('token');
            if (editingUser) {
                await axios.put(`http://localhost:8080/api/admin/users/${editingUser.id}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                toast.success('Cập nhật người dùng thành công!');
            } else {
                await axios.post('http://localhost:8080/api/admin/users', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                toast.success('Thêm người dùng thành công!');
            }
            setShowForm(false);
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi xử lý yêu cầu');
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingUser(null);
    };

    const getRoleLabel = (roleName) => {
        if (roleName === 'PATIENT') return 'Bệnh nhân';
        if (roleName === 'DOCTOR') return 'Bác sĩ';
        return roleName;
    };

    const getGenderLabel = (gender) => {
        if (!gender) return '';
        const g = gender.toUpperCase();
        if (g === 'MALE') return 'Nam';
        if (g === 'FEMALE') return 'Nữ';
        if (g === 'OTHER') return 'Khác';
        return gender;
    };

    const handleDeactivate = (id) => {
        setConfirmModal({
            show: true,
            message: 'Bạn có chắc muốn DeActive người dùng này?',
            onConfirm: async () => {
                setConfirmModal({ show: false });
                try {
                    const token = localStorage.getItem('token');
                    await axios.delete(`http://localhost:8080/api/admin/users/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    fetchUsers();
                } catch (err) {
                    toast.error('Deactivate người dùng thất bại!');
                }
            }
        });
    };

    const handleActivate = (id) => {
        setConfirmModal({
            show: true,
            message: 'Bạn có chắc muốn kích hoạt người dùng này?',
            onConfirm: async () => {
                setConfirmModal({ show: false });
                try {
                    const token = localStorage.getItem('token');
                    await axios.patch(`http://localhost:8080/api/admin/users/${id}/activate`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    fetchUsers();
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Kích hoạt người dùng thất bại!');
                }
            }
        });
    };

    const handleViewClick = (user) => {
        console.log('View user:', user);
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

    // Filter and sort users
    const filteredAndSortedUsers = React.useMemo(() => {
        let result = [...users];

        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(user => {
                // Nếu user ẩn danh, chỉ tìm kiếm theo ID
                if (user.anonymous) {
                    return user.id?.toString().includes(searchLower);
                }
                // Nếu không ẩn danh, tìm kiếm theo tất cả thông tin
                return user.fullName?.toLowerCase().includes(searchLower) ||
                       user.email?.toLowerCase().includes(searchLower) ||
                       user.phoneNumber?.toLowerCase().includes(searchLower);
            });
        }

        // Apply sorting
        if (sortField) {
            result.sort((a, b) => {
                let aValue = a[sortField];
                let bValue = b[sortField];

                // Handle special cases
                if (sortField === 'active') {
                    aValue = aValue ? 'Hoạt động' : 'Không hoạt động';
                    bValue = bValue ? 'Hoạt động' : 'Không hoạt động';
                }

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
    }, [users, searchTerm, sortField, sortOrder]);

    return (
        <div className="patient-table">
            <div className="table-header">
                <h2>Danh sách người dùng</h2>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                />
                <button onClick={handleAddClick} className="add-button">+ Thêm người dùng</button>
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
                                <col style={{ width: '120px' }} /> {/* Ẩn danh */}
                                <col style={{ width: '100px' }} /> {/* Trạng thái */}
                                <col style={{ width: '160px', minWidth: '160px' }} /> {/* Hành động - fixed width */}
                            </colgroup>
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('id')}>ID {getSortIcon('id')}</th>
                                    <th onClick={() => handleSort('email')}>Email {getSortIcon('email')}</th>
                                    <th onClick={() => handleSort('fullName')}>Họ tên {getSortIcon('fullName')}</th>
                                    <th onClick={() => handleSort('phoneNumber')}>SĐT {getSortIcon('phoneNumber')}</th>
                                    <th onClick={() => handleSort('gender')}>Giới tính {getSortIcon('gender')}</th>
                                    <th onClick={() => handleSort('anonymous')}>Ẩn danh {getSortIcon('anonymous')}</th>
                                    <th onClick={() => handleSort('active')}>Trạng thái {getSortIcon('active')}</th>
                                    <th className="actions-column">Hành động</th>
                                </tr>
                            </thead>
                        <tbody>
                            {filteredAndSortedUsers.length > 0 ? filteredAndSortedUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.anonymous ? 'Ẩn' : user.email}</td>
                                    <td>{user.anonymous ? 'Bệnh nhân Ẩn danh' : user.fullName}</td>
                                    <td>{user.anonymous ? 'Ẩn' : user.phoneNumber}</td>
                                    <td>{getGenderLabel(user.gender)}</td>
                                    <td>
                                        <span className={`anonymous-badge ${user.anonymous ? 'active' : 'inactive'}`}>
                                            {user.anonymous ? '🔒 Ẩn danh' : '🔓 Công khai'}
                                        </span>
                                    </td>
                                    <td>{user.active ? 'Hoạt động' : 'Không hoạt động'}</td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            <button onClick={() => handleEditClick(user)} className="edit-button" title="Chỉnh sửa">
                                                <FaEdit />
                                            </button>
                                            {user.active ? (
                                                <button onClick={() => handleDeactivate(user.id)} className="toggle-active-btn active" title="Vô hiệu hóa">
                                                    <FaToggleOn size={18} />
                                                </button>
                                            ) : (
                                                <button onClick={() => handleActivate(user.id)} className="toggle-active-btn inactive" title="Kích hoạt">
                                                    <FaToggleOff size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="8">Không có người dùng nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                </>
            )}
            {showForm && (
                <PatientForm
                    data={editingUser}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    editing={Boolean(editingUser)}
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

export default PatientTable;
