// Real-time Disaster Notification Service
import { disasterService } from './disasterService';
import type { Disaster, DisasterEvent, DisasterNotificationPayload } from '../../types/disaster';
import { 
  sendDisasterNotification, 
  createDisasterNotificationPayload,
  isMetaMaskInstalled,
  isMetaMaskConnected,
  getMetaMaskStatus
} from '../../utils/metamaskNotifications';

export class DisasterNotificationService {
  private static instance: DisasterNotificationService;
  private isListening = false;
  private listeners: (() => void)[] = [];
  private notificationHandlers: ((payload: DisasterNotificationPayload) => void)[] = [];
  private metaMaskEnabled = false;
  private metaMaskStatus: { installed: boolean; connected: boolean } = { installed: false, connected: false };

  static getInstance(): DisasterNotificationService {
    if (!DisasterNotificationService.instance) {
      DisasterNotificationService.instance = new DisasterNotificationService();
    }
    return DisasterNotificationService.instance;
  }

  // Start listening for disaster events
  startListening(): void {
    if (this.isListening) {
      console.log('⚠️ Already listening for disaster events');
      return;
    }

    console.log('🔔 Starting disaster notification service...');
    this.isListening = true;
    
    // Initialize MetaMask status
    this.initializeMetaMask();

    // Listen for disaster events
    const unsubscribeEvents = disasterService.subscribeToDisasterEvents((event) => {
      this.handleDisasterEvent(event);
    });

    this.listeners.push(unsubscribeEvents);

    // Listen for active disasters changes
    const unsubscribeDisasters = disasterService.subscribeToDisasters((disasters) => {
      // This will trigger when disasters are created, updated, or resolved
      console.log(`📊 Active disasters updated: ${disasters.filter(d => d.status === 'active').length} active`);
    }, { status: 'active' });

    this.listeners.push(unsubscribeDisasters);
  }

  // Stop listening for disaster events
  stopListening(): void {
    console.log('🔕 Stopping disaster notification service...');
    this.isListening = false;
    
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners = [];
  }

  // Handle disaster events and create notifications
  private handleDisasterEvent(event: DisasterEvent): void {
    console.log(`📡 Disaster event received: ${event.type}`, event.disaster.id);

    let notificationPayload: DisasterNotificationPayload | null = null;

    switch (event.type) {
      case 'created':
        notificationPayload = this.createDisasterCreatedNotification(event.disaster);
        break;
      case 'resolved':
        notificationPayload = this.createDisasterResolvedNotification(event.disaster);
        break;
      case 'updated':
        notificationPayload = this.createDisasterUpdatedNotification(event.disaster);
        break;
      case 'deleted':
        notificationPayload = this.createDisasterDeletedNotification(event.disaster);
        break;
    }

    if (notificationPayload) {
      this.notifyHandlers(notificationPayload);
      this.showBrowserNotification(notificationPayload);
      this.sendMetaMaskNotification(notificationPayload);
    }
  }

  // Create notification for new disaster
  private createDisasterCreatedNotification(disaster: Disaster): DisasterNotificationPayload {
    const severityEmoji = disaster.severityLevel >= 8 ? '🚨🚨🚨' : 
                         disaster.severityLevel >= 6 ? '⚠️⚠️' : '⚠️';

    return {
      type: 'disaster_created',
      disaster,
      message: `${severityEmoji} NEW DISASTER ALERT ${severityEmoji}\n\n${disaster.message}\n\n📍 Location: ${disaster.location.lat.toFixed(3)}, ${disaster.location.lng.toFixed(3)}\n👤 Reported by: ${disaster.reporterName || disaster.reporterEmail}\n⏰ Time: ${new Date(disaster.timestamp).toLocaleString()}`,
      title: disaster.title,
      priority: disaster.priority,
      requiresAction: disaster.severityLevel >= 6
    };
  }

  // Create notification for resolved disaster
  private createDisasterResolvedNotification(disaster: Disaster): DisasterNotificationPayload {
    return {
      type: 'disaster_resolved',
      disaster,
      message: `✅ DISASTER RESOLVED\n\n${disaster.disasterType.toUpperCase()} alert has been resolved.\n\n📍 Location: ${disaster.location.lat.toFixed(3)}, ${disaster.location.lng.toFixed(3)}\n👤 Resolved by: ${disaster.resolvedBy}\n⏰ Resolved at: ${new Date(disaster.resolvedAt || Date.now()).toLocaleString()}`,
      title: `✅ ${disaster.disasterType.toUpperCase()} RESOLVED`,
      priority: 'medium',
      requiresAction: false
    };
  }

  // Create notification for updated disaster
  private createDisasterUpdatedNotification(disaster: Disaster): DisasterNotificationPayload {
    return {
      type: 'disaster_updated',
      disaster,
      message: `📝 DISASTER UPDATED\n\n${disaster.disasterType.toUpperCase()} alert has been updated.\n\n📍 Location: ${disaster.location.lat.toFixed(3)}, ${disaster.location.lng.toFixed(3)}\n⏰ Updated at: ${new Date(disaster.updatedAt).toLocaleString()}`,
      title: `📝 ${disaster.disasterType.toUpperCase()} UPDATED`,
      priority: 'medium',
      requiresAction: false
    };
  }

