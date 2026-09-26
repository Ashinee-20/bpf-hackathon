import { Firestore } from "@google-cloud/firestore";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AppState } from "./types";
import { emptyState } from "./default-state";

const useFirestore = Boolean(process.env.GOOGLE_CLOUD_PROJECT);
let firestore: Firestore | undefined;
const dataDir = path.join(process.cwd(), "data");

function db() {
  firestore ??= new Firestore({
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
    ignoreUndefinedProperties: true,
  });
  return firestore;
}

function safeId(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
}

export async function loadState(sessionId: string): Promise<AppState> {
  const id = safeId(sessionId);
  if (useFirestore) {
    const snapshot = await db().collection("pathwise_sessions").doc(id).get();
    return snapshot.exists
      ? normalize(snapshot.data() as AppState)
      : emptyState();
  }
  try {
    return normalize(
      JSON.parse(
        await readFile(path.join(dataDir, `${id}.json`), "utf8"),
      ) as AppState,
    );
  } catch {
    return emptyState();
  }
}

function normalize(state: AppState): AppState {
  state.jobs ??= [];
  state.opportunities ??= [];
  state.projects ??= [];
  state.completedWeeklyTasks ??= [];
  return state;
}

export async function saveState(
  sessionId: string,
  state: AppState,
): Promise<void> {
  const id = safeId(sessionId);
  if (useFirestore) {
    await db().collection("pathwise_sessions").doc(id).set(state);
    return;
  }
  await mkdir(dataDir, { recursive: true });
  const target = path.join(dataDir, `${id}.json`);
  const temporary = `${target}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(state, null, 2), "utf8");
  await rename(temporary, target);
}
