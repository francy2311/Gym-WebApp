package com.francesco.gymtracker.service;

import com.francesco.gymtracker.dto.request.AdminPasswordResetRequest;
import com.francesco.gymtracker.dto.request.RegisterRequest;
import com.francesco.gymtracker.dto.response.ProfileResponse;
import com.francesco.gymtracker.entity.User;
import com.francesco.gymtracker.exception.BusinessException;
import com.francesco.gymtracker.exception.ResourceNotFoundException;
import com.francesco.gymtracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
@Profile("dev & !prod")
@RequiredArgsConstructor
public class AccountAdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;

    @Transactional
    public ProfileResponse createAdministrator(RegisterRequest request) {
        return ProfileResponse.from(authService.createAccount(request, true));
    }

    @Transactional
    public ProfileResponse promoteAdministrator(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        if (!user.isEnabled()) {
            throw new BusinessException("Account is disabled");
        }
        user.setAdmin(true);
        return ProfileResponse.from(user);
    }

    @Transactional(readOnly = true)
    public List<String> getEmails() {
        return userRepository.findAllEmails();
    }

    @Transactional
    public void resetPassword(AdminPasswordResetRequest request) {
        if (request.newPassword().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new BusinessException("Password must be at most 72 UTF-8 bytes");
        }
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        user.setPassword(passwordEncoder.encode(request.newPassword()));
    }
}
