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

    @Schema(description = "Gioi tinh", example = "Nam")
    private String gender;

    @Schema(description = "So dien thoai", example = "0987654321")
    private String phone;

    @Schema(description = "So CCCD/CMND", example = "001204000789")
    private String nationalId;

    @Schema(description = "Noi sinh", example = "Ha Noi")
    private String placeOfBirth;

    @Schema(description = "Que quan", example = "Thanh Tri, Ha Noi")
    private String hometown;

    @Schema(description = "Dia chi thuong tru")
    private String permanentAddress;

    @Schema(description = "Noi o hien tai")
    private String currentAddress;

    @Schema(description = "Lien he khan cap", example = "Nguyen Van B - 0912345678")
    private String emergencyContact;
    
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

    @Schema(description = "Khoa", example = "K36")
    private String cohort;

    @Schema(description = "Lop hanh chinh", example = "CNTT-K36A")
    private String className;

    @Schema(description = "Co van hoc tap", example = "ThS. Nguyen Minh Hoang")
    private String advisor;

    @Schema(description = "Trang thai sinh vien", example = "Dang hoc")
    private String status;

    @Schema(description = "He dao tao", example = "Dai hoc chinh quy")
    private String trainingType;
    
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
