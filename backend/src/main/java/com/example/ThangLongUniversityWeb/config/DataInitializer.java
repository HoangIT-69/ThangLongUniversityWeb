package com.example.ThangLongUniversityWeb.config;

import com.example.ThangLongUniversityWeb.entity.ClassSection;
import com.example.ThangLongUniversityWeb.entity.ClassSectionSchedule;
import com.example.ThangLongUniversityWeb.entity.Course;
import com.example.ThangLongUniversityWeb.entity.Department;
import com.example.ThangLongUniversityWeb.entity.Enrollment;
import com.example.ThangLongUniversityWeb.entity.Grade;
import com.example.ThangLongUniversityWeb.entity.Homeroom;
import com.example.ThangLongUniversityWeb.entity.Major;
import com.example.ThangLongUniversityWeb.entity.Period;
import com.example.ThangLongUniversityWeb.entity.Room;
import com.example.ThangLongUniversityWeb.entity.Semester;
import com.example.ThangLongUniversityWeb.entity.Student;
import com.example.ThangLongUniversityWeb.entity.SystemSettings;
import com.example.ThangLongUniversityWeb.entity.Teacher;
import com.example.ThangLongUniversityWeb.entity.TuitionBill;
import com.example.ThangLongUniversityWeb.entity.User;
import com.example.ThangLongUniversityWeb.enums.CourseType;
import com.example.ThangLongUniversityWeb.enums.EnrollmentStatus;
import com.example.ThangLongUniversityWeb.enums.Role;
import com.example.ThangLongUniversityWeb.repository.ClassSectionRepository;
import com.example.ThangLongUniversityWeb.repository.CourseRepository;
import com.example.ThangLongUniversityWeb.repository.DepartmentRepository;
import com.example.ThangLongUniversityWeb.repository.EnrollmentRepository;
import com.example.ThangLongUniversityWeb.repository.GradeRepository;
import com.example.ThangLongUniversityWeb.repository.HomeroomRepository;
import com.example.ThangLongUniversityWeb.repository.MajorRepository;
import com.example.ThangLongUniversityWeb.repository.PeriodRepository;
import com.example.ThangLongUniversityWeb.repository.RoomRepository;
import com.example.ThangLongUniversityWeb.repository.SemesterRepository;
import com.example.ThangLongUniversityWeb.repository.StudentRepository;
import com.example.ThangLongUniversityWeb.repository.SystemSettingsRepository;
import com.example.ThangLongUniversityWeb.repository.TeacherRepository;
import com.example.ThangLongUniversityWeb.repository.TuitionBillRepository;
import com.example.ThangLongUniversityWeb.repository.UserRepository;
import com.example.ThangLongUniversityWeb.service.CourseOutcomeService;
import com.example.ThangLongUniversityWeb.service.StudentRetakeService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Order(10)
public class DataInitializer implements CommandLineRunner {

    private static final String DEFAULT_PASSWORD = "password123";

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final MajorRepository majorRepository;
    private final DepartmentRepository departmentRepository;
    private final HomeroomRepository homeroomRepository;
    private final CourseRepository courseRepository;
    private final SemesterRepository semesterRepository;
    private final RoomRepository roomRepository;
    private final PeriodRepository periodRepository;
    private final ClassSectionRepository classSectionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final GradeRepository gradeRepository;
    private final TuitionBillRepository tuitionBillRepository;
    private final SystemSettingsRepository systemSettingsRepository;
    private final PasswordEncoder passwordEncoder;
    private final CourseOutcomeService courseOutcomeService;

