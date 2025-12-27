/**
 * AuthController.java - REST Controller cho authentication
 *
 * Chức năng:
 * - Login endpoint với JWT token generation
 * - Register endpoint cho user registration
 * - Authentication manager integration
 * - User validation và error handling
 * - CORS configuration cho frontend
 */
package com.group7.hivcare.hivtreatmentmedicalservicesystem.auth.controller;

// DTOs
import com.group7.hivcare.hivtreatmentmedicalservicesystem.auth.dto.LoginRequestDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.auth.dto.LoginResponseDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto.UserDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto.UserRegisterDTO;

// Services
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.service.UserService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.auth.service.JwtService;

// Entities và Repositories
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.User;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.UserRepository;

// Spring Framework
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    // Đăng nhập (Spring Security xử lý)
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO loginRequest) throws BadRequestException {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtService.generateToken(userDetails);

            User user = userRepository.findByEmailWithRole(userDetails.getUsername())
                    .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));

            LoginResponseDTO response = new LoginResponseDTO(
                    token,
                    user.getEmail(),
                    user.getRole().getName()
            );
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            throw new BadRequestException("Tên đăng nhập hoặc mật khẩu không chính xác");
        }
    }

    // Logout (nếu cần, với httpBasic có thể không dùng logout riêng)
    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("Logout thành công");
    }

}
