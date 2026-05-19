package com.example.ThangLongUniversityWeb.service;

import com.example.ThangLongUniversityWeb.dto.request.CourseRequest;
import com.example.ThangLongUniversityWeb.dto.response.CourseResponse;
import com.example.ThangLongUniversityWeb.entity.Course;
import com.example.ThangLongUniversityWeb.entity.Major;
import com.example.ThangLongUniversityWeb.enums.CourseType;
import com.example.ThangLongUniversityWeb.repository.CourseRepository;
import com.example.ThangLongUniversityWeb.repository.MajorRepository;
import com.example.ThangLongUniversityWeb.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.HashSet;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final MajorRepository majorRepository;
    private final StudentRepository studentRepository;

    @Cacheable(cacheNames = "courses")
    @Transactional(readOnly = true)
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lay danh sach mon hoc theo nganh cua sinh vien (dung cho trang Chuong trinh dao tao)
     */
    @Transactional(readOnly = true)
    public List<CourseResponse> getCoursesByStudentMajor(String username) {
        var student = studentRepository.findByUser_Username(username)
                .orElseThrow(() -> new RuntimeException("Khong tim thay sinh vien!"));
        if (student.getMajor() == null) {
            return getAllCourses();
        }
        return courseRepository.findByMajorId(student.getMajor().getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(cacheNames = "courses", allEntries = true)
    public CourseResponse createCourse(CourseRequest request) {
        if (courseRepository.findByCode(request.getCode()).isPresent()) {
            throw new RuntimeException("Mã môn học đã tồn tại!");
        }

        Course course = new Course();
        course.setCode(request.getCode());
        course.setName(request.getName());
        course.setCredits(request.getCredits());
        course.setDescription(request.getDescription());
        course.setCourseType(request.getCourseType() != null ? request.getCourseType() : CourseType.REQUIRED);
        applyMajorAndPrerequisites(course, request);

        Course savedCourse = courseRepository.save(course);
        return mapToResponse(savedCourse);
    }

    @Transactional
    @CacheEvict(cacheNames = "courses", allEntries = true)
    public CourseResponse updateCourse(Long id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy môn học!"));

        course.setName(request.getName());
        course.setCredits(request.getCredits());
        course.setDescription(request.getDescription());
        course.setCourseType(request.getCourseType() != null ? request.getCourseType() : CourseType.REQUIRED);
        applyMajorAndPrerequisites(course, request);

        Course savedCourse = courseRepository.save(course);
        return mapToResponse(savedCourse);
    }

    @Transactional
    @CacheEvict(cacheNames = "courses", allEntries = true)
    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }

    // Hàm bổ trợ để chuyển đổi Entity sang DTO
    private CourseResponse mapToResponse(Course course) {
        CourseType courseType = course.getCourseType() != null ? course.getCourseType() : CourseType.REQUIRED;
        return CourseResponse.builder()
                .id(course.getId())
                .code(course.getCode())
                .name(course.getName())
                .credits(course.getCredits())
                .description(course.getDescription())
                .courseType(courseType)
                .courseTypeLabel(courseType == CourseType.ELECTIVE ? "Tự do" : "Bắt buộc")
                .majorName(course.getMajor() != null ? course.getMajor().getName() : "Đại cương")
                .prerequisiteNames(course.getPrerequisites().stream()
                        .map(Course::getName)
                        .collect(Collectors.toSet()))
                .build();
    }

    private void applyMajorAndPrerequisites(Course course, CourseRequest request) {
        if (request.getMajorId() != null) {
            Major major = majorRepository.findById(request.getMajorId())
                    .orElseThrow(() -> new RuntimeException("Ngành (major) không tồn tại!"));
            course.setMajor(major);
        } else {
            course.setMajor(null);
        }

        if (request.getPrerequisiteCourseIds() != null) {
            var prereqs = new HashSet<Course>();
            for (Long prereqId : request.getPrerequisiteCourseIds()) {
                if (prereqId == null) continue;
                if (course.getId() != null && prereqId.equals(course.getId())) {
                    throw new RuntimeException("Môn học không thể là tiên quyết của chính nó!");
                }
                Course prereq = courseRepository.findById(prereqId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy môn học tiên quyết id=" + prereqId));
                prereqs.add(prereq);
            }
            course.setPrerequisites(prereqs);
        }
    }
}
