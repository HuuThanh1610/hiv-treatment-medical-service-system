import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUpload, FaCalendarAlt, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import './LabResults.scss';
import LabResultDetailModal from './LabResultDetailModal';

// Mock Data
const recentResultsData = [
    {
        id: 1,
        name: 'HIV Viral Load',
        value: 'Undetectable (<20 copies/mL)',
        notes: 'Excellent viral suppression maintained',
        status: 'Bình thường',
        date: '15/4/2025',
        doctor: 'Dr. Sarah Johnson',
        referenceRange: 'Not applicable',
        unit: 'copies/mL',
        trend: 'Stable',
        recommendations: 'Continue current treatment regimen.',
        history: [
            { date: '10/10/2024', value: 'Undetectable (<20 copies/mL)' },
            { date: '15/6/2024', value: '35 copies/mL' },
        ]
    },
    {
        id: 2,
        name: 'CD4 Count',
        value: '750 cells/mm³',
        notes: 'Good immune function',
        status: 'Bình thường',
        date: '15/4/2025',
        doctor: 'Dr. Sarah Johnson',
        referenceRange: '500-1500 cells/mm³',
        unit: 'cells/mm³',
        trend: 'Stable',
        recommendations: 'Continue monitoring every 6 months.',
        history: [
            { date: '10/10/2024', value: '720 cells/mm³' },
            { date: '15/6/2024', value: '680 cells/mm³' },
        ]
    }
];

const attentionResultsData = [
    {
        id: 3,
        name: 'Lipid Panel',
        date: '20/2/2025',
        value: 'Total Cholesterol: 210 mg/dL, LDL: 130 mg/dL',
        status: 'Cần chú ý',
        doctor: 'Dr. Emily Rodriguez',
        referenceRange: 'Total Cholesterol: <200 mg/dL, LDL: <100 mg/dL',
        unit: 'mg/dL',
        trend: 'Tăng',
        notes: 'Slightly elevated cholesterol levels. Dietary changes recommended.',
        recommendations: 'Consider dietary modifications: reduce saturated fats, increase fiber intake. Retest in 3 months.',
        history: [
            { date: '10/11/2024', value: 'Total Cholesterol: 195 mg/dL, LDL: 115 mg/dL' },
            { date: '5/8/2024', value: 'Total Cholesterol: 190 mg/dL, LDL: 110 mg/dL' },
        ]
    },
    {
        id: 4,
        name: 'Glucose Test',
        date: '5/1/2025',
        value: 'Fasting: 110 mg/dL',
        status: 'Cần chú ý',
        doctor: 'Dr. James Wilson',
        referenceRange: '70-99 mg/dL',
        unit: 'mg/dL',
        trend: 'Tăng',
        notes: 'Slightly elevated. Monitor and retest in 3 months.',
        recommendations: 'Lifestyle and dietary adjustments. Follow up in 3 months.',
        history: [
            { date: '5/10/2024', value: 'Fasting: 105 mg/dL' },
            { date: '5/7/2024', value: 'Fasting: 98 mg/dL' },
        ]
    }
];

const LabResults = () => {
    const [activeTab, setActiveTab] = useState('recent');
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);
    const navigate = useNavigate();

    const handleOpenModal = (result) => {
        setSelectedResult(result);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedResult(null);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'recent':
                return <RecentResults onOpenModal={handleOpenModal} />;
            case 'all':
                return <AllResults onOpenModal={handleOpenModal} />;
            case 'attention':
                return <AttentionResults onOpenModal={handleOpenModal} />;
            default:
                return <RecentResults onOpenModal={handleOpenModal} />;
        }
    };

    return (
        <div className="lab-results-page">
            <div className="back-link" onClick={() => navigate('/services')}>
                <FaArrowLeft /> Quay lại trang dịch vụ
            </div>

            <header className="lab-results-header">
                <div>
                    <h1>Kết quả xét nghiệm</h1>
                    <p>Xem và quản lý kết quả xét nghiệm của bạn</p>
                </div>
                <button className="upload-btn">
                    <FaUpload /> Tải lên kết quả xét nghiệm
                </button>
            </header>

            <div className="lab-results-tabs">
                <button onClick={() => setActiveTab('recent')} className={activeTab === 'recent' ? 'active' : ''}>
                    Gần đây
                </button>
                <button onClick={() => setActiveTab('all')} className={activeTab === 'all' ? 'active' : ''}>
                    Tất cả kết quả
                </button>
                <button onClick={() => setActiveTab('attention')} className={activeTab === 'attention' ? 'active' : ''}>
                    Cần chú ý
                </button>
            </div>

            <div className="lab-results-content">
                {renderContent()}
            </div>

            <LabResultDetailModal show={isModalOpen} onClose={handleCloseModal} result={selectedResult} />
        </div>
    );
};

