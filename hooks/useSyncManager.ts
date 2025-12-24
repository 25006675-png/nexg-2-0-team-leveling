import { useState, useEffect } from 'react';
import { getVerificationQueue, updateRecordStatus, VerificationRecord } from '../services/OfflineStorage';
import { decryptPayload } from '../services/SecurityService';
import { OfflineManager } from '../utils/OfflineManager';

export const useSyncManager = (onSyncSuccess?: () => void, isAppOffline: boolean = false) => {
  const [pendingRecords, setPendingRecords] = useState<VerificationRecord[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  // Helper to refresh queue from storage
  const refreshQueue = () => {
    const queue = getVerificationQueue();
    setPendingRecords(queue.filter(r => r.status === 'PENDING_SYNC'));
  };

  // Monitor online status
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleStorageUpdate = () => refreshQueue();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('storage-update', handleStorageUpdate);

    // Initial load
    refreshQueue();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('storage-update', handleStorageUpdate);
    };
  }, []);

  // Mock API Upload
  const mockUploadToKWAP = async (data: any): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Uploaded to KWAP Secure Server:", data);
        resolve(true);
      }, 2000);
    });
  };

  const syncNow = async () => {
    if (isSyncing || pendingRecords.length === 0) return;
    
    setIsSyncing(true);

    try {
        // 1. Upload Secure Records (The Vault)
        // Simulate batch upload for better UX
        await mockUploadToKWAP({ count: pendingRecords.length });
        
        // Update all to SYNCED
        pendingRecords.forEach(r => {
            updateRecordStatus(r.id, 'SYNCED');
        });

        // 2. Clear Dashboard Queue (OfflineManager)
        const offlineQueue = OfflineManager.getQueue();
        if (offlineQueue.length > 0) {
            OfflineManager.moveToHistory(offlineQueue);
            OfflineManager.clearQueue();
        }

        // 3. Trigger Parent Updates
        if (onSyncSuccess) {
            onSyncSuccess();
        }

        refreshQueue();
    } catch (error) {
        console.error("Sync failed", error);
    } finally {
        setIsSyncing(false);
    }
  };

  // Auto-sync effect
  useEffect(() => {
      if (!isAppOffline && isOnline && pendingRecords.length > 0 && !isSyncing) {
          syncNow();
      }
  }, [isOnline, pendingRecords.length, isSyncing, isAppOffline]);

  return {
    pendingRecords,
    pendingCount: pendingRecords.length,
    isSyncing,
    uploadHistory,
    isOnline,
    syncNow
  };
};
