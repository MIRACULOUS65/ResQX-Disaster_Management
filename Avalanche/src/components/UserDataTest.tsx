import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { userService } from '@/lib/firebase/userService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function UserDataTest() {
  const { user, isLoaded } = useUser();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastTest, setLastTest] = useState<string>('');

  const testUserDataStorage = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setLastTest('Testing...');
    
    try {
      // Test saving user data
      const userDataToSave = {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        profileImageUrl: user.imageUrl || '',
        lastSignInAt: new Date()
      };

      console.log('💾 Saving user data:', userDataToSave);
      await userService.saveUser(userDataToSave);
      
      // Test fetching user data
      console.log('📖 Fetching user data...');
      const fetchedUser = await userService.getUserById(user.id);
      
      setUserData(fetchedUser);
      setLastTest(`✅ Success! User data saved and retrieved at ${new Date().toLocaleTimeString()}`);
      
      console.log('✅ User data test successful:', fetchedUser);
    } catch (error) {
      console.error('❌ User data test failed:', error);
      setLastTest(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearUserData = () => {
    setUserData(null);
    setLastTest('');
  };

  useEffect(() => {
    if (isLoaded && user) {
      testUserDataStorage();
    }
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading user data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-4 w-4" />
            <span>No user logged in</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          User Data Storage Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current User Info */}
        <div>
          <h4 className="font-semibold mb-2">Current Clerk User:</h4>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm">
            <div><strong>ID:</strong> {user.id}</div>
            <div><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress || 'N/A'}</div>
            <div><strong>Name:</strong> {user.fullName || 'N/A'}</div>
            <div><strong>First Name:</strong> {user.firstName || 'N/A'}</div>
            <div><strong>Last Name:</strong> {user.lastName || 'N/A'}</div>
            <div><strong>Image URL:</strong> {user.imageUrl || 'N/A'}</div>
          </div>
        </div>

        {/* Test Results */}
        <div>
          <h4 className="font-semibold mb-2">Firebase Storage Test:</h4>
          <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
            <div className="flex items-center gap-2 mb-2">
              {lastTest.includes('✅') ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : lastTest.includes('❌') ? (
                <XCircle className="h-4 w-4 text-red-600" />
              ) : (
                <RefreshCw className="h-4 w-4 animate-spin" />
              )}
              <span className="font-medium">Status: {lastTest || 'Ready to test'}</span>
            </div>
          </div>
        </div>

        {/* Stored User Data */}
        {userData && (
          <div>
            <h4 className="font-semibold mb-2">Stored in Firebase:</h4>
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg text-sm">
              <div><strong>ID:</strong> {userData.id}</div>
              <div><strong>Email:</strong> {userData.email}</div>
              <div><strong>First Name:</strong> {userData.firstName}</div>
              <div><strong>Last Name:</strong> {userData.lastName}</div>
              <div><strong>Profile Image:</strong> {userData.profileImageUrl || 'N/A'}</div>
              <div><strong>Created At:</strong> {userData.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleString() : 'N/A'}</div>
              <div><strong>Updated At:</strong> {userData.updatedAt ? new Date(userData.updatedAt.seconds * 1000).toLocaleString() : 'N/A'}</div>
              <div><strong>Last Sign In:</strong> {userData.lastSignInAt ? new Date(userData.lastSignInAt.seconds * 1000).toLocaleString() : 'N/A'}</div>
            </div>
          </div>
        )}

        {/* Test Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={testUserDataStorage} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Test User Data Storage
          </Button>
          <Button 
            onClick={clearUserData} 
            variant="outline"
          >
            Clear Results
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
