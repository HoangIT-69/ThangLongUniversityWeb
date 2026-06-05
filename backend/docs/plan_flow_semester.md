# Sửa logic quản lý kì học: Trạng thái điểm, hiển thị & xếp lịch thi

## Bối cảnh

Hệ thống quản lý kì học cần đảm bảo các business rules:
1. SV vắng ≥ 4 buổi → **Cấm thi** → không sửa điểm, không xếp lịch thi
2. Trung bình điểm chuyên cần + giữa kì < 4 → **Học lại** → phải đăng ký học lại
3. Tổng điểm (`totalScore`) < 4 → **Thi lại** → được thi lại để kéo tổng điểm lên
4. Hiển thị trạng thái rõ ràng trên cả giao diện giảng viên lẫn sinh viên

---

## Bộ Enum `CourseStudyStatus` (giữ nguyên, chốt ý nghĩa)

| Enum | Tên hiển thị | Ý nghĩa | Điều kiện |
|---|---|---|---|
| `IN_PROGRESS` | Đang học | Chưa đủ dữ liệu xét | Mặc định |
| `BANNED_FROM_EXAM` | Cấm thi | Vắng ≥ 4 buổi → không được thi → phải học lại | `absences > 3` |
| `REPEAT_COURSE` | Học lại | Điểm CC + giữa kì quá thấp, chưa cần thi đã biết không đạt | `participation*0.25 + midterm*0.75 < 4.0` (chưa có điểm cuối kì) |
| `RETAKE_EXAM` | Thi lại | Có đủ điểm nhưng tổng kết < 4, do điểm thi kéo xuống | `totalScore < 4.0` (đã có đủ điểm) |
| `PASSED` | Đạt | Qua môn | `totalScore >= 4.0` |

> [!NOTE]
> **Thi lại ≠ Học lại**: "Thi lại" = điểm final score thấp kéo totalScore < 4, SV chỉ cần thi lại cuối kì. "Học lại" = điểm quá trình đã quá thấp hoặc bị cấm thi, SV phải đăng ký học lại toàn bộ môn.

---

## Proposed Changes

### Backend — Logic nghiệp vụ

---

#### [MODIFY] [CourseOutcomeService.java](file:///d:/universityweb/backend/src/main/java/com/example/ThangLongUniversityWeb/service/CourseOutcomeService.java)

**Hiện tại**: Logic tính `courseStatus` đã đúng cơ bản. **Không cần sửa logic.**

Xác nhận lại flow:
- `absences > 3` → `BANNED_FROM_EXAM` ✅
- `participation*0.25 + midterm*0.75 < 4` (chưa có final) → `REPEAT_COURSE` ✅
- `totalScore < 4` → `RETAKE_EXAM` ✅
- `totalScore >= 4` → `PASSED` ✅

> [!IMPORTANT]
> Logic hiện tại **không ghi đè điểm thành 0** khi bị cấm thi — đây đúng ý bạn muốn. Điểm thực vẫn được giữ, chỉ trạng thái thay đổi.

---

#### [MODIFY] [TeacherGradeController.java](file:///d:/universityweb/backend/src/main/java/com/example/ThangLongUniversityWeb/controller/TeacherGradeController.java)

**Thay đổi**: Thêm validation chặn giảng viên cập nhật điểm cho SV bị `BANNED_FROM_EXAM` hoặc `REPEAT_COURSE`.

Trong method `updateStudentGrade()` (line ~65, sau khi verify teacher authorization):
```java
// Chặn cập nhật điểm cho SV bị cấm thi hoặc học lại
CourseStudyStatus courseStatus = enrollment.getCourseStatus();
if (courseStatus == CourseStudyStatus.BANNED_FROM_EXAM) {
    throw new RuntimeException("Sinh viên bị cấm thi do nghỉ quá buổi, không thể cập nhật điểm.");
}
if (courseStatus == CourseStudyStatus.REPEAT_COURSE) {
    throw new RuntimeException("Sinh viên phải học lại, không thể cập nhật điểm.");
}
```

---

