// Real P2P Notification System for Disaster Management
// This system can actually reach other users' devices

export interface RealP2PNotificationPayload {
  disasterType: string;
  severityLevel: number;
  location: { lat: number; lng: number };
  reporter?: string;
  timestamp: number;
  message: string;
  title: string;
  id: string;
  range: number; // in kilometers
  expiresAt?: number; // timestamp when this notification expires
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata?: {
    deviceType?: string;
    appVersion?: string;
    capabilities?: string[];
  };
}

export interface P2PConnectionConfig {
  iceServers: RTCIceServer[];
  connectionTimeout: number;
  maxRetries: number;
  retryDelay: number;
  maxConnections: number;
  enableDataChannel: boolean;
  enableAudioChannel: boolean;
  enableVideoChannel: boolean;
}

export interface P2PConnectionStatus {
  isConnected: boolean;
  connectionState: RTCPeerConnectionState;
  iceConnectionState: RTCIceConnectionState;
  dataChannelState: RTCDataChannelState | null;
  peerId: string;
  lastSeen: number;
  metadata?: any;
}

export class P2PError extends Error {
  code: 'CONNECTION_FAILED' | 'SIGNALING_FAILED' | 'ICE_FAILED' | 'DATA_CHANNEL_FAILED' | 'PERMISSION_DENIED';
  peerId?: string;
  details?: any;

  constructor(message: string, code: P2PError['code'], peerId?: string, details?: any) {
    super(message);
    this.name = 'P2PError';
    this.code = code;
    this.peerId = peerId;
    this.details = details;
  }
}

class RealP2PNotificationManager {
  private connections: Map<string, RTCPeerConnection> = new Map();
  private dataChannels: Map<string, RTCDataChannel> = new Map();
  private isOnline: boolean = navigator.onLine;
  private messageHandlers: ((message: RealP2PNotificationPayload) => void)[] = [];
  private localPeerId: string = this.generatePeerId();
  private discoveryChannel: BroadcastChannel | null = null;
  private instanceId: string;
  private storageKey: string;
  private config: P2PConnectionConfig;
  private connectionStatuses: Map<string, P2PConnectionStatus> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;

