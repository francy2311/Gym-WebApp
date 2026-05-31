package com.francesco.gymtracker.repository;

import com.francesco.gymtracker.entity.Workout;
import com.francesco.gymtracker.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {

    @EntityGraph(attributePaths = {"exercises", "exercises.exercise"})
    Optional<Workout> findWithExercisesByIdAndUser(Long id, User user);

    List<Workout> findAllByUser(User user);

    Optional<Workout> findByIdAndUser(Long id, User user);
}
