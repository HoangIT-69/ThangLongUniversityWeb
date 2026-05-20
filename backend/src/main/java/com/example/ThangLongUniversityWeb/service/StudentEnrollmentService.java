package com.example.ThangLongUniversityWeb.service;

import com.example.ThangLongUniversityWeb.dto.response.ClassSectionResponse;
import com.example.ThangLongUniversityWeb.dto.response.EnrollmentRequestResponse;
import com.example.ThangLongUniversityWeb.dto.response.EnrollmentResponse;
import com.example.ThangLongUniversityWeb.dto.response.StudentGradeItemResponse;
import com.example.ThangLongUniversityWeb.dto.response.StudentGradesSummaryResponse;
import com.example.ThangLongUniversityWeb.dto.response.StudentExamResponse;
import com.example.ThangLongUniversityWeb.entity.ClassSection;
import com.example.ThangLongUniversityWeb.entity.Enrollment;
import com.example.ThangLongUniversityWeb.entity.Grade;
import com.example.ThangLongUniversityWeb.entity.Student;
import com.example.ThangLongUniversityWeb.enums.EnrollmentStatus;
import com.example.ThangLongUniversityWeb.repository.ClassSectionRepository;
import com.example.ThangLongUniversityWeb.repository.EnrollmentRepository;
import com.example.ThangLongUniversityWeb.repository.StudentRepository;
import com.example.ThangLongUniversityWeb.utils.ScheduleUtils;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentEnrollmentService {
    private static final Logger log = LoggerFactory.getLogger(StudentEnrollmentService.class);

    private final EnrollmentRepository enrollmentRepository;
    private final ClassSectionRepository classSectionRepository;
    private final StudentRepository studentRepository;
    private final ClassSectionService classSectionService;
    private final EnrollmentRequestStatusService enrollmentRequestStatusService;

    /**
     * Strategy pattern: DirectEnrollmentProcessor (kafka=false) hoặc KafkaEnrollmentProcessor (kafka=true).
     * Được inject bởi Spring dựa vào @ConditionalOnProperty.
     */
    private final EnrollmentProcessor enrollmentProcessor;

    // --- HÀM TIỆN ÍCH: LẤY THÔNG TIN SINH VIÊN TỪ TOKEN ---
    private Student getCurrentStudent() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return studentRepository.findByUser_Username(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin sinh viên của tài khoản này!"));
    }

    // 1. XEM DANH SÁCH LỚP ĐANG MỞ (Đã giấu các môn đã học / đang học)
    public List<ClassSectionResponse> getAvailableClasses(Long semesterId) {
        Student student = getCurrentStudent();

        List<ClassSection> allSectionsInSemester = classSectionRepository.findBySemesterId(semesterId);

        return allSectionsInSemester.stream()
                .filter(section -> {
                    List<Enrollment> sameCourseEnrollments = enrollmentRepository.findByStudentIdAndCourseIdOrderByIdDesc(student.getId(), section.getCourse().getId());
                    return sameCourseEnrollments.stream().noneMatch(e -> e.getStatus() == EnrollmentStatus.REGISTERED
                            && e.getClassSection().getSemester().getId().equals(section.getSemester().getId()));
                })
                .map(classSectionService::mapToResponse)
                .collect(Collectors.toList());
    }

    // 2. ĐĂNG KÝ MÔN HỌC — sử dụng EnrollmentProcessor (Direct hoặc Kafka)
    @Transactional
    public EnrollmentRequestResponse registerClass(Long classSectionId) {
        Student student = getCurrentStudent();

        ClassSection targetClass = classSectionRepository.findById(classSectionId)
                .orElseThrow(() -> new RuntimeException("Lớp học phần không tồn tại!"));

        // Luật 1 & 2: Mở cửa + Còn slot
        if (!targetClass.getSemester().isRegistrationOpen()) {
            throw new RuntimeException("Học kỳ này hiện không mở cổng đăng ký!");
        }
        if (targetClass.isClosed() || targetClass.getCurrentSlots() >= targetClass.getMaxSlots()) {
            throw new RuntimeException("Lớp học đã đầy hoặc bị khóa!");
        }

        // Luật 3: Chống trùng môn trong cùng học kỳ
        List<Enrollment> previousCourseEnrollments = enrollmentRepository.findByStudentIdAndCourseIdOrderByIdDesc(student.getId(), targetClass.getCourse().getId());
        if (previousCourseEnrollments.stream().anyMatch(e -> e.getStatus() == EnrollmentStatus.REGISTERED &&
                e.getClassSection().getSemester().getId().equals(targetClass.getSemester().getId()))) {
            throw new RuntimeException("Bạn đã đăng ký môn này rồi trong cùng học kỳ.");
        }

        // Luật 3.1: Check môn học tiên quyết
        Set<com.example.ThangLongUniversityWeb.entity.Course> prereqs = targetClass.getCourse().getPrerequisites();
        if (prereqs != null && !prereqs.isEmpty()) {
            List<Long> passedCourseIds = enrollmentRepository.findPassedCourseIdsByStudentId(student.getId());
            List<String> missing = prereqs.stream()
                    .filter(p -> p != null && p.getId() != null && !passedCourseIds.contains(p.getId()))
                    .map(p -> (p.getMajor() != null ? p.getMajor().getMajorCode() : "Unknown") + " - " + p.getName())
                    .collect(Collectors.toList());
            if (!missing.isEmpty()) {
                throw new RuntimeException("Bạn chưa hoàn thành môn tiên quyết: " + String.join(", ", missing));
            }
        }

        // Luật 4: Chống trùng thời khóa biểu
        List<ClassSection> currentRegisteredClasses = enrollmentRepository.findCurrentRegisteredClasses(student.getId(), targetClass.getSemester().getId());
        for (ClassSection enrolledClass : currentRegisteredClasses) {
            if (enrolledClass.isOverlapping(targetClass)) {
                throw new RuntimeException("Trùng lịch học với lớp: " + enrolledClass.getClassCode()
                        + " (T" + enrolledClass.getDayOfWeek() + "(" + enrolledClass.getStartPeriod().getPeriodNumber() + "-" + enrolledClass.getEndPeriod().getPeriodNumber() + "))");
            }
        }

        // =========== DELEGATE TO PROCESSOR (Direct hoặc Kafka) ===========
        return enrollmentProcessor.process(student, targetClass);
    }

    // 3. HỦY MÔN HỌC (RÚT ĐĂNG KÝ)
    @Transactional
    public String cancelClass(Long classSectionId) {
        Student student = getCurrentStudent();

        Enrollment enrollment = enrollmentRepository.findByStudentIdAndClassSectionId(student.getId(), classSectionId)
                .orElseThrow(() -> new RuntimeException("Bạn chưa đăng ký lớp này nên không thể hủy!"));

        if (!enrollment.getClassSection().getSemester().isRegistrationOpen()) {
            throw new RuntimeException("Đã hết hạn rút môn học!");
        }

        enrollmentRepository.delete(enrollment);

        ClassSection classSection = enrollment.getClassSection();
        classSection.setCurrentSlots(classSection.getCurrentSlots() - 1);
        classSectionRepository.save(classSection);

        return "Đã hủy đăng ký lớp " + classSection.getClassCode() + " thành công!";
    }

    // 4. XEM TKB CỦA MÌNH
    public List<EnrollmentResponse> getMySchedule(Long semesterId) {
        Student student = getCurrentStudent();

        return enrollmentRepository.findByStudentIdAndClassSection_SemesterId(student.getId(), semesterId)
                .stream()
                .map(enrollment -> {
                    Grade grade = enrollment.getGrade();
                    return EnrollmentResponse.builder()
                            .enrollmentId(enrollment.getId())
                            .classSectionId(enrollment.getClassSection().getId())
                            .classCode(enrollment.getClassSection().getClassCode())
                            .courseName(enrollment.getClassSection().getCourse().getName())
                            .credits(enrollment.getClassSection().getCourse().getCredits())
                            .room(enrollment.getClassSection().getRoom() != null ? enrollment.getClassSection().getRoom().getName() : null)
                            .dayOfWeek(enrollment.getClassSection().getDayOfWeek())
                            .startPeriod(enrollment.getClassSection().getStartPeriod().getPeriodNumber())
                            .endPeriod(enrollment.getClassSection().getEndPeriod().getPeriodNumber())
                            .teacherName(enrollment.getClassSection().getTeacher() != null ?
                                    enrollment.getClassSection().getTeacher().getFullName() : "Chưa có")
                            // Điểm lấy từ Grade (nguồn sự thật duy nhất)
                            .midTermScore(grade != null ? grade.getMidtermScore() : null)
                            .finalScore(grade != null ? grade.getFinalScore() : null)
                            .totalScore(grade != null ? grade.getTotalScore() : null)
                            .status(enrollment.getStatus().name())
                            .build();
                })
                .collect(Collectors.toList());
    }

    public List<StudentExamResponse> getMyExams(Long semesterId) {
        Student student = getCurrentStudent();
        return enrollmentRepository.findByStudentIdAndClassSection_SemesterId(student.getId(), semesterId)
                .stream()
                .map(e -> new StudentExamResponse(
                        e.getClassSection().getClassCode(),
                        e.getClassSection().getCourse().getName(),
                        e.getClassSection().getCourse().getCredits(),
                        e.getClassSection().getExamAt(),
                        e.getClassSection().getExamRoom()
                ))
                .collect(Collectors.toList());
    }

    public StudentGradesSummaryResponse getMyGrades(Long semesterId) {
        Student student = getCurrentStudent();
        List<Enrollment> all = enrollmentRepository.findByStudentId(student.getId());

        // Chỉ tính những enrollment có Grade đã có totalScore
        List<Enrollment> filtered = all.stream()
                .filter(e -> semesterId == null || Objects.equals(e.getClassSection().getSemester().getId(), semesterId))
                .filter(e -> e.getGrade() != null && e.getGrade().getTotalScore() != null)
                .collect(Collectors.toList());

        List<StudentGradeItemResponse> items = filtered.stream()
                .map(e -> {
                    Grade grade = e.getGrade();
                    int credits = e.getClassSection().getCourse().getCredits();
                    double gp = toGradePoint(grade.getTotalScore());
                    return new StudentGradeItemResponse(
                            e.getId(),
                            e.getClassSection().getSemester().getId(),
                            e.getClassSection().getSemester().getName(),
                            e.getClassSection().getClassCode(),
                            e.getClassSection().getCourse().getName(),
                            credits,
                            grade.getTotalScore(),
                            gp
                    );
                })
                .collect(Collectors.toList());

        double semesterGpa = computeGpa(items.stream()
                .filter(i -> semesterId == null || Objects.equals(i.getSemesterId(), semesterId))
                .collect(Collectors.toList()));

        double cumulativeGpa = computeGpa(
                all.stream()
                        .filter(e -> e.getGrade() != null && e.getGrade().getTotalScore() != null)
                        .map(e -> new StudentGradeItemResponse(
                                e.getId(),
                                e.getClassSection().getSemester().getId(),
                                e.getClassSection().getSemester().getName(),
                                e.getClassSection().getClassCode(),
                                e.getClassSection().getCourse().getName(),
                                e.getClassSection().getCourse().getCredits(),
                                e.getGrade().getTotalScore(),
                                toGradePoint(e.getGrade().getTotalScore())
                        ))
                        .collect(Collectors.toList())
        );

        return new StudentGradesSummaryResponse(semesterId, round2(semesterGpa), round2(cumulativeGpa), items);
    }

    private double toGradePoint(float totalScore10) {
        double gp = (totalScore10 / 10.0) * 4.0;
        if (gp < 0) gp = 0;
        if (gp > 4) gp = 4;
        return gp;
    }

    private double computeGpa(List<StudentGradeItemResponse> items) {
        double totalWeighted = 0.0;
        int totalCredits = 0;
        for (StudentGradeItemResponse i : items) {
            if (i.getCredits() == null || i.getCredits() <= 0) continue;
            totalCredits += i.getCredits();
            totalWeighted += i.getGradePoint() * i.getCredits();
        }
        if (totalCredits == 0) return 0.0;
        return totalWeighted / totalCredits;
    }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
