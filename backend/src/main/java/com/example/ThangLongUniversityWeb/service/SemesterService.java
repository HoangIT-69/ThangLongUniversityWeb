package com.example.ThangLongUniversityWeb.service;

import com.example.ThangLongUniversityWeb.dto.request.SemesterRequest;
import com.example.ThangLongUniversityWeb.entity.Semester;
import com.example.ThangLongUniversityWeb.repository.SemesterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SemesterService {

    private final SemesterRepository semesterRepository;

    @Cacheable(cacheNames = "semesters")
    public List<Semester> getAllSemesters() {
        return semesterRepository.findAll();
    }

    @Transactional
    @CacheEvict(cacheNames = "semesters", allEntries = true)
    public Semester createSemester(SemesterRequest request) {
        if (semesterRepository.findByName(request.getName()).isPresent()) {
            throw new RuntimeException("Tên học kỳ đã tồn tại!");
        }

        Semester semester = new Semester();
        semester.setName(request.getName());
        semester.setStartDate(request.getStartDate());
        semester.setEndDate(request.getEndDate());
        semester.setRegistrationOpen(request.isRegistrationOpen());

        return semesterRepository.save(semester);
    }

    @Transactional
    @CacheEvict(cacheNames = "semesters", allEntries = true)
    public Semester updateSemester(Long id, SemesterRequest request) {
        Semester semester = semesterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học kỳ!"));

        semester.setName(request.getName());
        semester.setStartDate(request.getStartDate());
        semester.setEndDate(request.getEndDate());
        semester.setRegistrationOpen(request.isRegistrationOpen());

        return semesterRepository.save(semester);
    }

    @Transactional
    @CacheEvict(cacheNames = "semesters", allEntries = true)
    public void deleteSemester(Long id) {
        // Lưu ý thực tế: Phải check xem học kỳ này đã có lớp học nào chưa mới cho xóa
        semesterRepository.deleteById(id);
    }
}