import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MapPin, Users, Wallet, CheckCircle, XCircle, Wifi, WifiOff, MessageSquare, Clock } from "lucide-react";
import { disasterService } from "@/lib/firebase/disasterService";
import { disasterNotificationService } from "@/lib/firebase/disasterNotificationService";
import { useUser } from "@clerk/clerk-react";
import type { Disaster, DisasterCreateInput } from "@/types/disaster";
import { isMetaMaskInstalled, connectMetaMask, isMetaMaskConnected } from "../utils/metamaskNotifications";

export default function SimpleDisasterAlert() {
  const { user } = useUser();
  const [isAlerting, setIsAlerting] = useState(false);
  const [lastAlert, setLastAlert] = useState<any>(null);
  const [metaMaskStatus, setMetaMaskStatus] = useState<{
    installed: boolean;
    connected: boolean;
    connecting: boolean;
  }>({
    installed: false,
    connected: false,
    connecting: false
  });
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const disasterTypes = [
    { type: "flood", severity: 8, location: { lat: 22.5726, lng: 88.3639 }, description: "Severe flooding in Kolkata area" },
    { type: "earthquake", severity: 7, location: { lat: 28.3949, lng: 84.1240 }, description: "Earthquake detected in Nepal region" },
    { type: "wildfire", severity: 6, location: { lat: 15.3173, lng: 75.7139 }, description: "Wildfire spreading in Karnataka" },
    { type: "storm", severity: 9, location: { lat: 19.0760, lng: 72.8777 }, description: "Cyclone approaching Mumbai" },
  ];

  // Initialize Firebase disaster service
  useEffect(() => {
    initializeService();
    return () => {
      disasterNotificationService.stopListening();
    };
  }, []);

  const initializeService = async () => {
    try {
      // Request notification permission
      const permissionGranted = await disasterNotificationService.requestPermission();
      setNotificationsEnabled(permissionGranted);

      // Start listening for real-time updates
      disasterNotificationService.startListening();

      // Set up notification handler
      disasterNotificationService.onNotification((payload) => {
        console.log('📨 Real-time notification received:', payload);
        loadDisasters();
      });

      // Load initial disasters
      await loadDisasters();

      // Check MetaMask status
      const installed = isMetaMaskInstalled();
      const connected = installed ? await isMetaMaskConnected() : false;
      
      setMetaMaskStatus({
        installed,
        connected,
        connecting: false
      });

    } catch (error) {
      console.error('Error initializing disaster service:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDisasters = async () => {
    try {
      const disasterList = await disasterService.getDisasters({ status: 'active' }, 10);
      setDisasters(disasterList);
    } catch (error) {
      console.error('Error loading disasters:', error);
    }
  };

  // Connect to MetaMask
  const handleConnectMetaMask = async () => {
    setMetaMaskStatus(prev => ({ ...prev, connecting: true }));
    
    try {
      await connectMetaMask();
      setMetaMaskStatus(prev => ({ 
        ...prev, 
        connected: true, 
        connecting: false 
      }));
    } catch (error) {
      console.error('Failed to connect to MetaMask:', error);
      setMetaMaskStatus(prev => ({ 
        ...prev, 
        connected: false, 
        connecting: false 
      }));
    }
  };

  const simulateDisasterAlert = async (disaster: typeof disasterTypes[0]) => {
    setIsAlerting(true);
    
    try {
      // Create disaster using Firebase with actual user data
      const disasterData: DisasterCreateInput = {
        disasterType: disaster.type,
        severityLevel: disaster.severity,
        location: disaster.location,
        reporter: user?.id || "anonymous",
        reporterEmail: user?.primaryEmailAddress?.emailAddress || "anonymous@example.com",
        reporterName: user?.fullName || "Anonymous User",
        message: disaster.description,
        range: 50,
        category: 'natural'
      };

      await disasterService.createDisaster(disasterData);

      setLastAlert({
        ...disaster,
        timestamp: new Date().toLocaleTimeString()
      });

      // Reload disasters to show the new one
      await loadDisasters();

      // Show success message
      setTimeout(() => {
        setIsAlerting(false);
      }, 2000);

    } catch (error) {
      console.error("Failed to send disaster alert:", error);
      setIsAlerting(false);
    }
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="bg-background border border-border rounded-2xl p-8"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-2xl font-bold mb-2">🚨 Disaster Alert System</h3>
        <p className="text-muted-foreground mb-4">
          Real-time disaster detection and notification system. When you click a disaster button, it will be stored in Firebase and sent to all connected users instantly!
        </p>

        {/* Active Disasters Display */}
        {disasters.length > 0 && (
          <div className="mb-6 space-y-3">
            <h4 className="text-lg font-semibold text-foreground">Active Disasters</h4>
            {disasters.slice(0, 3).map((disaster) => (
              <motion.div
                key={disaster.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-800 dark:text-red-200">
                    {disaster.disasterType.toUpperCase()} - Level {disaster.severityLevel}
                  </span>
                </div>
                <p className="text-red-700 dark:text-red-300 text-sm mb-2">
                  {disaster.message}
                </p>
                <div className="flex items-center gap-4 text-xs text-red-600 dark:text-red-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{disaster.location.lat.toFixed(2)}, {disaster.location.lng.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(disaster.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <Button 
            onClick={requestNotificationPermission}
            variant="outline"
            size="sm"
          >
            Enable Browser Notifications
          </Button>
          
          {metaMaskStatus.installed ? (
            <Button 
              onClick={handleConnectMetaMask}
              disabled={metaMaskStatus.connected || metaMaskStatus.connecting}
              variant={metaMaskStatus.connected ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2"
            >
              <Wallet className="h-4 w-4" />
              {metaMaskStatus.connecting ? "Connecting..." : 
               metaMaskStatus.connected ? "MetaMask Connected" : "Connect MetaMask"}
              {metaMaskStatus.connected && <CheckCircle className="h-4 w-4" />}
            </Button>
          ) : (
            <Button 
              variant="outline"
              size="sm"
              disabled
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              MetaMask Not Installed
            </Button>
          )}
        </div>

        {/* Firebase Status Display */}
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {navigator.onLine ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">
                {navigator.onLine ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{disasters.length} active disasters</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                <span>{notificationsEnabled ? 'Notifications On' : 'Notifications Off'}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            {navigator.onLine 
              ? "✅ Connected to Firebase - Real-time disaster alerts enabled"
              : "📡 Offline mode - Alerts will sync when back online"
            }
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            🔥 Firebase Firestore - Real-time database
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {disasterTypes.map((disaster, index) => (
          <motion.div
            key={disaster.type}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => simulateDisasterAlert(disaster)}
              disabled={isAlerting}
              variant="outline"
              className="w-full h-auto p-4 flex flex-col items-start gap-2"
            >
              <div className="flex items-center gap-2 w-full">
                <div className={`w-3 h-3 rounded-full ${
                  disaster.severity >= 8 ? 'bg-red-500' : 
                  disaster.severity >= 6 ? 'bg-orange-500' : 'bg-yellow-500'
                }`}></div>
                <span className="font-semibold capitalize">{disaster.type}</span>
                <span className="ml-auto text-sm opacity-70">Lvl {disaster.severity}</span>
              </div>
              <div className="text-sm text-left opacity-70">{disaster.description}</div>
              <div className="flex items-center gap-1 text-xs opacity-60">
                <MapPin className="h-3 w-3" />
                {disaster.location.lat.toFixed(2)}, {disaster.location.lng.toFixed(2)}
              </div>
            </Button>
          </motion.div>
        ))}
      </div>

      {isAlerting && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4"
        >
          <div className="flex items-center gap-2 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Alert sent successfully!</span>
          </div>
          <p className="text-sm text-green-600/80 mt-1">
            Broadcasting to nearby devices...
          </p>
        </motion.div>
      )}

      {lastAlert && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Users className="h-4 w-4" />
            <span className="font-medium">Last Alert Sent</span>
          </div>
          <div className="text-sm space-y-1">
            <div><span className="font-medium">Type:</span> {lastAlert.type.toUpperCase()}</div>
            <div><span className="font-medium">Severity:</span> Level {lastAlert.severity}</div>
            <div><span className="font-medium">Location:</span> {lastAlert.location.lat.toFixed(3)}, {lastAlert.location.lng.toFixed(3)}</div>
            <div><span className="font-medium">Time:</span> {lastAlert.timestamp}</div>
          </div>
        </motion.div>
      )}

      {/* Recent Disasters Display */}
      {disasters.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 text-orange-600 mb-2">
            <MessageSquare className="h-4 w-4" />
            <span className="font-medium">Recent Disasters ({disasters.length})</span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {disasters.slice(0, 3).map((disaster, index) => (
              <div key={disaster.id || index} className="text-xs bg-orange-500/5 rounded p-2">
                <div className="font-medium">{disaster.title}</div>
                <div className="text-orange-600/80">{disaster.disasterType} - Level {disaster.severityLevel}</div>
                <div className="text-orange-600/60">{new Date(disaster.timestamp).toLocaleTimeString()}</div>
              </div>
            ))}
            {disasters.length > 3 && (
              <div className="text-xs text-orange-600/60 text-center">
                ... and {disasters.length - 3} more disasters
              </div>
            )}
          </div>
        </motion.div>
      )}

      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <h4 className="font-semibold mb-2">🔧 P2P Disaster Alert System</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Real-time disaster detection and alerting</li>
          <li>• <strong>Works offline</strong> - P2P WebRTC network for offline communication</li>
          <li>• MetaMask notifications for Web3 users (online)</li>
          <li>• Browser notifications as fallback</li>
          <li>• <strong>Message queuing</strong> - stores alerts when offline</li>
          <li>• <strong>Auto-sync</strong> - sends queued messages when back online</li>
          <li>• Service Worker for background notifications</li>
          <li>• Integration with NASA EONET disaster data</li>
        </ul>
        
        {metaMaskStatus.installed && (
          <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Wallet className="h-4 w-4" />
              <span className="font-medium">MetaMask Integration</span>
            </div>
            <p className="text-xs text-blue-600/80 mb-2">
              {metaMaskStatus.connected 
                ? "✅ Connected - Disaster alerts will show MetaMask popup for signature"
                : "⚠️ Not connected - Click 'Connect MetaMask' to enable Web3 notifications"
              }
            </p>
            {metaMaskStatus.connected && (
              <div className="text-xs text-blue-600/70 space-y-1">
                <p>• MetaMask will show a popup asking you to sign the disaster alert</p>
                <p>• This ensures you see critical disaster information immediately</p>
                <p>• You can reject the signature if it's not urgent</p>
                <p className="text-orange-600">💡 Tip: Enable MetaMask notifications in Settings → Notifications for additional alerts</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
