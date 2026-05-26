package com.example.ThangLongUniversityWeb.repository;

import com.example.ThangLongUniversityWeb.entity.ClassSection;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassSectionRepository extends JpaRepository<ClassSection, Long> {
    Optional<ClassSection> findByClassCode(String classCode);

    List<ClassSection> findBySemesterId(Long semesterId);

    List<ClassSection> findBySemesterIdAndCourseId(Long semesterId, Long courseId);

    List<ClassSection> findByTeacherIdAndSemesterId(Long teacherId, Long semesterId);

    List<ClassSection> findByTeacherId(Long teacherId);

    @Query("select count(cs) from ClassSection cs " +
            "where cs.semester.id = :semesterId " +
            "and cs.room.id = :roomId " +
            "and cs.dayOfWeek = :dayOfWeek " +
            "and cs.id <> coalesce(:excludeId, -1) " +
            "and cs.startPeriod.periodNumber <= :endPeriodNumber " +
            "and cs.endPeriod.periodNumber >= :startPeriodNumber")
    long countRoomConflicts(
            @Param("semesterId") Long semesterId,
            @Param("roomId") Long roomId,
            @Param("dayOfWeek") Integer dayOfWeek,
            @Param("startPeriodNumber") Integer startPeriodNumber,
            @Param("endPeriodNumber") Integer endPeriodNumber,
            @Param("excludeId") Long excludeId);

    @Query("SELECT cs FROM ClassSection cs " +
            "WHERE cs.semester.id = :semesterId " +
            "AND cs.teacher.id = :teacherId " +
            "AND cs.dayOfWeek = :dayOfWeek " +
            "AND cs.id <> COALESCE(:excludeId, -1) " +
            "AND cs.startPeriod.periodNumber <= :endPeriodNumber " +
            "AND cs.endPeriod.periodNumber >= :startPeriodNumber")
    List<ClassSection> findTeacherConflicts(
            @Param("semesterId") Long semesterId,
            @Param("teacherId") Long teacherId,
            @Param("dayOfWeek") Integer dayOfWeek,
            @Param("startPeriodNumber") Integer startPeriodNumber,
            @Param("endPeriodNumber") Integer endPeriodNumber,
            @Param("excludeId") Long excludeId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select cs from ClassSection cs where cs.id = :id")
    Optional<ClassSection> findByIdForUpdate(@Param("id") Long id);
}
