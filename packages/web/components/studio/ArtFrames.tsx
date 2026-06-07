export const GITHUB_COLS = 99;
export const DISCORD_COLS = 66;

export function ArtFrames({ gridWidth }: { gridWidth: number }) {
  return (
    <>
      {/* Current editable range frame */}
      <div
        className="absolute top-0 left-0 bottom-0 border border-white/[0.15] pointer-events-none"
        style={{ width: `${gridWidth}ch` }}
      >
        {/* Width label — top-right inside frame */}
        <span
          className="absolute top-1 right-1 font-sans leading-none text-zinc-500/70 pointer-events-none whitespace-nowrap"
          style={{ fontSize: "9px" }}
        >
          {gridWidth}
        </span>
      </div>

      {/* Discord limit line */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{ left: `${DISCORD_COLS}ch`, borderLeft: "1px dashed rgba(167,139,250,0.45)" }}
      >
        <span
          className="absolute -top-5 font-sans leading-none text-purple-400/70 pointer-events-none whitespace-nowrap"
          style={{ fontSize: "9px", left: "3px" }}
        >
          Discord {DISCORD_COLS}
        </span>
      </div>

      {/* GitHub limit line */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{ left: `${GITHUB_COLS}ch`, borderLeft: "1px dashed rgba(96,165,250,0.45)" }}
      >
        <span
          className="absolute -top-5 font-sans leading-none text-blue-400/70 pointer-events-none whitespace-nowrap"
          style={{ fontSize: "9px", left: "3px" }}
        >
          GitHub {GITHUB_COLS}
        </span>
      </div>
    </>
  );
}
