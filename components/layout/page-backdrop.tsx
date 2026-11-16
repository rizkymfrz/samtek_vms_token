const CELL = 32;
const TILE = 512;

const LIT_CELLS: [column: number, row: number, isStrong: boolean][] = [
  [2, 1, false],
  [3, 1, true],
  [3, 2, false],
  [9, 3, false],
  [10, 3, true],
  [10, 4, false],
  [14, 2, false],
  [5, 8, false],
  [6, 8, true],
  [6, 9, false],
  [12, 10, false],
  [13, 10, true],
  [2, 13, false],
  [3, 13, true],
  [9, 12, false],
  [10, 12, true],
  [10, 13, false],
  [14, 14, false],
];

const TRACES = [
  "M 96 160 H 160 V 224 H 256 V 192 H 320",
  "M 352 352 V 416 H 416 V 480 H 480",
  "M 32 352 H 96 V 288 H 160",
];

const NODES: [x: number, y: number][] = [
  [96, 160],
  [320, 192],
  [352, 352],
  [480, 480],
  [32, 352],
  [160, 288],
];

const TONES = {
  1: {
    grid: "stroke-foreground/2.5",
    strongCell: "fill-primary/2.5",
    softCell: "fill-primary/1",
    trace: "stroke-primary/6",
    node: "fill-primary/7.5",
  },
  4: {
    grid: "stroke-foreground/10",
    strongCell: "fill-primary/10",
    softCell: "fill-primary/4",
    trace: "stroke-primary/24",
    node: "fill-primary/30",
  },
} as const;

const glows = (intensity: number) =>
  [
    `radial-gradient(ellipse 60% 45% at 0% 0%, color-mix(in oklch, var(--primary) ${3.5 * intensity}%, transparent), transparent)`,
    `radial-gradient(ellipse 50% 40% at 100% 100%, color-mix(in oklch, var(--primary) ${3 * intensity}%, transparent), transparent)`,
    `radial-gradient(ellipse 35% 30% at 85% 30%, color-mix(in oklch, var(--chart-2) ${2 * intensity}%, transparent), transparent)`,
  ].join(", ");

export const PageBackdrop = ({
  intensity = 1,
}: {
  intensity?: keyof typeof TONES;
}) => {
  const tone = TONES[intensity];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <svg className="absolute inset-0 size-full">
        <defs>
          <pattern
            id="backdrop-grid"
            width={CELL}
            height={CELL}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M 0 0.5 H ${CELL} M 0.5 0 V ${CELL}`}
              fill="none"
              className={tone.grid}
            />
          </pattern>
          <pattern
            id="backdrop-tile"
            width={TILE}
            height={TILE}
            patternUnits="userSpaceOnUse"
          >
            {LIT_CELLS.map(([column, row, isStrong]) => (
              <rect
                key={`${column}-${row}`}
                x={column * CELL}
                y={row * CELL}
                width={CELL}
                height={CELL}
                className={isStrong ? tone.strongCell : tone.softCell}
              />
            ))}
            {TRACES.map((d) => (
              <path
                key={d}
                d={d}
                fill="none"
                strokeWidth={1.5}
                className={tone.trace}
              />
            ))}
            {NODES.map(([x, y]) => (
              <circle
                key={`${x}-${y}`}
                cx={x}
                cy={y}
                r={3}
                className={tone.node}
              />
            ))}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#backdrop-grid)" />
        <rect width="100%" height="100%" fill="url(#backdrop-tile)" />
      </svg>
      <div
        className="absolute inset-0"
        style={{ backgroundImage: glows(intensity) }}
      />
    </div>
  );
};
