import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, MapPin, AlertCircle, UserX, Home, AlertTriangle, Building2, Users, ScanFace } from 'lucide-react';
import { Beneficiary, VerificationType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ModeSelectionScreenProps {
  beneficiary: Beneficiary;
  onSelectMode: (type: VerificationType) => void;
  onException: (reason: 'DECEASED' | 'NOT_AT_HOME' | 'DAMAGED_ID') => void;
  onBack: () => void;
}

const ModeSelectionScreen: React.FC<ModeSelectionScreenProps> = ({ beneficiary, onSelectMode, onException, onBack }) => {
  const { t } = useLanguage();
  const [showExceptionMenu, setShowExceptionMenu] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full flex flex-col relative p-6 md:p-0"
    >
      {/* Standardized Header */}
      <div className="flex items-center gap-4 mb-4 shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ChevronLeft size={20} />
          <span className="font-bold text-sm">Back</span>
        </button>

        <div>
          <h2 className="text-xl font-bold text-gray-900">Biometric Proof of Life</h2>
          <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
            <ScanFace size={14} />
            <span>Select Verification Mode</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-white md:bg-transparent rounded-3xl h-full relative">
           <div className="w-full max-w-sm space-y-6">
               <div className="text-center mb-2">
                   <div className="relative inline-block">
                       <img src={beneficiary.photoUrl} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg bg-gray-200" alt="Profile" />
                   </div>
                   <h2 className="text-xl font-bold text-gov-900 mt-2">{beneficiary.name}</h2>
                   <p className="text-gray-500 font-mono text-xs">{beneficiary.ic}</p>
               </div>
               
               <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
                   <div className="flex items-start gap-2">
                       <MapPin size={14} className="text-gov-700 mt-0.5 shrink-0" />
                       <p className="text-xs text-gray-700 font-medium leading-relaxed">{beneficiary.address}</p>
                   </div>
               </div>

               <div className="space-y-4 pt-2">
                   <div className="flex items-center gap-3">
                       <div className="h-px bg-gray-200 flex-1"></div>
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.verification.selectProtocol}</span>
                       <div className="h-px bg-gray-200 flex-1"></div>
                   </div>

                   <div className="grid grid-cols-1 gap-3">
                       <button 
                         onClick={() => onSelectMode('HOME')}
                         className="relative w-full p-4 bg-white border-2 border-orange-100 rounded-xl hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10 transition-all text-left group overflow-hidden"
                       >
                           <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                               <Home size={64} className="text-orange-900" />
                           </div>
                           <div className="flex items-start gap-3 relative z-10">
                               <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                   <Home size={20} />
                               </div>
                               <div>
                                   <h3 className="font-bold text-gov-900 text-lg">{t.verification.homeVisit}</h3>
                                   <p className="text-xs text-gray-500 mt-1">{t.verification.homeDesc}</p>
                               </div>
                           </div>
                       </button>

                       <button 
                         onClick={() => onSelectMode('HALL')}
                         className="relative w-full p-4 bg-white border-2 border-blue-100 rounded-xl hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all text-left group overflow-hidden"
                       >
                           <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                               <Building2 size={64} className="text-blue-900" />
                           </div>
                           <div className="flex items-start gap-3 relative z-10">
                               <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                   <Users size={20} />
                               </div>
                               <div>
                                   <h3 className="font-bold text-gov-900 text-lg">{t.verification.communityHall}</h3>
                                   <p className="text-xs text-gray-500 mt-1">{t.verification.hallDesc}</p>
                               </div>
                           </div>
                       </button>
                   </div>

                   <div className="relative pt-2">
                        <button 
                            onClick={() => setShowExceptionMenu(!showExceptionMenu)}
                            className="w-full py-2 text-xs text-gray-400 font-bold hover:text-red-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <AlertCircle size={14} />
                            {t.verification.reportIssue}
                        </button>
                        
                        <AnimatePresence>
                            {showExceptionMenu && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20"
                                >
                                    <div className="p-2 space-y-1">
                                        <button onClick={() => onException('DECEASED')} className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-700 rounded-lg flex items-center gap-3 transition-colors">
                                            <UserX size={16} />
                                            <span className="text-xs font-bold">{t.verification.deceased}</span>
                                        </button>
                                        <button onClick={() => onException('NOT_AT_HOME')} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700 rounded-lg flex items-center gap-3 transition-colors">
                                            <Home size={16} />
                                            <span className="text-xs font-medium">{t.verification.notAtHome}</span>
                                        </button>
                                        <button onClick={() => onException('DAMAGED_ID')} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700 rounded-lg flex items-center gap-3 transition-colors">
                                            <AlertTriangle size={16} />
                                            <span className="text-xs font-medium">{t.verification.damagedId}</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                   </div>
               </div>
           </div>
      </div>
    </motion.div>
  );
};

export default ModeSelectionScreen;
