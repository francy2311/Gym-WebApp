package com.francesco.gymtracker;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class WorkoutPrivacyIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void workoutsAndScheduleAreScopedToAuthenticatedUser() throws Exception {
        String aliceToken = registerUser("alice", "alice@example.com");
        String bobToken = registerUser("bob", "bob@example.com");

        long workoutId = createWorkout(aliceToken, """
                {
                  "name": "Push Day",
                  "description": "Chest and shoulders",
                  "goal": "STRENGTH"
                }
                """);

        mockMvc.perform(get("/api/workouts")
                        .header("Authorization", bearer(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(workoutId))
                .andExpect(jsonPath("$[0].name").value("Push Day"));

        mockMvc.perform(get("/api/workouts")
                        .header("Authorization", bearer(bobToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        mockMvc.perform(get("/api/workouts/{id}", workoutId)
                        .header("Authorization", bearer(bobToken)))
                .andExpect(status().isNotFound());

        mockMvc.perform(put("/api/schedule")
                        .header("Authorization", bearer(aliceToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "workoutId": %d,
                                  "weekDays": ["MONDAY"]
                                }
                                """.formatted(workoutId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].weekDay").value("MONDAY"))
                .andExpect(jsonPath("$[0].workout.id").value(workoutId));

        mockMvc.perform(get("/api/schedule")
                        .header("Authorization", bearer(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].weekDay").value("MONDAY"))
                .andExpect(jsonPath("$[0].workout.id").value(workoutId));

        mockMvc.perform(get("/api/schedule")
                        .header("Authorization", bearer(bobToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        mockMvc.perform(put("/api/schedule")
                        .header("Authorization", bearer(bobToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "workoutId": %d,
                                  "weekDays": ["TUESDAY"]
                                }
                                """.formatted(workoutId)))
                .andExpect(status().isNotFound());
    }

    @Test
    void exercisesAreScopedToAuthenticatedUser() throws Exception {
        String aliceToken = registerUser("alice-ex", "alice-ex@example.com");
        String bobToken = registerUser("bob-ex", "bob-ex@example.com");

        long exerciseId = createExercise(aliceToken, """
                {
                  "name": "Incline Press",
                  "description": "Upper chest press",
                  "muscleGroup": "CHEST",
                  "equipment": "DUMBBELL",
                  "imageUrl": null,
                  "notes": "Controlled tempo"
                }
                """);

        mockMvc.perform(get("/api/exercises")
                        .header("Authorization", bearer(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(exerciseId))
                .andExpect(jsonPath("$[0].name").value("Incline Press"));

        mockMvc.perform(get("/api/exercises")
                        .header("Authorization", bearer(bobToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        mockMvc.perform(get("/api/exercises/{id}", exerciseId)
                        .header("Authorization", bearer(bobToken)))
                .andExpect(status().isNotFound());

        mockMvc.perform(put("/api/exercises/{id}", exerciseId)
                        .header("Authorization", bearer(bobToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Hijacked Exercise",
                                  "description": "Should not be allowed",
                                  "muscleGroup": "BACK",
                                  "equipment": "BARBELL",
                                  "imageUrl": null,
                                  "notes": null
                                }
                                """))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/exercises/{id}", exerciseId)
                        .header("Authorization", bearer(bobToken)))
                .andExpect(status().isNotFound());
    }

    private String registerUser(String username, String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "%s",
                                  "email": "%s",
                                  "password": "password123"
                                }
                                """.formatted(username, email)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        String accessToken = json.get("accessToken").asText();
        assertThat(accessToken).isNotBlank();
        return accessToken;
    }

    private long createWorkout(String token, String requestBody) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/workouts")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("id").asLong();
    }

    private long createExercise(String token, String requestBody) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/exercises")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("id").asLong();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
