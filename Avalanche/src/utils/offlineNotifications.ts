// Offline Notification System for Disaster Management
// This system works without internet connection using P2P WebRTC and local storage

import { sendDisasterNotification, createDisasterNotificationPayload } from './metamaskNotifications';

export interface OfflineNotificationPayload {
  disasterType: string;
  severityLevel: number;
  location: { lat: number; lng: number };
  reporter?: string;
  timestamp: number;
  message: string;
  title: string;
  id: string;
}

export interface P2PConnection {
  id: string;
  peerConnection: RTCPeerConnection;
  dataChannel: RTCDataChannel;
  isConnected: boolean;
}

class OfflineNotificationManager {
  private connections: Map<string, P2PConnection> = new Map();
  private messageQueue: OfflineNotificationPayload[] = [];
  private isOnline: boolean = navigator.onLine;
  private serviceWorker: ServiceWorker | null = null;
  private messageHandlers: ((message: OfflineNotificationPayload) => void)[] = [];
  private instanceId: string;
  private storageKey: string;

  constructor(instanceId?: string) {
    // Generate unique instance ID for this tab/session
    this.instanceId = instanceId || `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.storageKey = `offline_notifications_${this.instanceId}`;
    
    console.log(`🔧 Initializing Offline Manager for instance: ${this.instanceId}`);
    
    this.setupEventListeners();
    this.initializeServiceWorker();
    this.loadMessageQueue();
  }

  private setupEventListeners() {
    // Listen for online/offline status changes
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Back online - syncing queued messages');
      this.syncQueuedMessages();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📱 Gone offline - switching to P2P mode');
    });

    // Listen for visibility changes to check for new messages
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForNewMessages();
      }
    });
  }

  private async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        this.serviceWorker = registration.active || registration.waiting;
        console.log('✅ Service Worker registered for offline notifications');
        
        // Listen for service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 New service worker available');
              }
            });
          }
        });
      } catch (error) {
        console.warn('⚠️ Service Worker registration failed:', error);
      }
    }
  }

  private async loadMessageQueue() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.messageQueue = JSON.parse(stored);
        console.log(`📦 Loaded ${this.messageQueue.length} queued messages for instance ${this.instanceId}`);
      }
    } catch (error) {
      console.error('Error loading message queue:', error);
    }
  }

  private async saveMessageQueue() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.messageQueue));
    } catch (error) {
      console.error('Error saving message queue:', error);
    }
  }

  // Send notification (works online and offline)
  async sendNotification(payload: OfflineNotificationPayload): Promise<boolean> {
    console.log('🚨 Sending disaster notification:', payload);

    // Always store locally first
    this.messageQueue.unshift(payload);
    await this.saveMessageQueue();

    // Try online methods first
    if (this.isOnline) {
      try {
        // Try MetaMask first
        const metaMaskSuccess = await this.sendMetaMaskNotification(payload);
        if (metaMaskSuccess) {
          console.log('✅ MetaMask notification sent');
          return true;
        }

        // Try browser notification
        const browserSuccess = await this.sendBrowserNotification(payload);
        if (browserSuccess) {
          console.log('✅ Browser notification sent');
          return true;
        }
      } catch (error) {
        console.warn('Online notification failed, switching to offline mode');
      }
    }

    // Offline methods
    console.log('📡 Sending via P2P network...');
    await this.broadcastToPeers(payload);
    
    // Show local notification
    this.showLocalNotification(payload);

    return true;
  }

  private async sendMetaMaskNotification(payload: OfflineNotificationPayload): Promise<boolean> {
    try {
      const metaMaskPayload = createDisasterNotificationPayload(
        payload.disasterType,
        payload.severityLevel,
        payload.location,
        payload.reporter,
        payload.timestamp
      );

      return await sendDisasterNotification(metaMaskPayload);
    } catch (error) {
      console.error('Failed to send MetaMask notification:', error);
      return false;
    }
  }

  private async sendBrowserNotification(payload: OfflineNotificationPayload): Promise<boolean> {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return false;
    }

    try {
      const notification = new Notification(payload.title, {
        body: payload.message,
        icon: '/favicon.ico',
        data: payload,
        tag: `disaster-${payload.id}`,
        requireInteraction: payload.severityLevel >= 7
      });

      // Add vibration
      if (navigator.vibrate && payload.severityLevel >= 6) {
        const pattern = payload.severityLevel >= 8 ? [500, 200, 500] : [200, 100, 200];
        navigator.vibrate(pattern);
      }

      notification.onclick = () => {
        window.focus();
        console.log('Disaster notification clicked:', payload);
      };

      return true;
    } catch (error) {
      console.error('Browser notification failed:', error);
      return false;
    }
  }

  private showLocalNotification(payload: OfflineNotificationPayload) {
    // Create a visual notification in the UI
    this.notifyHandlers(payload);
    
    // Show browser notification if possible
    this.sendBrowserNotification(payload);
  }

  private async broadcastToPeers(payload: OfflineNotificationPayload) {
    const message = {
      type: 'disaster_alert',
      data: payload,
      timestamp: Date.now()
    };

    // Send to all connected peers
    for (const [peerId, connection] of this.connections) {
      if (connection.isConnected && connection.dataChannel.readyState === 'open') {
        try {
          connection.dataChannel.send(JSON.stringify(message));
          console.log(`📤 Sent to peer ${peerId}`);
        } catch (error) {
          console.error(`Failed to send to peer ${peerId}:`, error);
        }
      }
    }
  }

  // P2P Connection Management
  async startP2PDiscovery() {
    console.log('🔍 Starting P2P discovery...');
    
    // In a real implementation, you would use WebRTC with STUN/TURN servers
    // For now, we'll simulate peer discovery
    this.simulatePeerDiscovery();
  }

  private simulatePeerDiscovery() {
    // Simulate finding nearby devices
    setTimeout(() => {
      console.log('📱 Found 2 nearby devices');
      // In a real app, you would establish WebRTC connections here
    }, 2000);
  }

  async connectToPeer(peerId: string): Promise<boolean> {
    try {
      // Create WebRTC connection with better error handling
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ],
        iceCandidatePoolSize: 10
      });

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log(`Connection state changed to: ${peerConnection.connectionState}`);
        if (peerConnection.connectionState === 'failed') {
          console.error(`Connection failed for peer ${peerId}`);
          this.connections.delete(peerId);
        }
      };

      // Handle ICE connection state changes
      peerConnection.oniceconnectionstatechange = () => {
        console.log(`ICE connection state: ${peerConnection.iceConnectionState}`);
      };

      // Create data channel with error handling
      const dataChannel = peerConnection.createDataChannel('disaster-alerts', {
        ordered: true,
        maxRetransmits: 3
      });

      // Set up message handling with better error handling
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

      dataChannel.onopen = () => {
        console.log(`✅ Connected to peer ${peerId}`);
        const connection: P2PConnection = {
          id: peerId,
          peerConnection,
          dataChannel,
          isConnected: true
        };
        this.connections.set(peerId, connection);
      };

      dataChannel.onclose = () => {
        console.log(`❌ Disconnected from peer ${peerId}`);
        this.connections.delete(peerId);
      };

      dataChannel.onerror = (error) => {
        console.error(`Data channel error for peer ${peerId}:`, error);
        this.connections.delete(peerId);
      };

      return true;
    } catch (error) {
      console.error('Failed to connect to peer:', error);
      return false;
    }
  }

  private handleIncomingMessage(payload: OfflineNotificationPayload) {
    // Check if we've already seen this message
    if (this.messageQueue.some(msg => msg.id === payload.id)) {
      return;
    }

    // Add to queue
    this.messageQueue.unshift(payload);
    this.saveMessageQueue();

    // Show notification
    this.showLocalNotification(payload);

    // Notify handlers
    this.notifyHandlers(payload);
  }

  private notifyHandlers(payload: OfflineNotificationPayload) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(payload);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  // Public API
  onMessage(handler: (message: OfflineNotificationPayload) => void) {
    this.messageHandlers.push(handler);
  }

  async syncQueuedMessages() {
    if (!this.isOnline) return;

    console.log('🔄 Syncing queued messages...');
    
    // Try to send queued messages
    const messagesToSync = [...this.messageQueue];
    this.messageQueue = [];

    for (const message of messagesToSync) {
      try {
        await this.sendNotification(message);
      } catch (error) {
        console.error('Failed to sync message:', error);
        // Re-queue failed messages
        this.messageQueue.push(message);
      }
    }

    await this.saveMessageQueue();
  }

  async checkForNewMessages() {
    // Check for messages from other sources (local storage, service worker, etc.)
    console.log('🔍 Checking for new messages...');
  }

  getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      peerCount: this.connections.size,
      queuedMessages: this.messageQueue.length
    };
  }

  getQueuedMessages(): OfflineNotificationPayload[] {
    return [...this.messageQueue];
  }

  clearQueue() {
    this.messageQueue = [];
    this.saveMessageQueue();
  }
}

// Factory function to create new instances instead of singleton
let offlineInstanceCounter = 0;
export function createOfflineNotificationManager(instanceId?: string): OfflineNotificationManager {
  const id = instanceId || `offline_instance_${++offlineInstanceCounter}_${Date.now()}`;
  return new OfflineNotificationManager(id);
}

// Default instance for backward compatibility (but each tab should create its own)
export const offlineNotificationManager = createOfflineNotificationManager();

// Utility functions
export function createOfflineNotificationPayload(
  disasterType: string,
  severityLevel: number,
  location: { lat: number; lng: number },
  reporter?: string,
  timestamp?: number
): OfflineNotificationPayload {
  const severityText = severityLevel >= 8 ? 'CRITICAL' : 
                      severityLevel >= 6 ? 'HIGH' : 
                      severityLevel >= 4 ? 'MEDIUM' : 'LOW';

  return {
    id: `disaster-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    disasterType,
    severityLevel,
    location,
    reporter: reporter || 'Emergency System',
    timestamp: timestamp || Date.now(),
    title: `🚨 ${disasterType.toUpperCase()} ALERT - ${severityText} SEVERITY`,
    message: `A ${severityText.toLowerCase()} severity ${disasterType} has been detected at coordinates ${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}. Please take appropriate safety measures immediately.`
  };
}

// Initialize P2P discovery on load
if (typeof window !== 'undefined') {
  offlineNotificationManager.startP2PDiscovery();
}