    @Override
    @Transactional
    public void run(String... args) {
        // Seed default system settings
        systemSettingsRepository.findById(StudentRetakeService.KEY_RETAKE_FEE).orElseGet(() ->
            systemSettingsRepository.save(new SystemSettings(
                StudentRetakeService.KEY_RETAKE_FEE,
                String.valueOf(StudentRetakeService.DEFAULT_RETAKE_FEE),
                "Phí thi lại mỗi môn (VND)"
            ))
        );

        // Seed Departments (Có dấu tiếng Việt)
        Department deptCNTT = department("CNTT", "Khoa Công nghệ thông tin", "Đào tạo các ngành kỹ thuật phần mềm, hệ thống thông tin");
        Department deptKT = department("KT", "Khoa Kinh tế", "Đào tạo kinh tế ứng dụng và tài chính doanh nghiệp");
        Department deptNN = department("NN", "Khoa Ngoại ngữ", "Đào tạo ngôn ngữ và biên phiên dịch");
        Department deptQTKD = department("QTKD", "Khoa Quản trị kinh doanh", "Đào tạo quản trị, marketing và nhân sự");
        Department deptTKDH = department("TKDH", "Khoa Thiết kế đồ họa", "Đào tạo thiết kế đồ họa, mỹ thuật ứng dụng");

        // Seed Majors (Có dấu tiếng Việt)
        Major cntt = major("CNTT", "Công nghệ thông tin", "Đào tạo phát triển phần mềm và mạng máy tính.", deptCNTT);
        Major khmt = major("KHMT", "Khoa học máy tính", "Đào tạo cấu trúc máy tính, giải thuật và trí tuệ nhân tạo.", deptCNTT);
        Major attt = major("ATTT", "An toàn thông tin", "Đào tạo mật mã học, bảo mật hệ thống mạng và an ninh mạng.", deptCNTT);
        Major kt = major("KT", "Kinh tế", "Đào tạo kinh tế học ứng dụng.", deptKT);
        Major ktdn = major("KTDN", "Kinh tế đối ngoại", "Đào tạo ngoại thương, xuất nhập khẩu và quan hệ quốc tế.", deptKT);
        Major tcnh = major("TCNH", "Tài chính ngân hàng", "Đào tạo nghiệp vụ ngân hàng, thị trường chứng khoán.", deptKT);
        Major qtkd = major("QTKD", "Quản trị kinh doanh", "Đào tạo kỹ năng quản lý, marketing và điều hành doanh nghiệp.", deptQTKD);
        Major nna = major("NNA", "Ngôn ngữ Anh", "Đào tạo tiếng Anh thương mại và biên phiên dịch.", deptNN);
        Major nnt = major("NNT", "Ngôn ngữ Trung", "Đào tạo tiếng Trung giao tiếp và thương mại.", deptNN);
        Major tkdh = major("TKDH", "Thiết kế đồ họa", "Đào tạo thiết kế đồ họa 2D, 3D, thiết kế giao diện UI/UX.", deptTKDH);

        // Seed Semesters (Tên học kỳ có dấu)
        Semester hk1 = semester("Học kỳ 1 năm học 2025-2026", LocalDate.of(2025, 9, 1), LocalDate.of(2026, 1, 15), false, true);
        Semester hk2 = semester("Học kỳ 2 năm học 2025-2026", LocalDate.of(2026, 2, 2), LocalDate.of(2026, 6, 15), true, false);

        // Seed Rooms
        Room a101 = room("Phòng A101", 60, "LECTURE", "AVAILABLE");
        Room b202 = room("Phòng B202", 50, "LECTURE", "AVAILABLE");
        Room lab301 = room("Phòng LAB301", 40, "LAB", "AVAILABLE");
        Room c303 = room("Phòng C303", 55, "LECTURE", "AVAILABLE");
        Room lab402 = room("Phòng LAB402", 40, "LAB", "AVAILABLE");

        // Seed Periods
        Period p1 = period(1, "07:00", "07:50");
        Period p2 = period(2, "08:00", "08:50");
        Period p3 = period(3, "09:00", "09:50");
        Period p4 = period(4, "10:00", "10:50");
        Period p5 = period(5, "13:00", "13:50");
        Period p6 = period(6, "14:00", "14:50");
        Period p7 = period(7, "15:00", "15:50");
        Period p8 = period(8, "16:00", "16:50");

        // Seed Courses (Có dấu tiếng Việt)
        Course web = course("INT2208", "Lập trình Web", 3, "Xây dựng ứng dụng web full-stack.", cntt, CourseType.REQUIRED);
        Course db = course("INT2207", "Cơ sở dữ liệu", 3, "Thiết kế và truy vấn cơ sở dữ liệu với SQL.", cntt, CourseType.REQUIRED);
        Course math = course("MATH1101", "Giải tích 1", 3, "Hàm số, giới hạn, đạo hàm và tích phân.", cntt, CourseType.REQUIRED);
        Course java = course("INT2204", "Lập trình hướng đối tượng", 3, "Lập trình Java và các nguyên lý OOP.", cntt, CourseType.REQUIRED);
        Course network = course("INT2213", "Mạng máy tính", 3, "Kiến thức về mô hình OSI, TCP/IP.", cntt, CourseType.REQUIRED);
        Course dataStructures = course("INT2214", "Cấu trúc dữ liệu và giải thuật", 3, "Mảng, danh sách liên kết, cây, đồ thị.", cntt, CourseType.REQUIRED);
        Course os = course("INT2215", "Hệ điều hành", 3, "Quản lý tiến trình, bộ nhớ và tệp tin.", cntt, CourseType.REQUIRED);
        Course se = course("INT2216", "Công nghệ phần mềm", 3, "Các mô hình phát triển phần mềm và quy trình.", cntt, CourseType.REQUIRED);
        Course ai = course("INT2217", "Trí tuệ nhân tạo nhập môn", 3, "Các giải thuật tìm kiếm và học máy cơ bản.", cntt, CourseType.REQUIRED);
        Course mobile = course("INT2218", "Lập trình di động", 3, "Phát triển ứng dụng di động Android/iOS.", cntt, CourseType.REQUIRED);
        Course security = course("INT2219", "An toàn thông tin", 3, "Mật mã học cơ bản và an ninh hệ thống.", cntt, CourseType.REQUIRED);
        Course discreteMath = course("MATH1102", "Toán rời rạc", 3, "Logic toán, lý thuyết đồ thị và tổ hợp.", cntt, CourseType.REQUIRED);

        Course econ = course("ECON1101", "Kinh tế vi mô", 3, "Nghiên cứu hành vi của người tiêu dùng và doanh nghiệp.", kt, CourseType.REQUIRED);
        Course macro = course("ECON1201", "Kinh tế vĩ mô", 3, "Nghiên cứu sản lượng, lạm phát và lãi suất toàn quốc.", kt, CourseType.REQUIRED);
        Course accounting = course("ACC1101", "Nguyên lý kế toán", 3, "Hệ thống chứng từ và báo cáo tài chính.", kt, CourseType.REQUIRED);
        Course marketing = course("MKT1101", "Marketing căn bản", 3, "Chiến lược định vị sản phẩm và thị trường.", qtkd, CourseType.REQUIRED);
        Course management = course("BUS1101", "Quản trị học", 3, "Kinh nghiệm tổ chức, hoạch định và lãnh đạo.", qtkd, CourseType.REQUIRED);
        Course translation = course("ENG2101", "Biên dịch Anh - Việt", 3, "Phương pháp dịch thuật văn bản Anh - Việt.", nna, CourseType.REQUIRED);

        Course english = course("ENG1101", "Tiếng Anh học thuật", 2, "Kỹ năng đọc viết tiếng Anh môi trường đại học.", null, CourseType.ELECTIVE);
        Course english2 = course("ENG1102", "Tiếng Anh giao tiếp", 2, "Phát triển kỹ năng nói tiếng Anh.", null, CourseType.ELECTIVE);
        Course softSkills = course("GEN1101", "Kỹ năng mềm", 2, "Giao tiếp, thuyết trình và làm việc nhóm.", null, CourseType.ELECTIVE);
        Course law = course("LAW1101", "Pháp luật đại cương", 2, "Kiến thức pháp lý căn bản cho công dân.", null, CourseType.ELECTIVE);
        Course startup = course("BUS1201", "Khởi nghiệp đổi mới sáng tạo", 2, "Phát triển sản phẩm và gọi vốn.", null, CourseType.ELECTIVE);
        Course psychology = course("SOC1101", "Tâm lý học đại cương", 2, "Nghiên cứu tâm lý học cơ bản.", null, CourseType.ELECTIVE);

        prerequisites(web, java);
        prerequisites(db, discreteMath);
        prerequisites(os, dataStructures);
        prerequisites(se, java);
        prerequisites(ai, dataStructures);
        prerequisites(mobile, java, web);
        prerequisites(security, network);
        prerequisites(macro, econ);
        prerequisites(accounting, econ);
        prerequisites(marketing, management);

        // Seed 10 Teachers (Giảng viên có tên có dấu tiếng Việt)
        Teacher gv101 = teacher("gv101", "teacher1@tlu.edu.vn", "GV101", "Nguyễn Minh Anh", deptCNTT, "Thổ khoa ThS");
        Teacher gv102 = teacher("gv102", "teacher2@tlu.edu.vn", "GV102", "Trần Hoàng Nam", deptKT, "Tiến sĩ TS");
        Teacher gv103 = teacher("gv103", "teacher3@tlu.edu.vn", "GV103", "Đỗ Quang Huy", deptCNTT, "Tiến sĩ TS");
        Teacher gv104 = teacher("gv104", "teacher4@tlu.edu.vn", "GV104", "Phạm Thu Hà", deptNN, "Thạc sĩ ThS");
        Teacher gv105 = teacher("gv105", "teacher5@tlu.edu.vn", "GV105", "Vũ Thị Mai", deptQTKD, "Thạc sĩ ThS");
        Teacher gv106 = teacher("gv106", "teacher6@tlu.edu.vn", "GV106", "Hoàng Đức Long", deptTKDH, "Thạc sĩ ThS");
        Teacher gv107 = teacher("gv107", "teacher7@tlu.edu.vn", "GV107", "Nguyễn Bích Diệp", deptNN, "Tiến sĩ TS");
        Teacher gv108 = teacher("gv108", "teacher8@tlu.edu.vn", "GV108", "Bùi Quang Đạo", deptCNTT, "Tiến sĩ TS");
        Teacher gv109 = teacher("gv109", "teacher9@tlu.edu.vn", "GV109", "Lê Văn Hoàng", deptKT, "Thạc sĩ ThS");
        Teacher gv110 = teacher("gv110", "teacher10@tlu.edu.vn", "GV110", "Trịnh Kim Chi", deptQTKD, "Tiến sĩ TS");

        // Seed Homerooms
        Homeroom cnttK36A = homeroom("CNTT-K36A", gv101, cntt, 2025, "K36");
        Homeroom khmtK36A = homeroom("KHMT-K36A", gv103, khmt, 2025, "K36");
        Homeroom ktK36A = homeroom("KT-K36A", gv102, kt, 2025, "K36");
        Homeroom qtkdK36A = homeroom("QTKD-K36A", gv105, qtkd, 2025, "K36");
        Homeroom nnaK36A = homeroom("NNA-K36A", gv104, nna, 2025, "K36");

        // Admin
        admin("admin", "admin@tlu.edu.vn");

        // Seed 20 Students (Sinh viên có dấu tiếng Việt)
        List<Student> students = new ArrayList<>();
        students.add(student("sv001", "student1@tlu.edu.vn", "SV001", "Lê Thanh Bình", cntt, 2025, cnttK36A));
        students.add(student("sv002", "student2@tlu.edu.vn", "SV002", "Phạm Ngọc Linh", kt, 2025, ktK36A));
        students.add(student("sv003", "student3@tlu.edu.vn", "SV003", "Nguyễn Văn An", cntt, 2025, cnttK36A));
        students.add(student("sv004", "student4@tlu.edu.vn", "SV004", "Trần Thị Bình", cntt, 2025, cnttK36A));
        students.add(student("sv005", "student5@tlu.edu.vn", "SV005", "Lê Hoàng Cường", khmt, 2025, khmtK36A));
        students.add(student("sv006", "student6@tlu.edu.vn", "SV006", "Phạm Minh Đức", khmt, 2025, khmtK36A));
        students.add(student("sv007", "student7@tlu.edu.vn", "SV007", "Đỗ Thu Giang", attt, 2025, cnttK36A));
        students.add(student("sv008", "student8@tlu.edu.vn", "SV008", "Hoàng Văn Hải", attt, 2025, cnttK36A));
        students.add(student("sv009", "student9@tlu.edu.vn", "SV009", "Vũ Thị Hương", qtkd, 2025, qtkdK36A));
        students.add(student("sv010", "student10@tlu.edu.vn", "SV010", "Nguyễn Tiến Khanh", qtkd, 2025, qtkdK36A));
        students.add(student("sv011", "student11@tlu.edu.vn", "SV011", "Phan Thảo Linh", nna, 2025, nnaK36A));
        students.add(student("sv012", "student12@tlu.edu.vn", "SV012", "Bùi Văn Nam", nna, 2025, nnaK36A));
        students.add(student("sv013", "student13@tlu.edu.vn", "SV013", "Trịnh Khánh Ngọc", tkdh, 2025, cnttK36A));
        students.add(student("sv014", "student14@tlu.edu.vn", "SV014", "Đặng Minh Quân", tkdh, 2025, cnttK36A));
        students.add(student("sv015", "student15@tlu.edu.vn", "SV015", "Nguyễn Thị Thảo", tcnh, 2025, ktK36A));
        students.add(student("sv016", "student16@tlu.edu.vn", "SV016", "Vũ Hoàng Sơn", tcnh, 2025, ktK36A));
        students.add(student("sv017", "student17@tlu.edu.vn", "SV017", "Mai Khánh Vân", ktdn, 2025, ktK36A));
        students.add(student("sv018", "student18@tlu.edu.vn", "SV018", "Đỗ Trung Kiên", nnt, 2025, nnaK36A));
        students.add(student("sv019", "student19@tlu.edu.vn", "SV019", "Nguyễn Hoài Nam", cntt, 2025, cnttK36A));
        students.add(student("sv020", "student20@tlu.edu.vn", "SV020", "Phạm Hồng Ngọc", khmt, 2025, khmtK36A));

        // ==========================================
        // HỌC KỲ 1 (ĐÃ KẾT THÚC)
        // ==========================================
        ClassSection math01 = classSection("MATH1101-01", math, hk1, gv103, a101, 2, p1, p3, 60,
                LocalDateTime.of(2026, 1, 5, 8, 0), "Phòng A101");
        ClassSection java01 = classSection("INT2204-01", java, hk1, gv101, lab301, 4, p4, p6, 45,
                LocalDateTime.of(2026, 1, 8, 13, 30), "Phòng LAB301");
        ClassSection econ01 = classSection("ECON1101-01", econ, hk1, gv102, b202, 3, p1, p3, 50,
                LocalDateTime.of(2026, 1, 10, 8, 0), "Phòng B202");
        ClassSection english01 = classSection("ENG1101-01", english, hk1, gv104, b202, 5, p1, p2, 40,
                LocalDateTime.of(2026, 1, 12, 8, 0), "Phòng B202");

        // Đăng ký học kỳ 1 cho một số sinh viên
        for (int i = 0; i < 10; i++) {
            Student s = students.get(i);
            if (s.getMajor().getDepartment().getDepartmentCode().equals("CNTT")) {
                Enrollment em = enrollment(s, math01, EnrollmentStatus.REGISTERED);
                Enrollment ej = enrollment(s, java01, EnrollmentStatus.REGISTERED);
                // sv001 bị trượt Giải tích 1 để học lại
                if (s.getStudentCode().equals("SV001")) {
                    grade(em, 4.0f, 3.0f, 2.5f); // F
                } else {
                    grade(em, 8.0f, 8.0f, 8.5f);
                }
                grade(ej, 7.5f, 8.0f, 8.2f);
            } else if (s.getMajor().getDepartment().getDepartmentCode().equals("KT")) {
                Enrollment ee = enrollment(s, econ01, EnrollmentStatus.REGISTERED);
                grade(ee, 8.0f, 7.5f, 8.0f);
            }
            Enrollment eeng = enrollment(s, english01, EnrollmentStatus.REGISTERED);
            grade(eeng, 7.0f, 7.0f, 7.5f);

            // Hoá đơn học phí Học kỳ 1
            tuitionBill(s, hk1, new BigDecimal("12500000"), new BigDecimal("12500000"), true);
        }

        // ==========================================
        // HỌC KỲ 2 (ĐANG DIỄN RA - SEED LỚP HỌC PHẦN)
        // ==========================================
        ClassSection web02 = classSection("INT2208-01", web, hk2, gv101, a101, 2, p1, p3, 60, null, null);
        ClassSection db02 = classSection("INT2207-01", db, hk2, gv108, lab301, 4, p4, p6, 40, null, null);
        ClassSection dataStructures02 = classSection("INT2214-01", dataStructures, hk2, gv103, lab402, 5, p1, p3, 40, null, null);
        ClassSection os02 = classSection("INT2215-01", os, hk2, gv108, lab402, 3, p4, p6, 40, null, null);
        ClassSection network02 = classSection("INT2213-01", network, hk2, gv103, a101, 6, p1, p3, 50, null, null);
        ClassSection econ02 = classSection("ECON1101-02", econ, hk2, gv109, b202, 3, p1, p3, 45, null, null);
        ClassSection macro02 = classSection("ECON1201-01", macro, hk2, gv102, b202, 4, p4, p6, 45, null, null);
        ClassSection translation02 = classSection("ENG2101-01", translation, hk2, gv107, c303, 2, p4, p6, 45, null, null);

        // Đăng ký học phần HK2 cho sinh viên
        // Gán 12 sinh viên học Cấu trúc dữ liệu và giải thuật (dataStructures02) để test chia phòng thi
        for (int i = 0; i < 20; i++) {
            Student s = students.get(i);
            // Học phí HK2
            tuitionBill(s, hk2, new BigDecimal("7500000"), BigDecimal.ZERO, false);

            if (s.getMajor().getDepartment().getDepartmentCode().equals("CNTT")) {
                enrollment(s, web02, EnrollmentStatus.REGISTERED);
                enrollment(s, db02, EnrollmentStatus.REGISTERED);
                if (i < 12) {
                    enrollment(s, dataStructures02, EnrollmentStatus.REGISTERED);
                    enrollment(s, os02, EnrollmentStatus.REGISTERED);
                }
            } else if (s.getMajor().getDepartment().getDepartmentCode().equals("KT")) {
                enrollment(s, econ02, EnrollmentStatus.REGISTERED);
                enrollment(s, macro02, EnrollmentStatus.REGISTERED);
            } else if (s.getMajor().getDepartment().getDepartmentCode().equals("NN")) {
                enrollment(s, translation02, EnrollmentStatus.REGISTERED);
            }
        }

        System.out.println(" Seed data initialized. Accounts: admin/password123, sv001-sv020/password123, gv101-gv110/password123");
    }

