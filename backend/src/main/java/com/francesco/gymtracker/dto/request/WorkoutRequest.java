package com.francesco.gymtracker.dto.request;

import com.francesco.gymtracker.enums.WorkoutGoal;
import jakarta.validation.constraints.NotBlank;

public record WorkoutRequest(
        @NotBlank String name,
        String description,
        WorkoutGoal goal
) {
}
