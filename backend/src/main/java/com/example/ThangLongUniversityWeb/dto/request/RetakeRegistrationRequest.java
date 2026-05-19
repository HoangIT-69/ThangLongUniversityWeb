package com.example.ThangLongUniversityWeb.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Yeu cau dang ky thi lai / thi nang diem")
public class RetakeRegistrationRequest {
    @Schema(description = "Danh sach ID mon hoc (course) muon dang ky thi lai/nang diem", example = "[1, 2]")
    private List<Long> courseIds;

    public List<Long> getCourseIds() {
        return courseIds;
    }

    public void setCourseIds(List<Long> courseIds) {
        this.courseIds = courseIds;
    }
}
