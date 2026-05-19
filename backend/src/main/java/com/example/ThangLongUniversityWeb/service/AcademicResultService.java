package com.example.ThangLongUniversityWeb.service;

import com.example.ThangLongUniversityWeb.entity.*;
import com.example.ThangLongUniversityWeb.repository.AcademicResultRepository;
import com.example.ThangLongUniversityWeb.repository.GradeRepository;
import com.example.ThangLongUniversityWeb.repository.SemesterRepository;
import com.example.ThangLongUniversityWeb.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AcademicResultService {

    private final AcademicResultRepository academicResultRepository;
    private final GradeRepository gradeRepository;
    private final StudentRepository studentRepository;
    private final SemesterRepository semesterRepository;

    /**
     * Tính GPA cho một học kỳ của sinh viên
     */
    @Transactional
    public AcademicResult calculateSemesterGPA(Long studentId, Long semesterId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên!"));

        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học kỳ!"));

        // Lấy danh sách Grade của sinh viên trong học kỳ
        List<Grade> grades = gradeRepository.findByStudentIdAndSemesterId(studentId, semesterId);

        // Lọc chỉ lấy grade có điểm (không null)
        List<Grade> validGrades = grades.stream()
                .filter(g -> g.getTotalScore() != null && g.getLetterGrade() != null)
                .collect(Collectors.toList());

        if (validGrades.isEmpty()) {
            // Không có điểm, không tính GPA
            return null;
        }

        // Tính tổng điểm và tín chỉ
        float totalGradePoints = 0.0f;
        int totalCredits = 0;

        for (Grade grade : validGrades) {
            Course course = grade.getEnrollment().getClassSection().getCourse();
            int credits = course.getCredits() != null ? course.getCredits() : 0;

            // Chuyển letter grade sang grade point
            float gradePoint = convertLetterGradeToPoint(grade.getLetterGrade());

            totalGradePoints += (gradePoint * credits);
            totalCredits += credits;
        }

        // Tính GPA
        float semesterGpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0.0f;

        // Lưu hoặc cập nhật AcademicResult
        AcademicResult result = academicResultRepository.findByStudentIdAndSemesterId(studentId, semesterId)
                .orElse(new AcademicResult());

        result.setStudent(student);
        result.setSemester(semester);
        result.setSemesterGpa(semesterGpa);
        result.setTotalCredits(totalCredits);

        return academicResultRepository.save(result);
    }

    /**
     * Tính CPA tích lũy của sinh viên
     */
    @Transactional
    public AcademicResult calculateCumulativeGPA(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên!"));

        List<Grade> bestGrades = getBestGradesForCPA(studentId);

        if (bestGrades.isEmpty()) {
            return null;
        }

        float totalGradePoints = 0.0f;
        int totalCredits = 0;

        for (Grade grade : bestGrades) {
            Course course = grade.getEnrollment().getClassSection().getCourse();
            int credits = course.getCredits() != null ? course.getCredits() : 0;
            float gradePoint = convertLetterGradeToPoint(grade.getLetterGrade());
            totalGradePoints += (gradePoint * credits);
            totalCredits += credits;
        }

        float cumulativeGpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0.0f;

        AcademicResult result = academicResultRepository.findByStudentIdAndSemesterIdIsNull(studentId)
                .orElse(new AcademicResult());

        result.setStudent(student);
        result.setSemester(null); // null cho CPA tích lũy
        result.setCumulativeGpa(cumulativeGpa);
        result.setCumulativeCredits(totalCredits);

        return academicResultRepository.save(result);
    }

    @Transactional(readOnly = true)
    public List<Grade> getBestGradesForCPA(Long studentId) {
        List<Grade> allGrades = gradeRepository.findByStudentId(studentId);

        return allGrades.stream()
                .filter(g -> g.getTotalScore() != null && g.getLetterGrade() != null)
                .collect(Collectors.groupingBy(
                        g -> g.getEnrollment().getClassSection().getCourse().getId(),
                        Collectors.collectingAndThen(
                                Collectors.maxBy((g1, g2) -> Float.compare(g1.getTotalScore(), g2.getTotalScore())),
                                opt -> opt.orElse(null)
                        )
                ))
                .values().stream()
                .filter(grade -> grade != null)
                .collect(Collectors.toList());
    }

    /**
     * Chuyển letter grade sang grade point
     */
    private float convertLetterGradeToPoint(String letterGrade) {
        if (letterGrade == null) return 0.0f;

        switch (letterGrade.toUpperCase()) {
            case "A": return 4.0f;
            case "B": return 3.0f;
            case "C": return 2.0f;
            case "D": return 1.0f;
            default: return 0.0f;
        }
    }
}
