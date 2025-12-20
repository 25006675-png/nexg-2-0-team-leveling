import React from 'react';
import { useSyncManager } from '../hooks/useSyncManager';
import { RefreshCw, CheckCircle, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SyncStatusIndicator: React.FC = () => {
  const { isSyncing, pendingCount, isOnline } = useSyncManager();

  if (!isOnline) {
      return (
          <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-full border border-gray-700 shadow-lg">
              <WifiOff size={14} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-400">Offline Mode</span>
          </div>
      );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
        <AnimatePresence mode="wait">
            {pendingCount > 0 ? (
                <motion.div 
                    key="syncing"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="flex items-center gap-3 px-4 py-3 bg-slate-900 rounded-xl border border-cyan-500/30 shadow-xl backdrop-blur-md"
                >
                    <div className="relative">
                        <RefreshCw size={20} className={`text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                            {isSyncing ? 'Syncing to KWAP...' : 'Pending Upload'}
                        </span>
                        <span className="text-[10px] text-cyan-200/70">
                            {pendingCount} record{pendingCount !== 1 ? 's' : ''} remaining
                        </span>
                    </div>
                </motion.div>
            ) : (
                <motion.div 
                    key="synced"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-900/80 rounded-full border border-green-500/30 shadow-lg backdrop-blur-sm"
                >
                    <CheckCircle size={14} className="text-green-400" />
                    <span className="text-xs font-medium text-green-100">All Records Secure</span>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default SyncStatusIndicator;
