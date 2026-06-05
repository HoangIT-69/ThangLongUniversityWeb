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
        migrateCourseStatusColumn();
        migrateClassSectionClassCodeConstraint();
        migrateSemesterEndedColumn();
    }

    private void migrateSemesterEndedColumn() {
        try {
            jdbcTemplate.execute("ALTER TABLE semesters ADD COLUMN IF NOT EXISTS ended boolean DEFAULT false NOT NULL");
        } catch (Exception ignored) {
            // Best-effort migration for existing local databases.
        }
    }

    private void migrateCourseStatusColumn() {
        // Thêm cột course_status nếu chưa tồn tại (ddl-auto=update có thể đã thêm, câu lệnh này safe)
        jdbcTemplate.execute("""
                ALTER TABLE enrollments
                ADD COLUMN IF NOT EXISTS course_status VARCHAR(30) DEFAULT 'IN_PROGRESS'
                """);
    }

    private void migrateClassSectionClassCodeConstraint() {
        jdbcTemplate.execute("""
                DO $$
                DECLARE
                    constraint_name text;
                BEGIN
                    FOR constraint_name IN
                        SELECT c.conname
                        FROM pg_constraint c
                        JOIN pg_class t ON t.oid = c.conrelid
                        JOIN pg_namespace n ON n.oid = t.relnamespace
                        WHERE t.relname = 'class_sections'
                          AND c.contype = 'u'
                          AND pg_get_constraintdef(c.oid) = 'UNIQUE (class_code)'
                    LOOP
                        EXECUTE format('ALTER TABLE class_sections DROP CONSTRAINT IF EXISTS %I', constraint_name);
                    END LOOP;
                END $$;
                """);
        jdbcTemplate.execute("DROP INDEX IF EXISTS uk_class_sections_semester_class_code");
        jdbcTemplate.execute("""
                CREATE UNIQUE INDEX IF NOT EXISTS uk_class_sections_semester_class_code
                ON class_sections (semester_id, class_code)
                """);
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
