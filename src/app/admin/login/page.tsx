"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok) {
      router.replace(params.get("next") || "/admin");
      router.refresh();
    } else if (res.status === 501) {
      setError("Servidor sem palavra-passe configurada (ADMIN_PASSWORD_HASH).");
    } else {
      setError("Palavra-passe incorreta.");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--agency-bg)] px-4 text-[var(--agency-fg)]">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4">
        <h1 className="display text-3xl">Admin</h1>
        <input
          type="password"
          autoFocus
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Palavra-passe"
          className="w-full border border-[var(--agency-line)] bg-transparent px-3 py-2 outline-none focus:border-[var(--agency-fg)]"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="display w-full bg-[var(--agency-fg)] px-4 py-2 text-[var(--agency-bg)] disabled:opacity-50"
        >
          {busy ? "A entrar…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
