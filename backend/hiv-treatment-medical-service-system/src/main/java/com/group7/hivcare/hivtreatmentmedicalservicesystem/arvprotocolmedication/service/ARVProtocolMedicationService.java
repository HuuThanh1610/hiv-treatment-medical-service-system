package com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocol.dto.ARVProtocolDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.dto.ARVMedicationForProtocolDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.dto.ARVProtocolRequestDTO;

import java.util.List;


public interface ARVProtocolMedicationService  {
    ARVProtocolDTO createARVProtocolWithMedications(ARVProtocolRequestDTO dto);

    ARVProtocolDTO updateARVProtocolWithMedications(Integer id, ARVProtocolRequestDTO dto);

    List<ARVMedicationForProtocolDTO> getARVMedicationForProtocol(Integer protocolId);
}
