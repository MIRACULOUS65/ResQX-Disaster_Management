// MetaMask Notification System for Disaster Management
// This file handles notifications through MetaMask wallet integration

// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask: boolean;
      isConnected?: () => boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
      selectedAddress?: string;
      chainId?: string;
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
  timeout?: number; // Timeout in milliseconds
  retryAttempts?: number; // Number of retry attempts
}

export interface MetaMaskError extends Error {
  code: number;
  message: string;
  data?: any;
}

export interface MetaMaskConnectionStatus {
  isInstalled: boolean;
  isConnected: boolean;
  account?: string;
  chainId?: string;
  error?: string;
}

// Check if MetaMask is installed and available
export function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && 
         typeof window.ethereum !== 'undefined' && 
         window.ethereum.isMetaMask === true;
}

// Get comprehensive MetaMask connection status
export async function getMetaMaskStatus(): Promise<MetaMaskConnectionStatus> {
  const status: MetaMaskConnectionStatus = {
    isInstalled: isMetaMaskInstalled(),
    isConnected: false
  };

  if (!status.isInstalled) {
    status.error = 'MetaMask is not installed';
    return status;
  }

  try {
    const accounts = await window.ethereum!.request({ method: 'eth_accounts' });
    status.isConnected = accounts.length > 0;
    status.account = accounts[0];
    
    // Get chain ID
    try {
      const chainId = await window.ethereum!.request({ method: 'eth_chainId' });
      status.chainId = chainId;
    } catch (chainError) {
      console.warn('Could not get chain ID:', chainError);
    }
  } catch (error) {
    status.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return status;
}

// Check if MetaMask is connected
export async function isMetaMaskConnected(): Promise<boolean> {
  const status = await getMetaMaskStatus();
  return status.isConnected;
}

// Request MetaMask connection with better error handling
export async function connectMetaMask(): Promise<string[]> {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts returned from MetaMask');
    }
    
    return accounts;
  } catch (error: any) {
    const metaMaskError: MetaMaskError = {
      name: 'MetaMaskConnectionError',
      message: error.message || 'Failed to connect to MetaMask',
      code: error.code || -1,
      data: error.data
    };
    
    console.error('Error connecting to MetaMask:', metaMaskError);
    throw metaMaskError;
  }
}

// Send a disaster alert notification through MetaMask with retry logic
export async function sendMetaMaskNotification(
  payload: MetaMaskNotificationPayload,
  options: MetaMaskNotificationOptions = {
    type: 'alert',
    priority: 'high',
    requireInteraction: true,
    timeout: 30000, // 30 seconds timeout
    retryAttempts: 3
  }
): Promise<boolean> {
  if (!isMetaMaskInstalled()) {
    console.warn('MetaMask is not installed, falling back to browser notifications');
    return false;
  }

  const maxRetries = options.retryAttempts || 3;
  const timeout = options.timeout || 30000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🚨 Sending disaster alert through MetaMask (attempt ${attempt}/${maxRetries})...`);
      
      // Check if MetaMask is connected
      const isConnected = await isMetaMaskConnected();
      if (!isConnected) {
        console.warn('MetaMask is not connected, falling back to browser notifications');
        return false;
      }

      // Primary method: Try simple popup first
      const simpleSuccess = await Promise.race([
        sendMetaMaskSimpleNotification(payload),
        new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error('Simple notification timeout')), timeout)
        )
      ]);
      
      if (simpleSuccess) {
        console.log('✅ MetaMask simple notification sent successfully');
        return true;
      }

      // Fallback method: Use personal_sign to get user acknowledgment
      const signatureSuccess = await Promise.race([
        sendMetaMaskSignatureNotification(payload),
        new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error('Signature timeout')), timeout)
        )
      ]);
      
      if (signatureSuccess) {
        console.log('✅ MetaMask signature notification sent successfully');
        return true;
      }

      // If signature fails, try transaction method as backup
      if (attempt === maxRetries) {
        console.log('🔄 Trying transaction method as final backup...');
        try {
          const txSuccess = await Promise.race([
            createNotificationTransaction(payload, options),
            new Promise<any>((_, reject) => 
              setTimeout(() => reject(new Error('Transaction timeout')), timeout)
            )
          ]);
          
          if (txSuccess) {
            console.log('✅ MetaMask transaction notification sent successfully');
            return true;
          }
        } catch (txError) {
          console.warn('Transaction notification also failed:', txError);
        }
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

    } catch (error) {
      console.error(`Error sending MetaMask notification (attempt ${attempt}):`, error);
      
      if (attempt === maxRetries) {
        console.error('All MetaMask notification attempts failed');
        return false;
      }
    }
  }

  return false;
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

// Simple method: Just request accounts to trigger MetaMask popup
export async function sendMetaMaskSimpleNotification(
  payload: MetaMaskNotificationPayload
): Promise<boolean> {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    return false;
  }

  try {
    console.log('🔔 Triggering MetaMask popup for disaster alert...');
    
    // This will trigger a MetaMask popup asking for account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });

    if (accounts && accounts.length > 0) {
      console.log('✅ MetaMask popup triggered successfully');
      
      // Also show a browser notification as backup
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(payload.title, {
          body: payload.message,
          icon: '/favicon.ico',
          tag: `disaster-${payload.disasterType}-${payload.timestamp}`
        });
      }
      
      return true;
    }

    return false;
  } catch (error: any) {
    if (error.code === 4001) {
      console.log('❌ User rejected the MetaMask popup');
      return false;
    }
    console.error('Error triggering MetaMask popup:', error);
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
