package com.example.ThangLongUniversityWeb.controller;

import com.example.ThangLongUniversityWeb.dto.request.StudentRequest;
import com.example.ThangLongUniversityWeb.dto.request.StudentUpdateRequest;
import com.example.ThangLongUniversityWeb.repository.StudentRepository;
import com.example.ThangLongUniversityWeb.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/students")
@RequiredArgsConstructor
@Tag(name = "Admin - Quản lý Sinh viên", description = "Các API thêm, sửa, xóa, lấy danh sách Sinh viên")
@SecurityRequirement(name = "bearerAuth") // Bắt buộc phải có Token
public class StudentManagementController {

    private final StudentService studentService;
    private final StudentRepository studentRepository; // Tiêm Repository vào để lấy danh sách

    @Operation(summary = "Lấy danh sách tất cả sinh viên")
    @GetMapping
    public ResponseEntity<?> getAllStudents() {
        return ResponseEntity.ok(studentRepository.findAll().stream()
                .map(studentService::mapToResponse)
                .toList());
    }

    @Operation(summary = "Thêm mới một sinh viên")
    @PostMapping
    public ResponseEntity<?> createStudent(@RequestBody StudentRequest request) {
        return ResponseEntity.ok(studentService.createStudent(request));
    }

    @Operation(summary = "Cập nhật thông tin sinh viên")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody StudentUpdateRequest request) {
        return ResponseEntity.ok(studentService.updateStudent(id, request));
    }

    @Operation(summary = "Xóa sinh viên")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok("Xóa sinh viên thành công!");
    }
}