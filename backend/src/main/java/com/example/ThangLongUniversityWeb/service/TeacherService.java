package com.example.ThangLongUniversityWeb.service;

import com.example.ThangLongUniversityWeb.dto.request.GradeRequest;
import com.example.ThangLongUniversityWeb.dto.request.TeacherRequest;
import com.example.ThangLongUniversityWeb.dto.response.ClassSectionResponse;
import com.example.ThangLongUniversityWeb.dto.response.StudentGradeResponse;
import com.example.ThangLongUniversityWeb.dto.response.StudentSemesterResponse;
import com.example.ThangLongUniversityWeb.audit.Audit;
import com.example.ThangLongUniversityWeb.entity.ClassSection;
import com.example.ThangLongUniversityWeb.entity.Enrollment;
import com.example.ThangLongUniversityWeb.entity.Grade;
import com.example.ThangLongUniversityWeb.entity.Student;
import com.example.ThangLongUniversityWeb.enums.EnrollmentStatus;
import com.example.ThangLongUniversityWeb.enums.EnrollmentType;
import com.example.ThangLongUniversityWeb.enums.Role;
import com.example.ThangLongUniversityWeb.entity.Teacher;
import com.example.ThangLongUniversityWeb.entity.User;
import com.example.ThangLongUniversityWeb.repository.ClassSectionRepository;
import com.example.ThangLongUniversityWeb.repository.EnrollmentRepository;
import com.example.ThangLongUniversityWeb.repository.GradeRepository;
import com.example.ThangLongUniversityWeb.repository.SemesterRepository;
import com.example.ThangLongUniversityWeb.repository.TeacherRepository;
import com.example.ThangLongUniversityWeb.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final ClassSectionRepository classSectionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final GradeRepository gradeRepository;
    private final ClassSectionService classSectionService;
    private final SemesterRepository semesterRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Teacher createTeacher(TeacherRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setRole(Role.TEACHER);
        user.setActive(true);
        User savedUser = userRepository.save(user);

        Teacher teacher = new Teacher();
        teacher.setUser(savedUser);
        teacher.setTeacherCode(request.getTeacherCode());
        teacher.setFullName(request.getFullName());
        teacher.setDob(request.getDob());
        teacher.setDepartment(request.getDepartment());
        teacher.setDegree(request.getDegree());
        teacher.setAddress(request.getAddress());
        teacher.setPhone(request.getPhone());
        return teacherRepository.save(teacher);
    }

    @Transactional
    public Teacher updateTeacher(Long id, TeacherRequest request) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên!"));

        teacher.setFullName(request.getFullName());
        teacher.setDob(request.getDob());
        teacher.setDepartment(request.getDepartment());
        teacher.setDegree(request.getDegree());
        teacher.setAddress(request.getAddress());

        User user = teacher.getUser();
        user.setEmail(request.getEmail());
        userRepository.save(user);

        return teacherRepository.save(teacher);
    }

    @Transactional
    public void deleteTeacher(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên!"));

        User user = teacher.getUser();
        teacherRepository.delete(teacher);
        userRepository.delete(user);
    }

    // Lấy thông tin giảng viên đang đăng nhập
    private Teacher getCurrentTeacher() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return teacherRepository.findByUser_Username(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin giảng viên!"));
    }

    // 1. Xem danh sách lớp được phân công dạy trong kỳ
    public List<ClassSectionResponse> getMyClasses(Long semesterId) {
        Teacher teacher = getCurrentTeacher();
        return classSectionRepository.findByTeacherIdAndSemesterId(teacher.getId(), semesterId)
                .stream()
                .map(classSectionService::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<StudentSemesterResponse> getSemesters() {
        return semesterRepository.findAll().stream()
                .sorted(Comparator.comparing(semester -> semester.getStartDate() == null ? LocalDate.MIN : semester.getStartDate()))
                .map(semester -> new StudentSemesterResponse(
                        semester.getId(),
                        semester.getName(),
                        semester.getStartDate(),
                        semester.getEndDate(),
                        semester.isRegistrationOpen(),
                        semester.isLocked()))
                .collect(Collectors.toList());
    }

    public List<StudentGradeResponse> getStudentsInClass(Long classSectionId) {
        Teacher teacher = getCurrentTeacher();
        ClassSection classSection = classSectionRepository.findById(classSectionId)
                .orElseThrow(() -> new RuntimeException("Lớp học phần không tồn tại!"));

        // BẢO MẬT: Chặn nếu lớp này không phải do giảng viên này dạy
        if (!classSection.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("Bạn không có quyền xem danh sách lớp của giảng viên khác!");
        }

        return enrollmentRepository.findByClassSectionId(classSectionId)
                .stream()
                .filter(enrollment -> enrollment.getStatus() != EnrollmentStatus.PENDING)
                .map(enrollment -> buildStudentGradeResponse(enrollment, enrollment.getGrade()))
                .collect(Collectors.toList());
    }

    // 3. Nhập điểm / Chấm điểm cho sinh viên
    @Transactional
    @Audit(action = "GRADE_UPDATE", targetType = "Enrollment")
    public StudentGradeResponse gradeStudent(Long enrollmentId, GradeRequest request) {
        Teacher teacher = getCurrentTeacher();
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản ghi đăng ký của sinh viên!"));

        if (enrollment.getClassSection().getSemester().isLocked()) {
            throw new RuntimeException("Học kỳ đã bị khóa, không thể sửa điểm.");
        }

        // BẢO MẬT: Kiểm tra xem sinh viên này có học lớp do mình dạy không
        if (!enrollment.getClassSection().getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("Bạn không có quyền chấm điểm cho sinh viên lớp khác!");
        }

        // Lấy hoặc tạo Grade entity
        Grade grade = gradeRepository.findByEnrollmentId(enrollmentId).orElseGet(() -> {
            Grade g = new Grade();
            g.setEnrollment(enrollment);
            g.setAttemptNumber(1);
            g.setEnrollmentType(EnrollmentType.ORDINARY);
            return g;
        });

        validateScore(request.getMidTermScore(), "midTermScore");
        validateScore(request.getFinalScore(), "finalScore");
        grade.setMidtermScore(request.getMidTermScore());
        grade.setFinalScore(request.getFinalScore());
        if (request.getRetestScore() != null) {
            grade.setRetestScore(request.getRetestScore());
        }

        Grade savedGrade = gradeRepository.save(grade);

        // courseStatus được cập nhật tập trung qua CourseOutcomeService (gọi từ GradeService.updateGrade)
        // Đây là endpoint cũ – không tự cập nhật EnrollmentStatus để tránh lặp logic
        return buildStudentGradeResponse(enrollment, savedGrade);
    }

    private StudentGradeResponse buildStudentGradeResponse(Enrollment enrollment, Grade grade) {
        Student student = enrollment.getStudent();
        return StudentGradeResponse.builder()
                .enrollmentId(enrollment.getId())
                .studentCode(student.getStudentCode())
                .fullName(student.getFullName())
                .phone(student.getPhone())
                .email(student.getUser() != null ? student.getUser().getEmail() : null)
                .className(student.getClassName())
                .advisorName(student.getAdvisor())
                .majorName(student.getMajor() != null ? student.getMajor().getName() : null)
                .facultyName(student.getCohort())
                .midTermScore(grade != null ? grade.getMidtermScore() : null)
                .finalScore(grade != null ? grade.getFinalScore() : null)
                .totalScore(grade != null ? grade.getTotalScore() : null)
                .status(enrollment.getStatus().name())
                .courseStatus(enrollment.getCourseStatus() != null ? enrollment.getCourseStatus().name() : null)
                .build();
    }

    private void validateScore(Float score, String field) {
        if (score == null) return;
        if (score < 0.0f || score > 10.0f) {
            throw new RuntimeException("Điểm " + field + " phải nằm trong khoảng [0, 10].");
        }
    }
}
