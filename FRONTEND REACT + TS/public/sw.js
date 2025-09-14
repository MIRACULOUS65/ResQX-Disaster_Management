// Service Worker for Offline Disaster Notifications
// This enables notifications even when the app is closed

const CACHE_NAME = 'disaster-notifications-v1';
const NOTIFICATION_QUEUE_KEY = 'disaster_notification_queue';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SEND_NOTIFICATION') {
    const { payload } = event.data;
    showNotification(payload);
  }
});

// Show notification
async function showNotification(payload) {
  const options = {
    body: payload.message,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: payload,
    tag: `disaster-${payload.id}`,
    requireInteraction: payload.severityLevel >= 7,
    actions: [
      {
        action: 'acknowledge',
        title: 'Acknowledge',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/favicon.ico'
      }
    ]
  };

  try {
    await self.registration.showNotification(payload.title, options);
    console.log('✅ Background notification shown:', payload.title);
  } catch (error) {
    console.error('❌ Failed to show notification:', error);
  }
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'acknowledge') {
    console.log('User acknowledged disaster alert');
    // Send acknowledgment back to main thread
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'NOTIFICATION_ACKNOWLEDGED',
          payload: event.notification.data
        });
      });
    });
  } else if (event.action === 'dismiss') {
    console.log('User dismissed disaster alert');
  } else {
    // Default click action - focus the app
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        if (clients.length > 0) {
          return clients[0].focus();
        } else {
          return self.clients.openWindow('/');
        }
      })
    );
  }
});

// Handle background sync (if supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'disaster-sync') {
    console.log('Background sync triggered');
    event.waitUntil(syncDisasterData());
  }
});

async function syncDisasterData() {
  try {
    // Get queued messages from IndexedDB
    const queuedMessages = await getQueuedMessages();
    
    if (queuedMessages.length > 0) {
      console.log(`Syncing ${queuedMessages.length} queued messages`);
      
      // Try to send messages to server
      for (const message of queuedMessages) {
        try {
          await sendToServer(message);
          await removeFromQueue(message.id);
        } catch (error) {
          console.error('Failed to sync message:', error);
        }
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getQueuedMessages() {
  // In a real implementation, you would use IndexedDB
  // For now, we'll use a simple approach
  return [];
}

async function sendToServer(message) {
  // In a real implementation, you would send to your server
  console.log('Sending to server:', message);
}

async function removeFromQueue(messageId) {
  // Remove message from queue after successful sync
  console.log('Removing from queue:', messageId);
}

// Handle push notifications (if you want to add server-sent notifications)
self.addEventListener('push', (event) => {
  if (event.data) {
    const payload = event.data.json();
    showNotification(payload);
  }
});

console.log('Service Worker loaded successfully');
