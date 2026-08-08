package br.unesp.brecho.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import br.unesp.brecho.backend.model.Item;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    
    @Transactional
    @Modifying
    @Query(value = "DELETE FROM pedido_item WHERE item_id = ?1", nativeQuery = true)
    void deleteFromJoinTable(Long itemId);

    @Transactional
    @Modifying
    @Query(value = "DELETE FROM imagem WHERE item_id = ?1", nativeQuery = true)
    void deleteImagensByItemId(Long itemId);

    @Transactional
    @Modifying
    @Query(value = "DELETE FROM lista_usuario_interesse WHERE item_id = ?1", nativeQuery = true)
    void deleteInteressesByItemId(Long itemId);

    List<Item> findByInteressadosId(Long usuarioId);

    List<Item> findByVendedorId(Long vendedorId);
}