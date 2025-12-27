package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.dto.ARVProtocolMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.ARVMedication;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.ARVProtocol;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.ARVProtocolMedication;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.ARVProtocolMedicationId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ARVProtocolMedicationRepository extends JpaRepository<ARVProtocolMedication, ARVProtocolMedicationId> {
    @Query("SELECT apm  FROM ARVProtocolMedication apm WHERE apm.arvProtocol.id = :protocolId")
    List<ARVProtocolMedication> findAllByProtocolId(@Param("protocolId") Integer protocolId);

    @Modifying
    @Query("DELETE FROM ARVProtocolMedication apm WHERE apm.arvProtocol.id = :protocolId")
    void deleteByArvProtocolId(@Param("protocolId") Integer protocolId);
}
