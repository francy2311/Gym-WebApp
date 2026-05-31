package com.francesco.gymtracker.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record WorkoutExerciseRequest(
        @NotNull Long exerciseId,
        @NotNull @Min(1) Integer exerciseOrder,
        @NotNull @Min(1) Integer sets,
        @NotNull @Min(1) Integer reps,
        @NotNull @Min(0) Integer restSeconds,
        String notes
) {
}
