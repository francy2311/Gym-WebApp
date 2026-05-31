package com.francesco.gymtracker.controller;

import com.francesco.gymtracker.dto.request.ExerciseRequest;
import com.francesco.gymtracker.dto.response.ExerciseResponse;
import com.francesco.gymtracker.enums.MuscleGroup;
import com.francesco.gymtracker.service.ExerciseService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseService exerciseService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExerciseResponse create(@Valid @RequestBody ExerciseRequest request) {
        return exerciseService.create(request);
    }

    @PostMapping("/bulk")
    @ResponseStatus(HttpStatus.CREATED)
    public List<ExerciseResponse> createBulk(@Valid @NotEmpty @RequestBody List<@Valid ExerciseRequest> requests) {
        return exerciseService.createBulk(requests);
    }

    @GetMapping
    public List<ExerciseResponse> getAll(@RequestParam(required = false) MuscleGroup muscleGroup) {
        return exerciseService.getAll(muscleGroup);
    }

    @GetMapping("/{id}")
    public ExerciseResponse getById(@PathVariable Long id) {
        return exerciseService.getById(id);
    }

    @GetMapping("/search")
    public List<ExerciseResponse> searchByName(@RequestParam String name) {
        return exerciseService.searchByName(name);
    }

    @PutMapping("/{id}")
    public ExerciseResponse update(@PathVariable Long id, @Valid @RequestBody ExerciseRequest request) {
        return exerciseService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        exerciseService.delete(id);
    }
}
