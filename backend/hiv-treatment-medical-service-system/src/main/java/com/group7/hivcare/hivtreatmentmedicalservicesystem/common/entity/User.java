/**
 * User.java - Entity class cho User table
 *
 * Chức năng:
 * - JPA Entity mapping cho users table
 * - User profile information storage
 * - Role-based access control
 * - Audit fields (created/updated timestamps)
 * - Relationships với Patient, Doctor entities
 * - Lombok annotations cho boilerplate code
 */
package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * User entity - đại diện cho users table trong database
 * Sử dụng Lombok để generate getters/setters/constructors
 * EqualsAndHashCode chỉ dựa trên explicitly included fields
 * ToString exclude sensitive fields
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = { "role" }) // Exclude role từ toString để tránh circular reference
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer id;

    @Column(nullable = false, length = 100)
    private String password;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "full_name", nullable = false, columnDefinition = "NVARCHAR(100)")
    private String fullName;

    @Column(name = "phone_number", nullable = false, length = 12)
    private String phoneNumber;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "is_anonymous", nullable = false)
    @Builder.Default
    private Boolean anonymous = false;

    @Column(name = "birthday")
    private LocalDate birthday;

    @Column(name = "gender", columnDefinition = "NVARCHAR(30)")
    private String gender;

    @Column(name = "address", columnDefinition = "NVARCHAR(100)")
    private String address;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}