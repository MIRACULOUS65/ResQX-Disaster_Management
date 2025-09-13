// MetaMask Notification System for Disaster Management
// This file handles notifications through MetaMask wallet integration

// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

export interface MetaMaskNotificationPayload {
  disasterType: string;
  severityLevel: number;
  location: { lat: number; lng: number };
  reporter?: string;
  timestamp: number;
  message: string;
  title: string;
}

export interface MetaMaskNotificationOptions {
  type: 'transaction' | 'alert' | 'warning' | 'info';
  priority: 'low' | 'medium' | 'high' | 'critical';
  requireInteraction?: boolean;
  data?: any;
}

// Check if MetaMask is installed and available
export function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && 
         typeof window.ethereum !== 'undefined' && 
         window.ethereum.isMetaMask;
}

// Check if MetaMask is connected
export async function isMetaMaskConnected(): Promise<boolean> {
  if (!isMetaMaskInstalled() || !window.ethereum) return false;
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts.length > 0;
  } catch (error) {
    console.error('Error checking MetaMask connection:', error);
    return false;
  }
}

// Request MetaMask connection
export async function connectMetaMask(): Promise<string[]> {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    return accounts;
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    throw error;
  }
}

// Send a disaster alert notification through MetaMask
export async function sendMetaMaskNotification(
  payload: MetaMaskNotificationPayload,
  options: MetaMaskNotificationOptions = {
    type: 'alert',
    priority: 'high',
    requireInteraction: true
  }
): Promise<boolean> {
  if (!isMetaMaskInstalled()) {
    console.warn('MetaMask is not installed, falling back to browser notifications');
    return false;
  }

  try {
    // Check if MetaMask is connected
    const isConnected = await isMetaMaskConnected();
    if (!isConnected) {
      console.warn('MetaMask is not connected, falling back to browser notifications');
      return false;
    }

    // For disaster alerts, we'll use personal_sign as the primary method
    // This will show a MetaMask popup that the user must interact with
    // This is the most reliable way to get user attention through MetaMask

    console.log('🚨 Sending disaster alert through MetaMask...');
    
    // Primary method: Use personal_sign to get user acknowledgment
    // This will show a MetaMask popup that the user must interact with
    const signatureSuccess = await sendMetaMaskSignatureNotification(payload);
    
    if (signatureSuccess) {
      console.log('✅ MetaMask signature notification sent successfully');
      return true;
    }

    // If signature fails, try transaction method as backup
    // This might trigger wallet activity notifications if enabled
    try {
      console.log('🔄 Trying transaction method as backup...');
      const txSuccess = await createNotificationTransaction(payload, options);
      if (txSuccess) {
        console.log('✅ MetaMask transaction notification sent successfully');
        return true;
      }
    } catch (txError) {
      console.warn('Transaction notification also failed');
    }

    return false;
  } catch (error) {
    console.error('Error sending MetaMask notification:', error);
    return false;
  }
}

// Create a notification transaction that will trigger MetaMask notifications
async function createNotificationTransaction(
  payload: MetaMaskNotificationPayload,
  options: MetaMaskNotificationOptions
): Promise<any> {
  if (!window.ethereum) {
    throw new Error('MetaMask not available');
  }

  try {
    // Get the current account
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
      throw new Error('No MetaMask account connected');
    }

    const from = accounts[0];

    // For disaster alerts, we'll create a transaction that:
    // 1. Sends 0 ETH to a disaster relief contract (if available)
    // 2. Or sends to a known address with disaster data
    // 3. This should trigger MetaMask's wallet activity notifications

    // Use a known disaster relief address or the user's own address
    const disasterReliefAddress = '0x0000000000000000000000000000000000000000'; // Placeholder
    
    const transactionParameters = {
      from: from,
      to: disasterReliefAddress, // Send to disaster relief or self
      value: '0x0', // 0 ETH - this is just for notification
      data: encodeDisasterData(payload),
      gas: '0x5208', // 21000 gas limit for simple transfer
    };

    console.log('📤 Creating disaster notification transaction...');
    
    // Request the transaction
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });

    console.log('✅ Disaster notification transaction sent:', txHash);
    return txHash;
  } catch (error: any) {
    if (error.code === 4001) {
      console.log('❌ User rejected the disaster notification transaction');
      throw error;
    }
    console.error('Error creating notification transaction:', error);
    throw error;
  }
}

// Encode disaster data into transaction data
function encodeDisasterData(payload: MetaMaskNotificationPayload): string {
  // Simple encoding: prefix + disaster type + severity + coordinates
  const prefix = '0x4449534153544552'; // "DISASTER" in hex
  const disasterType = payload.disasterType.padEnd(10, '\0').substring(0, 10);
  const severity = payload.severityLevel.toString(16).padStart(2, '0');
  const lat = Math.round(payload.location.lat * 1000000).toString(16).padStart(8, '0');
  const lng = Math.round(payload.location.lng * 1000000).toString(16).padStart(8, '0');
  
  // Convert string to hex
  const disasterTypeHex = Array.from(disasterType)
    .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
  
  return prefix + disasterTypeHex + severity + lat + lng;
}

