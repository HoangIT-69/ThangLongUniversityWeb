package com.example.ThangLongUniversityWeb.controller;

import com.example.ThangLongUniversityWeb.dto.request.TeacherRequest;
import com.example.ThangLongUniversityWeb.repository.TeacherRepository;
import com.example.ThangLongUniversityWeb.service.TeacherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/teachers")
@RequiredArgsConstructor
@Tag(name = "Admin - Quản lý Giảng viên")
@SecurityRequirement(name = "bearerAuth")
public class TeacherManagementController {

    private final TeacherService teacherService;
    private final TeacherRepository teacherRepository; // Gọi thẳng để lấy danh sách

    @Operation(summary = "Lấy danh sách tất cả giảng viên")
    @GetMapping
    public ResponseEntity<?> getAllTeachers() {
        return ResponseEntity.ok(teacherRepository.findAll());
    }

    @Operation(summary = "Thêm mới một giảng viên")
    @PostMapping
    public ResponseEntity<?> createTeacher(@RequestBody TeacherRequest request) {
        return ResponseEntity.ok(teacherService.createTeacher(request));
    }

    @Operation(summary = "Cập nhật thông tin giảng viên")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTeacher(@PathVariable Long id, @RequestBody TeacherRequest request) {
        return ResponseEntity.ok(teacherService.updateTeacher(id, request));
    }

    @Operation(summary = "Xóa giảng viên")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTeacher(@PathVariable Long id) {
        teacherService.deleteTeacher(id);
        return ResponseEntity.ok("Xóa giảng viên thành công!");
    }
}