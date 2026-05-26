package com.example.ThangLongUniversityWeb.config;

import com.example.ThangLongUniversityWeb.entity.Department;
import com.example.ThangLongUniversityWeb.entity.Major;
import com.example.ThangLongUniversityWeb.repository.DepartmentRepository;
import com.example.ThangLongUniversityWeb.repository.MajorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final DepartmentRepository departmentRepository;
    private final MajorRepository majorRepository;

    @Bean
    public CommandLineRunner seedMajors() {
        return args -> {
            Department deptCNTT = upsertDepartment("CNTT", "Khoa Cong nghe thong tin", "Dao tao CNTT va HTTT");
            Department deptKT = upsertDepartment("KT", "Khoa Kinh te", "Dao tao kinh te va tai chinh");
            Department deptQTKD = upsertDepartment("QTKD", "Khoa Quan tri kinh doanh", "Dao tao quan tri va marketing");
            Department deptNN = upsertDepartment("NN", "Khoa Ngoai ngu", "Dao tao ngon ngu va bien phien dich");

            upsertMajor("CNTT", "Cong nghe thong tin", "Dao tao lap trinh, he thong thong tin va cong nghe phan mem.", deptCNTT);
            upsertMajor("KT", "Kinh te", "Dao tao kinh te ung dung va quan tri.", deptKT);
            upsertMajor("QTKD", "Quan tri kinh doanh", "Dao tao quan tri doanh nghiep, marketing va van hanh.", deptQTKD);
            upsertMajor("NN", "Ngon ngu Anh", "Dao tao ngon ngu, bien phien dich va tieng Anh ung dung.", deptNN);
        };
    }

    private Department upsertDepartment(String code, String name, String description) {
        return departmentRepository.findByDepartmentCode(code).map(existing -> {
            existing.setName(name);
            existing.setDescription(description);
            return departmentRepository.save(existing);
        }).orElseGet(() -> {
            Department department = new Department();
            department.setDepartmentCode(code);
            department.setName(name);
            department.setDescription(description);
            return departmentRepository.save(department);
        });
    }

    private Major upsertMajor(String code, String name, String description, Department department) {
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
}
