package com.francesco.gymtracker.service;

import com.francesco.gymtracker.dto.request.LoginRequest;
import com.francesco.gymtracker.dto.request.AdminUserUpdateRequest;
import com.francesco.gymtracker.dto.request.ProfileUpdateRequest;
import com.francesco.gymtracker.dto.request.RegisterRequest;
import com.francesco.gymtracker.dto.response.AuthResponse;
import com.francesco.gymtracker.dto.response.ProfileResponse;
import com.francesco.gymtracker.entity.User;
import com.francesco.gymtracker.exception.BusinessException;
import com.francesco.gymtracker.exception.ResourceNotFoundException;
import com.francesco.gymtracker.repository.UserRepository;
import com.francesco.gymtracker.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final CurrentUserService currentUserService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        User savedUser = createAccount(request, false);
        return buildAuthResponse(savedUser, userDetailsService.loadUserByUsername(savedUser.getUsername()));
    }

    @Transactional
    public User createAccount(RegisterRequest request, boolean admin) {
        validateIdentity(null, request.username(), request.email());
        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(encodePassword(request.password()))
                .enabled(true)
                .admin(admin)
                .build();
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String identifier = request.usernameOrEmail().strip();
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                identifier,
                request.password()
        ));

        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new BusinessException("Invalid credentials"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        return buildAuthResponse(user, userDetails);
    }

    @Transactional
    public AuthResponse updateProfile(ProfileUpdateRequest request) {
        User user = currentUserService.getActor();
        if (request.currentPassword().getBytes(StandardCharsets.UTF_8).length > 72
                || !passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BusinessException("Current password is incorrect");
        }
        updateIdentity(user, request.username(), request.email(), request.newPassword());
        return buildAuthResponse(user, userDetailsService.loadUserByUsername(user.getUsername()));
    }

    @Transactional(readOnly = true)
    public List<ProfileResponse> getUsers() {
        return userRepository.findAll(Sort.by("username")).stream().map(ProfileResponse::from).toList();
    }

    @Transactional
    public ProfileResponse updateManagedUser(Long id, AdminUserUpdateRequest request) {
        if (id.equals(currentUserService.getActor().getId())) {
            throw new BusinessException("Use the profile page to update your own administrator account");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        updateIdentity(user, request.username(), request.email(), request.newPassword());
        user.setEnabled(request.enabled());
        return ProfileResponse.from(user);
    }

    private void updateIdentity(User user, String username, String email, String newPassword) {
        validateIdentity(user, username, email);
        user.setUsername(username);
        user.setEmail(email);
        if (newPassword != null) {
            user.setPassword(encodePassword(newPassword));
        }
    }

    private void validateIdentity(User user, String username, String email) {
        if (user == null || !username.equals(user.getUsername())) {
            if (username.contains("@") || !username.equals(username.strip())) {
                throw new BusinessException("Username must not contain @ or surrounding spaces");
            }
            if (userRepository.existsByUsername(username)) {
                throw new BusinessException("Username already exists");
            }
        }
        if ((user == null || !email.equals(user.getEmail()))
                && (userRepository.existsByEmail(email) || userRepository.existsByUsername(email))) {
            throw new BusinessException("Email already exists");
        }
    }

    private String encodePassword(String password) {
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new BusinessException("Password must be at most 72 UTF-8 bytes");
        }
        return passwordEncoder.encode(password);
    }

    private AuthResponse buildAuthResponse(User user, UserDetails userDetails) {
        return new AuthResponse(
                "Bearer",
                jwtService.generateToken(userDetails),
                jwtService.getExpirationSeconds(),
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );
    }
}
