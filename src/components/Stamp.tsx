import type { CSSProperties, ReactNode } from "react";

export type StampTone = "pass" | "fail" | "warn" | "info";

const tones: Record<StampTone, string> = {
  pass: "border-pass text-pass",
  fail: "border-signal text-signal",
  warn: "border-warn text-warn",
  info: "border-cobalt text-cobalt",
};

export default function Stamp({
  tone,
  children,
  rot = -6,
  className = "",
  delay = 0,
}: {
  tone: StampTone;
  children: ReactNode;
  rot?: number;
  className?: string;
  delay?: number;
}) {
  return (
    <span
      style={{ "--stamp-rot": `${rot}deg`, animationDelay: `${delay}ms` } as CSSProperties}
      className={`stamp-in inline-block border-[3px] px-3 py-1.5 font-display text-sm font-extrabold uppercase tracking-[0.22em] shadow-[inset_0_0_0_1.5px_transparent,0_0_0_1.5px] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
