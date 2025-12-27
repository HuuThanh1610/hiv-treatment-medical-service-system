package com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.exception.customexceptions.NotFoundException;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.dto.LabRequestDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.dto.LabRequestItemDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.dto.DoctorLabRequestDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.service.LabRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Transactional
public class LabRequestServiceImpl implements LabRequestService {

    private final LabRequestRepository labRequestRepository;
    private final LabRequestItemRepository labRequestItemRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientsRepository patientsRepository;
    private final DoctorRepository doctorRepository;
    private final LabTestTypeRepository labTestTypeRepository;
    private final UserRepository userRepository;

    @Override
    public LabRequestDTO create(LabRequestDTO dto) {
        // Validation cho DTO
        if (dto == null) {
            throw new IllegalArgumentException("LabRequestDTO cannot be null");
        }
        
        // Validation cho lab request độc lập (không cần appointment)
        Appointment appointment = null;
        if (dto.getAppointmentId() > 0) {
            // Nếu có appointment, kiểm tra tồn tại
            appointment = appointmentRepository.findById(dto.getAppointmentId())
                    .orElseThrow(() -> new NotFoundException("Appointment not found with id: " + dto.getAppointmentId()));
        }
        
        if (dto.getPatientId() <= 0) {
            throw new IllegalArgumentException("Patient ID must be positive");
        }
        
        // Kiểm tra bệnh nhân tồn tại
        Patients patient = patientsRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new NotFoundException("Patient not found with id: " + dto.getPatientId()));