    private User admin(String username, String email) {
        return userRepository.findByUsername(username)
                .orElseGet(() -> saveUser(username, email, Role.ADMIN));
    }

    private Student student(String username, String email, String code, String fullName, Major major, Integer academicYear, Homeroom homeroom) {
        return studentRepository.findByStudentCode(code).map(existing -> {
            applyStudentProfile(existing, code, fullName, major, academicYear, homeroom);
            return studentRepository.save(existing);
        }).orElseGet(() -> {
            User user = userRepository.findByUsername(username)
                    .orElseGet(() -> saveUser(username, email, Role.STUDENT));

            Student student = new Student();
            student.setUser(user);
            applyStudentProfile(student, code, fullName, major, academicYear, homeroom);
            return studentRepository.save(student);
        });
    }

    private void applyStudentProfile(Student student, String code, String fullName, Major major, Integer academicYear, Homeroom homeroom) {
        boolean firstStudent = code.endsWith("1");
        student.setStudentCode(code);
        student.setFullName(fullName);
        student.setDob(firstStudent ? LocalDate.of(2004, 1, 10) : LocalDate.of(2004, 8, 18));
        student.setGender(firstStudent ? "Nam" : "Nữ");
        student.setPhone(firstStudent ? "0987654321" : "0977000002");
        student.setNationalId(firstStudent ? "001204000789" : "001204000790");
        student.setPlaceOfBirth(firstStudent ? "Hà Nội" : "Nam Định");
        student.setHometown(firstStudent ? "Thanh Trì, Hà Nội" : "Hải Hậu, Nam Định");
        student.setPermanentAddress(firstStudent
                ? "Số 15, ngõ 120 Nguyễn Trãi, Thanh Xuân, Hà Nội"
                : "Số 8 Trần Hưng Đạo, Hải Hậu, Nam Định");
        student.setCurrentAddress(firstStudent
                ? "KTX Thăng Long, Nghiêm Xuân Yêm, Hoàng Mai, Hà Nội"
                : "Số 22 Chùa Láng, Đống Đa, Hà Nội");
        student.setEmergencyContact(firstStudent
                ? "Lê Văn Thành - 0912345678"
                : "Phạm Thị Hoa - 0912000002");
        student.setAddress(student.getCurrentAddress());
        student.setCohort("K36");
        student.setHomeroom(homeroom);
        student.setStatus("Đang học");
        student.setTrainingType("Đại học chính quy");
        student.setMajor(major);
        student.setAcademicYear(academicYear);
    }

