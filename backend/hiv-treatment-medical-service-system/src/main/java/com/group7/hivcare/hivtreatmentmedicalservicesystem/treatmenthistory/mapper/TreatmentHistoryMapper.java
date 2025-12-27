package com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.mapper;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.TreatmentHistory;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.dto.TreatmentHistoryDTO;

import java.util.List;

public interface TreatmentHistoryMapper {
    TreatmentHistoryDTO toDTO(TreatmentHistory entity);
    List<TreatmentHistoryDTO> toDTOList(List<TreatmentHistory> entities);
}
