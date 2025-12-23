import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, AlertTriangle, Check, Camera, Fingerprint, FileText, MapPin, User, Loader2, X, Cpu, Database, Search, UserX, Radar, Upload, ScanLine, ScanFace, ChevronLeft, FileSignature } from 'lucide-react';
import { Beneficiary } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import BiometricVerification from './BiometricVerification';
import VerificationStages, { ScanStage } from './VerificationStages';
import { OfflineManager } from '../utils/OfflineManager';
import AlertModal from './AlertModal';

export type WakilStep = 'LEGAL_DECLARATION' | 'VERIFY_WAKIL' | 'EVIDENCE' | 'PENSIONER_CONSENT' | 'CONTRACT';

interface WakilVerificationScreenProps {
  beneficiary: Beneficiary;
  onComplete: (wakilName: string) => void;
  onBack: () => void;
  onStepChange?: (step: WakilStep) => void;
  kampungId: string;
}

// Mock Wakils
const MOCK_WAKILS = [
  { name: 'Ahmad Bin Abdullah', ic: '850101-12-5543', address: 'No. 5, Jalan Kampung, 89500 Penampang, Sabah' },
  { name: 'Siti Binti Ali', ic: '900505-10-5122', address: 'Lot 12, Lorong Damai, 88450 Kota Kinabalu, Sabah' },
  { name: 'Tan Ah Meng', ic: '780202-07-5511', address: 'No. 88, Taman Ceria, 89000 Keningau, Sabah' },
  { name: 'Muthu A/L Sami', ic: '820303-08-5533', address: 'Batu 5, Jalan Tuaran, 88400 Kota Kinabalu, Sabah' }
];

