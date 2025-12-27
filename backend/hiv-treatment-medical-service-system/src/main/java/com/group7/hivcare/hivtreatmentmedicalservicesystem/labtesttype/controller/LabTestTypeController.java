package com.group7.hivcare.hivtreatmentmedicalservicesystem.labtesttype.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.labtesttype.dto.LabTestTypeDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.labtesttype.service.LabTestTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller xử lý các API liên quan đến Loại xét nghiệm (LabTestType).
 * Chỉ ADMIN được phép tạo, cập nhật, xóa.
 * STAFF chỉ được phép xem.
 */
@RestController
@RequestMapping("/api/lab-test-types")
@RequiredArgsConstructor
public class LabTestTypeController {

    private final LabTestTypeService service;

    /**
     * API tạo mới loại xét nghiệm.
     * Chỉ ADMIN và STAFF được phép tạo.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')" )
    public ResponseEntity<LabTestTypeDTO> create(@RequestBody LabTestTypeDTO dto) {
        LabTestTypeDTO created = service.create(dto);
        return ResponseEntity.ok(created);
    }

    /**
     * API lấy danh sách tất cả loại xét nghiệm.
     * ADMIN, STAFF, DOCTOR và PATIENT đều được phép xem.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('DOCTOR') or hasRole('PATIENT')")
    public ResponseEntity<List<LabTestTypeDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    /**
     * API lấy loại xét nghiệm theo ID.
     * ADMIN và STAFF đều được phép xem.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('DOCTOR')")
    public ResponseEntity<LabTestTypeDTO> getById(@PathVariable Integer id) {
        LabTestTypeDTO dto = service.getById(id);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dto);
    }

    /**
     * API cập nhật loại xét nghiệm.
     * Chỉ ADMIN và STAFF được phép cập nhật.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<LabTestTypeDTO> update(@PathVariable Integer id, @RequestBody LabTestTypeDTO dto) {
        LabTestTypeDTO updated = service.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * API xóa loại xét nghiệm.
     * Chỉ ADMIN và STAFF được phép xóa.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * API cập nhật giá loại xét nghiệm.
     * ADMIN và STAFF đều được phép cập nhật giá.
     */
    @PatchMapping("/{id}/price")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<LabTestTypeDTO> updatePrice(@PathVariable Integer id, @RequestParam double price) {
        LabTestTypeDTO updated = service.updatePrice(id, price);
        return ResponseEntity.ok(updated);
    }
}
