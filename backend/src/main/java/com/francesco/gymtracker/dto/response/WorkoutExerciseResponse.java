package com.francesco.gymtracker.dto.response;

public record WorkoutExerciseResponse(
        Long id,
        Integer exerciseOrder,
        Integer sets,
        Integer reps,
        Integer restSeconds,
        String notes,
        ExerciseResponse exercise
) {
}
