package com.francesco.gymtracker.controller;

import com.francesco.gymtracker.dto.response.TodayWorkoutResponse;
import com.francesco.gymtracker.enums.WeekDay;
import com.francesco.gymtracker.service.HomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class HomeController {

    private final HomeService homeService;

    @GetMapping("/today")
    public TodayWorkoutResponse getTodayWorkout() {
        return homeService.getTodayWorkout();
    }

    @GetMapping("/day/{weekDay}")
    public TodayWorkoutResponse getWorkoutByDay(@PathVariable WeekDay weekDay) {
        return homeService.getWorkoutByDay(weekDay);
    }
}
