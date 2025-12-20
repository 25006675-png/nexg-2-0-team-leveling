import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Check, Camera, Fingerprint, FileText, MapPin, User, Loader2, X, Cpu, Database, Search, UserX, Radar, Upload, ScanLine, ScanFace } from 'lucide-react';
import { Beneficiary } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import BiometricVerification from './BiometricVerification';

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
  const [showRepBioScanner, setShowRepBioScanner] = useState(false);

  // Evidence State
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [consentStage, setConsentStage] = useState<'ID_SELECT' | 'INSERT_CARD' | 'JPN_CHECK' | 'JPN_FAIL' | 'BIO_LOCK' | 'BIO_SCANNING' | 'BIO_SUCCESS' | 'GPS_SCANNING' | 'GPS_SUCCESS' | 'READING_DATA'>('ID_SELECT');
  const [consentIcOptions, setConsentIcOptions] = useState<Beneficiary[]>([]);
  const [isSigning, setIsSigning] = useState(false);
  const [showConsentBioScanner, setShowConsentBioScanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  // Real Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
          ctx.drawImage(video, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg');
          setPhotoPreview(dataUrl);
          setPhotoCaptured(true);
          stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result as string);
            setPhotoCaptured(true);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setPhotoPreview(reader.result as string);
              setPhotoCaptured(true);
          };
          reader.readAsDataURL(file);
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
        setShowRepBioScanner(true);
      }, 2000);
    }, 1500);
  };

  const handleRepBioVerified = () => {
      setShowRepBioScanner(false);
      setRepScanStage('BIO_SUCCESS');

      // Auto-advance to location check
      setTimeout(() => {
        setRepScanStage('LOCATION_CHECK');
        setCheckingLocation(true);
        
        setTimeout(() => {
          setCheckingLocation(false);
          setLocationValid(true);
          setRepScanStage('LOCATION_SUCCESS');
        }, 2500);
      }, 1500);
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
    setShowConsentBioScanner(true);
  };

  const handleConsentBioVerified = () => {
      setShowConsentBioScanner(false);
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
  };

  const handleCapturePhoto = () => {
    startCamera();
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
                    {repScanStage === 'LOCATION_CHECK' && "Verifying Location"}
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

              {/* STAGE: BIO SCANNING (Using BiometricVerification Component) */}
              {repScanStage === 'BIO_SCANNING' && (
                 <div className="w-full h-full absolute inset-0 z-50 bg-white">
                     {showRepBioScanner && (
                         <BiometricVerification 
                            onVerified={handleRepBioVerified}
                            onCancel={() => {
                                setShowRepBioScanner(false);
                                setRepScanStage('ID_SELECT');
                            }}
                         />
                     )}
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
                            <ScanFace size={48} className="text-green-600" />
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
                    
                    <p className="text-gray-500 font-medium animate-pulse">Verifying Location...</p>
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
                                    <ScanFace size={14} /> Biometrics
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

              {/* Footer Progress Bar (Rep Verification) */}
              {repScanStage !== 'ID_SELECT' && repScanStage !== 'LOCATION_SUCCESS' && (
                <div className="w-full max-w-sm mx-auto px-8 pb-12 space-y-3 text-center shrink-0 mt-auto relative z-30">
                    <div className="flex justify-between text-xs font-bold text-gov-700 uppercase tracking-wider px-1">
                        <span>
                            {(repScanStage === 'BIO_SCANNING') ? "Waiting Input" : 
                             repScanStage === 'BIO_SUCCESS' ? "Authenticated" :
                             (repScanStage === 'LOCATION_CHECK') ? "Triangulating" : 
                             (repScanStage === 'LOCATION_SUCCESS') ? "Success" : "Accessing DB"}
                        </span>
                        <span>
                            {(repScanStage === 'BIO_SCANNING') ? "Locked" : 
                             repScanStage === 'BIO_SUCCESS' ? "Unlocked" :
                             (repScanStage === 'LOCATION_CHECK') ? "Searching" : 
                             (repScanStage === 'LOCATION_SUCCESS') ? "Matched" : "Secure"}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        {(repScanStage === 'INSERT_CARD' || repScanStage === 'READING_CHIP') && (
                            <motion.div 
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 3, ease: "circInOut" }}
                                className="h-full bg-gov-900"
                            />
                        )}
                        {(repScanStage === 'BIO_SCANNING') && (
                             <div className={`h-full bg-red-500 animate-pulse w-[40%]`} />
                        )}
                        {repScanStage === 'BIO_SUCCESS' && (
                             <div className="h-full bg-green-500 w-[50%]" />
                        )}
                         {(repScanStage === 'LOCATION_CHECK') && (
                             <div className="h-full bg-blue-500 w-[80%] animate-pulse" />
                        )}
                        {(repScanStage === 'LOCATION_SUCCESS') && (
                             <div className="h-full bg-green-500 w-full" />
                        )}
                    </div>
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
                 <div className="flex-1 flex flex-col items-center p-6">
                    <h3 className="text-2xl font-bold text-gov-900 mb-2">Proof of Condition</h3>
                    <p className="text-gray-500 mb-8 text-center">Capture photo of pensioner to verify condition</p>
                    
                    {/* Camera/Upload Buttons */}
                    {!isCameraActive && (
                        <div className="w-full max-w-md flex gap-4 mb-6">
                            <button
                                onClick={handleCapturePhoto}
                                className="flex-1 aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 hover:bg-white hover:border-purple-500 hover:shadow-md transition-all group"
                            >
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform border border-gray-100">
                                    <Camera className="text-gray-400 group-hover:text-purple-600" size={24} />
                                </div>
                                <p className="text-gray-500 font-bold text-xs group-hover:text-purple-600">Take Photo</p>
                            </button>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 hover:bg-white hover:border-purple-500 hover:shadow-md transition-all group"
                            >
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform border border-gray-100">
                                    <Upload className="text-gray-400 group-hover:text-purple-600" size={24} />
                                </div>
                                <p className="text-gray-500 font-bold text-xs group-hover:text-purple-600">Upload File</p>
                            </button>
                        </div>
                    )}

                    {/* Real Camera View */}
                    {isCameraActive && (
                        <div className="w-full max-w-md mb-6 relative rounded-xl overflow-hidden shadow-lg bg-black">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />
                            <canvas ref={canvasRef} className="hidden" />
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                                <button 
                                    onClick={stopCamera}
                                    className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                                >
                                    <X size={24} />
                                </button>
                                <button 
                                    onClick={capturePhoto}
                                    className="p-4 rounded-full bg-white border-4 border-gray-200 shadow-lg active:scale-95 transition-transform"
                                >
                                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                </button>
                            </div>
                        </div>
                    )}

                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileUpload}
                    />

                    {/* Photo Preview (Below Buttons) */}
                    {photoCaptured && photoPreview && !isCameraActive && (
                         <div className="mb-8 relative w-full max-w-md">
                             <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                                <img src={photoPreview} alt="Evidence" className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => {
                                        setPhotoCaptured(false);
                                        setPhotoPreview(null);
                                    }}
                                    className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 backdrop-blur-sm"
                                >
                                    <X size={14} />
                                </button>
                             </div>
                             <div className="flex items-center gap-2 mt-2 text-green-600 text-xs font-bold justify-center">
                                 <Check size={12} /> Photo Captured
                             </div>
                         </div>
                    )}

                    {/* Consent Flow (Appears after photo is captured) */}
                    {photoCaptured && !isCameraActive && (
                        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <div className="mb-6 text-center">
                                <h3 className="text-xl font-bold text-gov-900">
                                    {consentStage === 'ID_SELECT' && "Pensioner Consent"}
                                    {consentStage === 'JPN_CHECK' && "Verifying Chip Data"}
                                    {consentStage === 'JPN_FAIL' && "ID Mismatch"}
                                    {consentStage === 'INSERT_CARD' && "Secure Connection"}
                                    {consentStage === 'BIO_LOCK' && "Identity Locked"}
                                    {consentStage === 'BIO_SCANNING' && "Verifying Biometrics"}
                                    {consentStage === 'BIO_SUCCESS' && "Consent Verified"}
                                    {consentStage === 'GPS_SCANNING' && "Verifying Location"}
                                    {consentStage === 'GPS_SUCCESS' && "Location Verified"}
                                    {consentStage === 'READING_DATA' && "Signing Contract"}
                                </h3>
                             </div>

                             <div className="flex flex-col items-center">
                                 {/* CONSENT: ID SELECT */}
                                 {consentStage === 'ID_SELECT' && (
                                     <div className="w-full space-y-3">
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
                                             <Cpu size={48} className="text-blue-600 mb-2" />
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

                                 {/* CONSENT: INSERT CARD */}
                                 {consentStage === 'INSERT_CARD' && (
                                     <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-10">
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
                                            </div>
                                        </motion.div>
                                    </div>
                                 )}

                                 {/* CONSENT: READING DATA (Secure Chip Animation) */}
                                 {consentStage === 'READING_DATA' && (
                                     <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-10">
                                         <motion.div 
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                            className="absolute w-56 h-56 border border-dashed border-blue-300 rounded-full opacity-50"
                                         />
                                         <motion.div 
                                            animate={{ rotate: -360 }}
                                            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                                            className="absolute w-48 h-48 border border-dashed border-purple-300 rounded-full opacity-50"
                                         />
                                         
                                         <div className="relative z-10 w-32 h-40 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-2xl border-2 border-yellow-200 flex flex-col items-center justify-center overflow-hidden">
                                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
                                             <Cpu size={48} className="text-yellow-900 relative z-10" />
                                             <div className="mt-2 text-[10px] font-bold text-yellow-900 uppercase tracking-widest relative z-10">Secure Chip</div>
                                             
                                             {/* Scanning Line */}
                                             <motion.div 
                                                animate={{ top: ['0%', '100%', '0%'] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                className="absolute left-0 right-0 h-1 bg-white/50 shadow-[0_0_10px_rgba(255,255,255,0.8)] z-20"
                                             />
                                         </div>

                                         <div className="absolute -bottom-12 flex flex-col items-center gap-2">
                                             <div className="flex gap-1">
                                                 <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-2 h-2 bg-blue-500 rounded-full" />
                                                 <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-blue-500 rounded-full" />
                                                 <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-blue-500 rounded-full" />
                                             </div>
                                             <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Decrypting Data</span>
                                         </div>
                                     </div>
                                 )}

                                 {/* CONSENT: BIO LOCK & SCANNING */}
                                 {consentStage === 'BIO_LOCK' && (
                                     <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-10">
                                         <motion.div 
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="relative"
                                         />
                                            <div className="absolute inset-0 rounded-full blur-xl bg-red-500/20"></div>
                                            <button 
                                                onClick={handleConsentBioAuth}
                                                className="w-32 h-32 bg-white rounded-full border-4 flex items-center justify-center shadow-2xl relative z-10 transition-all border-red-100 active:scale-95"
                                            >
                                                <Fingerprint size={64} className="text-red-500" />
                                            </button>
                                            <div className="absolute -bottom-16 left-0 right-0 text-center">
                                                <p className="text-xs font-bold text-red-500 animate-pulse uppercase tracking-widest">
                                                    Touch to Consent
                                                </p>
                                            </div>
                                     </div>
                                 )}

                                 {consentStage === 'BIO_SCANNING' && (
                                     <div className="w-full h-full absolute inset-0 z-50 bg-white">
                                         {showConsentBioScanner && (
                                             <BiometricVerification 
                                                onVerified={handleConsentBioVerified}
                                                onCancel={() => {
                                                    setShowConsentBioScanner(false);
                                                    setConsentStage('BIO_LOCK');
                                                }}
                                             />
                                         )}
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

                             {/* Footer Progress Bar (Consent Flow) */}
                             {consentStage !== 'ID_SELECT' && consentStage !== 'READING_DATA' && (
                                <div className="w-full max-w-sm mx-auto px-8 pb-12 space-y-3 text-center shrink-0 mt-auto relative z-30">
                                    <div className="flex justify-between text-xs font-bold text-gov-700 uppercase tracking-wider px-1">
                                        <span>
                                            {(consentStage === 'BIO_SCANNING' || consentStage === 'BIO_LOCK') ? "Waiting Input" : 
                                             consentStage === 'BIO_SUCCESS' ? "Authenticated" :
                                             (consentStage === 'GPS_SCANNING') ? "Triangulating" : 
                                             (consentStage === 'GPS_SUCCESS') ? "Success" : "Accessing DB"}
                                        </span>
                                        <span>
                                            {(consentStage === 'BIO_SCANNING' || consentStage === 'BIO_LOCK') ? "Locked" : 
                                             consentStage === 'BIO_SUCCESS' ? "Unlocked" :
                                             (consentStage === 'GPS_SCANNING') ? "Searching" : 
                                             (consentStage === 'GPS_SUCCESS') ? "Matched" : "Secure"}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                        {(consentStage === 'INSERT_CARD' || consentStage === 'JPN_CHECK') && (
                                            <motion.div 
                                                initial={{ width: "0%" }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 3, ease: "circInOut" }}
                                                className="h-full bg-gov-900"
                                            />
                                        )}
                                        {(consentStage === 'BIO_LOCK' || consentStage === 'BIO_SCANNING') && (
                                             <div className={`h-full bg-red-500 animate-pulse ${consentStage === 'BIO_SCANNING' ? 'w-[40%]' : 'w-[20%]'}`} />
                                        )}
                                        {consentStage === 'BIO_SUCCESS' && (
                                             <div className="h-full bg-green-500 w-[50%]" />
                                        )}
                                         {(consentStage === 'GPS_SCANNING') && (
                                             <div className="h-full bg-blue-500 w-[80%] animate-pulse" />
                                        )}
                                        {(consentStage === 'GPS_SUCCESS') && (
                                             <div className="h-full bg-green-500 w-full" />
                                        )}
                                    </div>
                                </div>
                             )}
                        </div>
                    )}
                 </div>
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

      {/* Progress Bar Removed */}
    </div>
  );
};

export default WakilVerificationScreen;
