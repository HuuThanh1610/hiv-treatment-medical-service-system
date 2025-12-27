# API Endpoints Mới cho Medication Schedule

## 1. Tạo Medication Schedule từ Prescription Medication

### Endpoint
```
POST /api/medication-schedules/from-prescription
```

### Request Body
```json
{
    "treatmentPlanId": 1,
    "medicationId": 5,
    "timeOfDay": "08:00,20:00"
}
```

### Response
```json
{
    "id": 10,
    "treatmentPlanId": 1,
    "medicationName": "Tenofovir Disoproxil Fumarate",
    "dosage": "300mg",
    "frequency": "2 lần/ngày",
    "timeOfDay": "08:00,20:00",
    "createdAt": "2025-08-03T11:38:43",
    "updatedAt": "2025-08-03T11:38:43"
}
```

## 2. Lấy danh sách Prescription Medications theo Treatment Plan

### Endpoint
```
GET /api/prescriptions/treatment-plan/{treatmentPlanId}/medications
```

### Response
```json
[
    {
        "medicationId": 5,
        "medicationName": "Tenofovir Disoproxil Fumarate",
        "medicationCode": "TDF",
        "medicationStrength": "300mg",
        "medicationForm": "Viên nén",
        "dosage": "300mg",
        "frequency": "2 lần/ngày",
        "durationDays": 30,
        "notes": "Uống sau ăn"
    }
]
```

## 3. Workflow mới cho bệnh nhân

1. **Khi tạo kế hoạch điều trị**: Bác sĩ tạo prescription với các medication
2. **Bệnh nhân xem thuốc**: Gọi API để lấy danh sách prescription medications
3. **Bệnh nhân chọn tạo nhắc nhở**: Chọn thuốc và thời gian nhắc nhở
4. **Hệ thống tạo schedule**: Tạo medication schedule từ prescription medication
5. **Tự động tạo reminder**: Hệ thống tự động tạo treatment reminder cho schedule

## 4. Component Frontend

- **PatientMedicationSchedule.jsx**: Component mới cho phép bệnh nhân chọn thuốc và tạo nhắc nhở
- **Tab Navigation**: Thêm tab "Tạo nhắc nhở uống thuốc" trong PatientMedication
- **Modal Interface**: Giao diện thân thiện để chọn thời gian nhắc nhở

## 5. Tự động hóa

- Khi tạo medication schedule, hệ thống tự động gọi `treatmentReminderService.createDailyMedicationReminders()`
- Reminder scheduler sẽ tự động gửi email và thông báo theo lịch đã thiết lập
