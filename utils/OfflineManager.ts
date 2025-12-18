import { Beneficiary } from '../types';

const QUEUE_KEY = 'pencen_offline_queue';
const HISTORY_KEY = 'pencen_history';

export interface PendingSubmission {
  beneficiaryId: string;
  kampungId: string;
  timestamp: number;
  data: Partial<Beneficiary>;
  token: string;
  referenceId: string;
  syncedAt?: string;
}

export const OfflineManager = {
  getQueue: (): PendingSubmission[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  addToQueue: (beneficiary: Beneficiary, kampungId: string, referenceId?: string) => {
    const queue = OfflineManager.getQueue();
    const token = OfflineManager.generateToken(beneficiary.ic);
    const refId = referenceId || OfflineManager.generateReferenceId(beneficiary.ic);
    
    const submission: PendingSubmission = {
      beneficiaryId: beneficiary.ic,
      kampungId: kampungId,
      timestamp: Date.now(),
      data: beneficiary,
      token: token,
      referenceId: refId
    };

    queue.push(submission);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    return { token, referenceId: refId };
  },

  clearQueue: () => {
    localStorage.removeItem(QUEUE_KEY);
  },

  generateReferenceId: (ic: string): string => {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const last4 = ic.slice(-4);
      const random3 = Math.random().toString(36).substring(2, 5).toUpperCase();
      return `MDK-${dateStr}-${last4}-${random3}`;
  },

  generateToken: (ic: string): string => {
    // Mock encryption token generation
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `AES-256: ${randomPart}-${ic.substring(0, 4)}...`;
  },

  getHistory: (): PendingSubmission[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  clearHistory: () => {
      localStorage.removeItem(HISTORY_KEY);
  },

  moveToHistory: (queueItems: PendingSubmission[]) => {
      const history = OfflineManager.getHistory();
      const newHistoryItems = queueItems.map(item => ({
          ...item,
          syncedAt: new Date().toISOString()
      }));
      
      const updatedHistory = [...newHistoryItems, ...history];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  },

  addOnlineVerificationToHistory: (beneficiary: Beneficiary, kampungId: string, referenceId: string) => {
      const history = OfflineManager.getHistory();
      const token = OfflineManager.generateToken(beneficiary.ic);
      
      const submission: PendingSubmission = {
          beneficiaryId: beneficiary.ic,
          kampungId: kampungId,
          timestamp: Date.now(),
          data: beneficiary,
          token: token,
          referenceId: referenceId,
          syncedAt: new Date().toISOString() // Immediately synced
      };

      const updatedHistory = [submission, ...history];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  }
};
