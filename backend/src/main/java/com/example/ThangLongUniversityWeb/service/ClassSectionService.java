package com.example.ThangLongUniversityWeb.service;

import com.example.ThangLongUniversityWeb.dto.request.ClassSectionRequest;
import com.example.ThangLongUniversityWeb.dto.request.ClassSectionScheduleRequest;
import com.example.ThangLongUniversityWeb.dto.response.ClassSectionResponse;
import com.example.ThangLongUniversityWeb.dto.response.ClassSectionScheduleResponse;
import com.example.ThangLongUniversityWeb.entity.ClassSection;
import com.example.ThangLongUniversityWeb.entity.ClassSectionSchedule;
import com.example.ThangLongUniversityWeb.entity.Course;
import com.example.ThangLongUniversityWeb.entity.Period;
import com.example.ThangLongUniversityWeb.entity.Room;
import com.example.ThangLongUniversityWeb.entity.Semester;
import com.example.ThangLongUniversityWeb.entity.Teacher;
import com.example.ThangLongUniversityWeb.enums.EnrollmentStatus;
import com.example.ThangLongUniversityWeb.repository.ClassSectionRepository;
import com.example.ThangLongUniversityWeb.repository.ClassSectionScheduleRepository;
import com.example.ThangLongUniversityWeb.repository.CourseRepository;
import com.example.ThangLongUniversityWeb.repository.EnrollmentRepository;
import com.example.ThangLongUniversityWeb.repository.PeriodRepository;
import com.example.ThangLongUniversityWeb.repository.RoomRepository;
import com.example.ThangLongUniversityWeb.repository.SemesterRepository;
import com.example.ThangLongUniversityWeb.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassSectionService {

    private final ClassSectionRepository classSectionRepository;
    private final ClassSectionScheduleRepository scheduleRepository;
    private final CourseRepository courseRepository;
    private final SemesterRepository semesterRepository;
    private final TeacherRepository teacherRepository;
    private final PeriodRepository periodRepository;
    private final RoomRepository roomRepository;
    private final EnrollmentRepository enrollmentRepository;

    public void checkScheduleConflict(ClassSectionRequest request, Long semesterId, Long excludeId) {
        // Kiểm tra conflict cho mỗi schedule, bao gồm cả phòng và lịch của giảng viên
        for (ClassSectionScheduleRequest scheduleReq : request.getSchedules()) {
            Room room = getRoomOrThrow(scheduleReq.getRoomId());
            validateRoomCapacity(room, request.getMaxSlots());

            Period startPeriod = getPeriodOrThrow(scheduleReq.getStartPeriodId(), "startPeriodId");
            Period endPeriod = getPeriodOrThrow(scheduleReq.getEndPeriodId(), "endPeriodId");
            validatePeriodOrder(startPeriod, endPeriod);

            Integer startNumber = startPeriod.getPeriodNumber();
            Integer endNumber = endPeriod.getPeriodNumber();

            if (scheduleRepository.countRoomConflicts(semesterId, room.getId(), scheduleReq.getDayOfWeek(),
                    startNumber, endNumber, excludeId) > 0) {
                throw new RuntimeException("Phòng " + room.getName() + " đã được sử dụng vào thứ " +
                        scheduleReq.getDayOfWeek() + " tiết " + startNumber + "-" + endNumber);
            }

            if (request.getTeacherId() != null && !scheduleRepository.findTeacherConflicts(semesterId, request.getTeacherId(), scheduleReq.getDayOfWeek(),
                    startNumber, endNumber, excludeId).isEmpty()) {
                throw new RuntimeException("Giảng viên đã có lớp vào thứ " + scheduleReq.getDayOfWeek() +
                        " tiết " + startNumber + "-" + endNumber);
            }
        }
    }

    public void checkStudentScheduleConflict(Long studentId, Long classSectionId) {
        ClassSection targetClass = classSectionRepository.findById(classSectionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học phần!"));

        List<ClassSection> enrolledClasses = enrollmentRepository.findCurrentSelectedOrRegisteredClasses(studentId, targetClass.getSemester().getId());

        for (ClassSectionSchedule targetSchedule : targetClass.getSchedules()) {
            for (ClassSection enrolledClass : enrolledClasses) {
                for (ClassSectionSchedule enrolledSchedule : enrolledClass.getSchedules()) {
                    if (targetSchedule.getDayOfWeek().equals(enrolledSchedule.getDayOfWeek())) {
                        if (isPeriodOverlap(targetSchedule.getStartPeriod().getPeriodNumber(),
                                targetSchedule.getEndPeriod().getPeriodNumber(),
                                enrolledSchedule.getStartPeriod().getPeriodNumber(),
                                enrolledSchedule.getEndPeriod().getPeriodNumber())) {
                            throw new RuntimeException("Lịch học bị trùng với các lớp đã đăng ký trong học kỳ này!");
                        }
                    }
                }
            }
        }
    }

    private Period getPeriodOrThrow(Long periodId, String fieldName) {
        if (periodId == null) {
            throw new RuntimeException("Thiếu " + fieldName + "");
        }
        return periodRepository.findById(periodId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Period với id = " + periodId));
    }

    private Room getRoomOrThrow(Long roomId) {
        if (roomId == null) {
            throw new RuntimeException("Thiếu roomId");
        }
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng học!"));
    }

    private void validateRoomCapacity(Room room, Integer maxSlots) {
        if (maxSlots != null && room.getCapacity() != null && maxSlots > room.getCapacity()) {
            throw new RuntimeException("Số lượng sinh viên (" + maxSlots + ") vượt quá sức chứa phòng " +
                    room.getName() + " (" + room.getCapacity() + ")");
        }
    }

    private void validatePeriodOrder(Period startPeriod, Period endPeriod) {
        if (startPeriod.getPeriodNumber() > endPeriod.getPeriodNumber()) {
            throw new RuntimeException("StartPeriod phải nhỏ hơn hoặc bằng EndPeriod");
        }
    }

    private boolean isPeriodOverlap(Integer start1, Integer end1, Integer start2, Integer end2) {
        return start1 <= end1 && start2 <= end2 && start1 <= end2 && start2 <= end1;
    }

    @Transactional
    public ClassSectionResponse createClassSection(ClassSectionRequest request) {
        if (classSectionRepository.findByClassCode(request.getClassCode()).isPresent()) {
            throw new RuntimeException("Mã lớp học phần đã tồn tại!");
        }

        checkScheduleConflict(request, request.getSemesterId(), null);

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy môn học!"));

        Semester semester = semesterRepository.findById(request.getSemesterId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học kỳ!"));

        Teacher teacher = null;
        if (request.getTeacherId() != null) {
            teacher = teacherRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên!"));
        }

        ClassSection section = new ClassSection();
        section.setClassCode(request.getClassCode());
        section.setCourse(course);
        section.setSemester(semester);
        section.setTeacher(teacher);
        section.setMaxSlots(request.getMaxSlots());
        section.setCurrentSlots(0);
        section.setClosed(false);

        ClassSection saved = classSectionRepository.save(section);

        // Tạo danh sách schedules với phòng riêng cho mỗi ngày
        for (ClassSectionScheduleRequest scheduleReq : request.getSchedules()) {
            ClassSectionSchedule schedule = new ClassSectionSchedule();
            schedule.setClassSection(saved);
            schedule.setDayOfWeek(scheduleReq.getDayOfWeek());
            schedule.setStartPeriod(getPeriodOrThrow(scheduleReq.getStartPeriodId(), "startPeriodId"));
            schedule.setEndPeriod(getPeriodOrThrow(scheduleReq.getEndPeriodId(), "endPeriodId"));
            schedule.setRoom(getRoomOrThrow(scheduleReq.getRoomId()));
            scheduleRepository.save(schedule);
        }

        // Nếu tất cả lịch dùng cùng một phòng, giữ room top-level để tương thích
        if (!saved.getSchedules().isEmpty()) {
            saved.setRoom(saved.getSchedules().get(0).getRoom());
            saved = classSectionRepository.save(saved);
        }

        // Reload để lấy schedules
        saved = classSectionRepository.findById(saved.getId()).orElseThrow();
        return mapToResponse(saved);
    }

    @Transactional
    public ClassSectionResponse updateClassSection(Long id, ClassSectionRequest request) {
        System.out.println("Updating class section " + id + " with request: " + request);
        ClassSection section = classSectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học phần!"));

        checkScheduleConflict(request, section.getSemester().getId(), id);

        Teacher teacher = null;
        if (request.getTeacherId() != null) {
            teacher = teacherRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên!"));
        }

        section.setTeacher(teacher);
        section.setMaxSlots(request.getMaxSlots());

        // Xóa old schedules
        scheduleRepository.deleteAll(section.getSchedules());
        section.getSchedules().clear();

        // Thêm new schedules
        for (ClassSectionScheduleRequest scheduleReq : request.getSchedules()) {
            ClassSectionSchedule schedule = new ClassSectionSchedule();
            schedule.setClassSection(section);
            schedule.setDayOfWeek(scheduleReq.getDayOfWeek());
            schedule.setStartPeriod(getPeriodOrThrow(scheduleReq.getStartPeriodId(), "startPeriodId"));
            schedule.setEndPeriod(getPeriodOrThrow(scheduleReq.getEndPeriodId(), "endPeriodId"));
            schedule.setRoom(getRoomOrThrow(scheduleReq.getRoomId()));
            scheduleRepository.save(schedule);
            section.getSchedules().add(schedule);
        }

        if (!section.getSchedules().isEmpty()) {
            section.setRoom(section.getSchedules().get(0).getRoom());
        }

        ClassSection saved = classSectionRepository.save(section);
        System.out.println("Saved class section: " + saved);
        ClassSectionResponse response = mapToResponse(saved);
        System.out.println("Response: " + response);
        return response;
    }

    @Transactional
    public void deleteClassSection(Long id) {
        ClassSection section = classSectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học phần!"));
        classSectionRepository.delete(section);
    }

    public ClassSectionResponse mapToResponse(ClassSection section) {
        List<ClassSectionScheduleResponse> schedules = section.getSchedules().stream()
                .map(this::mapScheduleToResponse)
                .collect(Collectors.toList());
        int activeSlots = section.getId() == null
                ? (section.getCurrentSlots() == null ? 0 : section.getCurrentSlots())
                : (int) enrollmentRepository.countByClassSectionIdAndStatusIn(
                section.getId(),
                List.of(EnrollmentStatus.PENDING, EnrollmentStatus.REGISTERED)
        );

        var distinctRooms = schedules.stream()
                .map(ClassSectionScheduleResponse::getRoomName)
                .distinct()
                .toList();

        String topRoomName = null;
        Long topRoomId = null;
        Integer topRoomCapacity = null;
        if (distinctRooms.size() == 1 && !schedules.isEmpty()) {
            topRoomName = schedules.get(0).getRoomName();
            topRoomId = schedules.get(0).getRoomId();
            topRoomCapacity = (section.getRoom() != null ? section.getRoom().getCapacity() : null);
        }

        return ClassSectionResponse.builder()
                .id(section.getId())
                .classCode(section.getClassCode())
                .courseId(section.getCourse().getId())
                .courseCode(section.getCourse().getCode())
                .courseName(section.getCourse().getName())
                .courseType(section.getCourse().getCourseType())
                .courseTypeLabel(section.getCourse().getCourseType() != null && section.getCourse().getCourseType().name().equals("ELECTIVE") ? "Tu do" : "Bat buoc")
                .credits(section.getCourse().getCredits())
                .semesterId(section.getSemester().getId())
                .semesterName(section.getSemester().getName())
                .teacherId(section.getTeacher() != null ? section.getTeacher().getId() : null)
                .teacherName(section.getTeacher() != null ? section.getTeacher().getFullName() : "Chưa phân công")
                .room(topRoomName)
                .roomId(topRoomId)
                .roomCapacity(topRoomCapacity)
                .schedules(schedules)
                .maxSlots(section.getMaxSlots())
                .currentSlots(activeSlots)
                .isClosed(section.isClosed())
                .build();
    }

    private ClassSectionScheduleResponse mapScheduleToResponse(ClassSectionSchedule schedule) {
        return ClassSectionScheduleResponse.builder()
                .id(schedule.getId())
                .dayOfWeek(schedule.getDayOfWeek())
                .startPeriodId(schedule.getStartPeriod().getId())
                .startPeriod(schedule.getStartPeriod().getPeriodNumber())
                .endPeriodId(schedule.getEndPeriod().getId())
                .endPeriod(schedule.getEndPeriod().getPeriodNumber())
                .roomId(schedule.getRoom() != null ? schedule.getRoom().getId() : null)
                .roomName(schedule.getRoom() != null ? schedule.getRoom().getName() : null)
                .build();
    }
}
