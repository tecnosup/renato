"use client";

import { Suspense, useState, type FormEvent } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase";

function mapAuthError(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/invalid-email":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "E-mail ou senha incorretos.";
      case "auth/too-many-requests":
        return "Muitas tentativas. Aguarde um momento e tente novamente.";
      default:
        return "Não foi possível entrar. Tente novamente.";
    }
  }
  return "Não foi possível entrar. Tente novamente.";
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) {
        throw new Error("session-sync-failed");
      }

      const from = searchParams.get("from") || "/admin";
      window.location.href = from;
    } catch (err) {
      setError(mapAuthError(err));
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-sm rounded-3xl bg-white/3 backdrop-blur-2xl backdrop-saturate-100 border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_6px_rgba(0,0,0,0.1),0_8px_40px_rgba(0,0,0,0.45)] p-8"
    >
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-14 h-14 rounded-full bg-white/8 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] flex items-center justify-center overflow-hidden mb-4">
          <Image src="/logo-barbearia.png" alt="Barbearia Século XXI" width={56} height={56} className="w-full h-full object-cover" />
        </div>
        <h1 className="font-serif text-2xl font-semibold gradient-text">Século XXI</h1>
        <p className="text-sm text-slate-300 mt-1">Painel de gestão</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/3 backdrop-blur-md backdrop-saturate-100 border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] text-sm text-slate-100 placeholder:text-slate-400 outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/40 transition-colors disabled:opacity-50"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/3 backdrop-blur-md backdrop-saturate-100 border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] text-sm text-slate-100 placeholder:text-slate-400 outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/40 transition-colors disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-400 text-center success-pop">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 rounded-xl font-medium text-sm text-slate-950 bg-linear-to-br from-[#ece4cb] to-[#c2a35d] shadow-[0_4px_20px_rgba(194,163,93,0.35)] transition-all hover:shadow-[0_4px_28px_rgba(194,163,93,0.5)] disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="gold-spinner h-4 w-4" />
              <span>Entrando...</span>
            </>
          ) : (
            "Entrar"
          )}
        </button>
      </form>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
