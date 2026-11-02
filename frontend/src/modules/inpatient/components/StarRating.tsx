/* Stars sit on a shallow arc with the middle star largest, as in the Inpatient frame. */
const ARC = [
  { lift: 0, scale: 0.8 },
  { lift: 0.55, scale: 0.9 },
  { lift: 0.9, scale: 1.15 },
  { lift: 0.55, scale: 0.9 },
  { lift: 0, scale: 0.8 },
];

/** Figma 5-star arc; with no published score all stars stay grey (no implied rating). */
export function StarRating({ score }: { score: number | null }) {
  const filled = score === null ? 0 : Math.round(score);
  return (
    <div
      className="flex items-end gap-[0.35em]"
      role="img"
      aria-label={score === null ? "Satisfaction score unavailable" : `${score} out of 5 stars`}
    >
      {ARC.map((pos, i) => (
        <i
          key={i}
          className={`pi pi-star-fill ${i < filled ? "text-[var(--dash-gold)]" : "text-white/30"}`}
          style={{
            fontSize: `calc(var(--dash-fs-value) * ${pos.scale})`,
            transform: `translateY(-${pos.lift}em)`,
            filter: i < filled ? "drop-shadow(0 0 6px rgba(246,195,68,0.45))" : undefined,
          }}
          aria-hidden
        />
      ))}
    </div>
  );
}
