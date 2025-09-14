// Notification Theme System for Disaster Management
// This file contains all the notification themes and utilities

export interface NotificationTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background?: string;
    border?: string;
  };
  icon: string;
  style: 'standard' | 'urgent' | 'caution' | 'informational' | 'positive';
  vibration?: number[];
  requireInteraction?: boolean;
  silent?: boolean;
  sound?: string; // URL to custom sound file
  duration?: number; // Auto-close duration in ms (0 = no auto-close)
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  size?: 'small' | 'medium' | 'large';
}

export interface ThemeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface NotificationConfig {
  theme: NotificationTheme;
  customTitle?: string;
  customMessage?: string;
  data?: Record<string, any>;
  tag?: string;
  icon?: string;
  badge?: string;
  image?: string;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export const notificationThemes: Record<string, NotificationTheme> = {
  default: {
    name: "Default",
    colors: {
      primary: "#ef4444", // red-500
      secondary: "#fef2f2", // red-50
      text: "#991b1b", // red-800
      background: "#ffffff",
      border: "#ef4444"
    },
    icon: "🚨",
    style: "standard",
    vibration: [200, 100, 200],
    duration: 0,
    position: "top-right",
    size: "medium"
  },
  emergency: {
    name: "Emergency",
    colors: {
      primary: "#dc2626", // red-600
      secondary: "#fee2e2", // red-100
      text: "#7f1d1d", // red-900
      background: "#ffffff",
      border: "#dc2626"
    },
    icon: "🚨",
    style: "urgent",
    vibration: [500, 200, 500, 200, 500],
    requireInteraction: true,
    duration: 0,
    position: "center",
    size: "large"
  },
  warning: {
    name: "Warning",
    colors: {
      primary: "#f59e0b", // amber-500
      secondary: "#fef3c7", // amber-100
      text: "#92400e", // amber-800
      background: "#ffffff",
      border: "#f59e0b"
    },
    icon: "⚠️",
    style: "caution",
    vibration: [300, 100, 300],
    duration: 5000,
    position: "top-right",
    size: "medium"
  },
  info: {
    name: "Information",
    colors: {
      primary: "#3b82f6", // blue-500
      secondary: "#dbeafe", // blue-100
      text: "#1e40af", // blue-800
      background: "#ffffff",
      border: "#3b82f6"
    },
    icon: "ℹ️",
    style: "informational",
    vibration: [100],
    silent: true,
    duration: 3000,
    position: "top-right",
    size: "small"
  },
  success: {
    name: "Success",
    colors: {
      primary: "#10b981", // emerald-500
      secondary: "#d1fae5", // emerald-100
      text: "#065f46", // emerald-800
      background: "#ffffff",
      border: "#10b981"
    },
    icon: "✅",
    style: "positive",
    vibration: [100, 50, 100],
    duration: 4000,
    position: "top-right",
    size: "medium"
  },
  flood: {
    name: "Flood Alert",
    colors: {
      primary: "#0ea5e9", // sky-500
      secondary: "#e0f2fe", // sky-100
      text: "#0c4a6e", // sky-900
      background: "#ffffff",
      border: "#0ea5e9"
    },
    icon: "🌊",
    style: "urgent",
    vibration: [400, 200, 400],
    duration: 0,
    position: "center",
    size: "large"
  },
  earthquake: {
    name: "Earthquake Alert",
    colors: {
      primary: "#8b5cf6", // violet-500
      secondary: "#ede9fe", // violet-100
      text: "#4c1d95", // violet-900
      background: "#ffffff",
      border: "#8b5cf6"
    },
    icon: "🌍",
    style: "urgent",
    vibration: [600, 300, 600, 300, 600],
    duration: 0,
    position: "center",
    size: "large"
  },
  wildfire: {
    name: "Wildfire Alert",
    colors: {
      primary: "#f97316", // orange-500
      secondary: "#fed7aa", // orange-200
      text: "#9a3412", // orange-800
      background: "#ffffff",
      border: "#f97316"
    },
    icon: "🔥",
    style: "urgent",
    vibration: [300, 100, 300, 100, 300],
    duration: 0,
    position: "center",
    size: "large"
  },
  storm: {
    name: "Storm Alert",
    colors: {
      primary: "#6366f1", // indigo-500
      secondary: "#e0e7ff", // indigo-100
      text: "#3730a3", // indigo-800
      background: "#ffffff",
      border: "#6366f1"
    },
    icon: "⛈️",
    style: "urgent",
    vibration: [500, 100, 500],
    duration: 0,
    position: "center",
    size: "large"
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

// Validate a notification theme
export function validateTheme(theme: NotificationTheme): ThemeValidationResult {
  const result: ThemeValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check required properties
  if (!theme.name) {
    result.errors.push("Theme name is required");
    result.isValid = false;
  }

  if (!theme.colors?.primary) {
    result.errors.push("Primary color is required");
    result.isValid = false;
  }

  if (!theme.colors?.secondary) {
    result.errors.push("Secondary color is required");
    result.isValid = false;
  }

  if (!theme.colors?.text) {
    result.errors.push("Text color is required");
    result.isValid = false;
  }

  if (!theme.icon) {
    result.errors.push("Icon is required");
    result.isValid = false;
  }

  if (!theme.style) {
    result.errors.push("Style is required");
    result.isValid = false;
  }

  // Validate color format
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (theme.colors?.primary && !colorRegex.test(theme.colors.primary)) {
    result.errors.push("Primary color must be a valid hex color");
    result.isValid = false;
  }

  if (theme.colors?.secondary && !colorRegex.test(theme.colors.secondary)) {
    result.errors.push("Secondary color must be a valid hex color");
    result.isValid = false;
  }

  if (theme.colors?.text && !colorRegex.test(theme.colors.text)) {
    result.errors.push("Text color must be a valid hex color");
    result.isValid = false;
  }

  // Validate style
  const validStyles = ['standard', 'urgent', 'caution', 'informational', 'positive'];
  if (theme.style && !validStyles.includes(theme.style)) {
    result.errors.push(`Style must be one of: ${validStyles.join(', ')}`);
    result.isValid = false;
  }

  // Validate vibration pattern
  if (theme.vibration && !Array.isArray(theme.vibration)) {
    result.warnings.push("Vibration should be an array of numbers");
  }

  if (theme.vibration && theme.vibration.some(v => typeof v !== 'number' || v < 0)) {
    result.warnings.push("Vibration values should be positive numbers");
  }

  // Validate duration
  if (theme.duration !== undefined && (theme.duration < 0 || !Number.isInteger(theme.duration))) {
    result.warnings.push("Duration should be a non-negative integer");
  }

  // Validate position
  const validPositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'];
  if (theme.position && !validPositions.includes(theme.position)) {
    result.warnings.push(`Position should be one of: ${validPositions.join(', ')}`);
  }

  // Validate size
  const validSizes = ['small', 'medium', 'large'];
  if (theme.size && !validSizes.includes(theme.size)) {
    result.warnings.push(`Size should be one of: ${validSizes.join(', ')}`);
  }

  return result;
}

// Get all available themes
export function getAllThemes(): NotificationTheme[] {
  return Object.values(notificationThemes);
}

// Get theme names
export function getThemeNames(): string[] {
  return Object.keys(notificationThemes);
}

// Create a custom theme
export function createCustomTheme(
  name: string,
  colors: NotificationTheme['colors'],
  icon: string,
  style: NotificationTheme['style'],
  options: Partial<NotificationTheme> = {}
): NotificationTheme {
  const theme: NotificationTheme = {
    name,
    colors: {
      primary: colors.primary,
      secondary: colors.secondary,
      text: colors.text,
      background: colors.background || '#ffffff',
      border: colors.border || colors.primary
    },
    icon,
    style,
    ...options
  };

  return theme;
}

// Merge themes (useful for creating variations)
export function mergeThemes(baseTheme: NotificationTheme, overrides: Partial<NotificationTheme>): NotificationTheme {
  return {
    ...baseTheme,
    ...overrides,
    colors: {
      ...baseTheme.colors,
      ...overrides.colors
    }
  };
}

// Get theme by severity with custom mapping
export function getThemeBySeverityWithCustomMapping(
  severity: number,
  customMapping?: Record<number, string>
): NotificationTheme {
  if (customMapping && customMapping[severity]) {
    return notificationThemes[customMapping[severity]] || notificationThemes.default;
  }
  
  return getThemeBySeverity(severity);
}

// Check if theme exists
export function themeExists(themeName: string): boolean {
  return themeName in notificationThemes;
}

// Get theme by name with fallback
export function getThemeByName(themeName: string, fallback: string = 'default'): NotificationTheme {
  return notificationThemes[themeName] || notificationThemes[fallback] || notificationThemes.default;
}
