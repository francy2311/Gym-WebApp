package com.francesco.gymtracker.service;

import com.francesco.gymtracker.dto.request.ExerciseRequest;
import com.francesco.gymtracker.dto.response.ExerciseResponse;
import com.francesco.gymtracker.entity.Exercise;
import com.francesco.gymtracker.entity.User;
import com.francesco.gymtracker.enums.MuscleGroup;
import com.francesco.gymtracker.exception.ResourceNotFoundException;
import com.francesco.gymtracker.mapper.ExerciseMapper;
import com.francesco.gymtracker.repository.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final ExerciseMapper exerciseMapper;
    private final CurrentUserService currentUserService;

    @Transactional
    public ExerciseResponse create(ExerciseRequest request) {
        Exercise exercise = exerciseMapper.toEntity(request);
        exercise.setUser(currentUserService.getCurrentUser());
        return exerciseMapper.toResponse(exerciseRepository.save(exercise));
    }

    @Transactional
    public List<ExerciseResponse> createBulk(List<ExerciseRequest> requests) {
        User currentUser = currentUserService.getCurrentUser();
        List<Exercise> exercises = requests.stream()
                .map(exerciseMapper::toEntity)
                .peek(exercise -> exercise.setUser(currentUser))
                .toList();

        return exerciseRepository.saveAll(exercises).stream()
                .map(exerciseMapper::toResponse)
                .toList();
    }

    @Transactional
    public ExerciseResponse update(Long id, ExerciseRequest request) {
        Exercise exercise = getExerciseEntity(id);
        exerciseMapper.updateEntity(exercise, request);
        return exerciseMapper.toResponse(exercise);
    }

    @Transactional
    public void delete(Long id) {
        exerciseRepository.delete(getExerciseEntity(id));
    }

    @Transactional(readOnly = true)
    public ExerciseResponse getById(Long id) {
        return exerciseMapper.toResponse(getExerciseEntity(id));
    }

    @Transactional(readOnly = true)
    public List<ExerciseResponse> getAll(MuscleGroup muscleGroup) {
        User currentUser = currentUserService.getCurrentUser();
        List<Exercise> exercises = muscleGroup == null
                ? exerciseRepository.findAllByUser(currentUser)
                : exerciseRepository.findByMuscleGroupAndUser(muscleGroup, currentUser);
        return exercises.stream().map(exerciseMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ExerciseResponse> searchByName(String name) {
        User currentUser = currentUserService.getCurrentUser();
        return exerciseRepository.findByNameContainingIgnoreCaseAndUser(name, currentUser).stream()
                .map(exerciseMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Exercise getExerciseEntity(Long id) {
        User currentUser = currentUserService.getCurrentUser();
        return exerciseRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found with id " + id));
    }
}
