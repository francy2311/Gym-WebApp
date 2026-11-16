package com.francesco.gymtracker.service;

import com.francesco.gymtracker.entity.User;
import com.francesco.gymtracker.exception.BusinessException;
import com.francesco.gymtracker.exception.ResourceNotFoundException;
import com.francesco.gymtracker.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;
    private final HttpServletRequest request;

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        User actor = getActor();
        String managedUser = request.getHeader("X-Managed-User");
        if (managedUser == null) {
            return actor;
        }
        if (!actor.isAdmin()) {
            throw new AccessDeniedException("Administrator role required");
        }
        try {
            return userRepository.findById(Long.valueOf(managedUser))
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        } catch (NumberFormatException ex) {
            throw new BusinessException("Invalid managed user");
        }
    }

    @Transactional(readOnly = true)
    public User getActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new BusinessException("Authentication required");
        }

        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new BusinessException("Authenticated user not found"));
    }
}
