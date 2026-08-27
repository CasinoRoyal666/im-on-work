import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { QUESTIONS_PER_RUN } from "../data/questions";
import type { RowResult } from "../types";
import Stamp, { type StampTone } from "./Stamp";
import { IconCheck, IconClock, IconCross, IconFlag, IconRefresh } from "./Icons";

const fmtTime = (t: number) => `${t.toFixed(1).replace(".", ",")} с`;

function grade(pct: number): { label: string; tone: StampTone } {
  if (pct >= 85) return { label: "Отлично", tone: "pass" };
  if (pct >= 60) return { label: "Зачтено", tone: "info" };
  if (pct >= 40) return { label: "На грани", tone: "warn" };
  return { label: "Не зачтено", tone: "fail" };
}

export default function ResultScreen({
  rows,
  catTitle,
  isRecord,
  bestScore,
  onRetry,
  onChangeTheme,
}: {
  rows: RowResult[];
  catTitle: string;
  isRecord: boolean;
  bestScore: number;
  onRetry: () => void;
  onChangeTheme: () => void;
}) {
  const total = rows.length;
  const score = rows.filter((r) => r.correct).length;
  const wrong = total - score;
  const pct = Math.round((score / total) * 100);
  const avgTime = rows.reduce((s, r) => s + r.time, 0) / total;
  let bestStreak = 0;
  let run = 0;
  for (const r of rows) {
    run = r.correct ? run + 1 : 0;
    if (run > bestStreak) bestStreak = run;
  }
  const g = grade(pct);

  /* счётчик процентов */
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const dur = 950;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      setDisplay(Math.round(pct * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [pct]);

  /* конфетти за отличный результат */
  useEffect(() => {
    if (pct < 85) return;
    const colors = ["#d8362b", "#2b4bd7", "#17150f", "#f1efe8", "#1f7a45"];
    const t1 = setTimeout(
      () => confetti({ particleCount: 90, spread: 72, startVelocity: 40, origin: { x: 0.12, y: 0.65 }, colors, scalar: 0.95 }),
      350,
    );
    const t2 = setTimeout(
      () => confetti({ particleCount: 90, spread: 72, startVelocity: 40, origin: { x: 0.88, y: 0.65 }, colors, scalar: 0.95 }),
      700,
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pct]);

  return (
    <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 pt-10 md:pt-14">
      <div className="grid gap-12 lg:grid-cols-12">
        {/* ------- вердикт ------- */}
        <div className="lg:col-span-5">
          <div className="rise flex items-center gap-3">
            <span className="font-display text-xs font-bold text-signal">03</span>
            <span className="font-display text-xs font-bold uppercase tracking-[0.28em]">Вердикт</span>
            <span className="h-0.5 flex-1 bg-ink/20" />
          </div>

          <div className="relative mt-6">
            <p className="font-display font-black leading-none tracking-tight">
              <span className="block text-[clamp(4.5rem,11vw,7.5rem)] tabular-nums">{display}</span>
              <span className="text-outline block text-[clamp(2rem,4.5vw,3rem)]">процентов</span>
            </p>
            <Stamp tone={g.tone} rot={-8} delay={420} className="absolute -right-1 top-1 bg-paper text-base md:right-2">
              {g.label}
            </Stamp>
          </div>

          <p className="mt-5 text-[15px] text-ink-soft">
            <b className="text-ink">{score} из {total}</b> · тема «{catTitle.toLowerCase()}»
            {isRecord ? (
              <span className="blink ml-3 inline-block border-2 border-ink bg-signal px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-paper">
                Новый рекорд
              </span>
            ) : (
              <span className="ml-3 text-xs uppercase tracking-[0.14em]">рекорд темы: {bestScore}/{QUESTIONS_PER_RUN}</span>
            )}
          </p>

          <div className="rise mt-8 grid grid-cols-2 gap-3" style={{ animationDelay: "180ms" }}>
            <StatCell value={String(score)} label="верно" accent="text-pass" />
            <StatCell value={String(wrong)} label="ошибки" accent={wrong > 0 ? "text-signal" : "text-ink"} />
            <StatCell value={fmtTime(avgTime)} label="среднее время" accent="text-cobalt" />
            <StatCell value={`×${bestStreak}`} label="лучшая серия" accent="text-ink" />
          </div>

          <div className="rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "260ms" }}>
            <button
              onClick={onRetry}
              className="group flex items-center gap-2.5 border-2 border-ink bg-signal px-5 py-3.5 font-display text-sm font-extrabold uppercase tracking-[0.16em] text-paper shadow-hard transition-all duration-150 hover:-translate-y-1 hover:bg-signal-deep hover:shadow-hard-lg active:translate-y-1 active:shadow-none"
            >
              <IconRefresh size={17} className="transition-transform duration-300 group-hover:rotate-180" />
              Ещё раз
            </button>
            <button
              onClick={onChangeTheme}
              className="flex items-center gap-2.5 border-2 border-ink bg-paper px-5 py-3.5 font-display text-sm font-bold uppercase tracking-[0.16em] shadow-hard-sm transition-all duration-150 hover:-translate-y-1 hover:bg-paper-deep hover:shadow-hard active:translate-y-1 active:shadow-none"
            >
              <IconFlag size={17} />
              Сменить тему
            </button>
          </div>
        </div>

        {/* ------- разбор ------- */}
        <div className="lg:col-span-7">
          <div className="rise flex items-center gap-3" style={{ animationDelay: "120ms" }}>
            <span className="font-display text-xs font-bold text-signal">04</span>
            <span className="font-display text-xs font-bold uppercase tracking-[0.28em]">Разбор полётов</span>
            <span className="h-0.5 flex-1 bg-ink/20" />
          </div>

          <ul className="thin-scroll mt-5 max-h-[560px] space-y-3 overflow-y-auto pr-1">
            {rows.map((r, i) => (
              <li
                key={i}
                className="rise flex items-start gap-4 border-2 border-ink bg-paper p-4 shadow-hard-sm transition-transform duration-150 hover:-translate-y-0.5"
                style={{ animationDelay: `${200 + i * 70}ms` }}
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center border-2 ${
                    r.correct
                      ? "border-pass bg-pass/10 text-pass"
                      : r.timedOut
                        ? "border-warn bg-warn/10 text-warn"
                        : "border-signal bg-signal/10 text-signal"
                  }`}
                >
                  {r.correct ? <IconCheck size={19} /> : r.timedOut ? <IconClock size={19} /> : <IconCross size={19} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold leading-snug">
                    <span className="mr-2 font-display text-xs text-ink-soft">{String(i + 1).padStart(2, "0")}</span>
                    {r.question}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">
                    Ваш ответ: <b className={r.correct ? "text-pass" : "text-signal"}>{r.chosen != null ? r.options[r.chosen] : "—"}</b>
                    {!r.correct && (
                      <>
                        {" · верно: "}
                        <b className="text-pass">{r.options[r.correctIndex]}</b>
                      </>
                    )}
                  </p>
                </div>
                <span className="shrink-0 font-display text-xs font-bold tabular-nums text-ink-soft">{fmtTime(r.time)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCell({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <div className="border-2 border-ink bg-paper p-4 shadow-hard-sm">
      <p className={`font-display text-2xl font-black tabular-nums ${accent}`}>{value}</p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft">{label}</p>
    </div>
  );
}
