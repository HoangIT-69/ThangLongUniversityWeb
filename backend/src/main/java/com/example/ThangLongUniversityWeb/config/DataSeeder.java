package com.example.ThangLongUniversityWeb.config;

import com.example.ThangLongUniversityWeb.entity.Major;
import com.example.ThangLongUniversityWeb.repository.MajorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final MajorRepository majorRepository;

    @Bean
    public CommandLineRunner seedMajors() {
        return args -> {
            upsertMajor("CNTT", "Cong nghe thong tin", "Dao tao lap trinh, he thong thong tin va cong nghe phan mem.");
            upsertMajor("KT", "Kinh te", "Dao tao kinh te ung dung va quan tri.");
            upsertMajor("QTKD", "Quan tri kinh doanh", "Dao tao quan tri doanh nghiep, marketing va van hanh.");
            upsertMajor("NN", "Ngon ngu Anh", "Dao tao ngon ngu, bien phien dich va tieng Anh ung dung.");
        };
    }

    private Major upsertMajor(String code, String name, String description) {
        return majorRepository.findByMajorCode(code).map(existing -> {
            existing.setName(name);
            existing.setDescription(description);
            return majorRepository.save(existing);
        }).orElseGet(() -> {
            Major major = new Major();
            major.setMajorCode(code);
            major.setName(name);
            major.setDescription(description);
            return majorRepository.save(major);
        });
    }
}
