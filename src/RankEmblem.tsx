export function RankEmblem({ tier = "UNRANKED" }: { tier?: string }) {
  return (
    <svg
      className="rank-emblem"
      viewBox="0 0 100 100"
      fill="none"
      aria-label={tier}
    >
      <path
        d="M9 30 29 38 36 19 50 10 64 19 71 38 91 30 80 57 66 67 50 91 34 67 20 57Z"
        fill="currentColor"
        opacity=".18"
      />
      <path
        d="m50 10 22 29-7 29-15 22-15-22-7-29Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="m50 24 13 19-5 20-8 12-8-12-5-20Z" fill="currentColor" />
      <path
        d="m29 38-20-8 11 27 14 10M71 38l20-8-11 27-14 10M22 44l10 7m46-7-10 7"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="m50 24 0 51 13-32Z" fill="white" opacity=".25" />
    </svg>
  );
}
