package br.unesp.brecho.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import br.unesp.brecho.backend.model.Avaliacao;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {

    @Query("SELECT a FROM Avaliacao a WHERE a.item.id = :itemId")
    List<Avaliacao> findByItemId(Long itemId);

    @Query("SELECT a FROM Avaliacao a WHERE a.autor.id = :usuarioId")
    List<Avaliacao> findByAutorId(Long usuarioId);

    // Todas as avaliações que um usuário recebeu
    @Query("SELECT a FROM Avaliacao a WHERE a.avaliado.id = :usuarioId")
    List<Avaliacao> findByAvaliadoId(Long usuarioId);

    // Verifica se já existe avaliação de um autor para um item com um tipo
    @Query("SELECT a FROM Avaliacao a WHERE a.autor.id = :autorId AND a.item.id = :itemId AND a.tipo = :tipo")
    Optional<Avaliacao> findByAutorIdAndItemIdAndTipo(Long autorId, Long itemId, String tipo);
}