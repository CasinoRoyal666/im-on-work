import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import type { Status, Subtask, Task } from "../types";
import { STATUS_LABEL, STATUS_ORDER, fmtTime } from "../types";
import { IChat, ICheck, IChevronD, ILayers, IPlus, ITrash } from "./Icons";

/* подзадача подпрыгивает и улетает вниз при отметке */
const subVariants: Variants = {
  rest: { y: 0, rotate: 0, opacity: 1 },
  fly: {
    y: [0, -48, 300],
    rotate: [0, -5, 11],
    opacity: [1, 1, 0],
    transition: { duration: 0.62, times: [0, 0.3, 1], ease: ["easeOut", "easeIn"] },
  },
};

const ACTIVE_SEGMENT: Record<Status, string> = {
  created: "bg-ink text-bg",
  progress: "bg-accent text-on-accent",
  completed: "bg-ok text-white",
};

export default function TaskDrawer({
  task,
  onClose,
  onRename,
  onStatus,
  onAddSub,
  onToggleSub,
  onDeleteSub,
  onTaskComment,
  onSubComment,
  onDelete,
}: {
  task: Task;
  onClose: () => void;
  onRename: (title: string) => void;
  onStatus: (s: Status) => void;
  onAddSub: (title: string) => void;
  onToggleSub: (id: string) => void;
  onDeleteSub: (id: string) => void;
  onTaskComment: (text: string) => void;
  onSubComment: (subId: string, text: string) => void;
  onDelete: () => void;
}) {
  const [subInput, setSubInput] = useState("");
  const [comment, setComment] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [flyingSub, setFlyingSub] = useState<string | null>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => setArmed(false), [task.id]);

  const toggleSub = (sub: Subtask) => {
    if (!sub.done && flyingSub === null) {
      setFlyingSub(sub.id);
      window.setTimeout(() => {
        onToggleSub(sub.id);
        setFlyingSub(null);
      }, 580);
    } else if (sub.done) {
      onToggleSub(sub.id);
    }
  };

  const addSub = () => {
    const v = subInput.trim();
    if (!v) return;
    onAddSub(v);
    setSubInput("");
  };

  const addComment = () => {
    const v = comment.trim();
    if (!v) return;
    onTaskComment(v);
    setComment("");
  };

  const subDone = task.subtasks.filter((s) => s.done).length;
  const pct = task.subtasks.length ? Math.round((subDone / task.subtasks.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <motion.button
        aria-label="Закрыть"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 cursor-default bg-black/35"
      />

      <motion.aside
        initial={{ x: "104%" }}
        animate={{ x: 0 }}
        exit={{ x: "104%" }}
        transition={{ type: "tween", duration: 0.32, ease: [0.25, 1, 0.4, 1] }}
        className="relative flex h-full w-full max-w-[440px] flex-col border-l border-line bg-surface shadow-pop"
      >
        {/* заголовок */}
        <div className="border-b border-line p-4 md:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="grid grid-cols-3 gap-1 rounded-lg border border-line bg-raise p-1">
              {STATUS_ORDER.map((s) => (
                <button
                  key={s}
                  onClick={() => onStatus(s)}
                  className={`rounded-md px-2 py-1.5 text-[11px] font-bold transition-all ${
                    task.status === s ? ACTIVE_SEGMENT[s] : "text-mut hover:text-ink"
                  }`}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              title="Закрыть (Esc)"
              className="grid size-8 shrink-0 place-items-center rounded-lg border border-line text-mut transition-colors hover:border-ink/30 hover:text-ink"
            >
              <ICloseMini />
            </button>
          </div>

          <input
            value={task.title}
            onChange={(e) => onRename(e.target.value)}
            aria-label="Название задачи"
            className="w-full border-b-2 border-transparent bg-transparent text-lg font-bold outline-none transition-colors focus:border-accent"
          />
          <p className="mt-1.5 text-[11px] text-mut">создана {fmtTime(task.ts)}</p>
        </div>

        {/* содержимое */}
        <div className="flex-1 space-y-6 overflow-y-auto p-4 md:p-5">
          {/* подзадачи */}
          <section>
            <div className="mb-2.5 flex items-center gap-2">
              <ILayers size={14} className="text-accent" />
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-mut">
                Подзадачи
              </h3>
              {task.subtasks.length > 0 && (
                <>
                  <span className="text-[11px] font-bold text-ink/70">
                    {subDone}/{task.subtasks.length}
                  </span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                    <span
                      className={`block h-full rounded-full transition-all duration-500 ${
                        pct === 100 ? "bg-ok" : "bg-accent"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                </>
              )}
            </div>

            <ul className="space-y-1">
              <AnimatePresence initial={false}>
                {task.subtasks.map((sub) => (
                  <SubRow
                    key={sub.id}
                    sub={sub}
                    flying={flyingSub === sub.id}
                    expanded={expanded === sub.id}
                    onToggleExpand={() => setExpanded(expanded === sub.id ? null : sub.id)}
                    onToggle={() => toggleSub(sub)}
                    onDelete={() => onDeleteSub(sub.id)}
                    onComment={(text) => onSubComment(sub.id, text)}
                  />
                ))}
              </AnimatePresence>
            </ul>

            <div className="mt-2 flex items-center gap-2 rounded-lg border border-line bg-raise px-3 py-2 transition-colors focus-within:border-accent">
              <IPlus size={14} className="shrink-0 text-accent" />
              <input
                value={subInput}
                onChange={(e) => setSubInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSub()}
                placeholder="Новая подзадача… (Enter)"
                className="w-full bg-transparent text-sm outline-none placeholder:text-mut/70"
              />
            </div>
          </section>

          {/* комментарии к задаче */}
          <section>
            <div className="mb-2.5 flex items-center gap-2">
              <IChat size={14} className="text-accent" />
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-mut">
                Комментарии
              </h3>
              {task.comments.length > 0 && (
                <span className="text-[11px] font-bold text-ink/70">{task.comments.length}</span>
              )}
            </div>

            {task.comments.length === 0 && (
              <p className="mb-2 text-xs text-mut/80">Пока тихо. Оставьте первую заметку.</p>
            )}

            <ul className="space-y-2">
              <AnimatePresence initial={false}>
                {task.comments.map((c) => (
                  <motion.li
                    key={c.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-lg border border-line bg-raise px-3 py-2"
                  >
                    <p className="text-sm leading-snug">{c.text}</p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-mut/80">
                      {fmtTime(c.ts)}
                    </p>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-line bg-raise px-3 py-2 transition-colors focus-within:border-accent">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addComment()}
                placeholder="Написать комментарий… (Enter)"
                className="w-full bg-transparent text-sm outline-none placeholder:text-mut/70"
              />
            </div>
          </section>
        </div>

        {/* низ: удаление со «взводом» */}
        <div className="border-t border-line p-4 md:p-5">
          <button
            onClick={() => {
              if (armed) {
                onDelete();
              } else {
                setArmed(true);
                window.setTimeout(() => setArmed(false), 2400);
              }
            }}
            className={`flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-all ${
              armed
                ? "border-red-600 bg-red-600 text-white"
                : "border-line text-mut hover:border-red-600/50 hover:bg-red-600/5 hover:text-red-600"
            }`}
          >
            <ITrash size={15} />
            {armed ? "Точно удалить? Нажмите ещё раз" : "Удалить задачу"}
          </button>
        </div>
      </motion.aside>
    </div>
  );
}

/* ---------------- строка подзадачи ---------------- */

function SubRow({
  sub,
  flying,
  expanded,
  onToggleExpand,
  onToggle,
  onDelete,
  onComment,
}: {
  sub: Subtask;
  flying: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onComment: (text: string) => void;
}) {
  const [text, setText] = useState("");

  const send = () => {
    const v = text.trim();
    if (!v) return;
    onComment(v);
    setText("");
  };

  return (
    <motion.li
      layout
      variants={subVariants}
      initial="rest"
      animate={flying ? "fly" : "rest"}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      className={`relative list-none rounded-lg transition-colors ${
        expanded ? "bg-accent-soft/60" : "hover:bg-raise"
      } ${flying ? "pointer-events-none z-20" : ""}`}
    >
      <div className="flex items-center gap-2.5 px-2 py-2">
        <button
          onClick={onToggle}
          title={sub.done ? "Вернуть в работу" : "Отметить выполненной"}
          className={`grid size-[18px] shrink-0 place-items-center rounded-[5px] border-2 transition-all ${
            sub.done
              ? "border-ok bg-ok text-white"
              : "border-mut/50 hover:scale-110 hover:border-accent"
          }`}
        >
          {sub.done && <ICheck size={11} />}
        </button>

        <button
          onClick={onToggleExpand}
          title="Комментарии подзадачи"
          className={`min-w-0 flex-1 truncate text-left text-sm ${
            sub.done ? "text-mut line-through decoration-ok/50" : "font-medium"
          }`}
        >
          {sub.title}
        </button>

        <button
          onClick={onToggleExpand}
          title="Комментарии подзадачи"
          className={`flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-bold transition-colors ${
            expanded || sub.comments.length > 0 ? "text-accent" : "text-mut/70 hover:text-ink"
          }`}
        >
          <IChat size={13} />
          {sub.comments.length > 0 && sub.comments.length}
          <IChevronD
            size={11}
            className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        <button
          onClick={onDelete}
          title="Удалить подзадачу"
          className="rounded-md p-1 text-mut/50 opacity-40 transition-all hover:bg-red-600/10 hover:text-red-600 hover:opacity-100 focus-visible:opacity-100"
        >
          <ITrash size={12} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.2, 1, 0.4, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 px-2 pb-2 pl-9">
              {sub.comments.map((c) => (
                <p key={c.id} className="rounded-md bg-raise px-2.5 py-1.5 text-xs leading-snug">
                  {c.text}
                  <span className="ml-1.5 whitespace-nowrap text-[10px] font-semibold text-mut/80">
                    · {fmtTime(c.ts)}
                  </span>
                </p>
              ))}
              {sub.comments.length === 0 && (
                <p className="text-[11px] text-mut/80">Комментариев пока нет.</p>
              )}
              <input
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Комментарий к подзадаче… (Enter)"
                className="w-full rounded-md border border-line bg-raise px-2.5 py-1.5 text-xs outline-none transition-colors focus:border-accent placeholder:text-mut/70"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

function ICloseMini() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

