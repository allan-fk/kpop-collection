package com.kpopcollection.api.controller;

import com.kpopcollection.api.dto.LoginRequest;
import com.kpopcollection.api.entity.User;
import com.kpopcollection.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@SuppressWarnings("null")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> existing = userRepository.findByUsername(request.getUsername());

        if (existing.isPresent()) {
            User user = existing.get();
            if (user.getPassword().equals(request.getPassword())) {
                return ResponseEntity.ok(user);
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Mot de passe incorrect.");
        }

        // Utilisateur inexistant : on le crée
        User newUser = User.builder()
                .username(request.getUsername())
                .password(request.getPassword())
                .build();
        userRepository.save(newUser);
        return ResponseEntity.ok(newUser);
    }
}
