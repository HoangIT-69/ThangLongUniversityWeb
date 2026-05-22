package com.example.ThangLongUniversityWeb.controller;

import com.example.ThangLongUniversityWeb.dto.request.GradeRequest;
import com.example.ThangLongUniversityWeb.dto.response.GradeResponse;
import com.example.ThangLongUniversityWeb.entity.ClassSection;
import com.example.ThangLongUniversityWeb.entity.Enrollment;
import com.example.ThangLongUniversityWeb.entity.Grade;
import com.example.ThangLongUniversityWeb.entity.Teacher;
import com.example.ThangLongUniversityWeb.entity.User;
import com.example.ThangLongUniversityWeb.repository.ClassSectionRepository;
import com.example.ThangLongUniversityWeb.repository.GradeRepository;
import com.example.ThangLongUniversityWeb.repository.UserRepository;
import com.example.ThangLongUniversityWeb.repository.ExamRegistrationRepository;
import com.example.ThangLongUniversityWeb.repository.EnrollmentRepository;
import com.example.ThangLongUniversityWeb.entity.ExamRegistration;
import com.example.ThangLongUniversityWeb.enums.EnrollmentStatus;
import com.example.ThangLongUniversityWeb.service.GradeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher/grades")
@RequiredArgsConstructor
@Tag(name = "Teacher - Quản lý Điểm", description = "Các API nhập điểm cho sinh viên")
@SecurityRequirement(name = "bearerAuth")
public class TeacherGradeController {

    private final GradeService gradeService;
    private final GradeRepository gradeRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ClassSectionRepository classSectionRepository;
    private final UserRepository userRepository;
    private final ExamRegistrationRepository examRegistrationRepository;

    /**
     * Nhập/cập nhật điểm cho sinh viên
     * Ràng buộc: ClassSection phải chưa đóng (isClosed = false) và giảng viên phải là người dạy lớp
     */
    @Operation(summary = "Nhập/cập nhật điểm cho sinh viên")
    @PutMapping("/{enrollmentId}")
    public ResponseEntity<?> updateStudentGrade(
            @PathVariable Long enrollmentId,
            @RequestBody GradeRequest request) {

        // Lấy enrollment
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy enrollment!"));

        ClassSection originalClassSection = enrollment.getClassSection();

        // Lấy giảng viên hiện tại đang đăng nhập
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user!"));
        Teacher currentTeacher = currentUser.getTeacher();

        if (currentTeacher == null) {
            return ResponseEntity.status(403).body("Bạn không phải là giảng viên!");
        }

        boolean isAuthorized = false;
        boolean isClosed = true;

        // Kiểm tra giảng viên lớp gốc
        if (originalClassSection.getTeacher().getId().equals(currentTeacher.getId())) {
            isAuthorized = true;
            isClosed = originalClassSection.isClosed();
        }

        // Nếu chưa được ủy quyền hoặc lớp gốc đã đóng, kiểm tra xem sinh viên có lớp thi lại không
        if (!isAuthorized || isClosed) {
            List<ExamRegistration> retakes = examRegistrationRepository.findByOriginalGrade_Enrollment_Id(enrollmentId);
            for (ExamRegistration reg : retakes) {
                if (reg.getStatus() == EnrollmentStatus.REGISTERED
                        && reg.getClassSection().getTeacher().getId().equals(currentTeacher.getId())) {
                    isAuthorized = true;
                    isClosed = reg.getClassSection().isClosed();
                    if (!isClosed) break; // Ưu tiên lớp đang mở
                }
            }
        }

        if (!isAuthorized) {
            return ResponseEntity.status(403).body("Bạn không có quyền nhập điểm cho enrollment này!");
        }

        if (isClosed) {
            return ResponseEntity.badRequest().body("Lớp đã đóng, không thể nhập điểm!");
        }

        request.setEnrollmentId(enrollmentId);
        GradeResponse response = gradeService.updateGrade(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy bảng điểm của cả lớp (cho giảng viên xem)
     */
    @Operation(summary = "Lấy bảng điểm của lớp")
    @GetMapping("/class/{classSectionId}")
    public ResponseEntity<?> getClassGrades(@PathVariable Long classSectionId) {
        ClassSection classSection = classSectionRepository.findById(classSectionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp!"));

        // Kiểm tra: Giảng viên phải là người dạy lớp này
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user!"));
        Teacher currentTeacher = currentUser.getTeacher();

        if (currentTeacher == null) {
            return ResponseEntity.status(403).body("Bạn không phải là giảng viên!");
        }

        if (!classSection.getTeacher().getId().equals(currentTeacher.getId())) {
            return ResponseEntity.status(403).body("Bạn không phải là giảng viên dạy lớp này!");
        }

        List<GradeResponse> grades = gradeService.getClassSectionGrades(classSectionId);
        return ResponseEntity.ok(grades);
    }

    /**
     * Khóa toàn bộ điểm của một lớp học phần
     */
    @Operation(summary = "Khóa điểm toàn bộ lớp học phần")
    @PostMapping("/class/{classSectionId}/lock")
    public ResponseEntity<?> lockClassGrades(@PathVariable Long classSectionId) {
        ClassSection classSection = classSectionRepository.findById(classSectionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp!"));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user!"));
        Teacher currentTeacher = currentUser.getTeacher();

        if (currentTeacher == null) {
            return ResponseEntity.status(403).body("Bạn không phải là giảng viên!");
        }

        if (!classSection.getTeacher().getId().equals(currentTeacher.getId())) {
            return ResponseEntity.status(403).body("Bạn không phải là giảng viên dạy lớp này!");
        }

        classSection.setGradeLocked(true);
        classSectionRepository.save(classSection);
        return ResponseEntity.ok("Đã khóa điểm lớp " + classSectionId);
    }
}
