import React, { useState, useEffect } from 'react';
import { FaCapsules, FaCalendarCheck } from 'react-icons/fa';
import './ARVProtocol.scss';

const ARVProtocol = () => {
    const [protocols, setProtocols] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProtocols = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:8080/api/arv-protocol/active', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Không thể tải phác đồ ARV');
                const data = await res.json();
                setProtocols(data);
            } catch (err) {
                setError('Không thể tải phác đồ ARV');
            } finally {
                setLoading(false);
            }
        };
        fetchProtocols();
    }, []);

    return (
        <div className="arv-protocol">
            <h2>Phác đồ ARV hiện tại</h2>
            <p>Thông tin về thuốc ARV của bệnh nhân</p>
            {loading ? (
                <div>Đang tải...</div>
            ) : error ? (
                <div style={{ color: 'red' }}>{error}</div>
            ) : (
                protocols.length === 0 ? (
                    <div>Không có phác đồ ARV nào.</div>
                ) : (
                    <div style={{ maxWidth: 1500, margin: '0 auto', padding: '32px 0' }}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: 40,
                                width: '100%',
                                justifyContent: 'center',
                            }}
                        >
                            {protocols.map((item, idx) => (
                                <div
                                    key={item.id || idx}
                                    className="medication-card"
                                    style={{
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 12,
                                        padding: 24,
                                        background: '#fff',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                        minWidth: 260,
                                        maxWidth: 340,
                                        minHeight: 260,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word',
                                        whiteSpace: 'normal'
                                    }}
                                >
                                    <div className="med-item" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                                        <div className="med-info">
                                            <FaCapsules className="icon" />
                                            <div style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                                                <strong>{item.name}</strong>
                                                {item.description && <span>{item.description}</span>}
                                                {item.dosage && <span>{item.dosage}</span>}
                                            </div>
                                        </div>
                                        {item.remainingPills !== undefined && (
                                            <span className="med-count">Còn {item.remainingPills} viên</span>
                                        )}
                                    </div>
                                    <div className="action-buttons" style={{ marginTop: 32 }}>
                                        <button className="btn-primary" style={{ width: '100%', height: 52, fontSize: 16, borderRadius: 8, fontWeight: 600, lineHeight: 'normal', padding: 0, overflow: 'visible', whiteSpace: 'normal', textAlign: 'center' }}>
                                            Cập nhật phác đồ
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

export default ARVProtocol; 