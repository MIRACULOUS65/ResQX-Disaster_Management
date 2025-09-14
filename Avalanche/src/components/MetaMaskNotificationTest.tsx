import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Wallet, CheckCircle, XCircle, TestTube } from 'lucide-react';
import { 
  isMetaMaskInstalled, 
  connectMetaMask, 
  getMetaMaskStatus,
  sendDisasterNotification,
  createDisasterNotificationPayload
} from '../utils/metamaskNotifications';

export default function MetaMaskNotificationTest() {
  const [metaMaskStatus, setMetaMaskStatus] = useState<{
    installed: boolean;
    connected: boolean;
    enabled: boolean;
  }>({
    installed: false,
    connected: false,
    enabled: false
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<string | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const status = await getMetaMaskStatus();
      setMetaMaskStatus({
        installed: status.isInstalled,
        connected: status.isConnected,
        enabled: status.isInstalled && status.isConnected
      });
    } catch (error) {
      console.error('Error checking MetaMask status:', error);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectMetaMask();
      await checkStatus();
    } catch (error) {
      console.error('Failed to connect to MetaMask:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const testNotification = async () => {
    if (!metaMaskStatus.enabled) {
      setLastTestResult('❌ MetaMask not connected');
      return;
    }

    setIsTesting(true);
    setLastTestResult(null);

    try {
      const testPayload = createDisasterNotificationPayload(
        'avalanche',
        9, // Critical severity
        { lat: 46.5197, lng: 6.6323 }, // Swiss Alps coordinates
        'Test User',
        Date.now()
      );

      console.log('🧪 Testing MetaMask notification...');
      const success = await sendDisasterNotification(testPayload, {
        type: 'alert',
        priority: 'critical',
        requireInteraction: true,
        timeout: 30000,
        retryAttempts: 3
      });

      if (success) {
        setLastTestResult('✅ MetaMask notification sent successfully! Check your MetaMask popup.');
      } else {
        setLastTestResult('❌ MetaMask notification failed. Check console for details.');
      }
    } catch (error) {
      console.error('Error testing MetaMask notification:', error);
      setLastTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          MetaMask Notification Test
        </CardTitle>
        <CardDescription>
          Test MetaMask disaster notifications directly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="text-sm font-medium">MetaMask Status:</span>
            {metaMaskStatus.installed ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">
              {metaMaskStatus.installed ? 'Installed' : 'Not Installed'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Connection:</span>
            {metaMaskStatus.connected ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">
              {metaMaskStatus.connected ? 'Connected' : 'Not Connected'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {!metaMaskStatus.installed && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Please install MetaMask browser extension to test notifications.
              </p>
            </div>
          )}

          {metaMaskStatus.installed && !metaMaskStatus.connected && (
            <Button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
            </Button>
          )}

          {metaMaskStatus.enabled && (
            <Button 
              onClick={testNotification}
              disabled={isTesting}
              variant="default"
              className="w-full"
            >
              {isTesting ? 'Testing...' : 'Test Disaster Notification'}
            </Button>
          )}

          <Button 
            onClick={checkStatus}
            variant="outline"
            className="w-full"
          >
            Refresh Status
          </Button>
        </div>

        {/* Test Result */}
        {lastTestResult && (
          <div className={`p-3 rounded-lg ${
            lastTestResult.startsWith('✅') 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <p className="text-sm font-medium">
              {lastTestResult}
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>How it works:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Connect your MetaMask wallet</li>
            <li>Click "Test Disaster Notification"</li>
            <li>MetaMask will show a popup asking you to sign</li>
            <li>This simulates a real disaster alert</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
