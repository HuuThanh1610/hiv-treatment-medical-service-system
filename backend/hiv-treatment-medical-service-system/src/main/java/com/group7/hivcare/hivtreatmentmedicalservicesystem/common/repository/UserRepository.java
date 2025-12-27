/**
 * UserRepository.java - JPA Repository cho User entity
 *
 * Chức năng:
 * - CRUD operations cho User entity
 * - Custom query methods cho authentication
 * - User lookup by email với role fetching
 * - Pagination và filtering support
 * - JpaSpecificationExecutor cho dynamic queries
 * - Role-based queries
 */
package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Role;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.User;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto.UserFilterDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface cho User entity
 * Extends JpaRepository cho CRUD operations
 * Extends JpaSpecificationExecutor cho dynamic filtering
 */
public interface UserRepository extends JpaRepository<User, Integer>, JpaSpecificationExecutor<User> {
    // Basic authentication method
    Optional<User> findByEmail(String email);

    /**
     * Find user by email với eager loading của role
     * Sử dụng JOIN FETCH để tránh N+1 query problem
     */
    @Query("SELECT u FROM User u JOIN FETCH u.role WHERE u.email = :email")
    Optional<User> findByEmailWithRole(@Param("email") String email);
    
    @Query("SELECT u FROM User u JOIN FETCH u.role WHERE u.id = :id")
    Optional<User> findByIdWithRole(@Param("id") Integer id);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.role.name = :roleName")
    List<User> findAllByRoleName(@Param("roleName") String roleName);
}
