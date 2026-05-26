package com.example.ThangLongUniversityWeb.repository;

import com.example.ThangLongUniversityWeb.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    // Tìm sinh viên theo mã SV (sau này sẽ cần dùng)
    Optional<Student> findByStudentCode(String studentCode);

    Optional<Student> findByUser_Username(String username);

    List<Student> findByHomeroomId(Long homeroomId);

    long countByHomeroomId(Long homeroomId);

    long countByMajorId(Long majorId);
}
