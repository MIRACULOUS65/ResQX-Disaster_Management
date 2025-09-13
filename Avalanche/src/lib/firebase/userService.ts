import { db } from './firestoreConfig';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Define the User interface
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  lastSignInAt?: Date;
}

/**
 * User service for handling Firestore operations related to users
 */
export const userService = {
  /**
   * Create or update a user in Firestore
   * @param userData User data to store
   * @returns Promise with the user ID
   */
  async saveUser(userData: Omit<User, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }): Promise<string> {
    try {
      const now = new Date();
      const userRef = doc(db, 'users', userData.id);
      
      // Check if user exists
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // Update existing user
        await updateDoc(userRef, {
          ...userData,
          updatedAt: now,
        });
      } else {
        // Create new user
        await setDoc(userRef, {
          ...userData,
          createdAt: userData.createdAt || now,
          updatedAt: now,
        });
      }
      
      return userData.id;
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  },

  /**
   * Get a user by ID
   * @param userId User ID
   * @returns Promise with the user data or null if not found
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return null;
      }
      
      return userDoc.data() as User;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  /**
   * Update user's last sign-in timestamp
   * @param userId User ID
   * @returns Promise
   */
  async updateLastSignIn(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        lastSignInAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating last sign-in:', error);
      throw error;
    }
  },
};