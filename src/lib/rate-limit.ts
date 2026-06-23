import "server-only";

/**
 * Rate limiting simples, in-memory, por chave (tipicamente IP + rota). Usado nas
 * rotas PÚBLICAS da landing (agendamento/consulta) para conter abuso casual:
 * enumeração de dados por telefone, spam de agendamentos e custo de leitura no
 * Firestore.
 *
 * LIMITAÇÃO CONHECIDA: o contador vive na memória da instância. Em serverless
 * (Vercel) cada instância tem o seu, então isto NÃO protege contra um ataque
 * distribuído — apenas mitiga abuso vindo de um mesmo cliente/instância. Para
 * proteção robusta, migrar para um store compartilhado (ex.: Upstash/Redis).
 */

interface Bucket {
  count: number;
  resetAt: number; // epoch ms em que a janela zera
}

const buckets = new Map<string, Bucket>();

// Limpeza preguiçosa: remove buckets vencidos a cada N acessos, para o Map não
// crescer indefinidamente sob tráfego variado de IPs.
let opsSinceSweep = 0;
const SWEEP_EVERY = 500;

function sweep(now: number) {
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  /** Segundos até a janela liberar (para o header Retry-After). */
  retryAfter: number;
}

/**
 * Consome 1 requisição para `key`. Permite até `limit` por janela de `windowMs`.
 * Retorna ok=false quando o limite estourou.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  if (++opsSinceSweep >= SWEEP_EVERY) {
    opsSinceSweep = 0;
    sweep(now);
  }

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { ok: true, remaining: limit - existing.count, retryAfter: 0 };
}

/** Extrai um identificador de cliente do request (IP via headers do proxy). */
export function clientKey(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  // x-forwarded-for pode ter vários IPs; o primeiro é o cliente original.
  const ip = xff?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  return ip;
}
