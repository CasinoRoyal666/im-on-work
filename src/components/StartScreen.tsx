import { useState } from "react";
import { CATEGORIES, QUESTIONS_PER_RUN, type CategoryId } from "../data/questions";
import Stamp from "./Stamp";
import { IconAsterisk, IconArrow, IconCheck, IconClock, IconNoReturn, IconStar, IconTarget } from "./Icons";

const RULES = [
  { icon: IconClock, text: `${QUESTIONS_PER_RUN} вопросов, по 20 секунд на каждый. Таймер не ждёт.` },
  { icon: IconTarget, text: "4 варианта, верный — один. Угадывать не запрещено, но совестно." },
  { icon: IconNoReturn, text: "Назад вернуться нельзя. Как на настоящем экзамене." },
  { icon: IconStar, text: "+1 балл за верный ответ. 85% и выше — оценка «отлично»." },
];

export default function StartScreen({
  best,
  onStart,
}: {
  best: Partial<Record<CategoryId, number>>;
  onStart: (id: CategoryId) => void;
}) {
  const [selected, setSelected] = useState<CategoryId>("science");

  return (
    <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 pt-10 md:pt-16">
      <div className="grid gap-12 lg:grid-cols-12">
        {/* ------- левая колонка ------- */}
        <div className="lg:col-span-7">
          <p className="rise flex items-center gap-2.5 font-display text-[11px] font-bold uppercase tracking-[0.32em] text-ink-soft">
            <span className="inline-block size-3 bg-signal" />
            Лаборатория знаний · протокол № 7
          </p>

          <h1 className="mt-6 font-display font-black leading-[0.92] tracking-tight">
            <span className="rise block text-[clamp(4rem,11vw,8.5rem)]" style={{ animationDelay: "60ms" }}>
              ТЕСТ<span className="text-signal">.</span>
              <IconAsterisk size={40} className="spin-slow mb-4 ml-4 inline-block text-cobalt max-md:size-6" />
            </span>
            <span className="rise text-outline block text-[clamp(2.6rem,7vw,5.2rem)]" style={{ animationDelay: "140ms" }}>
              НА ЗНАНИЕ
            </span>
          </h1>

          <p className="rise mt-6 max-w-md text-[17px] leading-relaxed text-ink-soft" style={{ animationDelay: "200ms" }}>
            Короткая, но честная проверка того, что осталось в голове после школы.
            Выбери тему, дождись сигнала — и отвечай, пока не сгорел таймер.
          </p>

          {/* выбор темы */}
          <div className="rise mt-10" style={{ animationDelay: "260ms" }}>
            <SectionLabel num="01" text="Выбери тему" />
            <div className="mt-5 space-y-3">
              {CATEGORIES.map((cat) => {
                const active = cat.id === selected;
                const record = best[cat.id];
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelected(cat.id)}
                    aria-pressed={active}
                    className={`group flex w-full items-center gap-4 border-2 border-ink p-4 text-left transition-all duration-150 md:gap-5 ${
                      active
                        ? "border-l-8 border-l-signal bg-ink text-paper shadow-hard"
                        : "bg-paper shadow-hard-sm hover:-translate-y-1 hover:bg-paper-deep hover:shadow-hard"
                    }`}
                  >
                    <span
                      className={`font-display text-2xl font-black md:text-3xl ${active ? "text-signal" : "text-ink/25 group-hover:text-signal"}`}
                    >
                      {cat.num}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-3">
                        <span className="font-display text-lg font-bold tracking-wide md:text-xl">{cat.title}</span>
                        <span className={`text-xs uppercase tracking-[0.18em] ${active ? "text-paper/60" : "text-ink-soft"}`}>
                          {cat.tagline}
                        </span>
                      </span>
                      <span className={`mt-1 block text-sm ${active ? "text-paper/70" : "text-ink-soft"}`}>
                        {QUESTIONS_PER_RUN} вопросов · сложность: <b>{cat.difficulty}</b>
                        {record != null && (
                          <>
                            {" "}· рекорд <b className={active ? "text-paper" : "text-cobalt"}>{record}/{QUESTIONS_PER_RUN}</b>
                          </>
                        )}
                      </span>
                    </span>
                    <span
                      className={`grid size-7 shrink-0 place-items-center border-2 transition-colors ${
                        active ? "border-signal bg-signal text-paper" : "border-ink bg-paper text-transparent group-hover:border-cobalt"
                      }`}
                    >
                      <IconCheck size={15} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ------- правая колонка: регламент ------- */}
        <div className="lg:col-span-5">
          <div className="rise lg:sticky lg:top-24" style={{ animationDelay: "320ms" }}>
            <SectionLabel num="02" text="Регламент" />
            <div className="relative mt-5 border-2 border-ink bg-paper p-6 shadow-hard-lg md:p-7">
              <Stamp tone="info" rot={7} className="absolute -right-3 -top-4 bg-paper text-xs">
                допущен
              </Stamp>

              <ul className="space-y-4">
                {RULES.map(({ icon: Icon, text }, i) => (
                  <li key={i} className="flex items-start gap-3.5">
                    <span className="mt-0.5 grid size-9 shrink-0 place-items-center border-2 border-ink bg-paper-deep text-ink">
                      <Icon size={17} />
                    </span>
                    <p className="text-[15px] leading-snug">{text}</p>
                  </li>
                ))}
              </ul>

              <div className="stripes mt-6 h-2 opacity-20" />

              <button
                onClick={() => onStart(selected)}
                className="group mt-6 flex w-full items-center justify-center gap-3 border-2 border-ink bg-signal px-6 py-4 font-display text-base font-extrabold uppercase tracking-[0.18em] text-paper shadow-hard transition-all duration-150 hover:-translate-y-1 hover:bg-signal-deep hover:shadow-hard-lg active:translate-y-1 active:shadow-none"
              >
                Начать тест
                <IconArrow size={20} className="transition-transform duration-150 group-hover:translate-x-1" />
              </button>

              <p className="mt-4 text-center text-xs uppercase tracking-[0.18em] text-ink-soft">
                клавиши <b className="text-ink">1–4</b> — ответ · <b className="text-ink">Enter</b> — дальше
              </p>
            </div>

            <p className="mt-5 text-sm text-ink-soft">
              Всего в базе <b className="text-ink">24 вопроса</b> в трёх темах. Порядок вопросов и
              вариантов перемешивается при каждой попытке.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ num, text }: { num: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-display text-xs font-bold text-signal">{num}</span>
      <span className="font-display text-xs font-bold uppercase tracking-[0.28em]">{text}</span>
      <span className="h-0.5 flex-1 bg-ink/20" />
    </div>
  );
}
