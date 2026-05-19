package com.example.ThangLongUniversityWeb.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
@Schema(description = "Thông tin sinh viên")
public class StudentResponse {
    @Schema(
            description = "ID của sinh viên",
            example = "1"
    )
    private Long id;
    
    @Schema(
            description = "Tên đăng nhập",
            example = "student001"
    )
    private String username;
    
    @Schema(
            description = "Email",
            example = "student@thanglong.edu.vn"
    )
    private String email;
    
    @Schema(
            description = "Mã sinh viên",
            example = "SV001"
    )
    private String studentCode;
    
    @Schema(
            description = "Họ tên",
            example = "Nguyễn Văn A"
    )
    private String fullName;
    
    @Schema(
            description = "Ngày sinh",
            example = "2000-01-15"
    )
    private LocalDate dob;
    
    @Schema(
            description = "Địa chỉ",
            example = "123 Đường ABC, Hà Nội"
    )
    private String address;
    
    @Schema(
            description = "Năm học",
            example = "2022"
    )
    private Integer academicYear;
    
    @Schema(
            description = "ID ngành học",
            example = "1"
    )
    private Long majorId;
    
    @Schema(
            description = "Tên ngành học",
            example = "Công nghệ thông tin"
    )
    private String majorName;
    
    @Schema(
            description = "Mã ngành học",
            example = "CNTT"
    )
    private String majorCode;
}
