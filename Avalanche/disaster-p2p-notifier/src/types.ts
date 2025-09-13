export type AlertPayload = {
  disasterType: string;
  severityLevel: number; // 1-10
  cid?: string | null;   // optional IPFS/Arweave CID
  imageUrl?: string | null;
  location: { lat: number; lng: number };
  reporter?: string;
  timestamp: number; // ms
};

export type P2PMessage = {
  id: string; // uuid
  payload: AlertPayload;
  origin?: string;
};
