package br.unesp.brecho.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.unesp.brecho.backend.model.AuthenticationDTO;
import br.unesp.brecho.backend.model.LoginResponseDTO;
import br.unesp.brecho.backend.model.Person;
import br.unesp.brecho.backend.model.RegisterDTO;
import br.unesp.brecho.backend.model.Telefone;
import br.unesp.brecho.backend.model.Usuario;
import br.unesp.brecho.backend.repository.UsuarioRepository;
import jakarta.validation.Valid;

@RestController
@RequestMapping("auth")
@CrossOrigin
public class AuthenticationController {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private br.unesp.brecho.backend.security.TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity login(@RequestBody @Valid AuthenticationDTO data) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.senha());
        try {
            var auth = this.authenticationManager.authenticate(usernamePassword);
            var token = tokenService.generateToken((Usuario) auth.getPrincipal());
            return ResponseEntity.ok(new LoginResponseDTO(token));
        } catch (Exception e) {
            System.out.println("Erro: ");
            System.out.println(e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/register")
    public ResponseEntity register(@RequestBody @Valid RegisterDTO data) {
        if (this.usuarioRepository.findByEmail(data.email()) != null)
            return ResponseEntity.badRequest().build();

        String encryptedPassword = new BCryptPasswordEncoder().encode(data.senha());

        Person newUser = new Person(data.email(), encryptedPassword, data.role(), data.nome(), data.cpf());

        if (data.telefone() != null && !data.telefone().isBlank()) {
            Telefone tel = new Telefone();
            tel.setNumero(data.telefone());
            tel.setUsuario(newUser);
            newUser.getTelefones().add(tel);
        }

        this.usuarioRepository.save(newUser);

        return ResponseEntity.ok().build();
    }
}