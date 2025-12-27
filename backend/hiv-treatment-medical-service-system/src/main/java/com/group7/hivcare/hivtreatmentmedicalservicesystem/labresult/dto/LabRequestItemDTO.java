package com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabRequestItemDTO {
    private int id;
    private int labRequestId;
    private int testTypeId;
    private String resultValue;
    private LocalDate resultDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Các trường bổ sung cho mục đích hiển thị
    private String testTypeName;
    private String testTypeDescription;
    private double testTypePrice;
} 