package com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.config.VnPayConfig;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.dto.CreatePaymentDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.dto.PaymentDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.dto.UpdatePaymentDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.mapper.PaymentMapper;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.service.PaymentService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.AppointmentResponseDTO;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository paymentRepository;
    private final PatientsRepository patientsRepository;
    private final AppointmentRepository appointmentRepository;
    private final LabRequestRepository labRequestRepository;
    private final UserRepository userRepository;
    private final LabRequestItemRepository labRequestItemRepository;
    private final PaymentMapper paymentMapper;
    private final CashPaymentRepository cashPaymentRepository;
    private final VNPayPaymentRepository vnPayPaymentRepository;
    private final VnPayConfig vnPayConfig;

    @Override
    public List<PaymentDTO> getAllPayments() {
        List<Payment> payments = paymentRepository.findAll();
        return payments.stream().map(payment -> {
            VNPayPayment vnPayPayment = payment.getMethod().equals(PaymentMethod.VNPAY)
                    ? vnPayPaymentRepository.findByPaymentId(payment.getId()).orElse(null)
                    : null;
            CashPayment cashPayment = payment.getMethod().equals(PaymentMethod.CASH)
                    ? cashPaymentRepository.findByPaymentId(payment.getId()).orElse(null)
                    : null;
            return paymentMapper.toDTO(payment, vnPayPayment, cashPayment);
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PaymentDTO createCashPayment(CreatePaymentDTO dto) {
        if (!"CASH".equals(dto.getMethod())) {
            throw new IllegalStateException("Phương thức thanh toán không phải CASH");
        }
        if (dto.getStaffId() == null) {
            throw new IllegalStateException("ID nhân viên không được để trống cho thanh toán tiền mặt");
        }

        // Debug logging
        log.info("Creating cash payment - appointmentId: {}, patientId: {}, staffId: {}, labRequestId: {}", 
                dto.getAppointmentId(), dto.getPatientId(), dto.getStaffId(), dto.getLabRequestId());
        
        // Validate payment type - either appointment payment or lab payment
        boolean isAppointmentPayment = dto.getAppointmentId() != null;
        boolean isLabPayment = dto.getLabRequestId() != null;
        
        if (!isAppointmentPayment && !isLabPayment) {
            throw new IllegalStateException("Phải có ID lịch hẹn hoặc ID yêu cầu xét nghiệm");
        }
        
        if (isAppointmentPayment && isLabPayment) {
            throw new IllegalStateException("Không thể thanh toán cả lịch hẹn và xét nghiệm cùng lúc");
        }
        
        // Always validate patient ID
        if (dto.getPatientId() == null) {
            throw new IllegalStateException("ID bệnh nhân không được để trống");
        }

        Appointment appointment = null;
        LabRequest labRequest = null;
        
        if (isAppointmentPayment) {
            appointment = appointmentRepository.findById(dto.getAppointmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lịch hẹn với ID: " + dto.getAppointmentId()));
            
            // Kiểm tra trạng thái appointment - chỉ cho phép thanh toán khi đã check-in
            if (!"CHECKED_IN".equals(appointment.getStatus())) {
                throw new IllegalStateException("Chỉ có thể tạo thanh toán cho lịch hẹn đã check-in. Trạng thái hiện tại: " + appointment.getStatus());
            }
            
            // Check if appointment already has payment
            paymentRepository.findByAppointmentId(dto.getAppointmentId())
                    .ifPresent(existing -> {
                        throw new IllegalStateException("Lịch hẹn này đã có thanh toán");
                    });
        }
        
        if (isLabPayment) {
            labRequest = labRequestRepository.findById(dto.getLabRequestId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy yêu cầu xét nghiệm với ID: " + dto.getLabRequestId()));
            
            // Check if lab request already has payment
            paymentRepository.findByLabRequestId(dto.getLabRequestId())
                    .ifPresent(existing -> {
                        throw new IllegalStateException("Yêu cầu xét nghiệm này đã có thanh toán");
                    });
        }
        
        Patients patient = patientsRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bệnh nhân với ID: " + dto.getPatientId()));
        User staff = userRepository.findById(dto.getStaffId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy nhân viên với ID: " + dto.getStaffId()));

        Payment payment = paymentMapper.toEntity(dto);
        payment.setPatient(patient);
        if (appointment != null) {
            payment.setAppointment(appointment);
        }
        if (labRequest != null) {
            payment.setLabRequest(labRequest);
        }
        payment.setStatus(dto.getStatus() != null ? PaymentStatus.valueOf(dto.getStatus()) : PaymentStatus.PENDING);
        Payment savedPayment = paymentRepository.save(payment);

        CashPayment cashPayment = paymentMapper.toCashPaymentEntity(dto, savedPayment);
        cashPayment.setUser(staff);
        cashPaymentRepository.save(cashPayment);

        try {
//            sendPaymentNotification(savedPayment, "Thanh toán tiền mặt đã được tạo");
            log.info("Thanh toán tiền mặt đã được tạo");
        } catch (Exception e) {
            log.error("Không thể gửi thông báo thanh toán cho thanh toán {}: {}", savedPayment.getId(), e.getMessage());
        }

        return paymentMapper.toDTO(savedPayment, null, cashPayment);
    }

    @Override
    @Transactional
    public PaymentDTO createVNPayPayment(CreatePaymentDTO dto) {
        if (!"VNPAY".equals(dto.getMethod())) {
            throw new IllegalStateException("Phương thức thanh toán không phải VNPAY");
        }
        
        // Debug logging
        log.info("Creating VNPay payment - appointmentId: {}, patientId: {}, labRequestId: {}", 
                dto.getAppointmentId(), dto.getPatientId(), dto.getLabRequestId());
        
        // Validate payment type - either appointment payment or lab payment
        boolean isAppointmentPayment = dto.getAppointmentId() != null;
        boolean isLabPayment = dto.getLabRequestId() != null;
        
        if (!isAppointmentPayment && !isLabPayment) {
            throw new IllegalStateException("Phải có ID lịch hẹn hoặc ID yêu cầu xét nghiệm");
        }
        
        if (isAppointmentPayment && isLabPayment) {
            throw new IllegalStateException("Không thể thanh toán cả lịch hẹn và xét nghiệm cùng lúc");
        }
        
        // Always validate patient ID
        if (dto.getPatientId() == null) {
            throw new IllegalStateException("ID bệnh nhân không được để trống");
        }

        Appointment appointment = null;
        LabRequest labRequest = null;
        
        if (isAppointmentPayment) {
            appointment = appointmentRepository.findById(dto.getAppointmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lịch hẹn với ID: " + dto.getAppointmentId()));
            
            // Check if appointment already has payment
            paymentRepository.findByAppointmentId(dto.getAppointmentId())
                    .ifPresent(existing -> {
                        throw new IllegalStateException("Lịch hẹn này đã có thanh toán");
                    });
        }
        
        if (isLabPayment) {
            labRequest = labRequestRepository.findById(dto.getLabRequestId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy yêu cầu xét nghiệm với ID: " + dto.getLabRequestId()));
            
            // Check if lab request already has payment
            paymentRepository.findByLabRequestId(dto.getLabRequestId())
                    .ifPresent(existing -> {
                        throw new IllegalStateException("Yêu cầu xét nghiệm này đã có thanh toán");
                    });
        }

        Patients patient = patientsRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bệnh nhân với ID: " + dto.getPatientId()));

        Payment payment = paymentMapper.toEntity(dto);
        String transactionCode = dto.getTransactionCode() != null ? dto.getTransactionCode() : vnPayConfig.getRandomNumber(8);
        payment.setPatient(patient);
        payment.setTransactionCode(transactionCode);
        payment.setStatus(dto.getStatus() != null ? PaymentStatus.valueOf(dto.getStatus()) : PaymentStatus.PENDING);
        if (appointment != null) {
            payment.setAppointment(appointment);
        }
        if (labRequest != null) {
            payment.setLabRequest(labRequest);
        }
        Payment savedPayment = paymentRepository.save(payment);
        VNPayPayment vnPayPayment = paymentMapper.toVNPayPaymentEntity(dto, savedPayment);
        vnPayPaymentRepository.save(vnPayPayment);

        try {
           // sendPaymentNotification(savedPayment, "Thanh toán VNPay đã được khởi tạo");
            log.info("Thanh toán VNPay đã được khởi tạo");
        } catch (Exception e) {
            log.error("Không thể gửi thông báo thanh toán cho thanh toán {}: {}", savedPayment.getId(), e.getMessage());
        }

        return paymentMapper.toDTO(savedPayment, vnPayPayment, null);
    }

    @Override
    @Transactional
    public String createVNPayPaymentUrl(CreatePaymentDTO dto) {
        if (!"VNPAY".equals(dto.getMethod())) {
            throw new IllegalStateException("Phương thức thanh toán không phải VNPAY");
        }
        
        // Debug log
        log.info("Creating VNPay payment URL - appointmentId: {}, patientId: {}, labRequestId: {}", 
                dto.getAppointmentId(), dto.getPatientId(), dto.getLabRequestId());

        // Validate payment type - either appointment payment or lab payment
        boolean isAppointmentPayment = dto.getAppointmentId() != null;
        boolean isLabPayment = dto.getLabRequestId() != null;
        
        if (!isAppointmentPayment && !isLabPayment) {
            throw new IllegalStateException("Phải có ID lịch hẹn hoặc ID yêu cầu xét nghiệm");
        }
        
        if (isAppointmentPayment && isLabPayment) {
            throw new IllegalStateException("Không thể thanh toán cả lịch hẹn và xét nghiệm cùng lúc");
        }
        
        // Always validate patient ID
        if (dto.getPatientId() == null) {
            throw new IllegalStateException("ID bệnh nhân không được để trống");
        }
        
        // Kiểm tra bệnh nhân
        Patients patient = patientsRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bệnh nhân với ID: " + dto.getPatientId()));

        // Kiểm tra appointment hoặc labRequest
        Appointment appointment = null;
        LabRequest labRequest = null;
        
        if (isAppointmentPayment) {
            appointment = appointmentRepository.findById(dto.getAppointmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lịch hẹn với ID: " + dto.getAppointmentId()));
            
            // Kiểm tra thanh toán hiện có
            Optional<Payment> existingPaymentOpt = paymentRepository.findByAppointmentId(dto.getAppointmentId());
            if (existingPaymentOpt.isPresent()) {
                Payment existingPayment = existingPaymentOpt.get();
                log.info("Thanh toán hiện có cho lịch hẹn ID {}: phương thức={}, trạng thái={}", 
                        dto.getAppointmentId(), existingPayment.getMethod(), existingPayment.getStatus());
                
                // Chỉ cho phép cập nhật nếu thanh toán đang ở trạng thái PENDING và phương thức khác VNPAY
                if (existingPayment.getStatus() == PaymentStatus.PENDING && 
                    existingPayment.getMethod() != PaymentMethod.VNPAY) {
                    // Chuyển thanh toán sang VNPAY
                    log.info("Chuyển đổi thanh toán ID {} từ {} sang VNPAY", 
                            existingPayment.getId(), existingPayment.getMethod());
                    existingPayment.setMethod(PaymentMethod.VNPAY);
                    existingPayment = paymentRepository.save(existingPayment);
                    
                    // Sử dụng payment hiện có
                    appointment = existingPayment.getAppointment();
                    patient = existingPayment.getPatient();
                    dto.setAmount(existingPayment.getAmount());
                } else if (existingPayment.getStatus() == PaymentStatus.PENDING && 
                          existingPayment.getMethod() == PaymentMethod.VNPAY) {
                    // Nếu đã là VNPAY nhưng PENDING, cho phép tạo lại URL thanh toán
                    log.info("Tạo lại URL thanh toán cho payment ID {}", existingPayment.getId());
                    appointment = existingPayment.getAppointment();
                    patient = existingPayment.getPatient();
                    dto.setAmount(existingPayment.getAmount());
                } else {
                    // Không cho phép tạo thanh toán mới nếu trạng thái không phù hợp
                    throw new IllegalStateException("Lịch hẹn này đã có thanh toán với trạng thái " + 
                            existingPayment.getStatus() + " và phương thức " + existingPayment.getMethod());
                }
            }
        }
        
        if (isLabPayment) {
            labRequest = labRequestRepository.findById(dto.getLabRequestId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy yêu cầu xét nghiệm với ID: " + dto.getLabRequestId()));
            
            // Kiểm tra thanh toán hiện có
            Optional<Payment> existingPaymentOpt = paymentRepository.findByLabRequestId(dto.getLabRequestId());
            if (existingPaymentOpt.isPresent()) {
                Payment existingPayment = existingPaymentOpt.get();
                log.info("Thanh toán hiện có cho xét nghiệm ID {}: phương thức={}, trạng thái={}", 
                        dto.getLabRequestId(), existingPayment.getMethod(), existingPayment.getStatus());
                
                // Chỉ cho phép cập nhật nếu thanh toán đang ở trạng thái PENDING và phương thức khác VNPAY
                if (existingPayment.getStatus() == PaymentStatus.PENDING && 
                    existingPayment.getMethod() != PaymentMethod.VNPAY) {
                    // Chuyển thanh toán sang VNPAY
                    log.info("Chuyển đổi thanh toán ID {} từ {} sang VNPAY", 
                            existingPayment.getId(), existingPayment.getMethod());
                    existingPayment.setMethod(PaymentMethod.VNPAY);
                    existingPayment = paymentRepository.save(existingPayment);
                    
                    // Sử dụng payment hiện có
                    labRequest = existingPayment.getLabRequest();
                    patient = existingPayment.getPatient();
                    dto.setAmount(existingPayment.getAmount());
                } else if (existingPayment.getStatus() == PaymentStatus.PENDING && 
                          existingPayment.getMethod() == PaymentMethod.VNPAY) {
                    // Nếu đã là VNPAY nhưng PENDING, cho phép tạo lại URL thanh toán
                    log.info("Tạo lại URL thanh toán cho payment ID {}", existingPayment.getId());
                    labRequest = existingPayment.getLabRequest();
                    patient = existingPayment.getPatient();
                    dto.setAmount(existingPayment.getAmount());
                } else {
                    // Không cho phép tạo thanh toán mới nếu trạng thái không phù hợp
                    throw new IllegalStateException("Xét nghiệm này đã có thanh toán với trạng thái " + 
                            existingPayment.getStatus() + " và phương thức " + existingPayment.getMethod());
                }
            }
        }

        String transactionCode = VnPayConfig.getRandomNumber(8);
        String orderInfo = "Thanh toan lich hen " + transactionCode;
        String orderType = "other";
        long amount = dto.getAmount().multiply(new BigDecimal(100)).longValue(); // VNPay yêu cầu số tiền tính bằng VND * 100
        String ipAddr = VnPayConfig.getClientIp();
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String createDate = formatter.format(cld.getTime());

        // Thêm vnp_ExpireDate
        cld.add(Calendar.MINUTE, 15); // giới hạn thời gian thanh toán (15 phút)
        String vnpExpireDate = formatter.format(cld.getTime());

        Map<String, String> vnpParams = new TreeMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", VnPayConfig.vnp_TmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(amount));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", transactionCode);
        vnpParams.put("vnp_OrderInfo", orderInfo);
        vnpParams.put("vnp_OrderType", orderType);
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", VnPayConfig.vnp_ReturnUrl);
        vnpParams.put("vnp_IpAddr", ipAddr);
        vnpParams.put("vnp_CreateDate", createDate);
        vnpParams.put("vnp_ExpireDate", vnpExpireDate);

        // Add bankCode if provided
        if (dto.getBankCode() != null && !dto.getBankCode().isEmpty()) {
            vnpParams.put("vnp_BankCode", dto.getBankCode());
        }

        // Tạo chữ ký TRƯỚC KHI thêm vnp_SecureHash vào map
//        String secureHash = VnPayConfig.hashAllFields(vnpParams);
//        vnpParams.put("vnp_SecureHash", secureHash);


        List fieldNames = new ArrayList(vnpParams.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnpParams.get(fieldName);
            try{
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    //Build hash data
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                    //Build query
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }catch (UnsupportedEncodingException e) {
                return e.toString();
            }
        }
        String queryUrl = query.toString();
        String vnpSecureHash = VnPayConfig.hmacSHA512(VnPayConfig.secretKey, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnpSecureHash;
        String paymentUrl = VnPayConfig.vnp_PayUrl + "?" + queryUrl;
        // Debug logs
        log.info("=== VNPay URL Creation Debug ===");
        log.info("Transaction Code: {}", transactionCode);
        log.info("Amount: {}", amount);
        log.info("Secure Hash: {}", vnpSecureHash);

//        String queryString = VnPayHelper.buildQueryString(vnpParams);
//        String fullUrl = VnPayConfig.vnp_PayUrl + "?" + queryString;
        
        log.info("Final URL: {}", paymentUrl);
        log.info("=== End Debug ===");

        // Biến để lưu payment
        Payment savedPayment;
        
        // Kiểm tra xem đã có payment hiện có chưa
        Optional<Payment> existingPayment = Optional.empty();
        if (appointment != null) {
            existingPayment = paymentRepository.findByAppointmentId(appointment.getId());
        } else if (labRequest != null) {
            existingPayment = paymentRepository.findByLabRequestId(labRequest.getId());
        }
        
        if (existingPayment.isPresent() && existingPayment.get().getStatus() == PaymentStatus.PENDING) {
            // Nếu có payment hiện có và đang PENDING, cập nhật nó
            Payment payment = existingPayment.get();
            payment.setTransactionCode(transactionCode);
            payment.setMethod(PaymentMethod.VNPAY);
            // Chỉ lưu các thông tin cập nhật
            savedPayment = paymentRepository.save(payment);
            log.info("Đã cập nhật payment hiện có ID: {}", savedPayment.getId());
            
            // Kiểm tra xem payment này đã có VNPayPayment chưa
            Optional<VNPayPayment> existingVnp = vnPayPaymentRepository.findByPaymentId(savedPayment.getId());
            if (existingVnp.isPresent()) {
                // Cập nhật VNPayPayment hiện có
                VNPayPayment vnp = existingVnp.get();
                vnp.setVnpBankCode(dto.getBankCode());
                vnPayPaymentRepository.save(vnp);
                log.info("Đã cập nhật VNPayPayment hiện có");
            } else {
                // Tạo mới VNPayPayment
                VNPayPayment vnPayPayment = paymentMapper.toVNPayPaymentEntity(dto, savedPayment);
                vnPayPaymentRepository.save(vnPayPayment);
                log.info("Đã tạo VNPayPayment mới cho payment hiện có");
            }
        } else {
            // Tạo mới payment nếu chưa có hoặc không ở trạng thái PENDING
            Payment payment = paymentMapper.toEntity(dto);
            payment.setPatient(patient);
            payment.setTransactionCode(transactionCode);
            payment.setStatus(dto.getStatus() != null ? PaymentStatus.valueOf(dto.getStatus()) : PaymentStatus.PENDING);
            
            // Set appointment hoặc labRequest
            if (appointment != null) {
                payment.setAppointment(appointment);
            }
            if (labRequest != null) {
                payment.setLabRequest(labRequest);
            }
            
            savedPayment = paymentRepository.save(payment);
            log.info("Đã tạo payment mới ID: {}", savedPayment.getId());
            
            // Tạo VNPayPayment mới
            VNPayPayment vnPayPayment = paymentMapper.toVNPayPaymentEntity(dto, savedPayment);
            vnPayPaymentRepository.save(vnPayPayment);
            log.info("Đã tạo VNPayPayment mới");
        }

        try {
//            sendPaymentNotification(savedPayment, "Thanh toán VNPay đã được khởi tạo");
            log.info("Thanh toán VNPay đã được khởi tạo");
        } catch (Exception e) {
            log.error("Không thể gửi thông báo thanh toán cho thanh toán {}: {}", savedPayment.getId(), e.getMessage());
        }

        return paymentUrl;
    }

    @Override
    @Transactional
    public PaymentDTO updatePayment(Integer paymentId, UpdatePaymentDTO dto) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thanh toán với ID: " + paymentId));

        Payment updatedPayment = paymentMapper.updateEntity(dto, payment);
        paymentRepository.save(updatedPayment);

        VNPayPayment vnPayPayment = null;
        CashPayment cashPayment = null;

        if (payment.getMethod().equals(PaymentMethod.VNPAY)) {
            vnPayPayment = vnPayPaymentRepository.findByPaymentId(paymentId)
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin VNPay cho thanh toán này"));
            vnPayPayment = paymentMapper.updateVNPayPaymentEntity(dto, vnPayPayment);
            vnPayPaymentRepository.save(vnPayPayment);
        } else if (payment.getMethod().equals(PaymentMethod.CASH)) {
            cashPayment = cashPaymentRepository.findByPaymentId(paymentId)
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin tiền mặt cho thanh toán này"));
            if (dto.getStaffId() != null) {
                User staff = userRepository.findById(dto.getStaffId())
                        .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy nhân viên với ID: " + dto.getStaffId()));
                cashPayment.setUser(staff);
            }
            cashPayment = paymentMapper.updateCashPaymentEntity(dto, cashPayment);
            cashPaymentRepository.save(cashPayment);
        }

        try {
//            sendPaymentNotification(updatedPayment, "Trạng thái thanh toán đã được cập nhật thành " + dto.getStatus());
            log.info("Trạng thái thanh toán đã được cập nhật thành");
        } catch (Exception e) {
            log.error("Không thể gửi thông báo cập nhật trạng thái thanh toán cho thanh toán {}: {}", updatedPayment.getId(), e.getMessage());
        }

        return paymentMapper.toDTO(updatedPayment, vnPayPayment, cashPayment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentDTO getPaymentById(Integer id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thanh toán với ID: " + id));

        VNPayPayment vnPayPayment = null;
        CashPayment cashPayment = null;

        if (payment.getMethod().equals(PaymentMethod.VNPAY)) {
            vnPayPayment = vnPayPaymentRepository.findByPaymentId(id)
                    .orElse(null);
        } else if (payment.getMethod().equals(PaymentMethod.CASH)) {
            cashPayment = cashPaymentRepository.findByPaymentId(id)
                    .orElse(null);
        }

        return paymentMapper.toDTO(payment, vnPayPayment, cashPayment);
    }

    @Transactional(readOnly = true)
    public List<PaymentDTO> getPaymentsByPatientId(Integer patientId) {
        patientsRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bệnh nhân với ID: " + patientId));

        List<Payment> payments = paymentRepository.findByPatientId(patientId);
        return payments.stream().map(payment -> {
            VNPayPayment vnPayPayment = payment.getMethod().equals(PaymentMethod.VNPAY)
                    ? vnPayPaymentRepository.findByPaymentId(payment.getId()).orElse(null)
                    : null;
            CashPayment cashPayment = payment.getMethod().equals(PaymentMethod.CASH)
                    ? cashPaymentRepository.findByPaymentId(payment.getId()).orElse(null)
                    : null;
            return paymentMapper.toDTO(payment, vnPayPayment, cashPayment);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentDTO getPatientPaymentById(Integer id, Integer patientId) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thanh toán với ID: " + id));

        if (!payment.getPatient().getId().equals(patientId)) {
            throw new IllegalStateException("Bạn không có quyền truy cập thanh toán này");
        }

        VNPayPayment vnPayPayment = null;
        CashPayment cashPayment = null;

        if (payment.getMethod().equals(PaymentMethod.VNPAY)) {
            vnPayPayment = vnPayPaymentRepository.findByPaymentId(id)
                    .orElse(null);
        } else if (payment.getMethod().equals(PaymentMethod.CASH)) {
            cashPayment = cashPaymentRepository.findByPaymentId(id)
                    .orElse(null);
        }

        return paymentMapper.toDTO(payment, vnPayPayment, cashPayment);
    }

    @Override
    @Transactional
    public PaymentDTO handleVNPayReturn(Map<String, String> vnpParams) {
        log.info("VNPay callback parameters: {}", vnpParams);

        String vnpSecureHash = vnpParams.remove("vnp_SecureHash");
        String transactionCode = vnpParams.get("vnp_TxnRef");
        String responseCode = vnpParams.get("vnp_ResponseCode");

        if (vnpSecureHash == null || transactionCode == null || responseCode == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu tham số bắt buộc");
        }

        List fieldNames = new ArrayList(vnpParams.keySet());
        Collections.sort(fieldNames); // Sắp xếp lại danh sách các tên tham số theo thứ tự bảng chữ cái (yêu cầu của VNPay khi tạo chuỗi để ký hash).
        StringBuilder hashData = new StringBuilder(); //Dùng để tạo lại chữ ký HMAC SHA512.
        StringBuilder query = new StringBuilder(); //Có thể dùng để debug hoặc log URL truy vấn.
        Iterator itr = fieldNames.iterator(); //để lặp qua từng tên tham số đã sắp xếp.
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnpParams.get(fieldName);
            try{
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    //Build hash data
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                    //Build query
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }catch (UnsupportedEncodingException e) {
                log.info(e.getMessage());
            }
        }
        String vnpSecureHashNew = VnPayConfig.hmacSHA512(VnPayConfig.secretKey, hashData.toString());

        if (!vnpSecureHash.equalsIgnoreCase(vnpSecureHashNew)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chữ ký không hợp lệ");
        }

        // Fetch payment
        Payment payment = paymentRepository.findByTransactionCode(transactionCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy thanh toán với mã giao dịch: " + transactionCode));

        // Prepare update DTO
        UpdatePaymentDTO updateDTO = UpdatePaymentDTO.builder()
                .status("00".equals(responseCode) ? PaymentStatus.PAID : PaymentStatus.FAILED)
                .gatewayResponse(filterSensitiveParams(new HashMap<>(vnpParams)).toString())
                .vnpBankCode(vnpParams.get("vnp_BankCode"))
                .vnpCardType(vnpParams.get("vnp_CardType"))
                .build();

        // Parse vnp_PayDate
        String vnpPayDate = vnpParams.get("vnp_PayDate");
        if (vnpPayDate != null && !vnpPayDate.isEmpty()) {
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
                updateDTO.setVnpPayDate(LocalDateTime.parse(vnpPayDate, formatter));
            } catch (DateTimeParseException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Định dạng vnp_PayDate không hợp lệ");
            }
        }

        // Save & return updated DTO
        return updatePayment(payment.getId(), updateDTO);
    }

    private Map<String, String> filterSensitiveParams(Map<String, String> params) {
        params.remove("vnp_CardNumber");
        return params;
    }

    @Override
    public List<AppointmentResponseDTO> getEligibleAppointmentsForPayment() {
        // Lấy appointments có status = "CHECKED_IN" và chưa có payment
        List<Appointment> appointments = appointmentRepository.findAll().stream()
                .filter(appointment -> "CHECKED_IN".equals(appointment.getStatus()))
                .filter(appointment -> paymentRepository.findByAppointmentId(appointment.getId()).isEmpty())
                .collect(Collectors.toList());
        
        return appointments.stream()
                .map(this::mapToAppointmentResponseDTO)
                .collect(Collectors.toList());
    }

    private AppointmentResponseDTO mapToAppointmentResponseDTO(Appointment appointment) {
        AppointmentResponseDTO dto = new AppointmentResponseDTO();
        dto.setId(appointment.getId());
        dto.setPatientId(appointment.getPatient().getId());
        if (Boolean.TRUE.equals(appointment.getPatient().getUser().getAnonymous())) {
            dto.setPatientName("Bệnh nhân Ẩn danh");
        } else {
            dto.setPatientName(appointment.getPatient().getUser().getFullName());
        }
        dto.setDoctorId(appointment.getDoctor().getId());
        dto.setDoctorName(appointment.getDoctor().getUser().getFullName());
        dto.setMedicalServiceId(appointment.getMedicalService().getId());
        dto.setMedicalServiceName(appointment.getMedicalService().getName());
        dto.setMedicalServicePrice(appointment.getMedicalService().getPrice());
        dto.setAppointmentDate(appointment.getAppointmentDate());
        dto.setAppointmentTime(appointment.getAppointmentTime());
        
        // Convert String status to AppointmentStatus enum
        try {
            dto.setStatus(AppointmentStatus.valueOf(appointment.getStatus()));
        } catch (Exception e) {
            // Fallback if status is not a valid enum value
            dto.setStatus(null);
        }
        
        dto.setNotes(appointment.getNotes());
        dto.setCreatedAt(appointment.getCreatedAt().atZone(ZoneId.systemDefault()));
        dto.setUpdatedAt(appointment.getUpdatedAt().atZone(ZoneId.systemDefault()));
        
        // Bác sĩ thay thế nếu có
        if (appointment.getSubstituteDoctor() != null) {
            dto.setSubstituteDoctorId(appointment.getSubstituteDoctor().getId());
            dto.setSubstituteDoctorName(appointment.getSubstituteDoctor().getUser().getFullName());
        }
        
        return dto;
    }

//    @Override
//    public void sendPaymentNotification(Payment payment, String message) {
//        Appointment appointment = payment.getAppointment();
//        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
//        String formattedDate = payment.getPaymentDate() != null ? payment.getPaymentDate().format(dateFormatter) : "";
//
//        emailNotificationService.sendPaymentNotification(
//                payment.getPatient().getUser().getEmail(),
//                payment.getPatient().getUser().getFullName(),
//                appointment.getDoctor().getUser().getFullName(),
//                formattedDate,
//                payment.getAmount().toString(),
//                payment.getMethod().name(),
//                message
//        );
//    }

    @Override
    @Transactional
    public PaymentDTO createAutoPaymentForCheckedInAppointment(Integer appointmentId) {
        try {
            log.info("Tự động tạo payment cho appointment ID: {}", appointmentId);
            
            // Tìm appointment
            Appointment appointment = appointmentRepository.findById(appointmentId)
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lịch hẹn với ID: " + appointmentId));
            
            // Kiểm tra trạng thái appointment - phải là CHECKED_IN
            if (!"CHECKED_IN".equals(appointment.getStatus())) {
                throw new IllegalStateException("Chỉ có thể tạo thanh toán tự động cho lịch hẹn đã check-in. Trạng thái hiện tại: " + appointment.getStatus());
            }
            
            // Kiểm tra xem appointment đã có payment chưa
            Optional<Payment> existingPayment = paymentRepository.findByAppointmentId(appointmentId);
            if (existingPayment.isPresent()) {
                log.warn("Appointment ID {} đã có payment, không tạo payment mới", appointmentId);
                return paymentMapper.toDTO(existingPayment.get(), null, null);
            }
            
            // Tạo payment tự động với trạng thái PENDING
            Payment payment = new Payment();
            payment.setAppointment(appointment);
            payment.setPatient(appointment.getPatient());
            payment.setAmount(BigDecimal.valueOf(appointment.getMedicalService().getPrice()));
            payment.setStatus(PaymentStatus.PENDING); // Trạng thái chờ thanh toán
            payment.setMethod(PaymentMethod.CASH); // Mặc định là thanh toán tiền mặt
            payment.setPaymentDate(LocalDateTime.now());
            payment.setNotes("Thanh toán được tạo tự động sau khi bệnh nhân check-in");
            
            Payment savedPayment = paymentRepository.save(payment);
            
            log.info("Đã tạo thành công payment ID {} cho appointment ID {}", savedPayment.getId(), appointmentId);
            
            return paymentMapper.toDTO(savedPayment, null, null);
            
        } catch (Exception e) {
            log.error("Lỗi khi tạo payment tự động cho appointment ID {}: {}", appointmentId, e.getMessage(), e);
            throw e;
        }
    }
}