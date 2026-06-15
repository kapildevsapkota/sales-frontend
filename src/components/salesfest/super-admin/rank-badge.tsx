interface RankBadgeProps {
  rank: number;
  size?: "sm" | "md";
}

export function RankBadge({ rank, size = "md" }: RankBadgeProps) {
  const sizeClass = size === "sm" ? "h-7 w-7 text-xs" : "h-8 w-8 text-sm";

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${sizeClass} ${
        rank === 1
          ? "bg-amber-400 text-white"
          : rank === 2
            ? "bg-slate-400 text-white"
            : rank === 3
              ? "bg-orange-400 text-white"
              : "bg-muted text-muted-foreground"
      }`}
    >
      {rank}
    </span>
  );
}
