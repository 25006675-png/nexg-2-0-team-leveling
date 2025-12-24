import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, ChevronLeft, MapPin, Eye, Banknote, Calendar, Home, Building2, WifiOff, ScanFace } from 'lucide-react';
import { Beneficiary } from '../types';
import { OfflineManager } from '../utils/OfflineManager';
import AlertModal from './AlertModal';
import { useLanguage } from '../contexts/LanguageContext';

interface VerifyScreenProps {
  onVerified: (updatedBeneficiary: Beneficiary) => void;
  beneficiary: Beneficiary;
  kampungId: string;
  onBack: () => void;
  isOffline?: boolean;
}

const VerifyScreen: React.FC<VerifyScreenProps> = ({ onVerified, beneficiary, kampungId, onBack, isOffline: propIsOffline }) => {
  const { t } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);
  const [localIsOffline, setLocalIsOffline] = useState(!navigator.onLine);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [pendingData, setPendingData] = useState<Beneficiary | null>(null);
  
  const isOffline = propIsOffline !== undefined ? propIsOffline : localIsOffline;

  useEffect(() => {
    if (propIsOffline !== undefined) return;

    const handleOnline = () => setLocalIsOffline(false);
    const handleOffline = () => setLocalIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, [propIsOffline]);
  
  const totalPayout = beneficiary.monthlyPayout * beneficiary.pendingMonths;

  const handleSave = () => {
     setIsSaving(true);
     
     // Generate Unified Reference ID
     const referenceId = OfflineManager.generateReferenceId(beneficiary.ic);
     const updatedData: Beneficiary = { ...beneficiary, status: 'Verified', referenceId };

     // Simulate processing
     setTimeout(() => {
         if (isOffline) {
             // Offline Flow
             OfflineManager.addToQueue(beneficiary, kampungId, 'PROOF_OF_LIFE', referenceId);
             setPendingData(updatedData);
             setShowOfflineModal(true);
         } else {
             onVerified(updatedData);
         }
     }, 1500);
  };

  const handleModalClose = () => {
      setShowOfflineModal(false);
      if (pendingData) {
          onVerified(pendingData);
      }
  };

  // Helper formatting currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full flex flex-col p-6 md:p-0"
    >
      <AlertModal 
        isOpen={showOfflineModal}
        onClose={handleModalClose}
        title={t.confirmation.offlineNoticeTitle}
        message={t.confirmation.offlineNoticeDesc}
        type="offline"
        actionLabel={t.confirmation.understand}
      />

      {/* Standardized Header */}
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ChevronLeft size={20} />
          <span className="font-bold text-sm">{t.common.back}</span>
        </button>

        <div>
          <h2 className="text-xl font-bold text-gray-900">Pension continuation</h2>
          <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
            <ScanFace size={14} />
            <span>Proof of Life for Fund Release</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-100 flex items-center gap-1">
                <Eye size={10} />
                {t.confirmation.verifiedBadge}
            </span>
        </div>
      </div>

      <div className="flex flex-col gap-6 mb-8">
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start gap-5 mb-4">
                    <img 
                    src={beneficiary.photoUrl} 
                    alt={beneficiary.name} 
                    className="w-20 h-20 rounded-xl object-cover border-2 border-gray-100 bg-gray-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xl text-gov-900 leading-tight">{beneficiary.name}</h3>
                        <p className="text-sm text-gray-500 font-mono mt-1">{beneficiary.ic}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded border flex items-center gap-1
                                ${beneficiary.geography === 'DEEP_RURAL' ? 'bg-purple-100 text-purple-900 border-purple-200' : 'bg-orange-100 text-orange-900 border-orange-200'}
                            `}>
                                <MapPin size={12} />
                                {beneficiary.geography === 'DEEP_RURAL' ? t.extra.deepRural : t.extra.rural}
                            </span>
                            {beneficiary.verificationType && (
                                <span className="text-[10px] font-bold px-2 py-1 rounded border flex items-center gap-1 bg-blue-100 text-blue-900 border-blue-200">
                                    {beneficiary.verificationType === 'HOME' ? <Home size={12} /> : <Building2 size={12}/>}
                                    {beneficiary.verificationType === 'HOME' ? t.verification.homeVisit : t.verification.communityHall}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex items-start gap-3">
                    <MapPin size={16} className="text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-600 font-medium">{beneficiary.address}</p>
                </div>
          </div>

          <div className="bg-gov-50 rounded-xl p-5 border border-gov-100">
               <label className="text-[10px] font-bold text-gov-500 uppercase tracking-wider mb-3 block">
                   {t.extra.pensionDetails}
               </label>
               
               <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                   <div className="p-4 flex justify-between items-center border-b border-gray-100">
                       <div className="flex items-center gap-3">
                           <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                               <Banknote size={18} />
                           </div>
                           <span className="text-sm font-medium text-gray-600">{t.confirmation.monthlyPayout}</span>
                       </div>
                       <span className="font-mono font-semibold text-gray-900">{formatCurrency(beneficiary.monthlyPayout)}</span>
                   </div>
                   
                   <div className="p-4 flex justify-between items-center border-b border-gray-100">
                       <div className="flex items-center gap-3">
                           <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
                               <Calendar size={18} />
                           </div>
                           <span className="text-sm font-medium text-gray-600">{t.confirmation.pendingMonths}</span>
                       </div>
                       <span className="font-mono font-semibold text-gray-900">x {beneficiary.pendingMonths}</span>
                   </div>

                   <div className="p-4 flex justify-between items-center bg-green-50/50">
                       <span className="text-sm font-bold text-gov-900">{t.confirmation.totalPayout}</span>
                       <span className="font-mono text-xl font-bold text-green-600">{formatCurrency(totalPayout)}</span>
                   </div>
               </div>
               
               <p className="text-[10px] text-gray-400 mt-3 text-center">
                   {t.extra.proofOfLife}
               </p>
          </div>
      </div>

      <div className="mt-auto w-full">
         <button
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full rounded-xl p-5 flex items-center justify-between transition-all group relative overflow-hidden ${
            !isSaving
                ? isOffline 
                    ? 'bg-amber-600 text-white hover:shadow-[0_3px_0_0_#78350f] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] shadow-[0_6px_0_0_#78350f]'
                    : 'bg-gov-900 text-white hover:shadow-[0_3px_0_0_#020617] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] shadow-[0_6px_0_0_#020617]' 
                : 'bg-gray-800 text-gray-400 cursor-wait shadow-[0_6px_0_0_#1f2937]'
            }`}
        >
            <div className="text-left relative z-10">
                <span className="block text-lg font-bold">
                    {isSaving 
                        ? (isOffline ? t.extra.encrypting : t.confirmation.processing) 
                        : (isOffline ? t.extra.saveEnclave : t.confirmation.confirmSubmit)
                    }
                </span>
                <span className={`text-xs ${isOffline ? 'text-amber-100' : 'text-blue-200'}`}>
                     {isSaving 
                        ? t.extra.synchronizing 
                        : (isOffline ? t.extra.storeForward : t.extra.verifyValue.replace('{value}', formatCurrency(totalPayout)))
                     }
                </span>
            </div>
            <div className="p-3 rounded-xl bg-white/10">
                {isOffline ? <WifiOff size={24} /> : <Save size={24} className={isSaving ? 'animate-bounce' : ''} />}
            </div>
        </button>
        {isOffline && (
            <p className="text-center text-xs text-amber-700 mt-3 font-medium flex items-center justify-center gap-1">
                <WifiOff size={12} />
                {t.extra.offlineDataStored}
            </p>
        )}
      </div>
    </motion.div>
  );
};

export default VerifyScreen;