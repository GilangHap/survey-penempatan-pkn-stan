"use client";

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export default function Stars({ value, onChange }: Props) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating bintang 1 sampai 5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} bintang`}
          onClick={() => onChange(star)}
          className={`text-3xl leading-none transition-transform hover:scale-110 ${
            star <= value ? "text-amber-400" : "text-slate-300"
          }`}
        >
          ★
        </button>
      ))}
      <span className="ml-2 self-center text-sm text-slate-500">
        {value ? `${value} / 5` : "Belum dipilih"}
      </span>
    </div>
  );
}
