package com.francesco.gymtracker.dto.response;

import com.francesco.gymtracker.entity.User;

public record ProfileResponse(Long id, String username, String email, boolean admin, boolean enabled) {

    public static ProfileResponse from(User user) {
        return new ProfileResponse(user.getId(), user.getUsername(), user.getEmail(), user.isAdmin(), user.isEnabled());
    }
}
