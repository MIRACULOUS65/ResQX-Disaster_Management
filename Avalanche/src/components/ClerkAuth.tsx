import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

export default function ClerkAuth() {
  return (
    <header className="flex justify-between items-center p-4 border-b">
      <div className="text-xl font-bold">Avalanche</div>
      <div>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </header>
  );
}
