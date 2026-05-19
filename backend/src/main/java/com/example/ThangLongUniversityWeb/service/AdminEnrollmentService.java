package com.example.ThangLongUniversityWeb.service;

import com.example.ThangLongUniversityWeb.audit.Audit;
import com.example.ThangLongUniversityWeb.dto.request.AdminOverrideEnrollmentRequest;
import com.example.ThangLongUniversityWeb.dto.response.AdminEnrollmentResponse;
import com.example.ThangLongUniversityWeb.entity.ClassSection;
import com.example.ThangLongUniversityWeb.entity.Enrollment;
import com.example.ThangLongUniversityWeb.entity.Student;
import com.example.ThangLongUniversityWeb.enums.EnrollmentStatus;
import com.example.ThangLongUniversityWeb.repository.ClassSectionRepository;
import com.example.ThangLongUniversityWeb.repository.EnrollmentRepository;
import com.example.ThangLongUniversityWeb.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminEnrollmentService {
    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final ClassSectionRepository classSectionRepository;

    public Page<AdminEnrollmentResponse> search(Long semesterId, Long classSectionId, EnrollmentStatus status, Pageable pageable) {
        return enrollmentRepository.searchAdmin(semesterId, classSectionId, status, pageable)
                .map(this::toAdminResponse);
    }

    @Transactional
    @Audit(action = "ENROLLMENT_OVERRIDE", targetType = "Enrollment")
    public AdminEnrollmentResponse overrideEnrollment(AdminOverrideEnrollmentRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên."));
        ClassSection targetClass = classSectionRepository.findByIdForUpdate(request.getClassSectionId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học phần."));

        try {
            Enrollment enrollment = new Enrollment();
            enrollment.setStudent(student);
            enrollment.setClassSection(targetClass);
            enrollment.setStatus(EnrollmentStatus.REGISTERED);

            Enrollment saved = enrollmentRepository.save(enrollment);

            // Override: vẫn tăng currentSlots kể cả vượt maxSlots
            targetClass.setCurrentSlots(targetClass.getCurrentSlots() + 1);
            classSectionRepository.save(targetClass);

            return toAdminResponse(saved);
        } catch (DataIntegrityViolationException dup) {
            throw new RuntimeException("Sinh viên đã đăng ký lớp học phần này (duplicate).");
        }
    }

    private AdminEnrollmentResponse toAdminResponse(Enrollment e) {
        return new AdminEnrollmentResponse(
                e.getId(),
                e.getStudent().getId(),
                e.getStudent().getStudentCode(),
                e.getStudent().getFullName(),
                e.getClassSection().getId(),
                e.getClassSection().getClassCode(),
                e.getClassSection().getSemester().getId(),
                e.getClassSection().getCourse().getName(),
                e.getStatus() == null ? null : e.getStatus().name()
        );
    }
}

