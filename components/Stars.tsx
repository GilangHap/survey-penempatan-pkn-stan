"use client";

type Props = {
  value: number;
  onChange: (value: number) => void;
};

const LABELS = ["Tidak membantu", "", "Cukup", "", "Sangat membantu"];

export default function Stars({ value, onChange }: Props) {
  return (
    <div>
      <div className="flex items-center gap-2" role="radiogroup" aria-label="Rating bintang 1 sampai 5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} bintang`}
            onClick={() => onChange(star)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
              star <= value
                ? "text-star hover:bg-star/10"
                : "text-line-strong hover:bg-ground hover:text-muted"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
              <path
                d="M12 3.6l2.4 5.2 5.6.7-4.1 3.9 1.1 5.6L12 16.3 6.9 19l1.1-5.6L4 9.5l5.6-.7z"
                fill={star <= value ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ))}
      </div>
      <div className="mt-1 flex w-[216px] justify-between text-[11px] text-muted">
        <span>{LABELS[0]}</span>
        <span>{LABELS[4]}</span>
      </div>
      <p className="mt-2 text-[13px] text-muted">
        {value ? `Skor Anda: ${value} dari 5` : "Belum dipilih"}
      </p>
    </div>
  );
}
