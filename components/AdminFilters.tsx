"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PRODI } from "@/lib/survey";

export default function AdminFilters({ q, prodi }: { q: string; prodi: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(q);
  const mounted = useRef(false);

  useEffect(() => {
    // ponytail: sinkronisasi input pencarian dengan state URL saat navigasi
    // (reset filter, back/forward). Ganti ke searchParams-based form bila perlu.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(q);
  }, [q]);

  const push = useCallback(
    (nextQ: string, nextProdi: string) => {
      const params = new URLSearchParams();
      if (nextQ.trim()) params.set("q", nextQ.trim());
      if (nextProdi) params.set("prodi", nextProdi);
      const search = params.toString();
      router.push(search ? `/admin?${search}` : "/admin", { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const timer = setTimeout(() => push(query, prodi), 350);
    return () => clearTimeout(timer);
  }, [query, prodi, push]);

  const chip = (active: boolean) =>
    `h-8 whitespace-nowrap rounded-full border px-3.5 text-[13px] font-medium transition-colors ${
      active
        ? "border-accent/30 bg-accent-soft text-accent"
        : "border-line-strong bg-surface text-muted hover:bg-ground hover:text-ink"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="relative">
        <span className="sr-only">Cari nama atau NPM</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari nama atau NPM"
          className="h-9 w-full rounded-lg border border-line-strong bg-surface pl-9 pr-3 text-[14px] outline-none transition-colors placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/15 sm:w-[260px]"
        />
      </label>

      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter program studi">
        <button type="button" onClick={() => push(query, "")} className={chip(prodi === "")}>
          Semua prodi
        </button>
        {PRODI.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => push(query, prodi === item ? "" : item)}
            aria-pressed={prodi === item}
            className={chip(prodi === item)}
          >
            {item.replace("D-IV ", "")}
          </button>
        ))}
      </div>
    </div>
  );
}