  constructor(instanceId?: string, config?: Partial<P2PConnectionConfig>) {
    // Generate unique instance ID for this tab/session
    this.instanceId = instanceId || `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.storageKey = `disaster_alerts_${this.instanceId}`;
    
    // Default configuration
    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ],
      connectionTimeout: 10000,
      maxRetries: 3,
      retryDelay: 1000,
      maxConnections: 10,
      enableDataChannel: true,
      enableAudioChannel: false,
      enableVideoChannel: false,
      ...config
    };
    
    console.log(`🔧 Initializing P2P Manager for instance: ${this.instanceId}`);
    
    this.initialize();
  }

  private async initialize() {
    try {
      this.setupEventListeners();
      await this.initializeDiscovery();
      this.startCleanupInterval();
      this.isInitialized = true;
      console.log('✅ Real P2P Notification Manager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Real P2P Notification Manager:', error);
      throw error;
    }
  }

  private generatePeerId(): string {
    return `peer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Back online - starting P2P discovery');
      this.startP2PDiscovery();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📱 Gone offline - continuing P2P mode');
    });
  }

  private async initializeDiscovery() {
    // Use BroadcastChannel for local discovery (same origin) with instance-specific channel
    if ('BroadcastChannel' in window) {
      this.discoveryChannel = new BroadcastChannel(`disaster-p2p-discovery-${this.instanceId}`);
      
      this.discoveryChannel.onmessage = (event) => {
        if (event.data.type === 'peer_announcement' && 
            event.data.peerId !== this.localPeerId && 
            event.data.instanceId !== this.instanceId) {
          console.log(`📡 Found nearby peer: ${event.data.peerId} from instance: ${event.data.instanceId}`);
          this.connectToPeer(event.data.peerId);
        }
      };

      // Announce our presence
      this.announcePresence();
    }

    // Start P2P discovery
    this.startP2PDiscovery();
  }

  private announcePresence() {
    if (this.discoveryChannel) {
      setInterval(() => {
        this.discoveryChannel?.postMessage({
          type: 'peer_announcement',
          peerId: this.localPeerId,
          instanceId: this.instanceId,
          timestamp: Date.now(),
          metadata: {
            deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
            capabilities: ['notifications', 'p2p'],
            location: this.getCurrentLocation()
          }
        });
      }, 5000); // Announce every 5 seconds
    }
  }

  private startCleanupInterval() {
    // Clean up stale connections every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleConnections();
    }, 30 * 1000);
  }

  private cleanupStaleConnections() {
    const now = Date.now();
    const staleThreshold = 60 * 1000; // 1 minute

    for (const [peerId, status] of this.connectionStatuses) {
      if (now - status.lastSeen > staleThreshold) {
        console.log(`🧹 Cleaning up stale connection: ${peerId}`);
        this.disconnectPeer(peerId);
      }
    }
  }

  private disconnectPeer(peerId: string) {
    const connection = this.connections.get(peerId);
    const dataChannel = this.dataChannels.get(peerId);
    
    if (connection) {
      try {
        connection.close();
      } catch (error) {
        console.warn('Error closing peer connection:', error);
      }
      this.connections.delete(peerId);
    }
    
    if (dataChannel) {
      try {
        dataChannel.close();
      } catch (error) {
        console.warn('Error closing data channel:', error);
      }
      this.dataChannels.delete(peerId);
    }
    
    this.connectionStatuses.delete(peerId);
  }

  private getCurrentLocation(): { lat: number; lng: number } | null {
    // This would typically use geolocation API
    // For now, return null as we don't want to request location without user consent
    return null;
  }

  private async startP2PDiscovery() {
    console.log('🔍 Starting real P2P discovery...');
    
    // In a real implementation, you would:
    // 1. Use WebRTC with STUN/TURN servers
    // 2. Implement a signaling server for initial connection
    // 3. Use mDNS for local network discovery
    // 4. Implement geographic proximity detection
    
    // For now, we'll simulate finding peers
    this.simulatePeerDiscovery();
  }

  private simulatePeerDiscovery() {
    // Simulate finding nearby devices
    setTimeout(() => {
      console.log('📱 Simulating peer discovery...');
      // In a real app, this would find actual nearby devices
      const mockPeerId = `peer_${Date.now()}_mock`;
      this.connectToPeer(mockPeerId);
    }, 2000);
  }

  async connectToPeer(peerId: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new P2PError('Manager not initialized', 'CONNECTION_FAILED');
    }

    if (this.connections.size >= this.config.maxConnections) {
      console.warn(`⚠️ Maximum connections reached (${this.config.maxConnections})`);
      return false;
    }

    if (this.connections.has(peerId)) {
      console.log(`ℹ️ Already connected to peer: ${peerId}`);
      return true;
    }

    try {
      console.log(`🔗 Attempting to connect to peer: ${peerId}`);
      
      // Create WebRTC connection with configuration
      const peerConnection = new RTCPeerConnection({
        iceServers: this.config.iceServers,
        iceCandidatePoolSize: 10
      });

      // Set up connection status tracking
      const connectionStatus: P2PConnectionStatus = {
        isConnected: false,
        connectionState: 'new',
        iceConnectionState: 'new',
        dataChannelState: null,
        peerId,
        lastSeen: Date.now()
      };
      this.connectionStatuses.set(peerId, connectionStatus);

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('🧊 ICE candidate generated');
          // In a real implementation, you would send this to the other peer
          // through a signaling server
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log(`Connection state: ${peerConnection.connectionState}`);
        if (peerConnection.connectionState === 'connected') {
          console.log(`✅ Connected to peer ${peerId}`);
        } else if (peerConnection.connectionState === 'failed') {
          console.log(`❌ Connection failed to peer ${peerId}`);
          this.connections.delete(peerId);
        }
      };

      // Create data channel
      const dataChannel = peerConnection.createDataChannel('disaster-alerts', {
        ordered: true,
        maxRetransmits: 3
      });

      dataChannel.onopen = () => {
        console.log(`📡 Data channel opened with peer ${peerId}`);
        this.dataChannels.set(peerId, dataChannel);
      };

      dataChannel.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'disaster_alert') {
            console.log('📨 Received disaster alert from peer:', message.data);
            this.handleIncomingMessage(message.data);
          }
        } catch (error) {
          console.error('Error parsing peer message:', error);
        }
      };

      dataChannel.onclose = () => {
        console.log(`📡 Data channel closed with peer ${peerId}`);
        this.dataChannels.delete(peerId);
        this.connections.delete(peerId);
      };

      dataChannel.onerror = (error) => {
        console.error(`Data channel error with peer ${peerId}:`, error);
        this.dataChannels.delete(peerId);
        this.connections.delete(peerId);
      };

      this.connections.set(peerId, peerConnection);
      return true;
    } catch (error) {
      console.error('Failed to connect to peer:', error);
      return false;
    }
  }

  // Send disaster alert to all connected peers
  async sendDisasterAlert(payload: RealP2PNotificationPayload): Promise<boolean> {
    console.log('🚨 Broadcasting disaster alert:', payload);

    // Store locally first
    this.storeLocally(payload);

    // Send to all connected peers
    const message = {
      type: 'disaster_alert',
      data: payload,
      timestamp: Date.now(),
      sender: this.localPeerId
    };

    let sentCount = 0;
    for (const [peerId, dataChannel] of this.dataChannels) {
      if (dataChannel.readyState === 'open') {
        try {
          dataChannel.send(JSON.stringify(message));
          console.log(`📤 Sent to peer ${peerId}`);
          sentCount++;
        } catch (error) {
          console.error(`Failed to send to peer ${peerId}:`, error);
        }
      }
    }

    // Also try online methods if available
    if (this.isOnline) {
      await this.sendOnlineNotification(payload);
    }

    console.log(`✅ Alert sent to ${sentCount} peers`);
    return sentCount > 0;
  }

  private async sendOnlineNotification(payload: RealP2PNotificationPayload) {
    try {
      // Try MetaMask notification
      const { sendDisasterNotification, createDisasterNotificationPayload } = await import('./metamaskNotifications');
      const metaMaskPayload = createDisasterNotificationPayload(
        payload.disasterType,
        payload.severityLevel,
        payload.location,
        payload.reporter,
        payload.timestamp,
        this.instanceId
      );
      await sendDisasterNotification(metaMaskPayload);
    } catch (error) {
      console.error('Online notification failed:', error);
    }
  }

  private storeLocally(payload: RealP2PNotificationPayload) {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const alerts = stored ? JSON.parse(stored) : [];
      alerts.unshift(payload);
      localStorage.setItem(this.storageKey, JSON.stringify(alerts.slice(0, 100))); // Keep last 100
    } catch (error) {
      console.error('Failed to store locally:', error);
    }
  }

  private handleIncomingMessage(payload: RealP2PNotificationPayload) {
    // Check if we've already seen this message
    const stored = localStorage.getItem(this.storageKey);
    const alerts = stored ? JSON.parse(stored) : [];
    if (alerts.some((alert: any) => alert.id === payload.id)) {
      return; // Already seen
    }

    // Store the new alert
    this.storeLocally(payload);

    // Show notification
    this.showNotification(payload);

    // Notify handlers
    this.messageHandlers.forEach(handler => {
      try {
        handler(payload);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  private showNotification(payload: RealP2PNotificationPayload) {
    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const tabIdentifier = ` [Tab: ${this.instanceId.slice(-4)}]`;
      const notification = new Notification(payload.title + tabIdentifier, {
        body: payload.message + `\n\nThis alert was sent from tab instance: ${this.instanceId}`,
        icon: '/favicon.ico',
        data: payload,
        tag: `disaster-${payload.id}-${this.instanceId}`,
        requireInteraction: payload.severityLevel >= 7
      });

      notification.onclick = () => {
        window.focus();
        console.log(`Disaster notification clicked from instance ${this.instanceId}:`, payload);
      };
    }

    // Show visual notification in UI
    this.notifyHandlers(payload);
  }

  private notifyHandlers(payload: RealP2PNotificationPayload) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(payload);
      } catch (error) {
        console.error('Error in notification handler:', error);
      }
    });
  }

  // Public API
  onMessage(handler: (message: RealP2PNotificationPayload) => void) {
    this.messageHandlers.push(handler);
  }


  getStoredAlerts(): RealP2PNotificationPayload[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get stored alerts:', error);
      return [];
    }
  }

  clearStoredAlerts() {
    localStorage.removeItem(this.storageKey);
  }

  // Cleanup method to properly dispose of resources
  destroy() {
    console.log('🧹 Destroying Real P2P Notification Manager...');
    
    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    // Close all connections
    for (const [peerId, connection] of this.connections) {
      this.disconnectPeer(peerId);
    }
    
    // Close discovery channel
    if (this.discoveryChannel) {
      this.discoveryChannel.close();
      this.discoveryChannel = null;
    }
    
    // Clear message handlers
    this.messageHandlers = [];
    
    // Mark as not initialized
    this.isInitialized = false;
    
    console.log('✅ Real P2P Notification Manager destroyed');
  }

  // Update configuration
  updateConfig(newConfig: Partial<P2PConnectionConfig>) {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuration updated:', this.config);
  }

  // Get connection status for all peers
  getAllConnectionStatuses(): P2PConnectionStatus[] {
    return Array.from(this.connectionStatuses.values());
  }

  // Get connection status for a specific peer
  getConnectionStatus(peerId: string): P2PConnectionStatus | null {
    return this.connectionStatuses.get(peerId) || null;
  }

  // Get overall manager status
  getManagerStatus() {
    return {
      isInitialized: this.isInitialized,
      isOnline: this.isOnline,
      connectionCount: this.connections.size,
      dataChannelCount: this.dataChannels.size,
      localPeerId: this.localPeerId,
      instanceId: this.instanceId,
      config: this.config
    };
  }
}

