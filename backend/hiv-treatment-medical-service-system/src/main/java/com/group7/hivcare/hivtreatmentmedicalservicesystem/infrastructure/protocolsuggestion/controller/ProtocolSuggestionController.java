package com.group7.hivcare.hivtreatmentmedicalservicesystem.infrastructure.protocolsuggestion.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocol.dto.ARVProtocolDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.dto.LabResultsAnalysisDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.dto.ProtocolSuggestionDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.infrastructure.protocolsuggestion.service.ProtocolSuggestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/protocol-suggestions")
@PreAuthorize("hasRole('DOCTOR')")
public class ProtocolSuggestionController {

    @Autowired
    private ProtocolSuggestionService service;

    @GetMapping("/{patientId}")
    public ResponseEntity<List<ARVProtocolDTO>> suggestProtocols(
            @PathVariable Integer patientId) {
        return ResponseEntity.ok(service.suggestProtocols(patientId));
    }

//    @GetMapping("/suggest-children/{patientId}/{labRequestId}")
//    public ResponseEntity<List<ProtocolSuggestionDTO>> suggestProtocolsForChildren(
//            @PathVariable Integer patientId,
//            @PathVariable Integer labRequestId) {
//        return ResponseEntity.ok(service.suggestProtocolsForChildren(patientId, labRequestId));
//    }
}