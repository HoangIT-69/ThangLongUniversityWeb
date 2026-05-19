package com.example.ThangLongUniversityWeb.controller;

import com.example.ThangLongUniversityWeb.repository.UserRepository;
import com.example.ThangLongUniversityWeb.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users") // KHÁC với /api/users nhé
@RequiredArgsConstructor
@Tag(name = "Admin - Quản lý Tài khoản (User)", description = "Các API quản lý tài khoản hệ thống")
@SecurityRequirement(name = "bearerAuth")
public class UserManagementController {

    private final UserRepository userRepository; // Gọi thẳng để Đọc
    private final UserService userService;       // Gọi qua Service để Ghi

    @Operation(summary = "Lấy danh sách TOÀN BỘ tài khoản trong hệ thống")
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @Operation(summary = "Tạo thêm một Admin mới")
    @PostMapping("/admin")
    public ResponseEntity<?> createAdmin(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam String email) {
        return ResponseEntity.ok(userService.createAdmin(username, password, email));
    }

    @Operation(summary = "Khóa hoặc Mở khóa tài khoản (Ban/Unban)")
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleUserStatus(id));
    }

    @Operation(summary = "Xóa tài khoản Admin")
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteAdminUser(@PathVariable Long id) {
        userService.deleteAdminUser(id);
        return ResponseEntity.ok("Đã xóa Admin thành công!");
    }
}