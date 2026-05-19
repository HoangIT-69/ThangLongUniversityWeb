package com.example.ThangLongUniversityWeb.entity;

import com.example.ThangLongUniversityWeb.enums.EnrollmentStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "enrollments",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_enrollments_student_class",
                columnNames = {"student_id", "class_section_id"}
        )
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne
    @JoinColumn(name = "class_section_id")
    private ClassSection classSection;

    @Enumerated(EnumType.STRING)
    private EnrollmentStatus status;

    /**
     * Grade là nguồn sự thật duy nhất cho điểm số.
     * TASK-011: Các field midTermScore/finalScore/totalScore đã bị xóa khỏi Enrollment.
     */
    @OneToOne(mappedBy = "enrollment", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Grade grade;
}

