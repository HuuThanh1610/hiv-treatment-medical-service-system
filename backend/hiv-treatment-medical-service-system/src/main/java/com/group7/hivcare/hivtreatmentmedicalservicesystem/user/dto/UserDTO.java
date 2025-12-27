package com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Integer id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String roleName;
    private LocalDate birthday;
    private String gender;
    private String address;
    private boolean anonymous;
    private boolean active;

    // Add patientId for patient users
    private Integer patientId;

}
