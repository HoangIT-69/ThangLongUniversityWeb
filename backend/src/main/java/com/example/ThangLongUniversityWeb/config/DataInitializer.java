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

    @Override
    @Transactional
    public void run(String... args) {
        // Seed default system settings
        systemSettingsRepository.findById(StudentRetakeService.KEY_RETAKE_FEE).orElseGet(() ->
            systemSettingsRepository.save(new SystemSettings(
                StudentRetakeService.KEY_RETAKE_FEE,
                String.valueOf(StudentRetakeService.DEFAULT_RETAKE_FEE),
                "Phi thi lai moi mon (VND)"
            ))
        );

        // Seed Departments
        Department deptCNTT = department("CNTT", "Khoa Cong nghe thong tin", "Dao tao CNTT va HTTT");
        Department deptKT = department("KT", "Khoa Kinh te", "Dao tao kinh te va tai chinh");
        Department deptNN = department("NN", "Khoa Ngoai ngu", "Dao tao ngon ngu va bien phien dich");
        Department deptQTKD = department("QTKD", "Khoa Quan tri kinh doanh", "Dao tao quan tri va marketing");

        Major cntt = major("CNTT", "Cong nghe thong tin", "Dao tao lap trinh, he thong thong tin va cong nghe phan mem.", deptCNTT);
        Major kt = major("KT", "Kinh te", "Dao tao kinh te ung dung va quan tri.", deptKT);
        Major qtkd = major("QTKD", "Quan tri kinh doanh", "Dao tao quan tri doanh nghiep, marketing va van hanh.", deptQTKD);
        Major nn = major("NN", "Ngon ngu Anh", "Dao tao ngon ngu, bien phien dich va tieng Anh ung dung.", deptNN);

        Semester hk1 = semester("HK1 2025-2026", LocalDate.of(2025, 9, 1), LocalDate.of(2026, 1, 15), false, false);
        Semester hk2 = semester("HK2 2025-2026", LocalDate.of(2026, 2, 2), LocalDate.of(2026, 6, 15), true, false);

        Room a101 = room("A101", 60, "LECTURE", "AVAILABLE");
        Room b202 = room("B202", 45, "LECTURE", "AVAILABLE");
        Room lab301 = room("LAB301", 35, "LAB", "AVAILABLE");
        Room c303 = room("C303", 55, "LECTURE", "AVAILABLE");
        Room lab402 = room("LAB402", 40, "LAB", "AVAILABLE");

        Period p1 = period(1, "07:00", "07:50");
        Period p2 = period(2, "08:00", "08:50");
        Period p3 = period(3, "09:00", "09:50");
        Period p4 = period(4, "10:00", "10:50");
        Period p5 = period(5, "13:00", "13:50");
        Period p6 = period(6, "14:00", "14:50");
        Period p7 = period(7, "15:00", "15:50");
        Period p8 = period(8, "16:00", "16:50");

        Course web = course("INT2208", "Lap trinh Web", 3, "Xay dung ung dung web full-stack.", cntt, CourseType.REQUIRED);
        Course db = course("INT2207", "Co so du lieu", 3, "Thiet ke va truy van co so du lieu.", cntt, CourseType.REQUIRED);
        Course math = course("MATH1101", "Giai tich 1", 3, "Nen tang giai tich cho sinh vien nam nhat.", cntt, CourseType.REQUIRED);
        Course java = course("INT2204", "Lap trinh huong doi tuong", 3, "Lap trinh Java va thiet ke huong doi tuong.", cntt, CourseType.REQUIRED);
        Course network = course("INT2213", "Mang may tinh", 3, "Kien thuc co ban ve TCP/IP va he thong mang.", cntt, CourseType.REQUIRED);
        Course dataStructures = course("INT2214", "Cau truc du lieu va giai thuat", 3, "Danh sach, cay, do thi va phan tich do phuc tap.", cntt, CourseType.REQUIRED);
        Course os = course("INT2215", "He dieu hanh", 3, "Tien trinh, bo nho, he thong tep va dong bo.", cntt, CourseType.REQUIRED);
        Course se = course("INT2216", "Cong nghe phan mem", 3, "Quy trinh phat trien, phan tich yeu cau va kiem thu.", cntt, CourseType.REQUIRED);
        Course ai = course("INT2217", "Tri tue nhan tao nhap mon", 3, "Tim kiem, suy dien, hoc may co ban va ung dung AI.", cntt, CourseType.REQUIRED);
        Course mobile = course("INT2218", "Lap trinh di dong", 3, "Xay dung ung dung Android/iOS va API backend.", cntt, CourseType.REQUIRED);
        Course security = course("INT2219", "An toan thong tin", 3, "Mat ma ung dung, bao mat mang va phong chong tan cong.", cntt, CourseType.REQUIRED);
        Course discreteMath = course("MATH1102", "Toan roi rac", 3, "Logic, tap hop, quan he, to hop va do thi.", cntt, CourseType.REQUIRED);

        Course econ = course("ECON1101", "Kinh te vi mo", 3, "Kien thuc co ban ve kinh te vi mo.", kt, CourseType.REQUIRED);
        Course macro = course("ECON1201", "Kinh te vi mo nang cao", 3, "Thi truong, chinh sach va phan tich vi mo ung dung.", kt, CourseType.REQUIRED);
        Course accounting = course("ACC1101", "Nguyen ly ke toan", 3, "He thong tai khoan, chung tu va bao cao tai chinh.", kt, CourseType.REQUIRED);
        Course marketing = course("MKT1101", "Marketing can ban", 3, "Nghien cuu thi truong, dinh vi va marketing mix.", qtkd, CourseType.REQUIRED);
        Course management = course("BUS1101", "Quan tri hoc", 3, "Chuc nang quan tri, to chuc va lanh dao doanh nghiep.", qtkd, CourseType.REQUIRED);
        Course translation = course("ENG2101", "Bien dich can ban", 3, "Ky nang bien dich Anh - Viet va Viet - Anh.", nn, CourseType.REQUIRED);

        Course english = course("ENG1101", "Tieng Anh hoc thuat", 2, "Ky nang doc viet tieng Anh trong moi truong dai hoc.", null, CourseType.ELECTIVE);
        Course english2 = course("ENG1102", "Tieng Anh giao tiep", 2, "Giao tiep hoc thuat va cong viec bang tieng Anh.", null, CourseType.ELECTIVE);
        Course softSkills = course("GEN1101", "Ky nang mem", 2, "Lam viec nhom, thuyet trinh va quan ly thoi gian.", null, CourseType.ELECTIVE);
        Course law = course("LAW1101", "Phap luat dai cuong", 2, "Kien thuc phap luat nen tang cho sinh vien.", null, CourseType.ELECTIVE);
        Course startup = course("BUS1201", "Khoi nghiep doi moi sang tao", 2, "Tu duy san pham, mo hinh kinh doanh va go-to-market.", null, CourseType.ELECTIVE);
        Course psychology = course("SOC1101", "Tam ly hoc dai cuong", 2, "Hanh vi ca nhan, dong luc va giao tiep xa hoi.", null, CourseType.ELECTIVE);

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

        Teacher gv101 = teacher("gv101", "teacher1@tlu.edu.vn", "GV101", "Nguyen Minh Anh", deptCNTT, "ThS");
        Teacher gv102 = teacher("gv102", "teacher2@tlu.edu.vn", "GV102", "Tran Hoang Nam", deptKT, "TS");
        Teacher gv103 = teacher("gv103", "teacher3@tlu.edu.vn", "GV103", "Do Quang Huy", deptCNTT, "TS");
        Teacher gv104 = teacher("gv104", "teacher4@tlu.edu.vn", "GV104", "Pham Thu Ha", deptNN, "ThS");

        // Seed Homerooms
        Homeroom cnttK36A = homeroom("CNTT-K36A", gv101, cntt, 2025, "K36");
        Homeroom ktK36A = homeroom("KT-K36A", gv102, kt, 2025, "K36");

        Student sv001 = student("sv001", "student1@tlu.edu.vn", "SV001", "Le Thanh Binh", cntt, 2025, cnttK36A);
        Student sv002 = student("sv002", "student2@tlu.edu.vn", "SV002", "Pham Ngoc Linh", kt, 2025, ktK36A);

        admin("admin", "admin@tlu.edu.vn");

        ClassSection web01 = classSection("INT2208-01", web, hk1, gv101, a101, 2, p1, p3, 60,
                LocalDateTime.of(2026, 1, 5, 8, 0), "A101");
        ClassSection db01 = classSection("INT2207-01", db, hk1, gv101, lab301, 4, p4, p6, 35,
                LocalDateTime.of(2026, 1, 8, 13, 30), "LAB301");
        ClassSection math01 = classSection("MATH1101-01", math, hk1, gv101, a101, 5, p1, p3, 60,
                LocalDateTime.of(2026, 1, 12, 8, 0), "A101");
        ClassSection java01 = classSection("INT2204-01", java, hk1, gv101, lab301, 6, p1, p3, 45,
                LocalDateTime.of(2026, 1, 14, 8, 0), "LAB301");
        ClassSection english01 = classSection("ENG1101-01", english, hk1, gv102, b202, 3, p4, p5, 40,
                LocalDateTime.of(2026, 1, 16, 9, 0), "B202");
        ClassSection econ01 = classSection("ECON1101-01", econ, hk1, gv102, b202, 3, p1, p3, 45,
                LocalDateTime.of(2026, 1, 10, 8, 0), "B202");
        ClassSection web02 = classSection("INT2208-02", web, hk2, gv101, a101, 2, p1, p3, 60,
                LocalDateTime.of(2026, 6, 1, 8, 0), "A101");
        addSchedule(web02, 6, p1, p3, a101);
        ClassSection db02 = classSection("INT2207-02", db, hk2, gv101, lab301, 4, p4, p6, 35,
                LocalDateTime.of(2026, 6, 4, 13, 30), "LAB301");
        ClassSection math02 = classSection("MATH1101-02", math, hk2, gv101, b202, 5, p1, p3, 60,
                LocalDateTime.of(2026, 6, 6, 8, 0), "B202");
        ClassSection java02 = classSection("INT2204-02", java, hk2, gv101, lab301, 3, p1, p3, 45,
                LocalDateTime.of(2026, 6, 10, 8, 0), "LAB301");
        ClassSection network02 = classSection("INT2213-02", network, hk2, gv101, a101, 6, p4, p6, 50,
                LocalDateTime.of(2026, 6, 12, 13, 30), "A101");
        ClassSection english02 = classSection("ENG1101-02", english, hk2, gv102, b202, 7, p1, p2, 40,
                LocalDateTime.of(2026, 6, 15, 8, 0), "B202");
        ClassSection econ02 = classSection("ECON1101-02", econ, hk2, gv102, b202, 3, p1, p3, 45,
                LocalDateTime.of(2026, 6, 8, 8, 0), "B202");
        ClassSection dataStructures02 = classSection("INT2214-02", dataStructures, hk2, gv103, lab402, 2, p4, p6, 40,
                LocalDateTime.of(2026, 6, 16, 13, 30), "LAB402");
        ClassSection os02 = classSection("INT2215-02", os, hk2, gv103, lab402, 4, p1, p3, 40,
                LocalDateTime.of(2026, 6, 18, 8, 0), "LAB402");
        ClassSection se02 = classSection("INT2216-02", se, hk2, gv101, c303, 5, p4, p6, 55,
                LocalDateTime.of(2026, 6, 20, 13, 30), "C303");
        ClassSection ai02 = classSection("INT2217-02", ai, hk2, gv103, lab301, 6, p1, p3, 35,
                LocalDateTime.of(2026, 6, 22, 8, 0), "LAB301");
        ClassSection mobile02 = classSection("INT2218-02", mobile, hk2, gv101, lab402, 7, p4, p6, 40,
                LocalDateTime.of(2026, 6, 24, 13, 30), "LAB402");
        ClassSection security02 = classSection("INT2219-02", security, hk2, gv103, c303, 2, p7, p8, 50,
                LocalDateTime.of(2026, 6, 26, 15, 0), "C303");
        ClassSection discreteMath02 = classSection("MATH1102-02", discreteMath, hk2, gv101, a101, 3, p4, p6, 60,
                LocalDateTime.of(2026, 6, 28, 13, 30), "A101");
        ClassSection english202 = classSection("ENG1102-02", english2, hk2, gv104, b202, 5, p7, p8, 40,
                LocalDateTime.of(2026, 6, 19, 15, 0), "B202");
        ClassSection softSkills02 = classSection("GEN1101-02", softSkills, hk2, gv104, c303, 6, p7, p8, 55,
                LocalDateTime.of(2026, 6, 21, 15, 0), "C303");
        ClassSection law02 = classSection("LAW1101-02", law, hk2, gv102, a101, 4, p7, p8, 60,
                LocalDateTime.of(2026, 6, 23, 15, 0), "A101");
        ClassSection startup02 = classSection("BUS1201-02", startup, hk2, gv102, c303, 7, p1, p2, 55,
                LocalDateTime.of(2026, 6, 25, 8, 0), "C303");
        ClassSection psychology02 = classSection("SOC1101-02", psychology, hk2, gv104, b202, 2, p5, p6, 45,
                LocalDateTime.of(2026, 6, 27, 13, 0), "B202");
        ClassSection macro02 = classSection("ECON1201-02", macro, hk2, gv102, b202, 4, p1, p3, 45,
                LocalDateTime.of(2026, 6, 17, 8, 0), "B202");
        ClassSection accounting02 = classSection("ACC1101-02", accounting, hk2, gv102, c303, 5, p1, p3, 55,
                LocalDateTime.of(2026, 6, 19, 8, 0), "C303");
        ClassSection marketing02 = classSection("MKT1101-02", marketing, hk2, gv102, c303, 3, p4, p6, 55,
                LocalDateTime.of(2026, 6, 21, 13, 30), "C303");
        ClassSection management02 = classSection("BUS1101-02", management, hk2, gv102, a101, 6, p1, p3, 60,
                LocalDateTime.of(2026, 6, 23, 8, 0), "A101");
        ClassSection translation02 = classSection("ENG2101-02", translation, hk2, gv104, b202, 4, p4, p6, 45,
                LocalDateTime.of(2026, 6, 25, 13, 30), "B202");

        Enrollment e1 = enrollment(sv001, web01, EnrollmentStatus.REGISTERED);
        Enrollment e2 = enrollment(sv001, db01, EnrollmentStatus.REGISTERED);
        Enrollment e4 = enrollment(sv001, math01, EnrollmentStatus.REGISTERED);
        Enrollment e6 = enrollment(sv001, java01, EnrollmentStatus.REGISTERED);
        Enrollment e7 = enrollment(sv001, english01, EnrollmentStatus.REGISTERED);
        Enrollment e8 = enrollment(sv001, web02, EnrollmentStatus.REGISTERED);
        Enrollment e9 = enrollment(sv001, java02, EnrollmentStatus.REGISTERED);
        Enrollment e10 = enrollment(sv001, english02, EnrollmentStatus.REGISTERED);
        Enrollment e3 = enrollment(sv002, econ01, EnrollmentStatus.REGISTERED);
        Enrollment e5 = enrollment(sv002, econ02, EnrollmentStatus.REGISTERED);

        grade(e1, 8.0f, 8.0f, 8.5f);
        grade(e2, 7.5f, 7.0f, 7.8f);
        grade(e4, 3.0f, 3.5f, 3.4f);
        grade(e6, 8.5f, 8.0f, 8.2f);
        grade(e7, 6.5f, 7.0f, 6.8f);
        grade(e8, null, null, null);
        grade(e9, null, null, null);
        grade(e10, null, null, null);
        grade(e3, 8.5f, 8.0f, 8.0f);
        grade(e5, null, null, null);

        tuitionBill(sv001, hk1, new BigDecimal("11900000"), new BigDecimal("5000000"), false);
        tuitionBill(sv001, hk2, new BigDecimal("6800000"), BigDecimal.ZERO, false);
        tuitionBill(sv002, hk1, new BigDecimal("2550000"), new BigDecimal("2550000"), true);

        System.out.println("Seed data initialized. Login accounts: admin/password123, sv001/password123, sv002/password123, gv101/password123, gv102/password123");
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
        student.setGender(firstStudent ? "Nam" : "Nu");
        student.setPhone(firstStudent ? "0987654321" : "0977000002");
        student.setNationalId(firstStudent ? "001204000789" : "001204000790");
        student.setPlaceOfBirth(firstStudent ? "Ha Noi" : "Nam Dinh");
        student.setHometown(firstStudent ? "Thanh Tri, Ha Noi" : "Hai Hau, Nam Dinh");
        student.setPermanentAddress(firstStudent
                ? "So 15, ngo 120 Nguyen Trai, Thanh Xuan, Ha Noi"
                : "So 8 Tran Hung Dao, Hai Hau, Nam Dinh");
        student.setCurrentAddress(firstStudent
                ? "KTX Thang Long, Nghiem Xuan Yem, Hoang Mai, Ha Noi"
                : "So 22 Chua Lang, Dong Da, Ha Noi");
        student.setEmergencyContact(firstStudent
                ? "Le Van Thanh - 0912345678"
                : "Pham Thi Hoa - 0912000002");
        student.setAddress(student.getCurrentAddress());
        student.setCohort(firstStudent ? "K36" : "K36");
        student.setHomeroom(homeroom);
        student.setStatus("Dang hoc");
        student.setTrainingType("Dai hoc chinh quy");
        student.setMajor(major);
        student.setAcademicYear(academicYear);
    }

    private Teacher teacher(String username, String email, String code, String fullName, Department department, String degree) {
        boolean isFirst = code.endsWith("1");
        boolean isSecond = code.endsWith("2");

        LocalDate dobDate = isFirst ? LocalDate.of(1985, 5, 12) : isSecond ? LocalDate.of(1982, 3, 8) : LocalDate.of(1988, 11, 25);
        String phone = isFirst ? "0901000001" : isSecond ? "0902000002" : "0903000003";
        String gender = code.endsWith("4") ? "Nu" : "Nam";
        String nationalId = isFirst ? "001185000101" : isSecond ? "001182000202" : code.endsWith("3") ? "001188000303" : "001188000404";
        String placeOfBirth = isFirst ? "Ha Noi" : isSecond ? "Nghe An" : code.endsWith("3") ? "Hai Duong" : "Thai Nguyen";
        String hometown = isFirst ? "Thanh Xuan, Ha Noi" : isSecond ? "Vinh, Nghe An" : code.endsWith("3") ? "Hai Duong" : "Thai Nguyen";
        String permanentAddress = isFirst ? "So 25 Nguyen Trai, Thanh Xuan, Ha Noi" : isSecond ? "So 10 Le Loi, Vinh, Nghe An" : code.endsWith("3") ? "So 5 Tran Phu, Hai Duong" : "So 18 Hoang Van Thu, Thai Nguyen";
        String currentAddress = permanentAddress;
        String emergencyContact = isFirst ? "Nguyen Van An - 0912000001" : isSecond ? "Tran Thi Lan - 0912000002" : code.endsWith("3") ? "Do Van Minh - 0912000003" : "Le Thi Hoa - 0912000004";

        return teacherRepository.findByTeacherCode(code).map(existing -> {
            // Keep existing user — do NOT reassign to avoid duplicate email errors
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

    private Course course(String code, String name, Integer credits, String description, Major major) {
        return course(code, name, credits, description, major, defaultCourseType(code));
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

    private CourseType defaultCourseType(String code) {
        return code != null && code.startsWith("ENG") ? CourseType.ELECTIVE : CourseType.REQUIRED;
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
        return classSectionRepository.findByClassCode(code).map(existing -> {
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

    private void addSchedule(ClassSection section, Integer dayOfWeek, Period startPeriod, Period endPeriod, Room room) {
        boolean exists = section.getSchedules().stream().anyMatch(schedule ->
                dayOfWeek.equals(schedule.getDayOfWeek())
                        && startPeriod.getId().equals(schedule.getStartPeriod().getId())
                        && endPeriod.getId().equals(schedule.getEndPeriod().getId())
                        && room.getId().equals(schedule.getRoom().getId()));
        if (exists) {
            return;
        }

        ClassSectionSchedule schedule = new ClassSectionSchedule();
        schedule.setClassSection(section);
        schedule.setDayOfWeek(dayOfWeek);
        schedule.setStartPeriod(startPeriod);
        schedule.setEndPeriod(endPeriod);
        schedule.setRoom(room);
        section.getSchedules().add(schedule);
        classSectionRepository.save(section);
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
            return gradeRepository.save(existing);
        }).orElseGet(() -> {
            Grade grade = new Grade();
            grade.setEnrollment(enrollment);
            grade.setParticipationScore(participation);
            grade.setMidtermScore(midterm);
            grade.setFinalScore(finalScore);
            return gradeRepository.save(grade);
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
