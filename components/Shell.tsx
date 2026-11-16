import Image from "next/image";
import type { ReactNode } from "react";

export function Mark({ className = "", size = 36 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/logo-kemenkeu.png"
      alt=""
      width={size}
      height={size}
      priority
      className={`shrink-0 ${className}`}
    />
  );
}

export default function Shell({
  right,
  children,
  width = "wide",
}: {
  right?: ReactNode;
  children: ReactNode;
  width?: "narrow" | "wide";
}) {
  const inner = width === "narrow" ? "max-w-[812px]" : "max-w-6xl";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-ground">
        <div className={`mx-auto flex h-16 w-full ${inner} items-center justify-between gap-4 px-5 sm:px-6`}>
          <div className="flex min-w-0 items-center gap-3">
            <Mark />
            <div className="min-w-0">
              <h1 className="truncate text-[15px] font-semibold leading-tight tracking-[-0.01em]">
                Peminatan Penempatan 2026
              </h1>
              <p className="truncate text-xs text-muted">
                PKN STAN · Kementerian Keuangan
              </p>
            </div>
          </div>
          {right}
        </div>
      </header>

      {children}

      <footer className="mt-auto border-t border-line">
        <div className={`mx-auto flex w-full ${inner} flex-col gap-1 px-5 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6`}>
          <p>Biro Sumber Daya Manusia · Sekretariat Jenderal Kementerian Keuangan</p>
          <p>Hasil survei tidak mengikat keputusan penempatan.</p>
        </div>
      </footer>
    </div>
  );
}
