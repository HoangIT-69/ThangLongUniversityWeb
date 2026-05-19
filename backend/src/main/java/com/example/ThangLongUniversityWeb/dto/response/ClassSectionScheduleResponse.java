package com.example.ThangLongUniversityWeb.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin lịch học của một lớp học phần")
public class ClassSectionScheduleResponse {
    @Schema(description = "ID lịch học", example = "1")
    private Long id;

    @Schema(description = "Ngày trong tuần (2-8: T2-CN)", example = "2")
    private Integer dayOfWeek;

    @Schema(description = "ID tiết học bắt đầu", example = "1")
    private Long startPeriodId;

    @Schema(description = "Số thứ tự tiết bắt đầu", example = "1")
    private Integer startPeriod;

    @Schema(description = "ID tiết học kết thúc", example = "4")
    private Long endPeriodId;

    @Schema(description = "Số thứ tự tiết kết thúc", example = "4")
    private Integer endPeriod;

    @Schema(description = "ID phòng học cho lịch này", example = "1")
    private Long roomId;

    @Schema(description = "Tên phòng học cho lịch này", example = "A301")
    private String roomName;
}
