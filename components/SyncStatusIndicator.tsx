import React from 'react';
import { useSyncManager } from '../hooks/useSyncManager';
import { RefreshCw, CheckCircle, WifiOff, CloudUpload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

interface SyncStatusIndicatorProps {
    onSync?: () => void;
    isOffline?: boolean;
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ onSync, isOffline = false }) => {
  const { t } = useLanguage();
  const { isSyncing, pendingCount, isOnline } = useSyncManager(onSync, isOffline);

  if (!isOnline || isOffline) {
      return (
          <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-full border border-gray-700 shadow-lg">
              <WifiOff size={14} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-400">{t.sync.offlineMode}</span>
          </div>
      );
  }

  return (
    <>
        {/* Centered Large Syncing Animation */}
        <AnimatePresence>
            {isSyncing && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
                >
                    <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-6 max-w-sm w-full mx-4">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-cyan-50 flex items-center justify-center">
                                <RefreshCw size={48} className="text-cyan-500 animate-spin" />
                            </div>
                            <span className="absolute top-0 right-0 flex h-6 w-6">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-6 w-6 bg-cyan-500 border-4 border-white"></span>
                            </span>
                        </div>
                        
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-gray-900">{t.sync.syncingTitle}</h3>
                            <p className="text-gray-500 text-sm">
                                {t.sync.uploadingDesc.replace('{count}', pendingCount.toString()).replace('{s}', pendingCount !== 1 ? 's' : '')}
                            </p>
                        </div>

                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <motion.div 
                                className="h-full bg-cyan-500"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Bottom Right Status (Only when NOT syncing) */}
        <div className="fixed bottom-4 right-4 z-50">
            <AnimatePresence mode="wait">
                {!isSyncing && pendingCount > 0 && (
                    <motion.div 
                        key="pending"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="flex items-center gap-3 px-4 py-3 bg-slate-900 rounded-xl border border-cyan-500/30 shadow-xl backdrop-blur-md"
                    >
                        <CloudUpload size={20} className="text-cyan-400" />
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                                {t.sync.pendingUpload}
                            </span>
                            <span className="text-[10px] text-cyan-200/70">
                                {t.sync.waitingConnection.replace('{count}', pendingCount.toString()).replace('{s}', pendingCount !== 1 ? 's' : '')}
                            </span>
                        </div>
                    </motion.div>
                )}
                
                {!isSyncing && pendingCount === 0 && (
                    <motion.div 
                        key="synced"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-900/80 rounded-full border border-green-500/30 shadow-lg backdrop-blur-sm"
                    >
                        <CheckCircle size={14} className="text-green-400" />
                        <span className="text-xs font-medium text-green-100">{t.sync.allSecure}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </>
  );
};

export default SyncStatusIndicator;
