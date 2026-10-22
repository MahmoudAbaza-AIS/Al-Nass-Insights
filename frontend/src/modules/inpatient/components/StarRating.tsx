export function StarRating({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-[var(--dash-label)]">Satisfaction unavailable</span>;
  }
  return (
    <div className="flex items-center gap-1" aria-label={`${score} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < Math.round(score) ? "text-[var(--dash-gold)]" : "text-white/20"}
          aria-hidden
        >
          ★
        </span>
      ))}
    </div>
  );
}
