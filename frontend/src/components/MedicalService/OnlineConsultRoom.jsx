import React, { useState, useRef } from 'react';
import { FaUserMd, FaVideo, FaCalendarAlt, FaUserSecret, FaComments, FaHistory, FaPaperPlane } from 'react-icons/fa';
import './OnlineConsultRoom.scss';

const doctors = [
    { id: 1, name: 'Bác sĩ Nguyễn A', status: 'online' },
    { id: 2, name: 'Bác sĩ Trần B', status: 'online' },
    { id: 3, name: 'Bác sĩ Lê C', status: 'busy' },
];

const upcomingCall = {
    doctor: 'Bác sĩ Nguyễn A',
    date: '20/05/2023',
    time: '10:00 AM',
};

const initialMessages = [
    { from: 'doctor', text: 'Xin chào! Tôi là Bác sĩ Nguyễn A. Tôi có thể giúp gì cho bạn hôm nay? Bạn có thể chia sẻ bất kỳ câu hỏi hoặc lo lắng nào về sức khỏe của mình.', time: '10:30 AM' },
    { from: 'user', text: 'Chào bác sĩ, tôi có một số câu hỏi về phác đồ ARV mới của tôi. Tôi đang gặp một số tác dụng phụ và không chắc liệu đây có phải là điều bình thường không.', time: '10:32 AM' },
    { from: 'doctor', text: 'Tôi hiểu sự lo lắng của bạn. Tác dụng phụ là điều khá phổ biến khi bắt đầu phác đồ ARV mới. Bạn có thể cho tôi biết cụ thể bạn đang gặp những tác dụng phụ nào không?', time: '10:35 AM' },
    { from: 'user', text: 'Tôi đang gặp tình trạng buồn nôn, đặc biệt là vào buổi sáng, và đôi khi cảm thấy chóng mặt. Tôi bắt đầu phác đồ TDF + 3TC + DTG được khoảng 2 tuần.', time: '10:38 AM' },
    { from: 'doctor', text: 'Cảm ơn bạn đã chia sẻ. Buồn nôn và chóng mặt là những tác dụng phụ khá phổ biến...', time: '10:40 AM' },
];

const LOAD_COUNT = 5;

const OnlineConsultRoom = () => {
    const [selectedDoctor, setSelectedDoctor] = useState(doctors[0]);
    const [allMessages, setAllMessages] = useState(initialMessages);
    const [visibleCount, setVisibleCount] = useState(LOAD_COUNT);
    const [input, setInput] = useState('');
    const [tab, setTab] = useState('chat');
    const [anonymous, setAnonymous] = useState(false);
    const chatBodyRef = useRef(null);

    const handleSend = () => {
        if (!input.trim()) return;
        const newMsg = { from: anonymous ? 'anonymous' : 'user', text: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setAllMessages(prev => [...prev, newMsg]);
        setInput('');
        setTimeout(() => {
            if (chatBodyRef.current) {
                chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
            }
        }, 50);
    };

    // Lấy các tin nhắn hiển thị (từ cuối lên)
    const visibleMessages = allMessages.slice(-visibleCount);

    // Xử lý scroll lên đầu để load thêm tin nhắn cũ
    const handleScroll = (e) => {
        if (e.target.scrollTop === 0 && visibleCount < allMessages.length) {
            setVisibleCount(count => Math.min(count + LOAD_COUNT, allMessages.length));
            // Giữ vị trí scroll sau khi load thêm
            setTimeout(() => {
                if (chatBodyRef.current) {
                    chatBodyRef.current.scrollTop = 10;
                }
            }, 50);
        }
    };

    return (
        <div className="consult-room-wrapper">
            <div className="consult-sidebar">
                <h2>Bác sĩ trực tuyến</h2>
                <div className="doctor-list">
                    {doctors.map(doc => (
                        <div key={doc.id} className={`doctor-item${selectedDoctor.id === doc.id ? ' selected' : ''}`}
                            onClick={() => setSelectedDoctor(doc)}>
                            <FaUserMd className="icon" />
                            <div>
                                <div className="name">{doc.name}</div>
                                <div className="status">
                                    {doc.status === 'online' ? <span className="online">Trực tuyến</span> : <span className="busy">Bận</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="upcoming-call">
                    <h3>Cuộc gọi sắp tới</h3>
                    <div className="call-card">
                        <FaVideo className="icon" />
                        <div>
                            <div className="call-title">Tư vấn qua video</div>
                            <div className="call-doctor">{upcomingCall.doctor}</div>
                            <div className="call-time"><FaCalendarAlt /> {upcomingCall.date} - {upcomingCall.time}</div>
                        </div>
                        <button className="join-btn">Tham gia</button>
                    </div>
                    <button className="schedule-btn">Đặt lịch tư vấn</button>
                </div>
            </div>
            <div className="consult-chat-area">
                <div className="chat-header">
                    <div className="doctor-info">
                        <FaUserMd className="icon" />
                        <div>
                            <div className="name">{selectedDoctor.name}</div>
                            <div className="status">{selectedDoctor.status === 'online' ? 'Đang trực tuyến' : 'Bận'}</div>
                        </div>
                    </div>
                    <div className="chat-actions">
                        <button className={`anon-btn${anonymous ? ' active' : ''}`} onClick={() => setAnonymous(a => !a)} title="Bật/tắt ẩn danh">
                            <FaUserSecret />
                        </button>
                        <button className="icon-btn" title="Video call"><FaVideo /></button>
                    </div>
                </div>
                <div className="chat-tabs">
                    <button className={tab === 'chat' ? 'active' : ''} onClick={() => setTab('chat')}><FaComments /> Tin nhắn</button>
                    <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}><FaHistory /> Lịch sử tư vấn</button>
                </div>
                <div className="chat-body" ref={chatBodyRef} onScroll={handleScroll}>
                    {tab === 'chat' ? (
                        <div className="messages">
                            {visibleMessages.map((msg, idx) => (
                                <div key={idx} className={`message ${msg.from === 'user' ? 'user' : msg.from === 'anonymous' ? 'anonymous' : 'doctor'}`}>
                                    <div className="msg-content">{msg.text}</div>
                                    <div className="msg-time">{msg.time}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="history-placeholder">Chức năng lịch sử tư vấn đang phát triển...</div>
                    )}
                </div>
                <div className="chat-input-area">
                    <input
                        type="text"
                        placeholder="Nhập tin nhắn của bạn..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button className="send-btn" onClick={handleSend}><FaPaperPlane /></button>
                </div>
            </div>
        </div>
    );
};

export default OnlineConsultRoom; 