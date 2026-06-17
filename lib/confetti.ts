import { gsap } from "gsap";

const CONFETTI_COLORS = [
  "#E1251B",
  "#FFD700",
  "#ffffff",
  "#1E2A5E",
  "#FF6666",
  "#FFE066",
  "#ff9999",
  "#c0c0c0",
];

/**
 * Fires a one-shot confetti burst from a screen point. Particles are appended
 * to <body> (position:fixed) so the burst plays over whatever screen is on top,
 * including during a screen transition. Self-cleaning — each particle removes
 * itself when its tween finishes.
 *
 * @param originX  burst origin X in px (defaults to horizontal centre)
 * @param originY  burst origin Y in px (defaults to ~30% down the viewport)
 * @param count    number of particles
 */
export function fireConfetti(originX?: number, originY?: number, count = 90) {
  if (typeof window === "undefined") return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const sx = originX ?? w * 0.5;
  const sy = originY ?? h * 0.3;

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    const sz = 5 + Math.random() * 7;
    el.style.cssText = `position:fixed;top:0;left:0;z-index:9999;pointer-events:none;width:${sz}px;height:${sz}px;background:${
      CONFETTI_COLORS[i % CONFETTI_COLORS.length]
    };border-radius:${i % 4 === 0 ? "50%" : "3px"};`;
    document.body.appendChild(el);

    const angle = Math.random() * Math.PI * 2;
    const dist = 70 + Math.random() * 240;
    gsap.set(el, {
      x: sx,
      y: sy,
      opacity: 1,
      rotation: Math.random() * 360,
      scale: 0.3 + Math.random() * 0.9,
    });
    gsap.to(el, {
      x: sx + Math.cos(angle) * dist,
      y: sy + Math.sin(angle) * dist + h * 0.32,
      rotation: Math.random() * 720 - 360,
      opacity: 0,
      duration: 0.9 + Math.random() * 0.9,
      delay: Math.random() * 0.35,
      ease: "power2.out",
      onComplete: () => el.remove(),
    });
  }
}
