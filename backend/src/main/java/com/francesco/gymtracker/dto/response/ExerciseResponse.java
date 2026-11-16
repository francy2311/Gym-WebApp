package com.francesco.gymtracker.dto.response;

import com.francesco.gymtracker.enums.EquipmentType;
import com.francesco.gymtracker.enums.MuscleGroup;

public record ExerciseResponse(
        Long id,
        String name,
        String description,
        MuscleGroup muscleGroup,
        EquipmentType equipment,
        String imageUrl,
        String notes,
        boolean editable
) {
}
