# Produtos (cosméticos)

Coleção Firestore **`products`** — catálogo de produtos da barbearia.

Criada pela landing (Abraão) para a **vitrine** do site, mas já modelada para a
**integração futura com comandas** (Vitor): vender um produto na comanda deve
debitar `stock` e usar `price`/`cost` para faturamento e margem.

## Schema do documento

| Campo         | Tipo      | Descrição                                              |
|---------------|-----------|-------------------------------------------------------|
| `name`        | string    | Nome do produto                                       |
| `price`       | number    | Preço de venda ao cliente (R$)                        |
| `cost`        | number    | Custo de aquisição (R$) — base da margem              |
| `stock`       | number    | Quantidade atual em estoque (unidades)                |
| `volume`      | string    | Volume/medida exibido (ex: "100g", "250ml")           |
| `description` | string    | Descrição exibida na vitrine                          |
| `active`      | boolean   | Visível na vitrine. `false` = soft delete             |
| `order`       | number    | Ordem de exibição (menor primeiro)                    |
| `imageUrl`    | string?   | Foto (Cloudflare R2). Opcional até o upload entrar    |
| `createdAt`   | timestamp | `serverTimestamp()` na criação                        |

Tipos em `src/lib/types.ts` (`Product`, `ProductInput`). Acesso em
`src/lib/products.ts` (CRUD + `subscribeToProducts` + `seedProductsIfEmpty`).

## Regras (firestore.rules)

```
match /products/{id} {
  allow read: if true;                       // vitrine pública
  allow create, update, delete: if canManageCadastros();  // gerenciarCadastros
}
```

## Integração com comandas (a fazer — Vitor)

Ao adicionar um produto a uma comanda e fechá-la:
- debitar `stock` (`stock - quantidade`);
- registrar `price` e `cost` no item da comanda (para faturamento/margem do
  período no Financeiro);
- considerar bloquear venda quando `stock <= 0` (ou permitir com aviso).

> A landing **não** escreve em `products` — apenas lê os ativos para a vitrine.
> Toda escrita (cadastro, estoque) passa por `gerenciarCadastros`.
