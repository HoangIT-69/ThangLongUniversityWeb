package com.example.ThangLongUniversityWeb.service;

import com.example.ThangLongUniversityWeb.dto.request.SemesterRequest;
import com.example.ThangLongUniversityWeb.dto.response.SemesterSummaryResponse;
import com.example.ThangLongUniversityWeb.dto.response.StudentSemesterResponse;
import com.example.ThangLongUniversityWeb.entity.Semester;
import com.example.ThangLongUniversityWeb.enums.EnrollmentStatus;
import com.example.ThangLongUniversityWeb.repository.ClassSectionRepository;
import com.example.ThangLongUniversityWeb.repository.EnrollmentRepository;
import com.example.ThangLongUniversityWeb.repository.ExamRegistrationRepository;
import com.example.ThangLongUniversityWeb.repository.SemesterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SemesterService {

    private final SemesterRepository semesterRepository;
    private final ClassSectionRepository classSectionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ExamRegistrationRepository examRegistrationRepository;

    @Cacheable(cacheNames = "semesters")
    public List<StudentSemesterResponse> getAllSemesters() {
        return semesterRepository.findAll().stream()
                .map(this::toStudentResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(cacheNames = "semesters", allEntries = true)
    public StudentSemesterResponse createSemester(SemesterRequest request) {
        if (semesterRepository.findByName(request.getName()).isPresent()) {
            throw new RuntimeException("Tên học kỳ đã tồn tại!");
        }

        Semester semester = new Semester();
        semester.setName(request.getName());
        semester.setStartDate(request.getStartDate());
        semester.setEndDate(request.getEndDate());
        semester.setRegistrationOpen(request.isRegistrationOpen());

        return toStudentResponse(semesterRepository.save(semester));
    }

    @Transactional
    @CacheEvict(cacheNames = "semesters", allEntries = true)
    public StudentSemesterResponse updateSemester(Long id, SemesterRequest request) {
        Semester semester = semesterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học kỳ!"));

        semester.setName(request.getName());
        semester.setStartDate(request.getStartDate());
        semester.setEndDate(request.getEndDate());
        semester.setRegistrationOpen(request.isRegistrationOpen());

        return toStudentResponse(semesterRepository.save(semester));
    }

    @Transactional
    @CacheEvict(cacheNames = "semesters", allEntries = true)
    public void deleteSemester(Long id) {
        long classSectionCount = classSectionRepository.countBySemesterId(id);
        if (classSectionCount > 0) {
            throw new RuntimeException("Không thể xóa học kỳ đã có lớp học phần. Vui lòng xóa lớp học phần trước.");
        }
        try {
            semesterRepository.deleteById(id);
            semesterRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new RuntimeException("Không thể xóa học kỳ vì đã được tham chiếu bởi dữ liệu liên quan. Chỉ nên xóa học kỳ vừa tạo nhầm và chưa phát sinh dữ liệu.");
        }
    }

    // ── Lifecycle actions ──────────────────────────────────────────────────

    @Transactional
    @CacheEvict(cacheNames = "semesters", allEntries = true)
    public StudentSemesterResponse toggleRegistration(Long id, boolean open) {
        Semester semester = getSemesterOrThrow(id);
        if (semester.isLocked()) {
            throw new RuntimeException("Học kỳ đã bị chốt, không thể thay đổi trạng thái đăng ký.");
        }
        semester.setRegistrationOpen(open);
        return toStudentResponse(semesterRepository.save(semester));
    }

    @Transactional
    @CacheEvict(cacheNames = "semesters", allEntries = true)
    public int lockEnrollments(Long id) {
        Semester semester = getSemesterOrThrow(id);
        var pending = enrollmentRepository.findByClassSectionSemesterIdAndStatus(id, EnrollmentStatus.PENDING);
        for (var e : pending) {
            e.setStatus(EnrollmentStatus.REGISTERED);
            var cs = e.getClassSection();
            cs.setCurrentSlots((cs.getCurrentSlots() == null ? 0 : cs.getCurrentSlots()) + 1);
            classSectionRepository.save(cs);
            enrollmentRepository.save(e);
        }
        semester.setRegistrationOpen(false);
        semester.setLocked(true);
        semesterRepository.save(semester);
        return pending.size();
    }

    @Transactional
    @CacheEvict(cacheNames = "semesters", allEntries = true)
    public StudentSemesterResponse publishExamSchedules(Long id) {
        Semester semester = getSemesterOrThrow(id);
        semester.setExamPublished(true);
        return toStudentResponse(semesterRepository.save(semester));
    }

    @Transactional
    @CacheEvict(cacheNames = "semesters", allEntries = true)
    public StudentSemesterResponse unpublishExamSchedules(Long id) {
        Semester semester = getSemesterOrThrow(id);
        semester.setExamPublished(false);
        return toStudentResponse(semesterRepository.save(semester));
    }

    @Transactional
    @CacheEvict(cacheNames = "semesters", allEntries = true)
    public StudentSemesterResponse toggleRetakeRegistration(Long id, boolean open) {
        Semester semester = getSemesterOrThrow(id);
        if (open && !semester.isLocked()) {
            throw new RuntimeException("Phải chốt học phần trước khi mở đăng ký thi lại.");
        }
        if (semester.isRetakeLocked()) {
            throw new RuntimeException("Đăng ký thi lại đã được chốt, không thể thay đổi.");
        }
        semester.setRetakeOpen(open);
        return toStudentResponse(semesterRepository.save(semester));
    }

    @Transactional
    @CacheEvict(cacheNames = "semesters", allEntries = true)
    public int lockRetakes(Long id) {
        Semester semester = getSemesterOrThrow(id);
        var pending = examRegistrationRepository.findByClassSectionSemesterIdAndStatus(id, EnrollmentStatus.PENDING);
        for (var r : pending) {
            r.setStatus(EnrollmentStatus.REGISTERED);
            examRegistrationRepository.save(r);
        }
        semester.setRetakeOpen(false);
        semester.setRetakeLocked(true);
        semesterRepository.save(semester);
        return pending.size();
    }

    // ── Summary ────────────────────────────────────────────────────────────

    public SemesterSummaryResponse getSemesterSummary(Long id) {
        Semester semester = getSemesterOrThrow(id);
        var classSections = classSectionRepository.findBySemesterId(id);

        int examScheduled = (int) classSections.stream().filter(cs -> cs.getExamAt() != null).count();
        int examNotScheduled = classSections.size() - examScheduled;

        var enrollments = enrollmentRepository.findByClassSectionSemesterId(id);
        int pending = (int) enrollments.stream().filter(e -> e.getStatus() == EnrollmentStatus.PENDING).count();
        int registered = (int) enrollments.stream().filter(e -> e.getStatus() == EnrollmentStatus.REGISTERED).count();

        var retakes = examRegistrationRepository.findByClassSectionSemesterIdAndStatus(id, EnrollmentStatus.PENDING);
        var retakesReg = examRegistrationRepository.findByClassSectionSemesterIdAndStatus(id, EnrollmentStatus.REGISTERED);

        return SemesterSummaryResponse.builder()
                .semesterId(semester.getId())
                .name(semester.getName())
                .startDate(semester.getStartDate() != null ? semester.getStartDate().toString() : null)
                .endDate(semester.getEndDate() != null ? semester.getEndDate().toString() : null)
                .classSectionCount(classSections.size())
                .examScheduledCount(examScheduled)
                .examNotScheduledCount(examNotScheduled)
                .enrollmentCount(enrollments.size())
                .pendingEnrollments(pending)
                .registeredEnrollments(registered)
                .retakeRegistrations(retakes.size() + retakesReg.size())
                .retakePending(retakes.size())
                .retakeRegistered(retakesReg.size())
                .registrationOpen(semester.isRegistrationOpen())
                .locked(semester.isLocked())
                .examPublished(semester.isExamPublished())
                .retakeOpen(semester.isRetakeOpen())
                .retakeLocked(semester.isRetakeLocked())
                .maxCreditsPerSemester(semester.getMaxCreditsPerSemester())
                .build();
    }

    private Semester getSemesterOrThrow(Long id) {
        return semesterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học kỳ!"));
    }

    public StudentSemesterResponse toStudentResponse(Semester s) {
        return StudentSemesterResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .startDate(s.getStartDate())
                .endDate(s.getEndDate())
                .registrationOpen(s.isRegistrationOpen())
                .locked(s.isLocked())
                .examPublished(s.isExamPublished())
                .retakeOpen(s.isRetakeOpen())
                .retakeLocked(s.isRetakeLocked())
                .build();
    }
}
