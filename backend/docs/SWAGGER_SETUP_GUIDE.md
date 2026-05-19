# Swagger/OpenAPI Setup Guide

## 🚀 Tổng quan

Hệ thống đã được cấu hình Swagger/OpenAPI hoàn chỉnh với các tính năng:

- ✅ Swagger UI tại `/swagger-ui/index.html`
- ✅ OpenAPI JSON tại `/v3/api-docs`
- ✅ JWT Bearer Authentication
- ✅ API Grouping
- ✅ Request/Response Examples
- ✅ Validation Documentation
- ✅ HTTP Status Codes

## 📋 Dependencies (Đã có trong build.gradle.kts)

```kotlin
dependencies {
    // SpringDoc OpenAPI
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.5.0")

    // JWT
    implementation("io.jsonwebtoken:jjwt-api:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.11.5")

    // Validation
    implementation("org.springframework.boot:spring-boot-starter-validation")
}
```

## 🔧 Cấu hình đã thực hiện

### 1. OpenApiConfig.java

- Cấu hình thông tin API cơ bản
- JWT Bearer Authentication
- API Grouping theo chức năng
- Multiple server environments

### 2. SecurityConfig.java

- Cho phép truy cập Swagger UI không cần authentication
- Bảo vệ các API khác với JWT

### 3. DTOs với đầy đủ annotations

- **LoginRequest**: Validation + examples
- **CourseRequest**: Validation + examples
- **AuthResponse**: Response schema
- **CourseResponse**: Response schema

### 4. Controllers với đầy đủ annotations

- **AuthController**: Login API với examples
- **CourseManagementController**: CRUD APIs với examples

## 🌐 Truy cập Swagger UI

1. **Start ứng dụng:**

    ```bash
    ./gradlew bootRun
    ```

2. **Truy cập Swagger UI:**

    ```
    http://localhost:8080/swagger-ui/index.html
    ```

3. **Authorize với JWT:**
    - Click "Authorize" button
    - Nhập: `Bearer <your-jwt-token>` (không cần "Bearer " prefix)
    - Click "Authorize"

## 📚 API Groups

Swagger UI sẽ hiển thị các nhóm API:

- **Authentication**: `/api/auth/*`
- **Admin Management**: `/api/admin/*`
- **Student Operations**: `/api/student/*`
- **Teacher Operations**: `/api/teacher/*`
- **Chat System**: `/api/chat/*`

## 🔍 Ví dụ sử dụng

### 1. Đăng nhập

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

**Response:**

```json
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "role": "ADMIN"
}
```

### 2. Tạo môn học

```bash
POST /api/admin/courses
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "code": "CS101",
  "name": "Java Core Programming",
  "credits": 3,
  "description": "Khóa học lập trình Java cơ bản",
  "majorId": 1
}
```

**Response:**

```json
{
    "id": 1,
    "code": "CS101",
    "name": "Java Core Programming",
    "credits": 3,
    "description": "Khóa học lập trình Java cơ bản",
    "majorName": "Công nghệ thông tin",
    "prerequisiteNames": []
}
```

## ⚙️ Cấu hình nâng cao

### Custom OpenAPI Config

```java
@Bean
public OpenAPI customOpenAPI() {
    return new OpenAPI()
            .components(new Components()
                    .addSecuritySchemes("bearerAuth",
                            new SecurityScheme()
                                    .type(SecurityScheme.Type.HTTP)
                                    .scheme("bearer")
                                    .bearerFormat("JWT")))
            .info(new Info()
                    .title("University Management System API")
                    .description("Complete API documentation")
                    .version("1.0"));
}
```

### API Grouping

```java
@Bean
public GroupedOpenApi adminApi() {
    return GroupedOpenApi.builder()
            .group("Admin Management")
            .pathsToMatch("/api/admin/**")
            .build();
}
```

## 🔒 Security Notes

- Swagger UI được phép truy cập công khai
- Các API khác yêu cầu JWT token
- Sử dụng "Authorize" button trong Swagger UI để set token
- Token sẽ được tự động include trong requests

## 🐛 Troubleshooting

### Lỗi "No operations defined"

- Kiểm tra `@Tag` và `@Operation` annotations
- Đảm bảo controllers được scan bởi Spring

### Lỗi Authentication

- Kiểm tra JWT token format
- Đảm bảo token chưa hết hạn
- Verify SecurityConfig cho phép endpoint

### Lỗi Validation

- Kiểm tra `@Valid` annotation trên `@RequestBody`
- Đảm bảo DTOs có validation annotations

## 📖 Tham khảo

- [SpringDoc OpenAPI](https://springdoc.org/)
- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [JWT.io](https://jwt.io/)