const WakilVerificationScreen: React.FC<WakilVerificationScreenProps> = ({ beneficiary, onComplete, onBack, onStepChange, kampungId }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<WakilStep>('LEGAL_DECLARATION');
  const [showExitAlert, setShowExitAlert] = useState(false);

  useEffect(() => {
    if (onStepChange) {
      onStepChange(step);
    }
  }, [step, onStepChange]);
  
  // Legal Declaration State
  const [acceptedLiability, setAcceptedLiability] = useState(false);

  // Verify Wakil State
  const [wakilScanStage, setWakilScanStage] = useState<'ID_SELECT' | ScanStage | 'WAKIL_CONFIRMED'>('ID_SELECT');
  const [wakilData, setWakilData] = useState<{ name: string; ic: string; address: string } | null>(null);
  const [checkingLocation, setCheckingLocation] = useState(false);
  const [locationValid, setLocationValid] = useState(false);
  const [showWakilBioScanner, setShowWakilBioScanner] = useState(false);

  // Evidence State
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [consentStage, setConsentStage] = useState<'ID_SELECT' | 'INSERT_CARD' | 'JPN_CHECK' | 'JPN_FAIL' | 'BIO_LOCK' | 'BIO_SCANNING' | 'BIO_SUCCESS' | 'GPS_SCANNING' | 'GPS_SUCCESS' | 'READING_DATA'>('ID_SELECT');
  const [consentIcOptions, setConsentIcOptions] = useState<Beneficiary[]>([]);
  const [isSigning, setIsSigning] = useState(false);
  const [showConsentBioScanner, setShowConsentBioScanner] = useState(false);
  const [consentStarted, setConsentStarted] = useState(false);
  const [contractDetails, setContractDetails] = useState<{
      verificationId: string;
      contractId: string;
      warrantId: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  // Animation Controls
  const progressControls = useAnimation();
  
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

  // Control Signing Progress Animation
  useEffect(() => {
    if (consentStage === 'READING_DATA' || isSigning) {
        if (showExitAlert) {
            progressControls.stop();
        } else {
            progressControls.start({ 
                width: "100%",
                transition: { duration: 4, ease: "easeInOut" } 
            });
        }
    } else {
        progressControls.set({ width: "0%" });
    }
  }, [consentStage, isSigning, showExitAlert, progressControls]);

  const handleAcceptLiability = () => {
    if (acceptedLiability) {
      setStep('VERIFY_WAKIL');
    }
  };

  // --- WAKIL VERIFICATION FLOW ---
  const handleWakilSelect = (rep: { name: string; ic: string; address: string }) => {
    setWakilData(rep);
    setWakilScanStage('BIO_LOCK');
  };

  const handleWakilBioAuth = () => {
      setWakilScanStage('BIO_SCANNING');
      setTimeout(() => {
          handleWakilBioVerified();
      }, 2000);
  };

  const handleWakilBioVerified = () => {
      setShowWakilBioScanner(false);
      setWakilScanStage('BIO_SUCCESS');

      // Auto-advance to location check
      setTimeout(() => {
        setWakilScanStage('GPS_SCANNING');
        setCheckingLocation(true);
        
        setTimeout(() => {
          setCheckingLocation(false);
          setLocationValid(true);
          setWakilScanStage('GPS_SUCCESS');
          
          setTimeout(() => {
              setWakilScanStage('READING_DATA');
              setTimeout(() => {
                  setWakilScanStage('WAKIL_CONFIRMED');
              }, 2000);
          }, 1500);
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
    setTimeout(() => {
        handleConsentBioVerified();
    }, 2000);
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
               
               // Generate Contract Details
               const verId = OfflineManager.generateReferenceId(beneficiary.ic);
               const conId = `AUTH-${Date.now().toString().slice(-6)}-${Math.floor(Math.random()*1000)}`;
               const warId = `KWAP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000)}`;
               
               setContractDetails({
                   verificationId: verId,
                   contractId: conId,
                   warrantId: warId
               });

               setTimeout(() => {
                 setIsSigning(false);
                 setStep('CONTRACT');
                 
                 // Silent Save
                 if (wakilData) {
                     OfflineManager.addToQueue(
                         beneficiary,
                         kampungId,
                         'WAKIL_APPOINTMENT',
                         verId,
                         { name: wakilData.name, ic: wakilData.ic }
                     );
                 }
               }, 2000);
            }, 2000);
          }, 2000);
        }, 2500);
      }, 1500);
  };

  const handleCapturePhoto = () => {
    startCamera();
  };

  const executeBackNavigation = () => {
    setShowExitAlert(false);
    switch (step) {
        case 'CONTRACT':
            setStep('PENSIONER_CONSENT');
            break;
        case 'PENSIONER_CONSENT':
            setStep('EVIDENCE');
            break;
        case 'EVIDENCE':
            setStep('VERIFY_WAKIL');
            break;
        case 'VERIFY_WAKIL':
            setStep('LEGAL_DECLARATION');
            break;
        case 'LEGAL_DECLARATION':
            onBack();
            break;
        default:
            onBack();
    }
  };

  const handleSmartBack = () => {
    // Safety Intercept
    let isCritical = false;
    
    if (step === 'VERIFY_WAKIL') {
        if (['BIO_SCANNING', 'GPS_SCANNING', 'READING_DATA'].includes(wakilScanStage as string)) isCritical = true;
    } else if (step === 'PENSIONER_CONSENT') {
        if (['JPN_CHECK', 'BIO_SCANNING', 'GPS_SCANNING', 'READING_DATA'].includes(consentStage)) isCritical = true;
    }

    if (isCritical) {
        setShowExitAlert(true);
        return;
    }

    executeBackNavigation();
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4 shrink-0 px-6 pt-6">
        <button 
          onClick={handleSmartBack}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ChevronLeft size={20} />
          <span className="font-bold text-sm">Back</span>
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Wakil Appointment</h2>
          <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
            <Shield size={14} />
            <span>Authorized Wakil Mode</span>
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

          {/* STEP 2: VERIFY WAKIL */}
          {step === 'VERIFY_WAKIL' && (
            <motion.div
              key="verify_rep"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center justify-center min-h-full py-10 w-full"
            >
              {wakilScanStage === 'ID_SELECT' ? (
                <>
                  <div className="flex-1 flex flex-col items-center justify-center w-full">
                    <div className="mb-8 text-center">
                        <h3 className="text-2xl font-bold text-gov-900">Select Wakil</h3>
                        <p className="text-gray-500 text-sm mt-1">Select the Wakil's MyKad to scan</p>
                    </div>
                    <div className="w-full max-w-md px-4 space-y-3">
                        {MOCK_WAKILS.map((rep, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleWakilSelect(rep)}
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
                  </div>
                  
                  {/* Footer Progress Bar for Wakil Selection */}
                  <div className="w-full max-w-sm mx-auto px-8 pb-6 space-y-3 text-center shrink-0 mt-auto relative z-30">
                        <div className="flex justify-between text-xs font-bold text-gov-700 uppercase tracking-wider px-1">
                            <span>Select Wakil</span>
                            <span>Step 1</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 w-[10%]" />
                        </div>
                  </div>
                </>
              ) : wakilScanStage === 'WAKIL_CONFIRMED' ? (
                <div className="flex flex-col items-center justify-center w-full max-w-md px-6 animate-in fade-in zoom-in duration-300">
                    <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-purple-200 border-4 border-white">
                        <User size={48} className="text-purple-600" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gov-900 mb-2">Wakil Verified</h3>
                    <p className="text-gray-500 mb-8 text-center">Identity and location confirmed.</p>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full shadow-sm mb-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500" />
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                                <User size={32} className="text-gray-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Wakil</p>
                                <p className="font-bold text-lg text-gov-900">{wakilData?.name}</p>
                                <p className="font-mono text-sm text-gray-500">{wakilData?.ic}</p>
                                <div className="flex items-center gap-1 mt-1 text-gray-500">
                                    <MapPin size={12} />
                                    <p className="text-xs">{wakilData?.address}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                            <Check size={16} />
                            <span className="font-medium">Biometrics & Location Matched</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setStep('EVIDENCE')}
                        className="w-full py-4 rounded-xl font-bold text-white bg-purple-600 shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                    >
                        <span>Proceed to Evidence</span>
                        <ChevronLeft className="rotate-180" size={20} />
                    </button>
                </div>
              ) : (
                <VerificationStages 
                    stage={wakilScanStage as ScanStage} 
                    locationType="HOME"
                    onBioAuth={handleWakilBioAuth}
                    enableFaceScan={true}
                    stepLabel={
                        ['BIO_LOCK', 'BIO_SCANNING', 'BIO_SUCCESS'].includes(wakilScanStage) ? "Step 2" :
                        ['GPS_SCANNING', 'GPS_SUCCESS'].includes(wakilScanStage) ? "Step 3" : 
                        wakilScanStage === 'READING_DATA' ? "Secure" : undefined
                    }
                    customDecryptingText="Authenticating Identity Chip"
                />
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
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-gov-900 mb-2">Proof of Condition</h3>
                            <p className="text-gray-500">Capture photo of pensioner to verify condition</p>
                        </div>
                    
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

                    {/* Photo Preview */}
                    {photoCaptured && photoPreview && !isCameraActive && (
                         <div className="mb-8 relative w-full max-w-md flex flex-col items-center">
                             <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 mb-6">
                                <img src={photoPreview} alt="Evidence" className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => {
                                        setPhotoCaptured(false);
                                        setPhotoPreview(null);
                                    }}
                                    className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-sm z-10"
                                >
                                    <X size={20} />
                                </button>
                             </div>
                         </div>
                    )}

                    {/* Proceed Button */}
                    {!isCameraActive && (
                        <button
                            onClick={() => setStep('PENSIONER_CONSENT')}
                            disabled={!photoCaptured}
                            className={`w-full max-w-md py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                                photoCaptured 
                                ? 'bg-gov-900 text-white hover:bg-gov-800' 
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            Proceed to Pensioner Consent <Check size={18} />
                        </button>
                    )}
                 </div>
            </motion.div>
          )}

          {/* STEP 6: PENSIONER CONSENT */}
          {step === 'PENSIONER_CONSENT' && (
            <motion.div
              key="consent"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col min-h-full py-10"
            >
                 <div className="flex-1 flex flex-col items-center p-6">
                        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col">
                             {['ID_SELECT', 'JPN_CHECK', 'JPN_FAIL'].includes(consentStage) && (
                                <div className="mb-6 text-center shrink-0">
                                    <h3 className="text-xl font-bold text-gov-900">
                                        {consentStage === 'ID_SELECT' && "Pensioner Consent"}
                                        {consentStage === 'JPN_CHECK' && "Verifying Chip Data"}
                                        {consentStage === 'JPN_FAIL' && "ID Mismatch"}
                                    </h3>
                                </div>
                             )}

                             <div className="flex flex-col items-center flex-1 w-full justify-center">
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
                                     <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-20">
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

                                 {/* CONSENT: MAIN STAGES */}
                                 {['INSERT_CARD', 'BIO_LOCK', 'BIO_SCANNING', 'BIO_SUCCESS', 'GPS_SCANNING', 'GPS_SUCCESS'].includes(consentStage) && (
                                     <VerificationStages 
                                        stage={consentStage as ScanStage} 
                                        locationType="HOME"
                                        onBioAuth={handleConsentBioAuth}
                                        enableFaceScan={true}
                                        referenceImage={beneficiary.photoUrl}
                                        stepLabel={
                                            consentStage === 'INSERT_CARD' ? "Step 1" :
                                            ['BIO_LOCK', 'BIO_SCANNING', 'BIO_SUCCESS'].includes(consentStage) ? "Step 2" :
                                            ['GPS_SCANNING', 'GPS_SUCCESS'].includes(consentStage) ? "Step 3" : undefined
                                        }
                                        customDecryptingText="Verifying consent & generating contract..."
                                     />
                                 )}

                                 {/* CONSENT: SIGNING (READING_DATA) */}
                                 {consentStage === 'READING_DATA' && (
                                     <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mb-20">
                                         <motion.div 
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="relative z-10 w-32 h-32 bg-purple-50 rounded-full flex items-center justify-center shadow-xl border-4 border-purple-500"
                                         >
                                             <motion.div
                                                 animate={{ x: [0, 5, 0] }}
                                                 transition={{ duration: 2, repeat: Infinity }}
                                             >
                                                 <FileSignature size={48} className="text-purple-600" />
                                             </motion.div>
                                         </motion.div>
                                         <div className="absolute -bottom-16 left-0 right-0 text-center">
                                             <p className="text-xs font-bold text-purple-600 uppercase tracking-widest animate-pulse">
                                                 Digitally Signing Payment Warrant...
                                             </p>
                                         </div>
                                     </div>
                                 )}
                             </div>
                        </div>
                        
                        {/* Footer Progress Bar for JPN Stages */}
                        {(consentStage === 'ID_SELECT' || consentStage === 'JPN_CHECK' || consentStage === 'JPN_FAIL') && (
                            <div className="w-full max-w-sm mx-auto px-8 pb-6 space-y-3 text-center shrink-0 mt-auto relative z-30">
                                <div className="flex justify-between text-xs font-bold text-gov-700 uppercase tracking-wider px-1">
                                    <span>{consentStage === 'JPN_FAIL' ? "Failed" : consentStage === 'ID_SELECT' ? "Select ID" : "Verifying"}</span>
                                    <span>{consentStage === 'JPN_FAIL' ? "Error" : "Step 1"}</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div className={`h-full ${consentStage === 'JPN_FAIL' ? 'bg-red-500' : 'bg-blue-500 animate-pulse'} ${consentStage === 'ID_SELECT' ? 'w-[10%]' : 'w-[20%]'}`} />
                                </div>
                            </div>
                        )}

                        {/* Footer Progress Bar - Signing Phase */}
                        {(consentStage === 'READING_DATA' || isSigning) && (
                            <div className="w-full max-w-sm mx-auto px-8 pb-6 space-y-3 text-center shrink-0 mt-auto relative z-30">
                                <div className="flex justify-between text-xs font-bold text-gov-700 uppercase tracking-wider px-1">
                                    <span>Signing Warrant</span>
                                    <span>Secure</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: "0%" }}
                                        animate={progressControls}
                                        className="h-full bg-gov-900"
                                    />
                                </div>
                            </div>
                        )}
                 </div>
            </motion.div>
          )}

          {/* STEP 7: DIGITAL CONTRACT (SUCCESS) */}
          {step === 'CONTRACT' && wakilData && contractDetails && (
            <motion.div
              key="contract"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-full py-6 w-full px-4"
            >
              {/* KWAP WARRANT CARD - Horizontal Layout */}
              <div className="w-full max-w-3xl bg-white border-2 border-gov-900 rounded-2xl overflow-hidden shadow-2xl mb-8">
                  {/* Header */}
                  <div className="bg-gov-900 text-white p-4 relative overflow-hidden flex items-center justify-between">
                      <div className="absolute top-0 left-0 w-full h-full bg-white/5 pattern-grid-lg opacity-20"></div>
                      <div className="relative z-10">
                        <h2 className="text-xl font-black tracking-widest leading-none">KWAP PAYMENT WARRANT</h2>
                        <p className="text-[10px] font-medium text-gray-300 uppercase tracking-wider mt-1">Universal Cash Authorization</p>
                      </div>
                      <div className="relative z-10 flex flex-col items-end">
                          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 mb-1">
                            <Shield size={14} className="text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Retirement Fund (Inc)</span>
                          </div>
                          <p className="text-[10px] font-mono text-gray-400">{contractDetails.warrantId}</p>
                      </div>
                  </div>

                  <div className="flex flex-col md:flex-row">
                      {/* Left Side: Financial Details */}
                      <div className="flex-1 p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-center">
                          {/* Amount Hero */}
                          <div className="mb-6">
                              <p className="text-xs text-gray-400 uppercase font-bold mb-1">Authorized Amount</p>
                              <div className="text-5xl font-black text-green-600 tracking-tight">
                                  RM {beneficiary.monthlyPayout.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 gap-6 mb-6">
                              <div>
                                  <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Appointed Wakil</p>
                                  <p className="font-bold text-gray-900 leading-tight mb-0.5 text-base">{wakilData.name}</p>
                                  <p className="font-mono text-xs text-gray-500 mb-1">{wakilData.ic}</p>
                                  <p className="text-[10px] text-gray-400 leading-tight">{wakilData.address}</p>
                              </div>
                              <div>
                                  <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Beneficiary</p>
                                  <p className="font-bold text-gray-900 leading-tight mb-0.5 text-base">{beneficiary.name}</p>
                                  <p className="font-mono text-xs text-gray-500 mb-1">{beneficiary.ic}</p>
                                  <p className="text-[10px] text-gray-400 leading-tight">{beneficiary.address}</p>
                              </div>
                          </div>
                          
                           {/* Ref IDs */}
                          <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs text-gray-500 font-mono bg-gray-50 py-2 px-3 rounded-lg border border-gray-100 w-full">
                                  <Check size={12} className="text-green-500 shrink-0" />
                                  <span className="font-bold text-gray-400">POL ID:</span>
                                  <span className="text-gray-900">{contractDetails.verificationId}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 font-mono bg-blue-50 py-3 px-3 rounded-lg border border-blue-100 w-full">
                                  <FileSignature size={14} className="text-blue-600 shrink-0" />
                                  <span className="font-bold text-blue-400">CONTRACT REF:</span>
                                  <span className="text-blue-900 font-bold text-sm">{contractDetails.contractId}</span>
                              </div>
                          </div>
                      </div>

                      {/* Right Side: QR Code */}
                      <div className="p-6 md:p-8 flex flex-col items-center justify-center bg-gray-50/50 md:w-80 shrink-0 border-l border-gray-100">
                          <div className="bg-white p-3 rounded-xl border-2 border-gray-900 shadow-sm mb-4">
                              <QRCodeSVG 
                                value={JSON.stringify({
                                  type: "KWAP_WARRANT_V1",
                                  warrant_id: contractDetails.warrantId,
                                  pol_ref: contractDetails.verificationId,
                                  contract_ref: contractDetails.contractId,
                                  amount: beneficiary.monthlyPayout,
                                  currency: "MYR",
                                  beneficiary_ic: beneficiary.ic,
                                  wakil_ic: wakilData.ic,
                                  expiry: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
                                  signature: "dev_signed_hash_mock"
                                })}
                                size={160}
                                level="H"
                              />
                          </div>
                          <p className="text-[10px] text-center text-gray-500 max-w-[200px] leading-tight font-medium">
                              Scan at BSN, Maybank, CIMB, Pos Malaysia to release funds.
                          </p>
                      </div>
                  </div>

                  {/* Footer Validity */}
                  <div className="bg-amber-50 border-t border-amber-100 p-3 flex justify-between items-center px-6">
                      <span className="text-[10px] font-bold text-amber-800/60 uppercase tracking-wider hidden md:inline">Valid for 72 Hours</span>
                      <p className="text-xs font-bold text-amber-800 w-full md:w-auto text-center md:text-right">
                          Expires: {new Date(Date.now() + 72 * 60 * 60 * 1000).toLocaleString('en-MY', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                  </div>
              </div>

              <button
                onClick={() => onComplete(wakilData.name)}
                className="w-full max-w-md bg-gov-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-gov-800 transition-all"
              >
                Complete & Return to Dashboard
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Progress Bar Removed */}

      <AlertModal
        isOpen={showExitAlert}
        onClose={() => setShowExitAlert(false)}
        title="Transaction in Progress"
        message="Are you sure you want to cancel? All progress will be lost."
        type="warning"
        actionLabel="Yes, Exit"
        onAction={executeBackNavigation}
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default WakilVerificationScreen;
