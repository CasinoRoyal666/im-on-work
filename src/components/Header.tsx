import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Mode, Theme, Texture } from "../types";
import { ACCENT_PRESETS } from "../store";
import { IBriefcase, IHouse, IPalette } from "./Icons";

export default function Header({
  mode,
  onToggleMode,
  theme,
  onTheme,
  openCount,
}: {
  mode: Mode;
  onToggleMode: () => void;
  theme: Theme;
  onTheme: (patch: Partial<Theme>) => void;
  openCount: number;
}) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-3 px-4 md:px-6">
        {/* логотип-переключатель */}
        <button
          onClick={onToggleMode}
          title={mode === "work" ? "Переключиться на ImHome" : "Переключиться на ImOnWork"}
          className="group flex items-center gap-2.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-accent-soft"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-accent text-on-accent shadow-sm transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-105">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mode}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="grid place-items-center"
              >
                {mode === "work" ? <IBriefcase size={17} /> : <IHouse size={17} />}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="font-display text-[15px] font-bold tracking-tight">
            Im
            <span className="relative inline-grid overflow-hidden align-bottom text-accent">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mode}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.24, ease: [0.2, 1, 0.4, 1] }}
                >
                  {mode === "work" ? "OnWork" : "Home"}
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
        </button>

        <span className="hidden text-xs text-mut sm:block">
          {mode === "work" ? "рабочие проекты" : "домашние дела"}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {/* счётчик открытых */}
          <span className="hidden items-center gap-2 rounded-full border border-line bg-raise px-3 py-1.5 text-xs font-medium text-mut sm:flex">
            <span className="animate-pulse-dot size-1.5 rounded-full bg-accent" />
            открытых: <b className="text-ink">{openCount}</b>
          </span>

          {/* тема */}
          <div className="relative">
            <button
              onClick={() => setPaletteOpen((v) => !v)}
              title="Настроить тему"
              aria-expanded={paletteOpen}
              className={`grid size-9 place-items-center rounded-lg border transition-all ${
                paletteOpen
                  ? "border-accent bg-accent text-on-accent"
                  : "border-line bg-raise text-ink hover:border-accent hover:text-accent"
              }`}
            >
              <IPalette size={17} />
            </button>
            <AnimatePresence>
              {paletteOpen && (
                <ThemePanel theme={theme} onTheme={onTheme} onClose={() => setPaletteOpen(false)} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------------- панель темы ---------------- */

function ThemePanel({
  theme,
  onTheme,
  onClose,
}: {
  theme: Theme;
  onTheme: (patch: Partial<Theme>) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <button aria-label="Закрыть" onClick={onClose} className="fixed inset-0 z-40 cursor-default" />
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.94, y: -6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -4 }}
        transition={{ duration: 0.16, ease: [0.2, 1, 0.4, 1] }}
        className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-line bg-surface p-4 shadow-pop"
      >
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-mut">
          Акцентный цвет
        </p>
        <div className="flex items-center gap-2">
          {ACCENT_PRESETS.map((c) => (
            <button
              key={c}
              onClick={() => onTheme({ accent: c })}
              aria-label={`Цвет ${c}`}
              className={`size-7 rounded-full border-2 transition-transform hover:scale-110 ${
                theme.accent.toLowerCase() === c ? "border-ink scale-110" : "border-transparent"
              }`}
              style={{ background: c }}
            />
          ))}
          <label
            className="relative grid size-7 cursor-pointer place-items-center overflow-hidden rounded-full border-2 border-dashed border-mut/60 text-[10px] font-bold text-mut transition-colors hover:border-accent hover:text-accent"
            title="Свой цвет"
          >
            <input
              type="color"
              value={theme.accent}
              onChange={(e) => onTheme({ accent: e.target.value })}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            +
          </label>
        </div>

        <p className="mb-2.5 mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-mut">
          Материал фона
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: "plain", label: "Чистый" },
              { id: "grid", label: "Сетка" },
              { id: "dots", label: "Точки" },
            ] as { id: Texture; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => onTheme({ texture: t.id })}
              className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                theme.texture === t.id
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line bg-raise text-mut hover:border-mut"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <p className="mb-2.5 mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-mut">
          Режим
        </p>
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-line bg-raise p-1">
          {[
            { v: false, label: "Светлая" },
            { v: true, label: "Тёмная" },
          ].map((o) => (
            <button
              key={String(o.v)}
              onClick={() => onTheme({ dark: o.v })}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                theme.dark === o.v ? "bg-ink text-bg shadow-sm" : "text-mut hover:text-ink"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        <p className="mt-3.5 border-t border-line pt-3 text-[11px] leading-relaxed text-mut">
          Тема сохраняется отдельно для ImOnWork и ImHome.
        </p>
      </motion.div>
    </>
  );
}
