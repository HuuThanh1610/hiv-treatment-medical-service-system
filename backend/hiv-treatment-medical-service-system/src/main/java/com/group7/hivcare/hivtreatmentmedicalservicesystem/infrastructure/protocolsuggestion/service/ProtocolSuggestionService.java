package com.group7.hivcare.hivtreatmentmedicalservicesystem.infrastructure.protocolsuggestion.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocol.dto.ARVProtocolDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.dto.LabResultsAnalysisDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.dto.ProtocolSuggestionDTO;

import java.util.List;

public interface ProtocolSuggestionService {

    List<ARVProtocolDTO> suggestProtocols(Integer patientId);


}