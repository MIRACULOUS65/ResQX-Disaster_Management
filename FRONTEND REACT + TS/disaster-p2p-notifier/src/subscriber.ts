import { subscribe } from "./p2pNode";
import { isSeen, markSeen } from "./localStore";
import { pushBrowserNotification, requestNotificationPermission } from "./browserNotify";
import type { P2PMessage } from "./types";

const TOPIC = "disaster:global";

export async function startSubscriber(onNew?: (msg: P2PMessage)=>void) {
  try { await requestNotificationPermission(); } catch(e){}
  await subscribe(TOPIC, async (json: any, from: string) => {
    const msg: P2PMessage = json;
    if (!msg || !msg.id) return;
    if (await isSeen(msg.id)) return;
    await markSeen(msg.id);
    try {
      pushBrowserNotification(msg.payload);
    } catch (e) {}
    if (onNew) onNew(msg);
  });
}
