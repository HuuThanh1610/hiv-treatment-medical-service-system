package com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePatientFeedbackDTO {

    @NotNull(message = "Appointment ID không được để trống")
    private Integer appointmentId;

    @NotNull(message = "Đánh giá nhân viên không được để trống")
    @Min(value = 1, message = "Đánh giá nhân viên phải từ 1-5 sao")
    @Max(value = 5, message = "Đánh giá nhân viên phải từ 1-5 sao")
    private Integer staffRating;

    @NotNull(message = "Đánh giá thời gian chờ không được để trống")
    @Min(value = 1, message = "Đánh giá thời gian chờ phải từ 1-5 sao")
    @Max(value = 5, message = "Đánh giá thời gian chờ phải từ 1-5 sao")
    private Integer waitingTimeRating;

    @NotNull(message = "Đánh giá cơ sở vật chất không được để trống")
    @Min(value = 1, message = "Đánh giá cơ sở vật chất phải từ 1-5 sao")
    @Max(value = 5, message = "Đánh giá cơ sở vật chất phải từ 1-5 sao")
    private Integer facilityRating;

    @NotNull(message = "Đánh giá bác sĩ không được để trống")
    @Min(value = 1, message = "Đánh giá bác sĩ phải từ 1-5 sao")
    @Max(value = 5, message = "Đánh giá bác sĩ phải từ 1-5 sao")
    private Integer doctorRating;

    @Size(max = 500, message = "Góp ý thêm không được quá 500 ký tự")
    private String additionalComments;
}
