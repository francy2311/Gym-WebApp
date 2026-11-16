package com.francesco.gymtracker.controller;

import com.francesco.gymtracker.dto.request.AdminUserUpdateRequest;
import com.francesco.gymtracker.dto.response.ProfileResponse;
import com.francesco.gymtracker.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AuthService authService;

    @GetMapping
    public List<ProfileResponse> getUsers() {
        return authService.getUsers();
    }

    @PutMapping("/{id}")
    public ProfileResponse updateUser(@PathVariable Long id, @Valid @RequestBody AdminUserUpdateRequest request) {
        return authService.updateManagedUser(id, request);
    }
}
