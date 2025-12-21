import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Fingerprint, Check, Radar, MapPin, ScanFace, Lock, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import BiometricVerification from './BiometricVerification';

export type ScanStage = 'PRE_SCAN' | 'INSERT_CARD' | 'BIO_LOCK' | 'BIO_SCANNING' | 'BIO_SUCCESS' | 'GPS_SCANNING' | 'GPS_SUCCESS' | 'READING_DATA';

export type BioMode = 'FINGERPRINT' | 'FACE';

interface VerificationStagesProps {
  stage: ScanStage;
  locationType?: 'HALL' | 'HOME' | null;
  onBioAuth?: () => void;
  enableFaceScan?: boolean;
  referenceImage?: string;
  stepLabel?: string;
  customDecryptingText?: string;
}

const VerificationStages: React.FC<VerificationStagesProps> = ({ stage, locationType, onBioAuth, enableFaceScan = false, referenceImage, stepLabel, customDecryptingText }) => {
  const { t } = useLanguage();
  const [bioMode, setBioMode] = useState<BioMode>('FINGERPRINT');

  return (
    <div className="flex-1 flex flex-col bg-white md:bg-transparent h-full relative w-full">
        <div className="flex-1 flex flex-col items-center justify-center w-full">
            
            <div className="mb-12 text-center relative z-10 transition-all duration-300">
            <h3 className="text-2xl font-bold text-gov-900">
                {stage === 'INSERT_CARD' && t.verification.secureConnection}
                {stage === 'BIO_LOCK' && t.verification.identityLocked}
                {stage === 'BIO_SCANNING' && t.verification.verifyingBiometrics}
                {stage === 'BIO_SUCCESS' && t.verification.identityConfirmed}
                {stage === 'GPS_SCANNING' && t.verification.verifyingLocation}
                {stage === 'GPS_SUCCESS' && t.verification.locationVerified}
                {stage === 'READING_DATA' && t.verification.verifyingIdentity}
            </h3>
            <p className="text-gray-500 text-sm mt-1">
                {stage === 'INSERT_CARD' && t.verification.establishingLink}
                {stage === 'BIO_LOCK' && t.verification.bioRequired}
                {stage === 'BIO_SCANNING' && t.verification.scanningThumb}
                {stage === 'BIO_SUCCESS' && t.verification.bioMatched}
                {stage === 'GPS_SCANNING' && t.verification.validatingAgent.replace('{location}', locationType === 'HALL' ? t.verification.communityHall : t.verification.homeVisit)}
                {stage === 'GPS_SUCCESS' && t.verification.locCheckPassed}
                {stage === 'READING_DATA' && (customDecryptingText || t.verification.decrypting)}
            </p>
            </div>

            {/* STAGE 1: CARD READER */}
            {stage === 'INSERT_CARD' && (
                <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-40">
                <div className="absolute bottom-0 w-56 h-20 bg-gov-900 rounded-t-xl z-20 shadow-2xl border-t border-gray-700 flex justify-center overflow-hidden">
                    <div className="w-full h-1 bg-black/50 mt-1 absolute top-0"></div>
                    <div className="absolute top-4 right-6 flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-900"></div>
                        <div className="w-2 h-2 rounded-full bg-green-900"></div>
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
            {(stage === 'BIO_LOCK' || stage === 'BIO_SCANNING') && (
                bioMode === 'FACE' ? (
                    <div className="w-full max-w-md h-96 mb-10 relative z-20 flex items-center justify-center">
                         <BiometricVerification 
                            initialMode="FACE"
                            onVerified={onBioAuth || (() => {})}
                            onCancel={() => setBioMode('FINGERPRINT')}
                            referenceImage={referenceImage}
                         />
                    </div>
                ) : (
                <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-36">
                    <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative"
                    >
                    <div className={`absolute inset-0 rounded-full blur-xl ${stage === 'BIO_SCANNING' ? 'bg-red-500/40 animate-pulse' : 'bg-red-500/20'}`}></div>
                    <button 
                        onClick={stage === 'BIO_LOCK' ? onBioAuth : undefined}
                        className={`w-32 h-32 bg-white rounded-full border-4 flex items-center justify-center shadow-2xl relative z-10 transition-all ${stage === 'BIO_SCANNING' ? 'border-red-400 scale-105' : 'border-red-100 active:scale-95'}`}
                    >
                        <Fingerprint size={64} className={`text-red-500 ${stage === 'BIO_SCANNING' ? 'animate-pulse' : ''}`} />
                    </button>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-6 text-center flex flex-col items-center gap-3 w-64">
                        <p className={`text-xs font-bold text-red-500 ${stage === 'BIO_SCANNING' ? 'animate-pulse uppercase tracking-widest' : 'text-center leading-relaxed'}`}>
                            {stage === 'BIO_SCANNING' ? t.verification.verifying : t.verification.bioInstruction}
                        </p>
                        
                        {enableFaceScan && stage === 'BIO_LOCK' && (
                            <button 
                                onClick={() => setBioMode('FACE')}
                                className="text-sm font-semibold text-gov-700 hover:text-gov-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-full transition-all flex items-center gap-2 mt-4 shadow-sm"
                            >
                                <ScanFace size={18} />
                                {t.verification.useFaceVerification}
                            </button>
                        )}
                    </div>
                    </motion.div>
                </div>
                )
            )}

            {/* STAGE 2.5: BIO SUCCESS */}
            {stage === 'BIO_SUCCESS' && (
            <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-20">
                <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 w-32 h-32 bg-green-50 rounded-full flex items-center justify-center shadow-xl border-4 border-green-500"
                >
                    {bioMode === 'FINGERPRINT' ? (
                        <Fingerprint size={48} className="text-green-600" />
                    ) : (
                        <ScanFace size={48} className="text-green-600" />
                    )}
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
                        <p className="text-xs font-bold text-green-600 uppercase tracking-widest">{t.verification.identityVerified}</p>
                        <p className="text-[10px] text-green-600/70 font-mono mt-1">{t.verification.match}: 99.9%</p>
                    </div>
            </div>
            )}

            {/* STAGE 4: LOCATION SCANNING */}
            {stage === 'GPS_SCANNING' && (
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
                            {locationType === 'HALL' ? t.verification.checkingCenter : t.verification.checkingResidence}
                        </p>
                    </div>
            </div>
            )}
            
            {/* STAGE 5: GPS SUCCESS */}
            {stage === 'GPS_SUCCESS' && (
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

            {/* STAGE 6: READING DATA - SECURE UNLOCK */}
            {stage === 'READING_DATA' && (
                <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-20">
                    <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative z-10 w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center shadow-xl border-4 border-blue-500"
                    >
                        <motion.div
                            initial={{ scale: 1 }}
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <ShieldCheck size={48} className="text-blue-600" />
                        </motion.div>
                        
                        <motion.div 
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-t-4 border-blue-300 rounded-full"
                        />
                    </motion.div>
                    <div className="absolute -bottom-16 left-0 right-0 text-center">
                         <p className="text-xs font-bold text-blue-600 uppercase tracking-widest animate-pulse">
                             {customDecryptingText || t.verification.decrypting}
                         </p>
                         <p className="text-[10px] text-blue-600/70 font-mono mt-1">
                             {t.verification.secure}
                         </p>
                     </div>
                </div>
            )}
        </div>

        <div className="w-full max-w-sm mx-auto px-8 pb-6 space-y-3 text-center shrink-0 mt-auto relative z-30">
            <div className="flex justify-between text-xs font-bold text-gov-700 uppercase tracking-wider px-1">
                <span>
                    {stage === 'BIO_LOCK' ? t.verification.waitingInput : 
                        stage === 'BIO_SCANNING' ? "Scanning" :
                        stage === 'BIO_SUCCESS' ? t.verification.authenticated :
                        stage === 'GPS_SCANNING' ? t.verification.triangulating : 
                        stage === 'GPS_SUCCESS' ? t.verification.success : t.verification.accessingDb}
                </span>
                <span>
                    {stepLabel || (stage === 'BIO_LOCK' || stage === 'BIO_SCANNING' ? t.verification.locked : 
                        stage === 'BIO_SUCCESS' ? t.verification.unlocked :
                        stage === 'GPS_SCANNING' ? t.verification.searching : 
                        stage === 'GPS_SUCCESS' ? t.verification.matched : t.verification.secure)}
                </span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                {stage === 'INSERT_CARD' && (
                    <div className="h-full bg-blue-500 w-[15%]" />
                )}
                {stage === 'READING_DATA' && (
                    <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, ease: "circInOut" }}
                        className="h-full bg-gov-900"
                    />
                )}
                {stage === 'BIO_LOCK' && (
                        <div className="h-full bg-red-500 animate-pulse w-[20%]" />
                )}
                {stage === 'BIO_SCANNING' && (
                        <div className="h-full bg-red-500 animate-pulse w-[40%]" />
                )}
                {stage === 'BIO_SUCCESS' && (
                        <div className="h-full bg-green-500 w-[50%]" />
                )}
                    {stage === 'GPS_SCANNING' && (
                        <div className="h-full bg-blue-500 w-[80%] animate-pulse" />
                )}
                {stage === 'GPS_SUCCESS' && (
                        <div className="h-full bg-green-500 w-full" />
                )}
            </div>
        </div>
    </div>
  );
};

export default VerificationStages;
