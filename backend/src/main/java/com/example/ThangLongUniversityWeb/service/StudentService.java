package com.example.ThangLongUniversityWeb.service;

import com.example.ThangLongUniversityWeb.dto.request.StudentRequest;
import com.example.ThangLongUniversityWeb.dto.response.StudentResponse;
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
                .address(student.getAddress())
                .academicYear(student.getAcademicYear())
                .majorId(student.getMajor() != null ? student.getMajor().getId() : null)
                .majorName(student.getMajor() != null ? student.getMajor().getName() : null)
                .majorCode(student.getMajor() != null ? student.getMajor().getMajorCode() : null)
                .build();
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