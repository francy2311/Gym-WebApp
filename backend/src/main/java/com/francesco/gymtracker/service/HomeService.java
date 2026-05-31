package com.francesco.gymtracker.service;

import com.francesco.gymtracker.dto.response.TodayWorkoutResponse;
import com.francesco.gymtracker.entity.WorkoutSchedule;
import com.francesco.gymtracker.enums.WeekDay;
import com.francesco.gymtracker.mapper.WorkoutMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class HomeService {

    private final WorkoutScheduleService scheduleService;
    private final WorkoutMapper workoutMapper;

    @Transactional(readOnly = true)
    public TodayWorkoutResponse getTodayWorkout() {
        return getWorkoutByDay(WeekDay.from(LocalDate.now().getDayOfWeek()));
    }

    @Transactional(readOnly = true)
    public TodayWorkoutResponse getWorkoutByDay(WeekDay weekDay) {
        return scheduleService.getScheduleByDay(weekDay)
                .map(schedule -> buildAvailableResponse(weekDay, schedule))
                .orElseGet(() -> new TodayWorkoutResponse(
                        weekDay,
                        false,
                        null,
                        "Nessun allenamento previsto per questo giorno"
                ));
    }

    private TodayWorkoutResponse buildAvailableResponse(WeekDay weekDay, WorkoutSchedule schedule) {
        return new TodayWorkoutResponse(
                weekDay,
                true,
                workoutMapper.toDetailResponse(schedule.getWorkout()),
                "Allenamento previsto trovato"
        );
    }
}
