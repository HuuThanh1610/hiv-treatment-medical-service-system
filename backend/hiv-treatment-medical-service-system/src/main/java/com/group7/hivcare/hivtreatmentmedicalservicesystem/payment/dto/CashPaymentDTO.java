package com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.dto;


import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CashPaymentDTO {
    private Integer id;

    private Integer staffId;

    private String staffName;
}
