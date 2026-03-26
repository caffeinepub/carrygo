import { Star } from "lucide-react";

export function StarRating({
  rating,
  max = 5,
}: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          // biome-ignore lint/suspicious/noArrayIndexKey: star position is stable
          key={i}
          size={14}
          className={
            i < Math.round(rating)
              ? "text-carry-gold fill-carry-gold"
              : "text-muted-foreground"
          }
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}
