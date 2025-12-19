export type Geography = 'RURAL' | 'DEEP_RURAL';
export type VerificationType = 'HALL' | 'HOME';
export type SyncStatus = 'synced' | 'pending';

export interface Kampung {
  id: string;
  name: string;
  state: string;
  postcode: string;
  geography: Geography;
  lat: number;
  lng: number;
}

export type Beneficiary = {
  ic: string;
  name: string;
  status: string; // Kept for backend compatibility but not shown in UI
  geography: Geography;
  lastScanDate: string; 
  monthlyPayout: number;
  pendingMonths: number;
  address: string;
  lastPaid: string;
  photoUrl: string;
  completed?: boolean;
  verificationType?: VerificationType;
  syncStatus?: SyncStatus;
  referenceId?: string;
  serviceCount?: number;
};