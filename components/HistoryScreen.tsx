import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Clock, CheckCircle2, FileText, X, WifiOff, Trash2, Shield } from 'lucide-react';
import { OfflineManager, PendingSubmission } from '../utils/OfflineManager';
import { Beneficiary } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface HistoryScreenProps {
  onBack: () => void;
  kampungId: string;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack, kampungId }) => {
  const { t, language } = useLanguage();
  const [history, setHistory] = useState<PendingSubmission[]>([]);
  const [selectedItem, setSelectedItem] = useState<PendingSubmission | null>(null);

  useEffect(() => {
    const allHistory = OfflineManager.getHistory();
    // Filter by kampungId if available in the record, otherwise show all (legacy support)
    const filtered = allHistory.filter(h => !h.kampungId || h.kampungId === kampungId);
    setHistory(filtered);
  }, [kampungId]);

  const handleClearHistory = () => {
      if (confirm(t.history.clearConfirm)) {
          OfflineManager.clearHistory();
          setHistory([]);
      }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(language === 'ms' ? 'ms-MY' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
      return new Date(timestamp).toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full flex flex-col p-6 md:p-0"
    >
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600">
            <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gov-900">{t.history.activityLog}</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <Clock size={48} className="mb-4 opacity-20" />
                  <p>{t.history.noHistory}</p>
              </div>
          ) : (
              <div className="space-y-3">
                  {history.map((item, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setSelectedItem(item)}
                        className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                          <div className="flex items-center gap-4">
                              {item.type === 'WAKIL_APPOINTMENT' ? (
                                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
                                      <Shield size={20} />
                                  </div>
                              ) : (
                                  <div className="w-10 h-10 rounded-full bg-gov-100 flex items-center justify-center text-gov-700 font-bold text-xs">
                                      {item.data.name?.substring(0, 2).toUpperCase()}
                                  </div>
                              )}
                              <div>
                                  <h3 className="font-bold text-gov-900 text-sm">{item.data.name}</h3>
                                  <p className="text-xs text-gray-500">
                                      {item.type === 'WAKIL_APPOINTMENT' ? 'Wakil Appointment' : 'Proof of Life'} • {formatTime(item.timestamp)}
                                  </p>
                              </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                              {item.syncedAt ? (
                                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold flex items-center gap-1">
                                      <CheckCircle2 size={10} /> {t.history.synced}
                                  </span>
                              ) : (
                                  <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center gap-1">
                                      <WifiOff size={10} /> {t.history.offline}
                                  </span>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
      
      {history.length > 0 && (
        <div className="mt-4 flex justify-center">
            <button 
                onClick={handleClearHistory}
                className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
                <Trash2 size={12} />
                {t.history.clearHistory}
            </button>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
          {selectedItem && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedItem(null)}
              >
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white w-full max-w-md rounded-2xl overflow-hidden"
                    onClick={e => e.stopPropagation()}
                  >
                      <div className="bg-gov-900 p-4 flex justify-between items-center text-white">
                          <h3 className="font-bold">{t.history.verificationAck}</h3>
                          <button onClick={() => setSelectedItem(null)}><X size={20} /></button>
                      </div>
                      <div className="p-6 space-y-4">
                          <div className="flex justify-between border-b border-gray-100 pb-4">
                              <span className="text-gray-500 text-sm">{t.history.referenceId}</span>
                              <span className="font-mono font-bold text-sm">{selectedItem.referenceId || t.history.na}</span>
                          </div>
                          
                          {selectedItem.type === 'WAKIL_APPOINTMENT' && (
                              <div className="flex justify-between bg-purple-50 p-2 rounded-lg">
                                  <span className="text-purple-700 text-sm font-bold">Appointed Wakil</span>
                                  <span className="font-bold text-sm text-right text-purple-900">{selectedItem.data.wakilName}</span>
                              </div>
                          )}

                          <div className="flex justify-between">
                              <span className="text-gray-500 text-sm">{t.history.beneficiary}</span>
                              <span className="font-bold text-sm text-right">{selectedItem.data.name}</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-gray-500 text-sm">{t.history.icNumber}</span>
                              <span className="font-mono text-sm">{selectedItem.data.ic}</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-gray-500 text-sm">{t.history.pensionValue}</span>
                              <span className="font-bold text-green-600">{t.extra.rm} {((selectedItem.data.monthlyPayout || 0) * (selectedItem.data.pendingMonths || 0)).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-gray-500 text-sm">{t.history.syncedAt}</span>
                              <span className="text-xs text-gray-400">{selectedItem.syncedAt ? new Date(selectedItem.syncedAt).toLocaleString(language === 'ms' ? 'ms-MY' : 'en-US') : t.history.pendingUpload}</span>
                          </div>
                      </div>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HistoryScreen;