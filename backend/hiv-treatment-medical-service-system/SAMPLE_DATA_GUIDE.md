# Hướng Dẫn Sử Dụng Dữ Liệu Mẫu - HIV Treatment Medical Service System

## Tổng Quan

Hệ thống đã được cấu hình với các dữ liệu mẫu sau khi khởi động:

### 1. Medical Services (20 dịch vụ y tế)
- HIV Counseling and Testing
- CD4 Count Test
- Viral Load Test
- ARV Treatment Consultation
- ARV Medication Dispensing
- Opportunistic Infection Treatment
- HIV/AIDS Education Session
- Nutritional Counseling
- Mental Health Support
- Family Planning Services
- STI Screening
- Tuberculosis Screening
- Hepatitis B/C Testing
- Chest X-Ray
- Blood Chemistry Panel
- Liver Function Test
- Kidney Function Test
- Lipid Profile
- Diabetes Screening
- Emergency HIV Care

### 2. ARV Medications (20 loại thuốc ARV)
- **NRTIs**: TDF, 3TC, ABC, AZT, FTC
- **NNRTIs**: EFV, NVP, RPV
- **PIs**: LPV/r, ATV, DRV
- **Integrase Inhibitors**: RAL, DTG, EVG
- **Entry Inhibitors**: T20, MVC
- **Fixed Dose Combinations**: TDF/3TC/EFV, TDF/FTC/EFV, TDF/FTC/DTG, ABC/3TC/DTG

### 3. Lab Test Types (35 loại xét nghiệm)
- **HIV/AIDS Related**: HIV Antibody Test, Viral Load, CD4 Count, CD4/CD8 Ratio
- **Blood Chemistry**: CBC, Hemoglobin, WBC Count, Platelet Count
- **Liver Function**: ALT, AST, Alkaline Phosphatase, Total Bilirubin
- **Kidney Function**: Creatinine, BUN, Estimated GFR
- **Lipid Profile**: Total Cholesterol, HDL, LDL, Triglycerides
- **Diabetes Screening**: Fasting Blood Glucose, HbA1c
- **Infectious Disease**: Hepatitis B/C, Syphilis Test
- **Tuberculosis**: TST, IGRA
- **Other Tests**: CRP, ESR, Vitamin D, B12, Folate

### 4. ARV Protocols (25 phác đồ điều trị)
- **First-line regimens**: TDF + 3TC + DTG, TDF + 3TC + EFV, ABC + 3TC + DTG
- **Second-line regimens**: TDF + 3TC + LPV/r, TDF + 3TC + ATV/r, TDF + 3TC + DRV/r
- **Third-line regimens**: RAL + DRV/r + Optimized NRTIs, DTG + DRV/r + Optimized NRTIs
- **Pregnancy regimens**: TDF + 3TC + EFV (Pregnancy), TDF + 3TC + LPV/r (Pregnancy)
- **Children regimens**: ABC + 3TC + LPV/r (Children), ABC + 3TC + EFV (Children)
- **Special regimens**: TDF + 3TC + RAL, TDF + FTC + DTG
- **Fixed-dose combinations**: TDF/3TC/EFV (FDC), TDF/FTC/DTG (FDC)

## API Testing với Postman

### 1. Medical Services API

#### Lấy danh sách dịch vụ y tế
```
GET http://localhost:8080/api/medical-services
Headers:
Authorization: Bearer {your_token}
```

#### Tạo dịch vụ y tế mới (ADMIN/STAFF)
```
POST http://localhost:8080/api/medical-services
Headers:
Authorization: Bearer {your_token}
Content-Type: application/json

Body:
{
    "name": "HIV Rapid Test",
    "description": "Xét nghiệm HIV nhanh",
    "defaultDuration": 15,
    "price": 100000.0
}
```

#### Cập nhật dịch vụ y tế
```
PUT http://localhost:8080/api/medical-services/{id}
Headers:
Authorization: Bearer {your_token}
Content-Type: application/json

Body:
{
    "name": "HIV Rapid Test Updated",
    "description": "Xét nghiệm HIV nhanh - cập nhật",
    "defaultDuration": 20,
    "price": 120000.0
}
```

### 2. ARV Medications API

#### Lấy danh sách thuốc ARV
```
GET http://localhost:8080/api/arv-medications
Headers:
Authorization: Bearer {your_token}
```

#### Lấy thuốc ARV theo ID
```
GET http://localhost:8080/api/arv-medications/{id}
Headers:
Authorization: Bearer {your_token}
```

#### Tạo thuốc ARV mới (ADMIN/STAFF)
```
POST http://localhost:8080/api/arv-medications
Headers:
Authorization: Bearer {your_token}
Content-Type: application/json

Body:
{
    "code": "NEW",
    "name": "New ARV Medication",
    "description": "Thuốc ARV mới",
    "form": "Viên nén",
    "strength": "100mg",
    "manufacturer": "New Pharma"
}
```

### 3. Lab Test Types API

#### Lấy danh sách loại xét nghiệm
```
GET http://localhost:8080/api/lab-test-types
Headers:
Authorization: Bearer {your_token}
```

#### Tạo loại xét nghiệm mới (ADMIN/STAFF)
```
POST http://localhost:8080/api/lab-test-types
Headers:
Authorization: Bearer {your_token}
Content-Type: application/json

Body:
{
    "name": "New Lab Test",
    "description": "Xét nghiệm mới",
    "price": 150000.0
}
```

