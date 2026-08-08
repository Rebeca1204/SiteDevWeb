package br.unesp.brecho.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import br.unesp.brecho.backend.model.Usuario;
import br.unesp.brecho.backend.repository.UsuarioRepository;
import br.unesp.brecho.backend.security.TokenService;

@RestController
@RequestMapping(value = "/usuario")
@CrossOrigin
public class UsuarioController {

    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private TokenService tokenService;
    @Autowired private PasswordEncoder passwordEncoder;

    @GetMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<Usuario> getUser(@PathVariable Long id) {
        return usuarioRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/", produces = "application/json")
    public ResponseEntity<List<Usuario>> getAllUsers() {
        return ResponseEntity.ok((List<Usuario>) usuarioRepository.findAll());
    }

    // Retorna o perfil do usuário logado via token
    @GetMapping(value = "/me", produces = "application/json")
    public ResponseEntity<Usuario> getMe(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        Long id = tokenService.getIdFromToken(token);
        if (id == null) return ResponseEntity.status(401).build();
        return usuarioRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Atualiza o perfil do usuário logado
    @PutMapping(value = "/me", produces = "application/json")
    public ResponseEntity<Usuario> atualizarMe(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody PerfilDTO dto) {

        String token = authHeader.replace("Bearer ", "");
        Long id = tokenService.getIdFromToken(token);
        if (id == null) return ResponseEntity.status(401).build();

        Usuario usuario = usuarioRepository.findById(id).orElse(null);
        if (usuario == null) return ResponseEntity.notFound().build();

        if (dto.nome() != null && !dto.nome().isBlank())
            usuario.setNome(dto.nome());
        if (dto.chavePix() != null)
            usuario.setChavePix(dto.chavePix());
        if (dto.formaPagamentoPreferida() != null)
            usuario.setFormaPagamentoPreferida(dto.formaPagamentoPreferida());

        // Atualiza senha apenas se fornecida
        if (dto.novaSenha() != null && !dto.novaSenha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(dto.novaSenha()));
        }

        // Atualiza telefones se fornecidos
        if (dto.telefone() != null && !dto.telefone().isBlank()) {
            usuario.getTelefones().forEach(t -> t.setNumero(dto.telefone()));
            if (usuario.getTelefones().isEmpty()) {
                br.unesp.brecho.backend.model.Telefone tel = new br.unesp.brecho.backend.model.Telefone();
                tel.setNumero(dto.telefone());
                tel.setUsuario(usuario);
                usuario.getTelefones().add(tel);
            }
        }

        return ResponseEntity.ok(usuarioRepository.save(usuario));
    }

    @PostMapping(value = "/", produces = "application/json")
    public ResponseEntity<Usuario> cadastrar(@RequestBody Usuario usuario) {
        if (usuario.getTelefones() != null)
            usuario.getTelefones().forEach(t -> t.setUsuario(usuario));
        return new ResponseEntity<>(usuarioRepository.save(usuario), HttpStatus.OK);
    }

    @PutMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<Usuario> atualizar(@PathVariable Long id, @RequestBody Usuario usuario) {
        if (!usuarioRepository.existsById(id)) return ResponseEntity.notFound().build();
        usuario.setId(id);
        if (usuario.getTelefones() != null)
            usuario.getTelefones().forEach(t -> t.setUsuario(usuario));
        return ResponseEntity.ok(usuarioRepository.save(usuario));
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<String> deletar(@PathVariable Long id) {
        usuarioRepository.deleteById(id);
        return ResponseEntity.ok("ok");
    }

    record PerfilDTO(
        String nome,
        String chavePix,
        String telefone,
        String novaSenha,
        br.unesp.brecho.backend.model.FormaPagamento formaPagamentoPreferida
    ) {}
}