import { useUser } from '@clerk/clerk-react';
import { userService } from '@/lib/firebase/userService';
import { useState, useEffect } from 'react';

/**
 * Test component to verify Firebase Firestore integration with Clerk Auth
 */
export function FirestoreTest() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data from Firestore when user is signed in
  const fetchUserData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const firestoreUser = await userService.getUserById(user.id);
      setUserData(firestoreUser);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to fetch user data from Firestore');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      fetchUserData();
    }
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded || !isSignedIn) {
    return <div>Please sign in to test Firestore integration</div>;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Firestore Integration Test</h2>
      
      <div className="mb-4">
        <button 
          onClick={fetchUserData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh User Data'}
        </button>
      </div>
      
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded mb-4">
          {error}
        </div>
      )}
      
      {userData ? (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">User Data in Firestore:</h3>
          <pre className="whitespace-pre-wrap overflow-auto max-h-60">
            {JSON.stringify(userData, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="text-gray-500">
          {loading ? 'Loading user data...' : 'No user data found in Firestore'}
        </div>
      )}
    </div>
  );
}