#### Cập nhật giá xét nghiệm
```
PATCH http://localhost:8080/api/lab-test-types/{id}/price?price=200000.0
Headers:
Authorization: Bearer {your_token}
```

### 4. ARV Protocols API

#### Lấy danh sách phác đồ ARV (ADMIN/STAFF)
```
GET http://localhost:8080/api/arv-protocol
Headers:
Authorization: Bearer {your_token}
```

#### Lấy phác đồ ARV đang hoạt động (PATIENT/DOCTOR)
```
GET http://localhost:8080/api/arv-protocol/active
Headers:
Authorization: Bearer {your_token}
```

#### Tạo phác đồ ARV mới (ADMIN/STAFF)
```
POST http://localhost:8080/api/arv-protocol
Headers:
Authorization: Bearer {your_token}
Content-Type: application/json

Body:
{
    "name": "New ARV Protocol",
    "description": "Phác đồ ARV mới",
    "isForPregnant": false,
    "isForChildren": false
}
```

### 5. Lab Requests API

#### Tạo yêu cầu xét nghiệm (DOCTOR)
```
POST http://localhost:8080/api/lab-requests
Headers:
Authorization: Bearer {your_token}
Content-Type: application/json

Body:
{
    "appointmentId": 1,
    "patientId": 1,
    "doctorId": 1,
    "isUrgent": false,
    "testTypeIds": [1, 2, 3],
    "doctorNotes": "Xét nghiệm theo dõi"
}
```

#### Lấy danh sách yêu cầu xét nghiệm
```
GET http://localhost:8080/api/lab-requests
Headers:
Authorization: Bearer {your_token}
```

#### Lấy chi tiết yêu cầu xét nghiệm
```
GET http://localhost:8080/api/lab-requests/{id}
Headers:
Authorization: Bearer {your_token}
```

### 6. Treatment Plans API

#### Tạo kế hoạch điều trị (DOCTOR)
```
POST http://localhost:8080/api/treatment-plans
Headers:
Authorization: Bearer {your_token}
Content-Type: application/json

Body:
{
    "patientId": 1,
    "doctorId": 1,
    "arvProtocolId": 1,
    "sourceLabRequestId": 1,
    "decisionSummary": "Bắt đầu điều trị ARV",
    "startDate": "2024-01-01",
    "notes": "Theo dõi chặt chẽ"
}
```

#### Lấy kế hoạch điều trị theo bệnh nhân
```
GET http://localhost:8080/api/treatment-plans/patient/{patientId}
Headers:
Authorization: Bearer {your_token}
```

## Lưu Ý Quan Trọng

1. **Authentication**: Tất cả API đều yêu cầu JWT token trong header Authorization
2. **Role-based Access**: Một số API chỉ dành cho ADMIN/STAFF, một số cho DOCTOR/PATIENT
3. **Data Validation**: Dữ liệu đầu vào được validate theo các quy tắc nghiêm ngặt
4. **Error Handling**: Hệ thống trả về error messages chi tiết khi có lỗi

## Testing Workflow

### 1. Đăng nhập Admin
```
POST http://localhost:8080/api/auth/login
Body:
{
    "email": "admin@example.com",
    "password": "admin123"
}
```

### 2. Tạo Doctor User
```
POST http://localhost:8080/api/admin/users
Headers:
Authorization: Bearer {admin_token}
Body:
{
    "email": "doctor@example.com",
    "password": "doctor123",
    "fullName": "Dr. John Doe",
    "phoneNumber": "0123456789",
    "role": "DOCTOR"
}
```

### 3. Doctor đăng nhập và tạo profile
```
POST http://localhost:8080/api/auth/login
Body:
{
    "email": "doctor@example.com",
    "password": "doctor123"
}
```

```
POST http://localhost:8080/api/doctors/profile
Headers:
Authorization: Bearer {doctor_token}
Body:
{
    "specialty": "HIV/AIDS",
    "qualifications": "MD, PhD",
    "maxAppointmentsPerDay": 20
}
```

### 4. Tạo Patient User
```
POST http://localhost:8080/api/auth/register
Body:
{
    "email": "patient@example.com",
    "password": "patient123",
    "fullName": "Patient Name",
    "phoneNumber": "0987654321"
}
```

### 5. Tạo Appointment
```
POST http://localhost:8080/api/appointments
Headers:
Authorization: Bearer {patient_token}
Body:
{
    "doctorId": 1,
    "medicalServiceId": 1,
    "appointmentDate": "2024-01-15",
    "appointmentTime": "09:00:00",
    "notes": "Khám lần đầu"
}
```

## Troubleshooting

### Lỗi thường gặp:

1. **401 Unauthorized**: Token không hợp lệ hoặc hết hạn
2. **403 Forbidden**: Không có quyền truy cập API
3. **400 Bad Request**: Dữ liệu đầu vào không hợp lệ
4. **404 Not Found**: Resource không tồn tại
5. **500 Internal Server Error**: Lỗi server

### Giải pháp:

1. Kiểm tra token có hợp lệ không
2. Kiểm tra role có đủ quyền không
3. Validate dữ liệu đầu vào
4. Kiểm tra ID có tồn tại không
5. Xem log server để debug

## Kết Luận

Với dữ liệu mẫu này, bạn có thể test đầy đủ các chức năng của hệ thống HIV Treatment Medical Service System. Hãy bắt đầu với việc đăng nhập admin và tạo các user khác để test các workflow khác nhau. 