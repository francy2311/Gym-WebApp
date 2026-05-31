package com.francesco.gymtracker.service;

import com.francesco.gymtracker.dto.request.WorkoutExerciseRequest;
import com.francesco.gymtracker.dto.request.WorkoutRequest;
import com.francesco.gymtracker.dto.response.WorkoutDetailResponse;
import com.francesco.gymtracker.dto.response.WorkoutResponse;
import com.francesco.gymtracker.entity.Exercise;
import com.francesco.gymtracker.entity.Workout;
import com.francesco.gymtracker.entity.WorkoutExercise;
import com.francesco.gymtracker.entity.User;
import com.francesco.gymtracker.exception.BusinessException;
import com.francesco.gymtracker.exception.ResourceNotFoundException;
import com.francesco.gymtracker.mapper.WorkoutMapper;
import com.francesco.gymtracker.repository.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final ExerciseService exerciseService;
    private final WorkoutMapper workoutMapper;
    private final CurrentUserService currentUserService;

    @Transactional
    public WorkoutResponse create(WorkoutRequest request) {
        Workout workout = workoutMapper.toEntity(request);
        workout.setUser(currentUserService.getCurrentUser());
        return workoutMapper.toResponse(workoutRepository.save(workout));
    }

    @Transactional
    public WorkoutResponse update(Long id, WorkoutRequest request) {
        Workout workout = getWorkoutEntity(id);
        workoutMapper.updateEntity(workout, request);
        return workoutMapper.toResponse(workout);
    }

    @Transactional
    public void delete(Long id) {
        workoutRepository.delete(getWorkoutEntity(id));
    }

    @Transactional(readOnly = true)
    public List<WorkoutResponse> getAll() {
        User currentUser = currentUserService.getCurrentUser();
        return workoutRepository.findAllByUser(currentUser).stream()
                .map(workoutMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public WorkoutDetailResponse getDetail(Long id) {
        User currentUser = currentUserService.getCurrentUser();
        Workout workout = workoutRepository.findWithExercisesByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Workout not found with id " + id));
        return workoutMapper.toDetailResponse(workout);
    }

    @Transactional
    public WorkoutDetailResponse replaceExercises(Long workoutId, List<WorkoutExerciseRequest> requests) {
        validateUniqueOrders(requests);
        Workout workout = getWorkoutEntity(workoutId);
        workout.getExercises().clear();

        for (WorkoutExerciseRequest request : requests) {
            Exercise exercise = exerciseService.getExerciseEntity(request.exerciseId());
            WorkoutExercise workoutExercise = WorkoutExercise.builder()
                    .workout(workout)
                    .exercise(exercise)
                    .exerciseOrder(request.exerciseOrder())
                    .sets(request.sets())
                    .reps(request.reps())
                    .restSeconds(request.restSeconds())
                    .notes(request.notes())
                    .build();
            workout.getExercises().add(workoutExercise);
        }

        Workout savedWorkout = workoutRepository.save(workout);
        return workoutMapper.toDetailResponse(savedWorkout);
    }

    @Transactional(readOnly = true)
    public Workout getWorkoutEntity(Long id) {
        User currentUser = currentUserService.getCurrentUser();
        return workoutRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Workout not found with id " + id));
    }

    private void validateUniqueOrders(List<WorkoutExerciseRequest> requests) {
        Set<Integer> orders = new HashSet<>();
        for (WorkoutExerciseRequest request : requests) {
            if (!orders.add(request.exerciseOrder())) {
                throw new BusinessException("Duplicate exercise order " + request.exerciseOrder());
            }
        }
    }
}
