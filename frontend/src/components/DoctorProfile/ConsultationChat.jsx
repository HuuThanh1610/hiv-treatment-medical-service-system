import React, { useState, useEffect, useRef } from 'react';
import { FaUserMd, FaPaperPlane, FaComments, FaHistory, FaPlus, FaUser, FaCommentDots, FaSpinner, FaTrash, FaExclamationTriangle, FaImage, FaPaperclip, FaSmile } from 'react-icons/fa';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import ConsultationService from '../../Services/ConsultationService';
import DoctorService from '../../Services/DoctorService';
import './ConsultationChat.scss';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';

const ConsultationChat = ({ active }) => {
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [showNewSession, setShowNewSession] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [initialMessage, setInitialMessage] = useState('');
    const [creatingSession, setCreatingSession] = useState(false);
    const [tab, setTab] = useState('chat');
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [imageUploading, setImageUploading] = useState(false);
    const [fileUploading, setFileUploading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Danh sách emoji phổ biến
    const commonEmojis = [
        '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
        '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
        '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
        '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
        '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
        '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
        '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧',
        '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
        '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '💩', '👻', '💀',
        '☠️', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽',
        '🙀', '😿', '😾', '🙈', '🙉', '🙊', '👶', '👧', '🧒', '👦',
        '👩', '🧑', '👨', '👵', '🧓', '👴', '👮‍♀️', '👮', '👮‍♂️', '🕵️‍♀️',
        '🕵️', '🕵️‍♂️', '💂‍♀️', '💂', '💂‍♂️', '👷‍♀️', '👷', '👷‍♂️', '🤴', '👸',
        '👳‍♀️', '👳', '👳‍♂️', '👲', '🧕', '🤵‍♀️', '🤵', '🤵‍♂️', '👰‍♀️', '👰',
        '👰‍♂️', '🤰', '🤱', '👼', '🎅', '🤶', '🧙‍♀️', '🧙', '🧙‍♂️', '🧝‍♀️',
        '🧝', '🧝‍♂️', '🧛‍♀️', '🧛', '🧛‍♂️', '🧟‍♀️', '🧟', '🧟‍♂️', '🧞‍♀️', '🧞',
        '🧞‍♂️', '🧜‍♀️', '🧜', '🧜‍♂️', '🧚‍♀️', '🧚', '🧚‍♂️', '👼', '🤰', '🤱',
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
        '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
        '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
        '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
        '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳',
        '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️',
        '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️',
        '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️',
        '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓',
        '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️',
        '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠',
        'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🛗', '🛂', '🛃',
        '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁',
        '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕',
        '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣',
        '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️',
        '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽',
        '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️',
        '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵',
        '🎶', '➕', '➖', '➗', '✖️', '♾️', '💲', '💱', '™️', '©️',
        '®️', '👁️‍🗨️', '🔚', '🔙', '🔛', '🔝', '🔜', '〰️', '➰', '➿',
        '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫',
        '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲',
        '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩',
        '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔',
        '🔕', '📣', '📢', '💬', '💭', '🗯️', '♠️', '♣️', '♥️', '♦️',
        '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖',
        '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠',
        '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧'
    ];

    const userRole = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('fullName');

    const location = useLocation();

    // Request notification permission on mount
    useEffect(() => {
        if (window.Notification && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, []);


    // Always reset and fetch sessions when the tab is activated
    useEffect(() => {
        if (active) {
            console.log('[ConsultationChat] Tab tư vấn được kích hoạt, bắt đầu reset và gọi API');
            setSessions([]);
            setSelectedSession(null);
            setMessages([]);
            setLoading(true);
            setError(null);
            fetchSessions();
            if (userRole === 'PATIENT') fetchDoctors();
        } else {
            console.log('[ConsultationChat] Tab tư vấn KHÔNG active');
        }
    }, [active]);

    useEffect(() => {
        // Only scroll the chat-body, not the whole page
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const sessionId = params.get('sessionId');
        if (sessionId && sessions.length > 0) {
            const found = sessions.find(s => String(s.id) === String(sessionId));
            if (found && (!selectedSession || String(selectedSession.id) !== String(sessionId))) {
                selectSession(found);
            }
        }
        // eslint-disable-next-line
    }, [location.search, sessions]);

    useEffect(() => {
        // Nếu có doctorId truyền vào (từ DoctorList), tự động mở modal và chọn bác sĩ
        if (location.state && location.state.doctorId) {
            setShowNewSession(true);
            setSelectedDoctorId(location.state.doctorId.toString());
        }
    }, [location.state]);

    // Polling for new messages: chỉ chạy khi tab active và có session
    useEffect(() => {
        if (!active || !selectedSession) return;
        let polling = true;
        const interval = setInterval(async () => {
            if (!polling || !selectedSession) return;
            try {
                const res = await ConsultationService.getMessages(selectedSession.id);
                const newMsgs = res.data || [];
                if (newMsgs.length > messages.length) {
                    // Có tin nhắn mới
                    const newMessage = newMsgs[newMsgs.length - 1];
                    const isMine = (userRole === newMessage.senderType);
                    if (!isMine) {
                        toast.info('Bạn có tin nhắn mới!');
                        // Hiện notification ngoài desktop nếu được cấp quyền
                        if (window.Notification && Notification.permission === 'granted') {
                            let senderLabel = newMessage.senderType === 'DOCTOR' ? 'Bác sĩ' : 'Bệnh nhân';
                            new window.Notification('Bạn có tin nhắn mới!', {
                                body: `${senderLabel}: ${newMessage.content}`,
                                icon: '/favicon.ico'
                            });
                        }
                    }
                    setMessages(newMsgs);
                }
            } catch (err) {
                // ignore
            }
        }, 3000);
        return () => {
            polling = false;
            clearInterval(interval);
        };
    }, [active, selectedSession, messages, userRole]);

    // Khi không còn chọn session, xóa sessionId khỏi localStorage
    useEffect(() => {
        if (!selectedSession) {
            localStorage.removeItem('currentConsultSessionId');
        }
    }, [selectedSession]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchSessions = async () => {
        console.log('[ConsultationChat] Gọi fetchSessions (API getMySessions)');
        try {
            setLoading(true);
            const response = await ConsultationService.getMySessions();
            setSessions(response.data || []);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách phiên tư vấn');
            setSessions([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            const data = await DoctorService.getAllDoctors();
            setDoctors(data || []);
            localStorage.setItem('doctors', JSON.stringify(data || [])); // Lưu vào localStorage
        } catch (err) {
            setDoctors([]);
        }
    };

    const selectSession = async (session) => {
        setSelectedSession(session);
        setTab('chat');
        localStorage.setItem('currentConsultSessionId', session.id); // Lưu sessionId hiện tại
        try {
            setLoading(true);
            const res = await ConsultationService.getMessages(session.id);
            setMessages(res.data || []);
        } catch (err) {
            setMessages([]);
            toast.error('Không thể tải tin nhắn');
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedSession) return;
        try {
            const res = await ConsultationService.sendMessage(selectedSession.id, newMessage);
            setMessages((prev) => [...prev, res.data]);
            setNewMessage('');
        } catch (err) {
            toast.error('Gửi tin nhắn thất bại');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();
        if (!selectedDoctorId || !initialMessage.trim()) {
            toast.error('Vui lòng chọn bác sĩ và nhập tin nhắn đầu tiên!');
            return;
        }
        setCreatingSession(true);
        try {
            const res = await ConsultationService.startSession(selectedDoctorId, initialMessage);
            toast.success('Tạo phiên tư vấn thành công!');
            setShowNewSession(false);
            setInitialMessage('');
            setSelectedDoctorId('');
            await fetchSessions();
            if (res && res.data && res.data.id) {
                selectSession(res.data);
            }
        } catch (err) {
            toast.error('Không thể tạo phiên tư vấn');
        } finally {
            setCreatingSession(false);
        }
    };

    // Xóa phiên tư vấn
    const handleDeleteSession = async () => {
        if (!selectedSession) return;

        confirmAlert({
            overlayClassName: "overlay-custom-class-name",
            customUI: ({ onClose }) => (
                <div className="custom-confirm-alert">
                    <div className="custom-confirm-alert__content">
                        <div className="custom-confirm-alert__icon">
                            <FaExclamationTriangle style={{ fontSize: 32, color: '#ff9800' }} />
                        </div>
                        <h3>Xác nhận xóa phiên tư vấn</h3>
                        <p>Bạn có chắc chắn muốn xóa phiên tư vấn với <strong>{getOtherParticipant(selectedSession).name}</strong>?</p>
                        <div className="custom-confirm-alert__warning">
                            <p><strong>⚠️ Lưu ý quan trọng:</strong></p>
                            <ul>
                                <li>Tất cả tin nhắn sẽ bị xóa vĩnh viễn</li>
                                <li>Không thể khôi phục sau khi xóa</li>
                                <li>Thao tác này không thể hoàn tác</li>
                            </ul>
                        </div>
                        <div className="custom-confirm-alert__actions">
                            <button
                                className="custom-confirm-alert__btn custom-confirm-alert__btn--cancel"
                                onClick={onClose}
                            >
                                Hủy
                            </button>
                            <button
                                className="custom-confirm-alert__btn custom-confirm-alert__btn--delete"
                                onClick={async () => {
                                    try {
                                        await ConsultationService.deleteSession(selectedSession.id);
                                        toast.success('Đã xóa phiên tư vấn thành công!');
                                        setSessions(prev => prev.filter(s => s.id !== selectedSession.id));
                                        setSelectedSession(null);
                                        setMessages([]);
                                        onClose();
                                    } catch (err) {
                                        toast.error('Xóa phiên tư vấn thất bại. Vui lòng thử lại.');
                                    }
                                }}
                            >
                                <FaTrash style={{ marginRight: 6 }} /> Xóa phiên tư vấn
                            </button>
                        </div>
                    </div>
                </div>
            )
        });
    };

    // Gửi ảnh (tạm thời base64, backend sẽ bổ sung sau)
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!selectedSession) {
            toast.error('Hãy chọn một phiên tư vấn trước!');
            return;
        }
        if (!file.type.startsWith('image/')) {
            toast.error('Chỉ hỗ trợ gửi file ảnh!');
            return;
        }
        setImageUploading(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target.result;
            // Gửi base64 như một tin nhắn đặc biệt
            try {
                // Có thể backend sẽ cần API riêng, tạm thời gửi như text có prefix [image]:
                const res = await ConsultationService.sendMessage(selectedSession.id, `[image]${base64}`);
                setMessages((prev) => [...prev, res.data]);
                toast.success('Đã gửi ảnh!');
            } catch (err) {
                toast.error('Gửi ảnh thất bại');
            } finally {
                setImageUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    // Gửi file (tạm thời base64, backend sẽ bổ sung sau)
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!selectedSession) {
            toast.error('Hãy chọn một phiên tư vấn trước!');
            return;
        }
        setFileUploading(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target.result;
            // Gửi base64 như một tin nhắn đặc biệt
            try {
                // Có thể backend sẽ cần API riêng, tạm thời gửi như text có prefix [file]:<filename>:
                const res = await ConsultationService.sendMessage(selectedSession.id, `[file]${file.name}::${base64}`);
                setMessages((prev) => [...prev, res.data]);
                toast.success('Đã gửi file!');
            } catch (err) {
                toast.error('Gửi file thất bại');
            } finally {
                setFileUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    // Chèn emoji vào tin nhắn
    const addEmoji = (emoji) => {
        setNewMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    // Helper: lấy tên đối phương trong phiên tư vấn
    const getOtherParticipant = (session) => {
        if (userRole === 'PATIENT') {
            const doc = doctors.find(d => d.id === session.doctorId || d.userId === session.doctorId);
            return doc ? { name: doc.fullName, avatar: <FaUserMd /> } : { name: 'Bác sĩ', avatar: <FaUserMd /> };
        } else if (userRole === 'DOCTOR') {
            // Hiển thị tên bệnh nhân với số thứ tự cho ẩn danh
            let patientName = session.patientName;
            if (patientName === "Bệnh nhân Ẩn danh") {
                // Tạo số thứ tự dựa trên patientId để đảm bảo tính nhất quán
                const anonymousNumber = (session.patientId % 1000) + 1;
                patientName = `Bệnh nhân Ẩn danh ${anonymousNumber}`;
            }
            return { name: patientName || `Bệnh nhân #${session.patientId}`, avatar: <FaUser /> };
        }
        return { name: '', avatar: <FaUser /> };
    };

    // Helper: lấy tin nhắn cuối cùng
    const getLastMessage = (session) => {
        // Không có API riêng, nên không hiển thị preview nếu chưa load
        return '';
    };

    if (!active) {
        return null;
    }
    if (loading) {
        return (
            <div className="consult-room-wrapper">
                <div className="consultation-chat__loading">
                    <div className="loading-spinner">
                        <FaSpinner />
                    </div>
                    <p>Đang kết nối với bác sĩ...</p>
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="consult-room-wrapper">
                <div className="consultation-chat__error">{error}</div>
            </div>
        );
    }

    return (
        <>
            <div className="consult-room-wrapper messenger-layout">
                <div className="consult-sidebar">
                    <div className="sidebar-header">
                        <h2><FaCommentDots /> Tư vấn trực tuyến</h2>
                    </div>
                    <div className="session-list">
                        {sessions.length === 0 ? (
                            <div className="empty-session">
                                <div className="empty-icon"><FaComments /></div>
                                <h3>Chưa có phiên tư vấn nào</h3>
                                <p>Bắt đầu cuộc trò chuyện với bác sĩ để nhận tư vấn</p>
                                {userRole === 'PATIENT' && (
                                    <button
                                        className="start-consultation-btn"
                                        onClick={() => setShowNewSession(true)}
                                    >
                                        Bắt đầu tư vấn
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {userRole === 'PATIENT' && (
                                    <div className="create-session-section">
                                        <button
                                            className="create-session-btn"
                                            onClick={() => setShowNewSession(true)}
                                        >
                                            <FaPlus />
                                            Tạo phiên tư vấn
                                        </button>
                                    </div>
                                )}
                                {sessions.map(session => {
                                    const other = getOtherParticipant(session);
                                    return (
                                        <div
                                            key={session.id}
                                            className={`session-item${selectedSession && selectedSession.id === session.id ? ' selected' : ''}`}
                                            onClick={() => selectSession(session)}
                                        >
                                            <div className="avatar">{other.avatar}</div>
                                            <div className="session-info">
                                                <div className="name">{other.name}</div>
                                                <div className="last-message">{getLastMessage(session)}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                    {/* Modal tạo phiên mới */}
                    {showNewSession && userRole === 'PATIENT' && (
                        <div className="modal-overlay" onClick={() => setShowNewSession(false)}>
                            <div className="modal-content" onClick={e => e.stopPropagation()}>
                                <h3>Tạo phiên tư vấn mới</h3>
                                <form className="consultation-chat__new-session-form" onSubmit={handleCreateSession}>
                                    <label>Chọn bác sĩ:</label>
                                    <select
                                        value={selectedDoctorId}
                                        onChange={e => setSelectedDoctorId(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Chọn bác sĩ --</option>
                                        {doctors.map(doc => (
                                            <option key={doc.id || doc.userId} value={doc.id || doc.userId}>
                                                {doc.fullName} ({doc.specialty || 'Chưa cập nhật'})
                                            </option>
                                        ))}
                                    </select>
                                    <label>Tin nhắn đầu tiên:</label>
                                    <textarea
                                        value={initialMessage}
                                        onChange={e => setInitialMessage(e.target.value)}
                                        placeholder="Nhập nội dung cần tư vấn..."
                                        rows={2}
                                        required
                                    />
                                    <div className="modal-actions">
                                        <button type="button" onClick={() => setShowNewSession(false)}>Hủy</button>
                                        <button type="submit" className="consultation-chat__send-btn" disabled={creatingSession}>
                                            {creatingSession ? 'Đang tạo...' : 'Bắt đầu'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
                <div className="consult-chat-area">
                    {selectedSession ? (
                        <>
                            <div className="chat-header">
                                <div className="chat-partner-info">
                                    {getOtherParticipant(selectedSession).avatar}
                                    <div className="name">{getOtherParticipant(selectedSession).name}</div>
                                </div>
                                <div className="chat-header-actions" style={{ display: 'flex', gap: 12 }}>
                                    <button className="delete-session-btn" onClick={handleDeleteSession} title="Xóa phiên tư vấn">
                                        <FaTrash />
                                        Xóa phiên
                                    </button>
                                </div>
                            </div>
                            <div className="chat-body messenger-bubbles" ref={messagesContainerRef}>
                                {messages.length === 0 ? (
                                    <div className="consultation-chat__empty-messages">
                                        <div className="empty-chat-icon"><FaComments /></div>
                                        <p>Chưa có tin nhắn nào</p>
                                        <p>Bắt đầu cuộc trò chuyện với {getOtherParticipant(selectedSession).name}</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        // Determine if this message is sent by the current user
                                        const isMine = (userRole === msg.senderType);
                                        // Nếu là ảnh (content bắt đầu bằng [image]) thì hiển thị ảnh
                                        if (msg.content && msg.content.startsWith('[image]')) {
                                            const imgSrc = msg.content.replace('[image]', '');
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`bubble image-bubble ${isMine ? 'right' : 'left'} ${msg.senderType === 'DOCTOR' ? 'doctor' : 'patient'} message-fade-in`}
                                                >
                                                    <div className="bubble-content">
                                                        <img src={imgSrc} alt="img" style={{ maxWidth: 220, maxHeight: 220, borderRadius: 8 }} />
                                                    </div>
                                                    <div className="bubble-time">{new Date(msg.sentAt).toLocaleTimeString()}</div>
                                                </div>
                                            );
                                        }
                                        // Nếu là file (content bắt đầu bằng [file]) thì hiển thị link tải file
                                        if (msg.content && msg.content.startsWith('[file]')) {
                                            const fileInfo = msg.content.replace('[file]', '').split('::');
                                            const fileName = fileInfo[0];
                                            const fileData = fileInfo[1];
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`bubble file-bubble ${isMine ? 'right' : 'left'} ${msg.senderType === 'DOCTOR' ? 'doctor' : 'patient'} message-fade-in`}
                                                >
                                                    <div className="bubble-content">
                                                        <a href={fileData} download={fileName} target="_blank" rel="noopener noreferrer" className="file-link">
                                                            <FaPaperclip style={{ marginRight: 6 }} />{fileName}
                                                        </a>
                                                    </div>
                                                    <div className="bubble-time">{new Date(msg.sentAt).toLocaleTimeString()}</div>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`bubble ${isMine ? 'right' : 'left'} ${msg.senderType === 'DOCTOR' ? 'doctor' : 'patient'} message-fade-in`}
                                            >
                                                <div className="bubble-content">{msg.content}</div>
                                                <div className="bubble-time">{new Date(msg.sentAt).toLocaleTimeString()}</div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="chat-input-area">
                                <input
                                    type="text"
                                    placeholder="Nhập tin nhắn..."
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    disabled={!selectedSession}
                                />
                                <label className="image-upload-btn" title="Gửi ảnh">
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} disabled={!selectedSession || imageUploading} />
                                    <FaImage style={{ fontSize: 22, color: imageUploading ? '#ccc' : '#1976d2', cursor: imageUploading ? 'not-allowed' : 'pointer' }} />
                                </label>
                                <label className="file-upload-btn" title="Gửi file">
                                    <input type="file" style={{ display: 'none' }} onChange={handleFileChange} disabled={!selectedSession || fileUploading} />
                                    <FaPaperclip style={{ fontSize: 22, color: fileUploading ? '#ccc' : '#1976d2', cursor: fileUploading ? 'not-allowed' : 'pointer' }} />
                                </label>
                                <button className="emoji-btn" title="Chọn emoji" onClick={() => setShowEmojiPicker(!showEmojiPicker)} disabled={!selectedSession}>
                                    <FaSmile style={{ fontSize: 22, color: '#1976d2', cursor: 'pointer' }} />
                                </button>
                                <button className="send-btn" onClick={sendMessage} disabled={!newMessage.trim() || !selectedSession}><FaPaperPlane /></button>
                                {showEmojiPicker && (
                                    <div className="emoji-picker-container">
                                        <div className="emoji-grid">
                                            {commonEmojis.map((emoji, index) => (
                                                <button
                                                    key={index}
                                                    className="emoji-button"
                                                    onClick={() => addEmoji(emoji)}
                                                    title={emoji}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="consultation-chat__select-prompt">
                            <div className="select-prompt-icon"><FaComments /></div>
                            <h3>Chọn một phiên tư vấn</h3>
                            <p>Hoặc tạo phiên mới để bắt đầu trò chuyện với bác sĩ</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ConsultationChat; 