"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mark } from "@/components/Shell";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (response.ok) {
      router.replace("/admin");
      router.refresh();
      return;
    }
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    setError(data?.error ?? "Gagal masuk.");
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-6xl items-center px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Mark />
          <span className="text-[15px] font-semibold leading-tight tracking-[-0.01em]">
            Peminatan Penempatan 2026
          </span>
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-5 pb-20">
        <form
          onSubmit={submit}
          className="w-full max-w-[380px] rounded-[14px] border border-line bg-surface px-6 py-7"
        >
          <h1 className="text-[20px] font-semibold leading-tight tracking-[-0.01em]">
            Rekap survei
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
            Masukkan kata sandi panitia untuk melihat respons yang masuk.
          </p>

          <label className="mt-6 block">
            <span className="block text-[13px] font-medium">Kata sandi</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Kata sandi panitia"
              autoFocus
              className="mt-1.5 w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-[15px] outline-none transition-colors placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
          </label>

          {error ? (
            <p role="alert" className="mt-3 text-[13px] leading-snug text-negative">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 h-10 w-full rounded-lg bg-accent text-sm font-semibold text-white transition-colors hover:bg-[#0d3557] disabled:opacity-50"
          >
            {loading ? "Memeriksa..." : "Masuk"}
          </button>

          <Link href="/"
            className="mt-4 block text-center text-[13px] font-medium text-muted hover:text-ink"
          >
            Kembali ke halaman survei
          </Link>
        </form>
      </div>
    </main>
  );
}
