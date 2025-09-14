# 🎨 Notification Themes Guide

This guide explains how to use the notification theme system in your disaster management application.

## 📋 Overview

The notification theme system provides customizable, context-aware notifications for different types of disasters and severity levels. Each theme includes:

- **Visual styling** (colors, icons)
- **Behavior settings** (vibration patterns, interaction requirements)
- **Audio settings** (silent mode for informational alerts)

## 🚀 Quick Start

### 1. Basic Usage

```typescript
import { notifyAlert } from "./p2p-notifier";

// Send a disaster alert (theme automatically selected)
await notifyAlert({
  disasterType: "flood",
  severityLevel: 8,
  location: { lat: 22.5726, lng: 88.3639 },
  reporter: "user-123",
  timestamp: Date.now()
});
```

### 2. Manual Theme Selection

```typescript
import { sendThemedNotification, notificationThemes } from "./utils/notificationThemes";

// Send notification with specific theme
await sendThemedNotification(
  "Flood Alert",
  "Severe flooding detected in Kolkata area",
  notificationThemes.flood,
  {
    data: { severity: 8, location: "Kolkata" },
    tag: "flood-alert-001"
  }
);
```

## 🎨 Available Themes

### Default Themes

| Theme | Icon | Use Case | Vibration Pattern |
|-------|------|----------|-------------------|
| **Default** | 🚨 | General alerts | Standard (200ms) |
| **Emergency** | 🚨 | Critical situations | Strong (500ms) |
| **Warning** | ⚠️ | Caution alerts | Medium (300ms) |
| **Info** | ℹ️ | Informational | Light (100ms) |
| **Success** | ✅ | Positive outcomes | Success (100ms) |

### Disaster-Specific Themes

| Theme | Icon | Colors | Special Features |
|-------|------|--------|------------------|
| **Flood** | 🌊 | Blue tones | Urgent vibration |
| **Earthquake** | 🌍 | Purple tones | Strong vibration |
| **Wildfire** | 🔥 | Orange tones | Urgent vibration |
| **Storm** | ⛈️ | Indigo tones | Urgent vibration |

## 🔧 Theme Configuration

### Custom Theme Creation

```typescript
const customTheme: NotificationTheme = {
  name: "Custom Alert",
  colors: {
    primary: "#ff6b6b",
    secondary: "#ffe0e0",
    text: "#8b0000"
  },
  icon: "🚨",
  style: "urgent",
  vibration: [400, 200, 400],
  requireInteraction: true,
  silent: false
};
```

### Theme Selection Logic

The system automatically selects themes based on:

1. **Disaster Type**: Specific themes for floods, earthquakes, etc.
2. **Severity Level**: 
   - Level 9+: Emergency theme
   - Level 7-8: Warning theme
   - Level 5-6: Info theme
   - Level 1-4: Default theme

## 📱 Browser Integration

### Permission Handling

```typescript
import { requestNotificationPermission, isNotificationSupported } from "./utils/notificationThemes";

// Request permission
const permission = await requestNotificationPermission();

// Check if supported
if (isNotificationSupported()) {
  // Send notifications
}
```

### Notification Features

- **Click handling**: Focus window on click
- **Vibration patterns**: Different patterns per theme
- **Tagging**: Prevent duplicate notifications
- **Data storage**: Attach custom data to notifications

## 🎯 Real-World Examples

### 1. Flood Alert System

```typescript
// Automatic theme selection based on severity
await notifyAlert({
  disasterType: "flood",
  severityLevel: 9, // Will use emergency theme
  location: { lat: 22.5726, lng: 88.3639 },
  timestamp: Date.now()
});
```

### 2. Earthquake Detection

```typescript
// Uses earthquake-specific theme
await notifyAlert({
  disasterType: "earthquake",
  severityLevel: 7, // Will use warning theme
  location: { lat: 28.3949, lng: 84.1240 },
  timestamp: Date.now()
});
```

### 3. Wildfire Monitoring

```typescript
// Uses wildfire-specific theme with urgent vibration
await notifyAlert({
  disasterType: "wildfire",
  severityLevel: 8, // Will use emergency theme
  location: { lat: 15.3173, lng: 75.7139 },
  timestamp: Date.now()
});
```

## 🎨 UI Components

### Theme Selector Component

The `NotificationThemeDemo` component provides:

- **Theme preview**: See colors and icons
- **Permission management**: Request notification access
- **Test notifications**: Try different themes
- **Real-time feedback**: See last sent notification

### Integration with Disaster Map

Themes automatically integrate with:

- **Disaster Map Modal**: Shows themed notifications
- **P2P Alert System**: Broadcasts themed alerts
- **Real-time Updates**: Consistent theming across components

## 🔧 Advanced Customization

### Custom Vibration Patterns

```typescript
const customVibration = {
  emergency: [500, 200, 500, 200, 500], // Strong alert
  warning: [300, 100, 300], // Medium alert
  info: [100], // Light alert
  success: [100, 50, 100] // Success pattern
};
```

### Theme Inheritance

```typescript
// Create theme based on existing one
const extendedTheme = {
  ...notificationThemes.flood,
  name: "Extended Flood Alert",
  vibration: [600, 300, 600], // Custom vibration
  requireInteraction: true // Force user interaction
};
```

## 📊 Performance Considerations

- **Theme caching**: Themes are loaded once and cached
- **Lazy loading**: Themes loaded only when needed
- **Memory efficient**: Minimal memory footprint
- **Fast switching**: Instant theme changes

## 🚀 Best Practices

1. **Use appropriate themes**: Match theme to disaster type and severity
2. **Request permissions early**: Ask for notification permission on app load
3. **Provide fallbacks**: Handle cases where notifications aren't supported
4. **Test thoroughly**: Test all themes on different devices
5. **Monitor performance**: Track notification delivery rates

## 🔍 Debugging

### Console Logging

```typescript
// Enable debug mode
console.log("🚨 Disaster Alert:", payload);
console.log("📡 Broadcasting via P2P network...");
```

### Permission Status

```typescript
console.log("Notification permission:", Notification.permission);
console.log("Notifications supported:", "Notification" in window);
```

## 📱 Mobile Considerations

- **Vibration support**: Check `navigator.vibrate` availability
- **Permission handling**: Different behavior on mobile browsers
- **Theme adaptation**: Consider mobile-specific styling
- **Performance**: Optimize for mobile devices

This notification theme system provides a comprehensive, customizable solution for disaster alert notifications with automatic theme selection based on disaster type and severity level.
