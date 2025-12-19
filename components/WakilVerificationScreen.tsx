import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Check, Camera, Fingerprint, FileText, MapPin, User, Loader2, X, Cpu, Database, Search, UserX, Radar, Upload } from 'lucide-react';
import { Beneficiary } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export type WakilStep = 'LEGAL_DECLARATION' | 'VERIFY_REP' | 'EVIDENCE' | 'CONTRACT';

interface WakilVerificationScreenProps {
  beneficiary: Beneficiary;
  onComplete: (repName: string) => void;
  onBack: () => void;
  onStepChange?: (step: WakilStep) => void;
}

// Mock Reps
const MOCK_REPS = [
  { name: 'Ahmad Bin Abdullah', ic: '850101-12-5543' },
  { name: 'Siti Binti Ali', ic: '900505-10-5122' },
  { name: 'Tan Ah Meng', ic: '780202-07-5511' },
  { name: 'Muthu A/L Sami', ic: '820303-08-5533' }
];

const WakilVerificationScreen: React.FC<WakilVerificationScreenProps> = ({ beneficiary, onComplete, onBack, onStepChange }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<WakilStep>('LEGAL_DECLARATION');

  useEffect(() => {
    if (onStepChange) {
      onStepChange(step);
    }
  }, [step, onStepChange]);
  
  // Legal Declaration State
  const [acceptedLiability, setAcceptedLiability] = useState(false);

  // Verify Rep State
  const [repScanStage, setRepScanStage] = useState<'ID_SELECT' | 'INSERT_CARD' | 'READING_CHIP' | 'BIO_SCANNING' | 'BIO_SUCCESS' | 'LOCATION_CHECK' | 'LOCATION_SUCCESS'>('ID_SELECT');
  const [repData, setRepData] = useState<{ name: string; ic: string } | null>(null);
  const [checkingLocation, setCheckingLocation] = useState(false);
  const [locationValid, setLocationValid] = useState(false);

  // Evidence State
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [consentStage, setConsentStage] = useState<'ID_SELECT' | 'INSERT_CARD' | 'JPN_CHECK' | 'JPN_FAIL' | 'BIO_LOCK' | 'BIO_SCANNING' | 'BIO_SUCCESS' | 'GPS_SCANNING' | 'GPS_SUCCESS' | 'READING_DATA'>('ID_SELECT');
  const [consentIcOptions, setConsentIcOptions] = useState<Beneficiary[]>([]);
  const [isSigning, setIsSigning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        // In a real app, we would upload this file
        setPhotoCaptured(true);
    }
  };

  // Initialize Consent Options
  useEffect(() => {
    if (step === 'EVIDENCE') {
      // Mock beneficiaries for selection
      const options = [
        beneficiary,
        { ...beneficiary, name: 'Wong Ah Seng', ic: '550101-10-5522' },
        { ...beneficiary, name: 'Mariam Binti Abu', ic: '600202-08-6633' },
        { ...beneficiary, name: 'Ramasamy A/L Muthu', ic: '580303-07-7744' }
      ].sort(() => Math.random() - 0.5);
      setConsentIcOptions(options);
    }
  }, [step, beneficiary]);

  const handleAcceptLiability = () => {
    if (acceptedLiability) {
      setStep('VERIFY_REP');
    }
  };

  // --- REP VERIFICATION FLOW ---
  const handleRepSelect = (rep: { name: string; ic: string }) => {
    setRepData(rep);
    setRepScanStage('INSERT_CARD');
    
    // 1. Insert Card -> Reading Chip (No JPN Check)
    setTimeout(() => {
      setRepScanStage('READING_CHIP');
      setTimeout(() => {
        setRepScanStage('BIO_SCANNING');
        
        // 2. Bio Scan -> Success
        setTimeout(() => {
          setRepScanStage('BIO_SUCCESS');
        }, 2000);
      }, 2000);
    }, 1500);
  };

  const handleStartLocationCheck = () => {
    setRepScanStage('LOCATION_CHECK');
    setCheckingLocation(true);
    
    setTimeout(() => {
      setCheckingLocation(false);
      setLocationValid(true);
      setRepScanStage('LOCATION_SUCCESS');
    }, 2500);
  };

  // --- CONSENT FLOW (Full Identity Check) ---
  const handleConsentIdSelect = (selected: Beneficiary) => {
    setConsentStage('INSERT_CARD');

    setTimeout(() => {
      setConsentStage('JPN_CHECK');

      setTimeout(() => {
        if (selected.ic === beneficiary.ic) {
          setConsentStage('BIO_LOCK');
        } else {
          setConsentStage('JPN_FAIL');
          setTimeout(() => {
            setConsentStage('ID_SELECT');
          }, 3000);
        }
      }, 2500);
    }, 1500);
  };

  const handleConsentBioAuth = () => {
    setConsentStage('BIO_SCANNING');
    
    setTimeout(() => {
      setConsentStage('BIO_SUCCESS');
      
      setTimeout(() => {
        setConsentStage('GPS_SCANNING');
        
        setTimeout(() => {
          setConsentStage('GPS_SUCCESS');

          setTimeout(() => {
            setConsentStage('READING_DATA');
            
            setTimeout(() => {
               setIsSigning(true);
               setTimeout(() => {
                 setIsSigning(false);
                 setStep('CONTRACT');
               }, 2000);
            }, 2000);
          }, 2000);
        }, 2500);
      }, 1500);
    }, 1500);
  };

  const handleCapturePhoto = () => {
    setPhotoCaptured(true);
  };

  // Progress Calculation
  const getProgress = () => {
    if (step === 'LEGAL_DECLARATION') return 10;
    if (step === 'VERIFY_REP') {
      switch (repScanStage) {
        case 'ID_SELECT': return 20;
        case 'INSERT_CARD': return 30;
        case 'READING_CHIP': return 35;
        case 'BIO_SCANNING': return 40;
        case 'BIO_SUCCESS': return 45;
        case 'LOCATION_CHECK': return 50;
        case 'LOCATION_SUCCESS': return 55;
        default: return 20;
      }
    }
    if (step === 'EVIDENCE') {
      if (!photoCaptured) return 55;
      switch (consentStage) {
        case 'ID_SELECT': return 60;
        case 'INSERT_CARD': return 65;
        case 'JPN_CHECK': return 70;
        case 'JPN_FAIL': return 70;
        case 'BIO_LOCK': return 75;
        case 'BIO_SCANNING': return 80;
        case 'BIO_SUCCESS': return 85;
        case 'GPS_SCANNING': return 90;
        case 'GPS_SUCCESS': return 95;
        case 'READING_DATA': return 98;
        default: return 60;
      }
    }
    if (step === 'CONTRACT') return 100;
    return 0;
  };

  const progress = getProgress();

  return (
    <div className="h-full flex flex-col relative">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4 shrink-0 px-6 pt-6">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <X size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Wakil Appointment</h2>
          <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
            <Shield size={14} />
            <span>Authorized Representative Mode</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative px-6 no-scrollbar">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: LEGAL DECLARATION */}
          {step === 'LEGAL_DECLARATION' && (
            <motion.div
              key="legal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-50 border-2 border-red-100 rounded-2xl p-6 md:p-8 max-w-xl mx-auto mt-4"
            >
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-red-900 mb-2">Legal Declaration Required</h3>
                <p className="text-red-800/80 text-sm leading-relaxed">
                  "I (Ketua Kampung) certify resident is unfit to travel. False declaration is an offense under Section 18 of MACC Act 2009."
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-red-100 mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:border-red-500 checked:bg-red-500"
                      checked={acceptedLiability}
                      onChange={(e) => setAcceptedLiability(e.target.checked)}
                    />
                    <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-700 pt-0.5">
                    I accept full liability for this declaration and confirm the resident's condition.
                  </span>
                </label>
              </div>

              <button
                onClick={handleAcceptLiability}
                disabled={!acceptedLiability}
                className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${
                  acceptedLiability 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-700' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Proceed to Verification
              </button>
            </motion.div>
          )}

          {/* STEP 2: VERIFY REPRESENTATIVE */}
          {step === 'VERIFY_REP' && (
            <motion.div
              key="verify_rep"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center justify-center min-h-full py-10"
            >
              <div className="mb-8 text-center">
                 <h3 className="text-2xl font-bold text-gov-900">
                    {repScanStage === 'ID_SELECT' && "Select Representative"}
                    {repScanStage === 'INSERT_CARD' && "Secure Connection"}
                    {repScanStage === 'READING_CHIP' && "Reading MyKad Chip"}
                    {repScanStage === 'BIO_SCANNING' && "Verifying Representative"}
                    {repScanStage === 'BIO_SUCCESS' && "Representative Verified"}
                    {repScanStage === 'LOCATION_CHECK' && "Checking Geofence"}
                    {repScanStage === 'LOCATION_SUCCESS' && "Location Verified"}
                 </h3>
                 <p className="text-gray-500 text-sm mt-1">
                    {repScanStage === 'ID_SELECT' && "Select the representative's MyKad to scan"}
                    {repScanStage === 'INSERT_CARD' && "Establishing secure link with reader"}
                    {repScanStage === 'READING_CHIP' && "Accessing public data from chip"}
                    {repScanStage === 'BIO_SCANNING' && "Scanning representative's thumbprint"}
                    {repScanStage === 'BIO_SUCCESS' && "Identity confirmed via MyKad chip"}
                    {repScanStage === 'LOCATION_CHECK' && "Verifying proximity to pensioner's home"}
                    {repScanStage === 'LOCATION_SUCCESS' && "Inside authorized zone"}
                 </p>
              </div>

              {/* STAGE: ID SELECT */}
              {repScanStage === 'ID_SELECT' && (
                 <div className="w-full max-w-md px-4 space-y-3">
                      {MOCK_REPS.map((rep, idx) => (
                          <button
                              key={idx}
                              onClick={() => handleRepSelect(rep)}
                              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-purple-500 hover:bg-purple-50 transition-all group text-left bg-white shadow-sm"
                          >
                              <div className="w-12 h-8 bg-gradient-to-br from-purple-200 to-purple-300 rounded-md shadow-sm flex items-center justify-center shrink-0 relative overflow-hidden">
                                  <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full opacity-50"></div>
                              </div>
                              <div className="min-w-0">
                                  <span className="block font-bold text-sm text-gov-900 group-hover:text-purple-700 truncate">{rep.name}</span>
                                  <span className="block font-mono text-xs text-gray-500">{rep.ic}</span>
                              </div>
                          </button>
                      ))}
                  </div>
              )}

              {/* STAGE: INSERT CARD / READING CHIP */}
              {(repScanStage === 'INSERT_CARD' || repScanStage === 'READING_CHIP') && (
                 <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-10">
                    <div className="absolute bottom-0 w-56 h-20 bg-gov-900 rounded-t-xl z-20 shadow-2xl border-t border-gray-700 flex justify-center overflow-hidden">
                        <div className="w-full h-1 bg-black/50 mt-1 absolute top-0"></div>
                        <div className="absolute top-4 right-6 flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-900"></div>
                            <div className={`w-2 h-2 rounded-full ${repScanStage === 'READING_CHIP' ? 'bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]' : 'bg-green-900'}`}></div>
                        </div>
                        <div className="w-32 h-full border-l border-r border-white/5 bg-white/5 mx-auto skew-x-12"></div>
                    </div>
                    <motion.div 
                        className="absolute z-10 w-40 h-64 rounded-xl shadow-xl flex flex-col overflow-hidden"
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 80, opacity: 1 }}
                        transition={{ duration: 1.2, type: "spring", bounce: 0.15 }}
                    >
                        <div className="w-full h-full bg-gradient-to-br from-purple-700 via-purple-500 to-purple-300 relative border border-white/20">
                             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                             <div className="absolute top-12 left-1/2 -translate-x-1/2 w-10 h-8 bg-gradient-to-tr from-yellow-600 to-yellow-300 rounded-md border border-yellow-700 shadow-sm flex items-center justify-center">
                                 <Cpu size={20} className="text-yellow-900 opacity-60" />
                             </div>
                             <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-red-600/20 to-transparent"></div>
                        </div>
                    </motion.div>
                </div>
              )}

              {/* STAGE: BIO SCANNING */}
              {repScanStage === 'BIO_SCANNING' && (
                 <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-10">
                     <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                     >
                        <div className="absolute inset-0 rounded-full blur-xl bg-purple-500/40 animate-pulse"></div>
                        <div className="w-32 h-32 bg-white rounded-full border-4 border-purple-400 flex items-center justify-center shadow-2xl relative z-10 scale-105">
                            <Fingerprint size={64} className="text-purple-500 animate-pulse" />
                        </div>
                        <div className="absolute -bottom-16 left-0 right-0 text-center">
                            <p className="text-xs font-bold text-purple-500 animate-pulse uppercase tracking-widest">Scanning...</p>
                        </div>
                     </motion.div>
                 </div>
              )}

              {/* STAGE: BIO SUCCESS (WAITING FOR LOCATION) */}
              {repScanStage === 'BIO_SUCCESS' && (
                <div className="flex flex-col items-center gap-6 w-full max-w-md">
                    <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                        <motion.div 
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative z-10 w-32 h-32 bg-green-50 rounded-full flex items-center justify-center shadow-xl border-4 border-green-500"
                        >
                            <Fingerprint size={48} className="text-green-600" />
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="absolute -top-1 -right-1 text-white p-2 rounded-full border-4 border-white bg-green-500"
                            >
                                <Check size={24} strokeWidth={4} />
                            </motion.div>
                        </motion.div>
                    </div>
                    
                    <button
                        onClick={handleStartLocationCheck}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                        <MapPin size={20} />
                        Verify Location
                    </button>
                </div>
              )}

              {/* STAGE: LOCATION CHECK */}
              {repScanStage === 'LOCATION_CHECK' && (
                 <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-10">
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
                </div>
              )}

              {/* STAGE: LOCATION SUCCESS */}
              {repScanStage === 'LOCATION_SUCCESS' && repData && (
                 <div className="flex flex-col items-center gap-6 w-full max-w-md">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 w-full">
                        <div className="flex flex-col items-center mb-4">
                            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-3 relative">
                                <User size={40} className="text-purple-600" />
                                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full border-2 border-white">
                                    <Check size={12} strokeWidth={4} />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{repData.name}</h3>
                            <p className="text-sm text-gray-500 font-mono">{repData.ic}</p>
                            <div className="mt-2 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100 flex items-center gap-1">
                                <Shield size={12} />
                                Verified Representative
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                                <span className="text-gray-500 flex items-center gap-2">
                                    <Fingerprint size={14} /> Biometrics
                                </span>
                                <span className="text-green-600 font-bold flex items-center gap-1">
                                    <Check size={14} /> Verified
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                                <span className="text-gray-500 flex items-center gap-2">
                                    <MapPin size={14} /> Location
                                </span>
                                <span className="text-green-600 font-bold flex items-center gap-1">
                                    <Check size={14} /> Verified
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setStep('EVIDENCE')}
                        className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                    >
                        Proceed to Evidence <Check size={18} />
                    </button>
                 </div>
              )}

            </motion.div>
          )}

          {/* STEP 3: EVIDENCE & CONSENT */}
          {step === 'EVIDENCE' && (
            <motion.div
              key="evidence"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col min-h-full py-10"
            >
              {!photoCaptured ? (
                 <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <h3 className="text-2xl font-bold text-gov-900 mb-2">Proof of Condition</h3>
                    <p className="text-gray-500 mb-8 text-center">Capture photo of pensioner to verify condition</p>
                    
                    <button
                        onClick={handleCapturePhoto}
                        className="w-full max-w-md aspect-video bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 hover:border-purple-400 transition-all group mb-4"
                    >
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Camera className="text-gray-400 group-hover:text-purple-600" size={32} />
                        </div>
                        <p className="text-gray-500 font-medium">Tap to Capture Photo</p>
                    </button>

                    <div className="w-full max-w-md flex items-center gap-4">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <span className="text-xs text-gray-400 font-bold uppercase">Or</span>
                        <div className="h-px bg-gray-200 flex-1"></div>
                    </div>

                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileUpload}
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-4 w-full max-w-md py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                        <Upload size={18} />
                        Upload Photo
                    </button>
                 </div>
              ) : (
                 <div className="flex-1 flex flex-col items-center justify-center">
                     <div className="mb-8 text-center relative z-10 transition-all duration-300">
                        <h3 className="text-2xl font-bold text-gov-900">
                            {consentStage === 'ID_SELECT' && "Pensioner Consent"}
                            {consentStage === 'JPN_CHECK' && "Verifying ID Match"}
                            {consentStage === 'JPN_FAIL' && "ID Mismatch"}
                            {consentStage === 'INSERT_CARD' && "Secure Connection"}
                            {consentStage === 'BIO_LOCK' && "Identity Locked"}
                            {consentStage === 'BIO_SCANNING' && "Verifying Biometrics"}
                            {consentStage === 'BIO_SUCCESS' && "Consent Verified"}
                            {consentStage === 'GPS_SCANNING' && "Verifying Location"}
                            {consentStage === 'GPS_SUCCESS' && "Location Verified"}
                            {consentStage === 'READING_DATA' && "Signing Contract"}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                            {consentStage === 'ID_SELECT' && "Select Pensioner's MyKad to authorize"}
                            {consentStage === 'JPN_CHECK' && "Checking if ID matches Pensioner record"}
                            {consentStage === 'JPN_FAIL' && "Scanned ID does not match Pensioner"}
                            {consentStage === 'INSERT_CARD' && "Establishing secure link with reader"}
                            {consentStage === 'BIO_LOCK' && "Touch sensor to confirm consent"}
                            {consentStage === 'BIO_SCANNING' && "Scanning pensioner's thumbprint"}
                            {consentStage === 'BIO_SUCCESS' && "Biometric consent confirmed"}
                            {consentStage === 'GPS_SCANNING' && "Ensuring consent at registered address"}
                            {consentStage === 'GPS_SUCCESS' && "Location matches records"}
                            {consentStage === 'READING_DATA' && "Cryptographically signing appointment"}
                        </p>
                     </div>

                     {/* CONSENT: ID SELECT */}
                     {consentStage === 'ID_SELECT' && (
                         <div className="w-full max-w-md px-4 space-y-3">
                              {consentIcOptions.map((option, idx) => (
                                  <button
                                      key={idx}
                                      onClick={() => handleConsentIdSelect(option)}
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
                     )}

                     {/* CONSENT: JPN CHECK */}
                     {consentStage === 'JPN_CHECK' && (
                         <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-10">
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
                                     Verifying ID
                                 </div>
                             </div>
                         </div>
                     )}

                     {/* CONSENT: JPN FAIL */}
                     {consentStage === 'JPN_FAIL' && (
                         <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-10">
                             <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-40 h-40 bg-red-50 rounded-full flex items-center justify-center border-4 border-red-100"
                             >
                                 <X size={64} className="text-red-500" />
                             </motion.div>
                             <div className="absolute -bottom-10 left-0 right-0 text-center">
                                 <p className="text-red-600 font-bold">ID Mismatch</p>
                             </div>
                         </div>
                     )}

                     {/* CONSENT: INSERT CARD / READING DATA */}
                     {(consentStage === 'INSERT_CARD' || consentStage === 'READING_DATA') && (
                         <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-10">
                            <div className="absolute bottom-0 w-56 h-20 bg-gov-900 rounded-t-xl z-20 shadow-2xl border-t border-gray-700 flex justify-center overflow-hidden">
                                <div className="w-full h-1 bg-black/50 mt-1 absolute top-0"></div>
                                <div className="absolute top-4 right-6 flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-900"></div>
                                    <div className={`w-2 h-2 rounded-full ${consentStage === 'READING_DATA' ? 'bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]' : 'bg-green-900'}`}></div>
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
                                </div>
                            </motion.div>
                        </div>
                     )}

                     {/* CONSENT: BIO LOCK & SCANNING */}
                     {(consentStage === 'BIO_LOCK' || consentStage === 'BIO_SCANNING') && (
                         <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-10">
                             <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative"
                             >
                                <div className={`absolute inset-0 rounded-full blur-xl ${consentStage === 'BIO_SCANNING' ? 'bg-red-500/40 animate-pulse' : 'bg-red-500/20'}`}></div>
                                <button 
                                    onClick={consentStage === 'BIO_LOCK' ? handleConsentBioAuth : undefined}
                                    className={`w-32 h-32 bg-white rounded-full border-4 flex items-center justify-center shadow-2xl relative z-10 transition-all ${consentStage === 'BIO_SCANNING' ? 'border-red-400 scale-105' : 'border-red-100 active:scale-95'}`}
                                >
                                    <Fingerprint size={64} className={`text-red-500 ${consentStage === 'BIO_SCANNING' ? 'animate-pulse' : ''}`} />
                                </button>
                                <div className="absolute -bottom-16 left-0 right-0 text-center">
                                    <p className="text-xs font-bold text-red-500 animate-pulse uppercase tracking-widest">
                                        {consentStage === 'BIO_SCANNING' ? "Scanning..." : "Touch to Consent"}
                                    </p>
                                </div>
                             </motion.div>
                         </div>
                     )}

                     {/* CONSENT: BIO SUCCESS */}
                     {consentStage === 'BIO_SUCCESS' && (
                        <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-10">
                            <motion.div 
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative z-10 w-32 h-32 bg-green-50 rounded-full flex items-center justify-center shadow-xl border-4 border-green-500"
                            >
                                <Fingerprint size={48} className="text-green-600" />
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="absolute -top-1 -right-1 text-white p-2 rounded-full border-4 border-white bg-green-500"
                                >
                                    <Check size={24} strokeWidth={4} />
                                </motion.div>
                            </motion.div>
                        </div>
                     )}

                     {/* CONSENT: GPS SCANNING */}
                     {consentStage === 'GPS_SCANNING' && (
                        <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-10">
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
                        </div>
                     )}
                     
                     {/* CONSENT: GPS SUCCESS */}
                     {consentStage === 'GPS_SUCCESS' && (
                        <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-10">
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
                        </div>
                     )}

                 </div>
              )}
            </motion.div>
          )}

          {/* STEP 4: DIGITAL CONTRACT (SUCCESS) */}
          {step === 'CONTRACT' && repData && (
            <motion.div
              key="contract"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-full py-10"
            >
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-200">
                <FileText className="w-12 h-12 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Wakil Appointed!</h2>
              <p className="text-gray-500 mb-8">Digital authorization contract created.</p>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md shadow-sm mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500" />
                
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Representative</p>
                        <p className="font-bold text-lg">{repData.name}</p>
                        <p className="font-mono text-sm text-gray-500">{repData.ic}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">For Pensioner</p>
                        <p className="font-bold text-lg">{beneficiary.name}</p>
                        <p className="font-mono text-sm text-gray-500">{beneficiary.ic}</p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Validity</span>
                    <span className="font-bold text-gray-900">24 Hours</span>
                </div>
              </div>

              <button
                onClick={() => onComplete(repData.name)}
                className="w-full max-w-md bg-gov-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-gov-800 transition-all"
              >
                Complete & Return to Dashboard
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Progress Bar Footer */}
      <div className="w-full max-w-sm mx-auto px-8 pb-8 pt-4 space-y-3 text-center shrink-0 relative z-30 bg-white/80 backdrop-blur-sm">
            <div className="flex justify-between text-xs font-bold text-gov-700 uppercase tracking-wider px-1">
                <span>
                    {step === 'LEGAL_DECLARATION' ? "Declaration" :
                     step === 'VERIFY_REP' ? "Verify Rep" :
                     step === 'EVIDENCE' ? "Consent" : "Contract"}
                </span>
                <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className={`h-full ${step === 'CONTRACT' ? 'bg-green-500' : 'bg-purple-600'}`}
                />
            </div>
      </div>
    </div>
  );
};

export default WakilVerificationScreen;
