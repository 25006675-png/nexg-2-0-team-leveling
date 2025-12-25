import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, AlertTriangle, Check, Camera, Fingerprint, MapPin, User, X, Upload, ScanFace, ChevronLeft, FileSignature, CreditCard } from 'lucide-react';
import { Beneficiary } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import VerificationStages, { ScanStage } from './VerificationStages';
import { OfflineManager } from '../utils/OfflineManager';
import AlertModal from './AlertModal';
import { encryptPayload } from '../services/SecurityService';

export type WakilStep = 'RUNNER_PLEDGE' | 'OWNER_MANDATE' | 'WITNESS' | 'WARRANT';

interface WakilVerificationScreenProps {
  beneficiary: Beneficiary;
  onComplete: (wakilData: { name: string; ic: string }) => void;
  onBack: () => void;
  onStepChange?: (step: WakilStep) => void;
  kampungId: string;
  isOffline?: boolean;
}

// Mock Wakils
const MOCK_WAKILS = [
  { name: 'Ahmad Bin Abdullah', ic: '850101-12-5543', address: 'No. 5, Jalan Kampung, 89500 Penampang, Sabah', photoUrl: '/mock-photos/wakil1.png' },
  { name: 'Siti Binti Ali', ic: '900505-10-5122', address: 'Lot 12, Lorong Damai, 88450 Kota Kinabalu, Sabah', photoUrl: '/mock-photos/Malay Aunty1.png' },
  { name: 'Tan Ah Meng', ic: '780202-07-5511', address: 'No. 88, Taman Ceria, 89000 Keningau, Sabah', photoUrl: '/mock-photos/Chinese Uncle1.png' },
  { name: 'Muthu A/L Sami', ic: '820303-08-5533', address: 'Batu 5, Jalan Tuaran, 88400 Kota Kinabalu, Sabah', photoUrl: '/mock-photos/Indian Uncle1.png' }
];

// Helper Component for Text Cycling
const TextCycler = () => {
    const [index, setIndex] = useState(0);
    const texts = [
        "Encrypting Signatures...",
        "Generating Hash Block...",
        "Issuing Official Warrant..."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % texts.length);
        }, 1200);
        return () => clearInterval(interval);
    }, []);

    return (
        <AnimatePresence mode="wait">
            <motion.p
                key={index}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-gray-500 font-mono absolute w-full"
            >
                {texts[index]}
            </motion.p>
        </AnimatePresence>
    );
};