const RecentResults = ({ onOpenModal }) => (
    <>
        <div className="results-group">
            <div className="group-header">
                <FaCalendarAlt className="icon" />
                <h3>Thứ Ba, 15 tháng 4, 2025</h3>
            </div>
            <p className="group-subtitle">2 kết quả xét nghiệm từ Dr. Sarah Johnson</p>

            {recentResultsData.map(result => (
                <div className="result-card" key={result.id}>
                    <div className="result-info">
                        <h4>{result.name}</h4>
                        <p><strong>Kết quả:</strong> {result.value}</p>
                        <p><strong>Ghi chú:</strong> {result.notes}</p>
                    </div>
                    <div className="result-actions">
                        <span className="status-tag normal"><FaCheckCircle /> {result.status}</span>
                        <button className="details-btn" onClick={() => onOpenModal(result)}>Xem chi tiết</button>
                    </div>
                </div>
            ))}
        </div>
        <div className="info-card">
            <h3>Hiểu về kết quả xét nghiệm</h3>
            <p>Kết quả xét nghiệm của bạn được xem xét bởi bác sĩ điều trị. Nếu bạn có bất kỳ câu hỏi nào về kết quả xét nghiệm, vui lòng liên hệ với bác sĩ hoặc đặt lịch tư vấn.</p>
            <div className="info-actions">
                <button className="btn-secondary">Tư vấn với bác sĩ</button>
                <button className="btn-primary">Đặt lịch khám</button>
            </div>
        </div>
    </>
);

const AllResults = ({ onOpenModal }) => (
    <>
        <div className="results-group">
            <div className="group-header">
                <FaCalendarAlt className="icon" />
                <h3>Tất cả kết quả</h3>
            </div>
            {[...recentResultsData, ...attentionResultsData].map(result => (
                <div className={`result-card ${result.status === 'Cần chú ý' ? 'warning' : ''}`} key={result.id}>
                    <div className="result-info">
                        <h4>{result.name} - {result.date}</h4>
                        <p><strong>Kết quả:</strong> {result.value}</p>
                    </div>
                    <div className="result-actions">
                        <button className="details-btn" onClick={() => onOpenModal(result)}>Xem chi tiết</button>
                    </div>
                </div>
            ))}
        </div>
    </>
);

const AttentionResults = ({ onOpenModal }) => (
    <>
        <div className="results-group attention">
            <h3>Kết quả cần chú ý</h3>
            <p>Kết quả xét nghiệm cần được theo dõi hoặc trao đổi với bác sĩ</p>

            {attentionResultsData.map(result => (
                <div className="result-card warning" key={result.id}>
                    <div className="result-info">
                        <div className="warning-header"><FaExclamationTriangle /> {result.name}</div>
                        <p><strong>Ngày:</strong> {result.date}</p>
                        <p><strong>Kết quả:</strong> {result.value}</p>
                        <p><strong>Bác sĩ:</strong> {result.doctor}</p>
                        <p><strong>Ghi chú:</strong> {result.notes}</p>
                    </div>
                    <div className="result-actions">
                        <button className="details-btn" onClick={() => onOpenModal(result)}>Xem chi tiết</button>
                    </div>
                </div>
            ))}
        </div>
        <div className="info-card subtle">
            <FaInfoCircle />
            <p>Các kết quả cần chú ý không nhất thiết là nguy hiểm, nhưng nên được thảo luận với bác sĩ của bạn.</p>
        </div>
    </>
);

export default LabResults; 