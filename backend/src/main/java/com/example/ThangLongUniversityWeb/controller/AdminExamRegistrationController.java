package com.example.ThangLongUniversityWeb.controller;

import com.example.ThangLongUniversityWeb.entity.ExamRegistration;
import com.example.ThangLongUniversityWeb.enums.EnrollmentStatus;
import com.example.ThangLongUniversityWeb.repository.ExamRegistrationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/exam-registrations")
@RequiredArgsConstructor
@Tag(name = "Admin - Quản lý Đăng ký Thi lại", description = "Xem và thống kê đăng ký thi lại/nâng điểm")
@SecurityRequirement(name = "bearerAuth")
public class AdminExamRegistrationController {

    private final ExamRegistrationRepository examRegistrationRepository;

    @Operation(summary = "Danh sách đăng ký thi lại theo học kỳ (filter theo status)")
    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam Long semesterId,
            @RequestParam(required = false) String status
    ) {
        EnrollmentStatus statusEnum = null;
        if (status != null && !status.isBlank()) {
            try {
                statusEnum = EnrollmentStatus.valueOf(status);
            } catch (IllegalArgumentException ignored) {
            }
        }

        List<ExamRegistration> registrations = statusEnum != null
                ? examRegistrationRepository.findByClassSectionSemesterIdAndStatus(semesterId, statusEnum)
                : examRegistrationRepository.findAll().stream()
                    .filter(r -> r.getClassSection().getSemester().getId().equals(semesterId))
                    .collect(Collectors.toList());

        List<Map<String, Object>> result = registrations.stream().map(r -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", r.getId());
            item.put("studentId", r.getStudent().getId());
            item.put("studentCode", r.getStudent().getStudentCode());
            item.put("studentName", r.getStudent().getFullName());
            item.put("classSectionId", r.getClassSection().getId());
            item.put("classCode", r.getClassSection().getClassCode());
            item.put("courseName", r.getClassSection().getCourse().getName());
            item.put("courseCode", r.getClassSection().getCourse().getCode());
            item.put("credits", r.getClassSection().getCourse().getCredits());
            item.put("semesterId", r.getClassSection().getSemester().getId());
            item.put("semesterName", r.getClassSection().getSemester().getName());
            item.put("status", r.getStatus() != null ? r.getStatus().name() : null);
            item.put("registrationType", r.getRegistrationType() != null ? r.getRegistrationType().name() : null);
            item.put("feeCharged", r.getFeeCharged());
            item.put("attemptNumber", r.getAttemptNumber());
            item.put("examAt", r.getClassSection().getExamAt() != null ? r.getClassSection().getExamAt().toString() : null);
            item.put("examRoom", r.getClassSection().getExamRoom());
            item.put("createdAt", r.getCreatedAt() != null ? r.getCreatedAt().toString() : null);
            return item;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Tổng hợp đăng ký thi lại theo học kỳ")
    @GetMapping("/semester/{semesterId}/summary")
    public ResponseEntity<?> summary(@PathVariable Long semesterId) {
        List<ExamRegistration> all = examRegistrationRepository.findAll().stream()
                .filter(r -> r.getClassSection().getSemester().getId().equals(semesterId))
                .collect(Collectors.toList());

        long pending = all.stream().filter(r -> r.getStatus() == EnrollmentStatus.PENDING).count();
        long registered = all.stream().filter(r -> r.getStatus() == EnrollmentStatus.REGISTERED).count();
        long totalFee = all.stream()
                .filter(r -> r.getFeeCharged() != null)
                .mapToLong(ExamRegistration::getFeeCharged)
                .sum();

        Map<String, Object> summary = new HashMap<>();
        summary.put("semesterId", semesterId);
        summary.put("total", all.size());
        summary.put("pending", pending);
        summary.put("registered", registered);
        summary.put("totalFeeCharged", totalFee);

        return ResponseEntity.ok(summary);
    }
}
