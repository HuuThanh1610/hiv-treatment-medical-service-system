
package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.dto.DoctorScheduleDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.service.DoctorScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctor-schedules")
public class DoctorScheduleController {
    @Autowired
    private DoctorScheduleService doctorScheduleService;

    @PutMapping("/restore/{id}")
    public ResponseEntity<Void> restoreSchedule(@PathVariable Integer id) {
        doctorScheduleService.restoreSchedule(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<DoctorScheduleDTO> create(@RequestBody DoctorScheduleDTO dto) {
        return ResponseEntity.ok(doctorScheduleService.createSchedule(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoctorScheduleDTO> update(@PathVariable Integer id, @RequestBody DoctorScheduleDTO dto) {
        return ResponseEntity.ok(doctorScheduleService.updateSchedule(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        doctorScheduleService.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorScheduleDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(doctorScheduleService.getScheduleById(id));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<DoctorScheduleDTO>> getByDoctor(@PathVariable Integer doctorId) {
        return ResponseEntity.ok(doctorScheduleService.getSchedulesByDoctor(doctorId));
    }

    @GetMapping
    public ResponseEntity<List<DoctorScheduleDTO>> getAll() {
        return ResponseEntity.ok(doctorScheduleService.getAllSchedules());
    }
}
