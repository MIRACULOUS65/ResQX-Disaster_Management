# React Native Companion for Disaster P2P Notifier

This folder contains the blueprint for implementing true offline multi-hop disaster alerts on mobile devices using Android Nearby Connections.

## ANDROID NEARBY (RECOMMENDED) - IMPLEMENTATION CHECKLIST

**Platform:** React Native (Android)

1. **Use Google Nearby Connections API** (P2P_CLUSTER or P2P_STAR modes).

2. **Create a native module exposing:**
   - `startAdvertising(identity)`
   - `startDiscovery(onFoundCallback)`
   - `sendPayload(payloadBytes, endpointId)`
   - `onPayloadReceived` -> emit to JS via EventEmitter

3. **Wire native events to JS:**
   - `onFound(endpointId, info)`
   - `onLost(endpointId)`
   - `onPayload(endpointId, payloadBytes)`

4. **In RN JS:**
   - When payload arrives, re-publish to local libp2p (if running) or directly show local notification.
   - When user creates alert, call native module to broadcast payload bytes to nearby endpoints.
   - Message format: JSON (same schema) -> UTF-8 bytes.

5. **Permission:** request BLUETOOTH, BLUETOOTH_ADMIN, ACCESS_FINE_LOCATION (Android 12+ Bluetooth scanning rules).

6. **Test:** two Android devices with Wi-Fi/Bluetooth off cellular (Airplane with Bluetooth on) — alerts should hop device-to-device.

If you want the full RN + Android code (sample), say "generate RN nearby android sample" and I will output the module files.
