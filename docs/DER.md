# Diagrama Entidade-Relacionamento

```mermaid
erDiagram
    USUARIOS ||--o{ EMPRESTIMOS : realiza
    CATEGORIAS ||--o{ JOGOS : classifica
    EMPRESTIMOS ||--o{ ITENS_EMPRESTIMO : possui
    JOGOS ||--o{ ITENS_EMPRESTIMO : aparece

    USUARIOS {
        int id PK
        varchar nome
        varchar email UK
        varchar senha
        varchar telefone
        enum tipo_usuario
        timestamp created_at
    }

    CATEGORIAS {
        int id PK
        varchar nome UK
        varchar descricao
    }

    JOGOS {
        int id PK
        varchar titulo
        text descricao
        int categoria_id FK
        enum tipo_jogo
        varchar plataforma
        decimal valor_aluguel
        int estoque
        varchar imagem
        timestamp created_at
    }

    EMPRESTIMOS {
        int id PK
        int usuario_id FK
        datetime data_emprestimo
        date data_prevista_devolucao
        datetime data_devolucao_real
        enum status
        int dias_aluguel
        decimal desconto
        decimal valor_total
        text observacoes
    }

    ITENS_EMPRESTIMO {
        int id PK
        int emprestimo_id FK
        int jogo_id FK
        int quantidade
        decimal valor_unitario
    }
```

Relacionamentos obrigatorios atendidos:

- `usuarios` 1:N `emprestimos`
- `categorias` 1:N `jogos`
- `emprestimos` N:N `jogos` por meio de `itens_emprestimo`

Observacoes de dominio:

- `usuarios.tipo_usuario`: `admin` ou `usuario`
- `jogos.tipo_jogo`: `videogame` ou `boardgame`
- `emprestimos.status`: `pendente`, `aprovado`, `retirado`, `devolvido`, `cancelado` ou `atrasado`
