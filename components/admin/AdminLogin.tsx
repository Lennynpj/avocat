"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scale, Lock, ArrowRight } from "@/components/Icons";

export default function AdminLogin() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        router.push("/admin/calendrier");
        router.refresh();
      } else {
        setError(true);
        setLoading(false);
      }
    } catch {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-white">
            <Scale className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">Espace cabinet</h1>
          <p className="mt-1.5 text-sm text-ink-soft">Gestion de l&apos;agenda et des rendez-vous</p>
        </div>

        <form onSubmit={submit} className="mt-8 rounded-2xl bg-white p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.2)]">
          <label className="grid gap-2">
            <span className="text-sm font-medium">Mot de passe</span>
            <div className="flex items-center gap-2 rounded-xl border border-[#e5e5ea] bg-[#f7f7fa] px-3 focus-within:border-accent">
              <Lock className="h-4 w-4 text-ink-soft" />
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoFocus
                className="w-full bg-transparent py-3 text-base outline-none"
                placeholder="••••••••"
              />
            </div>
          </label>
          {error && <p className="mt-3 text-sm text-danger">Mot de passe incorrect.</p>}
          <button
            type="submit"
            disabled={loading || pw.length === 0}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-[#243556] disabled:opacity-50"
          >
            {loading ? "Connexion…" : "Se connecter"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-ink-soft">Accès réservé au cabinet.</p>
      </div>
    </main>
  );
}
