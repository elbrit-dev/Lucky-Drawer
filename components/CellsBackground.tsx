/** Aurora backdrop — warm-navy radial base, three slowly drifting red/blue/
 *  violet glow blobs, and a field of twinkling stars. Pure CSS, light on
 *  mobile. Star positions are deterministic so SSR and client markup match. */

const rng = (i: number, n: number) => {
  const x = Math.sin(i * 99.13 + n * 7.7) * 10000;
  return x - Math.floor(x);
};

const STARS = Array.from({ length: 34 }, (_, i) => {
  const red = rng(i, 7) > 0.66;
  const sz = +(1.5 + rng(i, 3) * 3).toFixed(2);
  return {
    left: (rng(i, 1) * 100).toFixed(2) + "%",
    top: (rng(i, 2) * 100).toFixed(2) + "%",
    sz,
    dur: (5 + rng(i, 4) * 7).toFixed(2),
    delay: (rng(i, 5) * 6).toFixed(2),
    op: +(0.2 + rng(i, 6) * 0.6).toFixed(2),
    color: red ? "#E11C24" : "#cfe0ff",
    glow: red ? "#E11C24" : "#9fc0ff",
  };
});

export default function CellsBackground() {
  return (
    <div className="bg" aria-hidden="true">
      <div className="aurora-blobs">
        <span className="blob blob-red" />
        <span className="blob blob-blue" />
        <span className="blob blob-violet" />
      </div>
      {STARS.map((s, i) => (
        <span
          key={i}
          className="star"
          style={{
            left: s.left,
            top: s.top,
            width: s.sz,
            height: s.sz,
            background: s.color,
            boxShadow: `0 0 ${s.sz * 3}px ${s.glow}`,
            opacity: s.op,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