const WakilVerificationScreen: React.FC<WakilVerificationScreenProps> = ({ beneficiary, onComplete, onBack, onStepChange, kampungId, isOffline }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<WakilStep>('RUNNER_PLEDGE');
  const [showExitAlert, setShowExitAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    if (onStepChange) {
      onStepChange(step);
    }
  }, [step, onStepChange]);

  // --- STEP 1: WAKIL'S PLEDGE STATE ---
  const [selectedWakil, setSelectedWakil] = useState<{ name: string; ic: string; address: string; photoUrl: string } | null>(null);
  const [acceptedLiability, setAcceptedLiability] = useState(false);
  const [runnerScanStage, setRunnerScanStage] = useState<ScanStage | 'ID_SELECT'>('ID_SELECT');

  // --- STEP 2: PENSIONER'S MANDATE STATE ---
  const [pensionerConsent, setPensionerConsent] = useState(false);
  const [ownerScanStage, setOwnerScanStage] = useState<ScanStage | 'PRE_CHECK' | 'ID_VERIFY'>('ID_VERIFY');

  // --- STEP 3: WITNESS STATE ---
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [witnessCertify, setWitnessCertify] = useState(false);
  const [witnessScanStage, setWitnessScanStage] = useState<ScanStage | 'EVIDENCE' | 'DECLARATION'>('EVIDENCE');
  
  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STEP 4: WARRANT STATE ---
  const [isGeneratingWarrant, setIsGeneratingWarrant] = useState(false);
  const [contractDetails, setContractDetails] = useState<{
      verificationId: string;
      contractId: string;
      warrantId: string;
      encryptedQr: string;
  } | null>(null);

  // --- HANDLERS ---

  // Step 1: Wakil's Pledge
  const handleRunnerCardRead = () => {
    // Start the card insertion flow
    setRunnerScanStage('INSERT_CARD');
    
    setTimeout(() => {
        setRunnerScanStage('READING_DATA');
        setTimeout(() => {
            setSelectedWakil(MOCK_WAKILS[0]);
            setRunnerScanStage('ID_SELECT'); // Back to UI view with selectedWakil populated
        }, 2000);
    }, 2500);
  };

  const handleRunnerBioStart = () => {
    setRunnerScanStage('BIO_LOCK');
  };

  const handleRunnerBioProcess = () => {
    setRunnerScanStage('BIO_SCANNING');
    setTimeout(() => {
      setRunnerScanStage('BIO_SUCCESS');
    }, 2000);
  };

  // Step 2: Pensioner's Mandate
  const handleOwnerCardRead = () => {
    setOwnerScanStage('INSERT_CARD');
    setTimeout(() => {
        setOwnerScanStage('READING_DATA');
        setTimeout(() => {
            setOwnerScanStage('PRE_CHECK');
        }, 2000);
    }, 2500);
  };

  const handleOwnerBioStart = () => {
    setOwnerScanStage('BIO_LOCK');
  };

  const handleOwnerBioProcess = () => {
    setOwnerScanStage('BIO_SCANNING');
    setTimeout(() => {
      setOwnerScanStage('BIO_SUCCESS');
    }, 2000);
  };

  // Step 3: Witness
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

  const handleWitnessSealStart = () => {
    setWitnessScanStage('BIO_LOCK');
  };

  const handlePhotoConfirm = () => {
      setWitnessScanStage('DECLARATION');
  };

  const handleWitnessBioProcess = () => {
    setWitnessScanStage('BIO_SCANNING');
    setTimeout(() => {
      setWitnessScanStage('BIO_SUCCESS');
      
      // Generate Contract Details
      const verId = OfflineManager.generateReferenceId(beneficiary.ic);
      const conId = `AUTH-${Date.now().toString().slice(-6)}-${Math.floor(Math.random()*1000)}`;
      const warId = `KWAP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000)}`;
      
      // Encrypt Payload
      const payload = {
          verId, conId, warId, 
          beneficiary: beneficiary.ic,
          wakil: selectedWakil?.ic,
          timestamp: new Date().toISOString()
      };
      const encryptedQr = encryptPayload(payload);

      setContractDetails({
          verificationId: verId,
          contractId: conId,
          warrantId: warId,
          encryptedQr
      });

      // Silent Save (Offline)
      const isOfflineMode = isOffline !== undefined ? isOffline : !navigator.onLine;
      if (isOfflineMode && selectedWakil) {
          OfflineManager.addToQueue(
              beneficiary,
              kampungId,
              'WAKIL_APPOINTMENT',
              verId,
              { 
                  encryptedData: encryptedQr,
                  wakilName: selectedWakil.name,
                  wakilIc: selectedWakil.ic
              }
          );
      }

      // Removed auto-transition to allow manual "Finalize" click which triggers animation
    }, 2000);
  };

  // Navigation
  const handleSmartBack = () => {
    // STEP 1: WAKIL'S PLEDGE
    if (step === 'RUNNER_PLEDGE') {
        // Checkpoint: Start of Step 1
        if (runnerScanStage === 'ID_SELECT' && !selectedWakil) {
            setAlertConfig({
                isOpen: true,
                title: "Exit Verification?",
                message: "Are you sure you want to exit? All progress will be lost.",
                onConfirm: () => {
                    setAlertConfig(prev => ({ ...prev, isOpen: false }));
                    onBack();
                }
            });
        } 
        // In Progress: Step 1
        else {
            setAlertConfig({
                isOpen: true,
                title: "Reset Step 1?",
                message: "Terminate current process? You will return to the start of the Wakil's Pledge.",
                onConfirm: () => {
                    setAlertConfig(prev => ({ ...prev, isOpen: false }));
                    setRunnerScanStage('ID_SELECT');
                    setSelectedWakil(null);
                    setAcceptedLiability(false);
                }
            });
        }
    }
    // STEP 2: PENSIONER'S MANDATE
    else if (step === 'OWNER_MANDATE') {
        // Checkpoint: Start of Step 2
        if (ownerScanStage === 'ID_VERIFY') {
            setAlertConfig({
                isOpen: true,
                title: "Return to Step 1?",
                message: "Are you sure? You will need to redo the Wakil's Pledge.",
                onConfirm: () => {
                    setAlertConfig(prev => ({ ...prev, isOpen: false }));
                    setStep('RUNNER_PLEDGE');
                    setRunnerScanStage('ID_SELECT');
                    setSelectedWakil(null);
                    setAcceptedLiability(false);
                }
            });
        }
        // In Progress: Step 2
        else {
            setAlertConfig({
                isOpen: true,
                title: "Reset Step 2?",
                message: "Terminate current process? You will return to the start of the Pensioner's Mandate.",
                onConfirm: () => {
                    setAlertConfig(prev => ({ ...prev, isOpen: false }));
                    setOwnerScanStage('ID_VERIFY');
                    setPensionerConsent(false);
                }
            });
        }
    }
    // STEP 3: WITNESS
    else if (step === 'WITNESS') {
        // Checkpoint: Start of Step 3
        if (witnessScanStage === 'EVIDENCE') {
            setAlertConfig({
                isOpen: true,
                title: "Return to Step 2?",
                message: "Are you sure? You will need to redo the Pensioner's Mandate.",
                onConfirm: () => {
                    setAlertConfig(prev => ({ ...prev, isOpen: false }));
                    setStep('OWNER_MANDATE');
                    setOwnerScanStage('ID_VERIFY');
                    setPensionerConsent(false);
                }
            });
        }
        // In Progress: Step 3
        else {
            setAlertConfig({
                isOpen: true,
                title: "Reset Step 3?",
                message: "Terminate current process? You will return to the start of the Witness Seal.",
                onConfirm: () => {
                    setAlertConfig(prev => ({ ...prev, isOpen: false }));
                    setWitnessScanStage('EVIDENCE');
                    setPhotoCaptured(false);
                    setWitnessCertify(false);
                }
            });
        }
    }
    // STEP 4: WARRANT
    else if (step === 'WARRANT') {
        // Back button disabled in Step 4
        return;
    }
  };

  return (
    <div className="h-full flex flex-col relative bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4 shrink-0 px-6 pt-2">
        <button 
          onClick={handleSmartBack}
          disabled={step === 'WARRANT'}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors shadow-sm ${step === 'WARRANT' ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          <ChevronLeft size={20} />
          <span className="font-bold text-sm">Back</span>
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">Wakil Withdrawal</h2>
          <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
            <Shield size={14} />
            <span>Authorize a representative for a one-time withdrawal.</span>
          </div>
        </div>
        {/* Spacer for alignment with global indicator */}
        <div className="w-24 hidden md:block"></div>
      </div>

      <div className="flex-1 overflow-y-auto relative px-6 no-scrollbar pb-10">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: THE WAKIL'S PLEDGE */}
          {step === 'RUNNER_PLEDGE' && (
            <motion.div
              key="wakil"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center w-full max-w-xl mx-auto"
            >
              {runnerScanStage === 'ID_SELECT' ? (
                <>
                  {!selectedWakil ? (
                    <div className="w-full">
                        <div className="mb-6 text-center">
                            <h3 className="text-2xl font-bold text-gov-900">Step 1: The Wakil's Declaration</h3>
                            <p className="text-gray-500 text-sm mt-1">Verify Wakil Identity</p>
                        </div>
                        
                        {/* MANDATORY AGENT REQUIREMENTS CHECKLIST */}
                        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-6">
                            <h4 className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-3">MANDATORY WAKIL REQUIREMENTS</h4>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-sm text-purple-900">
                                    <div className="w-4 h-4 rounded-full bg-purple-200 flex items-center justify-center shrink-0">
                                        <Check size={10} className="text-purple-700" strokeWidth={3} />
                                    </div>
                                    <span>Malaysian Citizen (Warganegara)</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-purple-900">
                                    <div className="w-4 h-4 rounded-full bg-purple-200 flex items-center justify-center shrink-0">
                                        <Check size={10} className="text-purple-700" strokeWidth={3} />
                                    </div>
                                    <span>Age 21 Years & Above (Legal Adult)</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-purple-900">
                                    <div className="w-4 h-4 rounded-full bg-purple-200 flex items-center justify-center shrink-0">
                                        <Check size={10} className="text-purple-700" strokeWidth={3} />
                                    </div>
                                    <span>Valid MyKad (Chip Readable)</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col items-center justify-center py-10 space-y-6 bg-white rounded-2xl shadow-sm border border-gray-200">
                            <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center animate-pulse">
                                <CreditCard size={48} className="text-purple-600" />
                            </div>
                            <div className="text-center px-6">
                                <h4 className="font-bold text-gray-800 mb-2">Verify Wakil Identity</h4>
                                <p className="text-sm text-gray-500">Please insert the Wakil's MyKad to verify identity before proceeding with the pledge.</p>
                            </div>
                            <button 
                                onClick={handleRunnerCardRead}
                                className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-all flex items-center gap-2"
                            >
                                <CreditCard size={20} />
                                <span>Read MyKad</span>
                            </button>
                        </div>
                    </div>
                  ) : (
                    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-purple-100 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm flex items-center justify-center">
                                    {selectedWakil.photoUrl ? (
                                        <img src={selectedWakil.photoUrl} alt={selectedWakil.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={32} className="text-purple-600" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Selected Wakil</p>
                                    <p className="font-bold text-lg text-gov-900">{selectedWakil.name}</p>
                                    <p className="font-mono text-sm text-gray-500">{selectedWakil.ic}</p>
                                </div>
                            </div>
                            
                            {/* RED WARNING BOX */}
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="text-red-600 shrink-0 mt-1" size={20} />
                                    <div>
                                        <h4 className="font-bold text-red-900 text-sm mb-1">Declaration of Liability</h4>
                                        <p className="text-xs text-red-800 leading-relaxed">
                                            I, <span className="font-bold">{selectedWakil.name}</span>, accept full legal responsibility as the authorized representative for the one-month pension fund of <span className="font-bold">RM {beneficiary.monthlyPayout.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span> belonging to <span className="font-bold">{beneficiary.name}</span> under <span className="font-bold">Section 409 (Criminal Breach of Trust)</span>. Misappropriation carries a mandatory jail term.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className="relative flex items-center mt-0.5">
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
                                <span className="text-sm font-medium text-slate-700">
                                    I Accept Liability & Understand the Consequences
                                </span>
                            </label>

                            <p className="text-xs text-gray-600 mt-3 px-2 leading-snug text-justify font-medium">
                                By executing the biometric verification below, I hereby affix my unique biological identity to this digital instrument, acknowledging it carries the same legal validity as a wet signature under the <span className="font-bold">Digital Signature Act 1997</span>.
                            </p>
                        </div>

                        <button
                            onClick={handleRunnerBioStart}
                            disabled={!acceptedLiability}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                                acceptedLiability 
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-200' 
                                : 'bg-gray-300 cursor-not-allowed'
                            }`}
                        >
                            <Fingerprint size={20} />
                            <span>Execute Wakil's Declaration</span>
                        </button>
                    </div>
                  )}
                </>
              ) : (
                <VerificationStages 
                    stage={runnerScanStage as ScanStage} 
                    locationType="HOME"
                    onBioAuth={handleRunnerBioProcess}
                    enableFaceScan={true}
                    referenceImage={selectedWakil?.photoUrl}
                    stepLabel="Step 1: Wakil's Pledge"
                    customDecryptingText="Reading MyKad Chip..."
                    customBioLockHeader="Liability Acceptance"
                    customBioLockSubtext="Biometric verification serves as your binding acceptance of the Declaration of Liability."
                    customBioInstruction="Place thumb on scanner to stamp your signature."
                    customFaceButtonText="Sign with Face ID"
                    customStatusLabel="Pending Execution"
                    customSuccessHeader="Declaration Executed"
                    customSuccessSubtext="Your biometric signature has been legally bound to the Declaration of Liability."
                    customSuccessStatus="Liability Active"
                    onContinue={() => setStep('OWNER_MANDATE')}
                    continueLabel="Proceed to Pensioner's Mandate"
                    customBioScanningHeader="Authenticating MyKad Identity..."
                    customBioScanningSubtext="Verifying chip data to legally excecute the Declaration of Liability."
                    customBioScanningStatus="Authenticating Identity..."
                />
              )}
            </motion.div>
          )}

          {/* STEP 2: THE PENSIONER'S MANDATE */}
          {step === 'OWNER_MANDATE' && (
            <motion.div
              key="pensioner"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center w-full max-w-xl mx-auto"
            >
              {ownerScanStage === 'PRE_CHECK' || ownerScanStage === 'ID_VERIFY' ? (
                <div className="w-full">
                    <div className="mb-6 text-center">
                        <h3 className="text-2xl font-bold text-gov-900">Step 2: The Pensioner's Mandate</h3>
                        <p className="text-gray-500 text-sm mt-1">Pensioner's Mandate</p>
                    </div>

                    {ownerScanStage === 'ID_VERIFY' ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-6 bg-white rounded-2xl shadow-sm border border-gray-200">
                            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
                                <CreditCard size={48} className="text-blue-600" />
                            </div>
                            <div className="text-center px-6">
                                <h4 className="font-bold text-gray-800 mb-2">Verify Pensioner Identity</h4>
                                <p className="text-sm text-gray-500">Please insert the Pensioner's MyKad to verify identity before proceeding with the mandate.</p>
                            </div>
                            <button 
                                onClick={handleOwnerCardRead}
                                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                            >
                                <CreditCard size={20} />
                                <span>Read MyKad</span>
                            </button>
                        </div>
                    ) : (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm">
                                {beneficiary.photoUrl ? (
                                    <img src={beneficiary.photoUrl} alt={beneficiary.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={32} className="text-blue-600 m-auto mt-4" />
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Pensioner</p>
                                <p className="font-bold text-lg text-gov-900">{beneficiary.name}</p>
                                <p className="font-mono text-sm text-gray-500">{beneficiary.ic}</p>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <Shield className="text-blue-600 shrink-0 mt-1" size={20} />
                                <div>
                                    <h4 className="font-bold text-blue-900 text-sm mb-1">PENSION WITHDRAWAL MANDATE</h4>
                                    <div className="text-xs text-blue-800 leading-relaxed space-y-2">
                                        <p>
                                            I, <span className="font-bold">{beneficiary.name}</span>, voluntarily authorize <span className="font-bold">{selectedWakil?.name}</span> to collect my pension of <span className="font-bold">RM {beneficiary.monthlyPayout.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span> for this month.
                                        </p>
                                        <p>
                                            I declare that releasing these funds to this appointed Wakil is legally equivalent to releasing them directly to me, and I release the Government from further liability upon this handover.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <label className="flex items-start gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="relative flex items-center mt-0.5">
                                <input 
                                type="checkbox" 
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:border-blue-500 checked:bg-blue-500"
                                checked={pensionerConsent}
                                onChange={(e) => setPensionerConsent(e.target.checked)}
                                />
                                <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                <Check size={12} strokeWidth={3} />
                                </div>
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                                I Confirm & Execute this Mandate
                            </span>
                        </label>

                        <p className="text-xs text-gray-600 mt-3 px-2 leading-snug text-justify font-medium">
                            By executing the biometric verification below, I hereby affix my unique biological identity to this digital instrument, acknowledging it carries the same legal validity as a wet signature under the <span className="font-bold">Digital Signature Act 1997</span>.
                        </p>
                    </div>
                    )}

                    {ownerScanStage === 'PRE_CHECK' && (
                    <button
                        onClick={handleOwnerBioStart}
                        disabled={!pensionerConsent}
                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                            pensionerConsent 
                            ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' 
                            : 'bg-gray-300 cursor-not-allowed'
                        }`}
                    >
                        <Fingerprint size={20} />
                        <span>Execute Mandate</span>
                    </button>
                    )}
                </div>
              ) : (
                <VerificationStages 
                    stage={ownerScanStage as ScanStage} 
                    locationType="HOME"
                    onBioAuth={handleOwnerBioProcess}
                    enableFaceScan={true}
                    referenceImage={beneficiary.photoUrl}
                    stepLabel="Step 2: Pensioner's Mandate"
                    customDecryptingText="Reading MyKad Chip..."
                    customBioLockHeader="Mandate Execution"
                    customBioLockSubtext="Biometric verification serves as your digital signature for this mandate."
                    customBioInstruction="Place thumb on scanner to stamp your signature."
                    customFaceButtonText="Sign with Face ID "
                    customStatusLabel="Awaiting Execution"
                    customSuccessHeader="Mandate executed"
                    customSuccessSubtext="Mandate stamped. Funds are now releasable to the Wakil."
                    customSuccessStatus="Mandate Verified"
                    onContinue={() => setStep('WITNESS')}
                    continueLabel="Proceed to the Official Seal"
                    customBioScanningHeader="Verifying Biometric Pensioner..."
                    customBioScanningSubtext="Matching live thumbprint to MyKad to authorize fund release."
                    customBioScanningStatus="Matching Records..."
                />
              )}
            </motion.div>
          )}

          {/* STEP 3: THE WITNESS */}
          {step === 'WITNESS' && !isGeneratingWarrant && (
            <motion.div
              key="witness"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center w-full max-w-xl mx-auto"
            >
              {witnessScanStage === 'EVIDENCE' || witnessScanStage === 'DECLARATION' ? (
                <div className="w-full">
                    <div className="mb-6 text-center">
                        <h3 className="text-2xl font-bold text-gov-900">Step 3: The Official Seal</h3>
                        <p className="text-gray-500 text-sm mt-1">Ketua Kampung / Officer Verification</p>
                    </div>

                    {witnessScanStage === 'EVIDENCE' ? (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-3">Capture a photo of the Wakil and Pensioner together to certify the physical meeting.</label>
                        
                        {/* Camera/Upload UI */}
                        {!photoCaptured && !isCameraActive && (
                            <div className="flex gap-4 mb-6">
                                <button
                                    onClick={startCamera}
                                    className="flex-1 aspect-video bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 hover:bg-white hover:border-amber-500 hover:shadow-md transition-all group"
                                >
                                    <Camera className="text-gray-400 group-hover:text-amber-600" size={24} />
                                    <p className="text-gray-500 font-bold text-xs group-hover:text-amber-600">Take Photo</p>
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 aspect-video bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 hover:bg-white hover:border-amber-500 hover:shadow-md transition-all group"
                                >
                                    <Upload className="text-gray-400 group-hover:text-amber-600" size={24} />
                                    <p className="text-gray-500 font-bold text-xs group-hover:text-amber-600">Upload</p>
                                </button>
                            </div>
                        )}

                        {/* Real Camera View */}
                        {isCameraActive && (
                            <div className="w-full mb-6 relative rounded-xl overflow-hidden shadow-lg bg-black">
                                <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />
                                <canvas ref={canvasRef} className="hidden" />
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                                    <button onClick={stopCamera} className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"><X size={24} /></button>
                                    <button onClick={capturePhoto} className="p-4 rounded-full bg-white border-4 border-gray-200 shadow-lg active:scale-95 transition-transform"><div className="w-4 h-4 bg-red-500 rounded-full"></div></button>
                                </div>
                            </div>
                        )}

                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

                        {/* Photo Preview */}
                        {photoCaptured && photoPreview && !isCameraActive && (
                            <div className="mb-6 relative w-full flex justify-center items-center bg-gray-100 rounded-xl overflow-hidden border border-gray-200" style={{ minHeight: '12rem' }}>
                                <img 
                                    src={photoPreview} 
                                    alt="Evidence" 
                                    className="max-h-96 max-w-full object-contain" 
                                    style={{ display: 'block', margin: '0 auto' }}
                                />
                                <button 
                                    onClick={() => { setPhotoCaptured(false); setPhotoPreview(null); }}
                                    className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-sm z-10"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                        
                        <button
                            onClick={handlePhotoConfirm}
                            disabled={!photoCaptured}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                                photoCaptured
                                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' 
                                : 'bg-gray-300 cursor-not-allowed'
                            }`}
                        >
                            <Check size={20} />
                            <span>Confirm Evidence</span>
                        </button>
                    </div>
                    ) : (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-4 mb-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                            <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm">
                                <img src="/mock-photos/Other Uncle2.png" alt="Ketua Kampung" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Ketua Kampung (Witness)</p>
                                <h4 className="font-bold text-gray-900">Tok Batin Razak bin Osman</h4>
                                <div className="flex items-center gap-1 mt-1 text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full w-fit">
                                    <Check size={10} strokeWidth={3} />
                                    <span>Official Verified</span>
                                </div>
                            </div>
                        </div>

                        {/* GOLD DECLARATION BOX */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <Shield className="text-amber-600 shrink-0 mt-1" size={20} />
                                <div>
                                    <h4 className="font-bold text-amber-900 text-sm mb-1">OFFICIAL REPRESENTATIVE ATTESTATION</h4>
                                    <div className="text-xs text-amber-800 leading-relaxed space-y-2">
                                        <p>
                                            I, <span className="font-bold">Tok Batin Razak bin Osman</span> (<span className="font-mono">KK-0012-P</span>), acting in my official capacity as an Official Government Representative, hereby attest that I have physically witnessed the voluntary execution of this mandate.
                                        </p>
                                        <p>
                                            I certify that the Pensioner is acting without coercion, and I verify the physical presence and identity of both parties.
                                        </p>
                                        <p>
                                            I acknowledge that making a false verification is an offense under the <span className="font-bold">MACC Act 2009</span>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <label className="flex items-start gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="relative flex items-center mt-0.5">
                                <input 
                                type="checkbox" 
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:border-amber-500 checked:bg-amber-500"
                                checked={witnessCertify}
                                onChange={(e) => setWitnessCertify(e.target.checked)}
                                />
                                <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                <Check size={12} strokeWidth={3} />
                                </div>
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                                I Attest & Seal This Authorization
                            </span>
                        </label>

                        <p className="text-xs text-gray-600 mt-3 px-2 leading-snug text-justify font-medium">
                            By applying my digital seal below, I hereby affix my official credentials to this digital instrument, acknowledging it carries the same legal validity as an official stamp and signature under the <span className="font-bold">Digital Signature Act 1997</span>.
                        </p>

                        <button
                            onClick={handleWitnessSealStart}
                            disabled={!witnessCertify}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 mt-6 ${
                                witnessCertify
                                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' 
                                : 'bg-gray-300 cursor-not-allowed'
                            }`}
                        >
                            <Fingerprint size={20} />
                            <span>Apply Digital Seal</span>
                        </button>
                    </div>
                    )}
                </div>
              ) : (
                <VerificationStages 
                    stage={witnessScanStage as ScanStage} 
                    locationType="HOME"
                    onBioAuth={handleWitnessBioProcess}
                    enableFaceScan={true}
                    stepLabel="Step 3: Witness Seal"
                    customBioLockHeader="Official Witness Seal"
                    customBioLockSubtext="Biometric verification serves as your official certification of presence."
                    customBioInstruction="Place thumb on scanner to stamp your signature."
                    customFaceButtonText="Sign with Face ID"
                    customStatusLabel="Awaiting Official Seal"
                    customSuccessHeader="Official Seal Applied"
                    customSuccessSubtext="This transaction has been successfully witnessed and digitally notarized."
                    customSuccessStatus="Notarization Complete"
                    customBioScanningHeader="Validating Official Credentials..."
                    customBioScanningSubtext="Authenticating biometrics against encrypted officer records to apply Digital Seal."
                    customBioScanningStatus="Validating Authority..."
                    onContinue={() => {
                        setIsGeneratingWarrant(true);
                        setTimeout(() => {
                            setIsGeneratingWarrant(false);
                            setStep('WARRANT');
                        }, 3500);
                    }}
                    continueLabel="Finalize & Generate Digital Warrant"
                />
              )}
            </motion.div>
          )}

          {/* INTERSTITIAL: GENERATING WARRANT */}
          {isGeneratingWarrant && (
            <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center p-8"
            >
                <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-4 border-amber-100 rounded-full border-t-amber-500"
                    />
                    <motion.div 
                        animate={{ rotate: -180 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-2 border-4 border-gov-50 rounded-full border-b-gov-900"
                    />
                    <Shield size={48} className="text-gov-900 relative z-10" />
                </div>

                <h3 className="text-xl font-bold text-gov-900 mb-2">Forging Digital Warrant</h3>
                
                <div className="h-8 relative w-full max-w-xs text-center flex items-center justify-center">
                    <TextCycler />
                </div>

                <div className="w-64 h-1.5 bg-gray-100 rounded-full mt-6 overflow-hidden">
                    <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3.5, ease: "easeInOut" }}
                        className="h-full bg-gradient-to-r from-gov-900 via-amber-500 to-gov-900"
                    />
                </div>
            </motion.div>
          )}

          {/* STEP 4: THE WARRANT (SUCCESS) */}
          {step === 'WARRANT' && !isGeneratingWarrant && contractDetails && selectedWakil && (
            <motion.div
              key="warrant"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
              className="flex flex-col items-center justify-center w-full px-4 relative"
            >
              <div className="w-full max-w-3xl bg-white border-2 border-gov-900 rounded-2xl overflow-hidden shadow-2xl mb-8">
                  {/* Header */}
                  <div className="bg-gov-900 text-white p-4 relative overflow-hidden flex items-center justify-between">
                      <div className="absolute top-0 left-0 w-full h-full bg-white/5 pattern-grid-lg opacity-20"></div>
                      <div className="relative z-10">
                        <h2 className="text-xl font-black tracking-widest leading-none">KWAP DIGITAL WARRANT</h2>
                        <p className="text-[10px] font-medium text-gray-300 uppercase tracking-wider mt-1">Encrypted Single-Use Authorization</p>
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
                                  <p className="font-bold text-gray-900 leading-tight mb-0.5 text-base">{selectedWakil.name}</p>
                                  <p className="font-mono text-xs text-gray-500 mb-1">{selectedWakil.ic}</p>
                                  <p className="text-[10px] text-gray-400 leading-tight">{selectedWakil.address}</p>
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
                                value={contractDetails.encryptedQr}
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
                onClick={() => onComplete({ name: selectedWakil.name, ic: selectedWakil.ic })}
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
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        message={alertConfig.message}
        type="warning"
        actionLabel="Yes, Proceed"
        onAction={alertConfig.onConfirm}
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default WakilVerificationScreen;