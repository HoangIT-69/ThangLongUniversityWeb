package com.example.ThangLongUniversityWeb.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Thông tin ghi danh môn học")
public class EnrollmentResponse {
    @Schema(
            description = "ID của ghi danh",
            example = "1"
    )
    private Long enrollmentId;

    @Schema(
            description = "ID lop hoc phan",
            example = "1"
    )
    private Long classSectionId;

    @Schema(
            description = "Ma mon hoc",
            example = "IT001"
    )
    private String courseCode;

    @Schema(
            description = "Mã lớp học",
            example = "IT001.N1"
    )
    private String classCode;
    
    @Schema(
            description = "Tên môn học",
            example = "Java Core Programming"
    )
    private String courseName;
    
    @Schema(
            description = "Số tín chỉ",
            example = "3"
    )
    private Integer credits;

    @Schema(
            description = "Phòng học",
            example = "A301"
    )
    private String room;
    
    @Schema(
            description = "Ngày trong tuần (2-8)",
            example = "2"
    )
    private Integer dayOfWeek;
    
    @Schema(
            description = "Tiết học bắt đầu (1-12)",
            example = "1"
    )
    private Integer startPeriod;
    
    @Schema(
            description = "Tiết học kết thúc (1-12)",
            example = "4"
    )
    private Integer endPeriod;
    
    @Schema(
            description = "Tên giảng viên",
            example = "Thầy Nguyễn Văn B"
    )
    private String teacherName;

    @Schema(
            description = "Điểm giữa kỳ (0-10)",
            example = "7.5"
    )
    private Float midTermScore;
    
    @Schema(
            description = "Điểm cuối kỳ (0-10)",
            example = "8.0"
    )
    private Float finalScore;
    
    @Schema(
            description = "Điểm tổng kết",
            example = "7.75"
    )
    private Float totalScore;
    
    @Schema(
            description = "Trạng thái ghi danh",
            example = "REGISTERED",
            allowableValues = {"PENDING", "REGISTERED", "PASSED", "FAILED", "CANCELED"}
    )
    private String status;
}
