import { useState } from "react";
import { CATEGORIES, type CategoryId } from "./data/questions";
import type { PreparedQuestion, RowResult } from "./types";
import Backdrop from "./components/Backdrop";
import Ticker from "./components/Ticker";
import StartScreen from "./components/StartScreen";
import QuizScreen from "./components/QuizScreen";
import ResultScreen from "./components/ResultScreen";
import { IconStar } from "./components/Icons";

const BEST_KEY = "testlab:best:v1";

type Phase = "start" | "quiz" | "result";

const TICKER_ITEMS = [
  "Наука",
  "История",
  "Логика",
  "20 секунд на вопрос",
  "8 вопросов в подходе",
  "Без права возврата",
  "+1 за верный ответ",
  "Тест·Лаб",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRun(catId: CategoryId): PreparedQuestion[] {
  const cat = CATEGORIES.find((c) => c.id === catId)!;
  return shuffle(cat.questions).map((q) => {
    const opts = shuffle(q.options.map((text, i) => ({ text, isCorrect: i === q.answer })));
    return {
      question: q.q,
      options: opts.map((o) => o.text),
      correct: opts.findIndex((o) => o.isCorrect),
      fact: q.fact,
    };
  });
}

function loadBest(): Partial<Record<CategoryId, number>> {
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY) || "{}");
  } catch {
    return {};
  }
}

export default function App() {
  const [phase, setPhase] = useState<Phase>("start");
  const [catId, setCatId] = useState<CategoryId>("science");
  const [prepared, setPrepared] = useState<PreparedQuestion[]>([]);
  const [rows, setRows] = useState<RowResult[]>([]);
  const [isRecord, setIsRecord] = useState(false);
  const [best, setBest] = useState<Partial<Record<CategoryId, number>>>(loadBest);

  const category = CATEGORIES.find((c) => c.id === catId)!;

  function start(id: CategoryId) {
    setCatId(id);
    setPrepared(buildRun(id));
    setRows([]);
    setIsRecord(false);
    setPhase("quiz");
    window.scrollTo({ top: 0 });
  }

  function finish(finishedRows: RowResult[]) {
    setRows(finishedRows);
    const score = finishedRows.filter((r) => r.correct).length;
    const prev = best[catId];
    if (prev != null && score > prev) {
      setIsRecord(true);
    } else {
      setIsRecord(false);
    }
    if (prev == null || score > prev) {
      const next = { ...best, [catId]: score };
      setBest(next);
      try {
        localStorage.setItem(BEST_KEY, JSON.stringify(next));
      } catch {
        /* приватный режим — не страшно */
      }
    }
    setPhase("result");
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <Backdrop />

      {/* шапка */}
      <header className="sticky top-0 z-30 border-b-2 border-ink bg-paper">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
          <button
            onClick={() => phase !== "quiz" && setPhase("start")}
            className={`flex items-center gap-2.5 font-display text-lg font-extrabold tracking-[0.12em] ${
              phase === "quiz" ? "cursor-default" : "transition-transform hover:-translate-y-0.5"
            }`}
            aria-label="На главный экран"
          >
            <span className="grid size-6 place-items-center border-2 border-ink bg-signal">
              <span className="size-2 bg-paper" />
            </span>
            ТЕСТ·ЛАБ
          </button>

          <p className="hidden text-xs uppercase tracking-[0.3em] text-ink-soft md:block">
            интерактивная проверка знаний
          </p>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 border-2 border-ink bg-paper px-2.5 py-1 font-display text-[11px] font-bold tracking-[0.14em]">
              <IconStar size={13} className="text-warn" />
              {best[catId] != null ? `${best[catId]}/8` : "—/8"}
            </span>
            <span className="hidden border-2 border-ink bg-ink px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-paper sm:block">
              пр. 07
            </span>
          </div>
        </div>
      </header>

      <Ticker items={TICKER_ITEMS} />

      <main className="relative z-10 flex-1">
        {phase === "start" && <StartScreen best={best} onStart={start} />}
        {phase === "quiz" && (
          <QuizScreen
            category={category}
            questions={prepared}
            onFinish={finish}
            onExit={() => setPhase("start")}
          />
        )}
        {phase === "result" && (
          <ResultScreen
            rows={rows}
            catTitle={category.title}
            isRecord={isRecord}
            bestScore={best[catId] ?? rows.filter((r) => r.correct).length}
            onRetry={() => start(catId)}
            onChangeTheme={() => {
              setPhase("start");
              window.scrollTo({ top: 0 });
            }}
          />
        )}
      </main>

      {/* подвал */}
      <footer className="relative z-10 border-t-2 border-ink bg-paper">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-soft">
          <span>Тест·Лаб — тренажёр извилин</span>
          <span>24 вопроса · 3 темы · 20 секунд на ход</span>
          <span>© 2026 · сделано без шпаргалок</span>
        </div>
      </footer>
    </div>
  );
}
