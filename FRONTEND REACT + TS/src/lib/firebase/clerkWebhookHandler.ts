import { userService } from './userService';
import { db } from './firestoreConfig';

/**
 * Types for Clerk webhook events
 */
type ClerkWebhookEvent = {
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string;
    last_name?: string;
    image_url?: string;
    created_at: number;
    updated_at: number;
  };
  type: string;
};

/**
 * Handle Clerk webhook events to sync user data with Firestore
 * This can be used in an API route to process Clerk webhooks
 * 
 * @param event The Clerk webhook event
 */
export async function handleClerkWebhook(event: ClerkWebhookEvent): Promise<void> {
  try {
    const { data, type } = event;
    
    // Handle user creation
    if (type === 'user.created') {
      await userService.saveUser({
        id: data.id,
        email: data.email_addresses?.[0]?.email_address || '',
        firstName: data.first_name,
        lastName: data.last_name,
        profileImageUrl: data.image_url,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      });
    }
    
    // Handle user update
    else if (type === 'user.updated') {
      await userService.saveUser({
        id: data.id,
        email: data.email_addresses?.[0]?.email_address || '',
        firstName: data.first_name,
        lastName: data.last_name,
        profileImageUrl: data.image_url,
        updatedAt: new Date(data.updated_at),
      });
    }
    
    // Handle user deletion
    else if (type === 'user.deleted') {
      // Implement user deletion logic if needed
      // For now, we'll keep the user data in Firestore for record-keeping
    }
  } catch (error) {
    console.error('Error handling Clerk webhook:', error);
    throw error;
  }
}