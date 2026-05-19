# Grade System Upgrade Summary

## 1. Những gì đã đạt được

### 1.1. Nâng cấp `Grade` entity

- Thêm trường `retestScore` (`Double`, nullable) để lưu điểm thi lại hoặc cải thiện.
- Thêm trường `attemptNumber` (`Integer`) để lưu số lần học/sửa điểm.
- Thêm trường `enrollmentType` (`Enum`): `ORDINARY`, `RETAKE`, `IMPROVE`.
- Cập nhật logic tính `totalScore` trong `Grade.calculateGrade()`:
    - Nếu `retestScore` tồn tại thì dùng `retestScore` thay cho `finalScore`.
    - Nếu dùng `retestScore`, điểm chữ tối đa bị giới hạn ở `C`.
- Cập nhật tự động tính `letterGrade` và `gpa4` dựa trên `totalScore`.

### 1.2. Logic tính CPA tốt nhất

- Thêm hàm `AcademicResultService.getBestGradesForCPA(Long studentId)`.
- Hàm lấy tất cả `Grade` của sinh viên, nhóm theo `courseId`, và chọn bản ghi có `totalScore` cao nhất cho mỗi môn.
- `calculateCumulativeGPA(Long studentId)` hiện sử dụng danh sách điểm tốt nhất này để tính CPA.

### 1.3. Nâng cấp logic đăng ký lại/cải thiện

- Cập nhật `EnrollmentRepository` với truy vấn mới:
    - `findByStudentIdAndCourseIdOrderByIdDesc(Long studentId, Long courseId)`.
- Trong `EnrollmentConsumer`, khi sinh viên đăng ký môn học:
    - Kiểm tra lại các enrollment môn cũ của sinh viên theo `courseId`.
    - Tự động tăng `attemptNumber` lên `+1` nếu đã có bản ghi trước.
    - Nếu điểm môn cũ `< 4.0` (F) thì dùng `EnrollmentType.RETAKE`.
    - Nếu điểm môn cũ `>= 4.0` thì dùng `EnrollmentType.IMPROVE`.
- Khi đăng ký mới, tạo sẵn một bản ghi `Grade` mới liên kết vào `Enrollment`.

### 1.4. Quản lý lớp học phần

- `ClassSectionManagementController` có các endpoint:
    - `GET /api/admin/class-sections` — lấy tất cả lớp học phần.
    - `GET /api/admin/class-sections/semester/{semesterId}` — lấy lớp theo học kỳ.
    - `POST /api/admin/class-sections` — mở lớp học phần mới.
    - `PUT /api/admin/class-sections/{id}` — cập nhật lớp học phần.
    - `DELETE /api/admin/class-sections/{id}` — xóa lớp học phần.
- `ClassSectionService` chịu trách nhiệm tạo/cập nhật/xóa và chuyển entity sang DTO với `mapToResponse()`.
- `ClassSectionRepository` hỗ trợ tìm theo `semesterId`, `teacherIdAndSemesterId`, `classCode`, và các truy vấn schedule/conflict.

### 1.5. Quản lý ngành học

- `MajorManagementController` có các endpoint:
    - `GET /api/admin/majors` — xem danh sách ngành.
    - `POST /api/admin/majors` — tạo ngành mới.
    - `PUT /api/admin/majors/{id}` — cập nhật ngành.
    - `DELETE /api/admin/majors/{id}` — xóa ngành.
- `MajorService` thực hiện CRUD với validation mã ngành và tên ngành trùng.
- `MajorRepository` có các truy vấn hỗ trợ:
    - `findByMajorCode(String majorCode)`
    - `findByName(String name)`
    - `existsByMajorCode(String majorCode)`
- `DataSeeder` đã seed sẵn một số ngành mẫu (`CNTT`, `KT`, `NN`).

### 1.6. Cập nhật DTO và API phản hồi đầy đủ

