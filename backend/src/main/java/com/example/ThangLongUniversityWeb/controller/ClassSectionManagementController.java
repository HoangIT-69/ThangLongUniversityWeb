package com.example.ThangLongUniversityWeb.controller;

import com.example.ThangLongUniversityWeb.dto.request.ClassSectionRequest;
import com.example.ThangLongUniversityWeb.dto.request.ExamScheduleRequest;
import com.example.ThangLongUniversityWeb.repository.ClassSectionRepository;
import com.example.ThangLongUniversityWeb.service.ClassSectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/class-sections")
@RequiredArgsConstructor
@Tag(name = "Admin - Quản lý Lớp học phần", description = "Mở lớp, xếp phòng, gán giảng viên")
@SecurityRequirement(name = "bearerAuth")
public class ClassSectionManagementController {

    private final ClassSectionService classSectionService;
    private final ClassSectionRepository classSectionRepository;

    @Operation(summary = "Lấy danh sách TOÀN BỘ lớp học phần (Đã làm phẳng dữ liệu)")
    @GetMapping
    public ResponseEntity<?> getAllClassSections() {
        var responseList = classSectionRepository.findAll()
                .stream()
                .map(classSectionService::mapToResponse) // Dùng hàm mapToResponse để chuyển Entity -> DTO phẳng
                .collect(Collectors.toList());
        return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(60, TimeUnit.MINUTES).cachePublic()) // Thiết lập header
            .body(responseList);
    }

    @Operation(summary = "Lấy danh sách Lớp học phần THEO HỌC KỲ")
    @GetMapping("/semester/{semesterId}")
    public ResponseEntity<?> getClassSectionsBySemester(@PathVariable Long semesterId) {
        var responseList = classSectionRepository.findBySemesterId(semesterId)
                .stream()
                .map(classSectionService::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseList);
    }

    @Operation(summary = "Mở một lớp học phần mới")
    @PostMapping
    public ResponseEntity<?> createClassSection(@RequestBody ClassSectionRequest request) {
        return ResponseEntity.ok(classSectionService.createClassSection(request));
    }

    @Operation(summary = "Cập nhật lớp học phần (Đổi phòng, đổi giảng viên...)")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateClassSection(@PathVariable Long id, @RequestBody ClassSectionRequest request) {
        return ResponseEntity.ok(classSectionService.updateClassSection(id, request));
    }

    @Operation(summary = "Xóa lớp học phần")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClassSection(@PathVariable Long id) {
        classSectionService.deleteClassSection(id);
        return ResponseEntity.ok("Xóa lớp học phần thành công!");
    }

    @Operation(summary = "Cập nhật lịch thi cho một lớp học phần")
    @PutMapping("/{id}/exam-schedule")
    public ResponseEntity<?> updateExamSchedule(@PathVariable Long id, @RequestBody ExamScheduleRequest request) {
        return ResponseEntity.ok(classSectionService.updateExamSchedule(id, request));
    }

    @Operation(summary = "Cập nhật hàng loạt lịch thi cho các lớp trong một học kỳ")
    @PutMapping("/semester/{semesterId}/exam-schedules")
    public ResponseEntity<?> batchUpdateExamSchedules(
            @PathVariable Long semesterId,
            @RequestBody List<ExamScheduleRequest> requests
    ) {
        return ResponseEntity.ok(classSectionService.batchUpdateExamSchedules(semesterId, requests));
    }

    @Operation(summary = "Lấy danh sách lịch thi theo học kỳ")
    @GetMapping("/semester/{semesterId}/exam-schedules")
    public ResponseEntity<?> getExamSchedules(@PathVariable Long semesterId) {
        return ResponseEntity.ok(classSectionService.getExamSchedulesBySemester(semesterId));
    }
}