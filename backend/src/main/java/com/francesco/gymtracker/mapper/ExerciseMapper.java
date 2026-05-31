package com.francesco.gymtracker.mapper;

import com.francesco.gymtracker.dto.request.ExerciseRequest;
import com.francesco.gymtracker.dto.response.ExerciseResponse;
import com.francesco.gymtracker.entity.Exercise;
import org.springframework.stereotype.Component;

@Component
public class ExerciseMapper {

    public Exercise toEntity(ExerciseRequest request) {
        return Exercise.builder()
                .name(request.name())
                .description(request.description())
                .muscleGroup(request.muscleGroup())
                .equipment(request.equipment())
                .imageUrl(request.imageUrl())
                .notes(request.notes())
                .build();
    }

    public void updateEntity(Exercise exercise, ExerciseRequest request) {
        exercise.setName(request.name());
        exercise.setDescription(request.description());
        exercise.setMuscleGroup(request.muscleGroup());
        exercise.setEquipment(request.equipment());
        exercise.setImageUrl(request.imageUrl());
        exercise.setNotes(request.notes());
    }

    public ExerciseResponse toResponse(Exercise exercise) {
        return new ExerciseResponse(
                exercise.getId(),
                exercise.getName(),
                exercise.getDescription(),
                exercise.getMuscleGroup(),
                exercise.getEquipment(),
                exercise.getImageUrl(),
                exercise.getNotes()
        );
    }
}
