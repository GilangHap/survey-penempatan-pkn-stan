"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
};

export default function Select({ value, options, placeholder, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => Math.max(0, options.indexOf(value)));
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function choose(option: string) {
    onChange(option);
    setOpen(false);
  }

  function onKeyDownRoot(event: React.KeyboardEvent) {
    if (!open) {
      if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
        event.preventDefault();
        setActive(Math.max(0, options.indexOf(value)));
        setOpen(true);
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => Math.min(current + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(options[active]);
    }
  }

  return (
    <div ref={rootRef} className="relative" onKeyDown={onKeyDownRoot}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls="prodi-listbox"
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        className={`flex h-[46px] w-full items-center justify-between gap-3 rounded-lg border bg-surface px-3 text-left text-[15px] outline-none transition-colors ${
          open
            ? "border-accent ring-2 ring-accent/15"
            : "border-line-strong hover:border-muted/50"
        }`}
      >
        <span className={`truncate ${value ? "text-ink" : "text-faint"}`}>
          {value || placeholder}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <ul
          id="prodi-listbox"
          role="listbox"
          className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-[10px] border border-line bg-surface py-1 shadow-[0_12px_32px_rgba(23,26,30,0.14)]"
        >
          {options.map((option, index) => {
            const selected = option === value;
            return (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(option)}
                  className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-[14px] leading-snug transition-colors ${
                    index === active ? "bg-ground" : ""
                  } ${selected ? "font-medium text-accent" : "text-ink"}`}
                >
                  <span>{option}</span>
                  {selected ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 shrink-0"
                      aria-hidden="true"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
