package com.francesco.gymtracker.dto.request;

import com.francesco.gymtracker.enums.EquipmentType;
import com.francesco.gymtracker.enums.MuscleGroup;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ExerciseRequest(
        @NotBlank String name,
        @NotBlank String description,
        @NotNull MuscleGroup muscleGroup,
        EquipmentType equipment,
        String imageUrl,
        String notes
) {
}
