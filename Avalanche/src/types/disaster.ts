// Disaster Management Types for Firestore

export interface DisasterLocation {
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface Disaster {
  id: string;
  disasterType: string;
  severityLevel: number; // 1-10
  location: DisasterLocation;
  reporter: string; // User ID
  reporterEmail: string;
  reporterName?: string;
  timestamp: number;
  status: 'active' | 'resolved' | 'false_alarm';
  resolvedBy?: string; // User ID who resolved it
  resolvedAt?: number;
  title: string;
  message: string;
  range: number; // in kilometers
  createdAt: number;
  updatedAt: number;
  imageUrl?: string;
  cid?: string; // IPFS/Arweave CID for additional data
  tags?: string[]; // e.g., ['flood', 'emergency', 'evacuation']
  affectedArea?: number; // in square kilometers
  estimatedCasualties?: number;
  estimatedDamage?: number; // in USD
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'natural' | 'man_made' | 'technological' | 'biological' | 'other';
}

export interface DisasterCreateInput {
  disasterType: string;
  severityLevel: number;
  location: DisasterLocation;
  reporter: string;
  reporterEmail: string;
  reporterName?: string;
  message?: string;
  range?: number;
  imageUrl?: string;
  cid?: string;
  tags?: string[];
  affectedArea?: number;
  estimatedCasualties?: number;
  estimatedDamage?: number;
  category?: 'natural' | 'man_made' | 'technological' | 'biological' | 'other';
}

export interface DisasterUpdateInput {
  status?: 'active' | 'resolved' | 'false_alarm';
  resolvedBy?: string;
  resolvedAt?: number;
  message?: string;
  severityLevel?: number;
  tags?: string[];
  affectedArea?: number;
  estimatedCasualties?: number;
  estimatedDamage?: number;
}

export interface DisasterFilter {
  status?: 'active' | 'resolved' | 'false_alarm';
  disasterType?: string;
  severityLevel?: { min?: number; max?: number };
  location?: {
    center: DisasterLocation;
    radius: number; // in kilometers
  };
  reporter?: string;
  dateRange?: {
    start: number;
    end: number;
  };
  priority?: 'low' | 'medium' | 'high' | 'critical';
  category?: 'natural' | 'man_made' | 'technological' | 'biological' | 'other';
}

export interface DisasterStats {
  total: number;
  active: number;
  resolved: number;
  falseAlarms: number;
  byType: Record<string, number>;
  bySeverity: Record<number, number>;
  byPriority: Record<string, number>;
  recentActivity: number; // disasters created in last 24 hours
}

// Real-time event types
export interface DisasterEvent {
  type: 'created' | 'updated' | 'resolved' | 'deleted';
  disaster: Disaster;
  timestamp: number;
}

// Notification payload for real-time updates
export interface DisasterNotificationPayload {
  type: 'disaster_created' | 'disaster_resolved' | 'disaster_updated';
  disaster: Disaster;
  message: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  requiresAction: boolean;
}