#### [MODIFY] [ExamSessionService.java](file:///d:/universityweb/backend/src/main/java/com/example/ThangLongUniversityWeb/service/ExamSessionService.java)

**Thay đổi**: Lọc bỏ SV bị `BANNED_FROM_EXAM` hoặc `REPEAT_COURSE` khỏi danh sách thi.

Trong method `collectCandidates()` (line 134-139), thêm filter cho thi NORMAL:
```java
if (examType == ExamType.NORMAL) {
    enrollmentRepository.findByClassSectionSemesterIdAndStatus(semesterId, EnrollmentStatus.REGISTERED)
            .stream()
            .filter(e -> e.getClassSection().getCourse().getId().equals(courseId))
            // ⬇️ THÊM MỚI: Loại bỏ SV bị cấm thi hoặc học lại
            .filter(e -> e.getCourseStatus() != CourseStudyStatus.BANNED_FROM_EXAM
                      && e.getCourseStatus() != CourseStudyStatus.REPEAT_COURSE)
            .sorted(Comparator.comparing(e -> e.getStudent().getStudentCode()))
            .forEach(e -> byStudent.putIfAbsent(e.getStudent().getId(),
                    new ExamCandidate(e.getStudent(), e, null, "NORMAL")));
}
```

Cần thêm import: `import com.example.ThangLongUniversityWeb.enums.CourseStudyStatus;`

---

### Frontend — Bảng điểm giảng viên

---

#### [MODIFY] [teacherMappers.ts](file:///d:/universityweb/frontend/src/features/teacher/teacherMappers.ts)

**Thay đổi**: Thêm `courseStatus` và `absenceCount` vào `TeacherGradeRow` + cập nhật `mapApiGradeRow()`.

1. Thêm field vào interface `TeacherGradeRow` (line ~45):
```ts
export interface TeacherGradeRow {
  // ... existing fields ...
  courseStatus: string | null;    // THÊM MỚI
  absenceCount: number | null;   // THÊM MỚI
}
```

2. Cập nhật `mapApiGradeRow()` (line ~153):
```ts
courseStatus: row.courseStatus ?? null,
absenceCount: row.absenceCount ?? null,
```

3. Cập nhật `canEdit` logic:
```ts
// SV bị cấm thi/học lại → không cho sửa điểm
const banned = row.courseStatus === "BANNED_FROM_EXAM" || row.courseStatus === "REPEAT_COURSE";
canEdit: !banned,
```

---

#### [MODIFY] [TeacherGradeTable.tsx](file:///d:/universityweb/frontend/src/features/teacher/TeacherGradeTable.tsx)

**Thay đổi**: 
1. Thêm cột **"Trạng thái"** vào bảng điểm
2. Khi SV bị `BANNED_FROM_EXAM` hoặc `REPEAT_COURSE` → disable tất cả ô nhập điểm, highlight row đỏ
3. Hiển thị badge trạng thái (giống trang attendance)

Cột "Trạng thái" hiển thị:
| courseStatus | Label | Style |
|---|---|---|
| `IN_PROGRESS` | Đang học | Muted/grey |
| `PASSED` | Đạt | Green |
| `BANNED_FROM_EXAM` | Cấm thi | Red destructive |
| `REPEAT_COURSE` | Học lại | Red destructive |
| `RETAKE_EXAM` | Thi lại | Amber/warning |

Khi `BANNED_FROM_EXAM` hoặc `REPEAT_COURSE`:
- Toàn bộ ô input bị `disabled`
- Row có background nhạt đỏ (`bg-destructive/5`)

---

### Frontend — Trang kết quả sinh viên

---

#### [MODIFY] [student.academic-results.tsx](file:///d:/universityweb/frontend/src/routes/student.academic-results.tsx)

**Thay đổi**: Thêm cột **"Trạng thái"** vào bảng kết quả học tập sinh viên.

1. Kiểm tra API response `GradeResponse` đã có field `courseStatus` chưa → Nếu chưa có trong `getLearningResults()` response, cần bổ sung
2. Thêm cột sau cột GPA4:

