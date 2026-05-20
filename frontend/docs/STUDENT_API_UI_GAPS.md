# Student API/UI Gaps

Purpose: track UI fields that are currently displayed with placeholder/mock values because the backend API does not return them yet.

## Display Rule

- If API returns a value, the UI must render the API value.
- If API does not return a field yet, the UI may render a realistic placeholder so the screen looks like a real university system.
- Placeholder fields should be documented here so backend can add them later.

## Student Profile

Current endpoint used by FE:

- `GET /api/users/me`

Current API fields available:

- `username`
- `email`
- `role`
- `fullName`
- `code`
- `majorOrDegree`
- `avatarUrl`

Fields currently displayed with placeholder/mock data:

- `gender`
- `dateOfBirth`
- `age`
- `nationalId` / CCCD
- `placeOfBirth`
- `hometown`
- `permanentAddress`
- `currentAddress`
- `phone`
- `emergencyContact`
- `cohort`
- `className`
- `academicYear`
- `advisor`
- `status`
- `trainingType`
- `accumulatedCredits`
- `gpa`
- `scholarshipLevel`

Recommended backend response extension:

```json
{
  "username": "sv001",
  "email": "student1@tlu.edu.vn",
  "role": "STUDENT",
  "fullName": "Le Thanh Binh",
  "code": "SV001",
  "majorOrDegree": "Cong nghe thong tin",
  "avatarUrl": "https://...",
  "gender": "Nam",
  "dateOfBirth": "2004-09-12",
  "age": 21,
  "nationalId": "001204000789",
  "placeOfBirth": "Ha Noi",
  "hometown": "Thanh Tri, Ha Noi",
  "permanentAddress": "So 12 ngo 45 Nguyen Trai, Thanh Xuan, Ha Noi",
  "currentAddress": "KTX Dai hoc Thang Long, Nghiem Xuan Yem, Hoang Mai",
  "phone": "0987654321",
  "emergencyContact": "Le Van An - 0912345678",
  "cohort": "K36",
  "className": "CNTT-K36A",
  "academicYear": "2022 - 2026",
  "advisor": "ThS. Nguyen Minh Hoang",
  "status": "Dang hoc",
  "trainingType": "Dai hoc chinh quy",
  "accumulatedCredits": 84,
  "gpa": 3.42,
  "scholarshipLevel": "Gioi"
}
```

## Student Notifications

Current FE state:

- `src/routes/student.notifications.tsx` still reads from `src/data/mock.ts`.

Missing backend endpoints:

- `GET /api/student/notifications`
- `PUT /api/student/notifications/{id}/read`
- `PUT /api/student/notifications/read-all`

Recommended notification response:

```json
{
  "id": "noti-001",
  "type": "INFO",
  "title": "Thong bao hoc phi",
  "body": "Han nop hoc phi hoc ky hien tai la ngay 30/05/2026.",
  "read": false,
  "link": "/student/tuition",
  "createdAt": "2026-05-20T08:00:00"
}
```

## Student Curriculum

Current endpoint used by FE:

- `GET /api/student/curriculum/my-major`

Note:

- `GET /api/student/curriculum` exists in Swagger but returned `400` when tested with `sv001/password123`.
- FE now uses `my-major` because it matches student context and works with the test account.

Useful fields to keep returning:

- `id`
- `code`
- `name`
- `credits`
- `description`
- `courseType`
- `courseTypeLabel`
- `majorName`
- `prerequisiteNames`

Optional fields for a richer curriculum UI:

- `semesterSuggested`
- `departmentName`
- `theoryHours`
- `practiceHours`
- `assessmentMethod`
