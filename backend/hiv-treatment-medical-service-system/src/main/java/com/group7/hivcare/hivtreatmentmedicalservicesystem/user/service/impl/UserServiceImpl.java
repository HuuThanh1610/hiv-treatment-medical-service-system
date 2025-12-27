package com.group7.hivcare.hivtreatmentmedicalservicesystem.user.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Doctor;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Patients;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.DoctorRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.PatientsRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.doctor.dto.DoctorDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.exception.customexceptions.DuplicateResourceException;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto.UserDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto.UserFilterDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto.UserRegisterDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto.UserUpdateDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto.PasswordUpdateDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Role;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.User;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.RoleRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.UserRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.service.UserService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.email.service.EmailVerificationService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailVerificationService emailVerificationService;

    @Autowired
    private PatientsRepository patientsRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    // Chuyển đổi Entity -> DTO
    private UserDTO convertToDTO(User user) {
        return convertToDTO(user, false);
    }

    // Chuyển đổi Entity -> DTO với tùy chọn hiển thị thông tin thật cho admin
    private UserDTO convertToDTO(User user, boolean isAdminView) {
        if (user == null)
            return null;
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());

        // Nếu là admin view hoặc user không ẩn danh, hiển thị thông tin thật
        if (isAdminView || !Boolean.TRUE.equals(user.getAnonymous())) {
            dto.setFullName(user.getFullName());
            dto.setEmail(user.getEmail());
            dto.setPhoneNumber(user.getPhoneNumber());
            dto.setAddress(user.getAddress());
        } else {
            dto.setFullName("Bệnh nhân Ẩn danh");
            dto.setEmail("Ẩn");
            dto.setPhoneNumber("Ẩn");
            dto.setAddress("Ẩn");
        }

        dto.setGender(user.getGender());
        dto.setAnonymous(user.getAnonymous());
        dto.setBirthday(user.getBirthday());
        if (user.getRole() != null) {
            dto.setRoleName(user.getRole().getName());
        }
        dto.setActive(user.getActive());

        // Nếu user là bệnh nhân, trả về đúng patientId từ bảng Patients
        if (user.getRole() != null && "PATIENT".equalsIgnoreCase(user.getRole().getName())) {
            patientsRepository.findByUserId(user.getId())
                .ifPresent(patient -> dto.setPatientId(patient.getId()));
        }
        return dto;
    }

    /**
     * Tạo User entity từ DTO + role + password
     * Sử dụng khi tạo user mới
     */
    private User buildUserFromRegisterDTO(UserRegisterDTO dto, Role role, String encodedPassword) {
        User user = new User();
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setAnonymous(dto.isAnonymous());
        user.setPassword(encodedPassword);
        user.setAddress(dto.getAddress());
        user.setBirthday(dto.getBirthday());
        user.setGender(dto.getGender());
        user.setActive(true);
        user.setRole(role);
        return user;
    }

    // @Override
    // public UserDTO register(UserRegisterDTO dto) {
    // // 1. Kiểm tra username/email đã tồn tại
    // if (userRepository.existsByEmail(dto.getEmail())) {
    // throw new DuplicateResourceException("Email đã tồn tại");
    // }
    //
    // // 2. Mã hóa mật khẩu
    // String encodedPassword = passwordEncoder.encode(dto.getPassword());
    //
    // // 3. Lấy role PATIENT
    // Role role = roleRepository.findByName("PATIENT")
    // .orElseThrow(() -> new EntityNotFoundException("Role PATIENT không tồn
    // tại"));
    //
    // // 4. Tạo entity từ DTO
    // User user = buildUserFromRegisterDTO(dto, role, encodedPassword);
    //
    // // 5. Lưu vào DB
    // user = userRepository.save(user);
    //
    // // 6. Trả về DTO
    // return convertToDTO(user);
    // }

    @Override
    public Optional<UserDTO> findById(Integer id) {
        return userRepository.findByIdWithRole(id).map(this::convertToDTO);
    }

    @Override
    public boolean checkPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    @Override
    public List<UserDTO> getAllUsers() {
        // Kiểm tra xem người gọi có phải admin không
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        return userRepository.findAll().stream()
                .filter(User::getActive)
                .map(user -> convertToDTO(user, isAdmin))
                .collect(Collectors.toList());
    }

    @Override
    public UserDTO getUserById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));
        return convertToDTO(user);
    }

    /**
     * Cập nhật thông tin user (dành cho admin)
     */
    @Override
    public UserDTO updateUser(Integer id, UserUpdateDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));

        user.setFullName(dto.getFullName());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setAnonymous(dto.isAnonymous());
        user.setBirthday(dto.getBirthday());
        user.setGender(dto.getGender());
        user.setAddress(dto.getAddress());
        if (dto.getRoleName() != null) {
            Role role = roleRepository.findByName(dto.getRoleName())
                    .orElseThrow(() -> new EntityNotFoundException("Role không tồn tại"));
            user.setRole(role);
        }
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    /**
     * Cập nhật thông tin cá nhân của user đang đăng nhập
     * Chỉ cho phép cập nhật: fullName, phone, anonymous, birthday, gender
     * Không cho phép cập nhật: email, role
     */
    @Override
    public UserDTO updateCurrentUserProfile(UserUpdateDTO dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName(); // email từ JWT

        User user = userRepository.findByEmailWithRole(email)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));

        // Kiểm tra user có active không
        if (!user.getActive()) {
            throw new IllegalStateException("Tài khoản đã bị vô hiệu hóa");
        }

        // Cập nhật thông tin được phép
        user.setFullName(dto.getFullName());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setAnonymous(dto.isAnonymous());
        user.setBirthday(dto.getBirthday());
        user.setGender(dto.getGender());
        user.setAddress(dto.getAddress());
        // Lưu thông tin cập nhật
        user = userRepository.save(user);
        return convertToDTO(user);
    }

    @Override
    public void createUserByAdmin(UserRegisterDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("Email đã tồn tại");
        }

        // Kiểm tra role hợp lệ
        String roleName = dto.getRoleName() != null ? dto.getRoleName() : "PATIENT";
        if (!roleName.equals("PATIENT") && !roleName.equals("DOCTOR") && !roleName.equals("ADMIN")) {
            throw new IllegalArgumentException("Role không hợp lệ. Chỉ chấp nhận PATIENT, DOCTOR hoặc ADMIN");
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new EntityNotFoundException("Role " + roleName + " không tồn tại"));

        String encodedPassword = passwordEncoder.encode(dto.getPassword());
        User user = buildUserFromRegisterDTO(dto, role, encodedPassword);
        userRepository.save(user);

        // Save patient
        if (role.getName().equals("PATIENT")) {
            Patients patient = new Patients();
            patient.setUser(user);
            patient.setMedicalRecordNumber(generateMedicalRecordNumber(user.getId())); // tạo mã hồ sơ bệnh án
            patientsRepository.save(patient);
        }
    }

    @Override
    public Optional<UserDTO> findByEmail(String email) {
        return userRepository.findByEmailWithRole(email)
                .map(this::convertToDTO);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public void deactivateUser(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng với ID: " + id));
        user.setActive(false);
        userRepository.save(user);
    }

    @Override
    public void deactivateUserWithAuth(Integer id) {
        User user = userRepository.findByIdWithRole(id)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));

        // Kiểm tra xem user có phải là super admin không
        if (user.getRole().getName().equals("ADMIN")) {
            throw new AccessDeniedException("Không thể deactivate tài khoản admin");
        }

        user.setActive(false);
        userRepository.save(user);
    }

    @Override
    public void activateUser(Integer id) {
        User user = userRepository.findByIdWithRole(id)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));

        // Kiểm tra xem user có phải là super admin không
        if (user.getRole().getName().equals("ADMIN")) {
            throw new AccessDeniedException("Không thể thay đổi trạng thái tài khoản admin");
        }

        // Kiểm tra xem user đã active chưa
        if (user.getActive()) {
            throw new IllegalStateException("Tài khoản đã được kích hoạt");
        }

        user.setActive(true);
        userRepository.save(user);
    }

    @Override
    public UserDTO toggleAnonymous(String email) {
        User user = userRepository.findByEmailWithRole(email)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));

        // Kiểm tra user có active không
        if (!user.getActive()) {
            throw new IllegalStateException("Tài khoản đã bị vô hiệu hóa");
        }

        // Toggle trạng thái ẩn danh
        user.setAnonymous(!user.getAnonymous());
        User savedUser = userRepository.save(user);

        return convertToDTO(savedUser);
    }

    @Override
    public void sendVerificationCode(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email đã tồn tại");
        }
        emailVerificationService.sendVerificationCode(email);
    }

    @Override
    public boolean verifyEmail(String email, String code) {
        return emailVerificationService.verifyCode(email, code);
    }

    public String generateMedicalRecordNumber(Integer userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID không được null khi tạo mã hồ sơ bệnh án");
        }

        return String.format("PT-%04d", userId); // ví dụ: userId = 12 → PT-0012
    }

    @Override
    public UserDTO registerWithVerification(UserRegisterDTO dto, String code) {
        // Verify the code first
        if (!verifyEmail(dto.getEmail(), code)) {
            throw new IllegalArgumentException("Mã xác nhận không hợp lệ hoặc đã hết hạn");
        }

        // Check if email exists
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("Email đã tồn tại");
        }

        // Encode password
        String encodedPassword = passwordEncoder.encode(dto.getPassword());

        // Get PATIENT role
        Role role = roleRepository.findByName("PATIENT")
                .orElseThrow(() -> new EntityNotFoundException("Role PATIENT không tồn tại"));

        // Create user entity
        User user = buildUserFromRegisterDTO(dto, role, encodedPassword);

        // Save to DB
        user = userRepository.save(user);

        // Save patient
        Patients patient = new Patients();
        patient.setUser(user);
        patient.setMedicalRecordNumber(generateMedicalRecordNumber(user.getId())); // tạo mã hồ sơ bệnh án
        patientsRepository.save(patient);

        // Remove the verification code after successful registration
        emailVerificationService.removeVerificationCode(dto.getEmail());

        // Return DTO
        return convertToDTO(user);
    }

    @Override
    public boolean isOwner(Integer userId, String email) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));
        return user.getEmail().equals(email);
    }

    @Override
    public UserDTO getUserByIdWithAuth(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !user.getEmail().equals(currentUserEmail)) {
            throw new AccessDeniedException("Bạn không có quyền truy cập thông tin này");
        }

        return convertToDTO(user);
    }

    @Override
    public UserDTO updateUserWithAuth(UserUpdateDTO dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        User user = userRepository.findByEmailWithRole(currentUserEmail)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));

        // Kiểm tra quyền cập nhật
        if (!isAdmin && !user.getEmail().equals(currentUserEmail)) {
            throw new AccessDeniedException("Bạn không có quyền cập nhật thông tin này");
        }

        // Cập nhật thông tin
        user.setFullName(dto.getFullName());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setAnonymous(dto.isAnonymous());
        user.setBirthday(dto.getBirthday());
        user.setGender(dto.getGender());

        // Nếu là admin và có yêu cầu thay đổi role
        if (isAdmin && dto.getRoleName() != null) {
            Role role = roleRepository.findByName(dto.getRoleName())
                    .orElseThrow(() -> new EntityNotFoundException("Role không tồn tại"));
            user.setRole(role);
        }

        user = userRepository.save(user);
        return convertToDTO(user);
    }

    private boolean isBlank(String str) {
        return str == null || str.trim().isEmpty();
    }

    // Filter user dùng cho Admin
    @Override
    public Page<UserDTO> filterUsers(UserFilterDTO filter, Pageable pageable) {
        // Nếu không có filter nào cụ thể, chỉ lọc theo active và anonymous
        boolean noFilter = isBlank(filter.getFullName()) &&
                isBlank(filter.getEmail()) &&
                isBlank(filter.getPhone()) &&
                isBlank(filter.getRoleName()) &&
                isBlank(filter.getGender());

        // Kiểm tra xem người gọi có phải admin không
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (noFilter) {
            // Lấy tất cả người dùng (theo active, anonymous, phân trang)
            return userRepository.findAll(pageable)
                    .map(user -> convertToDTO(user, isAdmin));
        }

        // Nếu có filter cụ thể, build specification động
        Specification<User> spec = (root, query, cb) -> cb.conjunction();

        if (!isBlank(filter.getFullName())) {
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("fullName")),
                    "%" + filter.getFullName().toLowerCase() + "%"));
        }

        if (!isBlank(filter.getEmail())) {
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("email")),
                    "%" + filter.getEmail().toLowerCase() + "%"));
        }

        if (!isBlank(filter.getPhone())) {
            spec = spec.and((root, query, cb) -> cb.like(root.get("phoneNumber"), "%" + filter.getPhone() + "%"));
        }

        if (!isBlank(filter.getGender())) {
            spec = spec
                    .and((root, query, cb) -> cb.equal(cb.lower(root.get("gender")), filter.getGender().toLowerCase()));
        }

        if (!isBlank(filter.getRoleName())) {
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("role").get("name")),
                    filter.getRoleName().toLowerCase()));
        }

        // Lọc theo trạng thái hoạt động và ẩn danh
        spec = spec.and((root, query, cb) -> cb.equal(root.get("anonymous"), filter.isAnonymous()));
        spec = spec.and((root, query, cb) -> cb.equal(root.get("active"), filter.isActive()));

        // Trả về kết quả
        return userRepository.findAll(spec, pageable)
                .map(user -> convertToDTO(user, isAdmin));
    }

    @Override
    public void updatePassword(PasswordUpdateDTO passwordUpdateDTO) {
        // Lấy thông tin user hiện tại
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmailWithRole(email)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));

        // Kiểm tra tài khoản có active không
        if (!user.getActive()) {
            throw new IllegalStateException("Tài khoản đã bị vô hiệu hóa");
        }

        // Kiểm tra mật khẩu hiện tại
        if (!passwordEncoder.matches(passwordUpdateDTO.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không chính xác");
        }

        // Kiểm tra mật khẩu mới và xác nhận mật khẩu
        if (!passwordUpdateDTO.getNewPassword().equals(passwordUpdateDTO.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu mới và xác nhận mật khẩu không khớp");
        }

        // Kiểm tra mật khẩu mới không được trùng với mật khẩu cũ
        if (passwordEncoder.matches(passwordUpdateDTO.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu mới không được trùng với mật khẩu cũ");
        }

        // Mã hóa và cập nhật mật khẩu mới
        String encodedNewPassword = passwordEncoder.encode(passwordUpdateDTO.getNewPassword());
        user.setPassword(encodedNewPassword);
        userRepository.save(user);
    }

    @Override
    public List<UserDTO> getUsersIsPatient(String roleName) {
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new EntityNotFoundException("Role không tồn tại"));

        List<User> users = userRepository.findAllByRoleName(role.getName());

        // Kiểm tra xem người gọi có phải admin không
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        return users.stream()
                .map(user -> convertToDTO(user, isAdmin))
                .collect(Collectors.toList());
    }

    @Override
    public List<DoctorDTO> getUsersIsDoctor(String roleName) {
        return getUsersIsDoctor(roleName, false); // Default: chỉ lấy active users
    }

    public List<DoctorDTO> getUsersIsDoctor(String roleName, boolean includeInactive) {
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy role: " + roleName));

        List<User> users = userRepository.findAllByRoleName(role.getName());

        return users.stream()
                .filter(user -> includeInactive || user.getActive()) // Filter based on includeInactive parameter
                .map(user -> {
                    Doctor doctor = doctorRepository.findByUserId(user.getId())
                            .orElse(null);

                    DoctorDTO dto = new DoctorDTO();
                    dto.setUserId(user.getId());
                    dto.setFullName(user.getFullName());
                    dto.setEmail(user.getEmail());
                    dto.setPhoneNumber(user.getPhoneNumber());
                    dto.setGender(user.getGender());
                    dto.setBirthday(user.getBirthday());
                    dto.setAnonymous(user.getAnonymous());
                    if (doctor != null) {
                        dto.setId(doctor.getId());
                        dto.setSpecialty(doctor.getSpecialty());
                        dto.setQualifications(doctor.getQualifications());
                        dto.setMaxAppointmentsPerDay(doctor.getMaxAppointmentsPerDay());
                    }

                    return dto;
                })
                .collect(Collectors.toList());
    }

}
