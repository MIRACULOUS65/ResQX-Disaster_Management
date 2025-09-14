# Android Nearby Connections Implementation Stub

This is a blueprint for implementing the native Android module for offline disaster alert propagation.

## Native Module Structure

```java
// DisasterNearbyModule.java
public class DisasterNearbyModule extends ReactContextBaseJavaModule {
    private ConnectionsClient connectionsClient;
    private String localEndpointId;
    
    @ReactMethod
    public void startAdvertising(String identity) {
        // Start advertising with Nearby Connections
    }
    
    @ReactMethod
    public void startDiscovery() {
        // Start discovery for nearby devices
    }
    
    @ReactMethod
    public void sendPayload(String payload, String endpointId) {
        // Send disaster alert payload to specific endpoint
    }
}
```

## React Native Bridge

```javascript
// DisasterNearby.js
import { NativeModules, NativeEventEmitter } from 'react-native';

const { DisasterNearby } = NativeModules;
const eventEmitter = new NativeEventEmitter(DisasterNearby);

export default {
  startAdvertising: (identity) => DisasterNearby.startAdvertising(identity),
  startDiscovery: () => DisasterNearby.startDiscovery(),
  sendPayload: (payload, endpointId) => DisasterNearby.sendPayload(payload, endpointId),
  
  addListener: (eventName, callback) => eventEmitter.addListener(eventName, callback),
  removeAllListeners: (eventName) => eventEmitter.removeAllListeners(eventName),
};
```

## Integration with Web P2P

When a disaster alert is received via Nearby Connections:
1. Parse the JSON payload
2. Call the web P2P notifier's `notifyAlert()` function
3. Show local notification
4. Forward to other nearby devices

This creates a true offline mesh network for disaster alerts.
