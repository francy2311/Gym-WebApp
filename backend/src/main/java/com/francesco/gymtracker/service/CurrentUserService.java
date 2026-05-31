package com.francesco.gymtracker.service;

import com.francesco.gymtracker.entity.User;
import com.francesco.gymtracker.exception.BusinessException;
import com.francesco.gymtracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public User getCurrentUser() {
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
