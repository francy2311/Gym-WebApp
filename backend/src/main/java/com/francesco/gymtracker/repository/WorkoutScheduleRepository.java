package com.francesco.gymtracker.repository;

import com.francesco.gymtracker.entity.WorkoutSchedule;
import com.francesco.gymtracker.entity.User;
import com.francesco.gymtracker.enums.WeekDay;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface WorkoutScheduleRepository extends JpaRepository<WorkoutSchedule, Long> {

    @EntityGraph(attributePaths = {"workout", "workout.exercises", "workout.exercises.exercise"})
    Optional<WorkoutSchedule> findByWeekDayAndUser(WeekDay weekDay, User user);

    @EntityGraph(attributePaths = "workout")
    List<WorkoutSchedule> findAllByUser(User user);

    void deleteByWeekDayInAndUser(Collection<WeekDay> weekDays, User user);

    List<WorkoutSchedule> findByWorkoutIdAndUser(Long workoutId, User user);
}
