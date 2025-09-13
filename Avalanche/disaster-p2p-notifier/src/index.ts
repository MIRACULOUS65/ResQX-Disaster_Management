import { startNode } from "./p2pNode";
import { startSubscriber } from "./subscriber";
import { flushQueue } from "./notifier";
import type { AlertPayload } from "./types";
import { notifyAlert } from "./notifier";

// auto-start: start P2P node and subscriber when module loads in the browser
(async () => {
  try {
    await import("./p2pNode"); // ensures module loaded
    // start subscriber (listens for incoming messages and shows notifications)
    const s = await import("./subscriber");
    s.startSubscriber();
    // start p2p node
    const n = await import("./p2pNode");
    await n.startNode?.();
    // flush any queued outbound messages
    await flushQueue();
  } catch (e) {
    console.warn("disaster-p2p: startup partial", e);
  }
})();

export { notifyAlert };
export type { AlertPayload };
