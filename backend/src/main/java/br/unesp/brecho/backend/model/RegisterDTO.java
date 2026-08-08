package br.unesp.brecho.backend.model;

public record RegisterDTO(String email, String senha, UserRole role, String nome, String cpf, String telefone) {

}