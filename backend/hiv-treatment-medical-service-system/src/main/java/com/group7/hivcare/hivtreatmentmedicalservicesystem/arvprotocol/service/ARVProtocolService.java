package com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocol.service;


import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocol.dto.ARVProtocolDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocol.dto.CreateARVProtocolDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocol.dto.UpdateARVProtocolDTO;

import java.util.List;

public interface ARVProtocolService {
    ARVProtocolDTO getARVProtocol(Integer id);
    List<ARVProtocolDTO> getAllARVProtocols();
    ARVProtocolDTO getARVProtocolIsActive(Integer id);
    List<ARVProtocolDTO> getAllARVProtocolsIsActive();
    ARVProtocolDTO updateARVProtocol(Integer id, UpdateARVProtocolDTO updateARVProtocolDTO);
    void deleteARVProtocol(Integer id);
    void activeARVProtocol(Integer id);
}
