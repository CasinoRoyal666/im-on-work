import type { Persist } from "./types";

const BASE = "/api/state";

export async function loadState(): Promise<Persist | null> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error(`load failed: ${res.status}`);
  const body = await res.json();
  return (body.data as Persist) ?? null;
}

export async function saveState(state: Persist): Promise<void> {
  const res = await fetch(BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
  });
  if (!res.ok) throw new Error(`save failed: ${res.status}`);
}
