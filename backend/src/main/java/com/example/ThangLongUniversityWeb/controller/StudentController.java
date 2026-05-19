package com.example.ThangLongUniversityWeb.controller;

import com.example.ThangLongUniversityWeb.dto.response.StudentSemesterResponse;
import com.example.ThangLongUniversityWeb.repository.SemesterRepository;
import com.example.ThangLongUniversityWeb.service.CourseService;
import com.example.ThangLongUniversityWeb.service.EnrollmentRequestStatusService;
import com.example.ThangLongUniversityWeb.service.GradeService;
import com.example.ThangLongUniversityWeb.service.StudentEnrollmentService;
import com.example.ThangLongUniversityWeb.service.StudentTuitionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@Tag(name = "Student - learning and enrollment")
@SecurityRequirement(name = "bearerAuth")
public class StudentController {

    private final StudentEnrollmentService studentEnrollmentService;
    private final StudentTuitionService studentTuitionService;
    private final EnrollmentRequestStatusService enrollmentRequestStatusService;
    private final SemesterRepository semesterRepository;
    private final CourseService courseService;
    private final GradeService gradeService;

    @Operation(summary = "Lay danh sach hoc ky cho sinh vien")
    @GetMapping("/semesters")
    public ResponseEntity<?> getSemesters() {
        return ResponseEntity.ok(semesterRepository.findAll().stream()
                .sorted(Comparator.comparing(s -> s.getStartDate() == null ? LocalDate.MIN : s.getStartDate()))
                .map(s -> new StudentSemesterResponse(
                        s.getId(),
                        s.getName(),
                        s.getStartDate(),
                        s.getEndDate(),
                        s.isRegistrationOpen(),
                        s.isLocked()))
                .collect(Collectors.toList()));
    }

    @Operation(summary = "Xem danh sach lop hoc phan trong mot hoc ky")
    @GetMapping("/classes/semester/{semesterId}")
    public ResponseEntity<?> getAvailableClasses(@PathVariable Long semesterId) {
        return ResponseEntity.ok(studentEnrollmentService.getAvailableClasses(semesterId));
    }

    @Operation(summary = "Dang ky vao mot lop hoc phan")
    @PostMapping("/enroll/{classSectionId}")
    public ResponseEntity<?> registerClass(@PathVariable Long classSectionId) {
        return ResponseEntity.ok(studentEnrollmentService.registerClass(classSectionId));
    }

    @Operation(summary = "Huy dang ky lop hoc phan")
    @DeleteMapping("/enroll/{classSectionId}")
    public ResponseEntity<?> cancelClass(@PathVariable Long classSectionId) {
        return ResponseEntity.ok(studentEnrollmentService.cancelClass(classSectionId));
    }

    @Operation(summary = "Xem thoi khoa bieu ca nhan trong mot hoc ky")
    @GetMapping("/my-schedule/{semesterId}")
    public ResponseEntity<?> getMySchedule(@PathVariable Long semesterId) {
        return ResponseEntity.ok(studentEnrollmentService.getMySchedule(semesterId));
    }

    @Operation(summary = "Xem diem tong hop")
    @GetMapping("/grades")
    public ResponseEntity<?> getMyGrades(@RequestParam(required = false) Long semesterId) {
        return ResponseEntity.ok(studentEnrollmentService.getMyGrades(semesterId));
    }

    @Operation(summary = "Xem lich thi theo hoc ky")
    @GetMapping("/exams")
    public ResponseEntity<?> getMyExams(@RequestParam Long semesterId) {
        return ResponseEntity.ok(studentEnrollmentService.getMyExams(semesterId));
    }

    @Operation(summary = "Check trang thai xu ly dang ky hoc phan")
    @GetMapping("/enrollments/status/{requestId}")
    public ResponseEntity<?> getEnrollmentStatus(@PathVariable String requestId) {
        return ResponseEntity.ok(enrollmentRequestStatusService.getStatus(requestId));
    }

    @Operation(summary = "Xem hoa don hoc phi")
    @GetMapping("/tuition/{semesterId}")
    public ResponseEntity<?> getTuitionFee(@PathVariable Long semesterId) {
        return ResponseEntity.ok(studentTuitionService.getTuitionFee(semesterId));
    }

    @Operation(summary = "Tao link thanh toan VNPAY")
    @PostMapping("/tuition/{semesterId}/vnpay-url")
    public ResponseEntity<?> getVNPayUrl(@PathVariable Long semesterId, HttpServletRequest request) {
        String paymentUrl = studentTuitionService.createVNPayUrl(semesterId, request);
        return ResponseEntity.ok(paymentUrl);
    }

    @Operation(summary = "Nhan ket qua tra ve tu VNPAY")
    @GetMapping("/tuition/vnpay-return")
    public ResponseEntity<?> vnpayReturn(HttpServletRequest request) {
        String result = studentTuitionService.processVNPayReturn(request);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Chuong trinh dao tao - Tat ca mon hoc trong truong")
    @GetMapping("/curriculum")
    public ResponseEntity<?> getCurriculum() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @Operation(summary = "Chuong trinh dao tao - Mon hoc theo nganh cua sinh vien dang nhap")
    @GetMapping("/curriculum/my-major")
    public ResponseEntity<?> getCurriculumByMajor(
            org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(courseService.getCoursesByStudentMajor(authentication.getName()));
    }

    @Operation(summary = "Ket qua hoc tap tong hop: bang diem + GPA/CPA (co the loc theo hoc ky)")
    @GetMapping("/learning-results")
    public ResponseEntity<?> getLearningResults(
            org.springframework.security.core.Authentication authentication,
            @RequestParam(required = false) Long semesterId) {
        return ResponseEntity.ok(gradeService.getLearningResults(authentication.getName(), semesterId));
    }
}