- `GradeRequest` thêm `retestScore`.
- `GradeResponse` thêm `retestScore`, `attemptNumber`, `enrollmentType`, `totalScore`.
- `ClassSectionResponse` và `MajorResponse` có định nghĩa riêng (đã có sẵn).

### 1.7. Hạ tầng và migration

- Thêm migration SQL cho `grades`:
    - `retest_score`
    - `attempt_number`
    - `enrollment_type`
- Build dự án đã chạy thành công sau các thay đổi.

## 2. Toàn bộ file liên quan đã thay đổi

- `src/main/java/com/example/ThangLongUniversityWeb/entity/Grade.java`
- `src/main/java/com/example/ThangLongUniversityWeb/enums/EnrollmentType.java`
- `src/main/java/com/example/ThangLongUniversityWeb/service/AcademicResultService.java`
- `src/main/java/com/example/ThangLongUniversityWeb/service/GradeService.java`
- `src/main/java/com/example/ThangLongUniversityWeb/repository/EnrollmentRepository.java`
- `src/main/java/com/example/ThangLongUniversityWeb/kafka/EnrollmentConsumer.java`
- `src/main/java/com/example/ThangLongUniversityWeb/dto/request/GradeRequest.java`
- `src/main/java/com/example/ThangLongUniversityWeb/dto/response/GradeResponse.java`
- `src/main/java/com/example/ThangLongUniversityWeb/controller/ClassSectionManagementController.java`
- `src/main/java/com/example/ThangLongUniversityWeb/service/ClassSectionService.java`
- `src/main/java/com/example/ThangLongUniversityWeb/repository/ClassSectionRepository.java`
- `src/main/java/com/example/ThangLongUniversityWeb/controller/MajorManagementController.java`
- `src/main/java/com/example/ThangLongUniversityWeb/service/MajorService.java`
- `src/main/java/com/example/ThangLongUniversityWeb/repository/MajorRepository.java`
- `src/main/java/com/example/ThangLongUniversityWeb/entity/Major.java`
- `src/main/java/com/example/ThangLongUniversityWeb/config/DataSeeder.java`
- `academic_results_migration.sql`

## 3. Đã xác nhận

- `ClassSectionManagementController` và `MajorManagementController` đã tồn tại.
- Không cần thêm mới nếu bạn đã muốn "Thêm quản lý lớp học" và "Thêm quản lý ngành"; chúng đã được triển khai.

## 4. Gợi ý kiểm tra toàn bộ hệ thống

1. Chạy `./gradlew build` để xác nhận không có lỗi compile.
2. Kiểm tra các endpoint:
    - `GET /api/admin/class-sections`
    - `POST /api/admin/class-sections`
    - `PUT /api/admin/class-sections/{id}`
    - `DELETE /api/admin/class-sections/{id}`
    - `GET /api/admin/majors`
    - `POST /api/admin/majors`
    - `PUT /api/admin/majors/{id}`
    - `DELETE /api/admin/majors/{id}`
3. Kiểm tra tính năng điểm:
    - nhập `retestScore`
    - kiểm tra `attemptNumber` và `enrollmentType`
    - kiểm tra `getBestGradesForCPA`
4. Kiểm tra migration: `psql -U postgres -d <db> -f academic_results_migration.sql`.

---

File báo cáo đầy đủ đã được cập nhật tại `d:/cdtn/ThangLongUniversitylWeb/GRADE_UPGRADE_SUMMARY.md`.

## 2. Các file đã thay đổi chính

- `src/main/java/com/example/ThangLongUniversityWeb/entity/Grade.java`
- `src/main/java/com/example/ThangLongUniversityWeb/enums/EnrollmentType.java`
- `src/main/java/com/example/ThangLongUniversityWeb/service/AcademicResultService.java`
- `src/main/java/com/example/ThangLongUniversityWeb/service/GradeService.java`
- `src/main/java/com/example/ThangLongUniversityWeb/repository/EnrollmentRepository.java`
- `src/main/java/com/example/ThangLongUniversityWeb/kafka/EnrollmentConsumer.java`
- `src/main/java/com/example/ThangLongUniversityWeb/dto/request/GradeRequest.java`
- `src/main/java/com/example/ThangLongUniversityWeb/dto/response/GradeResponse.java`
- `academic_results_migration.sql`

