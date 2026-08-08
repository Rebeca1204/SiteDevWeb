package br.unesp.brecho.backend.security;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfigurations {

    @Autowired
    private SecurityFilter securityFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(authorize -> authorize

                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/register").permitAll()

                        // Rotas de itens — qualquer usuário autenticado
                        .requestMatchers(HttpMethod.GET, "/itens").authenticated()
                        .requestMatchers(HttpMethod.GET, "/itens/meus").authenticated()
                        .requestMatchers(HttpMethod.GET, "/itens/fila").authenticated()
                        .requestMatchers(HttpMethod.GET, "/itens/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/itens").authenticated()
                        .requestMatchers(HttpMethod.POST, "/itens/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/itens/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/itens/**").hasRole("ADMIN")

                        // Rotas de pedidos — qualquer usuário autenticado
                        .requestMatchers(HttpMethod.GET, "/pedidos/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/pedidos/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/pedidos/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/pedidos/**").authenticated()

                        // Imagens — GET público, upload/delete autenticado
                        .requestMatchers(HttpMethod.GET, "/imagens/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/imagens/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/imagens/**").authenticated()

                        // Usuários
                        .requestMatchers(HttpMethod.GET, "/usuario/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/usuario/me").authenticated()

                        // Avaliações
                        .requestMatchers(HttpMethod.GET, "/avaliacoes/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/avaliacoes/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/avaliacoes/**").authenticated()

                        .anyRequest().hasRole("ADMIN")
                )
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration
    ) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}