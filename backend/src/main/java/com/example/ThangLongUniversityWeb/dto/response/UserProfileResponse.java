package com.example.ThangLongUniversityWeb.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Thông tin hồ sơ người dùng")
public class UserProfileResponse {
    @Schema(description = "Tên đăng nhập", example = "student001")
    private String username;
    
    @Schema(description = "Email", example = "student@thanglong.edu.vn")
    private String email;
    
    @Schema(description = "Vai trò người dùng", example = "STUDENT", allowableValues = {"STUDENT", "TEACHER", "ADMIN"})
    private String role;
    
    @Schema(description = "Họ tên", example = "Nguyễn Văn A")
    private String fullName;
    
    @Schema(description = "Mã sinh viên hoặc mã giảng viên", example = "SV001")
    private String code;
    
    @Schema(description = "Ngành học (SV) hoặc Học vị (GV)", example = "Công nghệ thông tin")
    private String majorOrDegree;
    
    @Schema(description = "URL ảnh đại diện")
    private String avatarUrl;
}