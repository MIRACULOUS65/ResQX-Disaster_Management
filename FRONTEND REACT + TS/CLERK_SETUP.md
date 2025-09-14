# Clerk Authentication Setup

## Overview
The application now has Clerk authentication properly configured with graceful fallback when the publishable key is not set.

## Setup Instructions

### 1. Get Your Clerk Publishable Key
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application or select an existing one
3. Copy your publishable key (starts with `pk_test_` or `pk_live_`)

### 2. Configure Environment Variables
1. Open the `.env` file in the project root
2. Replace `pk_test_your_clerk_publishable_key_here` with your actual Clerk publishable key:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   ```

### 3. Restart Development Server
After updating the `.env` file, restart your development server:
```bash
npm run dev
```

## Features

### With Clerk Configured
- **Sign In Button**: Opens Clerk's modal for authentication
- **User Profile**: Shows user avatar and sign-out option
- **Dashboard Access**: Protected route that requires authentication
- **Automatic Redirects**: Proper handling of sign-in/sign-out flows

### Without Clerk Configured (Fallback Mode)
- **Go to Dashboard Button**: Direct access to dashboard (for development)
- **Auth Not Configured**: Clear indication that authentication is not set up
- **No Errors**: Application continues to work without authentication

## Components

### ClerkAuth Component
- Located at `src/components/ClerkAuth.tsx`
- Handles authentication state and UI
- Provides fallback when Clerk is not configured

### Landing Page
- Updated to use the AuthSection component
- Clean separation of authentication logic
- Maintains all existing functionality

## Troubleshooting

### Common Issues
1. **"Auth not configured" message**: Make sure your `.env` file has the correct `VITE_CLERK_PUBLISHABLE_KEY`
2. **Sign-in button not working**: Check browser console for Clerk-related errors
3. **Environment variables not loading**: Restart the development server after changing `.env`

### Development vs Production
- Use `pk_test_` keys for development
- Use `pk_live_` keys for production
- Make sure to configure allowed origins in Clerk dashboard

## Next Steps
1. Set up your Clerk application
2. Configure authentication methods (email, social, etc.)
3. Customize the sign-in/sign-up experience in Clerk dashboard
4. Test the authentication flow
