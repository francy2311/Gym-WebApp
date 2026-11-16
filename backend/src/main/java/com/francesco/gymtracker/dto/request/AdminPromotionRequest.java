package com.francesco.gymtracker.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AdminPromotionRequest(@NotBlank @Email String email) {
}
