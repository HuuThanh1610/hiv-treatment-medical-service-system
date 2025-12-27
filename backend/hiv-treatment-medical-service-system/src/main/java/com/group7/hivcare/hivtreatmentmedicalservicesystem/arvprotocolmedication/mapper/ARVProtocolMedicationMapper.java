package com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.mapper;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocol.dto.ARVProtocolDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.dto.ARVMedicationForProtocolDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.ARVProtocol;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.ARVProtocolMedication;

public interface ARVProtocolMedicationMapper {
    ARVMedicationForProtocolDTO convertToMedicationForProtocolDTO(ARVProtocolMedication arvProtocolMedication);
    ARVProtocolDTO convertToDTO(ARVProtocol arvProtocol);
}
