# Roadmap de Implementação: App Barber ➔ Ortega

## Bloco 1: Fundação & Clone da Experiência Visual
- `[/]` Setup da Infraestrutura (Next.js 15, Tailwind, TypeScript)
- `[x]` Configuração base do Firebase (Firestore) - Aguardando chaves. Mockup provisório.
- `[x]` Construção do Layout Base (Wireframe premium, tipografia Inter)
- `[x]` Criação do Menu Lateral (Sidebar) com as categorias do App Barber (Agenda, Cadastros, Comandas, Financeiro expansível, etc.)
- `[x]` Organizar os arquivos de mockup antigos (`index.html`, `script.js`, etc.) em uma pasta `docs_e_mockups` para limpar a raiz do projeto.

## Bloco 2: O Coração da Barbearia - Agenda & Comandas
- `[ ]` Criar interface da Grade Vertical de Agenda (por profissional)
- `[ ]` Criar componente de Mini-calendário lateral
- `[ ]` Estruturar fluxo de Abertura de Comandas integrado à Agenda
- `[ ]` UX de adição rápida de produtos/serviços (2 cliques)

## Bloco 3: O "Monstro" Financeiro & Estoque
- `[ ]` Criar tabela de Controle de Estoque (Descrição, Categoria, Marca, Qtde, Valor, Comissão)
- `[ ]` Implementar botões rápidos de Movimentação (+/-)
- `[ ]` Interface de Gestão de Caixas (Abertura/Fechamento diário)
- `[ ]` Lógica de Comissionamento e repasses

## Bloco 4: Fidelização e Fila de Espera
- `[ ]` Painel digital da Fila de Ordem de Chegada (Balcão)
- `[ ]` Módulo "Conta do Cliente" (Wallet para créditos)
