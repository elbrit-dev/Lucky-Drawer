"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import ElbritLogo from "./ElbritLogo";
import { fireConfetti } from "@/lib/confetti";
import { LuckyDrawEntry } from "@/lib/types";

interface ThankYouProps {
  data: LuckyDrawEntry;
}

function firstName(full: string) {
  const parts = full.split(" ").filter((p) => !/^dr\.?$/i.test(p));
  return parts[0] || full.split(" ")[0] || "there";
}

export default function ThankYou({ data }: ThankYouProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".ty-ring-outer", { scale: 0, duration: 0.75, ease: "elastic.out(1,.45)", delay: 0.05 });
      gsap.from(".ty-reveal", {
        y: 18,
        opacity: 0,
        duration: 0.42,
        stagger: 0.13,
        delay: 0.5,
        ease: "power2.out",
      });

      fireConfetti();
    },
    { scope: root }
  );

  return (
    <div className="ty-wrap" ref={root}>
      <div className="logo-row sm ty-top">
        <ElbritLogo height={28} />
      </div>

      <div className="ty-ring-outer">
        <div className="tyr r1" />
        <div className="tyr r2" />
        <div className="tyr r3" />
        <div className="ty-inner">
          <div className="ty-num">{data.luckyNumber}</div>
        </div>
      </div>

      <p className="ty1 ty-reveal">Congratulations,</p>
      <p className="ty2 ty-reveal">{firstName(data.name)}</p>
      <p className="ty3 ty-reveal">
        Number <b>{data.luckyNumber}</b> is officially yours in the Elbrit Lucky Draw. If it turns out to be the
        most unique pick of all, you win the grand prize. Good luck!
      </p>

      <div className="ty-card ty-reveal">
        <div className="tc-row">
          <span className="tc-lb">Lucky number</span>
          <span className="tc-vl">{data.luckyNumber}</span>
        </div>
        <div className="tc-row">
          <span className="tc-lb">Specialisation</span>
          <span className="tc-vl">{data.specialisation}</span>
        </div>
        <div className="tc-row">
          <span className="tc-lb">City</span>
          <span className="tc-vl">{data.city}</span>
        </div>
        <div className="tc-row">
          <span className="tc-lb">Clinic</span>
          <span className="tc-vl">{data.clinic}</span>
        </div>
      </div>

      <p className="ty-footer ty-reveal">Results announced by Elbrit · Entry confirmed</p>
    </div>
  );
}
