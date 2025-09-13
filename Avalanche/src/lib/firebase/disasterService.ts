// Disaster Management Service for Firestore
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  Timestamp,
  serverTimestamp,
  writeBatch,
  QueryConstraint,
  DocumentSnapshot,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from './firestoreConfig';
import type { 
  Disaster, 
  DisasterCreateInput, 
  DisasterUpdateInput, 
  DisasterFilter, 
  DisasterStats,
  DisasterEvent,
  DisasterNotificationPayload
} from '../../types/disaster';

const DISASTERS_COLLECTION = 'disasters';
const DISASTER_EVENTS_COLLECTION = 'disaster_events';

export class DisasterService {
  private static instance: DisasterService;
  private listeners: Map<string, () => void> = new Map();

  static getInstance(): DisasterService {
    if (!DisasterService.instance) {
      DisasterService.instance = new DisasterService();
    }
    return DisasterService.instance;
  }

  // Create a new disaster
  async createDisaster(input: DisasterCreateInput): Promise<Disaster> {
    try {
      const now = Date.now();
      const disasterId = `disaster_${now}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate title and message
      const severityText = input.severityLevel >= 8 ? 'CRITICAL' : 
                          input.severityLevel >= 6 ? 'HIGH' : 
                          input.severityLevel >= 4 ? 'MEDIUM' : 'LOW';
      
      const priority = input.severityLevel >= 8 ? 'critical' :
                      input.severityLevel >= 6 ? 'high' :
                      input.severityLevel >= 4 ? 'medium' : 'low';

      const disaster: Omit<Disaster, 'id'> = {
        disasterType: input.disasterType,
        severityLevel: input.severityLevel,
        location: input.location,
        reporter: input.reporter,
        reporterEmail: input.reporterEmail,
        reporterName: input.reporterName,
        timestamp: now,
        status: 'active',
        title: `🚨 ${input.disasterType.toUpperCase()} ALERT - ${severityText} SEVERITY`,
        message: input.message || `A ${severityText.toLowerCase()} severity ${input.disasterType} has been detected at coordinates ${input.location.lat.toFixed(3)}, ${input.location.lng.toFixed(3)}. Please take appropriate safety measures immediately.`,
        range: input.range || 50,
        createdAt: now,
        updatedAt: now,
        imageUrl: input.imageUrl,
        cid: input.cid,
        tags: input.tags || [],
        affectedArea: input.affectedArea,
        estimatedCasualties: input.estimatedCasualties,
        estimatedDamage: input.estimatedDamage,
        priority,
        category: input.category || 'natural'
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, DISASTERS_COLLECTION), {
        ...disaster,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const createdDisaster: Disaster = {
        id: docRef.id,
        ...disaster
      };

      // Log the event
      await this.logDisasterEvent('created', createdDisaster);

      console.log('✅ Disaster created successfully:', createdDisaster.id);
      return createdDisaster;

    } catch (error) {
      console.error('❌ Error creating disaster:', error);
      throw error;
    }
  }

  // Get a single disaster by ID
  async getDisaster(id: string): Promise<Disaster | null> {
    try {
      const docRef = doc(db, DISASTERS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Disaster;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting disaster:', error);
      throw error;
    }
  }

  // Get all disasters with optional filtering
  async getDisasters(filter?: DisasterFilter, limitCount: number = 100): Promise<Disaster[]> {
    try {
      const constraints: QueryConstraint[] = [];
      
      if (filter?.status) {
        constraints.push(where('status', '==', filter.status));
      }
      
      if (filter?.disasterType) {
        constraints.push(where('disasterType', '==', filter.disasterType));
      }
      
      if (filter?.severityLevel) {
        if (filter.severityLevel.min !== undefined) {
          constraints.push(where('severityLevel', '>=', filter.severityLevel.min));
        }
        if (filter.severityLevel.max !== undefined) {
          constraints.push(where('severityLevel', '<=', filter.severityLevel.max));
        }
      }
      
      if (filter?.priority) {
        constraints.push(where('priority', '==', filter.priority));
      }
      
      if (filter?.category) {
        constraints.push(where('category', '==', filter.category));
      }
      
      if (filter?.reporter) {
        constraints.push(where('reporter', '==', filter.reporter));
      }
      
      if (filter?.dateRange) {
        constraints.push(where('createdAt', '>=', filter.dateRange.start));
        constraints.push(where('createdAt', '<=', filter.dateRange.end));
      }
      
      constraints.push(orderBy('createdAt', 'desc'));
      constraints.push(limit(limitCount));

      const q = query(collection(db, DISASTERS_COLLECTION), ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Disaster[];

    } catch (error) {
      console.error('❌ Error getting disasters:', error);
      throw error;
    }
  }

  // Update a disaster
  async updateDisaster(id: string, updates: DisasterUpdateInput): Promise<Disaster | null> {
    try {
      const docRef = doc(db, DISASTERS_COLLECTION, id);
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, updateData);
      
      // Get updated disaster
      const updatedDisaster = await this.getDisaster(id);
      if (updatedDisaster) {
        await this.logDisasterEvent('updated', updatedDisaster);
      }
      
      console.log('✅ Disaster updated successfully:', id);
      return updatedDisaster;

    } catch (error) {
      console.error('❌ Error updating disaster:', error);
      throw error;
    }
  }

  // Resolve a disaster
  async resolveDisaster(id: string, resolvedBy: string): Promise<Disaster | null> {
    try {
      const now = Date.now();
      const updates: DisasterUpdateInput = {
        status: 'resolved',
        resolvedBy,
        resolvedAt: now
      };

      const resolvedDisaster = await this.updateDisaster(id, updates);
      if (resolvedDisaster) {
        await this.logDisasterEvent('resolved', resolvedDisaster);
      }
      
      console.log('✅ Disaster resolved successfully:', id);
      return resolvedDisaster;

    } catch (error) {
      console.error('❌ Error resolving disaster:', error);
      throw error;
    }
  }

  // Delete a disaster (soft delete by marking as resolved)
  async deleteDisaster(id: string, deletedBy: string): Promise<boolean> {
    try {
      const updates: DisasterUpdateInput = {
        status: 'false_alarm',
        resolvedBy: deletedBy,
        resolvedAt: Date.now()
      };

      await this.updateDisaster(id, updates);
      console.log('✅ Disaster deleted successfully:', id);
      return true;

    } catch (error) {
      console.error('❌ Error deleting disaster:', error);
      throw error;
    }
  }

  // Get disaster statistics
  async getDisasterStats(): Promise<DisasterStats> {
    try {
      const disasters = await this.getDisasters();
      
      const stats: DisasterStats = {
        total: disasters.length,
        active: disasters.filter(d => d.status === 'active').length,
        resolved: disasters.filter(d => d.status === 'resolved').length,
        falseAlarms: disasters.filter(d => d.status === 'false_alarm').length,
        byType: {},
        bySeverity: {},
        byPriority: {},
        recentActivity: disasters.filter(d => d.createdAt > Date.now() - 24 * 60 * 60 * 1000).length
      };

      // Calculate breakdowns
      disasters.forEach(disaster => {
        // By type
        stats.byType[disaster.disasterType] = (stats.byType[disaster.disasterType] || 0) + 1;
        
        // By severity
        stats.bySeverity[disaster.severityLevel] = (stats.bySeverity[disaster.severityLevel] || 0) + 1;
        
        // By priority
        stats.byPriority[disaster.priority] = (stats.byPriority[disaster.priority] || 0) + 1;
      });

      return stats;

    } catch (error) {
      console.error('❌ Error getting disaster stats:', error);
      throw error;
    }
  }

  // Set up real-time listener for disasters
  subscribeToDisasters(
    callback: (disasters: Disaster[]) => void,
    filter?: DisasterFilter
  ): () => void {
    try {
      const constraints: QueryConstraint[] = [];
      
      if (filter?.status) {
        constraints.push(where('status', '==', filter.status));
      }
      
      if (filter?.disasterType) {
        constraints.push(where('disasterType', '==', filter.disasterType));
      }
      
      constraints.push(orderBy('createdAt', 'desc'));

      const q = query(collection(db, DISASTERS_COLLECTION), ...constraints);
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const disasters = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Disaster[];
        
        callback(disasters);
      });

      // Store the unsubscribe function
      const listenerId = `disasters_${Date.now()}`;
      this.listeners.set(listenerId, unsubscribe);

      // Return cleanup function
      return () => {
        unsubscribe();
        this.listeners.delete(listenerId);
      };

    } catch (error) {
      console.error('❌ Error setting up disaster listener:', error);
      throw error;
    }
  }

  // Set up real-time listener for disaster events
  subscribeToDisasterEvents(
    callback: (event: DisasterEvent) => void
  ): () => void {
    try {
      const q = query(
        collection(db, DISASTER_EVENTS_COLLECTION),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const eventData = change.doc.data();
            const event: DisasterEvent = {
              type: eventData.type,
              disaster: eventData.disaster,
              timestamp: eventData.timestamp
            };
            callback(event);
          }
        });
      });

      // Store the unsubscribe function
      const listenerId = `events_${Date.now()}`;
      this.listeners.set(listenerId, unsubscribe);

      // Return cleanup function
      return () => {
        unsubscribe();
        this.listeners.delete(listenerId);
      };

    } catch (error) {
      console.error('❌ Error setting up event listener:', error);
      throw error;
    }
  }

  // Log disaster events for real-time notifications
  private async logDisasterEvent(type: 'created' | 'updated' | 'resolved' | 'deleted', disaster: Disaster): Promise<void> {
    try {
      const event: Omit<DisasterEvent, 'id'> = {
        type,
        disaster,
        timestamp: Date.now()
      };

      await addDoc(collection(db, DISASTER_EVENTS_COLLECTION), {
        ...event,
        timestamp: serverTimestamp()
      });

    } catch (error) {
      console.error('❌ Error logging disaster event:', error);
    }
  }

  // Cleanup all listeners
  cleanup(): void {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }
}

// Export singleton instance
export const disasterService = DisasterService.getInstance();
