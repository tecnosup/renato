"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onIdTokenChanged, signOut, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { subscribeToOwnerBarber } from "@/lib/employees";
import type { Permissions } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** Permissoes do usuario (custom claims). undefined = owner raiz (ve tudo). */
  perms: Permissions | undefined;
  role: string | undefined;
  /** uid do barbeiro (claim barberId) — usado para escopo de dados (agenda dele). */
  barberId: string | undefined;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  perms: undefined,
  role: undefined,
  barberId: undefined,
  logout: async () => {},
});

async function syncSessionCookie(user: User | null) {
  if (user) {
    const idToken = await user.getIdToken();
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
  } else {
    await fetch("/api/auth/session", { method: "DELETE" });
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [perms, setPerms] = useState<Permissions | undefined>(undefined);
  const [role, setRole] = useState<string | undefined>(undefined);
  const [barberId, setBarberId] = useState<string | undefined>(undefined);
  // barberId do PROPRIETÁRIO que também atende: o owner loga sem claims, então
  // o barberId dele não vem no token — vem do doc-espelho `isOwner` (ver
  // upsertOwnerBarber/docs rbac). Só usado quando perms é undefined (owner-raiz).
  const [ownerBarberId, setOwnerBarberId] = useState<string | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    return onIdTokenChanged(auth, async (firebaseUser) => {
      await syncSessionCookie(firebaseUser);
      setUser(firebaseUser);

      // Le os custom claims (role/perms) do token. Owner raiz nao tem -> undefined.
      if (firebaseUser) {
        const res = await firebaseUser.getIdTokenResult();
        setRole(typeof res.claims.role === "string" ? res.claims.role : undefined);
        setBarberId(typeof res.claims.barberId === "string" ? res.claims.barberId : undefined);
        setPerms(
          res.claims.perms && typeof res.claims.perms === "object"
            ? (res.claims.perms as Permissions)
            : undefined
        );
      } else {
        setRole(undefined);
        setBarberId(undefined);
        setPerms(undefined);
      }

      setLoading(false);
    });
  }, []);

  // Permissões ao vivo: ouve o doc do funcionário (barbers/{barberId}). Quando o
  // dono/gerente altera as perms (rota users/update grava no doc E nos claims),
  // forçamos o refresh do token — o onIdTokenChanged acima recarrega os claims
  // novos e re-sincroniza a sessão, sem precisar relogar. Ignora o snapshot
  // inicial (só reage a mudanças reais).
  useEffect(() => {
    if (!user || !barberId) return;
    let primeiro = true;
    return onSnapshot(doc(db, "barbers", barberId), () => {
      if (primeiro) { primeiro = false; return; }
      user.getIdToken(true).catch(() => {});
    });
  }, [user, barberId]);

  // Owner-raiz (logado sem claims de perms): resolve o barberId pelo doc-espelho
  // `isOwner`, se ele optou por atender como barbeiro (doc ativo). Para funcionário
  // comum, perms vem definido e o barberId já chega no token — não escuta nada.
  const isOwnerRoot = !!user && perms === undefined;
  useEffect(() => {
    // Só o owner-raiz escuta o doc-espelho; funcionário comum nem assina (cleanup
    // do efeito anterior desfaz a assinatura). ownerBarberId fica obsoleto quando
    // não-owner, mas é ignorado no cálculo do barberId efetivo abaixo.
    if (!isOwnerRoot) return;
    return subscribeToOwnerBarber((ownerDoc) => {
      setOwnerBarberId(ownerDoc && ownerDoc.active ? ownerDoc.id : undefined);
    });
  }, [isOwnerRoot]);

  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // barberId efetivo: claim do funcionário, ou (só para o owner) o doc-espelho.
  const effectiveBarberId = barberId ?? (isOwnerRoot ? ownerBarberId : undefined);

  return (
    <AuthContext.Provider value={{ user, loading, perms, role, barberId: effectiveBarberId, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
