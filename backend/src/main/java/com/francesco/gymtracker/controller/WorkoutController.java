package com.francesco.gymtracker.controller;

import com.francesco.gymtracker.dto.request.WorkoutExerciseRequest;
import com.francesco.gymtracker.dto.request.WorkoutRequest;
import com.francesco.gymtracker.dto.response.WorkoutDetailResponse;
import com.francesco.gymtracker.dto.response.WorkoutResponse;
import com.francesco.gymtracker.service.WorkoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/workouts")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkoutResponse create(@Valid @RequestBody WorkoutRequest request) {
        return workoutService.create(request);
    }

    @GetMapping
    public List<WorkoutResponse> getAll() {
        return workoutService.getAll();
    }

    @GetMapping("/{id}")
    public WorkoutDetailResponse getDetail(@PathVariable Long id) {
        return workoutService.getDetail(id);
    }

    @PutMapping("/{id}")
    public WorkoutResponse update(@PathVariable Long id, @Valid @RequestBody WorkoutRequest request) {
        return workoutService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        workoutService.delete(id);
    }

    @PutMapping("/{id}/exercises")
    public WorkoutDetailResponse replaceExercises(
            @PathVariable Long id,
            @Valid @RequestBody List<@Valid WorkoutExerciseRequest> requests
    ) {
        return workoutService.replaceExercises(id, requests);
    }
}
