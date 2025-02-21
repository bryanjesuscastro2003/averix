package com.service.auth.controller;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.data.redis.RedisProperties.Lettuce.Cluster.Refresh;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import com.service.auth.data.LoginDto;
import com.service.auth.data.LogupDto;
import com.service.auth.data.RefreshTokenDto;
import com.service.auth.data.UserEntity;
import com.service.auth.data.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
public class AuthController {
    @Autowired
    private JwtEncoder jwtEncoder;

    @Autowired
    private JwtDecoder jwtDecoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/logup")
    public ResponseEntity<Map<String, String>> logup(@RequestBody LogupDto logupDto) {

        try {
            var user = userRepository.findByUsername(logupDto.getUsername());
            if (user != null) {
                return ResponseEntity.badRequest().body(Map.of("message", "User already exists"));
            }
            UserEntity newUser = UserEntity.builder()
                    .username(logupDto.getUsername())
                    .password(passwordEncoder.encode(logupDto.getPassword()))
                    .age(logupDto.getAge())
                    .role(logupDto.getRole())
                    .active(true).build();
            userRepository.save(newUser);
            return ResponseEntity.ok(Map.of("message", "User created"));
        } catch (Exception e) {
            System.out.println(e);
            return ResponseEntity.badRequest().body(Map.of("message", "Error creating user"));

        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginDto loginDto) {
        String subject = null;
        String scope = null;
        try {
            var user = userRepository.findByUsername(loginDto.getUsername());
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
            }
            if (!passwordEncoder.matches(loginDto.getPassword(), user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid password"));
            }
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDto.getUsername(), loginDto.getPassword()));
            subject = authentication.getName();
            scope = authentication.getAuthorities()
                    .stream().map(aut -> aut.getAuthority())
                    .collect(Collectors.joining(" "));
            Map<String, String> idToken = new HashMap<>();
            Instant instant = Instant.now();
            JwtClaimsSet jwtClaimsSet = JwtClaimsSet.builder()
                    .subject(subject)
                    .issuedAt(instant)
                    .expiresAt(instant.plus(false ? 1 : 5, ChronoUnit.MINUTES))
                    .issuer("security-service")
                    .claim("scope", scope)
                    .build();
            String jwtAccessToken = jwtEncoder.encode(JwtEncoderParameters.from(jwtClaimsSet)).getTokenValue();
            idToken.put("accessToken", jwtAccessToken);
            return new ResponseEntity<>(idToken, HttpStatus.OK);

        } catch (Exception e) {
            // TODO: handle exception
            System.out.println(e);
            return ResponseEntity.badRequest().body(Map.of("message", "Error logging in"));
        }

    }

    @PostMapping("/refreshToken")
    public ResponseEntity<Map<String, String>> refreshToken(@RequestBody RefreshTokenDto refreshTokenDto) {
        return null;
    }
    
}