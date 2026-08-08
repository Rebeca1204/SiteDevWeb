package br.unesp.brecho.backend.model;

import java.util.List;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("PESSOA_JURIDICA")
public class PessoaJuridica extends Usuario{
    private String cnpj;
    private String nomeEmpresa;

    public PessoaJuridica(String cnpj, String nomeEmpresa) {
        this.cnpj = cnpj;
        this.nomeEmpresa = nomeEmpresa;
    }

    public PessoaJuridica(String cnpj, String nomeEmpresa, Long id, String nome, String email, String senha, List<Telefone> telefones, String chavePix, FormaPagamento formaPagamentoPreferida, List<Item> itens, UserRole role) {
        super(id, nome, email, senha, telefones, chavePix, formaPagamentoPreferida, itens, role);
        this.cnpj = cnpj;
        this.nomeEmpresa = nomeEmpresa;
    }

    public PessoaJuridica(String cnpj, String nomeEmpresa, String email, String senha, UserRole role) {
        super(email, senha, role);
        this.cnpj = cnpj;
        this.nomeEmpresa = nomeEmpresa;
    }

    public PessoaJuridica(String cnpj, String nomeEmpresa, String nome, String email, String senha) {
        super(nome, email, senha);
        this.cnpj = cnpj;
        this.nomeEmpresa = nomeEmpresa;
    }
    public String getCnpj() {
        return cnpj;
    }
    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }
    public String getNomeEmpresa() {
        return nomeEmpresa;
    }
    public void setNomeEmpresa(String nomeEmpresa) {
        this.nomeEmpresa = nomeEmpresa;
    }

    
}
