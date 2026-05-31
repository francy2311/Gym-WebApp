package com.francesco.gymtracker.dto.response;

public record AuthResponse(
        String tokenType,
        String accessToken,
        Long expiresInSeconds,
        Long userId,
        String username,
        String email
) {
}
