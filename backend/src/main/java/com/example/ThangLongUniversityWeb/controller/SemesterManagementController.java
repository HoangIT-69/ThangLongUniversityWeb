package com.example.ThangLongUniversityWeb.controller;

import com.example.ThangLongUniversityWeb.dto.request.SemesterRequest;
import com.example.ThangLongUniversityWeb.service.SemesterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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

    @Operation(summary = "Cập nhật thông tin học kỳ")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSemester(@PathVariable Long id, @RequestBody SemesterRequest request) {
        return ResponseEntity.ok(semesterService.updateSemester(id, request));
    }

    @Operation(summary = "Xóa học kỳ (chỉ khi chưa có lớp học phần)")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSemester(@PathVariable Long id) {
        semesterService.deleteSemester(id);
        return ResponseEntity.ok("Xóa học kỳ thành công!");
    }

    // ── Lifecycle endpoints ───────────────────────────────────────────────

    @Operation(summary = "Mở/Đóng đăng ký học phần", description = "body: {open: true/false}")
    @PostMapping("/{id}/toggle-registration")
    public ResponseEntity<?> toggleRegistration(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        boolean open = Boolean.TRUE.equals(body.get("open"));
        return ResponseEntity.ok(semesterService.toggleRegistration(id, open));
    }

    @Operation(summary = "Chốt học phần (PENDING → REGISTERED, khóa đăng ký)")
    @PostMapping("/{id}/lock-enrollments")
    public ResponseEntity<?> lockEnrollments(@PathVariable Long id) {
        int count = semesterService.lockEnrollments(id);
        return ResponseEntity.ok(Map.of("message", "Đã chốt " + count + " đăng ký cho học kỳ " + id));
    }

    @Operation(summary = "Công bố lịch thi (sinh viên thấy lịch thi)")
    @PostMapping("/{id}/publish-exams")
    public ResponseEntity<?> publishExams(@PathVariable Long id) {
        return ResponseEntity.ok(semesterService.publishExamSchedules(id));
    }

    @Operation(summary = "Hủy công bố lịch thi")
    @PostMapping("/{id}/unpublish-exams")
    public ResponseEntity<?> unpublishExams(@PathVariable Long id) {
        return ResponseEntity.ok(semesterService.unpublishExamSchedules(id));
    }

    @Operation(summary = "Mở/Đóng đăng ký thi lại", description = "body: {open: true/false}")
    @PostMapping("/{id}/toggle-retake")
    public ResponseEntity<?> toggleRetake(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        boolean open = Boolean.TRUE.equals(body.get("open"));
        return ResponseEntity.ok(semesterService.toggleRetakeRegistration(id, open));
    }

    @Operation(summary = "Chốt thi lại (PENDING → REGISTERED)")
    @PostMapping("/{id}/lock-retakes")
    public ResponseEntity<?> lockRetakes(@PathVariable Long id) {
        int count = semesterService.lockRetakes(id);
        return ResponseEntity.ok(Map.of("message", "Đã chốt " + count + " đăng ký thi lại cho học kỳ " + id));
    }

    @Operation(summary = "Lấy thống kê tổng hợp học kỳ")
    @GetMapping("/{id}/summary")
    public ResponseEntity<?> getSummary(@PathVariable Long id) {
        return ResponseEntity.ok(semesterService.getSemesterSummary(id));
    }
}
