package com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDTO {
    @NotBlank(message = "Họ tên không được để trống")
    @Size(min = 3, max = 100, message = "Họ tên phải từ 3 đến 100 ký tự")
    private String fullName;

    // Email không được phép cập nhật
    // private String email;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Size(min = 9, max = 15, message = "Số điện thoại không hợp lệ")
    @Pattern(regexp = "^[0-9]+$", message = "Số điện thoại chỉ được chứa số")
    private String phoneNumber;

    private boolean isAnonymous = false;

    // Role chỉ được cập nhật bởi admin
    private String roleName;

    @Past(message = "Ngày sinh phải là một ngày trong quá khứ")
    private LocalDate birthday;

    @Pattern(regexp = "^(Male|Female|Other)$", message = "Giới tính phải là Male, Female hoặc Other")
    private String gender;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;
}
