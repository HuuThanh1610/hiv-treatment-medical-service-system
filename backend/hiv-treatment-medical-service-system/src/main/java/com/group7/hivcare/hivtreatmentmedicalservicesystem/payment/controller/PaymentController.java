package com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Payment;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.User;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Patients;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.PaymentRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.config.VnPayConfig;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.dto.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.mapper.PaymentMapper;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.service.PaymentService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PaymentMethod;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PaymentStatus;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.AppointmentResponseDTO;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.PatientsRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
    private final PaymentService paymentService;
    private final PatientsRepository patientsRepository;
    private final UserRepository userRepository;
    private final VnPayConfig vnPayConfig;
    private final PaymentRepository paymentRepository;

    // ==================== STAFF APIs ====================

    // STAFF: Lấy tất cả payments
    @GetMapping
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<List<PaymentDTO>> getAllPayments() {
        List<PaymentDTO> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(payments);
    }

    // STAFF: Lấy danh sách appointments đã check-in (chưa có payment)
    @GetMapping("/eligible-appointments")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<List<AppointmentResponseDTO>> getEligibleAppointmentsForPayment() {
        List<AppointmentResponseDTO> appointments = paymentService.getEligibleAppointmentsForPayment();
        return ResponseEntity.ok(appointments);
    }

    // GENERAL: Tạo thanh toán (tự động phân biệt CASH/VNPAY)
    @PostMapping
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN') or hasRole('PATIENT')")
    public ResponseEntity<PaymentDTO> createPayment(@Valid @RequestBody CreatePaymentDTO dto, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));
        
        // Debug log để xem method value
        log.info("Payment method received: {} (type: {})", dto.getMethod(), dto.getMethod() != null ? dto.getMethod().getClass().getSimpleName() : "null");
        
        // Nếu là CASH payment, yêu cầu STAFF role
        if ("CASH".equals(dto.getMethod())) {
            // Kiểm tra role STAFF
            String roleName = user.getRole().getName();
            if (!"STAFF".equals(roleName) && !"ADMIN".equals(roleName)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ staff mới có thể tạo thanh toán tiền mặt");
            }
            dto.setStaffId(user.getId());
            return ResponseEntity.ok(paymentService.createCashPayment(dto));
        } else if ("VNPAY".equals(dto.getMethod()) || "ONLINE".equals(dto.getMethod())) {
            // VNPay payment cho PATIENT hoặc STAFF (support cả VNPAY và ONLINE từ frontend)
            if ("ONLINE".equals(dto.getMethod())) {
                // Convert ONLINE thành VNPAY cho consistency
                dto.setMethod("VNPAY");
            }
            
            // Phân biệt xử lý theo role
            String roleName = user.getRole().getName();
            log.info("Creating VNPay payment by role: {}", roleName);
            
            if ("PATIENT".equals(roleName)) {
                // Nếu là PATIENT, tìm patient ID từ user ID
                Patients patient = patientsRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin bệnh nhân cho user: " + user.getEmail()));
                
                log.info("Found patient ID: {} for patient user ID: {}", patient.getId(), user.getId());
                dto.setPatientId(patient.getId()); // Set patient ID cho bệnh nhân
            } else if ("STAFF".equals(roleName) || "ADMIN".equals(roleName)) {
                // Nếu là STAFF hoặc ADMIN, patientId phải được gửi từ frontend
                if (dto.getPatientId() == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                        "ID bệnh nhân không được để trống khi staff/admin tạo thanh toán online");
                }
                
                // Kiểm tra patient có tồn tại không
                log.info("Staff/Admin creating VNPay payment for patient ID: {}", dto.getPatientId());
                patientsRepository.findById(dto.getPatientId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bệnh nhân với ID: " + dto.getPatientId()));
            } else {
                // Role không được phép
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                    "Không có quyền tạo thanh toán với role: " + roleName);
            }
            
            return ResponseEntity.ok(paymentService.createVNPayPayment(dto));
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phương thức thanh toán không được hỗ trợ: " + dto.getMethod());
        }
    }

    //STAFF: Tạo thanh toán mới (legacy endpoint)
    @PostMapping("/cash")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<PaymentDTO> createCashPayment(@Valid @RequestBody CreatePaymentDTO dto, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));
        dto.setStaffId(user.getId());
        return ResponseEntity.ok(paymentService.createCashPayment(dto));
    }

    @GetMapping("/vnpay/return")
    public ResponseEntity<String> handleVNPayReturn(@RequestParam Map<String, String> vnpParams, HttpServletRequest request) {
        try {
            PaymentDTO updatedPayment = paymentService.handleVNPayReturn(vnpParams);
            
            // Tạo URL redirect về frontend với thông tin thanh toán
            String frontendUrl = "http://localhost:5173/profile";
            String redirectUrl = frontendUrl + 
                "?paymentSuccess=true" +
                "&paymentId=" + updatedPayment.getId() +
                "&amount=" + updatedPayment.getAmount() +
                "&transactionCode=" + updatedPayment.getTransactionCode() +
                "&method=" + updatedPayment.getMethod() +
                "&status=" + updatedPayment.getStatus();
            
            if (updatedPayment.getAppointmentId() != null) {
                redirectUrl += "&appointmentId=" + updatedPayment.getAppointmentId();
            }
            
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", redirectUrl)
                    .body("Redirecting to frontend...");
                    
        } catch (Exception e) {
            // Nếu có lỗi, redirect về frontend với thông báo lỗi
            String frontendUrl = "http://localhost:5173/profile?paymentSuccess=false&error=" + e.getMessage();
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", frontendUrl)
                    .body("Payment failed, redirecting...");
        }
    }

