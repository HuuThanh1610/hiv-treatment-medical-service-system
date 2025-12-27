package com.group7.hivcare.hivtreatmentmedicalservicesystem.email.service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Random;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class EmailVerificationService {
    
    private final EmailService emailService;
    private final Map<String, VerificationCode> verificationCodes = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private final Random random = new Random();
    private static final int EXPIRY_MINUTES = 10;

    @Autowired
    public EmailVerificationService(EmailService emailService) {
        this.emailService = emailService;
    }

    public void sendVerificationCode(String email) {
        String code = generateVerificationCode();
        VerificationCode verificationCode = new VerificationCode(code, LocalDateTime.now().plusMinutes(EXPIRY_MINUTES));
        verificationCodes.put(email, verificationCode);
        
        // Schedule code removal after 10 minutes
        scheduler.schedule(() -> verificationCodes.remove(email), EXPIRY_MINUTES, TimeUnit.MINUTES);
        
        emailService.sendVerificationEmail(email, code);
    }

    public boolean verifyCode(String email, String code) {
        VerificationCode storedCode = verificationCodes.get(email);
        if (storedCode == null) {
            return false;
        }
        
        if (LocalDateTime.now().isAfter(storedCode.expiryTime)) {
            verificationCodes.remove(email);
            return false;
        }
        
        return storedCode.code.equals(code);
    }

    private String generateVerificationCode() {
        return String.format("%06d", random.nextInt(1000000));
    }

    public void removeVerificationCode(String email) {
        verificationCodes.remove(email);
    }

    private static class VerificationCode {
        final String code;
        final LocalDateTime expiryTime;

        VerificationCode(String code, LocalDateTime expiryTime) {
            this.code = code;
            this.expiryTime = expiryTime;
        }
    }
} 