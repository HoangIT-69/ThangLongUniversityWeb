package com.example.ThangLongUniversityWeb.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "teachers")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @JsonIgnore
    private User user;

    @Column(unique = true, nullable = false)
    private String teacherCode;

    private String fullName;

    private LocalDate dob;

    private String gender;

    private String phone;

    private String nationalId;

    private String placeOfBirth;

    private String hometown;

    private String permanentAddress;

    private String currentAddress;

    private String emergencyContact;

    private String department;

    private String degree;

    private String address;

}
