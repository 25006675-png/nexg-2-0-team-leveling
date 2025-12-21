import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ChevronLeft, CheckCircle2, Fingerprint, MapPin, AlertCircle, UserX, Home, AlertTriangle, ScanLine, Radar, Satellite, Check, Building2, Users } from 'lucide-react';
import { Beneficiary, VerificationType } from '../types';
import VerificationStages, { ScanStage } from './VerificationStages';

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
  
  useEffect(() => {
      // Start the scan sequence automatically when component mounts
      const timer = setTimeout(() => {
          setScanStage('BIO_LOCK');
      }, 1500);
      return () => clearTimeout(timer);
  }, []);

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
      className="h-full flex flex-col relative p-6 md:p-0"
    >
      {/* Back Button Logic */}
      <div className="hidden md:flex mb-4 shrink-0">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gov-900 transition-colors">
              <ChevronLeft size={20} />
              <span className="text-sm font-medium">Back</span>
          </button>
      </div>

      {/* --- READER INTERFACE (Animation Stages) --- */}
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
    </motion.div>
  );
};

export default VerificationScreen;