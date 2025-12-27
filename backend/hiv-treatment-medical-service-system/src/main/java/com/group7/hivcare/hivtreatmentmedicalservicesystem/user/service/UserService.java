/**
 * UserService.java - Interface định nghĩa user service operations
 *
 * Chức năng:
 * - User CRUD operations với pagination
 * - User registration và authentication
 * - Profile management
 * - Password management
 * - User search và filtering
 * - Role-based operations
 * - Doctor profile integration
 */
package com.group7.hivcare.hivtreatmentmedicalservicesystem.user.service;

// DTOs
import com.group7.hivcare.hivtreatmentmedicalservicesystem.doctor.dto.DoctorDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto.UserDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto.UserFilterDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto.UserRegisterDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto.UserUpdateDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto.PasswordUpdateDTO;

// Entities
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.User;

// Spring Data
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface UserService {
    //UserDTO register(UserRegisterDTO userRegisterDTO);
    Optional<UserDTO> findById(Integer id);
    UserDTO updateUser(Integer id, UserUpdateDTO dto);
    UserDTO updateCurrentUserProfile(UserUpdateDTO dto);
    boolean checkPassword(String rawPassword, String encodedPassword);
    List<UserDTO> getAllUsers();
    UserDTO getUserById(Integer id);
    void createUserByAdmin(UserRegisterDTO dto);
    Optional<UserDTO> findByEmail(String email);
    boolean existsByEmail(String email);
    void deactivateUser(Integer id);
    boolean isOwner(Integer userId, String email);
    UserDTO getUserByIdWithAuth(Integer id);
    UserDTO updateUserWithAuth(UserUpdateDTO dto);
    void deactivateUserWithAuth(Integer id);
    Page<UserDTO> filterUsers(UserFilterDTO filterDTO, Pageable pageable);
    void updatePassword(PasswordUpdateDTO passwordUpdateDTO);
    List<UserDTO> getUsersIsPatient(String roleName);
    List<DoctorDTO> getUsersIsDoctor(String roleName);

    // New methods for email verification
    void sendVerificationCode(String email);
    boolean verifyEmail(String email, String code);
    UserDTO registerWithVerification(UserRegisterDTO userRegisterDTO, String code);
    
    // Activate user
    void activateUser(Integer id);

    // Toggle anonymous status
    UserDTO toggleAnonymous(String email);
}
