import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Bell, Settings, Palette } from "lucide-react";
import { notificationThemes, type NotificationTheme } from "../utils/notificationThemes";

// Use the imported themes

export default function NotificationThemeDemo() {
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof notificationThemes>("default");
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [lastNotification, setLastNotification] = useState<any>(null);

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const sendThemedNotification = async (disasterType: string, severity: number) => {
    const theme = notificationThemes[selectedTheme];
    
    if ("Notification" in window && Notification.permission === "granted") {
      const title = `${theme.icon} ${theme.name.toUpperCase()}: ${disasterType.toUpperCase()} (Lvl ${severity})`;
      const body = `Location: 22.5726, 88.3639\nSeverity: Level ${severity}\nTime: ${new Date().toLocaleTimeString()}`;
      
      try {
        const notification = new Notification(title, {
          body,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          data: {
            theme: selectedTheme,
            disasterType,
            severity,
            timestamp: Date.now()
          },
          tag: `disaster-${disasterType}-${severity}`,
          requireInteraction: theme.style === "urgent",
          silent: theme.style === "informational"
        });

        notification.onclick = () => {
          window.focus();
          console.log("Notification clicked:", notification.data);
        };

        // Vibrate based on theme
        if (navigator.vibrate) {
          switch (theme.style) {
            case "urgent":
              navigator.vibrate([500, 200, 500, 200, 500]); // Strong vibration
              break;
            case "caution":
              navigator.vibrate([300, 100, 300]); // Medium vibration
              break;
            case "standard":
              navigator.vibrate([200, 100, 200]); // Standard vibration
              break;
            case "informational":
              navigator.vibrate([100]); // Light vibration
              break;
            case "positive":
              navigator.vibrate([100, 50, 100]); // Success vibration
              break;
          }
        }

        setLastNotification({
          theme: selectedTheme,
          disasterType,
          severity,
          timestamp: new Date().toLocaleTimeString()
        });

      } catch (error) {
        console.error("Failed to show notification:", error);
      }
    }
  };

  const disasterTypes = [
    { type: "flood", severity: 8 },
    { type: "earthquake", severity: 7 },
    { type: "wildfire", severity: 6 },
    { type: "storm", severity: 9 },
    { type: "volcano", severity: 5 }
  ];

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="bg-background border border-border rounded-2xl p-8"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Palette className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold mb-2">🎨 Notification Theme Customizer</h3>
        <p className="text-muted-foreground mb-4">
          Customize notification themes and test different alert styles for your disaster management system.
        </p>
      </div>

      {/* Theme Selection */}
      <div className="mb-8">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Select Notification Theme
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(notificationThemes).map(([key, theme]) => (
            <motion.button
              key={key}
              onClick={() => setSelectedTheme(key as keyof typeof notificationThemes)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedTheme === key 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">{theme.icon}</div>
                <div className="text-sm font-medium">{theme.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{theme.style}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Permission Status */}
      <div className="mb-6 p-4 rounded-lg bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="font-medium">Notification Permission</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              notificationPermission === "granted" ? "bg-green-500" :
              notificationPermission === "denied" ? "bg-red-500" : "bg-yellow-500"
            }`}></div>
            <span className="text-sm capitalize">{notificationPermission}</span>
            {notificationPermission === "default" && (
              <Button onClick={requestNotificationPermission} size="sm" variant="outline">
                Enable
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Test Notifications */}
      <div className="mb-6">
        <h4 className="font-semibold mb-4">Test Disaster Notifications</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {disasterTypes.map((disaster) => (
            <motion.button
              key={disaster.type}
              onClick={() => sendThemedNotification(disaster.type, disaster.severity)}
              disabled={notificationPermission !== "granted"}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="p-3 rounded-lg border border-border hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <div className="text-lg mb-1 capitalize">{disaster.type}</div>
                <div className="text-sm text-muted-foreground">Level {disaster.severity}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Last Notification Info */}
      {lastNotification && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg border border-border"
          style={{
            backgroundColor: notificationThemes[lastNotification.theme as keyof typeof notificationThemes].colors.secondary,
            borderColor: notificationThemes[lastNotification.theme as keyof typeof notificationThemes].colors.primary + "40"
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: notificationThemes[lastNotification.theme as keyof typeof notificationThemes].colors.primary }}
            ></div>
            <span 
              className="font-medium"
              style={{ color: notificationThemes[lastNotification.theme as keyof typeof notificationThemes].colors.text }}
            >
              Last Notification Sent
            </span>
          </div>
          <div className="text-sm space-y-1">
            <div><span className="font-medium">Theme:</span> {notificationThemes[lastNotification.theme as keyof typeof notificationThemes].name}</div>
            <div><span className="font-medium">Type:</span> {lastNotification.disasterType.toUpperCase()}</div>
            <div><span className="font-medium">Severity:</span> Level {lastNotification.severity}</div>
            <div><span className="font-medium">Time:</span> {lastNotification.timestamp}</div>
          </div>
        </motion.div>
      )}

      {/* Theme Preview */}
      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <h4 className="font-semibold mb-3">Current Theme Preview</h4>
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
            style={{ backgroundColor: notificationThemes[selectedTheme].colors.secondary }}
          >
            {notificationThemes[selectedTheme].icon}
          </div>
          <div>
            <div 
              className="font-semibold"
              style={{ color: notificationThemes[selectedTheme].colors.text }}
            >
              {notificationThemes[selectedTheme].name} Theme
            </div>
            <div className="text-sm text-muted-foreground capitalize">
              Style: {notificationThemes[selectedTheme].style}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
