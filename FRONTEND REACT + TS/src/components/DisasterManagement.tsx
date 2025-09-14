import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Filter,
  RefreshCw,
  Bell,
  BellOff,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { disasterService } from '@/lib/firebase/disasterService';
import { disasterNotificationService } from '@/lib/firebase/disasterNotificationService';
import { useUser } from '@clerk/clerk-react';
import DisasterCreateForm from './DisasterCreateForm';
import type { Disaster, DisasterCreateInput, DisasterFilter } from '@/types/disaster';

export default function DisasterManagement() {
  const { user } = useUser();
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [filter, setFilter] = useState<DisasterFilter>({ status: 'active' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    resolved: 0,
    falseAlarms: 0
  });

  // Initialize the service
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
        // Refresh disasters when we get a notification
        loadDisasters();
      });

      // Load initial data
      await loadDisasters();
      await loadStats();

    } catch (error) {
      console.error('Error initializing disaster service:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDisasters = async () => {
    try {
      const disasterList = await disasterService.getDisasters(filter, 50);
      setDisasters(disasterList);
    } catch (error) {
      console.error('Error loading disasters:', error);
    }
  };

  const loadStats = async () => {
    try {
      const disasterStats = await disasterService.getDisasterStats();
      setStats(disasterStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreateDisaster = async (disasterData: DisasterCreateInput) => {
    try {
      setLoading(true);
      // Add current user info to the disaster data
      const disasterWithUser = {
        ...disasterData,
        reporter: user?.id || 'anonymous',
        reporterEmail: user?.primaryEmailAddress?.emailAddress || 'anonymous@example.com',
        reporterName: user?.fullName || 'Anonymous User'
      };
      
      await disasterService.createDisaster(disasterWithUser);
      setShowCreateForm(false);
      await loadDisasters();
      await loadStats();
    } catch (error) {
      console.error('Error creating disaster:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDisaster = async (disasterId: string) => {
    try {
      setLoading(true);
      const currentUserId = user?.id || 'anonymous';
      await disasterService.resolveDisaster(disasterId, currentUserId);
      await loadDisasters();
      await loadStats();
    } catch (error) {
      console.error('Error resolving disaster:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDisaster = async (disasterId: string) => {
    try {
      setLoading(true);
      const currentUserId = user?.id || 'anonymous';
      await disasterService.deleteDisaster(disasterId, currentUserId);
      await loadDisasters();
      await loadStats();
    } catch (error) {
      console.error('Error deleting disaster:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      disasterNotificationService.stopListening();
      setNotificationsEnabled(false);
    } else {
      const permissionGranted = await disasterNotificationService.requestPermission();
      if (permissionGranted) {
        disasterNotificationService.startListening();
        setNotificationsEnabled(true);
      }
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return 'bg-red-500';
    if (severity >= 6) return 'bg-orange-500';
    if (severity >= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800 border-red-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'false_alarm': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading && disasters.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Disaster Management</h1>
            <p className="text-muted-foreground mt-1">Real-time disaster monitoring and response</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={toggleNotifications}
              className="flex items-center gap-2"
            >
              {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              {notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
            </Button>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Report Disaster
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Disasters</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-red-600">{stats.active}</p>
                </div>
                <div className={`h-3 w-3 rounded-full ${getSeverityColor(8)}`} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">False Alarms</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.falseAlarms}</p>
                </div>
                <XCircle className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disasters List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Disasters</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadDisasters}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {disasters.map((disaster) => (
              <motion.div
                key={disaster.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{disaster.title}</h3>
                          <Badge className={getStatusColor(disaster.status)}>
                            {disaster.status.toUpperCase()}
                          </Badge>
                          <Badge className={getPriorityColor(disaster.priority)}>
                            {disaster.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{disaster.message}</p>
                        
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{disaster.location.lat.toFixed(3)}, {disaster.location.lng.toFixed(3)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(disaster.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{disaster.reporterName || disaster.reporterEmail}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`h-4 w-4 rounded-full ${getSeverityColor(disaster.severityLevel)}`} />
                        <span className="text-sm font-medium">Severity {disaster.severityLevel}/10</span>
                      </div>
                    </div>
                    
                    {disaster.status === 'active' && (
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          size="sm"
                          onClick={() => handleResolveDisaster(disaster.id)}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteDisaster(disaster.id)}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Mark as False Alarm
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {disasters.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No disasters found</h3>
                <p className="text-muted-foreground">
                  {filter.status === 'active' 
                    ? "No active disasters at the moment. Great job!" 
                    : "No disasters match your current filter."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Disaster Form Modal */}
      <DisasterCreateForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateDisaster}
        loading={loading}
      />
    </div>
  );
}
