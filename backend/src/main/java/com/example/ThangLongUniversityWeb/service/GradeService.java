package com.example.ThangLongUniversityWeb.service;

import com.example.ThangLongUniversityWeb.dto.request.GradeRequest;
import com.example.ThangLongUniversityWeb.dto.response.GradeResponse;
import com.example.ThangLongUniversityWeb.dto.response.LearningResultsResponse;
import com.example.ThangLongUniversityWeb.dto.response.LearningResultsResponse.SemesterGpaSummary;
import com.example.ThangLongUniversityWeb.entity.*;
import com.example.ThangLongUniversityWeb.repository.AcademicResultRepository;
import com.example.ThangLongUniversityWeb.repository.EnrollmentRepository;
import com.example.ThangLongUniversityWeb.repository.GradeRepository;
import com.example.ThangLongUniversityWeb.repository.SemesterRepository;
import com.example.ThangLongUniversityWeb.repository.StudentRepository;
import com.example.ThangLongUniversityWeb.repository.ExamRegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GradeService {

    private final GradeRepository gradeRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AcademicResultRepository academicResultRepository;
    private final StudentRepository studentRepository;
    private final SemesterRepository semesterRepository;
    private final ExamRegistrationRepository examRegistrationRepository;

    /**
     * Tạo hoặc cập nhật điểm cho sinh viên
     */
    @Transactional
    public GradeResponse updateGrade(GradeRequest request) {
        Enrollment enrollment = enrollmentRepository.findById(request.getEnrollmentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy enrollment!"));

        Grade grade = gradeRepository.findByEnrollmentId(request.getEnrollmentId())
                .orElseGet(Grade::new);

        grade.setEnrollment(enrollment);
        grade.setParticipationScore(request.getParticipationScore());
        grade.setMidtermScore(request.getMidTermScore());
        grade.setFinalScore(request.getFinalScore());
        grade.setRetestScore(request.getRetestScore());

        Grade savedGrade = gradeRepository.save(grade);
        return mapToResponse(savedGrade);
    }

    /**
     * Lấy bảng điểm của sinh viên theo học kỳ
     */
    @Transactional(readOnly = true)
    public List<GradeResponse> getStudentGradesBySemester(Long studentId, Long semesterId) {
        return gradeRepository.findByStudentIdAndSemesterId(studentId, semesterId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy bảng điểm của sinh viên tất cả kỳ
     */
    @Transactional(readOnly = true)
    public List<GradeResponse> getStudentAllGrades(Long studentId) {
        return gradeRepository.findByStudentId(studentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy bảng điểm của lớp (cho giảng viên xem)
     * Bao gồm cả sinh viên học chính thức và sinh viên đăng ký thi lại/cải thiện vào lớp này.
     */
    @Transactional(readOnly = true)
    public List<GradeResponse> getClassSectionGrades(Long classSectionId) {
        // 1. Sinh viên học chính thức (qua Enrollment)
        List<GradeResponse> regularGrades = gradeRepository.findByClassSectionId(classSectionId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        // 2. Sinh viên thi lại/cải thiện (qua ExamRegistration)
        List<GradeResponse> retakeGrades = examRegistrationRepository.findByClassSectionId(classSectionId).stream()
                .map(reg -> {
                    GradeResponse res = mapToResponse(reg.getOriginalGrade());
                    // Ghi đè loại đăng ký để giảng viên biết đây là thi lại/cải thiện
                    res.setEnrollmentType(reg.getRegistrationType() != null ? reg.getRegistrationType().name() : "RETAKE");
                    return res;
                })
                .collect(Collectors.toList());

        regularGrades.addAll(retakeGrades);
        return regularGrades;
    }

    /**
     * Lay ket qua hoc tap tong hop: bang diem + GPA/CPA cho sinh vien (portal)
     */
    @Transactional(readOnly = true)
    public LearningResultsResponse getLearningResults(String username, Long semesterId) {
        var student = studentRepository.findByUser_Username(username)
                .orElseThrow(() -> new RuntimeException("Khong tim thay sinh vien!"));
        Long studentId = student.getId();

        List<GradeResponse> allGradeResponses = getStudentAllGrades(studentId);
        List<GradeResponse> allGrades = allGradeResponses.stream()
                .filter(this::hasCompletedGrade)
                .collect(Collectors.toList());

        List<GradeResponse> grades = semesterId != null
                ? getStudentGradesBySemester(studentId, semesterId)
                : allGradeResponses;
        List<GradeResponse> completedGradesForSelectedSemester = grades.stream()
                .filter(this::hasCompletedGrade)
                .collect(Collectors.toList());

        Map<Long, List<GradeResponse>> gradesBySemester = allGrades.stream()
                .filter(g -> g.getSemesterId() != null)
                .collect(Collectors.groupingBy(
                        GradeResponse::getSemesterId,
                        LinkedHashMap::new,
                        Collectors.toList()));

        List<Map.Entry<Long, List<GradeResponse>>> chronologicalSemesters = gradesBySemester.entrySet().stream()
                .sorted(Comparator.comparing(e -> findSemesterOrderDate(e.getKey())))
                .collect(Collectors.toList());

        Map<Long, GradeResponse> bestGradesByCourse = new LinkedHashMap<>();
        List<SemesterGpaSummary> semesterSummaries = chronologicalSemesters.stream()
                .map(entry -> {
                    entry.getValue().forEach(grade -> bestGradesByCourse.merge(
                            grade.getCourseId(),
                            grade,
                            this::betterGrade));

                    List<GradeResponse> cumulativeBestGrades = List.copyOf(bestGradesByCourse.values());
                    return SemesterGpaSummary.builder()
                            .semesterId(entry.getKey())
                            .semesterName(entry.getValue().isEmpty() ? null : entry.getValue().get(0).getSemesterName())
                            .semesterGpa(round2(computeGpa(entry.getValue())))
                            .cumulativeGpa(round2(computeGpa(cumulativeBestGrades)))
                            .totalCredits(sumAttemptedCredits(entry.getValue()))
                            .cumulativeCredits(sumPassedCredits(cumulativeBestGrades))
                            .build();
                })
                .sorted(Comparator.comparing(SemesterGpaSummary::getSemesterId).reversed())
                .collect(Collectors.toList());

        List<GradeResponse> bestGrades = getBestGradesByCourse(allGrades);
        Float semGpa = semesterId != null ? round2(computeGpa(completedGradesForSelectedSemester)) : null;
        Float cumGpa = round2(computeGpa(bestGrades));
        Integer semCredits = semesterId != null ? sumAttemptedCredits(completedGradesForSelectedSemester) : null;
        Integer cumCredits = sumPassedCredits(bestGrades);
        String semesterName = semesterId != null
                ? grades.stream().findFirst().map(GradeResponse::getSemesterName)
                        .orElseGet(() -> semesterRepository.findById(semesterId).map(Semester::getName).orElse(null))
                : null;

        return LearningResultsResponse.builder()
                .semesterId(semesterId)
                .semesterName(semesterName)
                .semesterGpa(semGpa)
                .cumulativeGpa(cumGpa)
                .semesterCredits(semCredits)
                .cumulativeCredits(cumCredits)
                .grades(grades)
                .semesterSummaries(semesterSummaries)
                .build();
    }

    private boolean hasCompletedGrade(GradeResponse grade) {
        return grade.getTotalScore() != null && grade.getGradePoint() != null && grade.getCredits() != null;
    }

    private java.time.LocalDate findSemesterOrderDate(Long semesterId) {
        return semesterRepository.findById(semesterId)
                .map(s -> s.getStartDate() != null ? s.getStartDate() : java.time.LocalDate.MIN.plusDays(s.getId()))
                .orElse(java.time.LocalDate.MIN);
    }

    private List<GradeResponse> getBestGradesByCourse(List<GradeResponse> grades) {
        Map<Long, GradeResponse> bestGrades = new LinkedHashMap<>();
        grades.forEach(grade -> bestGrades.merge(grade.getCourseId(), grade, this::betterGrade));
        return List.copyOf(bestGrades.values());
    }

    private GradeResponse betterGrade(GradeResponse current, GradeResponse candidate) {
        float currentPoint = current.getGradePoint() != null ? current.getGradePoint() : 0f;
        float candidatePoint = candidate.getGradePoint() != null ? candidate.getGradePoint() : 0f;
        if (Float.compare(candidatePoint, currentPoint) != 0) {
            return candidatePoint > currentPoint ? candidate : current;
        }

        float currentScore = current.getTotalScore() != null ? current.getTotalScore() : 0f;
        float candidateScore = candidate.getTotalScore() != null ? candidate.getTotalScore() : 0f;
        return candidateScore > currentScore ? candidate : current;
    }

    private float computeGpa(List<GradeResponse> grades) {
        float totalWeightedPoints = 0f;
        int totalCredits = 0;
        for (GradeResponse grade : grades) {
            if (!hasCompletedGrade(grade) || grade.getCredits() <= 0) {
                continue;
            }
            totalWeightedPoints += grade.getGradePoint() * grade.getCredits();
            totalCredits += grade.getCredits();
        }
        return totalCredits == 0 ? 0f : totalWeightedPoints / totalCredits;
    }

    private int sumAttemptedCredits(List<GradeResponse> grades) {
        return grades.stream()
                .filter(this::hasCompletedGrade)
                .mapToInt(GradeResponse::getCredits)
                .sum();
    }

    private int sumPassedCredits(List<GradeResponse> grades) {
        return grades.stream()
                .filter(this::hasCompletedGrade)
                .filter(grade -> grade.getGradePoint() > 0f)
                .mapToInt(GradeResponse::getCredits)
                .sum();
    }

    private Float round2(float value) {
        return Math.round(value * 100f) / 100f;
    }

    /**
     * Chuyển đổi Grade Entity sang DTO
     */
    private GradeResponse mapToResponse(Grade grade) {
        Enrollment enrollment = grade.getEnrollment();
        Student student = enrollment.getStudent();
        ClassSection classSection = enrollment.getClassSection();
        Course course = classSection.getCourse();
        Semester semester = classSection.getSemester();

        return GradeResponse.builder()
                .id(grade.getId())
                .enrollmentId(enrollment.getId())
                .studentId(student.getId())
                .studentCode(student.getStudentCode())
                .studentName(student.getFullName())
                .courseId(course.getId())
                .courseCode(course.getCode())
                .classCode(classSection.getClassCode())
                .courseName(course.getName())
                .credits(course.getCredits())
                .semesterId(semester.getId())
                .semesterName(semester.getName())
                .participationScore(grade.getParticipationScore())
                .midtermScore(grade.getMidtermScore())
                .finalScore(grade.getFinalScore())
                .retestScore(grade.getRetestScore())
                .attemptNumber(grade.getAttemptNumber())
                .enrollmentType(grade.getEnrollmentType() != null ? grade.getEnrollmentType().name() : null)
                .totalScore(grade.getTotalScore())
                .letterGrade(grade.getLetterGrade())
                .gpa4(grade.getGpa4())
                .gradePoint(grade.getGpa4())
                .createdAt(grade.getCreatedAt())
                .updatedAt(grade.getUpdatedAt())
                .build();
    }
}
