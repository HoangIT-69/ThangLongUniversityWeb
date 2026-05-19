package com.example.ThangLongUniversityWeb.repository;

import com.example.ThangLongUniversityWeb.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    // Tìm giảng viên theo mã GV (sau này sẽ cần dùng)
    Optional<Teacher> findByTeacherCode(String teacherCode);

    Optional<Teacher> findByUser_Username(String username);
}