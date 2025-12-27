package com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserFilterDTO {
    private String fullName;
    private String email;
    private String phone;
    private String roleName;
    private String gender;
    private boolean anonymous;
    private boolean active;
}
