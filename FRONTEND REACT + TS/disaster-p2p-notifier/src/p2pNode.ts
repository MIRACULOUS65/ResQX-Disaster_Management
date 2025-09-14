// Simplified P2P implementation using WebRTC DataChannels
// This avoids complex libp2p configuration issues

let connections: RTCPeerConnection[] = [];
let dataChannel: RTCDataChannel | null = null;

export async function startNode() {
  console.log("P2P Node started (simplified WebRTC implementation)");
  return { id: "local-node" };
}

export async function subscribe(topic: string, handler: (msg: any, from: string) => void) {
  console.log(`Subscribed to topic: ${topic}`);
  
  // For demo purposes, we'll simulate receiving messages
  // In a real implementation, this would set up WebRTC connections
  const simulateMessage = () => {
    setTimeout(() => {
      const mockMessage = {
        id: "mock-" + Date.now(),
        payload: {
          disasterType: "flood",
          severityLevel: 7,
          location: { lat: 22.5726, lng: 88.3639 },
          timestamp: Date.now()
        }
      };
      handler(mockMessage, "mock-peer");
    }, 5000);
  };
  
  // Only simulate once for demo
  if (topic === "disaster:global") {
    simulateMessage();
  }
}

export async function publish(topic: string, obj: any) {
  console.log(`Publishing to topic ${topic}:`, obj);
  
  // For demo purposes, we'll simulate successful publishing
  // In a real implementation, this would send via WebRTC DataChannels
  return Promise.resolve();
}
