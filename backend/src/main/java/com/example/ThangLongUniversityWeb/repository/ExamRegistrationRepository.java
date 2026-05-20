package com.example.ThangLongUniversityWeb.repository;

import com.example.ThangLongUniversityWeb.entity.ExamRegistration;
import com.example.ThangLongUniversityWeb.enums.EnrollmentStatus;
import com.example.ThangLongUniversityWeb.enums.EnrollmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamRegistrationRepository extends JpaRepository<ExamRegistration, Long> {

    @Query("SELECT e FROM ExamRegistration e WHERE e.student.id = :studentId AND e.classSection.semester.id = :semesterId AND e.registrationType IN :types")
    List<ExamRegistration> findRetakeRequests(
            @Param("studentId") Long studentId,
            @Param("semesterId") Long semesterId,
            @Param("types") List<EnrollmentType> types
    );
    
    Optional<ExamRegistration> findByStudentIdAndClassSectionId(Long studentId, Long classSectionId);

    Optional<ExamRegistration> findByStudentIdAndClassSectionCourseId(Long studentId, Long courseId);

    List<ExamRegistration> findByClassSectionId(Long classSectionId);

    List<ExamRegistration> findByClassSectionIdAndStatus(Long classSectionId, EnrollmentStatus status);

    List<ExamRegistration> findByClassSectionSemesterIdAndStatus(Long semesterId, EnrollmentStatus status);

    List<ExamRegistration> findByStudentIdAndClassSectionSemesterIdAndStatus(Long studentId, Long semesterId, EnrollmentStatus status);

    List<ExamRegistration> findByOriginalGrade_Enrollment_Id(Long enrollmentId);
}
