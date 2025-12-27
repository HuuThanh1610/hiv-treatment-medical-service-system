/**
 * SecurityConfig.java - Spring Security Configuration
 *
 * Chức năng:
 * - Cấu hình JWT authentication
 * - CORS configuration cho frontend
 * - URL security rules (public/protected endpoints)
 * - Password encoding với BCrypt
 * - Session management (stateless)
 * - Authentication manager setup
 * - HTTP firewall configuration
 */
package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.security.web.firewall.StrictHttpFirewall;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public HttpFirewall allowUrlEncodedSlashHttpFirewall() {
        StrictHttpFirewall firewall = new StrictHttpFirewall();
        firewall.setAllowUrlEncodedSlash(true);
        firewall.setAllowSemicolon(true);
        firewall.setAllowBackSlash(true);
        firewall.setAllowUrlEncodedDoubleSlash(true);
        return firewall;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints (authentication/registration)
                        .requestMatchers("/api/auth/send-verification").permitAll()
                        .requestMatchers("/api/auth/verify-email").permitAll()
                        .requestMatchers("/api/auth/register-with-verification").permitAll()
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/blogs/public").permitAll()
                        
                        // VNPay callback endpoint - must be public
                        .requestMatchers("/api/payments/vnpay/return").permitAll()

                        // User-related endpoints
                        .requestMatchers(HttpMethod.GET, "/api/users/me").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/users/me").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/users/me").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/users").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users/{id}").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/users/by-username/{username}").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/users/{id}").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/users/{id}").hasRole("ADMIN")

                        // Specific Doctor-related endpoints with precise role requirements
                        .requestMatchers(HttpMethod.PATCH, "/api/doctors/{id}/deactivate").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/doctors").hasRole("ADMIN")
                        .requestMatchers("/api/doctors/me").hasRole("DOCTOR")

                        // General Doctor-related endpoints requiring specific roles or authentication
                        .requestMatchers(HttpMethod.GET, "/api/doctors").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/doctors/{id}").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/doctors/{id}").hasAnyRole("DOCTOR", "ADMIN")

                        // Staff CRUD medical-service
                        .requestMatchers(HttpMethod.GET, "/api/medical-services/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/medical-services").hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/medical-services/**").hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/medical-services/**").hasAnyRole("STAFF", "ADMIN")

                        // Consultation endpoints
                        .requestMatchers("/api/consultations/**").authenticated()

                        // Lab Request endpoints
                        .requestMatchers("/api/lab-requests/**").authenticated()
                        .requestMatchers("/api/lab-result-messages/**").authenticated()

                        // Payment endpoints
                        .requestMatchers("/api/payments/**").authenticated()

                        // All other requests require authentication by default
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration
                .setAllowedHeaders(Arrays.asList("Authorization", "authorization", "Content-Type", "x-auth-token"));
        configuration.setExposedHeaders(Arrays.asList("x-auth-token"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
