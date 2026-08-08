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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.unesp.brecho.backend.model.Item;
import br.unesp.brecho.backend.model.Pedido;
import br.unesp.brecho.backend.model.Usuario;
import br.unesp.brecho.backend.repository.ItemRepository;
import br.unesp.brecho.backend.repository.PedidoRepository;
import br.unesp.brecho.backend.repository.UsuarioRepository;
import br.unesp.brecho.backend.security.TokenService;

@RestController
@RequestMapping("/pedidos")
@CrossOrigin
public class PedidoController {

    @Autowired
    private PedidoRepository pedidoRepository;
    @Autowired
    private ItemRepository itemRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private TokenService tokenService;

    @GetMapping(produces = "application/json")
    public ResponseEntity<List<Pedido>> getAll() {
        return ResponseEntity.ok(pedidoRepository.findAll());
    }

    @GetMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<Pedido> getById(@PathVariable Long id) {
        return pedidoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/usuario/{usuarioId}", produces = "application/json")
    public ResponseEntity<List<Pedido>> getByUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(pedidoRepository.findByUsuarioId(usuarioId));
    }

    // Registra interesse: se for o primeiro, cria pedido e reserva o item.
    // Se já houver pedido, apenas adiciona à lista de interessados.
    @PostMapping(value = "/interesse/{itemId}", produces = "application/json")
    public ResponseEntity<?> registrarInteresse(
            @PathVariable Long itemId,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "");
        Long usuarioId = tokenService.getIdFromToken(token);
        if (usuarioId == null) return ResponseEntity.status(401).build();

        Item item = itemRepository.findById(itemId).orElse(null);
        if (item == null) return ResponseEntity.notFound().build();

        Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
        if (usuario == null) return ResponseEntity.status(401).build();

        // Não pode ter interesse no próprio item
        if (item.getVendedor() != null && item.getVendedor().getId() == usuarioId) {
            return ResponseEntity.badRequest().body("Você não pode comprar seu próprio item.");
        }

        // Já está na lista
        boolean jaInteressado = item.getInteressados().stream()
                .anyMatch(u -> u.getId() == usuarioId);
        if (jaInteressado) {
            return ResponseEntity.badRequest().body("Você já está na lista de interesse.");
        }

        // Adiciona à lista de interessados
        item.addInteressado(usuario);

        // Se for o primeiro interessado e o item estiver disponível → cria pedido e reserva
        boolean temPedido = pedidoRepository.existsByItemId(itemId);
        if (!temPedido && "DISPONIVEL".equals(item.getStatus())) {
            item.setStatus("RESERVADO");
            itemRepository.save(item);

            Pedido pedido = new Pedido();
            pedido.setItem(item);
            pedido.setUsuario(usuario);
            pedido.setTotal(item.getPreco());
            pedidoRepository.save(pedido);

            return ResponseEntity.status(201).body("Reservado! O vendedor entrará em contato com você.");
        }

        // Caso contrário, só entra na fila de espera
        itemRepository.save(item);
        return ResponseEntity.ok("Você entrou na lista de espera.");
    }

    // Vendedor remove um interessado da lista (venda não funcionou)
    // Se o removido tinha o pedido, o próximo da fila assume
    @DeleteMapping("/interesse/{itemId}/usuario/{usuarioIdRemover}")
    public ResponseEntity<?> removerInteressado(
            @PathVariable Long itemId,
            @PathVariable Long usuarioIdRemover,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "");
        Long vendedorId = tokenService.getIdFromToken(token);
        if (vendedorId == null) return ResponseEntity.status(401).build();

        Item item = itemRepository.findById(itemId).orElse(null);
        if (item == null) return ResponseEntity.notFound().build();

        // Só o vendedor pode remover
        if (item.getVendedor() == null || item.getVendedor().getId() != vendedorId) {
            return ResponseEntity.status(403).body("Apenas o vendedor pode gerenciar a lista.");
        }

        Usuario usuarioRemover = usuarioRepository.findById(usuarioIdRemover).orElse(null);
        if (usuarioRemover == null) return ResponseEntity.notFound().build();

        // Verifica se o removido tinha o pedido ativo
        Pedido pedidoAtivo = pedidoRepository.findByItemId(itemId).orElse(null);
        boolean eraComprador = pedidoAtivo != null
                && pedidoAtivo.getUsuario().getId() == usuarioIdRemover;

        // Remove da lista de interessados
        item.removeInteressado(usuarioRemover);

        if (eraComprador) {
            // Cancela o pedido atual
            pedidoRepository.delete(pedidoAtivo);

            // Próximo da fila (primeira posição restante após remoção)
            if (!item.getInteressados().isEmpty()) {
                Usuario proximo = item.getInteressados().get(0);
                item.setStatus("RESERVADO");
                itemRepository.save(item);

                Pedido novoPedido = new Pedido();
                novoPedido.setItem(item);
                novoPedido.setUsuario(proximo);
                novoPedido.setTotal(item.getPreco());
                pedidoRepository.save(novoPedido);
            } else {
                // Ninguém mais na fila → volta para disponível
                item.setStatus("DISPONIVEL");
                itemRepository.save(item);
            }
        } else {
            itemRepository.save(item);
        }

        return ResponseEntity.ok().build();
    }

    // Vendedor confirma que a venda foi concluída
    @PutMapping("/{id}/concluir")
    public ResponseEntity<?> concluirVenda(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "");
        Long vendedorId = tokenService.getIdFromToken(token);
        if (vendedorId == null) return ResponseEntity.status(401).build();

        Pedido pedido = pedidoRepository.findById(id).orElse(null);
        if (pedido == null) return ResponseEntity.notFound().build();

        Item item = pedido.getItem();
        if (item.getVendedor() == null || item.getVendedor().getId() != vendedorId) {
            return ResponseEntity.status(403).body("Apenas o vendedor pode concluir a venda.");
        }

        item.setStatus("VENDIDO");
        itemRepository.save(item);
        pedido.setStatusEntrega(true);
        // Salva referência ao vendedor no pedido para uso nas avaliações
        pedido.setVendedor(item.getVendedor());
        pedidoRepository.save(pedido);

        return ResponseEntity.ok("Venda concluída!");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Pedido pedido = pedidoRepository.findById(id).orElse(null);
        if (pedido == null) return ResponseEntity.notFound().build();

        Item item = pedido.getItem();
        if (item != null) {
            item.setStatus("DISPONIVEL");
            itemRepository.save(item);
        }

        pedidoRepository.delete(pedido);
        return ResponseEntity.noContent().build();
    }
}