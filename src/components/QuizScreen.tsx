import { useEffect, useState } from "react";
import { QUESTION_TIME, type Category } from "../data/questions";
import type { PreparedQuestion, RowResult } from "../types";
import Stamp from "./Stamp";
import { IconArrow, IconBolt, IconCheck, IconClock, IconCross } from "./Icons";

const LETTERS = ["А", "Б", "В", "Г"];
const pad = (n: number) => String(n).padStart(2, "0");

export default function QuizScreen({
  category,
  questions,
  onFinish,
  onExit,
}: {
  category: Category;
  questions: PreparedQuestion[];
  onFinish: (rows: RowResult[]) => void;
  onExit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<"answer" | "feedback">("answer");
  const [chosen, setChosen] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [rows, setRows] = useState<RowResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);

  const total = questions.length;
  const q = questions[index];
  const score = rows.filter((r) => r.correct).length;
  let streak = 0;
  for (let i = rows.length - 1; i >= 0 && rows[i].correct; i--) streak++;

  function pick(optionIdx: number | null, timeout = false) {
    if (stage !== "answer") return;
    const correct = optionIdx !== null && optionIdx === q.correct;
    const row: RowResult = {
      question: q.question,
      options: q.options,
      chosen: optionIdx,
      correctIndex: q.correct,
      correct,
      timedOut: timeout,
      time: +(QUESTION_TIME - timeLeft).toFixed(1),
    };
    setRows((prev) => [...prev, row]);
    setChosen(optionIdx);
    setTimedOut(timeout);
    setStage("feedback");
  }

  function next() {
    if (stage !== "feedback") return;
    if (index + 1 >= total) {
      onFinish(rows);
      return;
    }
    setIndex((i) => i + 1);
    setStage("answer");
    setChosen(null);
    setTimedOut(false);
    setTimeLeft(QUESTION_TIME);
  }

  /* тик таймера */
  useEffect(() => {
    if (stage !== "answer") return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, +(t - 0.1).toFixed(2))), 100);
    return () => clearInterval(id);
  }, [stage, index]);

  /* время вышло */
  useEffect(() => {
    if (stage === "answer" && timeLeft <= 0) pick(null, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, stage]);

  /* клавиатура: 1–4 и Enter */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (stage === "answer") {
        const k = parseInt(e.key, 10);
        if (k >= 1 && k <= 4) pick(k - 1);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const seconds = Math.ceil(timeLeft);
  const pct = (timeLeft / QUESTION_TIME) * 100;
  const barColor = timeLeft > 10 ? "bg-cobalt" : timeLeft > 5 ? "bg-warn" : "bg-signal bar-danger";

  return (
    <div className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-16 pt-8 md:pt-10">
      {/* статусная строка */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <span className="border-2 border-ink bg-ink px-3 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.24em] text-paper">
          {category.title}
        </span>
        <span className="font-display text-sm font-bold tracking-[0.2em]">
          ВОПРОС <span className="text-signal">{pad(index + 1)}</span>
          <span className="text-ink-soft"> / {pad(total)}</span>
        </span>

        <div className="flex items-center gap-1.5" aria-hidden>
          {questions.map((_, i) => {
            const done = i < rows.length;
            const ok = done && rows[i].correct;
            return (
              <span
                key={i}
                className={`size-3.5 border-2 ${
                  done
                    ? ok
                      ? "border-pass bg-pass"
                      : "border-signal bg-signal"
                    : i === index
                      ? "blink border-ink bg-paper"
                      : "border-ink/25 bg-transparent"
                }`}
              />
            );
          })}
        </div>

        <span className="ml-auto flex items-center gap-2 font-display text-sm font-bold tracking-[0.2em]">
          СЧЁТ {pad(score)}
          {streak > 1 && (
            <span className="tick-pop flex items-center gap-1 border-2 border-ink bg-cobalt px-2 py-0.5 text-xs text-paper">
              <IconBolt size={12} /> ×{streak}
            </span>
          )}
        </span>

        <button
          onClick={onExit}
          className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-ink-soft transition-colors hover:text-signal"
        >
          выйти ×
        </button>
      </div>

      {/* таймер */}
      <div className="mt-5 flex items-center gap-4">
        <div className="h-3.5 flex-1 border-2 border-ink bg-paper p-[3px]">
          <div
            className={`h-full ${barColor} transition-[width] duration-100 ease-linear`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span
          className={`flex items-center gap-2 font-display text-sm font-bold tabular-nums ${
            timeLeft <= 5 && stage === "answer" ? "text-signal" : "text-ink"
          }`}
        >
          <IconClock size={16} className={timeLeft <= 5 && stage === "answer" ? "blink" : ""} />
          {pad(seconds)} с
        </span>
      </div>

      {/* карточка вопроса */}
      <div key={index} className="slide-q relative mt-6 overflow-hidden border-2 border-ink bg-paper p-6 shadow-hard-lg md:p-10">
        <span className="pointer-events-none absolute -bottom-6 right-2 select-none font-display text-[7rem] font-black leading-none text-ink/[0.06] md:text-[9rem]">
          {pad(index + 1)}
        </span>

        <p className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-ink-soft">
          Вопрос {pad(index + 1)} · тема «{category.title.toLowerCase()}»
        </p>
        <h2 className="mt-4 max-w-3xl font-display text-xl font-bold leading-snug md:text-[1.65rem]">
          {q.question}
        </h2>

        <div className="relative mt-8 grid gap-3.5 sm:grid-cols-2">
          {q.options.map((opt, i) => {
            const isFeedback = stage === "feedback";
            const isCorrect = i === q.correct;
            const isChosen = i === chosen;
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                disabled={isFeedback}
                className={`flex items-center gap-3.5 border-2 border-ink p-4 text-left transition-all duration-150 ${
                  !isFeedback
                    ? "cursor-pointer bg-paper shadow-hard-sm hover:-translate-y-1 hover:bg-paper-deep hover:shadow-hard active:translate-y-0.5 active:shadow-none"
                    : isCorrect
                      ? "border-pass bg-pass/10"
                      : isChosen
                        ? "border-signal bg-signal/10"
                        : "bg-paper opacity-40"
                }`}
              >
                <span
                  className={`grid size-9 shrink-0 place-items-center border-2 font-display text-sm font-bold ${
                    isFeedback && isCorrect
                      ? "border-pass bg-pass text-paper"
                      : isFeedback && isChosen
                        ? "border-signal bg-signal text-paper"
                        : "border-ink bg-paper"
                  }`}
                >
                  {LETTERS[i]}
                </span>
                <span className="flex-1 text-[15px] font-semibold leading-snug">{opt}</span>
                {isFeedback && isCorrect && <IconCheck size={20} className="shrink-0 text-pass" />}
                {isFeedback && isChosen && !isCorrect && <IconCross size={20} className="shrink-0 text-signal" />}
              </button>
            );
          })}
        </div>

        {/* обратная связь */}
        {stage === "feedback" && (
          <div aria-live="polite" className="rise mt-8 border-t-2 border-dashed border-ink/30 pt-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              {rows[rows.length - 1].correct ? (
                <Stamp tone="pass" className="shrink-0 bg-paper">Верно</Stamp>
              ) : timedOut ? (
                <Stamp tone="warn" className="shrink-0 bg-paper">Время вышло</Stamp>
              ) : (
                <Stamp tone="fail" className="shrink-0 bg-paper">Мимо</Stamp>
              )}
              <p className="max-w-xl text-[15px] leading-snug text-ink-soft">
                <b className="uppercase tracking-wider text-ink">Факт: </b>
                {q.fact}
              </p>
              <button
                onClick={next}
                autoFocus
                className="group flex shrink-0 items-center justify-center gap-2.5 border-2 border-ink bg-ink px-5 py-3 font-display text-sm font-bold uppercase tracking-[0.18em] text-paper shadow-hard-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-hard active:translate-y-0.5 active:shadow-none md:ml-auto"
              >
                {index + 1 >= total ? "Результаты" : "Дальше"}
                <IconArrow size={17} className="transition-transform duration-150 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
