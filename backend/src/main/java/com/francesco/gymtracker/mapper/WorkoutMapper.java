package com.francesco.gymtracker.mapper;

import com.francesco.gymtracker.dto.request.WorkoutRequest;
import com.francesco.gymtracker.dto.response.WorkoutDetailResponse;
import com.francesco.gymtracker.dto.response.WorkoutExerciseResponse;
import com.francesco.gymtracker.dto.response.WorkoutResponse;
import com.francesco.gymtracker.entity.Workout;
import com.francesco.gymtracker.entity.WorkoutExercise;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
@RequiredArgsConstructor
public class WorkoutMapper {

    private final ExerciseMapper exerciseMapper;

    public Workout toEntity(WorkoutRequest request) {
        return Workout.builder()
                .name(request.name())
                .description(request.description())
                .goal(request.goal())
                .build();
    }

    public void updateEntity(Workout workout, WorkoutRequest request) {
        workout.setName(request.name());
        workout.setDescription(request.description());
        workout.setGoal(request.goal());
    }

    public WorkoutResponse toResponse(Workout workout) {
        return new WorkoutResponse(
                workout.getId(),
                workout.getName(),
                workout.getDescription(),
                workout.getGoal()
        );
    }

    public WorkoutDetailResponse toDetailResponse(Workout workout) {
        List<WorkoutExerciseResponse> exercises = workout.getExercises().stream()
                .sorted(Comparator.comparing(WorkoutExercise::getExerciseOrder))
                .map(this::toWorkoutExerciseResponse)
                .toList();

        return new WorkoutDetailResponse(
                workout.getId(),
                workout.getName(),
                workout.getDescription(),
                workout.getGoal(),
                exercises
        );
    }

    public WorkoutExerciseResponse toWorkoutExerciseResponse(WorkoutExercise workoutExercise) {
        return new WorkoutExerciseResponse(
                workoutExercise.getId(),
                workoutExercise.getExerciseOrder(),
                workoutExercise.getSets(),
                workoutExercise.getReps(),
                workoutExercise.getRestSeconds(),
                workoutExercise.getNotes(),
                exerciseMapper.toResponse(workoutExercise.getExercise())
        );
    }
}