  // Create notification for deleted disaster
  private createDisasterDeletedNotification(disaster: Disaster): DisasterNotificationPayload {
    return {
      type: 'disaster_resolved',
      disaster,
      message: `❌ DISASTER CANCELLED\n\n${disaster.disasterType.toUpperCase()} alert has been cancelled (false alarm).\n\n📍 Location: ${disaster.location.lat.toFixed(3)}, ${disaster.location.lng.toFixed(3)}\n👤 Cancelled by: ${disaster.resolvedBy}\n⏰ Cancelled at: ${new Date(disaster.resolvedAt || Date.now()).toLocaleString()}`,
      title: `❌ ${disaster.disasterType.toUpperCase()} CANCELLED`,
      priority: 'low',
      requiresAction: false
    };
  }

  // Show browser notification
  private showBrowserNotification(payload: DisasterNotificationPayload): void {
    if (!('Notification' in window)) {
      console.warn('Browser notifications not supported');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const notification = new Notification(payload.title, {
        body: payload.message,
        icon: '/favicon.ico',
        data: payload.disaster,
        tag: `disaster-${payload.disaster.id}`,
        requireInteraction: payload.requiresAction,
        silent: payload.priority === 'low'
      });

      // Add vibration for high priority alerts
      if (payload.priority === 'critical' && navigator.vibrate) {
        navigator.vibrate([500, 200, 500, 200, 500]);
      } else if (payload.priority === 'high' && navigator.vibrate) {
        navigator.vibrate([300, 100, 300]);
      }

      notification.onclick = () => {
        window.focus();
        console.log('Disaster notification clicked:', payload.disaster.id);
        // You can add navigation logic here
      };

      // Auto-close low priority notifications after 10 seconds
      if (payload.priority === 'low') {
        setTimeout(() => {
          notification.close();
        }, 10000);
      }

    } catch (error) {
      console.error('Error showing browser notification:', error);
    }
  }

  // Notify registered handlers
  private notifyHandlers(payload: DisasterNotificationPayload): void {
    this.notificationHandlers.forEach(handler => {
      try {
        handler(payload);
      } catch (error) {
        console.error('Error in notification handler:', error);
      }
    });
  }

  // Register notification handler
  onNotification(handler: (payload: DisasterNotificationPayload) => void): void {
    this.notificationHandlers.push(handler);
  }

  // Remove notification handler
  removeNotificationHandler(handler: (payload: DisasterNotificationPayload) => void): void {
    const index = this.notificationHandlers.indexOf(handler);
    if (index > -1) {
      this.notificationHandlers.splice(index, 1);
    }
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Browser notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Get current listening status
  getListeningStatus(): boolean {
    return this.isListening;
  }

  // Get active disaster count
  async getActiveDisasterCount(): Promise<number> {
    try {
      const disasters = await disasterService.getDisasters({ status: 'active' });
      return disasters.length;
    } catch (error) {
      console.error('Error getting active disaster count:', error);
      return 0;
    }
  }

  // Initialize MetaMask status
  private async initializeMetaMask(): Promise<void> {
    try {
      this.metaMaskStatus.installed = isMetaMaskInstalled();
      if (this.metaMaskStatus.installed) {
        this.metaMaskStatus.connected = await isMetaMaskConnected();
        this.metaMaskEnabled = this.metaMaskStatus.installed && this.metaMaskStatus.connected;
        
        console.log(`🦊 MetaMask status: ${this.metaMaskStatus.installed ? 'Installed' : 'Not installed'}, ${this.metaMaskStatus.connected ? 'Connected' : 'Not connected'}`);
        
        if (this.metaMaskEnabled) {
          console.log('✅ MetaMask notifications enabled');
        } else {
          console.log('⚠️ MetaMask notifications disabled - will use browser notifications only');
        }
      }
    } catch (error) {
      console.error('Error initializing MetaMask:', error);
      this.metaMaskEnabled = false;
    }
  }

  // Send MetaMask notification
  private async sendMetaMaskNotification(payload: DisasterNotificationPayload): Promise<void> {
    if (!this.metaMaskEnabled) {
      console.log('🦊 MetaMask not available, skipping MetaMask notification');
      return;
    }

    try {
      // Convert disaster notification payload to MetaMask payload
      const metaMaskPayload = createDisasterNotificationPayload(
        payload.disaster.disasterType,
        payload.disaster.severityLevel,
        payload.disaster.location,
        payload.disaster.reporterName || payload.disaster.reporterEmail,
        payload.disaster.timestamp
      );

      // Send MetaMask notification with appropriate options
      const options = {
        type: 'alert' as const,
        priority: payload.priority === 'critical' ? 'critical' as const : 
                 payload.priority === 'high' ? 'high' as const : 
                 payload.priority === 'medium' ? 'medium' as const : 'low' as const,
        requireInteraction: payload.requiresAction,
        timeout: 30000,
        retryAttempts: 3
      };

      console.log('🦊 Sending MetaMask notification...');
      const success = await sendDisasterNotification(metaMaskPayload, options);
      
      if (success) {
        console.log('✅ MetaMask notification sent successfully');
      } else {
        console.log('⚠️ MetaMask notification failed, but browser notification was sent');
      }
    } catch (error) {
      console.error('❌ Error sending MetaMask notification:', error);
    }
  }

  // Get MetaMask status
  getMetaMaskStatus(): { installed: boolean; connected: boolean; enabled: boolean } {
    return {
      ...this.metaMaskStatus,
      enabled: this.metaMaskEnabled
    };
  }

  // Enable/disable MetaMask notifications
  async setMetaMaskEnabled(enabled: boolean): Promise<void> {
    if (enabled) {
      await this.initializeMetaMask();
    } else {
      this.metaMaskEnabled = false;
      console.log('🦊 MetaMask notifications disabled by user');
    }
  }
}

// Export singleton instance
export const disasterNotificationService = DisasterNotificationService.getInstance();
