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
            if (majorRepository.count() == 0) {
                // Seed sample majors
                Major cntt = new Major();
                cntt.setMajorCode("CNTT");
                cntt.setName("Công nghệ thông tin");
                cntt.setDescription("Ngành Công nghệ thông tin");
                majorRepository.save(cntt);

                Major kt = new Major();
                kt.setMajorCode("KT");
                kt.setName("Kinh tế");
                kt.setDescription("Ngành Kinh tế");
                majorRepository.save(kt);

                Major nn = new Major();
                nn.setMajorCode("NN");
                nn.setName("Ngoại ngữ");
                nn.setDescription("Ngành Ngoại ngữ");
                majorRepository.save(nn);

                System.out.println("Seeded sample majors");
            }
        };
    }
}