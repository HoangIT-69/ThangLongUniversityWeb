package com.example.ThangLongUniversityWeb.service;

import com.example.ThangLongUniversityWeb.enums.Role;
import com.example.ThangLongUniversityWeb.entity.User;
import com.example.ThangLongUniversityWeb.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RedisTokenService redisTokenService;

    // 1. CHỈ DÙNG ĐỂ TẠO ADMIN MỚI (Student/Teacher đã có Service riêng tạo rồi)
    @Transactional
    public User createAdmin(String username, String password, String email) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }

        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setRole(Role.ADMIN); // Ép cứng luôn là Role ADMIN
        user.setActive(true);

        return userRepository.save(user);
    }

    // 2. KHÓA / MỞ KHÓA TÀI KHOẢN
    @Transactional
    public User toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User!"));

        // Đảo ngược trạng thái
        boolean newStatus = !user.isActive();
        user.setActive(newStatus);

        // SỬA ĐOẠN NÀY: Nếu tài khoản bị KHÓA (newStatus == false), lập tức xóa Refresh Token trong Redis
        if (!newStatus) {
            redisTokenService.revokeAllForUser(user.getUsername());
        }

        return userRepository.save(user);
    }

    // 3. XÓA TÀI KHOẢN (Chỉ xóa Admin, nếu xóa SV/GV thì phải xóa từ StudentService)
    @Transactional
    public void deleteAdminUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User!"));

        if (user.getRole() != Role.ADMIN) {
            throw new RuntimeException("API này chỉ dùng để xóa Admin. Muốn xóa SV/GV hãy dùng API tương ứng!");
        }

        userRepository.delete(user);
    }
}