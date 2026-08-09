<div align="center">

<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
<img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
<img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
<img src="https://img.shields.io/badge/Spring_Boot-3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white"/>
<img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white"/>
<img src="https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>

# Brechó da UNESP

**Plataforma web fullstack de compra e venda de itens usados**

*Projeto Final — Disciplina de Desenvolvimento Web · UNESP · 2026*  
*Rebeca Furtado & Elisa Yamashita*

[![Deploy](https://img.shields.io/badge/🔗_Deploy_ao_vivo-Vercel-black?style=for-the-badge)](https://site-dev-web-eta.vercel.app)

</div>

---

## Visão Geral

| | |
|---|---|
| ![Home](https://raw.githubusercontent.com/Rebeca1204/SiteDevWeb/master/docs/home.png) | ![Catálogo](https://raw.githubusercontent.com/Rebeca1204/SiteDevWeb/master/docs/catalogo.png) |
| **Página inicial** com identidade visual própria | **Catálogo** com fotos reais e filtros incrementais |
| ![Detalhe](https://raw.githubusercontent.com/Rebeca1204/SiteDevWeb/master/docs/detalhe.png) | ![Meus Itens](https://raw.githubusercontent.com/Rebeca1204/SiteDevWeb/master/docs/meusitens.png) |
| **Detalhe do item** com galeria, status e botão de ação | **Meus Itens** com abas Vendendo · Comprando · Fila de Espera |

---

## Sobre o Projeto

O **Brechó da UNESP** é uma plataforma web completa que conecta compradores e vendedores de itens usados, incentivando o consumo consciente e a moda circular. O sistema reproduz a experiência de um brechó real no ambiente digital:

- O **vendedor** cadastra itens com fotos, preço e categoria
- O **primeiro comprador** interessado reserva o item automaticamente
- Os **demais** entram numa fila de espera com posição visível
- Após a venda, ambos se **avaliam mutuamente**, construindo reputação pública

---

## Funcionalidades

### Autenticação
- Cadastro com nome, e-mail, CPF, telefone e senha
- Login com JWT (expiração de 2h, claim de ID no payload)
- Rotas protegidas via `ProtectedRoute` com redirecionamento automático
- Logout com limpeza de `localStorage`

### Catálogo
- 30 categorias de produtos (roupas, calçados, eletrônicos, móveis, etc.)
- Upload de múltiplas fotos por item (armazenamento local no backend)
- **Filtros incrementais** em tempo real: busca, categoria, pagamento, conservação, preço mínimo e máximo
- Badge "Meu item" para o próprio vendedor
- Status visual colorido: `DISPONÍVEL` · `RESERVADO` · `VENDIDO`

### Fluxo de Compra e Fila de Espera
- 1º interessado → item `RESERVADO` + pedido criado automaticamente
- Demais interessados → fila de espera ordenada
- Vendedor vê e-mail e telefone de cada interessado
- Remoção de interessado promove o próximo da fila automaticamente
- Venda concluída pelo vendedor → status `VENDIDO` + avaliações liberadas

### Avaliações Mútuas
- Somente após `statusEntrega = true`
- Comprador avalia vendedor (`COMPRADOR_PARA_VENDEDOR`)
- Vendedor avalia comprador (`VENDEDOR_PARA_COMPRADOR`)
- Uma avaliação por papel por transação (sem duplicatas)
- Reputação exibida no perfil público e no detalhe do item

### Perfil
- Perfil público com média de estrelas e histórico separado por papel
- Edição de nome, telefone, chave Pix, forma de pagamento preferida e senha
- Link para o perfil do vendedor em cada item do catálogo

### Meus Itens — 3 abas
| Aba | O que mostra |
|-----|-------------|
| **Vendendo** | Itens agrupados por status · lista de interessados com contato · confirmar venda · avaliar comprador |
| **Comprando** | Pedidos ativos e concluídos · link para perfil do vendedor · avaliar vendedor |
| **Fila de Espera** | Posição na fila em tempo real · vendedor linkado |

---

## Arquitetura

```
Navegador (React + Tailwind)
        ↕ HTTP + JWT
Spring Boot REST API
        ↕ JPA / SQL
      MySQL
```

### Backend — Camadas
| Camada | Responsabilidade |
|--------|-----------------|
| `Controllers` | Auth, Item, Pedido, Avaliação, Imagem, Usuário |
| `Security` | SecurityFilter (JWT por requisição), SecurityConfigurations, TokenService |
| `Models / JPA` | Usuário, Person, Item, Pedido, Avaliação, Imagem, Telefone |
| `Repository` | Spring Data com `@Query` customizados |

---

## Tecnologias

### Frontend
| Tech | Uso |
|------|-----|
| React 18 + TypeScript | Interface e componentes tipados |
| React Router v6 | `RouterProvider`, rotas aninhadas, `Outlet` |
| Tailwind CSS v4 | Estilização com `@theme` (sem `tailwind.config.js`) |
| Axios | Requisições HTTP com header JWT |
| Vite | Bundler + plugin `@tailwindcss/vite` |

### Backend
| Tech | Uso |
|------|-----|
| Java 17 + Spring Boot 3 | API REST |
| Spring Security | Autenticação stateless, rotas protegidas |
| JWT (auth0) | Token HMAC256 com claim de ID |
| Spring Data JPA + Hibernate | ORM, herança `SINGLE_TABLE` |
| MySQL | Banco de dados relacional |
| MultipartFile | Upload de imagens com armazenamento local |

---

## Estrutura do Frontend

```
src/
├── main.tsx                  # RouterProvider com todas as rotas
├── App.tsx                   # Layout base (header + nav + Outlet + footer)
├── styles.css                # @import tailwindcss + @theme tokens
├── utils/
│   └── auth.ts               # getUsuarioId(), getUsuarioEmail()
├── components/
│   └── ProtectedRoute.tsx    # Guarda rotas privadas
└── screens/
    ├── Home.tsx              # /
    ├── SobreNos.tsx          # /sobrenos
    ├── Login.tsx             # /login
    ├── Register.tsx          # /register
    ├── Logout.tsx            # /logout
    ├── Itens.tsx             # /itens  (catálogo com filtros)
    ├── ItemDetalhes.tsx      # /itens/:id
    ├── CadastrarItem.tsx     # /itens/cadastrar
    ├── MeusItens.tsx         # /meus-itens  (3 abas)
    ├── Perfil.tsx            # /perfil/:id
    ├── EditarPerfil.tsx      # /perfil/editar
    └── ErrorScreen.tsx       # 404
```

---

## Como Rodar Localmente

### Pré-requisitos
- Node.js 18+
- Java 17+
- MySQL 8+

### Frontend

```bash
git clone https://github.com/Rebeca1204/SiteDevWeb.git
cd SiteDevWeb
npm install
npm run dev
```

Acesse `http://localhost:3000`

### Backend

```bash
mvn spring-boot:run
```

API disponível em `http://localhost:8080`

---

## Rotas

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/` | Público | Home |
| `/sobrenos` | Público | Sobre o projeto |
| `/login` | Público | Login |
| `/register` | Público | Cadastro |
| `/itens` | Autenticado | Catálogo com filtros |
| `/itens/:id` | Autenticado | Detalhe do item |
| `/itens/cadastrar` | Autenticado | Cadastrar novo item |
| `/meus-itens` | Autenticado | Vendendo · Comprando · Fila |
| `/perfil/:id` | Autenticado | Perfil público |
| `/perfil/editar` | Autenticado | Editar meu perfil |
| `/pagina_antiga` | — | Redireciona para `/` |
| `/*` | — | Tela 404 |

---

## Diagrama de Entidades
### Planejamento inicial
> Diagrama elaborado na fase de análise e projeto, antes do desenvolvimento.

![Diagrama inicial](https://raw.githubusercontent.com/Rebeca1204/SiteDevWeb/master/docs/diagrama.png)

### Modelo implementado
> Diagrama atualizado refletindo as decisões tomadas durante o desenvolvimento.

![Diagrama final](https://raw.githubusercontent.com/Rebeca1204/SiteDevWeb/master/docs/diagrama2.png)
