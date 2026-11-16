package com.francesco.gymtracker.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminPasswordResetRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 72) String newPassword
) {
}
