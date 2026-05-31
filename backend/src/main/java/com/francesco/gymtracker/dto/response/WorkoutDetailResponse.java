package com.francesco.gymtracker.dto.response;

import com.francesco.gymtracker.enums.WorkoutGoal;

import java.util.List;

public record WorkoutDetailResponse(
        Long id,
        String name,
        String description,
        WorkoutGoal goal,
        List<WorkoutExerciseResponse> exercises
) {
}
