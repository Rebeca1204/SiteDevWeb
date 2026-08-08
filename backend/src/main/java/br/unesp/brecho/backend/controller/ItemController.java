package br.unesp.brecho.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.unesp.brecho.backend.model.Item;
import br.unesp.brecho.backend.model.Usuario;
import br.unesp.brecho.backend.repository.ItemRepository;
import br.unesp.brecho.backend.repository.PedidoRepository;
import br.unesp.brecho.backend.repository.UsuarioRepository;
import br.unesp.brecho.backend.security.TokenService;

@RestController
@RequestMapping("/itens")
@CrossOrigin
public class ItemController {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private ItemRepository itemRepository;
    @Autowired
    private PedidoRepository pedidoRepository;
    @Autowired
    private TokenService tokenService;

    @GetMapping(produces = "application/json")
    public ResponseEntity<List<Item>> getAll() {
        return ResponseEntity.ok(itemRepository.findAll());
    }

    @GetMapping(value = "/meus", produces = "application/json")
    public ResponseEntity<List<Item>> getMeus(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        Long vendedorId = tokenService.getIdFromToken(token);
        if (vendedorId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(itemRepository.findByVendedorId(vendedorId));
    }

    @GetMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<Item> getById(@PathVariable Long id) {
        return itemRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/vendedor/{vendedorId}", produces = "application/json")
    public ResponseEntity<List<Item>> getByVendedor(@PathVariable Long vendedorId) {
        return ResponseEntity.ok(itemRepository.findByVendedorId(vendedorId));
    }

    @PostMapping(produces = "application/json")
    public ResponseEntity<Item> criar(
            @RequestBody Item item,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        Long vendedorId = tokenService.getIdFromToken(token);
        if (vendedorId == null) return ResponseEntity.status(401).build();
        Usuario vendedor = usuarioRepository.findById(vendedorId).orElse(null);
        if (vendedor == null) return ResponseEntity.status(401).build();
        item.setVendedor(vendedor);
        if (item.getImagens() != null) {
            item.getImagens().forEach(img -> img.setItem(item));
        }
        return ResponseEntity.status(201).body(itemRepository.save(item));
    }

    // Itens em que o usuário está na fila de espera (interessado mas não é o comprador do pedido ativo)
    @GetMapping(value = "/fila", produces = "application/json")
    public ResponseEntity<List<Item>> getFilaEspera(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        Long usuarioId = tokenService.getIdFromToken(token);
        if (usuarioId == null) return ResponseEntity.status(401).build();

        List<Item> interessados = itemRepository.findByInteressadosId(usuarioId);
        // Filtra apenas os que NÃO têm pedido ativo com esse usuário como comprador
        List<Item> fila = interessados.stream()
                .filter(item -> {
                    var pedido = pedidoRepository.findByItemId(item.getId()).orElse(null);
                    // Está na fila se: não há pedido, ou o pedido é de outro comprador
                    return pedido == null || pedido.getUsuario().getId() != usuarioId;
                })
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(fila);
    }

    @PostMapping("/{id}/interesse/{usuarioId}")
    public ResponseEntity<?> adicionarInteresse(
            @PathVariable Long id, @PathVariable Long usuarioId) {
        Item item = itemRepository.findById(id).orElse(null);
        Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
        if (item == null || usuario == null) return ResponseEntity.notFound().build();
        item.addInteressado(usuario);
        itemRepository.save(item);
        return ResponseEntity.ok().build();
    }

    @PutMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<Item> atualizar(@PathVariable Long id, @RequestBody Item item) {
        if (!itemRepository.existsById(id)) return ResponseEntity.notFound().build();
        item.setId(id);
        if (item.getImagens() != null) {
            item.getImagens().forEach(img -> img.setItem(item));
        }
        return ResponseEntity.ok(itemRepository.save(item));
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!itemRepository.existsById(id)) return ResponseEntity.notFound().build();
        if (pedidoRepository.existsByItemId(id)) return ResponseEntity.badRequest().build();
        itemRepository.getById(id).getInteressados().clear();
        itemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/interesse/{usuarioId}")
    public ResponseEntity<?> removerInteresse(
            @PathVariable Long id, @PathVariable Long usuarioId) {
        Item item = itemRepository.findById(id).orElse(null);
        Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
        if (item == null || usuario == null) return ResponseEntity.notFound().build();
        item.removeInteressado(usuario);
        itemRepository.save(item);
        return ResponseEntity.ok().build();
    }
}