package com.example.ThangLongUniversityWeb.repository;

import com.example.ThangLongUniversityWeb.entity.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, Long> {
    Optional<Semester> findByName(String name);

    // Tìm các học kỳ ĐANG MỞ cửa cho sinh viên đăng ký tín chỉ
    List<Semester> findByIsRegistrationOpenTrue();
}