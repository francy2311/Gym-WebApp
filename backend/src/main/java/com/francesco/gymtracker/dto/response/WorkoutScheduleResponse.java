package com.francesco.gymtracker.dto.response;

import com.francesco.gymtracker.enums.WeekDay;

public record WorkoutScheduleResponse(
        Long id,
        WeekDay weekDay,
        WorkoutResponse workout
) {
}
