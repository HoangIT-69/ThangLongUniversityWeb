package com.example.ThangLongUniversityWeb.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@Schema(description = "Thông tin ghi danh sinh viên (Admin view)")
public class AdminEnrollmentResponse {
    @Schema(
            description = "ID của ghi danh",
            example = "1"
    )
    private Long enrollmentId;
    
    @Schema(
            description = "ID của sinh viên",
            example = "1"
    )
    private Long studentId;
    
    @Schema(
            description = "Mã sinh viên",
            example = "SV001"
    )
    private String studentCode;
    
    @Schema(
            description = "Tên sinh viên",
            example = "Nguyễn Văn A"
    )
    private String studentName;
    
    @Schema(
            description = "ID lớp học",
            example = "1"
    )
    private Long classSectionId;
    
    @Schema(
            description = "Mã lớp học",
            example = "IT001.N1"
    )
    private String classCode;
    
    @Schema(
            description = "ID học kỳ",
            example = "1"
    )
    private Long semesterId;
    
    @Schema(
            description = "Tên môn học",
            example = "Java Core Programming"
    )
    private String courseName;
    
    @Schema(
            description = "Trạng thái ghi danh",
            example = "REGISTERED"
    )
    private String status;
}

