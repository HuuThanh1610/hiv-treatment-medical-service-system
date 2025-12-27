package com.group7.hivcare.hivtreatmentmedicalservicesystem.auth.dto;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {
    private String token;
    private String email;
    private String role;
}
