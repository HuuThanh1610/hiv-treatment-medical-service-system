package com.group7.hivcare.hivtreatmentmedicalservicesystem.user.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto.EmailVerificationRequest;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto.UserDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto.UserRegisterDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class EmailVerificationController {

    @Autowired
    private UserService userService;

    @PostMapping("/send-verification")
    public ResponseEntity<String> sendVerificationCode(@RequestParam String email) {
        userService.sendVerificationCode(email);
        return ResponseEntity.ok("Mã xác nhận đã được gửi đến email của bạn");
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Boolean> verifyEmail(@Valid @RequestBody EmailVerificationRequest request) {
        boolean isValid = userService.verifyEmail(request.getEmail(), request.getCode());
        return ResponseEntity.ok(isValid);
    }

    @PostMapping("/register-with-verification")
    public ResponseEntity<UserDTO> registerWithVerification(
            @Valid @RequestBody UserRegisterDTO registerDTO,
            @RequestParam String code) {
        UserDTO userDTO = userService.registerWithVerification(registerDTO, code);
        return ResponseEntity.ok(userDTO);
    }
} 