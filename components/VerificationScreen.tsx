import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ChevronLeft, CheckCircle2, Fingerprint, MapPin, AlertCircle, UserX, Home, AlertTriangle, ScanLine, Radar, Satellite, Check, Building2, Users, ScanFace } from 'lucide-react';
import { Beneficiary, VerificationType } from '../types';
import VerificationStages, { ScanStage } from './VerificationStages';
import AlertModal from './AlertModal';

import { useLanguage } from '../contexts/LanguageContext';

interface VerificationScreenProps {
  onScanComplete: (type: VerificationType) => void;
  beneficiary: Beneficiary;
  onBack: () => void;
  verificationLocation: VerificationType;
}

type ExceptionReason = 'DECEASED' | 'NOT_AT_HOME' | 'DAMAGED_ID' | null;

const VerificationScreen: React.FC<VerificationScreenProps> = ({ onScanComplete, beneficiary, onBack, verificationLocation }) => {
  const { t } = useLanguage();
  const [scanStage, setScanStage] = useState<ScanStage>('INSERT_CARD');
  const [showExitAlert, setShowExitAlert] = useState(false);
  
  useEffect(() => {
      // Start the scan sequence automatically when component mounts
      const timer = setTimeout(() => {
          setScanStage('BIO_LOCK');
      }, 1500);
      return () => clearTimeout(timer);
  }, []);

  const handleSmartBack = () => {
    const criticalStages = ['BIO_SCANNING', 'BIO_SUCCESS', 'GPS_SCANNING', 'GPS_SUCCESS', 'READING_DATA'];
    
    if (criticalStages.includes(scanStage)) {
        setShowExitAlert(true);
        return;
    }
    
    onBack();
  };

  const handleBiometricAuth = () => {
      setScanStage('BIO_SCANNING');
      
      // Animation 2: Scanning -> Success
      setTimeout(() => {
          setScanStage('BIO_SUCCESS');
          
          // Animation 2.5: Success -> GPS Auto-Verify (skip manual lock)
          setTimeout(() => {
             setScanStage('GPS_SCANNING');
             
             // GPS Check Flow
             setTimeout(() => {
                setScanStage('GPS_SUCCESS');

                setTimeout(() => {
                    setScanStage('READING_DATA');
                    
                    setTimeout(() => {
                        if (verificationLocation) {
                            onScanComplete(verificationLocation);
                        }
                    }, 3000); // Decrypt time
                }, 2000); // Success display time
             }, 2500); // GPS Check time

          }, 2000);
      }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full flex flex-col relative"
    >
      {/* Standardized Header (Wakil Style) */}
      <div className="flex items-center gap-4 mb-4 shrink-0 px-6 pt-6">
        <button 
          onClick={handleSmartBack}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ChevronLeft size={20} />
          <span className="font-bold text-sm">Back</span>
        </button>

        <div>
          <h2 className="text-xl font-bold text-gray-900">Biometric Proof of Life</h2>
          <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
            <ScanFace size={14} />
            <span>Identity & Liveness Check</span>
          </div>
        </div>
      </div>

      {/* --- READER INTERFACE (Animation Stages) --- */}
       <div className="flex-1 overflow-y-auto relative px-6 no-scrollbar">
       <VerificationStages 
          stage={scanStage} 
          locationType={verificationLocation}
          onBioAuth={handleBiometricAuth}
          enableFaceScan={true}
          referenceImage={beneficiary.photoUrl}
          stepLabel={
            scanStage === 'INSERT_CARD' ? "Step 1" :
            ['BIO_LOCK', 'BIO_SCANNING', 'BIO_SUCCESS'].includes(scanStage) ? "Step 2" :
            ['GPS_SCANNING', 'GPS_SUCCESS'].includes(scanStage) ? "Step 3" :
            scanStage === 'READING_DATA' ? "Secure" : undefined
          }
       />
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