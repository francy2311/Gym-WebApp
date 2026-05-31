package com.francesco.gymtracker.dto.request;

import com.francesco.gymtracker.enums.WeekDay;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record WorkoutScheduleRequest(
        @NotNull Long workoutId,
        @NotEmpty List<@NotNull WeekDay> weekDays
) {
}
