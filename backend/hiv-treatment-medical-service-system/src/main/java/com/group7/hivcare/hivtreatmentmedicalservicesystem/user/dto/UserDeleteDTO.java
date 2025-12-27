package com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDeleteDTO {
    @NotNull(message = "Id người dùng không được để trống")
    private Integer id;

    @NotBlank(message = "Password xác nhận không được để trống")
    private String password;

}
