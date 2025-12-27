package com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocol.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocol.dto.ARVProtocolDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocol.dto.CreateARVProtocolDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocol.dto.UpdateARVProtocolDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocol.service.ARVProtocolService;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.dto.ARVProtocolRequestDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.service.ARVProtocolMedicationService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.ARVProtocol;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/arv-protocol")
@PreAuthorize("isAuthenticated()")
public class ARVProtocolController {
    @Autowired
    private ARVProtocolService arvProtocolService;

    @Autowired
    private ARVProtocolMedicationService arvProtocolMedicationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<List<ARVProtocolDTO>> getAllARVProtocols() {
        return ResponseEntity.ok(arvProtocolService.getAllARVProtocols());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ARVProtocolDTO> getARVProtocolById(@PathVariable Integer id) {
        return ResponseEntity.ok(arvProtocolService.getARVProtocol(id));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    public ResponseEntity<List<ARVProtocolDTO>> getAllARVProtocolsIsActive() {
        return ResponseEntity.ok(arvProtocolService.getAllARVProtocolsIsActive());
    }

    @GetMapping("/active/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    public ResponseEntity<ARVProtocolDTO> getARVProtocolByIdIsActive(@PathVariable Integer id) {
        return ResponseEntity.ok(arvProtocolService.getARVProtocolIsActive(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ARVProtocolDTO> createARVProtocol(@RequestBody ARVProtocolRequestDTO dto) {
        ARVProtocolDTO created = arvProtocolMedicationService.createARVProtocolWithMedications(dto);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ARVProtocolDTO> update(@PathVariable Integer id, @RequestBody ARVProtocolRequestDTO dto) {
        return ResponseEntity.ok(arvProtocolMedicationService.updateARVProtocolWithMedications(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<String> deActive(@PathVariable Integer id) {
        arvProtocolService.deleteARVProtocol(id);
        return ResponseEntity.ok("ARV Protocol đã được xóa thành công");
    }

    @PutMapping("/active/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<String> active(@PathVariable Integer id) {
        arvProtocolService.activeARVProtocol(id);
        return ResponseEntity.ok("ARV Protocol đã được kích hoạt thành công");
    }
}
