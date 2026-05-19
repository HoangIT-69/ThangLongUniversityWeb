package com.example.ThangLongUniversityWeb.repository;

import com.example.ThangLongUniversityWeb.entity.ClassSection;
import com.example.ThangLongUniversityWeb.entity.Enrollment;
import com.example.ThangLongUniversityWeb.enums.EnrollmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    // 1. Dùng cho Giảng viên: Lấy danh sách sinh viên của 1 lớp học phần để chấm điểm
    List<Enrollment> findByClassSectionId(Long classSectionId);

    // 2. Dùng cho Sinh viên: Lấy thời khóa biểu / bảng điểm của mình trong 1 kỳ cụ thể
    List<Enrollment> findByStudentIdAndClassSection_SemesterId(Long studentId, Long semesterId);

    List<Enrollment> findByStudentId(Long studentId);

    @Query("SELECT e FROM Enrollment e " +
            "WHERE e.student.id = :studentId AND e.classSection.course.id = :courseId " +
            "ORDER BY e.id DESC")
    List<Enrollment> findByStudentIdAndCourseIdOrderByIdDesc(@Param("studentId") Long studentId,
                                                            @Param("courseId") Long courseId);

    // Tìm tất cả enrollment trong một học kỳ (dùng cho tính GPA)
    List<Enrollment> findByClassSectionSemesterId(Long semesterId);

    // 3. Nghiệp vụ: Kiểm tra xem sinh viên này ĐÃ ĐĂNG KÝ lớp này chưa (để chặn đăng ký trùng)
    boolean existsByStudentIdAndClassSectionId(Long studentId, Long classSectionId);

    // 4. Tìm chính xác 1 bản ghi đăng ký (để Hủy môn hoặc Nhập điểm)
    Optional<Enrollment> findByStudentIdAndClassSectionId(Long studentId, Long classSectionId);

    // 1. Lấy danh sách ID các MÔN HỌC (Course) mà sinh viên ĐÃ QUA MÔN hoặc ĐANG ĐĂNG KÝ
    @Query("SELECT e.classSection.course.id FROM Enrollment e " +
            "WHERE e.student.id = :studentId AND e.status IN ('PASSED', 'REGISTERED')")
    List<Long> findEnrolledOrPassedCourseIdsByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT e.classSection.course.id FROM Enrollment e " +
            "WHERE e.student.id = :studentId AND e.status = 'PASSED'")
    List<Long> findPassedCourseIdsByStudentId(@Param("studentId") Long studentId);

    // 2. Lấy danh sách LỚP HỌC (ClassSection) mà sinh viên đang đăng ký TRONG CÙNG HỌC KỲ
    @Query("SELECT e.classSection FROM Enrollment e " +
            "WHERE e.student.id = :studentId AND e.classSection.semester.id = :semesterId AND e.status = 'REGISTERED'")
    List<ClassSection> findCurrentRegisteredClasses(@Param("studentId") Long studentId, @Param("semesterId") Long semesterId);

    @Query("""
            SELECT e FROM Enrollment e
            WHERE (:semesterId IS NULL OR e.classSection.semester.id = :semesterId)
              AND (:classSectionId IS NULL OR e.classSection.id = :classSectionId)
              AND (:status IS NULL OR e.status = :status)
            """)
    Page<Enrollment> searchAdmin(
            @Param("semesterId") Long semesterId,
            @Param("classSectionId") Long classSectionId,
            @Param("status") EnrollmentStatus status,
            Pageable pageable
    );
}