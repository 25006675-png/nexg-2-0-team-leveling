import { Beneficiary } from '../types';

const QUEUE_KEY = 'pencen_offline_queue';
const HISTORY_KEY = 'pencen_history';

export interface PendingSubmission {
  beneficiaryId: string;
  timestamp: number;
  data: Partial<Beneficiary>;
  token: string;
  syncedAt?: string;
}

export const OfflineManager = {
  getQueue: (): PendingSubmission[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  addToQueue: (beneficiary: Beneficiary) => {
    const queue = OfflineManager.getQueue();
    const token = OfflineManager.generateToken(beneficiary.ic);
    
    const submission: PendingSubmission = {
      beneficiaryId: beneficiary.ic,
      timestamp: Date.now(),
      data: beneficiary,
      token: token
    };

    queue.push(submission);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    return token;
  },

  clearQueue: () => {
    localStorage.removeItem(QUEUE_KEY);
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

  moveToHistory: (queueItems: PendingSubmission[]) => {
      const history = OfflineManager.getHistory();
      const newHistoryItems = queueItems.map(item => ({
          ...item,
          syncedAt: new Date().toISOString()
      }));
      
      const updatedHistory = [...newHistoryItems, ...history];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  }
};
