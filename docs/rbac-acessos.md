# Sistema de Acessos e Permissões (RBAC granular)

> Status: **em construção** — Fase 0. Este doc é a fonte da verdade do épico de
> controle de acesso. Atualizar conforme as fases avançam.

## Objetivo

O proprietário (hoje o único login) pode criar acessos para funcionários
(barbeiros, recepcionistas) e controlar, **por funcionário**, o que cada um vê e
pode fazer no painel. Cada papel tem um conjunto de permissões _padrão_ (preset),
e o proprietário pode ajustar caso a caso.

## Cenários-alvo (do cliente)

- **Proprietário**: vê tudo. Único que cria/edita acessos e permissões.
- **Recepcionista**: vê a agenda de **todos** os barbeiros, opera o **caixa**,
  mas **não** vê o financeiro completo da barbearia.
- **Barbeiro**: vê só a **agenda dele**, o **financeiro/comissão dele**, e os
  cortes agendados **com ele**. Não vê caixa nem financeiro geral.

## Princípio de segurança

Permissão é verificada em **3 camadas** — nunca confiar só no front:

1. **UI** (esconder menu/itens) — conveniência, não segurança.
2. **Rotas** (`proxy.ts` + API routes) — barra navegação/escrita por papel.
3. **Firestore Security Rules** — a real barreira de dados. Um barbeiro só
   consegue LER `appointments` onde `barberId == o-uid-dele`, mesmo que burle o front.

## Modelo de permissões (granular com preset por papel)

```ts
type Role = "proprietario" | "recepcionista" | "barbeiro";

// Cada permissão é um booleano por funcionário.
interface Permissions {
  verAgendaPropria: boolean;     // a agenda só dele
  verAgendaTodos: boolean;       // agenda de todos os barbeiros
  verCaixa: boolean;             // abrir/fechar/ver caixa
  verFinanceiroProprio: boolean; // comissão dele
  verFinanceiroGeral: boolean;   // faturamento da barbearia inteira
  gerenciarFuncionarios: boolean;// criar/editar acessos (só proprietário)
  gerenciarCadastros: boolean;   // serviços, produtos, clientes, cupons
}
```

Presets aplicados ao escolher o papel (editáveis depois):

| Permissão | Proprietário | Recepcionista | Barbeiro |
|---|:---:|:---:|:---:|
| verAgendaPropria | ✓ | ✓ | ✓ |
| verAgendaTodos | ✓ | ✓ | ✗ |
| verCaixa | ✓ | ✓ | ✗ |
| verFinanceiroProprio | ✓ | ✗ | ✓ |
| verFinanceiroGeral | ✓ | ✗ | ✗ |
| gerenciarFuncionarios | ✓ | ✗ | ✗ |
| gerenciarCadastros | ✓ | ✓ | ✗ |

## Acesso é OPCIONAL

Cadastrar funcionário ≠ criar acesso. O barbeiro pode existir só para a agenda
(nome/telefone/cargo), sem login. O acesso (email + senha + permissões) é um
**segundo passo opcional**: no card do funcionário há a ação "Criar acesso".
Funcionário sem acesso = `authUid: null`, não aparece como login no sistema.

## Identidade: como o acesso é criado

Criar usuário pelo **client SDK** (`createUserWithEmailAndPassword`) desloga o
admin atual — comportamento conhecido e indesejado do Firebase. Portanto a criação
de acesso usa o **Firebase Admin SDK no servidor** (API route protegida).

Fluxo:
1. Proprietário preenche em Funcionários: nome, telefone, cargo, **email + senha
   inicial**, e os toggles de permissão.
2. Front chama `POST /api/admin/users/create` (rota protegida, só proprietário).
3. A API (Admin SDK):
   - cria o usuário no Firebase Auth (email/senha),
   - seta **custom claims**: `{ role, perms }` (ou `barberId`),
   - cria/atualiza o doc em `barbers/{uid}` com os dados + permissões.
4. O `uid` do Auth = id do doc do funcionário (vínculo 1:1).

## Proprietário (owner)

