package br.unesp.brecho.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.unesp.brecho.backend.model.Avaliacao;
import br.unesp.brecho.backend.model.Item;
import br.unesp.brecho.backend.model.Pedido;
import br.unesp.brecho.backend.model.Usuario;
import br.unesp.brecho.backend.repository.AvaliacaoRepository;
import br.unesp.brecho.backend.repository.ItemRepository;
import br.unesp.brecho.backend.repository.PedidoRepository;
import br.unesp.brecho.backend.repository.UsuarioRepository;
import br.unesp.brecho.backend.security.TokenService;

@RestController
@RequestMapping("/avaliacoes")
@CrossOrigin
public class AvaliacaoController {

    @Autowired private AvaliacaoRepository avaliacaoRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private ItemRepository itemRepository;
    @Autowired private PedidoRepository pedidoRepository;
    @Autowired private TokenService tokenService;

    // Todas as avaliações recebidas por um usuário (perfil público)
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Avaliacao>> getByAvaliado(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(avaliacaoRepository.findByAvaliadoId(usuarioId));
    }

    // Avaliações de um item (para referência da transação)
    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<Avaliacao>> getByItem(@PathVariable Long itemId) {
        return ResponseEntity.ok(avaliacaoRepository.findByItemId(itemId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Avaliacao> getById(@PathVariable Long id) {
        return avaliacaoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Avalia o outro participante da transação (via itemId)
    // Comprador avalia vendedor e vice-versa
    @PostMapping("/item/{itemId}")
    public ResponseEntity<?> criar(
            @PathVariable Long itemId,
            @RequestBody AvaliacaoDTO dto,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "");
        Long autorId = tokenService.getIdFromToken(token);
        if (autorId == null) return ResponseEntity.status(401).build();

        if (dto.nota() < 1 || dto.nota() > 5)
            return ResponseEntity.badRequest().body("Nota deve ser entre 1 e 5.");

        Item item = itemRepository.findById(itemId).orElse(null);
        if (item == null) return ResponseEntity.notFound().build();

        if (!"VENDIDO".equals(item.getStatus()))
            return ResponseEntity.badRequest().body("A avaliação só pode ser feita após a venda ser concluída.");

        Pedido pedido = pedidoRepository.findByItemId(itemId).orElse(null);
        if (pedido == null || !Boolean.TRUE.equals(pedido.getStatusEntrega()))
            return ResponseEntity.badRequest().body("Venda não concluída.");

        Long compradorId = pedido.getUsuario().getId();
        Long vendedorId  = pedido.getVendedor() != null
                ? pedido.getVendedor().getId()
                : item.getVendedor().getId();

        String tipo;
        Long avaliadoId;

        if (autorId.equals(compradorId)) {
            tipo = "COMPRADOR_PARA_VENDEDOR";
            avaliadoId = vendedorId;
        } else if (autorId.equals(vendedorId)) {
            tipo = "VENDEDOR_PARA_COMPRADOR";
            avaliadoId = compradorId;
        } else {
            return ResponseEntity.status(403).body("Apenas comprador ou vendedor desta transação podem avaliar.");
        }

        if (avaliacaoRepository.findByAutorIdAndItemIdAndTipo(autorId, itemId, tipo).isPresent())
            return ResponseEntity.badRequest().body("Você já avaliou esta transação.");

        Usuario autor    = usuarioRepository.findById(autorId).orElseThrow();
        Usuario avaliado = usuarioRepository.findById(avaliadoId).orElseThrow();

        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setNota(dto.nota());
        avaliacao.setComentario(dto.comentario());
        avaliacao.setAutor(autor);
        avaliacao.setAvaliado(avaliado);
        avaliacao.setItem(item);
        avaliacao.setTipo(tipo);

        return ResponseEntity.status(201).body(avaliacaoRepository.save(avaliacao));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "");
        Long autorId = tokenService.getIdFromToken(token);

        Avaliacao avaliacao = avaliacaoRepository.findById(id).orElse(null);
        if (avaliacao == null) return ResponseEntity.notFound().build();
        if (!avaliacao.getAutor().getId().equals(autorId))
            return ResponseEntity.status(403).build();

        avaliacaoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    record AvaliacaoDTO(Integer nota, String comentario) {}
}