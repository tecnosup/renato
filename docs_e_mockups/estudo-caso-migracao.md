# Estudo de Caso & Planejamento de Migração: App Barber ➔ TecnoSup
**Parceiro:** Renato Benites Vilhagra (Dono da barbearia Século XXI e do novo empreendimento)  
**Status do Novo Negócio:** Finalização do acabamento em **30/Junho**, inauguração em **Julho**. Modelo voltado para expansão por franquias.  
**Objetivo do Documento:** Planejar a engenharia de software para absorver a operação do Renato sem atrito ou choque de transição para a equipe, elevando o nível tecnológico do negócio com a stack TecnoSup.

---

## 🎯 1. O Desafio e a Solução
A equipe do Renato está acostumada com o fluxo de trabalho do **App Barber**. Uma mudança abrupta para um sistema com interface e regras de negócios completamente diferentes geraria atrito operacional no balcão e na cadeira do barbeiro.

**Nossa Solução:**
Desenvolveremos uma solução customizada de alto padrão na nossa stack (**Next.js 16 + React 19 + Firestore**), onde:
1. **No Balcão e Backoffice (Admin):** Mapearemos e replicaremos a lógica de menus, fluxo de caixas, comandas abertas e fila de espera do App Barber. A equipe do Renato se sentirá "em casa".
2. **Na Experiência do Cliente (Landing Page & App Web):** Entregaremos um visual ultrapremium, carregamento instantâneo e agendamento otimizado, sem a barreira de downloads da Apple/Google Play Store.
3. **No Modelo de Negócio:** Toda a estrutura será escalável para franquias desde o dia zero, com banco de dados dedicado e separação lógica por filiais/franqueados.

---

## 📊 2. Matriz de GAPs e Ações de Engenharia
Com base na auditoria visual feita nos prints do painel do App Barber, cruzamos as funcionalidades exigidas com o nosso projeto base (**Ortega**).

| Área Funcional | Recurso (App Barber) | Status no Ortega | Plano de Ação Técnica (TecnoSup) |
| :--- | :--- | :--- | :--- |
| **Agenda** | Grade vertical por profissional, mini-calendário e legenda lateral. | **Equivalente** | Ajustaremos a disposição visual do Ortega para que o painel lateral direito exiba a legenda e o mini-calendário exatamente como no concorrente, preservando a memória muscular do atendente. |
| **Agenda** | Bloqueio de horários e Encaixe rápido (`+ Encaixe`). | **Parcial** | Criaremos no modal da agenda um toggle `Bloquear Horário` (invalida slots no Firestore) e um botão `Encaixe` que ignora conflitos de horário na agenda de um profissional específico. |
| **Vendas / POS** | **Sistema de Comandas** (`Abertas` e `Histórico`). Permite lançar produtos (cerveja, pomadas) e serviços no decorrer do atendimento. | **Lacuna** | **Ajuste Prioritário:** Implementaremos a coleção `comandas` no Firestore. Ao invés do agendamento fechar a venda de imediato, ele cria uma comanda ativa. O atendente adiciona consumos adicionais e realiza o fechamento financeiro (dinheiro, PIX, cartão) apenas na saída do cliente. |
| **Fluxo de Caixa** | **Abertura e Fechamento de Caixa** manual com saldo inicial e conferência de desvios. | **Lacuna** | Criaremos a coleção `sessoes_caixa` no Firestore. O operador deve informar o saldo em gaveta para iniciar o dia. Toda comanda fechada ou gasto lançado alimenta essa sessão. No fim do dia, o sistema calcula o saldo esperado contra o saldo contado. |
| **Fila Presencial** | **Ordem de Chegada** (fila de espera sequencial para quem chega sem agendar). | **Lacuna** | Desenvolveremos o módulo de `fila_espera` (FIFO). O cliente é adicionado no painel físico do balcão e atribuído ao próximo barbeiro disponível ou ao barbeiro escolhido, gerando um painel visível na barbearia. |
| **Financeiro** | Repasses, Comissões e Controle de Estoque com histórico de entradas/saídas. | **Equivalente** | Totalmente funcional no Ortega. Sincronizaremos a lógica de taxas e estoques existentes. |
| **Clientes** | `Conta do Cliente` (Saldo em carteira pré-paga). | **Parcial** | Expandiremos o controle de créditos Stripe do Ortega para criar uma carteira genérica (`wallet_balance` no documento do cliente), permitindo ao cliente recarregar valores no balcão e consumir depois. |
| **Controle** | `Aprovação de Cadastro` (Novos clientes solicitam cadastro online). | **Parcial** | Ativaremos o campo `status` no cadastro do cliente. Quando ativado pelo painel, novos agendamentos só são liberados após o admin aprovar a ficha na notificação do header. |

---

## 🚀 3. Cronograma de Desenvolvimento (Fases de Entrega)
Para garantir um desenvolvimento seguro e sem atrasos para o lançamento de **Julho**, propomos um roadmap de 4 fases rápidas:

*   **Fase 1: Setup de Infraestrutura & Grid de Agenda (Dias 1 a 7)**
    *   Configuração do projeto Firebase dedicado para o novo CNPJ do Renato.
    *   Desenvolvimento da Landing Page institucional com a nova marca premium.
    *   Adaptação do Grid de Agenda (visualização por colunas de profissionais, mini-calendário e legenda de status).

*   **Fase 2: Motor de Comandas & Sessão de Caixa (Dias 8 a 15)**
    *   Estruturação da coleção `comandas` no Firestore.
    *   Painel de controle de Comandas Abertas (lansamento rápido de serviços adicionais e produtos).
    *   Criação do fluxo de Caixa Diário (Abertura, Lançamentos de despesa e Fechamento).

*   **Fase 3: Fila de Ordem de Chegada & Carteira de Créditos (Dias 16 a 22)**
    *   Painel de Ordem de Chegada (fila digital de espera).
    *   Ativação da carteira do cliente (`wallet_balance`) integrada ao fluxo de pagamento de comandas.
    *   Integração final do Stripe para compra de planos de assinatura online.

*   **Fase 4: Validação, Importação de Dados & Testes (Dias 23 a 28)**
    *   Fluxo de aprovação de novos cadastros de clientes no cabeçalho do admin.
    *   Scripts para importação de clientes e histórico básico de serviços do App Barber (via CSV/Excel).
    *   Homologação prática com a equipe de barbeiros do Renato para garantir zero fricção.

---

## 🔒 4. Garantia Arquitetural TecnoSup (Diferenciais contra Concorrentes)
*   **Performance Brutal:** A stack Next.js 16 + React 19 garante que o app abra em menos de 0.8s no 4G de qualquer smartphone.
*   **Segurança e Privacidade:** O banco de dados do Renato ficará em uma instância exclusiva serverless do Firebase (não misturado com outros salões em bancos compartilhados).
*   **Fidelização Nativa:** Notificações Push nativas e cupons direcionados de reengajamento automatizados.
