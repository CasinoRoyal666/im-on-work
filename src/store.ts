import type { Persist } from "./types";
import { uid } from "./types";

const KEY = "imonwork:v1";

export const PROJECT_COLORS = [
  "#0e7c6b",
  "#2e66e5",
  "#e06a2b",
  "#c2417f",
  "#c9970f",
  "#3a9bc7",
  "#5f9c46",
  "#8a63d2",
];

export const ACCENT_PRESETS = [
  "#0e7c6b",
  "#2e66e5",
  "#3a9bc7",
  "#e06a2b",
  "#c2417f",
  "#c9970f",
];

function seed(): Persist {
  const now = Date.now();
  const day = 86_400_000;
  return {
    mode: "work",
    themes: {
      work: { accent: "#0e7c6b", dark: false, texture: "grid" },
      home: { accent: "#e06a2b", dark: false, texture: "dots" },
    },
    data: {
      work: {
        activeId: "p-launch",
        projects: [
          {
            id: "p-launch",
            name: "Запуск продукта",
            color: "#0e7c6b",
            tasks: [
              {
                id: "t-brief",
                title: "Бриф для дизайнера",
                status: "progress",
                ts: now - day * 2,
                comments: [
                  { id: uid(), text: "Клиент ждёт бриф до пятницы", ts: now - day },
                ],
                subtasks: [
                  { id: uid(), title: "Референсы и мудборд", done: true, comments: [] },
                  {
                    id: uid(),
                    title: "Структура лендинга",
                    done: false,
                    comments: [
                      { id: uid(), text: "Начни с блока «о продукте»", ts: now - 5 * 3_600_000 },
                    ],
                  },
                ],
              },
              {
                id: uid(),
                title: "Забронировать переговорку на демо",
                status: "created",
                ts: now - day,
                comments: [],
                subtasks: [],
              },
              {
                id: uid(),
                title: "Оплатить домен и хостинг",
                status: "completed",
                ts: now - day * 3,
                comments: [],
                subtasks: [{ id: uid(), title: "Продлить сразу на год", done: true, comments: [] }],
              },
            ],
          },
        ],
      },
      home: {
        activeId: "p-remont",
        projects: [
          {
            id: "p-remont",
            name: "Ремонт",
            color: "#e06a2b",
            tasks: [
              {
                id: uid(),
                title: "Выбрать обои в спальню",
                status: "progress",
                ts: now - day,
                comments: [],
                subtasks: [
                  { id: uid(), title: "Съездить в магазин на выходных", done: false, comments: [] },
                  { id: uid(), title: "Сверить с цветом пола", done: true, comments: [] },
                ],
              },
              {
                id: uid(),
                title: "Позвонить сантехнику",
                status: "created",
                ts: now - 3 * 3_600_000,
                comments: [],
                subtasks: [],
              },
            ],
          },
        ],
      },
    },
  };
}

export function load(): Persist {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Persist;
      if (p && p.data && p.themes && p.data.work && p.data.home) return p;
    }
  } catch {
    /* повреждённые данные — начнём заново */
  }
  return seed();
}

export function save(p: Persist) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* приватный режим — молча пропускаем */
  }
}
