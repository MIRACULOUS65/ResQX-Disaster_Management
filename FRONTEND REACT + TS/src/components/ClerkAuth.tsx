import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function ClerkAuth() {
  const navigate = useNavigate();
  
  // Check if Clerk is available
  const isClerkAvailable = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  if (!isClerkAvailable) {
    return (
      <header className="flex justify-between items-center p-4 border-b">
        <div className="text-xl font-bold">Avalanche</div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6"
          >
            Go to Dashboard
          </Button>
          <div className="text-sm text-muted-foreground">
            (Auth not configured)
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="flex justify-between items-center p-4 border-b">
      <div className="text-xl font-bold">Avalanche</div>
      <div>
        <SignedOut>
          <SignInButton mode="modal" fallbackRedirectUrl="/">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6">
              Sign In
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="font-medium px-4"
            >
              Dashboard
            </Button>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
          </div>
        </SignedIn>
      </div>
    </header>
  );
}
