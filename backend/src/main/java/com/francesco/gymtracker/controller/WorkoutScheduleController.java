package com.francesco.gymtracker.controller;

import com.francesco.gymtracker.dto.request.WorkoutScheduleRequest;
import com.francesco.gymtracker.dto.response.WorkoutScheduleResponse;
import com.francesco.gymtracker.enums.WeekDay;
import com.francesco.gymtracker.mapper.WorkoutScheduleMapper;
import com.francesco.gymtracker.service.WorkoutScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
public class WorkoutScheduleController {

    private final WorkoutScheduleService scheduleService;
    private final WorkoutScheduleMapper scheduleMapper;

    @PutMapping
    public List<WorkoutScheduleResponse> assignWorkoutToDays(@Valid @RequestBody WorkoutScheduleRequest request) {
        return scheduleService.assignWorkoutToDays(request);
    }

    @GetMapping
    public List<WorkoutScheduleResponse> getWeeklySchedule() {
        return scheduleService.getWeeklySchedule();
    }

    @GetMapping("/{weekDay}")
    public WorkoutScheduleResponse getByWeekDay(@PathVariable WeekDay weekDay) {
        return scheduleService.getScheduleByDay(weekDay)
                .map(scheduleMapper::toResponse)
                .orElse(null);
    }

    @DeleteMapping("/{weekDay}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeDay(@PathVariable WeekDay weekDay) {
        scheduleService.removeDay(weekDay);
    }
}
