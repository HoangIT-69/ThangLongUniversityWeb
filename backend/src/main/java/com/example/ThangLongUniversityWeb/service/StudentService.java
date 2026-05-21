package com.example.ThangLongUniversityWeb.service;

import com.example.ThangLongUniversityWeb.dto.request.StudentRequest;
import com.example.ThangLongUniversityWeb.dto.response.StudentResponse;
import com.example.ThangLongUniversityWeb.dto.response.UserProfileResponse;
import com.example.ThangLongUniversityWeb.entity.Major;
import com.example.ThangLongUniversityWeb.entity.Student;
import com.example.ThangLongUniversityWeb.entity.User;
import com.example.ThangLongUniversityWeb.enums.Role;
import com.example.ThangLongUniversityWeb.repository.StudentRepository;
import com.example.ThangLongUniversityWeb.repository.UserRepository;
import com.example.ThangLongUniversityWeb.repository.MajorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.Period;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final MajorRepository majorRepository;
    private final PasswordEncoder passwordEncoder;

    // 1. THÊM MỚI (Tạo User -> Tạo Student)
    @Transactional
    public StudentResponse createStudent(StudentRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }

        // Tạo User trước
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setRole(Role.STUDENT);
        user.setActive(true);
        User savedUser = userRepository.save(user);

        // Tạo hồ sơ Student gắn với User vừa tạo
        Student student = new Student();
        student.setUser(savedUser);
        student.setStudentCode(request.getStudentCode());
        student.setFullName(request.getFullName());
        student.setDob(request.getDob());
        applyPersonalAndAcademicFields(student, request);
        student.setMajor(getMajorOrThrow(request.getMajorId()));
        student.setAcademicYear(request.getAcademicYear());
        student.setAddress(request.getAddress());

        return mapToResponse(studentRepository.save(student));
    }

    // 2. CẬP NHẬT
    @Transactional
    public StudentResponse updateStudent(Long id, StudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên!"));

        // Cập nhật thông tin sinh viên
        student.setFullName(request.getFullName());
        student.setDob(request.getDob());
        applyPersonalAndAcademicFields(student, request);
        student.setMajor(getMajorOrThrow(request.getMajorId()));
        student.setAcademicYear(request.getAcademicYear());
        student.setAddress(request.getAddress());

        // Cập nhật email bên bảng User (Nếu có thay đổi)
        User user = student.getUser();
        user.setEmail(request.getEmail());
        userRepository.save(user);

        return mapToResponse(studentRepository.save(student));
    }

    private Major getMajorOrThrow(Long majorId) {
        if (majorId == null) {
            throw new RuntimeException("majorId không được để trống");
        }
        return majorRepository.findById(majorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ngành học!"));
    }

    public StudentResponse mapToResponse(Student student) {
        return StudentResponse.builder()
                .id(student.getId())
                .username(student.getUser() != null ? student.getUser().getUsername() : null)
                .email(student.getUser() != null ? student.getUser().getEmail() : null)
                .studentCode(student.getStudentCode())
                .fullName(student.getFullName())
                .dob(student.getDob())
                .gender(student.getGender())
                .phone(student.getPhone())
                .nationalId(student.getNationalId())
                .placeOfBirth(student.getPlaceOfBirth())
                .hometown(student.getHometown())
                .permanentAddress(student.getPermanentAddress())
                .currentAddress(student.getCurrentAddress())
                .emergencyContact(student.getEmergencyContact())
                .address(student.getAddress())
                .academicYear(student.getAcademicYear())
                .cohort(student.getCohort())
                .className(student.getClassName())
                .advisor(student.getAdvisor())
                .status(student.getStatus())
                .trainingType(student.getTrainingType())
                .majorId(student.getMajor() != null ? student.getMajor().getId() : null)
                .majorName(student.getMajor() != null ? student.getMajor().getName() : null)
                .majorCode(student.getMajor() != null ? student.getMajor().getMajorCode() : null)
                .build();
    }

    public UserProfileResponse getProfileByUsername(String username) {
        Student student = studentRepository.findByUser_Username(username)
                .orElseThrow(() -> new RuntimeException("Khong tim thay thong tin sinh vien cua tai khoan nay!"));
        User user = student.getUser();
        Integer rawYear = student.getAcademicYear();
        String academicYearStr = rawYear != null ? rawYear + " - " + (rawYear + 4) : null;
        Integer age = student.getDob() != null ? Period.between(student.getDob(), LocalDate.now()).getYears() : null;
        String fullName = student.getFullName() != null && !student.getFullName().isBlank()
                ? student.getFullName()
                : user.getUsername();
        String avatarName = URLEncoder.encode(fullName, StandardCharsets.UTF_8);

        return UserProfileResponse.builder()
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(student.getFullName())
                .code(student.getStudentCode())
                .majorOrDegree(student.getMajor() != null ? student.getMajor().getName() : null)
                .avatarUrl("https://ui-avatars.com/api/?name=" + avatarName + "&background=b11226&color=fff")
                .gender(student.getGender())
                .dateOfBirth(student.getDob() != null ? student.getDob().toString() : null)
                .age(age)
                .nationalId(student.getNationalId())
                .placeOfBirth(student.getPlaceOfBirth())
                .hometown(student.getHometown())
                .permanentAddress(firstNonBlank(student.getPermanentAddress(), student.getAddress()))
                .currentAddress(firstNonBlank(student.getCurrentAddress(), student.getAddress()))
                .phone(student.getPhone())
                .emergencyContact(student.getEmergencyContact())
                .cohort(student.getCohort())
                .className(student.getClassName())
                .academicYear(academicYearStr)
                .advisor(student.getAdvisor())
                .status(student.getStatus())
                .trainingType(student.getTrainingType())
                .build();
    }

    private void applyPersonalAndAcademicFields(Student student, StudentRequest request) {
        student.setGender(request.getGender());
        student.setPhone(request.getPhone());
        student.setNationalId(request.getNationalId());
        student.setPlaceOfBirth(request.getPlaceOfBirth());
        student.setHometown(request.getHometown());
        student.setPermanentAddress(request.getPermanentAddress());
        student.setCurrentAddress(request.getCurrentAddress());
        student.setEmergencyContact(request.getEmergencyContact());
        student.setCohort(request.getCohort());
        student.setClassName(request.getClassName());
        student.setAdvisor(request.getAdvisor());
        student.setStatus(request.getStatus());
        student.setTrainingType(request.getTrainingType());
    }

    private String firstNonBlank(String primary, String fallback) {
        return primary != null && !primary.isBlank() ? primary : fallback;
    }

    // 3. XÓA (Xóa Student -> Xóa User)
    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên!"));

        User user = student.getUser();
        studentRepository.delete(student); // Xóa hồ sơ trước
        userRepository.delete(user);       // Xóa tài khoản sau
    }
}
