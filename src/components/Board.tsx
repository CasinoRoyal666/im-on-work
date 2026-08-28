import { useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import type { Project, Status, Task } from "../types";
import { STATUS_LABEL, STATUS_ORDER } from "../types";
import { IArrowR, IChat, ICheck, ILayers, IPlus, IUndo } from "./Icons";

/* карточка подпрыгивает вверх и улетает вниз при завершении */
const cardVariants: Variants = {
  show: {
    y: 0,
    rotate: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.32, ease: [0.2, 1, 0.4, 1] },
  },
  fly: {
    y: [0, -90, 640],
    rotate: [0, -6, 14],
    scale: [1, 1.06, 0.82],
    opacity: [1, 1, 0],
    transition: { duration: 0.8, times: [0, 0.32, 1], ease: ["easeOut", "easeIn"] },
  },
};

const COLS: { s: Status; dot: string; empty: string }[] = [
  { s: "created", dot: "bg-mut/70", empty: "Новых задач нет" },
  { s: "progress", dot: "bg-accent", empty: "Ничего в работе" },
  { s: "completed", dot: "bg-ok", empty: "Завершённых пока нет" },
];

export default function Board({
  project,
  flyingTask,
  onAdd,
  onOpen,
  onAdvance,
  onComplete,
  onReopen,
}: {
  project: Project;
  flyingTask: string | null;
  onAdd: (title: string) => void;
  onOpen: (id: string) => void;
  onAdvance: (id: string) => void;
  onComplete: (id: string) => void;
  onReopen: (id: string) => void;
}) {
  const [title, setTitle] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = title.trim();
    if (!v) return;
    onAdd(v);
    setTitle("");
  };

  const open = project.tasks.filter((t) => t.status !== "completed").length;
  const done = project.tasks.length - open;

  return (
    <div className="space-y-5">
      {/* шапка проекта */}
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="size-3 shrink-0 rounded-[4px]" style={{ background: project.color }} />
            <h1 className="font-display truncate text-xl font-bold tracking-tight md:text-2xl">
              {project.name}
            </h1>
          </div>
          <p className="mt-1.5 text-xs text-mut">
            {open > 0 ? `${open} в деле` : "всё закрыто"} · {done} завершено
          </p>
        </div>

        <form
          onSubmit={submit}
          className="flex w-full items-center gap-2 rounded-lg border border-line bg-raise px-3 py-2.5 shadow-sm transition-colors focus-within:border-accent sm:w-72"
        >
          <IPlus size={15} className="shrink-0 text-accent" />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Новая задача… (Enter)"
            className="w-full bg-transparent text-sm outline-none placeholder:text-mut/70"
          />
        </form>
      </div>

      {/* три колонки статусов */}
      <div className="grid gap-4 md:grid-cols-3">
        {COLS.map(({ s, dot, empty }) => {
          const tasks = project.tasks.filter((t) => t.status === s);
          return (
            <section key={s} className="rounded-xl border border-line bg-surface/75 p-3">
              <header className="mb-2.5 flex items-center gap-2 px-1">
                <span className={`size-2 rounded-full ${dot}`} />
                <h3 className="text-xs font-bold uppercase tracking-[0.12em]">{STATUS_LABEL[s]}</h3>
                <span className="ml-auto rounded-full bg-line/60 px-2 py-0.5 text-[10px] font-bold text-mut">
                  {tasks.length}
                </span>
              </header>

              <div className="min-h-[110px] space-y-2.5">
                {tasks.length === 0 ? (
                  <div className="grid h-[110px] place-items-center rounded-lg border border-dashed border-line px-3 text-center text-xs text-mut/80">
                    {empty}
                  </div>
                ) : (
                  <AnimatePresence initial={false} mode="popLayout">
                    {tasks.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        flying={flyingTask === t.id}
                        onOpen={() => onOpen(t.id)}
                        onAdvance={() => onAdvance(t.id)}
                        onComplete={() => onComplete(t.id)}
                        onReopen={() => onReopen(t.id)}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- карточка задачи ---------------- */

function TaskCard({
  task: t,
  flying,
  onOpen,
  onAdvance,
  onComplete,
  onReopen,
}: {
  task: Task;
  flying: boolean;
  onOpen: () => void;
  onAdvance: () => void;
  onComplete: () => void;
  onReopen: () => void;
}) {
  const subDone = t.subtasks.filter((s) => s.done).length;
  const pct = t.subtasks.length ? Math.round((subDone / t.subtasks.length) * 100) : 0;
  const done = t.status === "completed";

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="show"
      animate={flying ? "fly" : "show"}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      whileHover={flying ? undefined : { y: -3 }}
      onClick={onOpen}
      className={`group cursor-pointer rounded-xl border bg-raise p-3.5 shadow-sm transition-[border-color,box-shadow] hover:shadow-lift ${
        done ? "border-line/70 opacity-80" : "border-line hover:border-ink/25"
      } ${flying ? "pointer-events-none z-30 relative" : ""}`}
    >
      <div className="flex items-start gap-2">
        <p
          className={`min-w-0 flex-1 text-sm font-semibold leading-snug ${
            done ? "text-mut line-through decoration-ok/60" : ""
          }`}
        >
          {t.title}
        </p>

        {t.status === "created" && (
          <Action title="Взять в работу" onClick={onAdvance} hover="hover:border-accent hover:bg-accent-soft hover:text-accent">
            <IArrowR size={13} />
          </Action>
        )}
        {t.status === "progress" && (
          <Action title="Завершить" onClick={onComplete} hover="hover:border-ok hover:bg-ok-soft hover:text-ok">
            <ICheck size={13} />
          </Action>
        )}
        {done && (
          <Action title="Вернуть в работу" onClick={onReopen} hover="hover:border-warn hover:bg-warn/10 hover:text-warn">
            <IUndo size={13} />
          </Action>
        )}
      </div>

      {(t.subtasks.length > 0 || t.comments.length > 0) && (
        <div className="mt-2.5 flex items-center gap-3 text-[11px] font-semibold text-mut">
          {t.subtasks.length > 0 && (
            <span className="flex items-center gap-1.5">
              <ILayers size={13} />
              {subDone}/{t.subtasks.length}
              <span className="h-1.5 w-14 overflow-hidden rounded-full bg-line">
                <span
                  className={`block h-full rounded-full transition-all duration-500 ${
                    pct === 100 ? "bg-ok" : "bg-accent"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </span>
            </span>
          )}
          {t.comments.length > 0 && (
            <span className="flex items-center gap-1">
              <IChat size={13} />
              {t.comments.length}
            </span>
          )}
          {done && (
            <span className="ml-auto flex items-center gap-1 text-ok">
              <ICheck size={12} /> готово
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

function Action({
  title,
  onClick,
  hover,
  children,
}: {
  title: string;
  onClick: () => void;
  hover: string;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`grid size-6 shrink-0 place-items-center rounded-md border border-line bg-surface text-mut transition-all ${hover}`}
    >
      {children}
    </button>
  );
}