O proprietário é identificado pela env **`OWNER_EMAIL`** (não por "ausência de
claims", que é frágil). Regras:
- O email do owner **nunca** pode virar acesso de funcionário (a API `create`
  bloqueia) — senão rebaixaria o dono a barbeiro.
- Nas API routes, `canManage()` autoriza se `email == OWNER_EMAIL` OU
  `perms.gerenciarFuncionarios`.
- No client/proxy, owner = sem custom claims → `perms undefined` → vê tudo.
  (Como o owner nunca recebe claims, isso se mantém coerente.)

Owner real do projeto: **tecnosuporte012@gmail.com** (é com esse que se loga no
painel). O `vitornewof@gmail.com` é um email de teste para criar um FUNCIONÁRIO.

> Incidente 2026-06-16: por confusão de emails, o OWNER_EMAIL ficou errado e um
> acesso de barbeiro foi criado com o email do dono, rebaixando a conta.
> Corrigido: OWNER_EMAIL=tecnosuporte012, contas soltas limpas, trava adicionada
> para impedir criar funcionário com o email do owner.

## Custom claims (no token)

```jsonc
{ "role": "barbeiro", "barberId": "<ID do doc em barbers>", "perms": { ...Permissions } }
```

> **barberId = ID do doc** na coleção `barbers` (NÃO o uid do Auth). Esse é o
> mesmo id que os agendamentos gravam em `appointment.barberId`. Assim o escopo
> de dados (barbeiro vê só os agendamentos dele) bate. Funciona inclusive para
> barbeiro sem login (a landing marca pelo id do doc).

## Escopo de dados (Fase 2 — feito para agenda)

Rules de `appointments`: `read` permitido se `canSeeAllAgenda()` (owner sem claims
ou `perms.verAgendaTodos`) OU `ownsAppointment()` (`resource.data.barberId ==
request.auth.token.barberId`). Em queries (onSnapshot) o CLIENTE deve filtrar por
barberId — a regra avalia cada doc, então query sem filtro é negada (testado:
403). `update/delete` só `canSeeAllAgenda()`. Testado via REST com ID token real:
barbeiro lê só a agenda dele, query ampla = 403.

Claims entram no ID token → ficam disponíveis no `proxy.ts` (via `verifySessionToken`)
e nas **Security Rules** (`request.auth.token.role`, `request.auth.token.perms.xxx`).

## Fases

- **Fase 0 — Fundação** _(atual)_
  - `firebase-admin` + service account (env). API `/api/admin/users/create`.
  - Tipos `Role`/`Permissions`, presets. Vincular `barbers/{uid}` ao Auth.
- **Fase 1 — Papéis e rotas**
  - `verifySessionToken` lê claims. `proxy.ts` barra rotas por permissão.
  - Sidebar/menu filtram itens por `perms`.
- **Fase 2 — Escopo de dados**
  - Security Rules por papel/escopo. Queries filtradas (agenda/comissão do barbeiro).
- **Fase 3 — UI de gestão**
  - Tela de permissões por funcionário (toggles), com presets por papel.

## Ações do Vitor (fora do código)

- **Service account**: console Firebase → Configurações do projeto → Contas de
  serviço → Gerar nova chave privada (JSON). Guardar como env (NUNCA commitar):
  `FIREBASE_SERVICE_ACCOUNT` (JSON em uma linha) ou as 3 vars
  `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY`.
- **Rules**: publicar as novas regras quando a Fase 2 sair (ver [firestore-deploy](../firestore.rules)).

## Notas de arquitetura existente (já no projeto)

- Sessão = ID token Firebase em cookie `__session` (httpOnly, 1h), validado por
  JWKS com `jose` em `src/lib/auth-session.ts` (sem Admin SDK hoje).
- `src/proxy.ts` protege `/admin/*`, `/api/admin/*`, `/login` (matcher).
- Login em `src/app/login/page.tsx`. Provider client em
  `src/components/providers/AuthProvider.tsx`.
- Cadastro de funcionário atual: `src/app/admin/cadastros/funcionarios/page.tsx`
  + `src/lib/employees.ts` (coleção `barbers`). Será estendido com identidade/perms.
