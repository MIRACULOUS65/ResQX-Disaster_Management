import { AlertPayload } from "./types";

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission !== "denied") {
    const p = await Notification.requestPermission();
    return p === "granted";
  }
  return false;
}

export function pushBrowserNotification(payload: AlertPayload) {
  if (!("Notification" in window)) return;
  const title = `ALERT: ${payload.disasterType.toUpperCase()} (Lvl ${payload.severityLevel})`;
  const body = `Location: ${payload.location.lat.toFixed(3)}, ${payload.location.lng.toFixed(3)}. Tap for details.`;
  try {
    const n = new Notification(title, {
      body,
      data: payload,
      tag: `dpn-${payload.timestamp}-${payload.severityLevel}`
    });
    // optional: on click focus tab or open app URL
    n.onclick = () => {
      window.focus();
      // optionally navigate to map or alert detail page using payload.cid or payload data
    };
    // vibrate (if supported)
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  } catch (e) {}
}
