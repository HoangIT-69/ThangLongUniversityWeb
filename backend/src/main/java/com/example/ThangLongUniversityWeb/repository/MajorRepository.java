package com.example.ThangLongUniversityWeb.repository;

import com.example.ThangLongUniversityWeb.entity.Major;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MajorRepository extends JpaRepository<Major, Long> {
    Optional<Major> findByMajorCode(String majorCode);
    Optional<Major> findByName(String name);
    boolean existsByMajorCode(String majorCode);
    boolean existsByName(String name);
    long countByDepartmentId(Long departmentId);
}
