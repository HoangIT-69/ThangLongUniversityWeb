package com.example.ThangLongUniversityWeb.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EnrollmentMessage {
    private String requestId;
    private Long studentId;
    private Long classSectionId;
}