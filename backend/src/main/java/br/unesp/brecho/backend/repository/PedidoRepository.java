package br.unesp.brecho.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import br.unesp.brecho.backend.model.Pedido;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    @Query("SELECT p FROM Pedido p WHERE p.usuario.id = :usuarioId")
    List<Pedido> findByUsuarioId(Long usuarioId);

    boolean existsByItemId(Long itemId);

    Optional<Pedido> findByItemId(Long itemId);
  
}