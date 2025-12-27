package com.group7.hivcare.hivtreatmentmedicalservicesystem.admin.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.doctor.dto.DoctorDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto.UserDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto.UserFilterDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto.UserRegisterDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto.UserUpdateDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.admin.dto.AdminOverviewDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.admin.service.AdminOverviewService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.service.impl.UserServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final UserServiceImpl userService;
    private final AdminOverviewService adminOverviewService;

    /**
     * API tổng quan cho dashboard admin
     */
    @GetMapping("/overview")
    public ResponseEntity<AdminOverviewDTO> getOverview() {
        return ResponseEntity.ok(adminOverviewService.getOverview());
    }

    /**
     * Tạo người dùng mới bởi admin
     */
    @PostMapping
    public ResponseEntity<String> createUserByAdmin(@Valid @RequestBody UserRegisterDTO dto) {
        userService.createUserByAdmin(dto);
        return ResponseEntity.ok("User đã được tạo thành công.");
    }

    /**
     * Cập nhật người dùng theo ID
     */
    @PutMapping("/{id}")
    public ResponseEntity<String> updateUser(@PathVariable Integer id, @Valid @RequestBody UserUpdateDTO dto) {
        userService.updateUser(id, dto);
        return ResponseEntity.ok("User dã được cập nhật thành công.");
    }

    /**
     * Tìm người dùng theo email
     */
    // Tìm user theo email
    @GetMapping("/by-email/")
    @PreAuthorize("hasRole('ADMIN') or authentication.principal.username == #email")
    public ResponseEntity<UserDTO> getUserByEmail(@RequestParam String email) {
        return userService.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Vô hiệu hóa tài khoản người dùng theo ID
     */
    // Xóa user (deactivate)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Integer id) {
        userService.deactivateUserWithAuth(id);
        return ResponseEntity.ok("User đã được deactivate thành công");
    }

    /**
     * Tìm người dùng theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Integer id) {
        Optional<UserDTO> userOpt = userService.findById(id);
        return userOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Kích hoạt tài khoản người dùng theo ID
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<String> activateUser(@PathVariable Integer id) {
        userService.activateUser(id);
        return ResponseEntity.ok("User đã được kích hoạt thành công");
    }

    @GetMapping("/patients")
    @PreAuthorize("hasRole('ADMIN')") // hoặc quyền phù hợp
    public ResponseEntity<List<UserDTO>> getAllPatients() {
        List<UserDTO> patients = userService.getUsersIsPatient("PATIENT");
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/doctors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DoctorDTO>> getAllDoctors(
            @RequestParam(value = "includeInactive", defaultValue = "false") boolean includeInactive) {
        return ResponseEntity.ok(userService.getUsersIsDoctor("DOCTOR", includeInactive));
    }


//    @GetMapping
//    public ResponseEntity<Page<UserDTO>> filterUsers(
//            @RequestParam(required = false) String fullName,
//            @RequestParam(required = false) String email,
//            @RequestParam(required = false) String phone,
//            @RequestParam(required = false) String roleName,
//            @RequestParam(required = false) String gender,
//            @RequestParam(defaultValue = "false") boolean anonymous,
//            @RequestParam(defaultValue = "true") boolean active,
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "10") int size
//    ) {
//        UserFilterDTO filter = new UserFilterDTO(fullName, email, phone, roleName, gender, anonymous, active);
//        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
//        Page<UserDTO> result = userService.filterUsers(filter, pageable);
//        return ResponseEntity.ok(result);
//    }

}
