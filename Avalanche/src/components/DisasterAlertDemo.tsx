import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MapPin, Users } from "lucide-react";
import { notifyAlert } from "../p2p-notifier";

export default function DisasterAlertDemo() {
  const [isAlerting, setIsAlerting] = useState(false);
  const [lastAlert, setLastAlert] = useState<any>(null);

  const disasterTypes = [
    { type: "flood", severity: 8, location: { lat: 22.5726, lng: 88.3639 }, description: "Severe flooding in Kolkata area" },
    { type: "earthquake", severity: 7, location: { lat: 28.3949, lng: 84.1240 }, description: "Earthquake detected in Nepal region" },
    { type: "wildfire", severity: 6, location: { lat: 15.3173, lng: 75.7139 }, description: "Wildfire spreading in Karnataka" },
    { type: "storm", severity: 9, location: { lat: 19.0760, lng: 72.8777 }, description: "Cyclone approaching Mumbai" },
  ];

  const simulateDisasterAlert = async (disaster: typeof disasterTypes[0]) => {
    setIsAlerting(true);
    
    try {
      // Simulate disaster detection and alert
      await notifyAlert({
        disasterType: disaster.type,
        severityLevel: disaster.severity,
        cid: null, // Could be IPFS CID for disaster image/details
        imageUrl: null,
        location: disaster.location,
        reporter: "demo-user",
        timestamp: Date.now()
      });

      setLastAlert({
        ...disaster,
        timestamp: new Date().toLocaleTimeString()
      });

      // Show success message
      setTimeout(() => {
        setIsAlerting(false);
      }, 2000);

    } catch (error) {
      console.error("Failed to send disaster alert:", error);
      setIsAlerting(false);
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
        <p className="text-muted-foreground">
          Test the P2P disaster notification system. Click any button to simulate a disaster alert that will be broadcast to nearby devices.
        </p>
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
            Broadcasting to nearby devices via P2P network...
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

      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <h4 className="font-semibold mb-2">🔧 How it works:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Alerts are broadcast via P2P WebRTC network</li>
          <li>• Nearby devices receive notifications even without internet</li>
          <li>• Messages are queued and retried when offline</li>
          <li>• Browser notifications show immediately</li>
        </ul>
      </div>
    </motion.div>
  );
}
