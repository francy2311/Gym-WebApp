package com.francesco.gymtracker.dto.response;

import com.francesco.gymtracker.enums.WorkoutGoal;

public record WorkoutResponse(
        Long id,
        String name,
        String description,
        WorkoutGoal goal
) {
}
