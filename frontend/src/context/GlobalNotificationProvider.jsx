import React, { useEffect, useRef, useContext } from 'react';
import ConsultationService from '../Services/ConsultationService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { UserProfileTabContext } from '../components/UserProfile/UserProfile';

const GlobalNotificationProvider = ({ children }) => {
    const navigate = useNavigate();
    const pollingRef = useRef(null); // Đảm bảo chỉ có 1 polling duy nhất
    const activeTab = useContext(UserProfileTabContext);

    useEffect(() => {
        if (activeTab && activeTab !== 'consultation') return; // Chỉ polling khi tab tư vấn active

        const userRole = localStorage.getItem('role');
        const userId = localStorage.getItem('userId');
        if (!userRole || !userId) return;

        // Đảm bảo có danh sách bác sĩ cho patient
        if (userRole === 'PATIENT' && !localStorage.getItem('doctors')) {
            import('../Services/DoctorService').then(({ default: DoctorService }) => {
                DoctorService.getAllDoctors().then(data => {
                    localStorage.setItem('doctors', JSON.stringify(data || []));
                });
            });
        }

        // Request notification permission
        if (window.Notification && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }

        const POLL_INTERVAL = 8000;
        let stopped = false;

        const poll = async () => {
            if (stopped) return;
            try {
                let lastMsgMap = {};
                try {
                    lastMsgMap = JSON.parse(localStorage.getItem('consult_last_msg_map') || '{}');
                } catch { }
                let shownMsgMap = {};
                try {
                    shownMsgMap = JSON.parse(localStorage.getItem('shown_consult_msg_map') || '{}');
                } catch { }

                const res = await ConsultationService.getMySessions();
                const sessions = res.data || [];
                for (const session of sessions) {
                    const msgRes = await ConsultationService.getMessages(session.id);
                    const msgs = msgRes.data || [];
                    if (msgs.length === 0) continue;
                    const lastMsg = msgs[msgs.length - 1];
                    const lastId = lastMsg.id;
                    const isMine = (userRole === lastMsg.senderType);
                    if (!isMine && lastMsgMap[session.id] && lastMsgMap[session.id] !== lastId && shownMsgMap[session.id] !== lastId) {
                        const currentSessionId = localStorage.getItem('currentConsultSessionId');
                        let senderName = '';
                        if (lastMsg.senderType === 'DOCTOR') {
                            let doctors = [];
                            try {
                                doctors = JSON.parse(localStorage.getItem('doctors') || '[]');
                            } catch { }
                            const doc = doctors.find(
                                d => String(d.userId) === String(lastMsg.senderId) || String(d.id) === String(lastMsg.senderId)
                            );
                            senderName = doc ? doc.fullName : 'Bác sĩ';
                        } else {
                            senderName = `Bệnh nhân #${lastMsg.senderId}`;
                        }
                        const senderLabel = lastMsg.senderType === 'DOCTOR' ? 'Bác sĩ' : 'Bệnh nhân';
                        toast.info(
                            `${senderName} (${senderLabel}): ${lastMsg.content}\n(Nhấn vào để mở phiên chat)`,
                            {
                                autoClose: 7000,
                                onClick: () => {
                                    window.location.href = `/consultation-online?sessionId=${session.id}`;
                                }
                            }
                        );
                        shownMsgMap[session.id] = lastId;
                    }
                    lastMsgMap[session.id] = lastId;
                }
                localStorage.setItem('consult_last_msg_map', JSON.stringify(lastMsgMap));
                localStorage.setItem('shown_consult_msg_map', JSON.stringify(shownMsgMap));
            } catch { }
            if (!stopped) {
                pollingRef.current = setTimeout(poll, POLL_INTERVAL);
            }
        };
        poll();
        return () => {
            stopped = true;
            if (pollingRef.current) clearTimeout(pollingRef.current);
        };
    }, [activeTab]);
    return <>{children}</>;
};

export default GlobalNotificationProvider;