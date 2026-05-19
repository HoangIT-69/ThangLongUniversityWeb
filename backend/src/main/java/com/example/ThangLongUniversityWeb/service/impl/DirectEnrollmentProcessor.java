package com.example.ThangLongUniversityWeb.service.impl;

import com.example.ThangLongUniversityWeb.dto.response.EnrollmentRequestResponse;
import com.example.ThangLongUniversityWeb.dto.response.EnrollmentStatusNotification;
import com.example.ThangLongUniversityWeb.entity.ClassSection;
import com.example.ThangLongUniversityWeb.entity.Enrollment;
import com.example.ThangLongUniversityWeb.entity.Student;
import com.example.ThangLongUniversityWeb.enums.EnrollmentRequestStatus;
import com.example.ThangLongUniversityWeb.enums.EnrollmentStatus;
import com.example.ThangLongUniversityWeb.repository.ClassSectionRepository;
import com.example.ThangLongUniversityWeb.repository.EnrollmentRepository;
import com.example.ThangLongUniversityWeb.service.EnrollmentProcessor;
import com.example.ThangLongUniversityWeb.service.EnrollmentRequestStatusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Xử lý đăng ký học phần trực tiếp vào DB (không qua Kafka).
 * Kích hoạt khi spring.kafka.enabled=false (mặc định cho môi trường local).
 *
 * Sau khi lưu DB thành công, push realtime về client qua WebSocket:
 *   /user/{username}/queue/enrollment-status
 */
@Service
@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty(name = "spring.kafka.enabled", havingValue = "false", matchIfMissing = true)
public class DirectEnrollmentProcessor implements EnrollmentProcessor {

    private final EnrollmentRepository enrollmentRepository;
    private final ClassSectionRepository classSectionRepository;
    private final EnrollmentRequestStatusService statusService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public EnrollmentRequestResponse process(Student student, ClassSection targetClass) {
        String requestId = UUID.randomUUID().toString();
        String username  = student.getUser().getUsername();
        String classCode = targetClass.getClassCode();

        statusService.markProcessing(requestId, "Đang ghi nhận đăng ký...");

        try {
            // Lưu enrollment vào DB
            Enrollment enrollment = new Enrollment();
            enrollment.setStudent(student);
            enrollment.setClassSection(targetClass);
            enrollment.setStatus(EnrollmentStatus.REGISTERED);
            enrollmentRepository.save(enrollment);

            // Tăng currentSlots
            targetClass.setCurrentSlots(targetClass.getCurrentSlots() + 1);
            classSectionRepository.save(targetClass);

            statusService.markSuccess(requestId, "Đăng ký lớp " + classCode + " thành công!");
            log.info("✅ [Direct] Sinh viên {} đăng ký lớp {} thành công.", username, classCode);

            // Push WebSocket về user
            pushStatus(username, requestId, EnrollmentRequestStatus.SUCCESS,
                    classCode, "Đăng ký lớp " + classCode + " thành công!");

            return new EnrollmentRequestResponse(requestId,
                    "Đăng ký lớp " + classCode + " thành công!");

        } catch (Exception e) {
            statusService.markFailed(requestId, "Lỗi hệ thống: " + e.getMessage());
            log.error("❌ [Direct] Lỗi đăng ký lớp {} cho SV {}: {}", classCode, username, e.getMessage());

            // Push WebSocket thất bại
            pushStatus(username, requestId, EnrollmentRequestStatus.FAILED,
                    classCode, "Đăng ký thất bại: " + e.getMessage());

            throw new RuntimeException("Lỗi hệ thống khi xử lý đăng ký. Vui lòng thử lại!");
        }
    }

    // ─── helper ──────────────────────────────────────────────
    private void pushStatus(String username, String requestId,
                             EnrollmentRequestStatus status, String classCode, String message) {
        try {
            EnrollmentStatusNotification notification = EnrollmentStatusNotification.builder()
                    .requestId(requestId)
                    .status(status)
                    .classCode(classCode)
                    .message(message)
                    .timestamp(System.currentTimeMillis())
                    .build();

            messagingTemplate.convertAndSendToUser(
                    username,
                    "/queue/enrollment-status",
                    notification
            );
        } catch (Exception e) {
            log.warn("⚠️ Không thể push WebSocket status cho user {}: {}", username, e.getMessage());
        }
    }
}
