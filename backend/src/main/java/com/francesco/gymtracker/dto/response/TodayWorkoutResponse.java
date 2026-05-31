package com.francesco.gymtracker.dto.response;

import com.francesco.gymtracker.enums.WeekDay;

public record TodayWorkoutResponse(
        WeekDay weekDay,
        boolean workoutAvailable,
        WorkoutDetailResponse workout,
        String message
) {
}
