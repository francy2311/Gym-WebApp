package com.francesco.gymtracker.mapper;

import com.francesco.gymtracker.dto.response.WorkoutScheduleResponse;
import com.francesco.gymtracker.entity.WorkoutSchedule;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WorkoutScheduleMapper {

    private final WorkoutMapper workoutMapper;

    public WorkoutScheduleResponse toResponse(WorkoutSchedule schedule) {
        return new WorkoutScheduleResponse(
                schedule.getId(),
                schedule.getWeekDay(),
                workoutMapper.toResponse(schedule.getWorkout())
        );
    }
}
