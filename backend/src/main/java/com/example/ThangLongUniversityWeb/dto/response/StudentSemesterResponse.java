package com.example.ThangLongUniversityWeb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class StudentSemesterResponse {
    private Long id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean registrationOpen;
    private boolean locked;
}