    private Teacher teacher(String username, String email, String code, String fullName, Department department, String degree) {
        boolean isFirst = code.endsWith("1");
        boolean isSecond = code.endsWith("2");

        LocalDate dobDate = isFirst ? LocalDate.of(1985, 5, 12) : isSecond ? LocalDate.of(1982, 3, 8) : LocalDate.of(1988, 11, 25);
        String phone = isFirst ? "0901000001" : isSecond ? "0902000002" : "0903000003";
        String gender = code.endsWith("4") ? "Nữ" : "Nam";
        String nationalId = isFirst ? "001185000101" : isSecond ? "001182000202" : code.endsWith("3") ? "001188000303" : "001188000404";
        String placeOfBirth = isFirst ? "Hà Nội" : isSecond ? "Nghệ An" : code.endsWith("3") ? "Hải Dương" : "Thái Nguyên";
        String hometown = isFirst ? "Thanh Xuân, Hà Nội" : isSecond ? "Vinh, Nghệ An" : code.endsWith("3") ? "Hải Dương" : "Thái Nguyên";
        String permanentAddress = isFirst ? "Số 25 Nguyễn Trãi, Thanh Xuân, Hà Nội" : isSecond ? "Số 10 Lê Lợi, Vinh, Nghệ An" : code.endsWith("3") ? "Số 5 Trần Phú, Hải Dương" : "Số 18 Hoàng Văn Thụ, Thái Nguyên";
        String currentAddress = permanentAddress;
        String emergencyContact = isFirst ? "Nguyễn Văn An - 0912000001" : isSecond ? "Trần Thị Lan - 0912000002" : code.endsWith("3") ? "Đỗ Văn Minh - 0912000003" : "Lê Thị Hoa - 0912000004";

        return teacherRepository.findByTeacherCode(code).map(existing -> {
            existing.setFullName(fullName);
            existing.setDob(dobDate);
            existing.setGender(gender);
            existing.setPhone(phone);
            existing.setNationalId(nationalId);
            existing.setPlaceOfBirth(placeOfBirth);
            existing.setHometown(hometown);
            existing.setPermanentAddress(permanentAddress);
            existing.setCurrentAddress(currentAddress);
            existing.setEmergencyContact(emergencyContact);
            existing.setDepartment(department);
            existing.setDegree(degree);
            existing.setAddress(currentAddress);
            if (existing.getStatus() == null) {
                existing.setStatus(com.example.ThangLongUniversityWeb.enums.TeacherStatus.DANG_GIANG_DAY);
            }
            return teacherRepository.save(existing);
        }).orElseGet(() -> {
            User user = userRepository.findByUsername(username)
                    .orElseGet(() -> saveUser(username, email, Role.TEACHER));
            Teacher t = new Teacher();
            t.setUser(user);
            t.setTeacherCode(code);
            t.setFullName(fullName);
            t.setDob(dobDate);
            t.setGender(gender);
            t.setPhone(phone);
            t.setNationalId(nationalId);
            t.setPlaceOfBirth(placeOfBirth);
            t.setHometown(hometown);
            t.setPermanentAddress(permanentAddress);
            t.setCurrentAddress(currentAddress);
            t.setEmergencyContact(emergencyContact);
            t.setDepartment(department);
            t.setDegree(degree);
            t.setAddress(currentAddress);
            t.setStatus(com.example.ThangLongUniversityWeb.enums.TeacherStatus.DANG_GIANG_DAY);
            return teacherRepository.save(t);
        });
    }

