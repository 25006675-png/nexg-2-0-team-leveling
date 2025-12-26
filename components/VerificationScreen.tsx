import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ChevronLeft, CheckCircle2, Fingerprint, MapPin, AlertCircle, UserX, Home, AlertTriangle, ScanLine, Radar, Satellite, Check, Building2, Users, ScanFace, CreditCard } from 'lucide-react';
import { Beneficiary, VerificationType } from '../types';
import VerificationStages, { ScanStage } from './VerificationStages';
import AlertModal from './AlertModal';

import { useLanguage } from '../contexts/LanguageContext';

interface VerificationScreenProps {
  onScanComplete: (type: VerificationType) => void;
  beneficiary: Beneficiary;
  onBack: () => void;
  verificationLocation: VerificationType;
  onStepChange?: (step: 'MYKAD' | 'BIO') => void;
}

type ExceptionReason = 'DECEASED' | 'NOT_AT_HOME' | 'DAMAGED_ID' | null;

const VerificationScreen: React.FC<VerificationScreenProps> = ({ onScanComplete, beneficiary, onBack, verificationLocation, onStepChange }) => {
  const { t } = useLanguage();
  const [scanStage, setScanStage] = useState<ScanStage | 'ID_VERIFY' | 'READY_TO_SCAN'>('READY_TO_SCAN');
  const [showExitAlert, setShowExitAlert] = useState(false);
  
  useEffect(() => {
    if (onStepChange) {
        const mykadStages = ['READY_TO_SCAN', 'INSERT_CARD', 'READING_DATA', 'MYKAD_SUCCESS'];
        if (mykadStages.includes(scanStage as string)) {
            onStepChange('MYKAD');
        } else {
            onStepChange('BIO');
        }
    }
  }, [scanStage, onStepChange]);

  useEffect(() => {
      // Simulate Card Reading Sequence
      if (scanStage === 'INSERT_CARD') {
          const timer1 = setTimeout(() => {
              setScanStage('READING_DATA');
              const timer2 = setTimeout(() => {
                  setScanStage('MYKAD_SUCCESS');
                  // Stop here, wait for user to proceed
              }, 2000);
              return () => clearTimeout(timer2);
          }, 2500);
          return () => clearTimeout(timer1);
      }
  }, [scanStage]);

  const handleSmartBack = () => {
    const criticalStages = ['BIO_SCANNING', 'BIO_SUCCESS', 'GPS_SCANNING', 'GPS_SUCCESS', 'READING_DATA', 'MYKAD_SUCCESS'];
    
    if (criticalStages.includes(scanStage as string)) {
        setShowExitAlert(true);
        return;
    }
    
    onBack();
  };

  const handleBiometricAuth = () => {
      setScanStage('BIO_SCANNING');
      
      // Animation: Bio Scan -> GPS Scan
      setTimeout(() => {
          setScanStage('GPS_SCANNING');
          
          // GPS Scan -> GPS Success
          setTimeout(() => {
             setScanStage('GPS_SUCCESS');
             
             // GPS Success -> Bio Success
             setTimeout(() => {
                setScanStage('BIO_SUCCESS');

                // Complete
                // setTimeout(() => {
                //     if (verificationLocation) {
                //         onScanComplete(verificationLocation);
                //     }
                // }, 2000);
             }, 2000);
          }, 2500);
      }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full flex flex-col relative"
    >
      {/* Standardized Header (Wakil Style) */}
      <div className="flex items-center gap-4 mb-4 shrink-0 px-6 pt-2">
        <button 
          onClick={handleSmartBack}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ChevronLeft size={20} />
          <span className="font-bold text-sm">Back</span>
        </button>

        <div>
          <h2 className="text-xl font-bold text-gray-900">Pension Continuation</h2>
          <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
            <ScanFace size={14} />
            <span>{t.confirmation.subtitle}</span>
          </div>
        </div>
      </div>

      {/* --- READER INTERFACE (Animation Stages) --- */}
       <div className="flex-1 overflow-y-auto relative px-6 no-scrollbar">
       {scanStage === 'READY_TO_SCAN' ? (
           <div className="flex flex-col items-center w-full max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="w-full">
                    <div className="mb-6 text-center">
                        <h3 className="text-2xl font-bold text-gov-900">Identity Verification</h3>
                        <p className="text-gray-500 text-sm mt-1">Verify Beneficiary Identity</p>
                    </div>

                    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
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
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex items-start gap-3">
                            <MapPin size={16} className="text-gray-400 mt-0.5" />
                            <p className="text-sm text-gray-600 font-medium">{beneficiary.address}</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center py-10 space-y-6 bg-white rounded-2xl shadow-sm border border-gray-200">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
                            <CreditCard size={48} className="text-blue-600" />
                        </div>
                        <div className="text-center px-6">
                            <h4 className="font-bold text-gray-800 mb-2">Verify Identity</h4>
                            <p className="text-sm text-gray-500">Please insert the MyKad to verify identity before proceeding.</p>
                        </div>
                        <button 
                            onClick={() => setScanStage('INSERT_CARD')}
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                            <CreditCard size={20} />
                            <span>Read MyKad</span>
                        </button>
                    </div>
               </div>
           </div>
       ) : (
        <VerificationStages 
            stage={scanStage as ScanStage} 
            locationType={verificationLocation}
            onBioAuth={handleBiometricAuth}
            enableFaceScan={true}
            referenceImage={beneficiary.photoUrl}
            customBioLockHeader={t.verification.polRequired}
            customBioLockSubtext={t.verification.polBioRequired}
            customSuccessHeader={t.verification.polAccepted}
            customSuccessSubtext={t.verification.polDecrypted}
            onContinue={() => {
                if (scanStage === 'MYKAD_SUCCESS') {
                    setScanStage('BIO_LOCK');
                } else if (verificationLocation) {
                    onScanComplete(verificationLocation);
                }
            }}
            continueLabel={scanStage === 'MYKAD_SUCCESS' ? t.verification.proceedPol : t.verification.proceedConfirmation}
            stepLabel={
                ['INSERT_CARD', 'READING_DATA', 'MYKAD_SUCCESS'].includes(scanStage as string) ? `${t.common.step} 1` :
                ['BIO_LOCK', 'BIO_SCANNING'].includes(scanStage as string) ? `${t.common.step} 2` :
                ['GPS_SCANNING', 'GPS_SUCCESS'].includes(scanStage as string) ? `${t.common.step} 3` :
                scanStage === 'BIO_SUCCESS' ? t.resident.verified : undefined
            }
        />
       )}
       </div>

       <AlertModal
        isOpen={showExitAlert}
        onClose={() => setShowExitAlert(false)}
        title="Transaction in Progress"
        message="Are you sure you want to cancel? All progress will be lost."
        type="warning"
        actionLabel="Yes, Exit"
        onAction={onBack}
        cancelLabel="Cancel"
      />
    </motion.div>
  );
};

export default VerificationScreen;