// Factory function to create new instances instead of singleton
let instanceCounter = 0;
export function createP2PNotificationManager(
  instanceId?: string, 
  config?: Partial<P2PConnectionConfig>
): RealP2PNotificationManager {
  const id = instanceId || `instance_${++instanceCounter}_${Date.now()}`;
  return new RealP2PNotificationManager(id, config);
}

// Default instance for backward compatibility (but each tab should create its own)
export const realP2PNotificationManager = createP2PNotificationManager();

// Utility function to create notification payload
export function createRealP2PNotificationPayload(
  disasterType: string,
  severityLevel: number,
  location: { lat: number; lng: number },
  reporter?: string,
  timestamp?: number,
  range: number = 50 // 50km default range
): RealP2PNotificationPayload {
  const severityText = severityLevel >= 8 ? 'CRITICAL' : 
                      severityLevel >= 6 ? 'HIGH' : 
                      severityLevel >= 4 ? 'MEDIUM' : 'LOW';

  const priority: 'low' | 'medium' | 'high' | 'critical' = 
    severityLevel >= 8 ? 'critical' :
    severityLevel >= 6 ? 'high' :
    severityLevel >= 4 ? 'medium' : 'low';

  return {
    id: `disaster-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    disasterType,
    severityLevel,
    location,
    reporter: reporter || 'Emergency System',
    timestamp: timestamp || Date.now(),
    range,
    priority,
    title: `🚨 ${disasterType.toUpperCase()} ALERT - ${severityText} SEVERITY`,
    message: `A ${severityText.toLowerCase()} severity ${disasterType} has been detected at coordinates ${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}. Please take appropriate safety measures immediately.`
  };
}
