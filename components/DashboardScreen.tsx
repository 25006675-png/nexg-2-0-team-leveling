import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle2, MapPin, CreditCard, ArrowDown, Users, AlertCircle, Wifi, WifiOff, CloudUpload, Home, Building2 } from 'lucide-react';
import { Beneficiary, Kampung } from '../types';

interface DashboardScreenProps {
  onSelectBeneficiary: (beneficiary: Beneficiary) => void;
  beneficiaries: Beneficiary[];
  onReset: () => void;
  kampung: Kampung;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  onSync: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ 
  onSelectBeneficiary, 
  beneficiaries, 
  onReset, 
  kampung,
  isOffline,
  setIsOffline,
  onSync
}) => {
  // Sorting Logic - Alphabetical standard list
  const sortedBeneficiaries = useMemo(() => {
    return [...beneficiaries].sort((a, b) => a.name.localeCompare(b.name));
  }, [beneficiaries]);

  const pendingList = sortedBeneficiaries.filter(b => !b.completed);
  const completedList = sortedBeneficiaries.filter(b => b.completed);
  const pendingSyncList = completedList.filter(b => b.syncStatus === 'pending');

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full flex flex-col p-6 md:p-0"
    >
      <div className="mb-6 shrink-0 bg-gov-50 p-4 rounded-xl border border-gov-100">
          <div className="flex justify-between items-start mb-4">
            <div>
                 <div className="flex items-center gap-2 mb-1">
                    <MapPin className="text-gov-700" size={18} />
                    <h2 className="text-lg font-bold text-gov-900">{kampung.name}</h2>
                </div>
                <div className="flex gap-2">
                    <div className={`px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        kampung.geography === 'DEEP_RURAL' 
                        ? 'bg-purple-100 text-purple-900 border-purple-200' 
                        : 'bg-orange-100 text-orange-900 border-orange-200'
                    }`}>
                        {kampung.geography === 'DEEP_RURAL' ? 'Deep Rural' : 'Rural'} Area
                    </div>
                </div>
            </div>
            
            {/* Offline Mode Toggle */}
            <button 
                onClick={() => setIsOffline(!isOffline)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${isOffline ? 'bg-gray-200 border-gray-300 text-gray-600' : 'bg-green-100 border-green-200 text-green-700'}`}
            >
                {isOffline ? <WifiOff size={16} /> : <Wifi size={16} />}
                <span className="text-[10px] font-bold mt-1 uppercase">{isOffline ? 'Offline' : 'Online'}</span>
            </button>
          </div>

          {/* Sync Status Banner */}
          {pendingSyncList.length > 0 && !isOffline && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="bg-blue-100 border border-blue-200 rounded-lg p-3 flex justify-between items-center mb-2"
              >
                  <div className="flex items-center gap-2">
                      <CloudUpload size={16} className="text-blue-600" />
                      <span className="text-xs font-bold text-blue-800">{pendingSyncList.length} records pending sync</span>
                  </div>
                  <button 
                    onClick={onSync}
                    className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded shadow-sm hover:bg-blue-700 transition-colors"
                  >
                      Sync Now
                  </button>
              </motion.div>
          )}

          {pendingSyncList.length > 0 && isOffline && (
              <div className="bg-gray-200 border border-gray-300 rounded-lg p-3 flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                      <CloudUpload size={16} className="text-gray-500" />
                      <span className="text-xs font-bold text-gray-600">{pendingSyncList.length} saved locally</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Waiting for network</span>
              </div>
          )}

          <p className="text-sm text-gray-600">
              Eligible Recipients: <strong className="text-gov-900">{pendingList.length}</strong>
          </p>
      </div>

      <div className="flex-1 flex flex-col w-full min-h-0 overflow-y-auto no-scrollbar pb-20 md:pb-0">
          <div className="space-y-3">
              {pendingList.length === 0 && completedList.length === 0 ? (
                  <div className="text-center py-12 bg-green-50 rounded-2xl border border-green-100 flex flex-col items-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600 shadow-sm">
                          <Users size={32} />
                      </div>
                      <h3 className="font-bold text-xl text-green-900">No Pending Cases</h3>
                      <p className="text-sm text-green-700 mt-2">There are no eligible citizens in this area currently.</p>
                  </div>
              ) : (
                  pendingList.map((b) => (
                      <motion.button
                          key={b.ic}
                          onClick={() => onSelectBeneficiary(b)}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-full relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 text-left group"
                      >
                          <div className="p-4 flex gap-4">
                              <div className="relative shrink-0">
                                  <img src={b.photoUrl} alt={b.name} className="w-14 h-14 rounded-full object-cover bg-gray-200 border border-gray-100" />
                              </div>
                              <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start mb-1">
                                      <h4 className="font-bold text-base text-gov-900 truncate pr-2">{b.name}</h4>
                                  </div>
                                  
                                  <div className="flex items-start gap-1.5 mt-1">
                                      <MapPin size={12} className="text-gray-400 mt-0.5 shrink-0" />
                                      <p className="text-xs text-gray-500 font-medium leading-snug line-clamp-2">
                                          {b.address}
                                      </p>
                                  </div>

                                  <div className="mt-3 flex items-center gap-2">
                                     <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Status</span>
                                     <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                                         <AlertCircle size={10} />
                                         Pending Payment
                                     </span>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 flex justify-between items-center group-hover:bg-blue-50/50 transition-colors">
                              <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                                  <CreditCard size={12}/>
                                  {b.ic}
                              </div>
                              <div className="flex items-center gap-1 text-xs font-bold text-gov-800 group-hover:text-blue-600">
                                  Verify Identity
                                  <ArrowDown size={12} className="-rotate-90"/>
                              </div>
                          </div>
                      </motion.button>
                  ))
              )}
              
              {/* Completed List */}
              {completedList.length > 0 && (
                  <div className="pt-6">
                       <div className="flex items-center gap-3 mb-4">
                          <div className="h-px bg-gray-200 flex-1"></div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Completed</span>
                          <div className="h-px bg-gray-200 flex-1"></div>
                      </div>
                      {completedList.map((b) => (
                          <div key={b.ic} className="opacity-80 mb-3">
                               <div className="w-full relative bg-gray-50 border border-gray-100 rounded-xl overflow-hidden p-4 flex gap-4 items-center">
                                   <div className="relative shrink-0">
                                       <img src={b.photoUrl} alt={b.name} className="w-10 h-10 rounded-full object-cover bg-gray-200 grayscale" />
                                       <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-white">
                                           <CheckCircle2 size={8} />
                                       </div>
                                   </div>
                                   <div className="flex-1 min-w-0">
                                       <h4 className="font-bold text-sm text-gray-600 truncate">{b.name}</h4>
                                       <div className="flex items-center gap-2 mt-1">
                                           {b.verificationType === 'HOME' && (
                                                <span className="flex items-center gap-1 text-[9px] font-bold text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
                                                    <Home size={10} /> Home
                                                </span>
                                           )}
                                           {b.verificationType === 'HALL' && (
                                                <span className="flex items-center gap-1 text-[9px] font-bold text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
                                                    <Building2 size={10} /> Hall
                                                </span>
                                           )}
                                            {b.syncStatus === 'pending' && (
                                                <span className="flex items-center gap-1 text-[9px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200">
                                                    <CloudUpload size={10} /> Unsynced
                                                </span>
                                            )}
                                       </div>
                                   </div>
                                   <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Paid</span>
                               </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>

          <div className="mt-8 text-center pb-8">
               <button 
                  onClick={onReset}
                  className="inline-flex items-center gap-2 text-[10px] font-bold text-gray-300 hover:text-gray-500 uppercase tracking-widest transition-colors"
               >
                   <RefreshCw size={12} />
                   Reset Database
               </button>
          </div>
      </div>
    </motion.div>
  );
};

export default DashboardScreen;