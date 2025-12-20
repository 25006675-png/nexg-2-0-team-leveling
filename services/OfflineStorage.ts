import { encryptPayload } from './SecurityService';

export interface VerificationRecord {
  id: string;
  timestamp: string;
  status: 'PENDING_SYNC' | 'SYNCED' | 'FAILED';
  secureData: string;
}

const STORAGE_KEY = 'verification_queue';

export const saveVerification = (pensionerData: any): VerificationRecord => {
  const record: VerificationRecord = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    status: 'PENDING_SYNC',
    secureData: encryptPayload({
      ic: pensionerData.ic,
      name: pensionerData.name,
      photo: pensionerData.photoBase64,
      biometrics: "MATCHED"
    })
  };

  const existingQueue = getVerificationQueue();
  existingQueue.push(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existingQueue));
  
  // Dispatch a custom event so hooks can react immediately
  window.dispatchEvent(new Event('storage-update'));
  
  return record;
};

export const getVerificationQueue = (): VerificationRecord[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const updateRecordStatus = (id: string, status: 'PENDING_SYNC' | 'SYNCED' | 'FAILED') => {
  const queue = getVerificationQueue();
  const index = queue.findIndex(r => r.id === id);
  if (index !== -1) {
    queue[index].status = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new Event('storage-update'));
  }
};
