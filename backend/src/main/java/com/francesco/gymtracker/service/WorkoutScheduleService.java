package com.francesco.gymtracker.service;

import com.francesco.gymtracker.dto.request.WorkoutScheduleRequest;
import com.francesco.gymtracker.dto.response.WorkoutScheduleResponse;
import com.francesco.gymtracker.entity.User;
import com.francesco.gymtracker.entity.Workout;
import com.francesco.gymtracker.entity.WorkoutSchedule;
import com.francesco.gymtracker.enums.WeekDay;
import com.francesco.gymtracker.mapper.WorkoutScheduleMapper;
import com.francesco.gymtracker.repository.WorkoutScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WorkoutScheduleService {

    private final WorkoutScheduleRepository scheduleRepository;
    private final WorkoutService workoutService;
    private final WorkoutScheduleMapper scheduleMapper;
    private final CurrentUserService currentUserService;

    @Transactional
    public List<WorkoutScheduleResponse> assignWorkoutToDays(WorkoutScheduleRequest request) {
        User currentUser = currentUserService.getCurrentUser();
        Workout workout = workoutService.getWorkoutEntity(request.workoutId());
        scheduleRepository.deleteByWeekDayInAndUser(request.weekDays(), currentUser);

        List<WorkoutSchedule> schedules = request.weekDays().stream()
                .map(day -> WorkoutSchedule.builder()
                        .weekDay(day)
                        .user(currentUser)
                        .workout(workout)
                        .build())
                .toList();

        return scheduleRepository.saveAll(schedules).stream()
                .sorted(Comparator.comparing(schedule -> schedule.getWeekDay().ordinal()))
                .map(scheduleMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<WorkoutScheduleResponse> getWeeklySchedule() {
        User currentUser = currentUserService.getCurrentUser();
        return scheduleRepository.findAllByUser(currentUser).stream()
                .sorted(Comparator.comparing(schedule -> schedule.getWeekDay().ordinal()))
                .map(scheduleMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<WorkoutSchedule> getScheduleByDay(WeekDay weekDay) {
        User currentUser = currentUserService.getCurrentUser();
        return scheduleRepository.findByWeekDayAndUser(weekDay, currentUser);
    }
}
