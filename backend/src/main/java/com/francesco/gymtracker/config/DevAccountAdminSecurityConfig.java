package com.francesco.gymtracker.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.security.web.util.matcher.IpAddressMatcher;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Configuration
@Profile("dev & !prod")
public class DevAccountAdminSecurityConfig {

    @Bean
    @Order(1)
    SecurityFilterChain accountAdminSecurity(
            HttpSecurity http,
            @Value("${app.account-admin.key:}") String adminKey,
            @Value("${app.account-admin.require-loopback:true}") boolean requireLoopback
    ) throws Exception {
        byte[] expected = adminKey.getBytes(StandardCharsets.UTF_8);
        IpAddressMatcher ipv4Loopback = new IpAddressMatcher("127.0.0.0/8");
        IpAddressMatcher ipv6Loopback = new IpAddressMatcher("::1");
        AuthorizationManager<RequestAuthorizationContext> access = (authentication, context) -> {
            var request = context.getRequest();
            String key = request.getHeader("X-Admin-Key");
            boolean allowedAddress = !requireLoopback || ipv4Loopback.matches(request) || ipv6Loopback.matches(request);
            return new AuthorizationDecision(allowedAddress && expected.length >= 32 && key != null
                    && MessageDigest.isEqual(expected, key.getBytes(StandardCharsets.UTF_8)));
        };

        return http.securityMatcher("/api/admin/accounts/**")
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/api/admin/accounts/emails").access(access)
                        .requestMatchers(HttpMethod.POST, "/api/admin/accounts/password-reset").access(access)
                        .requestMatchers(HttpMethod.POST, "/api/admin/accounts/administrators").access(access)
                        .requestMatchers(HttpMethod.PUT, "/api/admin/accounts/administrators/promote").access(access)
                        .anyRequest().denyAll())
                .build();
    }
}
