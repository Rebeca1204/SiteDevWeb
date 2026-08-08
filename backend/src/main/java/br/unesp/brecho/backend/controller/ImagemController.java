package br.unesp.brecho.backend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.unesp.brecho.backend.model.Imagem;
import br.unesp.brecho.backend.model.Item;
import br.unesp.brecho.backend.repository.ImagemRepository;
import br.unesp.brecho.backend.repository.ItemRepository;
import br.unesp.brecho.backend.security.TokenService;

@RestController
@RequestMapping("/imagens")
@CrossOrigin
public class ImagemController {

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    @Value("${server.url:http://localhost:8080}")
    private String serverUrl;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private ImagemRepository imagemRepository;

    @Autowired
    private TokenService tokenService;

    // Upload de uma imagem para um item
    @PostMapping("/item/{itemId}")
    public ResponseEntity<?> uploadImagem(
            @PathVariable Long itemId,
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam(value = "descricao", required = false) String descricao,
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader.replace("Bearer ", "");
        Long usuarioId = tokenService.getIdFromToken(token);
        if (usuarioId == null) return ResponseEntity.status(401).build();

        Item item = itemRepository.findById(itemId).orElse(null);
        if (item == null) return ResponseEntity.notFound().build();

        // Só o vendedor pode adicionar imagens
        if (item.getVendedor() == null || item.getVendedor().getId() != usuarioId) {
            return ResponseEntity.status(403).body("Apenas o vendedor pode adicionar imagens.");
        }

        // Valida tipo do arquivo
        String contentType = arquivo.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body("Apenas imagens são permitidas.");
        }

        try {
            // Cria o diretório se não existir
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Gera nome único para evitar conflitos
            String extensao = arquivo.getOriginalFilename() != null && arquivo.getOriginalFilename().contains(".")
                    ? arquivo.getOriginalFilename().substring(arquivo.getOriginalFilename().lastIndexOf("."))
                    : ".jpg";
            String nomeArquivo = UUID.randomUUID().toString() + extensao;
            Path destino = uploadPath.resolve(nomeArquivo);

            // Salva o arquivo usando InputStream para evitar problemas com caminhos relativos do Tomcat
            Files.copy(arquivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

            // Salva a URL no banco
            String url = serverUrl + "/uploads/" + nomeArquivo;
            Imagem imagem = new Imagem();
            imagem.setUrl(url);
            imagem.setDescricao(descricao);
            imagem.setItem(item);
            imagemRepository.save(imagem);

            return ResponseEntity.status(201).body(imagem);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erro ao salvar imagem.");
        }
    }

    // Lista imagens de um item
    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<Imagem>> getByItem(@PathVariable Long itemId) {
        return ResponseEntity.ok(imagemRepository.findByItemId(itemId));
    }

    // Deleta uma imagem
    @DeleteMapping("/{imagemId}")
    public ResponseEntity<?> deletar(
            @PathVariable Long imagemId,
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader.replace("Bearer ", "");
        Long usuarioId = tokenService.getIdFromToken(token);
        if (usuarioId == null) return ResponseEntity.status(401).build();

        Imagem imagem = imagemRepository.findById(imagemId).orElse(null);
        if (imagem == null) return ResponseEntity.notFound().build();

        if (imagem.getItem().getVendedor() == null ||
                imagem.getItem().getVendedor().getId() != usuarioId) {
            return ResponseEntity.status(403).body("Apenas o vendedor pode remover imagens.");
        }

        // Remove arquivo do disco
        try {
            String nomeArquivo = imagem.getUrl().substring(imagem.getUrl().lastIndexOf("/") + 1);
            Path arquivo = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(nomeArquivo);
            Files.deleteIfExists(arquivo);
        } catch (IOException e) {
            e.printStackTrace();
        }

        imagemRepository.delete(imagem);
        return ResponseEntity.noContent().build();
    }
}