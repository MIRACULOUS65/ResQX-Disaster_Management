import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Disaster Management Specific Utilities

export interface Location {
  lat: number;
  lng: number;
}

export interface DisasterSeverity {
  level: number;
  label: string;
  color: string;
  description: string;
}

export interface DisasterType {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(loc1: Location, loc2: Location): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(loc2.lat - loc1.lat);
  const dLng = toRadians(loc2.lng - loc1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(loc1.lat)) * Math.cos(toRadians(loc2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Get disaster severity information
export function getDisasterSeverity(level: number): DisasterSeverity {
  if (level >= 9) {
    return {
      level,
      label: 'CRITICAL',
      color: '#dc2626',
      description: 'Immediate threat to life and property'
    };
  } else if (level >= 7) {
    return {
      level,
      label: 'HIGH',
      color: '#f59e0b',
      description: 'Significant threat requiring immediate action'
    };
  } else if (level >= 5) {
    return {
      level,
      label: 'MEDIUM',
      color: '#3b82f6',
      description: 'Moderate threat requiring attention'
    };
  } else if (level >= 3) {
    return {
      level,
      label: 'LOW',
      color: '#10b981',
      description: 'Minor threat with minimal impact'
    };
  } else {
    return {
      level,
      label: 'MINIMAL',
      color: '#6b7280',
      description: 'Very low threat level'
    };
  }
}

// Get disaster type information
export function getDisasterType(type: string): DisasterType {
  const types: Record<string, DisasterType> = {
    avalanche: {
      id: 'avalanche',
      name: 'Avalanche',
      icon: '🏔️',
      color: '#8b5cf6',
      description: 'Snow avalanche disaster'
    },
    flood: {
      id: 'flood',
      name: 'Flood',
      icon: '🌊',
      color: '#0ea5e9',
      description: 'Flooding disaster'
    },
    earthquake: {
      id: 'earthquake',
      name: 'Earthquake',
      icon: '🌍',
      color: '#8b5cf6',
      description: 'Seismic activity disaster'
    },
    wildfire: {
      id: 'wildfire',
      name: 'Wildfire',
      icon: '🔥',
      color: '#f97316',
      description: 'Wildfire disaster'
    },
    storm: {
      id: 'storm',
      name: 'Storm',
      icon: '⛈️',
      color: '#6366f1',
      description: 'Severe weather storm'
    },
    landslide: {
      id: 'landslide',
      name: 'Landslide',
      icon: '🏔️',
      color: '#92400e',
      description: 'Landslide disaster'
    },
    tsunami: {
      id: 'tsunami',
      name: 'Tsunami',
      icon: '🌊',
      color: '#0ea5e9',
      description: 'Tsunami disaster'
    }
  };

  return types[type.toLowerCase()] || {
    id: type.toLowerCase(),
    name: type.charAt(0).toUpperCase() + type.slice(1),
    icon: '⚠️',
    color: '#6b7280',
    description: 'Unknown disaster type'
  };
}

// Format timestamp for display
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now';
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  
  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  
  // More than 24 hours
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Format location for display
export function formatLocation(location: Location, precision: number = 3): string {
  return `${location.lat.toFixed(precision)}, ${location.lng.toFixed(precision)}`;
}

// Generate unique ID
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Debounce function for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Check if location is within range
export function isWithinRange(
  location1: Location,
  location2: Location,
  rangeKm: number
): boolean {
  return calculateDistance(location1, location2) <= rangeKm;
}

// Validate coordinates
export function isValidCoordinates(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
}

// Validate disaster severity level
export function isValidSeverityLevel(level: number): boolean {
  return (
    typeof level === 'number' &&
    level >= 1 &&
    level <= 10 &&
    Number.isInteger(level)
  );
}

// Get browser capabilities
export function getBrowserCapabilities() {
  return {
    notifications: 'Notification' in window,
    geolocation: 'geolocation' in navigator,
    serviceWorker: 'serviceWorker' in navigator,
    webRTC: !!(window.RTCPeerConnection || (window as any).webkitRTCPeerConnection),
    localStorage: 'localStorage' in window,
    sessionStorage: 'sessionStorage' in window,
    broadcastChannel: 'BroadcastChannel' in window,
    vibration: 'vibrate' in navigator
  };
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Deep clone object
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const clonedObj = {} as any;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

// Check if running in development mode
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

// Check if running in production mode
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

// Get environment-specific configuration
export function getEnvironmentConfig() {
  return {
    isDev: isDevelopment(),
    isProd: isProduction(),
    apiUrl: process.env.VITE_API_URL || 'http://localhost:3000',
    wsUrl: process.env.VITE_WS_URL || 'ws://localhost:3000',
    debug: process.env.VITE_DEBUG === 'true'
  };
}