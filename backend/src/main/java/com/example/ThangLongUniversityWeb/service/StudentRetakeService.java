package com.example.ThangLongUniversityWeb.service;

import com.example.ThangLongUniversityWeb.dto.request.RetakeRegistrationRequest;
import com.example.ThangLongUniversityWeb.dto.response.RetakeEligibleCourseResponse;
import com.example.ThangLongUniversityWeb.dto.response.RetakeRegisteredItemResponse;
import com.example.ThangLongUniversityWeb.dto.response.RetakeRegistrationResponse;
import com.example.ThangLongUniversityWeb.dto.response.RetakeRequestResponse;
import com.example.ThangLongUniversityWeb.entity.ClassSection;
import com.example.ThangLongUniversityWeb.entity.Course;
import com.example.ThangLongUniversityWeb.entity.Enrollment;
import com.example.ThangLongUniversityWeb.entity.Grade;
import com.example.ThangLongUniversityWeb.entity.Student;
import com.example.ThangLongUniversityWeb.entity.SystemSettings;
import com.example.ThangLongUniversityWeb.enums.EnrollmentStatus;
import com.example.ThangLongUniversityWeb.enums.EnrollmentType;
import com.example.ThangLongUniversityWeb.entity.ExamRegistration;
import com.example.ThangLongUniversityWeb.repository.ExamRegistrationRepository;
import com.example.ThangLongUniversityWeb.repository.ClassSectionRepository;
import com.example.ThangLongUniversityWeb.repository.EnrollmentRepository;
import com.example.ThangLongUniversityWeb.repository.GradeRepository;
import com.example.ThangLongUniversityWeb.repository.StudentRepository;
import com.example.ThangLongUniversityWeb.repository.SystemSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class StudentRetakeService {

    /** Diem duoi nguong nay => thi lai (RETAKE) */
    private static final float RETAKE_THRESHOLD = 4.0f;
    /** Diem >= RETAKE va < nguong nay => thi nang diem (IMPROVE) */
    private static final float IMPROVE_MAX_EXCLUSIVE = 8.0f;
    /** Key trong bang system_settings */
    public static final String KEY_RETAKE_FEE = "retake_fee_per_course";
    /** Gia tri mac dinh khi chua cau hinh */
    public static final long DEFAULT_RETAKE_FEE = 200_000L;

    private final StudentRepository studentRepository;
    private final GradeRepository gradeRepository;
    private final ClassSectionRepository classSectionRepository;
    private final ExamRegistrationRepository examRegistrationRepository;
    private final SystemSettingsRepository systemSettingsRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // Lay phi thi lai tu system_settings (fallback mac dinh 200k)
    // ─────────────────────────────────────────────────────────────────────────
    public long getRetakeFee() {
        return systemSettingsRepository.findById(KEY_RETAKE_FEE)
                .map(SystemSettings::getValue)
                .map(v -> {
                    try { return Long.parseLong(v); } catch (NumberFormatException e) { return DEFAULT_RETAKE_FEE; }
                })
                .orElse(DEFAULT_RETAKE_FEE);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Lay danh sach mon du dieu kien thi lai / nang diem
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<RetakeEligibleCourseResponse> getEligibleCourses(Long semesterId) {
        Student student = getCurrentStudent();
        long fee = getRetakeFee();
        return latestCompletedGradesByCourse(student.getId()).stream()
                .filter(this::isEligible)
                .map(grade -> mapEligibleCourse(grade, fee))
                .toList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Dang ky thi lai theo danh sach courseId
    //    Flow: kiem tra dieu kien → tim ClassSection co lich thi → tao Enrollment + Grade moi
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public RetakeRegistrationResponse register(RetakeRegistrationRequest request) {
        if (request == null || request.getCourseIds() == null || request.getCourseIds().isEmpty()) {
            throw new RuntimeException("Can chon it nhat mot mon hoc de dang ky thi lai / thi nang diem.");
        }

        Student student = getCurrentStudent();
        long feePerCourse = getRetakeFee();

        // Build map ket qua moi nhat theo courseId
        Map<Long, Grade> latestByCourse = new LinkedHashMap<>();
        for (Grade g : latestCompletedGradesByCourse(student.getId())) {
            latestByCourse.put(g.getEnrollment().getClassSection().getCourse().getId(), g);
        }

        List<RetakeRegisteredItemResponse> results = new ArrayList<>();

        for (Long courseId : request.getCourseIds().stream().filter(Objects::nonNull).distinct().toList()) {
            Grade latestGrade = latestByCourse.get(courseId);
            if (latestGrade == null) {
                throw new RuntimeException("Ban chua co ket qua mon hoc ID=" + courseId + " de dang ky thi lai.");
            }
            if (!isEligible(latestGrade)) {
                Course course = latestGrade.getEnrollment().getClassSection().getCourse();
                throw new RuntimeException("Mon " + course.getName() + " khong du dieu kien thi lai / thi nang diem.");
            }

            Course course = latestGrade.getEnrollment().getClassSection().getCourse();
            Long semesterId = latestGrade.getEnrollment().getClassSection().getSemester().getId();

            // Xac dinh loai dang ky
            EnrollmentType enrollmentType = latestGrade.getTotalScore() < RETAKE_THRESHOLD
                    ? EnrollmentType.RETAKE : EnrollmentType.IMPROVE;
            int nextAttempt = (latestGrade.getAttemptNumber() != null ? latestGrade.getAttemptNumber() : 1) + 1;

            // Tim ClassSection co lich thi cho mon nay
            ClassSection examSection = findExamSectionForRetake(course.getId(), semesterId);

            // Kiem tra xem da dang ky examRegistration nay chua
            if (examRegistrationRepository.findByStudentIdAndClassSectionId(student.getId(), examSection.getId()).isPresent()) {
                throw new RuntimeException("Ban da dang ky thi mon " + course.getName() + " (Lop: " + examSection.getClassCode() + ") truoc do roi.");
            }

            // Tao ExamRegistration moi
            ExamRegistration examReg = new ExamRegistration();
            examReg.setStudent(student);
            examReg.setClassSection(examSection);
            examReg.setOriginalGrade(latestGrade);
            examReg.setStatus(EnrollmentStatus.REGISTERED);
            examReg.setRegistrationType(enrollmentType);
            examReg.setFeeCharged(feePerCourse);
            examReg.setAttemptNumber(nextAttempt);
            examRegistrationRepository.save(examReg);

            // Build response item
            RetakeRegisteredItemResponse item = new RetakeRegisteredItemResponse();
            item.setCourseId(course.getId());
            item.setCourseCode(course.getCode());
            item.setCourseName(course.getName());
            item.setCredits(course.getCredits());
            item.setRegistrationType(enrollmentType.name());
            item.setAttemptNumber(nextAttempt);
            item.setFeeCharged(feePerCourse);
            if (examSection.getExamAt() != null) {
                item.setExamAt(examSection.getExamAt()
                        .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
                item.setExamRoom(examSection.getExamRoom());
            }
            results.add(item);
        }

        return new RetakeRegistrationResponse(results, (long) results.size() * feePerCourse);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Xem danh sach da dang ky thi lai / nang diem
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<RetakeRequestResponse> getMyRequests(Long semesterId) {
        Student student = getCurrentStudent();
        return examRegistrationRepository.findRetakeRequests(
                        student.getId(),
                        semesterId,
                        List.copyOf(EnumSet.of(EnrollmentType.RETAKE, EnrollmentType.IMPROVE)))
                .stream()
                .map(this::mapRequest)
                .toList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Tim ClassSection co lich thi (examAt != null) cua course trong hoc ky.
     * Uu tien hoc ky hien tai, fallback bat ky hoc ky nao, cuoi cung lay lop dau tien.
     */
    private ClassSection findExamSectionForRetake(Long courseId, Long preferredSemesterId) {
        List<ClassSection> inSameSemester =
                classSectionRepository.findBySemesterIdAndCourseId(preferredSemesterId, courseId);

        return inSameSemester.stream()
                .filter(cs -> cs.getExamAt() != null)
                .findFirst()
                .orElseGet(() -> inSameSemester.stream().findFirst()
                        .orElseGet(() -> classSectionRepository.findAll().stream()
                                .filter(cs -> cs.getCourse().getId().equals(courseId))
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException(
                                        "Khong tim thay lop hoc phan nao cho mon hoc nay. Lien he phong dao tao."))));
    }

    private Student getCurrentStudent() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return studentRepository.findByUser_Username(username)
                .orElseThrow(() -> new RuntimeException("Khong tim thay thong tin sinh vien cua tai khoan nay!"));
    }

    private List<Grade> latestCompletedGradesByCourse(Long studentId) {
        Map<Long, Grade> latestByCourse = new LinkedHashMap<>();
        for (Grade grade : gradeRepository.findCompletedGradesByStudentIdForRetake(studentId)) {
            Long courseId = grade.getEnrollment().getClassSection().getCourse().getId();
            latestByCourse.putIfAbsent(courseId, grade);
        }
        return new ArrayList<>(latestByCourse.values());
    }

    private boolean isEligible(Grade grade) {
        return grade.getTotalScore() != null && grade.getTotalScore() < IMPROVE_MAX_EXCLUSIVE;
    }

    private RetakeEligibleCourseResponse mapEligibleCourse(Grade grade, long fee) {
        Enrollment enrollment = grade.getEnrollment();
        Course course = enrollment.getClassSection().getCourse();
        String type = grade.getTotalScore() < RETAKE_THRESHOLD ? "RETAKE" : "IMPROVE";
        return new RetakeEligibleCourseResponse(
                grade.getId(),
                enrollment.getId(),
                course.getId(),
                course.getCode(),
                course.getName(),
                course.getCredits(),
                grade.getTotalScore(),
                grade.getAttemptNumber(),
                type,
                fee
        );
    }

    private RetakeRequestResponse mapRequest(ExamRegistration reg) {
        ClassSection cs = reg.getClassSection();
        Course course = cs.getCourse();
        return new RetakeRequestResponse(
                reg.getId(), // Return ExamRegistration ID instead of Enrollment ID
                cs.getId(),
                cs.getClassCode(),
                course.getId(),
                course.getCode(),
                course.getName(),
                cs.getSemester().getId(),
                cs.getSemester().getName(),
                reg.getStatus() != null ? reg.getStatus().name() : null,
                reg.getRegistrationType() != null ? reg.getRegistrationType().name() : null,
                reg.getAttemptNumber(),
                reg.getOriginalGrade().getTotalScore() // Show original grade total score
        );
    }
}
