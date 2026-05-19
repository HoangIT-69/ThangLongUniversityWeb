package com.example.ThangLongUniversityWeb.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Thông tin điểm số của sinh viên")
public class StudentGradeResponse {
    @Schema(description = "ID ghi danh", example = "1")
    private Long enrollmentId;
    
    @Schema(description = "Mã sinh viên", example = "SV001")
    private String studentCode;
    
    @Schema(description = "Tên sinh viên", example = "Nguyễn Văn A")
    private String fullName;

    @Schema(description = "Điểm giữa kỳ (0-10)", example = "7.5")
    private Float midTermScore;
    
    @Schema(description = "Điểm cuối kỳ (0-10)", example = "8.0")
    private Float finalScore;
    
    @Schema(description = "Tổng điểm", example = "7.75")
    private Float totalScore;
    
    @Schema(description = "Trạng thái", example = "PASSED", allowableValues = {"REGISTERED", "PASSED", "FAILED", "CANCELED"})
    private String status;
}