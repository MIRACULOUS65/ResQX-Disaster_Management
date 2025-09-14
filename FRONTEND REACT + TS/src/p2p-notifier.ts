// Enhanced P2P notifier with real peer-to-peer capabilities
import { 
  createP2PNotificationManager,
  createRealP2PNotificationPayload,
  type RealP2PNotificationPayload
} from "./utils/realP2PNotifications";

// Create a unique instance for this tab
const realP2PNotificationManager = createP2PNotificationManager();

export type AlertPayload = {
  disasterType: string;
  severityLevel: number; // 1-10
  cid?: string | null;   // optional IPFS/Arweave CID
  imageUrl?: string | null;
  location: { lat: number; lng: number };
  reporter?: string;
  timestamp: number; // ms
};

export async function notifyAlert(payload: AlertPayload) {
  console.log("🚨 Disaster Alert:", payload);
  
  // Create real P2P notification payload
  const p2pPayload = createRealP2PNotificationPayload(
    payload.disasterType,
    payload.severityLevel,
    payload.location,
    payload.reporter,
    payload.timestamp,
    50 // 50km range
  );

  try {
    // Send notification using real P2P manager
    // This will reach other users' devices
    const success = await realP2PNotificationManager.sendDisasterAlert(p2pPayload);
    
    if (success) {
      console.log("✅ Disaster notification sent to other users");
      
      // Log connection status
      const status = realP2PNotificationManager.getConnectionStatus();
      console.log("📊 P2P Status:", {
        isOnline: status.isOnline,
        peerCount: status.peerCount,
        dataChannelCount: status.dataChannelCount,
        localPeerId: status.localPeerId
      });
    } else {
      console.warn("⚠️ No peers connected - alert stored locally");
    }
    
  } catch (error) {
    console.error("❌ Error sending disaster notification:", error);
  }
  
  return Promise.resolve();
}

// Additional utility functions for P2P management
export function getP2PStatus() {
  return realP2PNotificationManager.getConnectionStatus();
}

export function getStoredAlerts(): RealP2PNotificationPayload[] {
  return realP2PNotificationManager.getStoredAlerts();
}

export function clearStoredAlerts() {
  realP2PNotificationManager.clearStoredAlerts();
}

export function onP2PMessage(handler: (message: RealP2PNotificationPayload) => void) {
  realP2PNotificationManager.onMessage(handler);
}
