package com.example.ThangLongUniversityWeb.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Order(1)
public class EnrollmentStatusConstraintMigrator implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        migrateEnrollmentStatusConstraint();
        migrateExamRegistrationStatusConstraint();
    }

    private void migrateEnrollmentStatusConstraint() {
        jdbcTemplate.execute("ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_status_check");
        jdbcTemplate.execute("""
                ALTER TABLE enrollments
                ADD CONSTRAINT enrollments_status_check
                CHECK (status IS NULL OR status IN ('PENDING', 'REGISTERED', 'CANCELED', 'PASSED', 'FAILED'))
                """);
    }

    private void migrateExamRegistrationStatusConstraint() {
        jdbcTemplate.execute("ALTER TABLE exam_registrations DROP CONSTRAINT IF EXISTS exam_registrations_status_check");
        jdbcTemplate.execute("""
                ALTER TABLE exam_registrations
                ADD CONSTRAINT exam_registrations_status_check
                CHECK (status IS NULL OR status IN ('PENDING', 'REGISTERED', 'CANCELED', 'PASSED', 'FAILED'))
                """);
    }
}