// Alternative method: Use MetaMask's personal_sign to create a signature-based notification
export async function sendMetaMaskSignatureNotification(
  payload: MetaMaskNotificationPayload
): Promise<boolean> {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    return false;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
      return false;
    }

    // Create a more prominent disaster alert message
    const severityEmoji = payload.severityLevel >= 8 ? '🚨🚨🚨' : 
                         payload.severityLevel >= 6 ? '⚠️⚠️' : '⚠️';
    
    const message = `${severityEmoji} URGENT DISASTER ALERT ${severityEmoji}

🌊 DISASTER TYPE: ${payload.disasterType.toUpperCase()}
📊 SEVERITY LEVEL: ${payload.severityLevel}/10
📍 LOCATION: ${payload.location.lat.toFixed(3)}, ${payload.location.lng.toFixed(3)}
⏰ TIME: ${new Date(payload.timestamp).toLocaleString()}
👤 REPORTER: ${payload.reporter || 'Emergency System'}

⚠️  IMMEDIATE ACTION REQUIRED  ⚠️
Please take appropriate safety measures immediately.

This signature confirms you have been notified of this critical disaster alert.`;

    console.log('🔐 Requesting MetaMask signature for disaster alert...');
    
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, accounts[0]],
    });

    console.log('✅ MetaMask signature notification sent:', signature);
    return true;
  } catch (error: any) {
    if (error.code === 4001) {
      console.log('❌ User rejected the disaster alert signature');
      return false;
    }
    console.error('Error sending MetaMask signature notification:', error);
    return false;
  }
}

// Fallback to browser notifications if MetaMask is not available
export async function sendFallbackNotification(
  payload: MetaMaskNotificationPayload,
  options: MetaMaskNotificationOptions
): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return false;
  }

  if (Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return false;
    }
  }

  try {
    const notification = new Notification(payload.title, {
      body: payload.message,
      icon: '/favicon.ico',
      data: payload,
      tag: `disaster-${payload.disasterType}-${payload.timestamp}`,
      requireInteraction: options.requireInteraction || false,
      silent: options.priority === 'low'
    });

    // Add vibration if supported
    if (navigator.vibrate && options.priority !== 'low') {
      const vibrationPattern = options.priority === 'critical' ? [500, 200, 500] : [200, 100, 200];
      navigator.vibrate(vibrationPattern);
    }

    notification.onclick = () => {
      window.focus();
      console.log('Disaster notification clicked:', payload);
    };

    return true;
  } catch (error) {
    console.error('Error sending fallback notification:', error);
    return false;
  }
}

// Main function to send disaster notifications
export async function sendDisasterNotification(
  payload: MetaMaskNotificationPayload,
  options: MetaMaskNotificationOptions = {
    type: 'alert',
    priority: 'high',
    requireInteraction: true
  }
): Promise<boolean> {
  console.log('🚨 Attempting to send disaster notification:', payload);
  
  // Try MetaMask first if available and connected
  if (isMetaMaskInstalled()) {
    try {
      const isConnected = await isMetaMaskConnected();
      if (isConnected) {
        console.log('🔗 MetaMask is connected, attempting notification...');
        const metaMaskSuccess = await sendMetaMaskNotification(payload, options);
        if (metaMaskSuccess) {
          console.log('✅ MetaMask notification sent successfully');
          return true;
        } else {
          console.log('⚠️ MetaMask notification failed, trying fallback...');
        }
      } else {
        console.log('⚠️ MetaMask not connected, trying fallback...');
      }
    } catch (error) {
      console.error('❌ MetaMask notification error:', error);
    }
  } else {
    console.log('📱 MetaMask not installed, using browser notifications');
  }

  // Fallback to browser notifications
  console.log('🔄 Falling back to browser notifications...');
  const fallbackSuccess = await sendFallbackNotification(payload, options);
  
  if (fallbackSuccess) {
    console.log('✅ Browser notification sent successfully');
  } else {
    console.log('❌ All notification methods failed');
  }
  
  return fallbackSuccess;
}

// Utility function to create notification payload from disaster data
export function createDisasterNotificationPayload(
  disasterType: string,
  severityLevel: number,
  location: { lat: number; lng: number },
  reporter?: string,
  timestamp?: number,
  tabId?: string
): MetaMaskNotificationPayload {
  const severityText = severityLevel >= 8 ? 'CRITICAL' : 
                      severityLevel >= 6 ? 'HIGH' : 
                      severityLevel >= 4 ? 'MEDIUM' : 'LOW';

  const tabIdentifier = tabId ? ` [Tab: ${tabId.slice(-4)}]` : '';

  return {
    disasterType,
    severityLevel,
    location,
    reporter: reporter || 'System',
    timestamp: timestamp || Date.now(),
    title: `🚨 ${disasterType.toUpperCase()} ALERT - ${severityText} SEVERITY${tabIdentifier}`,
    message: `A ${severityText.toLowerCase()} severity ${disasterType} has been detected at coordinates ${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}. Please take appropriate safety measures.${tabId ? `\n\nThis alert was sent from tab instance: ${tabId}` : ''}`
  };
}
