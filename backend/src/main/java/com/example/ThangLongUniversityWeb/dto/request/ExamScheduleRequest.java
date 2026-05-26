package com.example.ThangLongUniversityWeb.dto.request;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ExamScheduleRequest {
    private Long classSectionId;
    private LocalDateTime examAt;
    private String examRoom;
}
