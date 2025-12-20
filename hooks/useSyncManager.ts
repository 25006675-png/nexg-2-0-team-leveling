import { useState, useEffect } from 'react';
import { getVerificationQueue, updateRecordStatus, VerificationRecord } from '../services/OfflineStorage';
import { decryptPayload } from '../services/SecurityService';

export const useSyncManager = () => {
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

  // Sync Loop
  useEffect(() => {
    if (!isOnline || pendingRecords.length === 0 || isSyncing) return;

    const syncNext = async () => {
      setIsSyncing(true);
      const record = pendingRecords[0]; // Process one by one

      try {
        const decryptedData = decryptPayload(record.secureData);
        
        if (decryptedData) {
          const success = await mockUploadToKWAP(decryptedData);
          if (success) {
            updateRecordStatus(record.id, 'SYNCED');
            setUploadHistory(prev => [...prev, `Synced ID: ${record.id.substring(0, 8)}...`]);
          }
        } else {
            // Data corruption
            updateRecordStatus(record.id, 'FAILED');
        }
      } catch (error) {
        console.error("Sync failed", error);
      } finally {
        setIsSyncing(false);
        // The storage update will trigger refreshQueue via event listener
      }
    };

    syncNext();
  }, [isOnline, pendingRecords, isSyncing]);

  return {
    isSyncing,
    pendingCount: pendingRecords.length,
    uploadHistory,
    isOnline
  };
};
