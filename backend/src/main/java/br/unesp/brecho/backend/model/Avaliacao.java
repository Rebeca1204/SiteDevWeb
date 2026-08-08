package br.unesp.brecho.backend.model;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 1-5 estrelas
    private Integer nota;

    private String comentario;

    private LocalDate data;

    // quem escreveu a avaliação
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id")
    private Usuario autor;

    // quem recebeu a avaliação
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "avaliado_id")
    private Usuario avaliado;

    // item da transação
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "item_id")
    private Item item;

    // COMPRADOR_PARA_VENDEDOR ou VENDEDOR_PARA_COMPRADOR
    private String tipo;

    public Avaliacao() {
        this.data = LocalDate.now();
    }

    public Long getId() { return id; }
    public Integer getNota() { return nota; }
    public void setNota(Integer nota) { this.nota = nota; }
    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }
    public LocalDate getData() { return data; }
    public Usuario getAutor() { return autor; }
    public void setAutor(Usuario autor) { this.autor = autor; }
    public Usuario getAvaliado() { return avaliado; }
    public void setAvaliado(Usuario avaliado) { this.avaliado = avaliado; }
    public Item getItem() { return item; }
    public void setItem(Item item) { this.item = item; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    // Mantém compatibilidade com código antigo que usa getUsuario()
    public Usuario getUsuario() { return autor; }
    public void setUsuario(Usuario usuario) { this.autor = usuario; }
}