| courseStatus | Label | Style |
|---|---|---|
| `PASSED` | Đạt | Green badge |
| `BANNED_FROM_EXAM` | Cấm thi | Red badge |
| `REPEAT_COURSE` | Học lại | Red badge |
| `RETAKE_EXAM` | Thi lại | Amber badge |
| `IN_PROGRESS` | Đang học | Grey (ẩn/muted) |

---

#### [MODIFY] [GradeService.java](file:///d:/universityweb/backend/src/main/java/com/example/ThangLongUniversityWeb/service/GradeService.java) — `getLearningResults()`

**Thay đổi**: Đảm bảo response trả về cho sinh viên có chứa `courseStatus`.

Kiểm tra `LearningResultsResponse` → nếu chưa có `courseStatus` trong từng grade item, cần map thêm `enrollment.getCourseStatus()` vào response.

---

### Frontend — Trang xem lịch thi sinh viên

---

#### Không cần sửa UI

Vì backend đã lọc bỏ SV bị cấm thi/học lại khỏi `ExamSeatAssignment`, SV sẽ tự động **không thấy lịch thi** cho môn đó trên giao diện.

---

## Tóm tắt các file cần sửa

| # | File | Thay đổi | Ảnh hưởng |
|---|---|---|---|
| 1 | [TeacherGradeController.java](file:///d:/universityweb/backend/src/main/java/com/example/ThangLongUniversityWeb/controller/TeacherGradeController.java) | Chặn sửa điểm SV cấm thi/học lại | Backend |
| 2 | [ExamSessionService.java](file:///d:/universityweb/backend/src/main/java/com/example/ThangLongUniversityWeb/service/ExamSessionService.java) | Lọc SV cấm thi/học lại khỏi xếp lịch thi | Backend |
| 3 | [GradeService.java](file:///d:/universityweb/backend/src/main/java/com/example/ThangLongUniversityWeb/service/GradeService.java) | Đảm bảo `courseStatus` có trong response SV | Backend |
| 4 | [teacherMappers.ts](file:///d:/universityweb/frontend/src/features/teacher/teacherMappers.ts) | Thêm `courseStatus`, `absenceCount`, logic `canEdit` | Frontend |
| 5 | [TeacherGradeTable.tsx](file:///d:/universityweb/frontend/src/features/teacher/TeacherGradeTable.tsx) | Thêm cột Trạng thái, disable row, highlight | Frontend |
| 6 | [student.academic-results.tsx](file:///d:/universityweb/frontend/src/routes/student.academic-results.tsx) | Thêm cột Trạng thái | Frontend |

---

## Verification Plan

### Automated Tests
1. Kiểm tra backend build thành công: `./mvnw compile`
2. Kiểm tra frontend build: `npm run build`

### Manual Verification
1. **Giảng viên điểm danh**: Đánh dấu SV vắng 4+ buổi → kiểm tra status chuyển `BANNED_FROM_EXAM`
2. **Bảng điểm giảng viên**: SV bị cấm thi → cột "Trạng thái" hiện "Cấm thi" (đỏ) + không sửa được điểm
3. **Bảng điểm giảng viên**: SV có totalScore < 4 → hiện "Thi lại" (vàng)
4. **Kết quả sinh viên**: Hiện cột Trạng thái với badge tương ứng
5. **Xếp lịch thi**: SV bị cấm thi/học lại không xuất hiện trong danh sách chia phòng
6. **API test**: Gọi PUT grade cho SV bị BANNED → trả về lỗi 400/500

## Open Questions

> [!IMPORTANT]
> **Q1**: Công thức hiện tại cho REPEAT_COURSE: `participation*0.25 + midterm*0.75 < 4`. Bạn muốn giữ trọng số 0.25/0.75 hay dùng trung bình cộng đơn giản `(participation + midterm) / 2 < 4`?
>
> **Q2**: Khi SV đã bị `BANNED_FROM_EXAM`, nếu giảng viên sửa lại điểm danh (bỏ vắng, còn ≤ 3 buổi), hệ thống sẽ tự động recalculate và bỏ trạng thái cấm thi. Điều này có đúng ý bạn không?
