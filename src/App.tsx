import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ModeData, Persist, Project, Status, Task, Texture, Theme } from "./types";
import { uid } from "./types";
import { PROJECT_COLORS, seed } from "./store";
import { loadState, saveState } from "./api";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Board from "./components/Board";
import TaskDrawer from "./components/TaskDrawer";
import { IInbox } from "./components/Icons";

const FLY_MS = 780;
const SAVE_DEBOUNCE_MS = 600;

export default function App() {
  const [state, setState] = useState<Persist>(seed);
  const [hydrated, setHydrated] = useState(false);
  const [flyingTask, setFlyingTask] = useState<string | null>(null);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const saveTimer = useRef<number>(0);

  // load persisted state from the backend on mount
  useEffect(() => {
    loadState()
      .then((p) => {
        if (p) setState(p);
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  // debounced save to the backend on every change
  useEffect(() => {
    if (!hydrated) return;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => saveState(state).catch(() => {}), SAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(saveTimer.current);
  }, [state, hydrated]);

  const { mode } = state;
  const theme = state.themes[mode];
  const data = state.data[mode];
  const project = data.projects.find((p) => p.id === data.activeId) ?? data.projects[0] ?? null;
  const openTask = project?.tasks.find((t) => t.id === openTaskId) ?? null;
  const openCount = data.projects.reduce(
    (n, p) => n + p.tasks.filter((t) => t.status !== "completed").length,
    0
  );

  /* применение темы и режима к документу */
  useEffect(() => {
    const el = document.documentElement;
    el.style.setProperty("--accent", theme.accent);
    el.dataset.dark = String(theme.dark);
    el.dataset.mode = mode;
    el.dataset.texture = theme.texture;
  }, [theme, mode]);

  /* ---------- помощники ---------- */

  const patchData = (fn: (d: ModeData) => ModeData) =>
    setState((s) => ({ ...s, data: { ...s.data, [s.mode]: fn(s.data[s.mode]) } }));

  const patchProject = (pid: string, fn: (p: Project) => Project) =>
    patchData((d) => ({ ...d, projects: d.projects.map((p) => (p.id === pid ? fn(p) : p)) }));

  const patchTask = (tid: string, fn: (t: Task) => Task) => {
    if (project) patchProject(project.id, (p) => ({ ...p, tasks: p.tasks.map((t) => (t.id === tid ? fn(t) : t)) }));
  };

  /* ---------- режим и тема ---------- */

  const toggleMode = () => {
    setOpenTaskId(null);
    setFlyingTask(null);
    setState((s) => ({ ...s, mode: s.mode === "work" ? "home" : "work" }));
  };

  const setTheme = (patch: Partial<Theme>) =>
    setState((s) => ({ ...s, themes: { ...s.themes, [s.mode]: { ...s.themes[s.mode], ...patch } } }));

  /* ---------- проекты ---------- */

  const addProject = (name: string) => {
    const p: Project = {
      id: uid(),
      name,
      color: PROJECT_COLORS[data.projects.length % PROJECT_COLORS.length],
      tasks: [],
    };
    patchData((d) => ({ projects: [...d.projects, p], activeId: p.id }));
  };

  const renameProject = (id: string, name: string) => patchProject(id, (p) => ({ ...p, name }));

  const deleteProject = (id: string) =>
    patchData((d) => {
      const projects = d.projects.filter((p) => p.id !== id);
      return { projects, activeId: d.activeId === id ? projects[0]?.id ?? null : d.activeId };
    });

  /* ---------- задачи ---------- */

  const addTask = (title: string) => {
    if (!project) return;
    const t: Task = { id: uid(), title, status: "created", subtasks: [], comments: [], ts: Date.now() };
    patchProject(project.id, (p) => ({ ...p, tasks: [t, ...p.tasks] }));
  };

  const setStatus = (tid: string, s: Status) => patchTask(tid, (t) => ({ ...t, status: s }));

  /* закрытие = подпрыгнуть и улететь вниз, затем смена статуса */
  const completeTask = (tid: string) => {
    setFlyingTask(tid);
    window.setTimeout(() => {
      patchTask(tid, (t) => ({ ...t, status: "completed" }));
      setFlyingTask(null);
    }, FLY_MS);
  };

  const chooseStatus = (tid: string, s: Status) => {
    const t = project?.tasks.find((x) => x.id === tid);
    if (!t) return;
    if (s === "completed" && t.status !== "completed") completeTask(tid);
    else if (s !== t.status) setStatus(tid, s);
  };

  /* ---------- подзадачи и комментарии ---------- */

  const addSub = (tid: string, title: string) =>
    patchTask(tid, (t) => ({ ...t, subtasks: [...t.subtasks, { id: uid(), title, done: false, comments: [] }] }));

  const toggleSub = (tid: string, sid: string) =>
    patchTask(tid, (t) => ({
      ...t,
      subtasks: t.subtasks.map((s) => (s.id === sid ? { ...s, done: !s.done } : s)),
    }));

  const deleteSub = (tid: string, sid: string) =>
    patchTask(tid, (t) => ({ ...t, subtasks: t.subtasks.filter((s) => s.id !== sid) }));

  const addTaskComment = (tid: string, text: string) =>
    patchTask(tid, (t) => ({ ...t, comments: [...t.comments, { id: uid(), text, ts: Date.now() }] }));

  const addSubComment = (tid: string, sid: string, text: string) =>
    patchTask(tid, (t) => ({
      ...t,
      subtasks: t.subtasks.map((s) =>
        s.id === sid ? { ...s, comments: [...s.comments, { id: uid(), text, ts: Date.now() }] } : s
      ),
    }));

  const deleteTask = (tid: string) => {
    if (!project) return;
    patchProject(project.id, (p) => ({ ...p, tasks: p.tasks.filter((t) => t.id !== tid) }));
    setOpenTaskId(null);
  };

  /* ---------- разметка ---------- */

  return (
    <div className="relative min-h-screen">
      <BackgroundFX texture={theme.texture} />

      <Header
        mode={mode}
        onToggleMode={toggleMode}
        theme={theme}
        onTheme={setTheme}
        openCount={openCount}
      />

      <div className="relative z-10 flex flex-col md:flex-row">
        <Sidebar
          projects={data.projects}
          activeId={project?.id ?? null}
          onSelect={(id) => patchData((d) => ({ ...d, activeId: id }))}
          onAdd={addProject}
          onRename={renameProject}
          onDelete={deleteProject}
        />

        <main className="min-w-0 flex-1">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 1, 0.4, 1] }}
            className="mx-auto w-full max-w-5xl p-4 md:p-7"
          >
            {project ? (
              <Board
                project={project}
                flyingTask={flyingTask}
                onAdd={addTask}
                onOpen={setOpenTaskId}
                onAdvance={(id) => setStatus(id, "progress")}
                onComplete={completeTask}
                onReopen={(id) => setStatus(id, "progress")}
              />
            ) : (
              <EmptyState mode={mode} />
            )}
          </motion.div>
        </main>
      </div>

      <AnimatePresence>
        {openTask && (
          <TaskDrawer
            key={openTask.id}
            task={openTask}
            onClose={() => setOpenTaskId(null)}
            onRename={(title) => patchTask(openTask.id, (t) => ({ ...t, title }))}
            onStatus={(s) => chooseStatus(openTask.id, s)}
            onAddSub={(title) => addSub(openTask.id, title)}
            onToggleSub={(sid) => toggleSub(openTask.id, sid)}
            onDeleteSub={(sid) => deleteSub(openTask.id, sid)}
            onTaskComment={(text) => addTaskComment(openTask.id, text)}
            onSubComment={(sid, text) => addSubComment(openTask.id, sid, text)}
            onDelete={() => deleteTask(openTask.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- пустое состояние ---------------- */

function EmptyState({ mode }: { mode: "work" | "home" }) {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="max-w-sm text-center">
        <span className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl border border-dashed border-line bg-surface text-mut">
          <IInbox size={28} />
        </span>
        <h2 className="font-display text-lg font-bold">Пока нет проектов</h2>
        <p className="mt-2 text-sm leading-relaxed text-mut">
          Создайте первый проект кнопкой <b className="text-ink">«Новый проект»</b> в списке слева
          (на телефоне — сверху). {mode === "work" ? "Работа сама себя не сделает." : "Дом сам себя не уберёт."}
        </p>
      </div>
    </div>
  );
}

/* ---------------- живой фон ---------------- */

function BackgroundFX({ texture }: { texture: Texture }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {texture === "grid" && <div className="absolute inset-0 tex-grid" />}
      {texture === "dots" && <div className="absolute inset-0 tex-dots" />}
      <div
        className="absolute -top-40 right-[-12%] size-[460px] rounded-full"
        style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--accent) 11%, transparent), transparent 68%)" }}
      />
      <div
        className="absolute bottom-[-18%] left-[-10%] size-[420px] rounded-full"
        style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--accent) 8%, transparent), transparent 68%)" }}
      />
      <div className="absolute inset-0 noise" />
    </div>
  );
}
