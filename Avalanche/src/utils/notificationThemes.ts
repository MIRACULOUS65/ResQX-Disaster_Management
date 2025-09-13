// Notification Theme System for Disaster Management
// This file contains all the notification themes and utilities

export interface NotificationTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    text: string;
  };
  icon: string;
  style: 'standard' | 'urgent' | 'caution' | 'informational' | 'positive';
  vibration?: number[];
  requireInteraction?: boolean;
  silent?: boolean;
}

export const notificationThemes: Record<string, NotificationTheme> = {
  default: {
    name: "Default",
    colors: {
      primary: "#ef4444", // red-500
      secondary: "#fef2f2", // red-50
      text: "#991b1b", // red-800
    },
    icon: "🚨",
    style: "standard",
    vibration: [200, 100, 200]
  },
  emergency: {
    name: "Emergency",
    colors: {
      primary: "#dc2626", // red-600
      secondary: "#fee2e2", // red-100
      text: "#7f1d1d", // red-900
    },
    icon: "🚨",
    style: "urgent",
    vibration: [500, 200, 500, 200, 500],
    requireInteraction: true
  },
  warning: {
    name: "Warning",
    colors: {
      primary: "#f59e0b", // amber-500
      secondary: "#fef3c7", // amber-100
      text: "#92400e", // amber-800
    },
    icon: "⚠️",
    style: "caution",
    vibration: [300, 100, 300]
  },
  info: {
    name: "Information",
    colors: {
      primary: "#3b82f6", // blue-500
      secondary: "#dbeafe", // blue-100
      text: "#1e40af", // blue-800
    },
    icon: "ℹ️",
    style: "informational",
    vibration: [100],
    silent: true
  },
  success: {
    name: "Success",
    colors: {
      primary: "#10b981", // emerald-500
      secondary: "#d1fae5", // emerald-100
      text: "#065f46", // emerald-800
    },
    icon: "✅",
    style: "positive",
    vibration: [100, 50, 100]
  },
  flood: {
    name: "Flood Alert",
    colors: {
      primary: "#0ea5e9", // sky-500
      secondary: "#e0f2fe", // sky-100
      text: "#0c4a6e", // sky-900
    },
    icon: "🌊",
    style: "urgent",
    vibration: [400, 200, 400]
  },
  earthquake: {
    name: "Earthquake Alert",
    colors: {
      primary: "#8b5cf6", // violet-500
      secondary: "#ede9fe", // violet-100
      text: "#4c1d95", // violet-900
    },
    icon: "🌍",
    style: "urgent",
    vibration: [600, 300, 600, 300, 600]
  },
  wildfire: {
    name: "Wildfire Alert",
    colors: {
      primary: "#f97316", // orange-500
      secondary: "#fed7aa", // orange-200
      text: "#9a3412", // orange-800
    },
    icon: "🔥",
    style: "urgent",
    vibration: [300, 100, 300, 100, 300]
  },
  storm: {
    name: "Storm Alert",
    colors: {
      primary: "#6366f1", // indigo-500
      secondary: "#e0e7ff", // indigo-100
      text: "#3730a3", // indigo-800
    },
    icon: "⛈️",
    style: "urgent",
    vibration: [500, 100, 500]
  }
};

// Utility function to get theme by disaster type
export function getThemeByDisasterType(disasterType: string): NotificationTheme {
  const normalizedType = disasterType.toLowerCase();
  
  // Check if we have a specific theme for this disaster type
  if (notificationThemes[normalizedType]) {
    return notificationThemes[normalizedType];
  }
  
  // Default mapping based on severity
  return notificationThemes.default;
}

// Utility function to get theme by severity level
export function getThemeBySeverity(severity: number): NotificationTheme {
  if (severity >= 9) return notificationThemes.emergency;
  if (severity >= 7) return notificationThemes.warning;
  if (severity >= 5) return notificationThemes.info;
  return notificationThemes.default;
}

// Enhanced notification sender with theme support
export async function sendThemedNotification(
  title: string,
  body: string,
  theme: NotificationTheme,
  options: {
    data?: any;
    tag?: string;
    icon?: string;
    badge?: string;
  } = {}
): Promise<Notification | null> {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    console.warn("Notifications not supported or permission not granted");
    return null;
  }

  try {
    const notification = new Notification(`${theme.icon} ${title}`, {
      body,
      icon: options.icon || "/favicon.ico",
      badge: options.badge || "/favicon.ico",
      data: {
        theme: theme.name,
        ...options.data
      },
      tag: options.tag,
      requireInteraction: theme.requireInteraction || false,
      silent: theme.silent || false
    });

    // Add click handler
    notification.onclick = () => {
      window.focus();
      console.log("Notification clicked:", notification.data);
    };

    // Add vibration if supported
    if (navigator.vibrate && theme.vibration) {
      navigator.vibrate(theme.vibration);
    }

    return notification;
  } catch (error) {
    console.error("Failed to show notification:", error);
    return null;
  }
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    return "denied";
  }

  if (Notification.permission === "default") {
    return await Notification.requestPermission();
  }

  return Notification.permission;
}

// Check if notifications are supported and enabled
export function isNotificationSupported(): boolean {
  return "Notification" in window && Notification.permission === "granted";
}
