
import { startConsultationSession, sendConsultationMessage, getConsultationMessages, closeConsultationSession, deleteConsultationSession, getMyConsultationSessions } from './api';


const ConsultationService = {
    startSession: (doctorId, initialMessage) => startConsultationSession(doctorId, initialMessage),
    getMySessions: () => getMyConsultationSessions(),
    sendMessage: (sessionId, content) => sendConsultationMessage(sessionId, content),
    getMessages: (sessionId) => getConsultationMessages(sessionId),
    closeSession: (sessionId) => closeConsultationSession(sessionId),
    deleteSession: (sessionId) => deleteConsultationSession(sessionId)
};

export default ConsultationService; 