"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import CellsBackground from "./CellsBackground";
import NumberPicker from "./NumberPicker";
import WizardForm from "./WizardForm";
import ThankYou from "./ThankYou";
import { LuckyDrawEntry } from "@/lib/types";

export default function LuckyDraw() {
  const [screen, setScreen] = useState(0);
  const [luckyNumber, setLuckyNumber] = useState(0);
  const [entry, setEntry] = useState<LuckyDrawEntry | null>(null);

  const screens = useRef<(HTMLElement | null)[]>([]);
  const mounted = useRef(false);

  useLayoutEffect(() => {
    screens.current.forEach((el, i) => {
      if (el) gsap.set(el, { xPercent: (i - screen) * 100 });
    });
    mounted.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (!mounted.current) return;
    screens.current.forEach((el, i) => {
      if (el) gsap.to(el, { xPercent: (i - screen) * 100, duration: 0.55, ease: "power3.inOut" });
    });
  }, [screen]);

  function handleLock(n: number) {
    setLuckyNumber(n);
    setScreen(1);
  }

  function handleSuccess(data: LuckyDrawEntry) {
    setEntry(data);
    setScreen(2);
  }

  return (
    <main className="stage">
      <CellsBackground />

      <section className="scr" ref={(el) => { screens.current[0] = el; }}>
        <NumberPicker onLock={handleLock} />
      </section>

      <section className="scr" ref={(el) => { screens.current[1] = el; }}>
        {screen >= 1 && (
          <WizardForm
            luckyNumber={luckyNumber}
            onSuccess={handleSuccess}
            onBack={() => setScreen(0)}
          />
        )}
      </section>

      <section className="scr" ref={(el) => { screens.current[2] = el; }}>
        {screen === 2 && entry && <ThankYou data={entry} />}
      </section>
    </main>
  );
}
