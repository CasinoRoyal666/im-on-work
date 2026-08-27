import { useEffect, useRef, useState } from "react";
import type { Project } from "../types";
import { IPlus, ITrash } from "./Icons";

export default function Sidebar({
  projects,
  activeId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
}: {
  projects: Project[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [armedId, setArmedId] = useState<string | null>(null);
  const armTimer = useRef<number>(0);

  useEffect(() => () => window.clearTimeout(armTimer.current), []);

  const submitAdd = () => {
    const v = name.trim();
    if (v) onAdd(v);
    setName("");
    setAdding(false);
  };

  const armDelete = (id: string) => {
    if (armedId === id) {
      onDelete(id);
      setArmedId(null);
      return;
    }
    setArmedId(id);
    window.clearTimeout(armTimer.current);
    armTimer.current = window.setTimeout(() => setArmedId(null), 2200);
  };

  return (
    <aside className="z-10 border-b border-line bg-surface/70 md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:w-60 md:shrink-0 md:overflow-y-auto md:border-b-0 md:border-r">
      <div className="flex items-center justify-between px-4 pb-1 pt-4">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-mut">Проекты</h2>
        <span className="text-[11px] font-semibold text-mut">{projects.length}</span>
      </div>

      <ul className="flex gap-1.5 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:pb-2">
        {projects.map((p) => {
          const active = p.id === activeId;
          const open = p.tasks.filter((t) => t.status !== "completed").length;
          return (
            <li key={p.id} className="group relative shrink-0 md:shrink">
              <button
                onClick={() => onSelect(p.id)}
                onDoubleClick={() => {
                  setEditingId(p.id);
                  setEditName(p.name);
                }}
                title={p.name}
                className={`flex w-full min-w-[170px] items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all md:min-w-0 ${
                  active
                    ? "border-accent/40 bg-accent-soft shadow-sm"
                    : "border-transparent hover:border-line hover:bg-raise"
                }`}
              >
                <span
                  className="size-2.5 shrink-0 rounded-[4px]"
                  style={{ background: p.color }}
                />
                {editingId === p.id ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => {
                      if (editName.trim()) onRename(p.id, editName.trim());
                      setEditingId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full min-w-0 border-b border-accent bg-transparent text-sm font-semibold outline-none"
                  />
                ) : (
                  <span
                    className={`min-w-0 flex-1 truncate text-sm ${
                      active ? "font-bold text-ink" : "font-medium text-ink/80"
                    }`}
                  >
                    {p.name}
                  </span>
                )}
                {open > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      active ? "bg-accent text-on-accent" : "bg-line/70 text-mut"
                    }`}
                  >
                    {open}
                  </span>
                )}
              </button>

              {/* удаление с подтверждением-«взводом» */}
              <button
                onClick={() => armDelete(p.id)}
                title={armedId === p.id ? "Нажмите ещё раз для удаления" : "Удалить проект"}
                className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 transition-all ${
                  armedId === p.id
                    ? "bg-red-600 text-white opacity-100"
                    : "text-mut opacity-0 hover:bg-red-600/10 hover:text-red-600 group-hover:opacity-100"
                }`}
              >
                {armedId === p.id ? (
                  <span className="px-0.5 text-[10px] font-bold">точно?</span>
                ) : (
                  <ITrash size={13} />
                )}
              </button>
            </li>
          );
        })}

        {/* новый проект */}
        <li className="shrink-0 md:shrink">
          {adding ? (
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={submitAdd}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitAdd();
                if (e.key === "Escape") {
                  setName("");
                  setAdding(false);
                }
              }}
              placeholder="Название…"
              className="w-full min-w-[170px] rounded-lg border border-accent bg-raise px-3 py-2.5 text-sm outline-none md:min-w-0"
            />
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex w-full min-w-[170px] items-center gap-2 rounded-lg border border-dashed border-line px-3 py-2.5 text-sm font-medium text-mut transition-all hover:border-accent hover:bg-accent-soft hover:text-accent md:min-w-0"
            >
              <IPlus size={15} />
              Новый проект
            </button>
          )}
        </li>
      </ul>

      <div className="mx-4 mb-4 mt-2 hidden rounded-lg border border-dashed border-line p-3 text-[11px] leading-relaxed text-mut md:block lg:mt-6">
        <b className="text-ink/70">Совет:</b> клик по логотипу переключает{" "}
        <b className="text-ink/70">ImOnWork ↔ ImHome</b> — у каждого режима свои проекты, темы и
        настроение.
      </div>
    </aside>
  );
}