        Doctor doctor = null;
        if (dto.getDoctorId() != null && dto.getDoctorId() > 0) {
            doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new NotFoundException("Doctor not found with id: " + dto.getDoctorId()));
        }

        LabRequest labRequest = LabRequest.builder()
                .patient(patient)
                .doctor(doctor)
                .requestDate(dto.getRequestDate() != null ? dto.getRequestDate() : LocalDateTime.now())
                .isUrgent(dto.isUrgent())
                .status(dto.getStatus() != null ? dto.getStatus() : "Pending")
                .build();
        
        // Set appointment nếu có
        if (appointment != null) {
            labRequest.setAppointment(appointment);
        }

        LabRequest saved = labRequestRepository.save(labRequest);

        // Xử lý các items nếu có, hoặc tạo item trống cho staff nhập nếu là request độc lập
        if (dto.getLabRequestItems() != null && !dto.getLabRequestItems().isEmpty()) {
            for (LabRequestItemDTO itemDTO : dto.getLabRequestItems()) {
                // Kiểm tra test type tồn tại
                LabTestType testType = labTestTypeRepository.findById(itemDTO.getTestTypeId())
                        .orElseThrow(() -> new NotFoundException("Lab test type not found with id: " + itemDTO.getTestTypeId()));

                LabRequestItem item = LabRequestItem.builder()
                        .labRequest(saved)
                        .testType(testType)
                        .notes(itemDTO.getNotes())
                        .build();

                labRequestItemRepository.save(item);
            }
        } else {
            // Nếu là tạo độc lập (không có appointment) và không có labRequestItems, tạo item trống
            if (dto.getAppointmentId() <= 0) {
                LabRequestItem item = LabRequestItem.builder()
                        .labRequest(saved)
                        .notes("")
                        .build();
                labRequestItemRepository.save(item);
            }
        }

        // Load lại LabRequest với items để trả về
        LabRequest labRequestWithItems = labRequestRepository.findByIdWithItems(saved.getId())
                .orElse(saved);

        return convertToDTO(labRequestWithItems);
    }

    @Override
    public LabRequestDTO getById(Integer id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Lab request ID must be positive");
        }
        
        LabRequest labRequest = labRequestRepository.findByIdWithItems(id)
                .orElseThrow(() -> new NotFoundException("Lab request not found with id: " + id));
        return convertToDTO(labRequest);
    }

    @Override
    public List<LabRequestDTO> getAll() {
        return labRequestRepository.findAllWithItems().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<LabRequestDTO> getByPatientId(Integer patientId) {
        if (patientId == null || patientId <= 0) {
            throw new IllegalArgumentException("Patient ID must be positive");
        }
        
        return labRequestRepository.findByPatientIdWithItems(patientId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<LabRequestDTO> getByDoctorId(Integer doctorId) {
        if (doctorId == null || doctorId <= 0) {
            throw new IllegalArgumentException("Doctor ID must be positive");
        }
        
        return labRequestRepository.findByDoctorIdWithItems(doctorId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<LabRequestDTO> getByAppointmentId(Integer appointmentId) {
        if (appointmentId == null || appointmentId <= 0) {
            throw new IllegalArgumentException("Appointment ID must be positive");
        }
        
        return labRequestRepository.findByAppointmentIdWithItems(appointmentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<LabRequestDTO> getByStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Status cannot be null or empty");
        }
        
        return labRequestRepository.findByStatusWithItems(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<LabRequestDTO> getUrgentRequests() {
        return labRequestRepository.findUrgentWithItems().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public LabRequestDTO update(Integer id, LabRequestDTO dto) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Lab request ID must be positive");
        }
        
        if (dto == null) {
            throw new IllegalArgumentException("LabRequestDTO cannot be null");
        }
        
        LabRequest existing = labRequestRepository.findByIdWithItems(id)
                .orElseThrow(() -> new NotFoundException("Lab request not found with id: " + id));

        if (dto.getRequestDate() != null) {
            existing.setRequestDate(dto.getRequestDate());
        }
        existing.setUrgent(dto.isUrgent());
        if (dto.getStatus() != null) {
            existing.setStatus(dto.getStatus());
        }

        LabRequest updated = labRequestRepository.save(existing);
        return convertToDTO(updated);
    }

    @Override
    public LabRequestDTO updateStatus(Integer id, String status) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Lab request ID must be positive");
        }
        
        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Status cannot be null or empty");
        }
        
        LabRequest existing = labRequestRepository.findByIdWithItems(id)
                .orElseThrow(() -> new NotFoundException("Lab request not found with id: " + id));
        
        existing.setStatus(status);
        LabRequest updated = labRequestRepository.save(existing);
        return convertToDTO(updated);
    }

    @Override
    public void delete(Integer id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Lab request ID must be positive");
        }
        
        if (!labRequestRepository.existsById(id)) {
            throw new NotFoundException("Lab request not found with id: " + id);
        }
        labRequestRepository.deleteById(id);
    }

    @Override
    public LabRequestItemDTO createItem(LabRequestItemDTO dto) {
        // Validation cho DTO
        if (dto == null) {
            throw new IllegalArgumentException("LabRequestItemDTO cannot be null");
        }
        
        if (dto.getLabRequestId() <= 0) {
            throw new IllegalArgumentException("Lab request ID must be positive");
        }
        
        if (dto.getTestTypeId() <= 0) {
            throw new IllegalArgumentException("Test type ID must be positive");
        }
        
        // Kiểm tra yêu cầu xét nghiệm tồn tại
        LabRequest labRequest = labRequestRepository.findById(dto.getLabRequestId())
                .orElseThrow(() -> new NotFoundException("Lab request not found with id: " + dto.getLabRequestId()));
        
        // Kiểm tra loại xét nghiệm tồn tại
        LabTestType testType = labTestTypeRepository.findById(dto.getTestTypeId())
                .orElseThrow(() -> new NotFoundException("Lab test type not found with id: " + dto.getTestTypeId()));

        LabRequestItem item = LabRequestItem.builder()
                .labRequest(labRequest)
                .testType(testType)
                .resultValue(dto.getResultValue())
                .resultDate(dto.getResultDate())
                .notes(dto.getNotes())
                .build();

        LabRequestItem saved = labRequestItemRepository.save(item);
        return convertToItemDTO(saved);
    }

    @Override
    public LabRequestItemDTO getItemById(Integer id) {
        if (id == null) {
            throw new IllegalArgumentException("Lab request item ID cannot be null");
        }
        
        LabRequestItem item = labRequestItemRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new NotFoundException("Lab request item not found with id: " + id));
        
        // Validation cho item
        if (item.getLabRequest() == null) {
            throw new IllegalStateException("LabRequestItem with ID " + id + " has null labRequest");
        }
        
        if (item.getTestType() == null) {
            throw new IllegalStateException("LabRequestItem with ID " + id + " has null testType");
        }
        
        // Debug logging
        System.out.println("Found LabRequestItem ID: " + item.getId());
        System.out.println("LabRequest ID: " + item.getLabRequest().getId());
        System.out.println("TestType ID: " + item.getTestType().getId());
        
        return convertToItemDTO(item);
    }

    @Override
    public List<LabRequestItemDTO> getItemsByLabRequestId(Integer labRequestId) {
        if (labRequestId == null) {
            throw new IllegalArgumentException("Lab request ID cannot be null");
        }
        
        try {
            return labRequestItemRepository.findByLabRequestIdWithTestType(labRequestId).stream()
                    .filter(item -> item != null) // Lọc bỏ các item null
                    .filter(item -> item.getLabRequest() != null && item.getTestType() != null) // Lọc bỏ các item có relation null
                    .map(this::convertToItemDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error getting lab request items for lab request ID: " + labRequestId);
            System.err.println("Error: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    public LabRequestItemDTO updateItem(Integer id, LabRequestItemDTO dto) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Item ID must be positive");
        }
        
        if (dto == null) {
            throw new IllegalArgumentException("LabRequestItemDTO cannot be null");
        }
        
        LabRequestItem existing = labRequestItemRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new NotFoundException("Lab request item not found with id: " + id));

        // Validation cho existing item
        if (existing.getLabRequest() == null) {
            throw new IllegalStateException("LabRequestItem with ID " + id + " has null labRequest");
        }
        
        if (existing.getTestType() == null) {
            throw new IllegalStateException("LabRequestItem with ID " + id + " has null testType");
        }

        if (dto.getResultValue() != null) {
            existing.setResultValue(dto.getResultValue());
        }
        if (dto.getResultDate() != null) {
            existing.setResultDate(dto.getResultDate());
        }
        if (dto.getNotes() != null) {
            existing.setNotes(dto.getNotes());
        }

        LabRequestItem updated = labRequestItemRepository.save(existing);
        return convertToItemDTO(updated);
    }

    @Override
    public void deleteItem(Integer id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Lab request item ID must be positive");
        }
        
        if (!labRequestItemRepository.existsById(id)) {
            throw new NotFoundException("Lab request item not found with id: " + id);
        }
        labRequestItemRepository.deleteById(id);
    }

    @Override
    public LabRequestDTO createDoctorLabRequest(DoctorLabRequestDTO dto) {
        // Validation cho DTO
        if (dto == null) {
            throw new IllegalArgumentException("DoctorLabRequestDTO cannot be null");
        }
        
        if (dto.getAppointmentId() == null || dto.getAppointmentId() <= 0) {
            throw new IllegalArgumentException("Appointment ID must be positive");
        }
        
        if (dto.getPatientId() == null || dto.getPatientId() <= 0) {
            throw new IllegalArgumentException("Patient ID must be positive");
        }
        
        if (dto.getDoctorId() == null || dto.getDoctorId() <= 0) {
            throw new IllegalArgumentException("Doctor ID must be positive");
        }
        
        if (dto.getTestTypeIds() == null || dto.getTestTypeIds().isEmpty()) {
            throw new IllegalArgumentException("Test type IDs cannot be null or empty");
        }
        
        // Kiểm tra lịch hẹn tồn tại
        Appointment appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new NotFoundException("Appointment not found with id: " + dto.getAppointmentId()));
        
        // Kiểm tra bệnh nhân tồn tại
        Patients patient = patientsRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new NotFoundException("Patient not found with id: " + dto.getPatientId()));
        
        // Kiểm tra bác sĩ tồn tại
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new NotFoundException("Doctor not found with id: " + dto.getDoctorId()));

        // Tạo yêu cầu xét nghiệm chính
        LabRequest labRequest = LabRequest.builder()
                .appointment(appointment)
                .patient(patient)
                .doctor(doctor)
                .requestDate(LocalDateTime.now())
                .isUrgent(dto.isUrgent())
                .status("Pending")
                .build();

        LabRequest savedLabRequest = labRequestRepository.save(labRequest);

        // Tạo các mục xét nghiệm cho từng loại xét nghiệm được chọn
        for (Integer testTypeId : dto.getTestTypeIds()) {
            if (testTypeId == null || testTypeId <= 0) {
                throw new IllegalArgumentException("Invalid test type ID: " + testTypeId);
            }
            
            LabTestType testType = labTestTypeRepository.findById(testTypeId)
                    .orElseThrow(() -> new NotFoundException("Lab test type not found with id: " + testTypeId));

            LabRequestItem item = LabRequestItem.builder()
                    .labRequest(savedLabRequest)
                    .testType(testType)
                    .notes(dto.getDoctorNotes())
                    .build();

            labRequestItemRepository.save(item);
        }

        // Load lại LabRequest với items để trả về
        LabRequest labRequestWithItems = labRequestRepository.findByIdWithItems(savedLabRequest.getId())
                .orElse(savedLabRequest);
        
        return convertToDTO(labRequestWithItems);
    }

    @Override
    public List<LabRequestDTO> getLabRequestsByDoctorId(Integer doctorId) {
        if (doctorId == null || doctorId <= 0) {
            throw new IllegalArgumentException("Doctor ID must be positive");
        }
        
        return labRequestRepository.findByDoctorIdWithItems(doctorId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private LabRequestDTO convertToDTO(LabRequest labRequest) {
        // Null check cho labRequest
        if (labRequest == null) {
            throw new IllegalArgumentException("LabRequest cannot be null");
        }
        
        // Debug logging
        System.out.println("Converting LabRequest ID: " + labRequest.getId());
        System.out.println("LabRequestItems size: " + (labRequest.getLabRequestItems() != null ? labRequest.getLabRequestItems().size() : "null"));
        
        // Xử lý labRequestItems an toàn
        List<LabRequestItemDTO> items = new ArrayList<>();
        if (labRequest.getLabRequestItems() != null && !labRequest.getLabRequestItems().isEmpty()) {
            try {
                items = labRequest.getLabRequestItems().stream()
                    .filter(item -> item != null) // Lọc bỏ các item null
                    .map(this::convertToItemDTO)
                    .collect(Collectors.toList());
            } catch (Exception e) {
                System.err.println("Error converting lab request items for lab request ID: " + labRequest.getId());
                System.err.println("Error: " + e.getMessage());
                // Trả về list rỗng nếu có lỗi
                items = new ArrayList<>();
            }
        }
        
        return LabRequestDTO.builder()
                .id(labRequest.getId())
                .appointmentId(labRequest.getAppointment() != null ? labRequest.getAppointment().getId() : 0)
                .patientId(labRequest.getPatient() != null ? labRequest.getPatient().getId() : 0)
                .doctorId(labRequest.getDoctor() != null ? labRequest.getDoctor().getId() : 0)
                .requestDate(labRequest.getRequestDate())
                .isUrgent(labRequest.isUrgent())
                .status(labRequest.getStatus())
                .createdAt(labRequest.getCreatedAt())
                .updatedAt(labRequest.getUpdatedAt())
                .patientName(labRequest.getPatient() != null && labRequest.getPatient().getUser() != null ? 
                    labRequest.getPatient().getUser().getFullName() : "Unknown")
                .doctorName(labRequest.getDoctor() != null && labRequest.getDoctor().getUser() != null ? 
                    labRequest.getDoctor().getUser().getFullName() : "Unknown")
                .appointmentDate(labRequest.getAppointment() != null && labRequest.getAppointment().getAppointmentDate() != null ? 
                    labRequest.getAppointment().getAppointmentDate().toString() : "Unknown")
                .labRequestItems(items)
                .build();
    }

    private LabRequestItemDTO convertToItemDTO(LabRequestItem item) {
        // Null check cho item
        if (item == null) {
            throw new IllegalArgumentException("LabRequestItem cannot be null");
        }
        
        // Null check cho labRequest
        if (item.getLabRequest() == null) {
            throw new IllegalArgumentException("LabRequestItem's labRequest cannot be null for item ID: " + item.getId());
        }
        
        // Null check cho testType
        if (item.getTestType() == null) {
            throw new IllegalArgumentException("LabRequestItem's testType cannot be null for item ID: " + item.getId());
        }
        
        return LabRequestItemDTO.builder()
                .id(item.getId())
                .labRequestId(item.getLabRequest().getId())
                .testTypeId(item.getTestType().getId())
                .resultValue(item.getResultValue())
                .resultDate(item.getResultDate())
                .notes(item.getNotes())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .testTypeName(item.getTestType().getName())
                .testTypeDescription(item.getTestType().getDescription())
                .testTypePrice(item.getTestType().getPrice())
                .build();
    }

    // Debug method để kiểm tra dữ liệu
    public void debugLabRequestData(Integer labRequestId) {
        if (labRequestId == null || labRequestId <= 0) {
            throw new IllegalArgumentException("Lab request ID must be positive");
        }
        
        System.out.println("=== DEBUG LAB REQUEST DATA ===");
        
        // Kiểm tra LabRequest
        LabRequest labRequest = labRequestRepository.findByIdWithItems(labRequestId).orElse(null);
        if (labRequest != null) {
            System.out.println("LabRequest ID: " + labRequest.getId());
            System.out.println("LabRequestItems count: " + (labRequest.getLabRequestItems() != null ? labRequest.getLabRequestItems().size() : "null"));
            
            if (labRequest.getLabRequestItems() != null) {
                labRequest.getLabRequestItems().forEach(item -> {
                    if (item != null) {
                        System.out.println("  - Item ID: " + item.getId());
                        if (item.getTestType() != null) {
                            System.out.println("    TestType ID: " + item.getTestType().getId());
                            System.out.println("    TestType Name: " + item.getTestType().getName());
                        } else {
                            System.out.println("    TestType: NULL");
                        }
                    } else {
                        System.out.println("  - Item: NULL");
                    }
                });
            }
        } else {
            System.out.println("LabRequest not found with ID: " + labRequestId);
        }
        
        // Kiểm tra LabRequestItems trực tiếp
        List<LabRequestItem> items = labRequestItemRepository.findByLabRequestId(labRequestId);
        System.out.println("Direct LabRequestItems count: " + items.size());
        items.forEach(item -> {
            if (item != null) {
                System.out.println("  - Direct Item ID: " + item.getId());
            } else {
                System.out.println("  - Direct Item: NULL");
            }
        });
        
        System.out.println("=== END DEBUG ===");
    }

    // Patient specific methods implementation
    @Override
    public List<LabRequestItemDTO> getMyLabResults(String patientEmail) {
        if (patientEmail == null || patientEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("Patient email cannot be null or empty");
        }
        
        // Tìm patient theo email
        User user = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new NotFoundException("User not found with email: " + patientEmail));
        
        Patients patient = patientsRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("Patient not found for user: " + patientEmail));
        
        // Lấy tất cả lab request items của patient này
        List<LabRequestItem> allItems = new ArrayList<>();
        List<LabRequest> labRequests = labRequestRepository.findByPatientIdWithItems(patient.getId());
        
        for (LabRequest labRequest : labRequests) {
            if (labRequest.getLabRequestItems() != null) {
                allItems.addAll(labRequest.getLabRequestItems());
            }
        }
        
        return allItems.stream()
                .filter(item -> item != null && item.getTestType() != null)
                .map(this::convertToItemDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<LabRequestItemDTO> getMyLabResultsByStatus(String patientEmail, String status) {
        if (patientEmail == null || patientEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("Patient email cannot be null or empty");
        }
        
        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Status cannot be null or empty");
        }
        
        // Tìm patient theo email
        User user = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new NotFoundException("User not found with email: " + patientEmail));
        
        Patients patient = patientsRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("Patient not found for user: " + patientEmail));
        
        // Lấy lab request items của patient này theo status
        List<LabRequestItem> allItems = new ArrayList<>();
        List<LabRequest> labRequests = labRequestRepository.findByPatientIdWithItems(patient.getId());
        
        for (LabRequest labRequest : labRequests) {
            if (labRequest.getLabRequestItems() != null && status.equals(labRequest.getStatus())) {
                allItems.addAll(labRequest.getLabRequestItems());
            }
        }
        
        return allItems.stream()
                .filter(item -> item != null && item.getTestType() != null)
                .map(this::convertToItemDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<LabRequestItemDTO> getMyLabResultsByDateRange(String patientEmail, String startDate, String endDate) {
        if (patientEmail == null || patientEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("Patient email cannot be null or empty");
        }
        
        if (startDate == null || startDate.trim().isEmpty()) {
            throw new IllegalArgumentException("Start date cannot be null or empty");
        }
        
        if (endDate == null || endDate.trim().isEmpty()) {
            throw new IllegalArgumentException("End date cannot be null or empty");
        }
        
        // Tìm patient theo email
        User user = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new NotFoundException("User not found with email: " + patientEmail));
        
        Patients patient = patientsRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("Patient not found for user: " + patientEmail));
        
        // Parse dates
        LocalDateTime startDateTime = LocalDateTime.parse(startDate);
        LocalDateTime endDateTime = LocalDateTime.parse(endDate);
        
        // Lấy lab request items của patient này theo khoảng thời gian
        List<LabRequestItem> allItems = new ArrayList<>();
        List<LabRequest> labRequests = labRequestRepository.findByPatientIdWithItems(patient.getId());
        
        for (LabRequest labRequest : labRequests) {
            if (labRequest.getLabRequestItems() != null) {
                allItems.addAll(labRequest.getLabRequestItems());
            }
        }
        
        return allItems.stream()
                .filter(item -> item != null && item.getTestType() != null && 
                               item.getResultDate() != null &&
                               !item.getResultDate().isBefore(startDateTime.toLocalDate()) && 
                               !item.getResultDate().isAfter(endDateTime.toLocalDate()))
                .map(this::convertToItemDTO)
                .collect(Collectors.toList());
    }

    @Override
    public LabRequestItemDTO getMyLabResultItem(String patientEmail, Integer itemId) {
        if (patientEmail == null || patientEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("Patient email cannot be null or empty");
        }
        
        if (itemId == null || itemId <= 0) {
            throw new IllegalArgumentException("Item ID must be positive");
        }
        
        // Tìm patient theo email
        User user = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new NotFoundException("User not found with email: " + patientEmail));
        
        Patients patient = patientsRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("Patient not found for user: " + patientEmail));
        
        // Lấy lab request item và kiểm tra xem có thuộc về patient này không
        LabRequestItem item = labRequestItemRepository.findByIdWithRelations(itemId)
                .orElseThrow(() -> new NotFoundException("Lab request item not found with id: " + itemId));
        
        // Kiểm tra xem item có thuộc về patient này không
        if (item.getLabRequest() == null || item.getLabRequest().getPatient() == null || 
            !item.getLabRequest().getPatient().getId().equals(patient.getId())) {
            throw new NotFoundException("Lab request item not found or access denied");
        }
        
        return convertToItemDTO(item);
    }
} 