package com.francesco.gymtracker.controller;

import com.francesco.gymtracker.dto.request.ProfileUpdateRequest;
import com.francesco.gymtracker.dto.response.AuthResponse;
import com.francesco.gymtracker.dto.response.ProfileResponse;
import com.francesco.gymtracker.service.AuthService;
import com.francesco.gymtracker.service.CurrentUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final CurrentUserService currentUserService;
    private final AuthService authService;

    @GetMapping
    public ProfileResponse getProfile() {
        return ProfileResponse.from(currentUserService.getActor());
    }

    @PutMapping
    public AuthResponse updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        return authService.updateProfile(request);
    }
}
