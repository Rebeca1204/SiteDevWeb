package br.unesp.brecho.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.unesp.brecho.backend.model.Imagem;

public interface ImagemRepository extends JpaRepository<Imagem, Long> {
    List<Imagem> findByItemId(Long itemId);
}