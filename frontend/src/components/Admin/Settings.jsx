import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import './AdminDashboard.scss';

const Settings = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <div className="settings-section" style={{
            width: 'calc(100vw - 250px)', // Trừ đi width của sidebar
            height: '100vh',
            padding: '20px',
            boxSizing: 'border-box',
            background: '#f5f5f5',
            position: 'fixed',
            right: '0',
            top: '0',
            overflowY: 'auto'
        }}>
            <h2 style={{ marginBottom: '24px', color: '#333', fontSize: '24px', fontWeight: '600' }}>Cài đặt</h2>
            <div className="settings-grid" style={{ width: '100%' }}>
                <div className="settings-card" style={{
                    width: 'calc(100% - 10vw)',
                    maxWidth: '90vw',
                    margin: '0 auto',
                    marginLeft: '5vw',
                    marginRight: '5vw'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px 24px',
                        background: '#fff',
                        borderRadius: '12px',
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        width: '100%'
                    }}>
                        {/* Content bên trái */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {isDarkMode ? (
                                <FaMoon style={{ color: '#1976d2', fontSize: '20px' }} />
                            ) : (
                                <FaSun style={{ color: '#ff9800', fontSize: '20px' }} />
                            )}
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '16px', color: '#333' }}>
                                    Giao diện
                                </div>
                                <div style={{ fontSize: '14px', color: '#666', marginTop: '2px' }}>
                                    {isDarkMode ? 'Chế độ tối' : 'Chế độ sáng'}
                                </div>
                            </div>
                        </div>

                        {/* Nút on/off bên phải */}
                        <div
                            onClick={toggleTheme}
                            style={{
                                position: 'relative',
                                width: '50px',
                                height: '26px',
                                background: isDarkMode ? '#1976d2' : '#ccc',
                                borderRadius: '13px',
                                cursor: 'pointer',
                                transition: 'background 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '2px'
                            }}
                        >
                            <div style={{
                                width: '22px',
                                height: '22px',
                                background: '#fff',
                                borderRadius: '50%',
                                transform: isDarkMode ? 'translateX(24px)' : 'translateX(0)',
                                transition: 'transform 0.3s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings; 