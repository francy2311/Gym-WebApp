package com.francesco.gymtracker.repository;

import com.francesco.gymtracker.entity.Exercise;
import com.francesco.gymtracker.entity.User;
import com.francesco.gymtracker.enums.MuscleGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    List<Exercise> findByMuscleGroup(MuscleGroup muscleGroup);

    List<Exercise> findByNameContainingIgnoreCase(String name);

    Optional<Exercise> findByIdAndUser(Long id, User user);
}
