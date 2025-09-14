import { Toaster } from "@/components/ui/sonner";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import { ClerkProvider } from "@clerk/clerk-react";
import React, { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import "./index.css";
import Landing from "./pages/Landing.tsx";
import NotFound from "./pages/NotFound.tsx";
import "./types/global.d.ts";
import Dashboard from "./pages/Dashboard.tsx";
import RescueTeam from "./pages/RescueTeam.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute";
// P2P notifier will be imported when needed

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

console.log('Environment variables:', import.meta.env);
console.log('Clerk PUBLISHABLE_KEY:', PUBLISHABLE_KEY);

if (!PUBLISHABLE_KEY) {
  console.error('Clerk PUBLISHABLE_KEY is missing or undefined');
  console.error('Available env vars:', Object.keys(import.meta.env));
  throw new Error('Add your Clerk Publishable Key to the .env file');
}



function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}


// This component is no longer needed as we've restructured the app to use a single BrowserRouter
// The functionality has been moved directly into the main render tree

// Simple error boundary to catch any rendering errors
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('App Error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ color: 'red' }}>Application Error</h1>
        <p>There was an error loading the application. Check the console for details.</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    );
  }

  return <>{children}</>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <VlyToolbar />
      <InstrumentationProvider>
        <BrowserRouter>
          <RouteSyncer />
          <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/rescue-team" element={<RescueTeam />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </ClerkProvider>
        </BrowserRouter>
      </InstrumentationProvider>
    </ErrorBoundary>
  </StrictMode>,
);