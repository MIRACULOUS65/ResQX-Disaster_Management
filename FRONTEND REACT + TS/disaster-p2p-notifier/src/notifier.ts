import { v4 as uuidv4 } from "uuid";
import { enqueue, dequeueAll } from "./localStore";
import { publish } from "./p2pNode";
import { pushBrowserNotification } from "./browserNotify";
import type { AlertPayload, P2PMessage } from "./types";

const TOPIC = "disaster:global";

// ---- notifyAlert: the single function to call from your pipeline ----
export async function notifyAlert(payload: AlertPayload) {
  const msg: P2PMessage = {
    id: uuidv4(),
    payload,
    origin: typeof window !== "undefined" ? window.location.hostname : "server"
  };

  // 1) immediate local notification (so reporter also sees it right away)
  try { pushBrowserNotification(payload); } catch (e) {}

  // 2) attempt publish (if p2p node running), but always enqueue for persistence/retry
  try {
    await enqueue(msg);
  } catch (e) {
    console.warn("enqueue failed", e);
  }

  // attempt to publish now (best-effort)
  try {
    await publish(TOPIC, msg);
  } catch (e) {
    // publish failed => offline, the queue will handle it
  }
}

// ---- retry loop: call this on app start to flush the queue ----
export async function flushQueue() {
  try {
    const q = await dequeueAll();
    for (const msg of q.reverse()) { // oldest first
      try {
        await publish(TOPIC, msg);
      } catch (e) {
        // if any fail, re-enqueue remaining and stop
        for (const remaining of q) await enqueue(remaining);
        throw e;
      }
    }
  } catch (e) {
    // nothing to do
  }
}
