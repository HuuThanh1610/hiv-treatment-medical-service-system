/**
 * JwtAuthenticationFilter.java - JWT Authentication Filter
 *
 * Chức năng:
 * - Intercept mọi HTTP request
 * - Extract JWT token từ Authorization header
 * - Validate token và set authentication context
 * - Skip authentication cho public endpoints
 * - Handle token expiration và invalid tokens
 */
package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.util.StringUtils;

// Services
import com.group7.hivcare.hivtreatmentmedicalservicesystem.auth.service.CustomUserDetailsService; // User details service
import com.group7.hivcare.hivtreatmentmedicalservicesystem.auth.service.JwtService;              // JWT utility service

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt)) {
                String email  = jwtService.extractEmail(jwt);
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (io.jsonwebtoken.ExpiredJwtException ex) {
            logger.warn("Token đã hết hạn", ex);
        } catch (io.jsonwebtoken.MalformedJwtException |
                 io.jsonwebtoken.UnsupportedJwtException |
                 IllegalArgumentException ex) {
            logger.warn("Token không hợp lệ", ex);
        } catch (Exception ex) {
            logger.error("Không thể xác thực người dùng trong security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/auth/");
    }
} 