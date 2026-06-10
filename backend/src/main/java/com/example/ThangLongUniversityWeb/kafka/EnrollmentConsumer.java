package com.example.ThangLongUniversityWeb.kafka;

import com.example.ThangLongUniversityWeb.dto.request.EnrollmentMessage;
import com.example.ThangLongUniversityWeb.entity.ClassSection;
import com.example.ThangLongUniversityWeb.entity.Enrollment;
import com.example.ThangLongUniversityWeb.entity.Student;
import com.example.ThangLongUniversityWeb.enums.EnrollmentStatus;
import com.example.ThangLongUniversityWeb.enums.ClassSectionStatus;
import com.example.ThangLongUniversityWeb.entity.Grade;
import com.example.ThangLongUniversityWeb.enums.EnrollmentType;
import com.example.ThangLongUniversityWeb.repository.ClassSectionRepository;
import com.example.ThangLongUniversityWeb.repository.EnrollmentRepository;
import com.example.ThangLongUniversityWeb.repository.GradeRepository;
import com.example.ThangLongUniversityWeb.repository.StudentRepository;
import com.example.ThangLongUniversityWeb.service.EnrollmentRequestStatusService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(value = "spring.kafka.enabled", havingValue = "true")
public class EnrollmentConsumer {
    private static final Logger log = LoggerFactory.getLogger(EnrollmentConsumer.class);

    private final EnrollmentRepository enrollmentRepository;
    private final ClassSectionRepository classSectionRepository;
    private final GradeRepository gradeRepository;
    private final StudentRepository studentRepository;
    private final ObjectMapper objectMapper;
    private final EnrollmentRequestStatusService enrollmentRequestStatusService;

    // Lắng nghe ở topic "class-registration"
    @KafkaListener(topics = "class-registration", groupId = "university-group")
    @Transactional
    public void consumeRegistrationMessage(String messageStr) {
        try {
            // 1. Dịch chuỗi JSON thành Object
            EnrollmentMessage message = objectMapper.readValue(messageStr, EnrollmentMessage.class);
            log.info("📩 KAFKA NHẬN ĐƠN {}: Sinh viên {} đăng ký lớp {}", message.getRequestId(), message.getStudentId(), message.getClassSectionId());

            if (message.getRequestId() != null && !enrollmentRequestStatusService.markIfFirstTimeProcessing(message.getRequestId())) {
                log.warn("🔁 Duplicate Kafka message ignored (requestId={})", message.getRequestId());
                return;
            }
            if (message.getRequestId() != null) {
                enrollmentRequestStatusService.markProcessing(message.getRequestId(), "Đang xử lý đăng ký.");
            }

            // 2. Kéo dữ liệu từ DB lên
            Student student = studentRepository.findById(message.getStudentId()).orElseThrow();
            // Pessimistic lock để chống race condition khi cập nhật slot
            ClassSection targetClass = classSectionRepository.findByIdForUpdate(message.getClassSectionId()).orElseThrow();

            // Idempotency at DB-level (unique constraint will guarantee); but check early to avoid noisy exceptions
            if (enrollmentRepository.existsByStudentIdAndClassSectionId(student.getId(), targetClass.getId())) {
                if (message.getRequestId() != null) {
                    enrollmentRequestStatusService.markSuccess(message.getRequestId(), "Đơn đăng ký đã được ghi nhận trước đó (idempotent).");
                }
                return;
            }

            // 3. CHECK LẠI SĨ SỐ (Rất quan trọng)
            // Vì lúc sinh viên bấm nút có thể còn chỗ, nhưng lúc Kafka xử lý tới thì đã bị người khác giành mất.
            if (targetClass.getCurrentSlots() >= targetClass.getMaxSlots()
                    || targetClass.getStatus() != ClassSectionStatus.OPEN) {
                log.warn("❌ Đăng ký thất bại: Lớp {} đã đầy sĩ số! (Sinh viên: {})", targetClass.getClassCode(), student.getStudentCode());
                if (message.getRequestId() != null) {
                    enrollmentRequestStatusService.markFailed(message.getRequestId(), "Lớp đã đầy sĩ số hoặc bị khóa.");
                }
                return; // Dừng lại, không lưu
            }

            // 4. Nếu qua ải -> Lưu xuống Database thực sự
            Enrollment enrollment = new Enrollment();
            enrollment.setStudent(student);
            enrollment.setClassSection(targetClass);
            enrollment.setStatus(EnrollmentStatus.REGISTERED);

            // Xác định lại lần học và loại đăng ký nếu sinh viên đã từng học môn này
            List<Enrollment> previousCourseEnrollments = enrollmentRepository.findByStudentIdAndCourseIdOrderByIdDesc(
                    student.getId(), targetClass.getCourse().getId());

            if (!previousCourseEnrollments.isEmpty()) {
                Enrollment lastEnrollment = previousCourseEnrollments.get(0);
                if (lastEnrollment.getStatus() == EnrollmentStatus.REGISTERED &&
                        lastEnrollment.getClassSection().getSemester().getId().equals(targetClass.getSemester().getId())) {
                    if (message.getRequestId() != null) {
                        enrollmentRequestStatusService.markFailed(message.getRequestId(), "Bạn đã đăng ký môn này rồi trong cùng học kỳ.");
                    }
                    return;
                }
            }

            Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

            Grade grade = new Grade();
            grade.setEnrollment(savedEnrollment);
            grade.setAttemptNumber(1);
            grade.setEnrollmentType(EnrollmentType.ORDINARY);

            if (!previousCourseEnrollments.isEmpty()) {
                Enrollment lastEnrollment = previousCourseEnrollments.get(0);
                Grade lastGrade = gradeRepository.findByEnrollmentId(lastEnrollment.getId()).orElse(null);
                if (lastGrade != null) {
                    grade.setAttemptNumber(lastGrade.getAttemptNumber() != null ? lastGrade.getAttemptNumber() + 1 : 2);
                } else {
                    grade.setAttemptNumber(2);
                }

                Float previousTotalScore = lastGrade != null ? lastGrade.getTotalScore() : null;
                if (previousTotalScore != null && previousTotalScore >= 4.0f) {
                    grade.setEnrollmentType(EnrollmentType.IMPROVE);
                } else {
                    grade.setEnrollmentType(EnrollmentType.RETAKE);
                }
            }

            gradeRepository.save(grade);

            targetClass.setCurrentSlots(targetClass.getCurrentSlots() + 1);
            classSectionRepository.save(targetClass);

            log.info("✅ ĐĂNG KÝ THÀNH CÔNG: Sinh viên {} -> Lớp {}", student.getStudentCode(), targetClass.getClassCode());
            if (message.getRequestId() != null) {
                enrollmentRequestStatusService.markSuccess(message.getRequestId(), "Đăng ký thành công.");
            }

            // (Trong thực tế, chỗ này có thể gọi thêm Kafka gửi thông báo/Email cho sinh viên biết)

        } catch (DataIntegrityViolationException dup) {
            // Unique constraint trúng: xem như idempotent/duplicate
            log.warn("Duplicate enrollment (unique constraint). {}", dup.getMessage());
        } catch (Exception e) {
            log.error("Lỗi khi xử lý Kafka Message: {}", e.getMessage());
        }
    }
}
