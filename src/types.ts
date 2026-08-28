export type Status = "created" | "progress" | "completed";
export type Mode = "work" | "home";
export type Texture = "grid" | "dots" | "plain";

export interface Comment {
  id: string;
  text: string;
  ts: number;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
  comments: Comment[];
}

export interface Task {
  id: string;
  title: string;
  status: Status;
  subtasks: Subtask[];
  comments: Comment[];
  ts: number;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  tasks: Task[];
}

export interface ModeData {
  projects: Project[];
  activeId: string | null;
}

export interface Theme {
  accent: string;
  dark: boolean;
  texture: Texture;
}

export interface Persist {
  mode: Mode;
  themes: Record<Mode, Theme>;
  data: Record<Mode, ModeData>;
}

export const uid = () =>
  crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

export const STATUS_ORDER: Status[] = ["created", "progress", "completed"];

export const STATUS_LABEL: Record<Status, string> = {
  created: "Новые",
  progress: "В работе",
  completed: "Готово",
};

const fmt = new Intl.DateTimeFormat("ru", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export const fmtTime = (ts: number) => fmt.format(ts).replace(",", " ·");
