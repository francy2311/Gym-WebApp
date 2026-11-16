package com.francesco.gymtracker;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:account-admin-test;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "app.account-admin.key=" + AccountAdminIntegrationTest.ADMIN_KEY
})
@ActiveProfiles("dev")
@AutoConfigureMockMvc
class AccountAdminIntegrationTest {

    static final String ADMIN_KEY = "local-integration-test-key-only-12345";
    private static final String EMAILS_PATH = "/api/admin/accounts/emails";
    private static final String RESET_PATH = "/api/admin/accounts/password-reset";

    @Autowired
    private MockMvc mockMvc;

    @Test
    void adminCanRecoverAnAccountAndRevokeItsOldSession() throws Exception {
        String registration = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "recovery-user",
                                  "email": "recover@example.com",
                                  "password": "original-password"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String bearer = "Bearer " + new ObjectMapper().readTree(registration).get("accessToken").asText();

        mockMvc.perform(get(EMAILS_PATH).header("Authorization", bearer))
                .andExpect(status().isForbidden());
        mockMvc.perform(get(EMAILS_PATH).header("X-Admin-Key", ADMIN_KEY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@ == 'recover@example.com')]").isNotEmpty());

        String newPassword = """
                {"email":"recover@example.com","newPassword":"replacement-password"}
                """;
        mockMvc.perform(post(RESET_PATH).header("X-Admin-Key", "wrong-key")
                        .contentType(MediaType.APPLICATION_JSON).content(newPassword))
                .andExpect(status().isForbidden());
        mockMvc.perform(post(RESET_PATH).header("X-Admin-Key", ADMIN_KEY)
                        .contentType(MediaType.APPLICATION_JSON).content(newPassword))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/exercises").header("Authorization", bearer))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"usernameOrEmail":"recover@example.com","password":"original-password"}
                                """))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"usernameOrEmail":"recover@example.com","password":"replacement-password"}
                                """))
                .andExpect(status().isOk());
    }

    @Test
    void profileChangesAndAdministratorPermissions() throws Exception {
        String registration = """
                {"username":"profile-user","email":"profile@example.com","password":"initial-password","admin":true}
                """;
        String userToken = bearer(mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(registration))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());

        mockMvc.perform(get("/api/profile").header("Authorization", userToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.admin").value(false));
        mockMvc.perform(get("/api/admin/users").header("Authorization", userToken))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/workouts").header("Authorization", userToken).header("X-Managed-User", "1"))
                .andExpect(status().isForbidden());

        String profile = """
                {"username":"updated-user","email":"updated@example.com","currentPassword":"initial-password","newPassword":"updated-password"}
                """;
        String updatedToken = bearer(mockMvc.perform(put("/api/profile")
                        .header("Authorization", userToken).contentType(MediaType.APPLICATION_JSON).content(profile))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        String updatedProfile = mockMvc.perform(get("/api/profile").header("Authorization", updatedToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.email").value("updated@example.com"))
                .andReturn().getResponse().getContentAsString();
        long userId = new ObjectMapper().readTree(updatedProfile).get("id").asLong();
        mockMvc.perform(get("/api/profile").header("Authorization", userToken))
                .andExpect(status().isUnauthorized());
        login("updated-user", "updated-password");
        login("updated@example.com", "updated-password");

        String admin = """
                {"username":"gym-admin","email":"gym-admin@example.com","password":"administrator-password"}
                """;
        String bootstrap = "/api/admin/accounts/administrators";
        mockMvc.perform(post(bootstrap).header("Authorization", updatedToken)
                        .contentType(MediaType.APPLICATION_JSON).content(admin))
                .andExpect(status().isForbidden());
        mockMvc.perform(post(bootstrap).header("X-Admin-Key", ADMIN_KEY)
                        .contentType(MediaType.APPLICATION_JSON).content(admin))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.admin").value(true));
        String adminToken = login("gym-admin", "administrator-password");
        mockMvc.perform(get("/api/admin/users").header("Authorization", adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/workouts").header("Authorization", adminToken).header("X-Managed-User", userId)
                        .contentType(MediaType.APPLICATION_JSON).content("""
                                {"name":"Allenamento assegnato","goal":"STRENGTH"}
                                """))
                .andExpect(status().isCreated());
        mockMvc.perform(get("/api/workouts").header("Authorization", updatedToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].name").value("Allenamento assegnato"));
        mockMvc.perform(get("/api/workouts").header("Authorization", adminToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$").isEmpty());

        String promote = "/api/admin/accounts/administrators/promote";
        String target = """
                {"email":"updated@example.com"}
                """;
        mockMvc.perform(put(promote).header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(target))
                .andExpect(status().isForbidden());
        mockMvc.perform(put(promote).header("X-Admin-Key", ADMIN_KEY)
                        .contentType(MediaType.APPLICATION_JSON).content(target))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(userId))
                .andExpect(jsonPath("$.admin").value(true));
        mockMvc.perform(get("/api/admin/users").header("Authorization", updatedToken))
                .andExpect(status().isUnauthorized());
        String promotedToken = login("updated@example.com", "updated-password");
        mockMvc.perform(get("/api/admin/users").header("Authorization", promotedToken))
                .andExpect(status().isOk());
    }

    private String login(String identifier, String password) throws Exception {
        return bearer(mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"usernameOrEmail":"%s","password":"%s"}
                                """.formatted(identifier, password)))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
    }

    private String bearer(String response) throws Exception {
        return "Bearer " + new ObjectMapper().readTree(response).get("accessToken").asText();
    }
}
