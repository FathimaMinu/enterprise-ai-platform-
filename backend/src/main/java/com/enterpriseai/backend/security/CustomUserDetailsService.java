package com.enterpriseai.backend.security;

import com.enterpriseai.backend.entity.User;
import com.enterpriseai.backend.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Loads a user from the database by email for Spring Security authentication.
 * Prefixes the role with "ROLE_" as required by Spring Security's hasRole() checks.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found with email: " + email
                ));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.isActive(),   // enabled
                true,              // accountNonExpired
                true,              // credentialsNonExpired
                true,              // accountNonLocked
                Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + user.getRole())
                )
        );
    }
}
