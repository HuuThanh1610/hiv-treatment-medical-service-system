package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.config;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Doctor;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Patients;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Role;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.User;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.DoctorRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.PatientsRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.RoleRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@Order(1)
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientsRepository patientsRepository;


    @Override
    public void run(String... args) throws Exception {
        Role adminRole = createRoleIfNotExists("ADMIN", "Administrator role");
        Role doctorRole = createRoleIfNotExists("DOCTOR", "Doctor role");
        Role patientRole = createRoleIfNotExists("PATIENT", "Patient role");
        Role staffRole = createRoleIfNotExists("STAFF", "Staff role");

        userRepository.findByEmail("admin@example.com").ifPresentOrElse(
                user -> System.out.println("Admin user already exists."),
                () -> {
                    User admin = new User();
                    admin.setEmail("admin@example.com");
                    admin.setPassword(passwordEncoder.encode("test123"));
                    admin.setFullName("Quản trị viên");
                    admin.setPhoneNumber("0123456789");
                    admin.setActive(true);
                    admin.setAnonymous(false);
                    admin.setBirthday(LocalDate.now());
                    admin.setGender("Male");
                    admin.setAddress("Quận Thử Đức, TP Hồ Chí Minh");
                    admin.setRole(adminRole);
                    userRepository.save(admin);
                    System.out.println("✅ Created default admin user: admin@example.com / test123");
                }
        );

        userRepository.findByEmail("doctor@example.com").ifPresentOrElse(
                user -> System.out.println("This doctor already exists."),
                () -> {
                    User user = new User();
                    user.setEmail("doctor@example.com");
                    user.setPassword(passwordEncoder.encode("test123"));
                    user.setFullName("Bác sĩ A");
                    user.setPhoneNumber("0123456555");
                    user.setActive(true);
                    user.setAnonymous(false);
                    user.setRole(doctorRole);
                    user.setBirthday(LocalDate.now());
                    user.setGender("Male");
                    user.setAddress("Quận Thử Đức, TP Hồ Chí Minh");
                    User saveUser = userRepository.save(user);
                    Doctor doctor = new Doctor();
                    doctor.setUser(saveUser);
                    doctor.setSpecialty("Bác sĩ điều trị HIV");
                    doctorRepository.save(doctor);
                    System.out.println("✅ Created default admin user: doctor@example.com / test123");
                }
        );

        userRepository.findByEmail("patient@example.com").ifPresentOrElse(
                user -> System.out.println("This patient already exists."),
                () -> {
                    User user = new User();
                    user.setEmail("patient@example.com");
                    user.setPassword(passwordEncoder.encode("test123"));
                    user.setFullName("Bệnh nhân A");
                    user.setPhoneNumber("0123333555");
                    user.setActive(true);
                    user.setAnonymous(false);
                    user.setRole(patientRole);
                    user.setBirthday(LocalDate.now());
                    user.setGender("Male");
                    user.setAddress("Quận Thử Đức, TP Hồ Chí Minh");
                    User saveUser = userRepository.save(user);
                    Patients patients = new Patients();
                    patients.setMedicalRecordNumber("PT-001");
                    patients.setUser(saveUser);
                    patients.setPregnant(true);
                    patientsRepository.save(patients);
                    System.out.println("✅ Created default admin user: patient@example.com / test123");
                }
        );


        userRepository.findByEmail("staff@example.com").ifPresentOrElse(
                user -> System.out.println("Admin user already exists."),
                () -> {
                    User staff = new User();
                    staff.setEmail("staff@example.com");
                    staff.setPassword(passwordEncoder.encode("test123"));
                    staff.setFullName("Nhân viên A");
                    staff.setPhoneNumber("0123333865");
                    staff.setActive(true);
                    staff.setAnonymous(false);
                    staff.setRole(staffRole);
                    staff.setAddress("Quận Thử Đức, TP Hồ Chí Minh");
                    staff.setBirthday(LocalDate.now());
                    staff.setGender("Male");
                    userRepository.save(staff);
                    System.out.println("✅ Created default admin user: staff@example.com / test123");
                }
        );
    }

    private Role createRoleIfNotExists(String name, String description) {
        return roleRepository.findByName(name).orElseGet(() -> {
            Role role = new Role();
            role.setName(name);
            role.setDescription(description);
            Role saved = roleRepository.save(role);
            System.out.println("✅ Created role: " + name);
            return saved;
        });
    }
} 