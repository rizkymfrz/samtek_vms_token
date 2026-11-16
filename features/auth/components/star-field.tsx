const STAR_COUNT = 260;

const createStars = () => {
  let seed = 7;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  return Array.from({ length: STAR_COUNT }, () => {
    const size = next();
    return {
      x: next() * 100,
      y: next() * 100,
      radius: 0.5 + size * size * 1.1,
      opacity: 0.2 + next() * 0.6,
    };
  });
};

const STARS = createStars();

export const StarField = () => {
  return (
    <svg aria-hidden className="absolute inset-0 size-full">
      {STARS.map(({ x, y, radius, opacity }) => (
        <circle
          key={`${x}-${y}`}
          cx={`${x}%`}
          cy={`${y}%`}
          r={radius}
          className="fill-foreground"
          opacity={opacity}
        />
      ))}
    </svg>
  );
};