//    @GetMapping("/vnpay/return")
//    public ResponseEntity<PaymentDTO> handleVNPayReturn(@RequestParam Map<String, String> vnpParams) {
//        String vnp_SecureHash = vnpParams.get("vnp_SecureHash");
//        vnpParams.remove("vnp_SecureHashType");
//        vnpParams.remove("vnp_SecureHash");
//
//        String signValue = vnPayConfig.hashAllFields(vnpParams);
//        if (!signValue.equals(vnp_SecureHash)) {
//            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chữ ký không hợp lệ");
//        }
//        // Validate VNPay response (e.g., check secure hash)
//        // Update payment status based on vnp_ResponseCode
//        String paymentId = vnpParams.get("vnp_TxnRef");
//        String responseCode = vnpParams.get("vnp_ResponseCode");
//        UpdatePaymentDTO updateDTO = new UpdatePaymentDTO();
//        updateDTO.setStatus(responseCode.equals("00") ? PaymentStatus.PAID : PaymentStatus.FAILED);
//        updateDTO.setGatewayResponse(vnpParams.toString());
//        updateDTO.setVnpBankCode(vnpParams.get("vnp_BankCode"));
//        updateDTO.setVnpCardType(vnpParams.get("vnp_CardType"));
//        // Parse vnp_PayDate if provided
//        // Update payment
//        PaymentDTO updatedPayment = paymentService.updatePayment(Integer.parseInt(paymentId), updateDTO);
//        return ResponseEntity.ok(updatedPayment);
//    }

    /**
     * Lấy thông tin chi tiết của một thanh toán theo ID.
     * @param id ID của thanh toán.
     * @return DTO của thanh toán.
     * @throws EntityNotFoundException Nếu không tìm thấy thanh toán.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<PaymentDTO> getPaymentById(@PathVariable Integer id) {
        PaymentDTO payment = paymentService.getPaymentById(id);
        if (payment == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(payment);
    }

    /**
     * Cập nhật trạng thái thanh toán.
     * @param id ID của thanh toán.
     * @param status Trạng thái mới (PENDING, PAID, FAILED, REFUNDED).
     * @param authentication Thông tin xác thực của người dùng.
     * @return Thông báo thành công.
     * @throws EntityNotFoundException Nếu không tìm thấy thanh toán.
     * @throws IllegalArgumentException Nếu trạng thái không hợp lệ.
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<String> updatePaymentStatus(
            @PathVariable Integer id,
            @RequestParam String status,
            Authentication authentication) {
        try {
            PaymentStatus paymentStatus = PaymentStatus.valueOf(status.toUpperCase());
            UpdatePaymentDTO updateDTO = new UpdatePaymentDTO();
            updateDTO.setStatus(paymentStatus);
            paymentService.updatePayment(id, updateDTO);
            return ResponseEntity.ok("Cập nhật trạng thái thanh toán thành công: " + paymentStatus);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Trạng thái thanh toán không hợp lệ: " + status);
        }
    }

    // ...existing code...

    /**
     * STAFF: Cập nhật thông tin thanh toán (method, notes, status...)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<PaymentDTO> updatePayment(@PathVariable Integer id, @RequestBody UpdatePaymentDTO dto) {
        PaymentDTO updated = paymentService.updatePayment(id, dto);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    // ==================== PATIENT APIs ====================

    @PostMapping("/vnpay")
    @PreAuthorize("hasRole('PATIENT') or hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<String> createVNPayPayment(@Valid @RequestBody CreatePaymentDTO dto, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));
        
        String roleName = user.getRole().getName();
        log.info("Creating VNPay payment URL for role: {}, patientId from dto: {}", roleName, dto.getPatientId());
        
        if ("PATIENT".equals(roleName)) {
            // Nếu là PATIENT và không có sẵn patientId, tìm từ user ID
            if (dto.getPatientId() == null) {
                Patients patient = patientsRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin bệnh nhân cho user: " + user.getEmail()));
                
                log.info("Found patient ID: {} for patient user ID: {}", patient.getId(), user.getId());
                dto.setPatientId(patient.getId()); // Set patient ID cho bệnh nhân
            }
        } else if (dto.getPatientId() == null) {
            // Nếu là STAFF/ADMIN mà không cung cấp patient ID
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "ID bệnh nhân không được để trống khi staff/admin tạo thanh toán online");
        }
        
        // Log để kiểm tra
        log.info("Processing VNPay payment with patientId: {}, appointmentId: {}, labRequestId: {}", 
                dto.getPatientId(), dto.getAppointmentId(), dto.getLabRequestId());
        
        return ResponseEntity.ok(paymentService.createVNPayPaymentUrl(dto));
    }

    /**
     * PATIENT: Lấy danh sách thanh toán của mình
     */
    @GetMapping("/patient/my-payments")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<PaymentDTO>> getMyPayments( @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));
        
        // Tìm Patient entity bằng User ID
        Patients patient = patientsRepository.findByUserId(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin bệnh nhân"));
        
        return ResponseEntity.ok(paymentService.getPaymentsByPatientId(patient.getId()));
    }

    /**
     * PATIENT: Lấy thông tin thanh toán của mình theo ID
     */
    @GetMapping("/patient/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PaymentDTO> getMyPaymentById(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));
        
        // Tìm Patient entity bằng User ID
        Patients patient = patientsRepository.findByUserId(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin bệnh nhân"));

        PaymentDTO payment = paymentService.getPatientPaymentById(id, patient.getId());
        
        if (payment == null || !patient.getId().equals(payment.getPatientId())) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(payment);
    }

} 