## 3. Test cases cần thực hiện

### 3.1. Kiểm tra migration và schema

- Chạy `psql -U postgres -d <db> -f academic_results_migration.sql`.
- Kiểm tra bảng `grades` có cột mới:
    - `retest_score`
    - `attempt_number`
    - `enrollment_type`
- Kiểm tra `academic_results` vẫn có các cột GPA/CPA đúng.

### 3.2. Kiểm tra build

- Chạy `cd d:\cdtn\ThangLongUniversitylWeb` và `./gradlew build`.
- Build phải thành công.

### 3.3. Test tính điểm `Grade`

1. Tạo `Grade` với `participationScore`, `midtermScore`, `finalScore`.
    - Kiểm tra `totalScore` tính đúng.
    - Kiểm tra `letterGrade` và `gpa4` đúng theo thang điểm.
2. Tạo `Grade` có `retestScore` và `finalScore`:
    - Kiểm tra `totalScore` dùng `retestScore` thay cho `finalScore`.
    - Nếu `totalScore` dẫn đến `A`/`B`, kiểm tra vẫn bị giới hạn thành `C`.

### 3.4. Test đăng ký lại/cải thiện

1. Sinh viên đã học môn X và được `FAILED` (`< 4.0`):
    - Khi đăng ký lại môn X, `Grade.attemptNumber` tăng lên 2.
    - `Grade.enrollmentType` phải là `RETAKE`.
2. Sinh viên đã học môn X và được `PASSED` (`>= 4.0`):
    - Khi đăng ký lại môn X, `Grade.attemptNumber` tăng lên 2.
    - `Grade.enrollmentType` phải là `IMPROVE`.
3. Sinh viên lần đầu đăng ký môn X:
    - `Grade.attemptNumber` = 1.
    - `Grade.enrollmentType` = `ORDINARY`.

### 3.5. Test CPA tính đúng bằng điểm tốt nhất

1. Sinh viên có nhiều `Grade` cho cùng môn học/courses khác nhau.
2. Dùng `AcademicResultService.getBestGradesForCPA(studentId)` để kiểm tra chỉ còn 1 grade tốt nhất cho mỗi `courseId`.
3. Dùng `calculateCumulativeGPA(studentId)` để kiểm CPA dựa trên nhóm này.

### 3.6. Test API / luồng nghiệp vụ

- Kiểm tra endpoint hoặc luồng sau:
    - teacher cập nhật điểm hoặc `retestScore`.
    - student đăng ký lại môn học qua Kafka topic `class-registration`.
    - admin tính GPA/CPA nếu có API tương ứng.
- Kiểm tra response của `GradeResponse` có đủ trường mới.

## 4. Gợi ý dữ liệu test mẫu

- Tạo học kỳ `Semester` đang mở đăng ký.
- Tạo lớp `ClassSection` với `maxSlots > 0`.
- Tạo `Student` và `Teacher` tương ứng.
- Tạo `Enrollment` và `Grade` mẫu để test:
    - `participationScore = 8.0`, `midtermScore = 7.0`, `finalScore = 6.0`.
    - `retestScore = 9.0` để kiểm tra giới hạn `C`.

## 5. Ghi chú quan trọng

- Luồng đăng ký học phần trong dự án đang đi qua Kafka (`EnrollmentConsumer`).
- Nếu kiểm thử trực tiếp API đăng ký, cần đảm bảo Kafka broker đang chạy.
- Nếu muốn test nhanh hơn, có thể tạo trực tiếp `Enrollment` và `Grade` trong database rồi kiểm tra service.

---

File này nằm tại:
`d:/cdtn/ThangLongUniversitylWeb/GRADE_UPGRADE_SUMMARY.md`
