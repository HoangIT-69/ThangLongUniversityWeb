package com.example.ThangLongUniversityWeb.controller;

import com.example.ThangLongUniversityWeb.dto.request.RetakeRegistrationRequest;
import com.example.ThangLongUniversityWeb.service.StudentRetakeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/student/retakes")
@RequiredArgsConstructor
@Tag(name = "Student - Dang ky thi lai / thi nang diem")
@SecurityRequirement(name = "bearerAuth")
public class StudentRetakeController {

    private final StudentRetakeService studentRetakeService;

    @Operation(summary = "Lay danh sach mon du dieu kien thi lai / thi nang diem")
    @GetMapping("/eligible-courses")
    public ResponseEntity<?> getEligibleCourses(@RequestParam(required = false) Long semesterId) {
        return ResponseEntity.ok(studentRetakeService.getEligibleCourses(semesterId));
    }

    @Operation(summary = "Dang ky thi lai / thi nang diem")
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RetakeRegistrationRequest request) {
        return ResponseEntity.ok(studentRetakeService.register(request));
    }

    @Operation(summary = "Lay danh sach dang ky thi lai / thi nang diem cua sinh vien")
    @GetMapping("/my-requests")
    public ResponseEntity<?> getMyRequests(@RequestParam(required = false) Long semesterId) {
        return ResponseEntity.ok(studentRetakeService.getMyRequests(semesterId));
    }
}
