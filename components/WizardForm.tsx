"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import ElbritLogo from "./ElbritLogo";
import { LuckyDrawEntry, SPECIALISATIONS } from "@/lib/types";

interface WizardFormProps {
  luckyNumber: number;
  onSuccess: (data: LuckyDrawEntry) => void;
  /** Called when the user backs out of the first step (returns to the picker). */
  onBack: () => void;
}

type Field = "name" | "email" | "phone" | "specialisation" | "city" | "clinic";

interface FieldDef {
  key: Field;
  label: string;
  type: "text" | "email" | "tel" | "select";
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel";
  validate: (v: string) => boolean;
  error: string;
}

const FIELDS: Record<Field, FieldDef> = {
  name: {
    key: "name",
    label: "Full name",
    type: "text",
    placeholder: "Dr. Ananya Sharma",
    autoComplete: "name",
    inputMode: "text",
    validate: (v) => v.trim().length > 1,
    error: "Please enter your name",
  },
  specialisation: {
    key: "specialisation",
    label: "Specialisation",
    type: "select",
    validate: (v) => v !== "",
    error: "Please select your specialisation",
  },
  email: {
    key: "email",
    label: "Email address (optional)",
    type: "email",
    placeholder: "you@clinic.com",
    autoComplete: "email",
    inputMode: "email",
    // optional: blank is fine, but if filled in it must be a valid address
    validate: (v) => v.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    error: "Please enter a valid email",
  },
  phone: {
    key: "phone",
    label: "Mobile number",
    type: "tel",
    placeholder: "+91 98765 43210",
    autoComplete: "tel",
    inputMode: "tel",
    validate: (v) => v.trim().replace(/\D/g, "").length >= 10,
    error: "Enter a valid 10-digit mobile",
  },
  city: {
    key: "city",
    label: "City",
    type: "text",
    placeholder: "Mumbai",
    autoComplete: "address-level2",
    validate: (v) => v.trim().length > 1,
    error: "Please enter your city",
  },
  clinic: {
    key: "clinic",
    label: "Clinic / hospital name",
    type: "text",
    placeholder: "City Care Clinic",
    validate: (v) => v.trim().length > 1,
    error: "Please enter your clinic name",
  },
};

const STEPS: { title: string; fields: Field[] }[] = [
  { title: "About you", fields: ["name", "specialisation"] },
  { title: "How we reach you", fields: ["email", "phone"] },
  { title: "Your practice", fields: ["city", "clinic"] },
];

const EMPTY: LuckyDrawEntry = {
  name: "",
  email: "",
  phone: "",
  specialisation: "",
  city: "",
  clinic: "",
  luckyNumber: 0,
};

export default function WizardForm({ luckyNumber, onSuccess, onBack }: WizardFormProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<LuckyDrawEntry>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const stepRef = useRef<HTMLDivElement>(null);
  const dir = useRef(1);

  const isLast = step === STEPS.length - 1;

  useGSAP(
    () => {
      if (!stepRef.current) return;
      gsap.fromTo(
        stepRef.current,
        { x: dir.current * 44, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: "power3.out" }
      );
      gsap.fromTo(
        stepRef.current.querySelectorAll(".fg"),
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, stagger: 0.08, delay: 0.1, ease: "power2.out" }
      );
    },
    { dependencies: [step], scope: stepRef }
  );

  function update(key: Field, value: string) {
    setData((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: false }));
  }

  function validateStep(): boolean {
    const fields = STEPS[step].fields;
    const next: Partial<Record<Field, boolean>> = {};
    let ok = true;
    for (const f of fields) {
      if (!FIELDS[f].validate(data[f] as string)) {
        next[f] = true;
        ok = false;
      }
    }
    setErrors((p) => ({ ...p, ...next }));
    if (!ok && stepRef.current) {
      gsap.fromTo(
        stepRef.current,
        { x: -7 },
        { x: 0, duration: 0.06, repeat: 5, yoyo: true, ease: "none" }
      );
    }
    return ok;
  }

  function next() {
    if (!validateStep()) return;
    dir.current = 1;
    setStep((s) => s + 1);
  }

  function back() {
    if (step === 0) {
      onBack();
      return;
    }
    dir.current = -1;
    setStep((s) => Math.max(0, s - 1));
  }

  async function submit() {
    if (!validateStep() || submitting) return;
    setSubmitting(true);
    setServerError("");
    const payload: LuckyDrawEntry = { ...data, luckyNumber };
    try {
      const res = await fetch("/api/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("save failed");
      onSuccess(payload);
    } catch {
      setServerError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="form-wrap">
      <div className="logo-row sm">
        <ElbritLogo height={30} />
      </div>

      <div className="num-badge">
        <div className="nbig">{luckyNumber}</div>
        <div className="ntext">
          <b>Your lucky number is locked in</b>
          Just a few quick details to enter the draw.
        </div>
      </div>

      <div className="wiz-progress" role="progressbar" aria-valuenow={step + 1} aria-valuemax={STEPS.length}>
        {STEPS.map((s, i) => (
          <div key={s.title} className={`wiz-seg ${i <= step ? "done" : ""}`} />
        ))}
      </div>
      <p className="wiz-step-meta">
        Step {step + 1} of {STEPS.length}
      </p>
      <h2 className="wiz-title">{STEPS[step].title}</h2>

      <div className="wiz-step" ref={stepRef} key={step}>
        {STEPS[step].fields.map((fk) => {
          const f = FIELDS[fk];
          const val = data[fk] as string;
          const bad = errors[fk];
          return (
            <div className="fg" key={fk}>
              <label className="fl" htmlFor={fk}>
                {f.label}
              </label>
              {f.type === "select" ? (
                <select
                  id={fk}
                  className={`fsel ${bad ? "invalid" : ""}`}
                  value={val}
                  onChange={(e) => update(fk, e.target.value)}
                >
                  <option value="">Select your specialisation</option>
                  {SPECIALISATIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={fk}
                  className={`fi ${bad ? "invalid" : ""}`}
                  type={f.type}
                  value={val}
                  placeholder={f.placeholder}
                  autoComplete={f.autoComplete}
                  inputMode={f.inputMode}
                  onChange={(e) => update(fk, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") (isLast ? submit() : next());
                  }}
                />
              )}
              {bad && <span className="ferr">{f.error}</span>}
            </div>
          );
        })}
      </div>

      {serverError && <p className="server-error">{serverError}</p>}

      <div className="wiz-nav">
        <button className="btn-ghost" onClick={back} type="button" disabled={submitting}>
          &larr; Back
        </button>
        {!isLast ? (
          <button className="btn-primary on grow" onClick={next} type="button">
            Continue &rarr;
          </button>
        ) : (
          <button className="btn-primary on grow" onClick={submit} type="button" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit my entry →"}
          </button>
        )}
      </div>
    </div>
  );
}
