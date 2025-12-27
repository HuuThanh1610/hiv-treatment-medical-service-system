package com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.dto.ARVMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.dto.ARVMedicationForProtocolDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.service.ARVProtocolMedicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@PreAuthorize("isAuthenticated()")
public class ARVProtocolMedicationController {
    @Autowired
    private ARVProtocolMedicationService arvProtocolMedicationService;

    @GetMapping("/medication-protocol/{protocolId}/medications")
    public ResponseEntity<List<ARVMedicationForProtocolDTO>> getMedicationsByProtocol(@PathVariable Integer protocolId) {
        List<ARVMedicationForProtocolDTO> result = arvProtocolMedicationService.getARVMedicationForProtocol(protocolId);
        return ResponseEntity.ok(result);
    }

}
