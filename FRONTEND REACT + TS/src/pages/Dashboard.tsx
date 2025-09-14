import { Button } from "@/components/ui/button";
import { useUser, useClerk } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { LogOut, User, Mail, Calendar, Shield, AlertTriangle } from "lucide-react";
import { userService } from "@/lib/firebase/userService";
import DisasterManagement from "@/components/DisasterManagement";
import UserDataTest from "@/components/UserDataTest";

export default function Dashboard() {
  // Check if Clerk is available
  const isClerkAvailable = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const { isLoaded, isSignedIn, user } = isClerkAvailable ? useUser() : { isLoaded: true, isSignedIn: false, user: null };
  const { signOut } = isClerkAvailable ? useClerk() : { signOut: () => {} };
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  type TabType = 'profile' | 'disasters' | 'test';
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  useEffect(() => {
    if (isClerkAvailable && isLoaded && !isSignedIn) {
      navigate("/");
    }
  }, [isClerkAvailable, isLoaded, isSignedIn, navigate]);

  // Save and fetch user data when component mounts
  useEffect(() => {
    const handleUserData = async () => {
      if (user?.id && isClerkAvailable) {
        setLoading(true);
        try {
          // Check if Firebase is available before using userService
          if (userService) {
            // First, save/update user data in Firestore
            await userService.saveUser({
              id: user.id,
              email: user.primaryEmailAddress?.emailAddress || '',
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              profileImageUrl: user.imageUrl || '',
              lastSignInAt: new Date(user.updatedAt || Date.now())
            });

            // Then fetch the updated user data
            const firestoreUser = await userService.getUserById(user.id);
            setUserData(firestoreUser);
            
            console.log('✅ User data saved and fetched successfully:', firestoreUser);
          } else {
            console.log('Firebase not configured, skipping user data storage');
            setUserData({ id: user.id, email: user.primaryEmailAddress?.emailAddress || '' });
          }
        } catch (error) {
          console.error("Error handling user data:", error);
          // Set basic user data even if Firebase fails
          setUserData({ id: user.id, email: user.primaryEmailAddress?.emailAddress || '' });
        } finally {
          setLoading(false);
        }
      }
    };

    if (isSignedIn && user) {
      handleUserData();
    }
  }, [isSignedIn, user, isClerkAvailable]);

  if (isClerkAvailable && (!isLoaded || !isSignedIn)) {
    return (
      <div className="min-h-screen grid place-items-center">
        <motion.div
          className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        />
      </div>
    );
  }

  if (activeTab === 'disasters') {
    return <DisasterManagement />;
  }

  if (activeTab === 'test') {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-8">User Data Storage Test</h1>
          <UserDataTest />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome to your disaster management workspace</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'profile' ? 'default' : 'outline'}
              onClick={() => setActiveTab('profile')}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button
              variant={activeTab === ('disasters' as TabType) ? 'default' : 'outline'}
              onClick={() => setActiveTab('disasters')}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Disasters
            </Button>
            <Button
              variant={activeTab === ('test' as TabType) ? 'default' : 'outline'}
              onClick={() => setActiveTab('test')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Test Storage
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                if (isClerkAvailable) {
                  await signOut();
                }
                navigate("/");
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isClerkAvailable ? "Sign out" : "Back to Home"}
            </Button>
          </div>
        </div>

        {/* Welcome Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-card border border-border rounded-xl p-8 mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20">
              {user?.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                Welcome{isClerkAvailable && user?.fullName ? `, ${user.fullName}` : ""}! 👋
              </h2>
              <p className="text-muted-foreground">
                {isClerkAvailable ? "Great to have you back in the system" : "Welcome to the Disaster Management System"}
              </p>
            </div>
          </div>

          {/* User Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {isClerkAvailable ? (
                <>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email Address</p>
                      <p className="font-medium">{user?.primaryEmailAddress?.emailAddress || "Not available"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Username</p>
                      <p className="font-medium">{user?.username || "Not set"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-medium">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Authentication not configured</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Add VITE_CLERK_PUBLISHABLE_KEY to your .env file to enable user authentication
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Account Status</p>
                  <p className="font-medium text-green-600">Active</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-medium text-xs font-mono">{user?.id || "Not available"}</p>
                </div>
              </div>

              {userData && (
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Database Status</p>
                    <p className="font-medium text-green-600">Connected</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {loading && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Loading user data from database...
              </div>
            </div>
          )}

          {userData && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold mb-2">Database Information</h3>
              <p className="text-sm text-muted-foreground">
                User data successfully retrieved from Firebase Firestore
              </p>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-primary hover:underline">
                  View raw data
                </summary>
                <pre className="mt-2 text-xs bg-background p-2 rounded border overflow-auto">
                  {JSON.stringify(userData, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Shield className="h-6 w-6" />
              Emergency Response
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <User className="h-6 w-6" />
              Team Management
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calendar className="h-6 w-6" />
              Schedule
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
