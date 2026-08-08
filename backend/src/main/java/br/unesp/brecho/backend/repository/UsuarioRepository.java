package br.unesp.brecho.backend.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import br.unesp.brecho.backend.model.Usuario;


public interface UsuarioRepository extends CrudRepository<Usuario, Long>{
    
	@Query("select u from Usuario u where u.email = ?1")
    Usuario findByEmail(String email);
}
