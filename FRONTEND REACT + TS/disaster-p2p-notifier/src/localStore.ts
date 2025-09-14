import localforage from "localforage";
import { P2PMessage } from "./types";

const QUEUE_KEY = "dpn_queue_v1";
const SEEN_KEY = "dpn_seen_v1";

localforage.config({ name: "disaster-p2p" });

export async function enqueue(msg: P2PMessage) {
  const q: P2PMessage[] = (await localforage.getItem(QUEUE_KEY)) || [];
  q.unshift(msg);
  await localforage.setItem(QUEUE_KEY, q.slice(0, 500)); // keep recent 500
}

export async function dequeueAll(): Promise<P2PMessage[]> {
  const q: P2PMessage[] = (await localforage.getItem(QUEUE_KEY)) || [];
  await localforage.removeItem(QUEUE_KEY);
  return q;
}

export async function markSeen(id: string) {
  const s: string[] = (await localforage.getItem(SEEN_KEY)) || [];
  if (!s.includes(id)) {
    s.push(id);
    await localforage.setItem(SEEN_KEY, s.slice(-1000));
  }
}

export async function isSeen(id: string) {
  const s: string[] = (await localforage.getItem(SEEN_KEY)) || [];
  return s.includes(id);
}