    private Department department(String code, String name, String description) {
        return departmentRepository.findByDepartmentCode(code).orElseGet(() -> {
            Department dept = new Department();
            dept.setDepartmentCode(code);
            dept.setName(name);
            dept.setDescription(description);
            return departmentRepository.save(dept);
        });
    }

    private Homeroom homeroom(String className, Teacher advisor, Major major, Integer academicYear, String cohort) {
        return homeroomRepository.findByClassName(className).orElseGet(() -> {
            Homeroom hr = new Homeroom();
            hr.setClassName(className);
            hr.setAdvisor(advisor);
            hr.setMajor(major);
            hr.setAcademicYear(academicYear);
            hr.setCohort(cohort);
            hr.setIsActive(true);
            return homeroomRepository.save(hr);
        });
    }

    private User saveUser(String username, String email, Role role) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(DEFAULT_PASSWORD));
        user.setRole(role);
        user.setActive(true);
        return userRepository.save(user);
    }

    private Major major(String code, String name, String description, Department department) {
        return majorRepository.findByMajorCode(code).map(existing -> {
            existing.setName(name);
            existing.setDescription(description);
            existing.setDepartment(department);
            return majorRepository.save(existing);
        }).orElseGet(() -> {
            Major major = new Major();
            major.setMajorCode(code);
            major.setName(name);
            major.setDescription(description);
            major.setDepartment(department);
            return majorRepository.save(major);
        });
    }

    private Course course(String code, String name, Integer credits, String description, Major major, CourseType courseType) {
        return courseRepository.findByCode(code).map(existing -> {
            existing.setName(name);
            existing.setCredits(credits);
            existing.setDescription(description);
            existing.setMajor(major);
            existing.setCourseType(courseType);
            return courseRepository.save(existing);
        }).orElseGet(() -> {
            Course course = new Course();
            course.setCode(code);
            course.setName(name);
            course.setCredits(credits);
            course.setDescription(description);
            course.setMajor(major);
            course.setCourseType(courseType);
            return courseRepository.save(course);
        });
    }

    private Course prerequisites(Course course, Course... prerequisites) {
        course.getPrerequisites().clear();
        for (Course prerequisite : prerequisites) {
            if (prerequisite != null && prerequisite.getId() != null && !prerequisite.getId().equals(course.getId())) {
                course.getPrerequisites().add(prerequisite);
            }
        }
        return courseRepository.save(course);
    }

    private Semester semester(String name, LocalDate start, LocalDate end, boolean registrationOpen, boolean locked) {
        return semesterRepository.findByName(name).map(existing -> {
            existing.setStartDate(start);
            existing.setEndDate(end);
            existing.setRegistrationOpen(registrationOpen);
            existing.setLocked(locked);
            return semesterRepository.save(existing);
        }).orElseGet(() -> {
            Semester semester = new Semester();
            semester.setName(name);
            semester.setStartDate(start);
            semester.setEndDate(end);
            semester.setRegistrationOpen(registrationOpen);
            semester.setLocked(locked);
            return semesterRepository.save(semester);
        });
    }

    private Room room(String name, Integer capacity, String type, String status) {
        return roomRepository.findByName(name).map(existing -> {
            existing.setCapacity(capacity);
            existing.setType(type);
            existing.setStatus(status);
            return roomRepository.save(existing);
        }).orElseGet(() -> {
            Room room = new Room();
            room.setName(name);
            room.setCapacity(capacity);
            room.setType(type);
            room.setStatus(status);
            return roomRepository.save(room);
        });
    }

    private Period period(Integer number, String start, String end) {
        return periodRepository.findByPeriodNumber(number).orElseGet(() -> {
            Period period = new Period();
            period.setPeriodNumber(number);
            period.setStartTime(LocalTime.parse(start));
            period.setEndTime(LocalTime.parse(end));
            return periodRepository.save(period);
        });
    }

    private ClassSection classSection(
            String code,
            Course course,
            Semester semester,
            Teacher teacher,
            Room room,
            Integer dayOfWeek,
            Period startPeriod,
            Period endPeriod,
            Integer maxSlots,
            LocalDateTime examAt,
            String examRoom
    ) {
        return classSectionRepository.findBySemesterIdAndClassCode(semester.getId(), code).map(existing -> {
            existing.setCourse(course);
            existing.setSemester(semester);
            existing.setTeacher(teacher);
            existing.setRoom(room);
            existing.setDayOfWeek(dayOfWeek);
            existing.setStartPeriod(startPeriod);
            existing.setEndPeriod(endPeriod);
            existing.setMaxSlots(maxSlots);
            if (existing.getCurrentSlots() == null) existing.setCurrentSlots(0);
            existing.setClosed(false);
            existing.setGradeLocked(false);
            existing.setExamAt(examAt);
            existing.setExamRoom(examRoom);
            if (existing.getSchedules().isEmpty()) {
                ClassSectionSchedule schedule = new ClassSectionSchedule();
                schedule.setClassSection(existing);
                schedule.setDayOfWeek(dayOfWeek);
                schedule.setStartPeriod(startPeriod);
                schedule.setEndPeriod(endPeriod);
                schedule.setRoom(room);
                existing.getSchedules().add(schedule);
            } else {
                ClassSectionSchedule schedule = existing.getSchedules().get(0);
                schedule.setDayOfWeek(dayOfWeek);
                schedule.setStartPeriod(startPeriod);
                schedule.setEndPeriod(endPeriod);
                schedule.setRoom(room);
            }
            return classSectionRepository.save(existing);
        }).orElseGet(() -> {
            ClassSection section = new ClassSection();
            section.setClassCode(code);
            section.setCourse(course);
            section.setSemester(semester);
            section.setTeacher(teacher);
            section.setRoom(room);
            section.setDayOfWeek(dayOfWeek);
            section.setStartPeriod(startPeriod);
            section.setEndPeriod(endPeriod);
            section.setMaxSlots(maxSlots);
            section.setCurrentSlots(0);
            section.setClosed(false);
            section.setGradeLocked(false);
            section.setExamAt(examAt);
            section.setExamRoom(examRoom);

            ClassSectionSchedule schedule = new ClassSectionSchedule();
            schedule.setClassSection(section);
            schedule.setDayOfWeek(dayOfWeek);
            schedule.setStartPeriod(startPeriod);
            schedule.setEndPeriod(endPeriod);
            schedule.setRoom(room);
            section.getSchedules().add(schedule);

            return classSectionRepository.save(section);
        });
    }

    private Enrollment enrollment(Student student, ClassSection section, EnrollmentStatus status) {
        return enrollmentRepository.findByStudentIdAndClassSectionId(student.getId(), section.getId()).map(existing -> {
            existing.setStatus(status);
            return enrollmentRepository.save(existing);
        }).orElseGet(() -> {
            Enrollment enrollment = new Enrollment();
            enrollment.setStudent(student);
            enrollment.setClassSection(section);
            enrollment.setStatus(status);

            section.setCurrentSlots(section.getCurrentSlots() + 1);
            classSectionRepository.save(section);

            return enrollmentRepository.save(enrollment);
        });
    }

    private Grade grade(Enrollment enrollment, Float participation, Float midterm, Float finalScore) {
        return gradeRepository.findByEnrollmentId(enrollment.getId()).map(existing -> {
            existing.setParticipationScore(participation);
            existing.setMidtermScore(midterm);
            existing.setFinalScore(finalScore);
            Grade saved = gradeRepository.save(existing);
            enrollment.setGrade(saved);
            courseOutcomeService.recalculate(enrollment);
            return saved;
        }).orElseGet(() -> {
            Grade grade = new Grade();
            grade.setEnrollment(enrollment);
            grade.setParticipationScore(participation);
            grade.setMidtermScore(midterm);
            grade.setFinalScore(finalScore);
            Grade saved = gradeRepository.save(grade);
            enrollment.setGrade(saved);
            courseOutcomeService.recalculate(enrollment);
            return saved;
        });
    }

    private TuitionBill tuitionBill(Student student, Semester semester, BigDecimal total, BigDecimal paid, boolean completed) {
        return tuitionBillRepository.findByStudentIdAndSemesterId(student.getId(), semester.getId()).map(existing -> {
            existing.setTotalAmount(total);
            existing.setPaidAmount(paid);
            existing.setCompleted(completed);
            return tuitionBillRepository.save(existing);
        }).orElseGet(() -> {
            TuitionBill bill = new TuitionBill();
            bill.setStudent(student);
            bill.setSemester(semester);
            bill.setTotalAmount(total);
            bill.setPaidAmount(paid);
            bill.setCompleted(completed);
            return tuitionBillRepository.save(bill);
        });
    }
}
