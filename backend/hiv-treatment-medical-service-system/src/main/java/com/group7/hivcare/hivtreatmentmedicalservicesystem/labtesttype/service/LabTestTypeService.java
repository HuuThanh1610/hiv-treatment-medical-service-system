package com.group7.hivcare.hivtreatmentmedicalservicesystem.labtesttype.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.labtesttype.dto.LabTestTypeDTO;

import java.util.List;

public interface LabTestTypeService {
    LabTestTypeDTO create(LabTestTypeDTO dto);
    List<LabTestTypeDTO> getAll();
    LabTestTypeDTO getById(Integer id);
    LabTestTypeDTO update(Integer id, LabTestTypeDTO dto);
    void delete(Integer id);
    LabTestTypeDTO updatePrice(Integer id, double price);
}
