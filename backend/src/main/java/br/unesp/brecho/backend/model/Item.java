package br.unesp.brecho.backend.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.UniqueConstraint;

@Entity
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String descricao;

    private Double preco;

    private String status = "DISPONIVEL";

    private String condicao;

    @Enumerated(EnumType.STRING)
    private FormaPagamento formaPagamentoAceitas;

    private LocalDate dataCadastro;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vendedor_id")
    private Usuario vendedor;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "lista_usuario_interesse",
        uniqueConstraints = @UniqueConstraint(
            columnNames = {"item_id", "usuario_id"},
            name = "unique_user_item"
        ),
        joinColumns = @JoinColumn(name = "item_id", referencedColumnName = "id", table = "item", unique = false),
        inverseJoinColumns = @JoinColumn(name = "usuario_id", referencedColumnName = "id", table = "usuario", unique = false)
    )
    private List<Usuario> interessados = new ArrayList<>();

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Imagem> imagens = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private Categoria categoria;

    public void addInteressado(Usuario usuario) {
        if (!interessados.contains(usuario)) {
            interessados.add(usuario);
            usuario.getItensInteresse().add(this);
        }
    }

    public void removeInteressado(Usuario usuario) {
        interessados.remove(usuario);
        usuario.getItensInteresse().remove(this);
    }

    public Item() {
        this.dataCadastro = LocalDate.now();
        this.status = "DISPONIVEL";
    }

    public Item(Long id, String nome, String descricao, Double preco, String status, String condicao,
            FormaPagamento formaPagamentoAceitas, Usuario vendedor, List<Imagem> imagens, Categoria categoria) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.preco = preco;
        this.status = "DISPONIVEL";
        this.condicao = condicao;
        this.formaPagamentoAceitas = formaPagamentoAceitas;
        this.dataCadastro = LocalDate.now();
        this.vendedor = vendedor;
        this.imagens = imagens;
        this.categoria = categoria;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public Double getPreco() { return preco; }
    public void setPreco(Double preco) { this.preco = preco; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCondicao() { return condicao; }
    public void setCondicao(String condicao) { this.condicao = condicao; }
    public FormaPagamento getFormaPagamentoAceitas() { return formaPagamentoAceitas; }
    public void setFormaPagamentoAceitas(FormaPagamento formaPagamentoAceitas) { this.formaPagamentoAceitas = formaPagamentoAceitas; }
    public LocalDate getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDate dataCadastro) { this.dataCadastro = dataCadastro; }
    public Usuario getVendedor() { return vendedor; }
    public void setVendedor(Usuario vendedor) { this.vendedor = vendedor; }
    public List<Imagem> getImagens() { return imagens; }
    public void setImagens(List<Imagem> imagens) { this.imagens = imagens; }
    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }
    public List<Usuario> getInteressados() { return interessados; }
    public void setInteressados(List<Usuario> interessados) { this.interessados = interessados; }
}