package com.francesco.gymtracker.controller;

import com.francesco.gymtracker.dto.request.AdminPasswordResetRequest;
import com.francesco.gymtracker.dto.request.AdminPromotionRequest;
import com.francesco.gymtracker.dto.request.RegisterRequest;
import com.francesco.gymtracker.dto.response.ProfileResponse;
import com.francesco.gymtracker.service.AccountAdminService;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Profile("dev & !prod")
@RequestMapping("/api/admin/accounts")
@SecurityScheme(name = "accountAdminKey", type = SecuritySchemeType.APIKEY,
        in = SecuritySchemeIn.HEADER, paramName = "X-Admin-Key")
@SecurityRequirement(name = "accountAdminKey")
@RequiredArgsConstructor
public class AccountAdminController {

    private final AccountAdminService accountAdminService;

    @PostMapping("/administrators")
    @ResponseStatus(HttpStatus.CREATED)
    public ProfileResponse createAdministrator(@Valid @RequestBody RegisterRequest request) {
        return accountAdminService.createAdministrator(request);
    }

    @PutMapping("/administrators/promote")
    public ProfileResponse promoteAdministrator(@Valid @RequestBody AdminPromotionRequest request) {
        return accountAdminService.promoteAdministrator(request.email());
    }

    @GetMapping("/emails")
    public List<String> getEmails() {
        return accountAdminService.getEmails();
    }

    @PostMapping("/password-reset")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(@Valid @RequestBody AdminPasswordResetRequest request) {
        accountAdminService.resetPassword(request);
    }
}
