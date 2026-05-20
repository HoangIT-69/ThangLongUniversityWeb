package com.example.ThangLongUniversityWeb.service;

import com.example.ThangLongUniversityWeb.dto.response.ClassSectionResponse;
import com.example.ThangLongUniversityWeb.dto.response.EnrollmentRequestResponse;
import com.example.ThangLongUniversityWeb.dto.response.EnrollmentResponse;
import com.example.ThangLongUniversityWeb.dto.response.StudentExamResponse;
import com.example.ThangLongUniversityWeb.dto.response.StudentGradeItemResponse;
import com.example.ThangLongUniversityWeb.dto.response.StudentGradesSummaryResponse;
import com.example.ThangLongUniversityWeb.entity.ClassSection;
import com.example.ThangLongUniversityWeb.entity.Course;
import com.example.ThangLongUniversityWeb.entity.Enrollment;
import com.example.ThangLongUniversityWeb.entity.Grade;
import com.example.ThangLongUniversityWeb.entity.Student;
import com.example.ThangLongUniversityWeb.enums.CourseType;
import com.example.ThangLongUniversityWeb.enums.EnrollmentStatus;
import com.example.ThangLongUniversityWeb.repository.ClassSectionRepository;
import com.example.ThangLongUniversityWeb.repository.EnrollmentRepository;
import com.example.ThangLongUniversityWeb.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
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

    private final EnrollmentRepository enrollmentRepository;
    private final ClassSectionRepository classSectionRepository;
    private final StudentRepository studentRepository;
    private final ClassSectionService classSectionService;

    private Student getCurrentStudent() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return studentRepository.findByUser_Username(username)
                .orElseThrow(() -> new RuntimeException("Khong tim thay thong tin sinh vien cua tai khoan nay!"));
    }

    public List<ClassSectionResponse> getAvailableClasses(Long semesterId) {
        Student student = getCurrentStudent();
        List<ClassSection> allSectionsInSemester = classSectionRepository.findBySemesterId(semesterId);

        return allSectionsInSemester.stream()
                .filter(section -> isVisibleForStudentMajor(section, student))
                .filter(section -> {
                    List<Enrollment> sameCourseEnrollments = enrollmentRepository.findByStudentIdAndCourseIdOrderByIdDesc(
                            student.getId(), section.getCourse().getId());
                    return sameCourseEnrollments.stream().noneMatch(e -> e.getStatus() == EnrollmentStatus.REGISTERED
                            && e.getClassSection().getSemester().getId().equals(section.getSemester().getId()));
                })
                .map(classSectionService::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public EnrollmentRequestResponse registerClass(Long classSectionId) {
        Student student = getCurrentStudent();
        ClassSection targetClass = classSectionRepository.findById(classSectionId)
                .orElseThrow(() -> new RuntimeException("Lop hoc phan khong ton tai!"));

        if (!targetClass.getSemester().isRegistrationOpen()) {
            throw new RuntimeException("Hoc ky nay hien khong mo cong dang ky!");
        }
        if (targetClass.getSemester().isLocked()) {
            throw new RuntimeException("Hoc ky nay da bi khoa/chot.");
        }
        if (targetClass.isClosed()) {
            throw new RuntimeException("Lop hoc phan da bi khoa!");
        }

        Enrollment existingEnrollment = enrollmentRepository.findByStudentIdAndClassSectionId(student.getId(), classSectionId)
                .orElse(null);
        if (existingEnrollment != null && existingEnrollment.getStatus() == EnrollmentStatus.PENDING) {
            return new EnrollmentRequestResponse(null,
                    "Lop " + targetClass.getClassCode() + " da co trong danh sach chon.");
        }
        if (existingEnrollment != null && existingEnrollment.getStatus() == EnrollmentStatus.REGISTERED) {
            throw new RuntimeException("Lop " + targetClass.getClassCode() + " da duoc chot dang ky.");
        }

        List<Enrollment> previousCourseEnrollments = enrollmentRepository.findByStudentIdAndCourseIdOrderByIdDesc(
                student.getId(), targetClass.getCourse().getId());
        if (previousCourseEnrollments.stream().anyMatch(e -> isActiveSelection(e)
                && e.getClassSection().getSemester().getId().equals(targetClass.getSemester().getId()))) {
            throw new RuntimeException("Ban da chon/dang ky mon nay trong cung hoc ky.");
        }

        Set<Course> prereqs = targetClass.getCourse().getPrerequisites();
        if (prereqs != null && !prereqs.isEmpty()) {
            List<Long> passedCourseIds = enrollmentRepository.findPassedCourseIdsByStudentId(student.getId());
            List<String> missing = prereqs.stream()
                    .filter(p -> p != null && p.getId() != null && !passedCourseIds.contains(p.getId()))
                    .map(p -> (p.getMajor() != null ? p.getMajor().getMajorCode() : "Unknown") + " - " + p.getName())
                    .collect(Collectors.toList());
            if (!missing.isEmpty()) {
                throw new RuntimeException("Ban chua hoan thanh mon tien quyet: " + String.join(", ", missing));
            }
        }

        List<ClassSection> currentClasses = enrollmentRepository.findCurrentSelectedOrRegisteredClasses(
                student.getId(), targetClass.getSemester().getId());
        for (ClassSection enrolledClass : currentClasses) {
            if (enrolledClass.isOverlapping(targetClass)) {
                throw new RuntimeException("Trung lich hoc voi lop: " + enrolledClass.getClassCode());
            }
        }

        Enrollment enrollment = existingEnrollment != null ? existingEnrollment : new Enrollment();
        enrollment.setStudent(student);
        enrollment.setClassSection(targetClass);
        enrollment.setStatus(EnrollmentStatus.PENDING);
        enrollmentRepository.save(enrollment);

        return new EnrollmentRequestResponse(null,
                "Da them lop " + targetClass.getClassCode() + " vao danh sach chon.");
    }

    @Transactional
    public String cancelClass(Long classSectionId) {
        Student student = getCurrentStudent();
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndClassSectionId(student.getId(), classSectionId)
                .orElseThrow(() -> new RuntimeException("Ban chua chon lop nay nen khong the bo chon!"));

        if (!enrollment.getClassSection().getSemester().isRegistrationOpen()
                || enrollment.getClassSection().getSemester().isLocked()) {
            throw new RuntimeException("Da het han bo chon hoc phan!");
        }
        if (enrollment.getStatus() != EnrollmentStatus.PENDING) {
            throw new RuntimeException("Chi co the bo chon lop dang o trang thai PENDING.");
        }

        String classCode = enrollment.getClassSection().getClassCode();
        enrollmentRepository.delete(enrollment);
        return "Da bo chon lop " + classCode + " thanh cong!";
    }

    public List<EnrollmentResponse> getMySchedule(Long semesterId) {
        Student student = getCurrentStudent();
        return enrollmentRepository.findByStudentIdAndClassSection_SemesterIdAndStatus(
                        student.getId(), semesterId, EnrollmentStatus.REGISTERED)
                .stream()
                .map(this::mapToEnrollmentResponse)
                .collect(Collectors.toList());
    }

    public List<EnrollmentResponse> getSelectedEnrollments(Long semesterId) {
        Student student = getCurrentStudent();
        return enrollmentRepository.findByStudentIdAndClassSection_SemesterIdAndStatus(
                        student.getId(), semesterId, EnrollmentStatus.PENDING)
                .stream()
                .map(this::mapToEnrollmentResponse)
                .collect(Collectors.toList());
    }

    public List<StudentExamResponse> getMyExams(Long semesterId) {
        Student student = getCurrentStudent();
        return enrollmentRepository.findByStudentIdAndClassSection_SemesterIdAndStatus(
                        student.getId(), semesterId, EnrollmentStatus.REGISTERED)
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

    private boolean isActiveSelection(Enrollment enrollment) {
        return enrollment.getStatus() == EnrollmentStatus.PENDING || enrollment.getStatus() == EnrollmentStatus.REGISTERED;
    }

    private boolean isVisibleForStudentMajor(ClassSection section, Student student) {
        Course course = section.getCourse();
        CourseType courseType = course.getCourseType() != null ? course.getCourseType() : CourseType.REQUIRED;
        if (courseType == CourseType.ELECTIVE) {
            return true;
        }
        if (student.getMajor() == null || course.getMajor() == null) {
            return false;
        }
        return Objects.equals(course.getMajor().getId(), student.getMajor().getId());
    }

    private EnrollmentResponse mapToEnrollmentResponse(Enrollment enrollment) {
        Grade grade = enrollment.getGrade();
        return EnrollmentResponse.builder()
                .enrollmentId(enrollment.getId())
                .classSectionId(enrollment.getClassSection().getId())
                .classCode(enrollment.getClassSection().getClassCode())
                .courseCode(enrollment.getClassSection().getCourse().getCode())
                .courseName(enrollment.getClassSection().getCourse().getName())
                .credits(enrollment.getClassSection().getCourse().getCredits())
                .room(enrollment.getClassSection().getRoom() != null ? enrollment.getClassSection().getRoom().getName() : null)
                .dayOfWeek(enrollment.getClassSection().getDayOfWeek())
                .startPeriod(enrollment.getClassSection().getStartPeriod().getPeriodNumber())
                .endPeriod(enrollment.getClassSection().getEndPeriod().getPeriodNumber())
                .teacherName(enrollment.getClassSection().getTeacher() != null
                        ? enrollment.getClassSection().getTeacher().getFullName()
                        : "Chua co")
                .midTermScore(grade != null ? grade.getMidtermScore() : null)
                .finalScore(grade != null ? grade.getFinalScore() : null)
                .totalScore(grade != null ? grade.getTotalScore() : null)
                .status(enrollment.getStatus().name())
                .build();
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
