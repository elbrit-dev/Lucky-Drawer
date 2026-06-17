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
 * Full-page confetti rain. Particles are spread across the entire width and
 * staggered above (and partway down) the viewport, then flutter down past the
 * bottom — so the whole page fills with confetti rather than bursting from a
 * single point. Appended to <body> (position:fixed) so it plays over whatever
 * screen is on top, including during a transition. Self-cleaning.
 *
 * @param count number of particles
 */
export function fireConfetti(count = 150) {
  if (typeof window === "undefined") return;
  const w = window.innerWidth;
  const h = window.innerHeight;

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    const round = i % 4 === 0;
    const sz = 6 + Math.random() * 8;
    el.style.cssText = `position:fixed;top:0;left:0;z-index:9999;pointer-events:none;will-change:transform;width:${sz}px;height:${
      round ? sz : sz * 0.55
    }px;background:${CONFETTI_COLORS[i % CONFETTI_COLORS.length]};border-radius:${
      round ? "50%" : "2px"
    };`;
    document.body.appendChild(el);

    // spread across the full width; start above the fold, fanned out vertically
    // so the page is filled from top to bottom almost immediately
    const startX = Math.random() * w;
    const startY = -0.1 * h - Math.random() * h * 0.55;
    const flutter = 24 + Math.random() * 46;
    const fall = 2.2 + Math.random() * 1.9;
    const delay = Math.random() * 0.5;

    gsap.set(el, {
      x: startX,
      y: startY,
      opacity: 1,
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.9,
    });
    // vertical fall + spin owns y/rotation and cleans the particle up
    gsap.to(el, {
      y: h + 60,
      rotation: `+=${Math.random() * 760 - 380}`,
      duration: fall,
      delay,
      ease: "none",
      onComplete: () => el.remove(),
    });
    // sole owner of x: gentle side-to-side flutter as it drifts down
    gsap.to(el, {
      x: startX + flutter,
      duration: 0.6 + Math.random() * 0.5,
      delay,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    // fade out near the end of the fall
    gsap.to(el, {
      opacity: 0,
      duration: 0.7,
      delay: delay + fall - 0.7,
      ease: "power1.in",
    });
  }
}
