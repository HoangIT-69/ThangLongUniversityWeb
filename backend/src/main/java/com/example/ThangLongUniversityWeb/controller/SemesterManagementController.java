package com.example.ThangLongUniversityWeb.controller;

import com.example.ThangLongUniversityWeb.dto.request.SemesterRequest;
import com.example.ThangLongUniversityWeb.service.SemesterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/semesters")
@RequiredArgsConstructor
@Tag(name = "Admin - Quản lý Học kỳ", description = "Các API đóng/mở và quản lý học kỳ")
@SecurityRequirement(name = "bearerAuth")
public class SemesterManagementController {

    private final SemesterService semesterService;

    @Operation(summary = "Lấy danh sách tất cả học kỳ")
    @GetMapping
    public ResponseEntity<?> getAllSemesters() {
        return ResponseEntity.ok(semesterService.getAllSemesters());
    }

    @Operation(summary = "Thêm mới một học kỳ")
    @PostMapping
    public ResponseEntity<?> createSemester(@RequestBody SemesterRequest request) {
        return ResponseEntity.ok(semesterService.createSemester(request));
    }

    @Operation(summary = "Cập nhật thông tin học kỳ (Dùng để Mở/Đóng đăng ký tín chỉ)")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSemester(@PathVariable Long id, @RequestBody SemesterRequest request) {
        return ResponseEntity.ok(semesterService.updateSemester(id, request));
    }

    @Operation(summary = "Xóa học kỳ")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSemester(@PathVariable Long id) {
        semesterService.deleteSemester(id);
        return ResponseEntity.ok("Xóa học kỳ thành công!");
    }
}