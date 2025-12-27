package com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRegisterDTO {

    @NotBlank(message = "Password không được để trống")
    @Size(min = 6, message = "Password ít nhất 6 ký tự")
    @ToString.Exclude // Không in password
    private String password;

    @NotBlank(message = "Họ tên không được để trống")
    @Size(min = 3, max = 100, message = "Họ tên phải từ 3 đến 100 ký tự")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Size(min = 9, max = 15, message = "Số điện thoại không hợp lệ")
    private String phoneNumber;

    private boolean isAnonymous = false;

    private String roleName; // Chỉ dùng cho admin tạo user

    @Past(message = "Ngày sinh phải là một ngày trong quá khứ")
    private LocalDate birthday;

    @Pattern(regexp = "^(Male|Female|Other)$", message = "Giới tính phải là Male, Female hoặc Other")
    private String gender;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;
}