package com.francesco.gymtracker.enums;

import java.time.DayOfWeek;

public enum WeekDay {
    MONDAY,
    TUESDAY,
    WEDNESDAY,
    THURSDAY,
    FRIDAY,
    SATURDAY,
    SUNDAY;

    public static WeekDay from(DayOfWeek dayOfWeek) {
        return WeekDay.valueOf(dayOfWeek.name());
    }
}
