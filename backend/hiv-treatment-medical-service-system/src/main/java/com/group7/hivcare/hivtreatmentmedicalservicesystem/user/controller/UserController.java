/**
 * UserController.java - REST Controller cho user management
 *
 * Chức năng:
 * - CRUD operations cho users
 * - Get current user info từ JWT token
 * - Update user profile và password
 * - User search và filtering
 * - Admin user management endpoints
 * - Role-based access control
 */
package com.group7.hivcare.hivtreatmentmedicalservicesystem.user.controller;

// Entities
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.User;

// DTOs
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto.UserDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto.UserDeleteDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto.UserUpdateDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto.PasswordUpdateDTO;

// Services
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.service.UserService;

// Spring Framework
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;

    // Cập nhật thông tin người dùng hiện tại
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> updateCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserUpdateDTO userUpdateDTO) {
        UserDTO updatedUser = userService.updateCurrentUserProfile(userUpdateDTO);
        return ResponseEntity.ok(updatedUser);
    }

    // Lấy thông tin người dùng hiện tại
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        return userService.findByEmail(userDetails.getUsername())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Deactivate tài khoản của chính mình
    @DeleteMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> deactivateMyAccount(@AuthenticationPrincipal UserDetails userDetails) {
        userService.findByEmail(userDetails.getUsername())
                .ifPresent(user -> userService.deactivateUser(user.getId()));
        return ResponseEntity.ok("Tài khoản đã được vô hiệu hóa thành công");
    }

    // Toggle trạng thái ẩn danh
    @PatchMapping("/me/anonymous")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> toggleAnonymous(@AuthenticationPrincipal UserDetails userDetails) {
        UserDTO updatedUser = userService.toggleAnonymous(userDetails.getUsername());
        return ResponseEntity.ok(updatedUser);
    }

    // Cập nhật mật khẩu
    @PutMapping("/me/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> updatePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PasswordUpdateDTO passwordUpdateDTO) {
        userService.updatePassword(passwordUpdateDTO);
        return ResponseEntity.ok("Mật khẩu đã được cập nhật thành công");
    }
}
