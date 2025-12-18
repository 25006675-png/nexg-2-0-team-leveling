import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ChevronLeft, Check, Fingerprint, MapPin, AlertCircle, UserX, Home, AlertTriangle, ScanLine, Radar, Building2, Users, CreditCard, X, Database, Search } from 'lucide-react';
import { Beneficiary, VerificationType } from '../types';
import { OfflineManager } from '../utils/OfflineManager';
import { useLanguage } from '../contexts/LanguageContext';

interface VerificationScreenProps {
  onScanComplete: (type: VerificationType) => void;
  beneficiary: Beneficiary;
  beneficiaries: Beneficiary[]; // Add this
  onBack: () => void;
}

type ScanStage = 'PRE_SCAN' | 'ID_SELECT' | 'JPN_CHECK' | 'JPN_FAIL' | 'INSERT_CARD' | 'BIO_LOCK' | 'BIO_SCANNING' | 'BIO_SUCCESS' | 'BIO_FAILED' | 'GPS_SCANNING' | 'GPS_SUCCESS' | 'READING_DATA';
type ExceptionReason = 'DECEASED' | 'NOT_AT_HOME' | 'DAMAGED_ID' | null;

const VerificationScreen: React.FC<VerificationScreenProps> = ({ onScanComplete, beneficiary, beneficiaries, onBack }) => {
  const { t } = useLanguage();
  const [scanStage, setScanStage] = useState<ScanStage>('PRE_SCAN');
  const [showExceptionMenu, setShowExceptionMenu] = useState(false);
  const [verificationLocation, setVerificationLocation] = useState<VerificationType | null>(null);
  
  // ID Selection State
  const [icOptions, setIcOptions] = useState<Beneficiary[]>([]);
  const [selectedIcBeneficiary, setSelectedIcBeneficiary] = useState<Beneficiary | null>(null);

  // --- NAVIGATION & FLOW ---

  const handleModeSelect = (type: VerificationType) => {
    setVerificationLocation(type);
    
    // Prepare ID options
    const others = beneficiaries.filter(b => b.ic !== beneficiary.ic);
    const shuffledOthers = others.sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [beneficiary, ...shuffledOthers].sort(() => Math.random() - 0.5);
    setIcOptions(options);

    setScanStage('ID_SELECT');
  };

  const handleIdSelect = (selected: Beneficiary) => {
      setSelectedIcBeneficiary(selected);
      
      // 1. Start with Card Insertion (Secure Connection)
      setScanStage('INSERT_CARD');

      // 2. Then JPN Database Check
      setTimeout(() => {
          setScanStage('JPN_CHECK');

          // 3. Result
          setTimeout(() => {
              if (selected.ic === beneficiary.ic) {
                  // Success -> Bio Lock
                  setScanStage('BIO_LOCK');
              } else {
                  // Fail
                  setScanStage('JPN_FAIL');
                  setTimeout(() => {
                      setScanStage('ID_SELECT');
                      setSelectedIcBeneficiary(null);
                  }, 3000);
              }
          }, 2500); // Duration of JPN Check
      }, 1500); // Duration of Insert Card
  };

  const handleBiometricAuth = () => {
      setScanStage('BIO_SCANNING');
      
      // Animation 2: Scanning -> Success or Fail
      setTimeout(() => {
          // Since we already validated the ID in JPN_CHECK, this is now just a formality/simulation of "Success"
          // unless we want to simulate biometric failure for some reason.
          // For now, assume if ID is correct, Biometric is correct (or we could add a random fail chance).
          // The user said "unsuccessful if I use wrong ID", which we handled in JPN_CHECK.
          // So here we can assume success.
          
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

  const handleException = (reason: ExceptionReason) => {
     if (reason === 'DECEASED' || reason === 'DAMAGED_ID') {
         // Defaulting to HOME for exceptions if needed, or handle as specific exception type
         onScanComplete('HOME'); 
     } else if (reason === 'NOT_AT_HOME') {
         onBack();
     }
     setShowExceptionMenu(false);
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
              <span className="text-sm font-medium">{t.common.back}</span>
          </button>
      </div>

      {/* --- PRE-SCAN INTERFACE: MODE SELECTION --- */}
      {scanStage === 'PRE_SCAN' && (
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
                           {/* MODE A: COMMUNITY HALL */}
                           <button 
                             onClick={() => handleModeSelect('HALL')}
                             className="relative w-full p-4 bg-white border-2 border-blue-100 rounded-xl hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all text-left group overflow-hidden"
                           >
                               <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                   <Building2 size={64} className="text-blue-900" />
                               </div>
                               <div className="flex items-start gap-3 relative z-10">
                                   <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                                       <Users size={20} />
                                   </div>
                                   <div>
                                       <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5 block">{t.verification.modeA}</span>
                                       <h3 className="font-bold text-gov-900 text-lg leading-tight">{t.verification.communityHall}</h3>
                                       <p className="text-xs text-gray-500 mt-1 leading-snug">{t.verification.hallDesc}</p>
                                   </div>
                               </div>
                           </button>

                           {/* MODE B: HOME VISIT */}
                           <button 
                             onClick={() => handleModeSelect('HOME')}
                             className="relative w-full p-4 bg-white border-2 border-orange-100 rounded-xl hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10 transition-all text-left group overflow-hidden"
                           >
                               <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                   <Home size={64} className="text-orange-900" />
                               </div>
                               <div className="flex items-start gap-3 relative z-10">
                                   <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors shrink-0">
                                       <Home size={20} />
                                   </div>
                                   <div>
                                       <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-0.5 block">{t.verification.modeB}</span>
                                       <h3 className="font-bold text-gov-900 text-lg leading-tight">{t.verification.homeVisit}</h3>
                                       <p className="text-xs text-gray-500 mt-1 leading-snug">{t.verification.homeDesc}</p>
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
                                            <button onClick={() => handleException('DECEASED')} className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-700 rounded-lg flex items-center gap-3 transition-colors">
                                                <UserX size={16} />
                                                <span className="text-xs font-bold">{t.verification.deceased}</span>
                                            </button>
                                            <button onClick={() => handleException('NOT_AT_HOME')} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700 rounded-lg flex items-center gap-3 transition-colors">
                                                <Home size={16} />
                                                <span className="text-xs font-medium">{t.verification.notAtHome}</span>
                                            </button>
                                            <button onClick={() => handleException('DAMAGED_ID')} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700 rounded-lg flex items-center gap-3 transition-colors">
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
      )}

      {/* --- READER INTERFACE (Animation Stages) --- */}
      {scanStage !== 'PRE_SCAN' && (
         <div className="flex-1 flex flex-col bg-white md:bg-transparent h-full relative">
             <div className="flex-1 flex flex-col items-center justify-center w-full">
                 
                 <div className="mb-12 text-center relative z-10 transition-all duration-300">
                    <h3 className="text-2xl font-bold text-gov-900">
                        {scanStage === 'ID_SELECT' && t.verification.title}
                        {scanStage === 'JPN_CHECK' && t.verification.jpnCheck}
                        {scanStage === 'JPN_FAIL' && t.verification.verificationFailed}
                        {scanStage === 'INSERT_CARD' && t.verification.secureConnection}
                        {scanStage === 'BIO_LOCK' && t.verification.identityLocked}
                        {scanStage === 'BIO_SCANNING' && t.verification.verifyingBiometrics}
                        {scanStage === 'BIO_SUCCESS' && t.verification.identityConfirmed}
                        {scanStage === 'BIO_FAILED' && t.verification.identityMismatch}
                        {scanStage === 'GPS_SCANNING' && t.verification.verifyingLocation}
                        {scanStage === 'GPS_SUCCESS' && t.verification.locationVerified}
                        {scanStage === 'READING_DATA' && t.verification.verifyingIdentity}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                        {scanStage === 'ID_SELECT' && t.verification.selectIdDesc}
                        {scanStage === 'JPN_CHECK' && t.verification.jpnCheckDesc}
                        {scanStage === 'JPN_FAIL' && t.verification.jpnFailDesc}
                        {scanStage === 'INSERT_CARD' && t.verification.insertCardDesc}
                        {scanStage === 'BIO_LOCK' && t.verification.bioLockDesc}
                        {scanStage === 'BIO_SCANNING' && t.verification.bioScanningDesc}
                        {scanStage === 'BIO_SUCCESS' && t.verification.bioSuccessDesc}
                        {scanStage === 'BIO_FAILED' && t.verification.bioFailedDesc}
                        {scanStage === 'GPS_SCANNING' && t.verification.gpsScanningDesc}
                        {scanStage === 'GPS_SUCCESS' && t.verification.gpsSuccessDesc}
                        {scanStage === 'READING_DATA' && t.verification.readingDataDesc}
                    </p>
                 </div>

                 {/* STAGE 0: ID SELECTION */}
                 {scanStage === 'ID_SELECT' && (
                     <div className="w-full max-w-md px-4">
                         <div className="space-y-3">
                              {icOptions.map((option, idx) => (
                                  <button
                                      key={idx}
                                      onClick={() => handleIdSelect(option)}
                                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all group text-left bg-white shadow-sm"
                                  >
                                      <div className="w-12 h-8 bg-gradient-to-br from-blue-200 to-blue-300 rounded-md shadow-sm flex items-center justify-center shrink-0 relative overflow-hidden">
                                          <div className="absolute top-2 left-2 w-2 h-2 bg-yellow-300 rounded-full opacity-50"></div>
                                      </div>
                                      <div className="min-w-0">
                                          <span className="block font-bold text-sm text-gov-900 group-hover:text-blue-700 truncate">{option.name}</span>
                                          <span className="block font-mono text-xs text-gray-500">{option.ic}</span>
                                      </div>
                                  </button>
                              ))}
                          </div>
                     </div>
                 )}

                 {/* STAGE 0.5: JPN CHECK */}
                 {scanStage === 'JPN_CHECK' && (
                     <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-20">
                         <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute w-48 h-48 border-4 border-blue-100 border-t-blue-500 rounded-full"
                         />
                         <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            className="absolute w-32 h-32 border-4 border-blue-50 border-t-blue-300 rounded-full"
                         />
                         <div className="relative z-10 bg-white p-6 rounded-2xl shadow-xl border border-blue-100 flex flex-col items-center">
                             <Database size={48} className="text-blue-600 mb-2" />
                             <div className="flex items-center gap-2 text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-full">
                                 <Search size={12} className="animate-spin" />
                                 {t.verification.jpnLink}
                             </div>
                         </div>
                     </div>
                 )}

                 {/* STAGE 0.6: JPN FAIL */}
                 {scanStage === 'JPN_FAIL' && (
                     <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-20">
                         <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-40 h-40 bg-red-50 rounded-full flex items-center justify-center border-4 border-red-100"
                         >
                             <X size={64} className="text-red-500" />
                         </motion.div>
                         <div className="absolute -bottom-10 left-0 right-0 text-center">
                             <p className="text-red-600 font-bold">{t.verification.idMismatch}</p>
                         </div>
                     </div>
                 )}

                 {/* STAGE 1 & 5: CARD READER / DATA */}
                 {(scanStage === 'INSERT_CARD' || scanStage === 'READING_DATA') && (
                     <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-20">
                        <div className="absolute bottom-0 w-56 h-20 bg-gov-900 rounded-t-xl z-20 shadow-2xl border-t border-gray-700 flex justify-center overflow-hidden">
                            <div className="w-full h-1 bg-black/50 mt-1 absolute top-0"></div>
                            <div className="absolute top-4 right-6 flex gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-900"></div>
                                <div className={`w-2 h-2 rounded-full ${scanStage === 'READING_DATA' ? 'bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]' : 'bg-green-900'}`}></div>
                            </div>
                            <div className="w-32 h-full border-l border-r border-white/5 bg-white/5 mx-auto skew-x-12"></div>
                        </div>
                        <motion.div 
                            className="absolute z-10 w-40 h-64 rounded-xl shadow-xl flex flex-col overflow-hidden"
                            initial={{ y: -100, opacity: 0 }}
                            animate={{ y: 80, opacity: 1 }}
                            transition={{ duration: 1.2, type: "spring", bounce: 0.15 }}
                        >
                            <div className="w-full h-full bg-gradient-to-br from-blue-700 via-blue-500 to-blue-300 relative border border-white/20">
                                 <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                 <div className="absolute top-12 left-1/2 -translate-x-1/2 w-10 h-8 bg-gradient-to-tr from-yellow-600 to-yellow-300 rounded-md border border-yellow-700 shadow-sm flex items-center justify-center">
                                     <Cpu size={20} className="text-yellow-900 opacity-60" />
                                 </div>
                                 <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-red-600/20 to-transparent"></div>
                                 <div className="absolute top-4 right-4 opacity-50">
                                     <div className="w-6 h-6 rounded-full border-2 border-white/50"></div>
                                 </div>
                            </div>
                        </motion.div>
                    </div>
                 )}

                 {/* STAGE 2: BIOMETRIC LOCK & SCANNING */}
                 {(scanStage === 'BIO_LOCK' || scanStage === 'BIO_SCANNING') && (
                     <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-20">
                         <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative"
                         >
                            <div className={`absolute inset-0 rounded-full blur-xl ${scanStage === 'BIO_SCANNING' ? 'bg-red-500/40 animate-pulse' : 'bg-red-500/20'}`}></div>
                            <button 
                                onClick={scanStage === 'BIO_LOCK' ? handleBiometricAuth : undefined}
                                className={`w-32 h-32 bg-white rounded-full border-4 flex items-center justify-center shadow-2xl relative z-10 transition-all ${scanStage === 'BIO_SCANNING' ? 'border-red-400 scale-105' : 'border-red-100 active:scale-95'}`}
                            >
                                <Fingerprint size={64} className={`text-red-500 ${scanStage === 'BIO_SCANNING' ? 'animate-pulse' : ''}`} />
                            </button>
                            <div className="absolute -bottom-16 left-0 right-0 text-center">
                                <p className="text-xs font-bold text-red-500 animate-pulse uppercase tracking-widest">
                                    {scanStage === 'BIO_SCANNING' ? t.verification.verifying : t.verification.touchToUnlock}
                                </p>
                            </div>
                         </motion.div>
                     </div>
                 )}

                 {/* STAGE 2.5: BIO SUCCESS OR FAIL */}
                 {(scanStage === 'BIO_SUCCESS' || scanStage === 'BIO_FAILED') && (
                    <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-20">
                        <motion.div 
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center shadow-xl border-4 ${scanStage === 'BIO_SUCCESS' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}
                        >
                            <Fingerprint size={48} className={scanStage === 'BIO_SUCCESS' ? 'text-green-600' : 'text-red-600'} />
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className={`absolute -top-1 -right-1 text-white p-2 rounded-full border-4 border-white ${scanStage === 'BIO_SUCCESS' ? 'bg-green-500' : 'bg-red-500'}`}
                            >
                                {scanStage === 'BIO_SUCCESS' ? <Check size={24} strokeWidth={4} /> : <UserX size={24} strokeWidth={4} />}
                            </motion.div>
                        </motion.div>
                        <div className="absolute -bottom-16 left-0 right-0 text-center">
                             <p className={`text-xs font-bold uppercase tracking-widest ${scanStage === 'BIO_SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>
                                 {scanStage === 'BIO_SUCCESS' ? t.verification.identityVerified : t.verification.identityMismatch}
                             </p>
                             <p className={`text-[10px] font-mono mt-1 ${scanStage === 'BIO_SUCCESS' ? 'text-green-600/70' : 'text-red-600/70'}`}>
                                 {scanStage === 'BIO_SUCCESS' ? t.verification.matchSuccess : t.verification.matchFail}
                             </p>
                         </div>
                    </div>
                 )}

                 {/* STAGE 4: LOCATION SCANNING */}
                 {scanStage === 'GPS_SCANNING' && (
                    <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-20">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div 
                                animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute w-full h-full border border-blue-500 rounded-full"
                            />
                             <motion.div 
                                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                                className="absolute w-3/4 h-3/4 border border-blue-500 rounded-full"
                            />
                        </div>
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="relative z-10 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-blue-100"
                        >
                            <Radar size={48} className="text-blue-600 animate-spin-slow" />
                        </motion.div>
                         <div className="absolute -bottom-16 left-0 right-0 text-center">
                             <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                                 {verificationLocation === 'HALL' ? t.verification.checkingCenter : t.verification.checkingResidence}
                             </p>
                         </div>
                    </div>
                 )}
                 
                 {/* STAGE 5: GPS SUCCESS */}
                 {scanStage === 'GPS_SUCCESS' && (
                    <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-20">
                        <motion.div 
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative z-10 w-32 h-32 bg-green-50 rounded-full flex items-center justify-center shadow-xl border-4 border-green-500"
                        >
                            <MapPin size={48} className="text-green-600" />
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="absolute -top-1 -right-1 bg-green-500 text-white p-2 rounded-full border-4 border-white"
                            >
                                <Check size={24} strokeWidth={4} />
                            </motion.div>
                        </motion.div>
                        <div className="absolute -bottom-16 left-0 right-0 text-center">
                             <p className="text-xs font-bold text-green-600 uppercase tracking-widest">{t.verification.locationMatched}</p>
                             <p className="text-[10px] text-green-600/70 font-mono mt-1">lat: 3.1415, long: 101.6869</p>
                         </div>
                    </div>
                 )}
            </div>

            <div className="w-full max-w-sm mx-auto px-8 pb-12 space-y-3 text-center shrink-0 mt-auto relative z-30">
                <div className="flex justify-between text-xs font-bold text-gov-700 uppercase tracking-wider px-1">
                    <span>
                        {scanStage === 'ID_SELECT' ? t.verification.selectId :
                         scanStage === 'INSERT_CARD' ? t.verification.readingChip :
                         scanStage === 'JPN_CHECK' ? t.verification.verifyingId :
                         scanStage === 'JPN_FAIL' ? t.verification.failed :
                         scanStage === 'BIO_LOCK' || scanStage === 'BIO_SCANNING' ? t.verification.waitingInput : 
                         scanStage === 'BIO_SUCCESS' ? t.verification.authenticated :
                         scanStage === 'GPS_SCANNING' ? t.verification.triangulating : 
                         scanStage === 'GPS_SUCCESS' ? t.verification.success : t.verification.accessingJpn}
                    </span>
                    <span>
                        {scanStage === 'ID_SELECT' ? t.verification.step1 :
                         scanStage === 'INSERT_CARD' ? t.verification.step2 :
                         scanStage === 'JPN_CHECK' ? t.verification.step2 :
                         scanStage === 'JPN_FAIL' ? t.verification.error :
                         scanStage === 'BIO_LOCK' || scanStage === 'BIO_SCANNING' ? t.verification.step3 : 
                         scanStage === 'BIO_SUCCESS' ? t.verification.step3 :
                         scanStage === 'GPS_SCANNING' ? t.verification.step4 : 
                         scanStage === 'GPS_SUCCESS' ? t.verification.step4 : t.verification.complete}
                    </span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    {scanStage === 'READING_DATA' && (
                        <motion.div 
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 3, ease: "circInOut" }}
                            className="h-full bg-gov-900"
                        />
                    )}
                    {scanStage === 'ID_SELECT' && (
                         <div className="h-full bg-blue-500 w-[10%]" />
                    )}
                    {scanStage === 'INSERT_CARD' && (
                         <div className="h-full bg-blue-500 w-[15%]" />
                    )}
                    {scanStage === 'JPN_CHECK' && (
                         <div className="h-full bg-blue-500 w-[20%] animate-pulse" />
                    )}
                    {scanStage === 'JPN_FAIL' && (
                         <div className="h-full bg-red-500 w-[20%]" />
                    )}
                    {(scanStage === 'BIO_LOCK' || scanStage === 'BIO_SCANNING') && (
                         <div className={`h-full bg-red-500 animate-pulse ${scanStage === 'BIO_SCANNING' ? 'w-[40%]' : 'w-[30%]'}`} />
                    )}
                    {scanStage === 'BIO_SUCCESS' && (
                         <div className="h-full bg-green-500 w-[50%]" />
                    )}
                     {scanStage === 'GPS_SCANNING' && (
                         <div className="h-full bg-blue-500 w-[80%] animate-pulse" />
                    )}
                    {scanStage === 'GPS_SUCCESS' && (
                         <div className="h-full bg-green-500 w-full" />
                    )}
                </div>
            </div>
         </div>
      )}
    </motion.div>
  );
};

export default VerificationScreen;