package com.example.ThangLongUniversityWeb.service.impl;

import com.example.ThangLongUniversityWeb.dto.request.EnrollmentMessage;
import com.example.ThangLongUniversityWeb.dto.response.EnrollmentRequestResponse;
import com.example.ThangLongUniversityWeb.entity.ClassSection;
import com.example.ThangLongUniversityWeb.entity.Student;
import com.example.ThangLongUniversityWeb.enums.EnrollmentRequestStatus;
import com.example.ThangLongUniversityWeb.service.EnrollmentProcessor;
import com.example.ThangLongUniversityWeb.service.EnrollmentRequestStatusService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Xử lý đăng ký học phần qua Kafka (bất đồng bộ).
 * Kích hoạt khi spring.kafka.enabled=true.
 *
 * Consumer Kafka (KafkaEnrollmentConsumer) sẽ lưu DB và push WebSocket khi xử lý xong.
 */
@Service
@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty(name = "spring.kafka.enabled", havingValue = "true")
public class KafkaEnrollmentProcessor implements EnrollmentProcessor {

    private static final String TOPIC = "class-registration";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final EnrollmentRequestStatusService statusService;

    @Override
    public EnrollmentRequestResponse process(Student student, ClassSection targetClass) {
        String requestId = UUID.randomUUID().toString();
        String classCode = targetClass.getClassCode();

        try {
            statusService.markPending(requestId, "Đã tiếp nhận đơn đăng ký, đang chờ xử lý.");

            EnrollmentMessage message = new EnrollmentMessage(requestId, student.getId(), targetClass.getId());
            String messageJson = objectMapper.writeValueAsString(message);

            kafkaTemplate.send(TOPIC, messageJson);
            log.info("🚀 [Kafka] Đã bắn đơn đăng ký vào topic {}: SV {} → Lớp {}",
                    TOPIC, student.getStudentCode(), classCode);

            return new EnrollmentRequestResponse(requestId,
                    "Hệ thống đã tiếp nhận đơn đăng ký lớp " + classCode + ". Vui lòng chờ xử lý!");

        } catch (Exception e) {
            statusService.markFailed(requestId, "Lỗi Kafka: " + e.getMessage());
            log.error("❌ [Kafka] Lỗi bắn message: {}", e.getMessage());
            throw new RuntimeException("Hệ thống xử lý hàng đợi đang bận. Vui lòng thử lại sau!");
        }
    }
}
