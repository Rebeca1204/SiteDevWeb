package br.unesp.brecho.backend.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("PESSOA_FISICA")
public class Person extends Usuario {
    private String cpf;

    public Person() {
    }

    public Person(String email, String senha, UserRole role, String nome, String cpf) {
        super(email, senha, role);   // usa o construtor do pai — corrige o bug do getPassword() null
        super.setNome(nome);
        this.cpf = cpf;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }
}