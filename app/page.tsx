"use client";
// Force rebuild
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LogOut, Battery, Signal, Shield, Check, ChevronLeft, MapPin, Settings, FileText, Users } from 'lucide-react';
import LoginScreen from '../components/LoginScreen';
import AgentGeoCheck from '../components/AgentGeoCheck';
import DashboardScreen from '../components/DashboardScreen';
import ResidentProfile from '../components/ResidentProfile';
import ModeSelectionScreen from '../components/ModeSelectionScreen';
import VerificationScreen from '../components/ScanScreen';
import WakilVerificationScreen, { WakilStep } from '../components/WakilVerificationScreen';
import ConfirmationScreen from '../components/VerifyScreen';
import SuccessScreen from '../components/SuccessScreen';
import SettingsScreen from '../components/SettingsScreen';
import HistoryScreen from '../components/HistoryScreen';
import { Beneficiary, Kampung, VerificationType } from '../types';
import { BENEFICIARIES_BY_KAMPUNG } from '../utils/mockData';
import { OfflineManager } from '../utils/OfflineManager';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';
import { saveVerification } from '../services/OfflineStorage';
import SyncStatusIndicator from '../components/SyncStatusIndicator';

export type Step = 'login' | 'geo_check' | 'dashboard' | 'resident_profile' | 'mode_selection' | 'verification' | 'wakil_verification' | 'confirmation' | 'success' | 'settings' | 'history';

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('login');
  const [verificationMode, setVerificationMode] = useState<'standard' | 'wakil' | null>(null);
  const [verificationLocation, setVerificationLocation] = useState<VerificationType>('HOME');
  const [wakilInternalStep, setWakilInternalStep] = useState<WakilStep>('RUNNER_PLEDGE');
  const [agentId, setAgentId] = useState('KK-0012-P');
  const [selectedKampung, setSelectedKampung] = useState<Kampung | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [allowManualOfflineToggle, setAllowManualOfflineToggle] = useState(false);
  const [previousStep, setPreviousStep] = useState<Step>('login');

  // Global Network Detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
        setIsOffline(true);
    }

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Patch addresses and geography when Kampung changes, and merge with Local Storage
  useEffect(() => {
    if (selectedKampung) {
      // 1. Get Base Data
      const baseData = BENEFICIARIES_BY_KAMPUNG[selectedKampung.id] || [];

      // 2. Check Local Storage
      const storedData = localStorage.getItem('pencen_app_data');
      if (storedData) {
          try {
              const parsed: Record<string, Partial<Beneficiary>> = JSON.parse(storedData);
              const merged = baseData.map(b => {
                  const saved = parsed[b.ic];
                  if (saved) {
                      return { ...b, ...saved }; // Restore completed status, verification type, etc.
                  }
                  return b;
              });
              setBeneficiaries(merged);
          } catch (e) {
              setBeneficiaries(baseData);
          }
      } else {
          setBeneficiaries(baseData);
      }
    }
  }, [selectedKampung]);

  // Save to local storage helper
  const saveBeneficiaryToStorage = (b: Beneficiary) => {
      const storedData = localStorage.getItem('pencen_app_data');
      const parsed: Record<string, Partial<Beneficiary>> = storedData ? JSON.parse(storedData) : {};
      
      // We only save the fields that change
      parsed[b.ic] = {
          completed: b.completed,
          status: b.status,
          verificationType: b.verificationType,
          syncStatus: b.syncStatus,
          referenceId: b.referenceId,
          serviceCount: b.serviceCount
      };
      
      localStorage.setItem('pencen_app_data', JSON.stringify(parsed));
  };

  const handleSyncData = () => {
      // Simulate sync process
      const updated = beneficiaries.map(b => {
          if (b.syncStatus === 'pending') {
              const syncedB = { ...b, syncStatus: 'synced' as const };
              saveBeneficiaryToStorage(syncedB);
              return syncedB;
          }
          return b;
      });
      setBeneficiaries(updated);
  };

  const handleLogin = (kampung: Kampung) => {
    setSelectedKampung(kampung);
    setStep('geo_check');
  };

  const handleGeoSuccess = () => {
    if (verificationMode === 'wakil') {
        setStep('wakil_verification');
    } else {
        setStep('dashboard');
    }
  };

  const handleLogout = () => {
    setStep('login');
    setSelectedBeneficiary(null);
    setSelectedKampung(null);
    setVerificationMode(null);
  };

  const handleBack = () => {
    switch (step) {
      case 'geo_check':
        if (verificationMode === 'wakil') {
            setStep('resident_profile');
            setVerificationMode(null);
        } else {
            handleLogout();
        }
        break;
      case 'dashboard':
        handleLogout();
        break;
      case 'resident_profile':
        setStep('dashboard');
        setSelectedBeneficiary(null);
        setVerificationMode(null);
        break;
      case 'mode_selection':
        setStep('resident_profile');
        break;
      case 'verification':
        setStep('mode_selection');
        break;
      case 'wakil_verification':
        setStep('resident_profile');
        break;
      case 'confirmation':
        setStep('verification');
        break;
      case 'success':
        setStep('dashboard');
        setSelectedBeneficiary(null);
        setVerificationMode(null);
        break;
      case 'settings':
        // Return to previous logical step
        setStep(previousStep);
        break;
      case 'history':
        setStep(previousStep);
        break;
      default:
        break;
    }
  };

  const handleSelectBeneficiary = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setStep('resident_profile');
  };

  const handleModeSelect = (mode: 'standard' | 'wakil') => {
    setVerificationMode(mode);
    if (mode === 'standard') {
      setStep('mode_selection');
    } else {
      setStep('geo_check');
    }
  };

  const handleVerificationLocationSelect = (type: VerificationType) => {
      setVerificationLocation(type);
      setStep('verification');
  };

  const handleVerificationComplete = (type: VerificationType) => {
    if (selectedBeneficiary) {
        setSelectedBeneficiary({ ...selectedBeneficiary, verificationType: type });
    }
    setStep('confirmation');
  };

  const handleWakilComplete = (wakilName: string) => {
    if (!selectedBeneficiary) return;

    const currentServiceCount = selectedBeneficiary.serviceCount || 0;
    const newServiceCount = currentServiceCount + 1;
    const isCompleted = newServiceCount >= 2;

    // Create a completed beneficiary object for Wakil mode
    // In a real app, we would store the rep details too
    const finalBeneficiary: Beneficiary = {
        ...selectedBeneficiary,
        completed: isCompleted,
        serviceCount: newServiceCount,
        syncStatus: isOffline ? 'pending' : 'synced',
        verificationType: 'HOME' // Assuming Wakil is always Home/Bedridden
    };

    updateBeneficiaryAndSave(finalBeneficiary);
    setStep('success');
  };

  const handleConfirmationComplete = (updatedBeneficiary: Beneficiary) => {
    const currentServiceCount = updatedBeneficiary.serviceCount || 0;
    const newServiceCount = currentServiceCount + 1;
    const isCompleted = newServiceCount >= 2;

    // Apply sync status based on offline mode
    const finalBeneficiary: Beneficiary = {
        ...updatedBeneficiary,
        completed: isCompleted,
        serviceCount: newServiceCount,
        syncStatus: isOffline ? 'pending' : 'synced'
    };

    updateBeneficiaryAndSave(finalBeneficiary);
    setSelectedBeneficiary(finalBeneficiary);
    setStep('success');
  };

  const updateBeneficiaryAndSave = (finalBeneficiary: Beneficiary) => {
    setBeneficiaries(prev => prev.map(b => 
      b.ic === finalBeneficiary.ic ? finalBeneficiary : b
    ));
    
    saveBeneficiaryToStorage(finalBeneficiary);
    
    // Secure Offline Storage (The Vault)
    saveVerification(finalBeneficiary);

    // If online, add directly to history log
    if (!isOffline && selectedKampung) {
        OfflineManager.addOnlineVerificationToHistory(
            finalBeneficiary, 
            selectedKampung.id, 
            finalBeneficiary.referenceId || OfflineManager.generateReferenceId(finalBeneficiary.ic)
        );
    }
  };

  const handleResetDatabase = () => {
     localStorage.removeItem('pencen_app_data');
     if (selectedKampung) {
        const baseData = BENEFICIARIES_BY_KAMPUNG[selectedKampung.id] || [];
        const patchedData = baseData.map((b, index) => ({
            ...b,
            geography: selectedKampung.geography,
            address: `No. ${10 + index * 5}, Jalan Utama, ${selectedKampung.name}, ${selectedKampung.postcode} ${selectedKampung.state}`,
            completed: false,
            verificationType: undefined,
            syncStatus: undefined
        }));
        setBeneficiaries(patchedData);
    }
  };

  // Dynamic Steps Calculation
  let currentSteps: string[] = [];
  if (verificationMode === 'standard') {
      currentSteps = ['mode_selection', 'verification', 'confirmation', 'success'];
  } else if (verificationMode === 'wakil' && step === 'wakil_verification') {
      currentSteps = ['wakil_pledge', 'wakil_mandate', 'wakil_seal', 'wakil_warrant'];
  } else if (step === 'resident_profile') {
      currentSteps = [];
  } else if (step === 'verification' || step === 'confirmation' || step === 'success') {
      // Fallback if mode is lost but step is advanced (shouldn't happen with proper state)
      currentSteps = ['mode_selection', 'verification', 'confirmation', 'success'];
  }

  const stepLabels: Record<string, string> = {
    login: t.steps.login,
    geo_check: t.steps.geo_check,
    dashboard: "Dashboard",
    resident_profile: "Resident Profile",
    mode_selection: "Mode Selection",
    verification: "Identity Check",
    confirmation: t.steps.confirmation,
    success: t.steps.success,
    wakil_pledge: "Wakil's Declaration",
    wakil_mandate: "Pensioner's Mandate",
    wakil_seal: "Official Seal",
    wakil_warrant: "Digital Warrant",
    settings: t.steps.settings,
    history: t.steps.history
  };

  const handleNavToAux = (target: Step) => {
      // Only update previous step if we're not already in an auxiliary screen
      // This prevents getting stuck in a loop between Settings and History
      if (step !== 'settings' && step !== 'history') {
          setPreviousStep(step);
      }
      setStep(target);
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-0 md:p-6 font-sans">
      <div className="w-full h-[100dvh] md:h-[calc(100vh-3rem)] md:max-w-6xl bg-white md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative border border-gray-200">
        
        {/* TABLET SIDEBAR */}
        <aside className="hidden md:flex flex-col w-80 bg-gov-900 text-white p-8 justify-between shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

            <div className="z-10 relative">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shadow-lg shadow-black/20">
                        <Shield className="text-yellow-500 w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight tracking-tight">MyDigital<br/>Kampung</h1>
                    </div>
                </div>
                
                {step !== 'login' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                      <div className="bg-white/10 rounded-xl p-5 border border-white/5 backdrop-blur-sm">
                          <p className="text-[10px] text-blue-200 uppercase tracking-widest font-bold mb-1">{t.login.ketuaId}</p>
                          <p className="font-mono text-xl font-semibold tracking-wide">{agentId}</p>
                          {selectedKampung && (
                             <div className="mt-3 pt-3 border-t border-white/10 flex items-start gap-2 text-sm text-gray-300">
                                <MapPin size={14} className="mt-0.5 shrink-0 text-yellow-500" />
                                <span className="leading-tight">{selectedKampung.name}</span>
                             </div>
                          )}
                      </div>
                      
                      <nav className="space-y-0">
                          {verificationMode && (
                              <div className="mb-4 px-4 py-2 bg-white/10 rounded-lg border border-white/5">
                                  <p className="text-[10px] text-blue-200 uppercase tracking-widest font-bold mb-1">Service Mode</p>
                                  <p className="font-bold text-sm text-white">
                                      {verificationMode === 'standard' ? 'Biometric Proof of Life' : 'Assign One-Time Wakil'}
                                  </p>
                              </div>
                          )}

                          {currentSteps.map((s, idx) => {
                              // Calculate active index based on mode
                              let activeIndex = currentSteps.indexOf(step);
                              
                              // Special handling for Wakil internal steps
                              if (verificationMode === 'wakil' && step === 'wakil_verification') {
                                  if (wakilInternalStep === 'RUNNER_PLEDGE') activeIndex = currentSteps.indexOf('wakil_pledge');
                                  else if (wakilInternalStep === 'OWNER_MANDATE') activeIndex = currentSteps.indexOf('wakil_mandate');
                                  else if (wakilInternalStep === 'WITNESS') activeIndex = currentSteps.indexOf('wakil_seal');
                                  else if (wakilInternalStep === 'WARRANT') activeIndex = currentSteps.indexOf('wakil_warrant');
                              }

                              const thisIdx = idx;
                              const isActive = thisIdx === activeIndex;
                              const isPast = activeIndex > thisIdx;
                              
                              return (
                                  <div 
                                    key={s} 
                                    className={`flex gap-4 relative group`}
                                  >
                                      {idx !== currentSteps.length - 1 && (
                                        <div className={`absolute left-4 top-8 bottom-[-8px] w-0.5 ${isPast ? 'bg-blue-500' : 'bg-slate-700'}`} />
                                      )}
                                      
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 z-10 transition-all duration-300 ${isActive ? 'bg-white text-gov-900 border-white scale-110' : isPast ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-700 text-slate-600 bg-gov-900'}`}>
                                          {isPast ? <Check size={14} strokeWidth={3}/> : idx + 1}
                                      </div>
                                      <div className={`flex flex-col justify-center pb-8 transition-colors duration-300 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                                        <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-300'}`}>{stepLabels[s]}</span>
                                      </div>
                                  </div>
                              )
                          })}
                      </nav>
                  </div>
                )}
            </div>

            <div className="z-10 relative space-y-2">
                 {step !== 'login' && (
                    <>
                        <button 
                            onClick={() => {
                                if ((step as string) !== 'login' && (step as string) !== 'geo_check') {
                                    setStep('dashboard');
                                    setVerificationMode(null);
                                    setSelectedBeneficiary(null);
                                }
                            }}
                            className={`flex items-center gap-3 text-sm font-medium w-full p-3 rounded-lg transition-all ${step === 'dashboard' || step === 'resident_profile' ? 'bg-white text-gov-900 shadow-lg shadow-black/10' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}
                        >
                            <Users size={18} className={step === 'dashboard' || step === 'resident_profile' ? 'text-gov-900' : 'text-yellow-400'} /> Dashboard
                        </button>
                        <button onClick={() => handleNavToAux('history')} className={`flex items-center gap-3 text-sm font-medium w-full p-3 rounded-lg transition-all ${step === 'history' ? 'bg-white/10 text-white' : 'text-blue-200 hover:text-white hover:bg-white/5'}`}>
                            <FileText size={18} /> {t.common.history}
                        </button>
                        <button onClick={() => handleNavToAux('settings')} className={`flex items-center gap-3 text-sm font-medium w-full p-3 rounded-lg transition-all ${step === 'settings' ? 'bg-white/10 text-white' : 'text-blue-200 hover:text-white hover:bg-white/5'}`}>
                            <Settings size={18} /> {t.common.settings}
                        </button>
                        <button onClick={handleLogout} className="flex items-center gap-3 text-sm font-medium text-red-300 hover:text-white hover:bg-red-500/20 w-full p-3 rounded-lg transition-all">
                            <LogOut size={18} /> {t.common.exitAccess}
                        </button>
                    </>
                 )}
            </div>
        </aside>

        {/* RIGHT CONTENT / MOBILE VIEW */}
        <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
          
          <div className="md:hidden bg-gov-900 text-white px-6 py-3 flex justify-between items-center text-xs z-50 shrink-0">
            <div className="flex gap-2 items-center font-mono">
              <span>09:42</span>
            </div>
            <div className="flex gap-3 items-center">
              <Signal size={14} />
              <Battery size={14} />
            </div>
          </div>

          {step !== 'login' && (
            <header className="md:hidden bg-white border-b border-gray-100 px-4 py-4 flex justify-between items-center shrink-0 z-40 shadow-sm relative">
              <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gov-900">
                <ChevronLeft size={24} />
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 text-center max-w-[60%]">
                <h1 className="text-gov-900 font-bold text-base leading-none truncate">{selectedKampung?.name || 'MyDigital Kampung'}</h1>
                <p className="text-gray-400 text-[10px] mt-0.5 font-mono">{agentId}</p>
              </div>
              <div className="w-8"></div>
            </header>
          )}

          <div className="flex-1 overflow-y-auto no-scrollbar relative p-0 md:p-12 flex flex-col">
              <div className="flex-1 w-full max-w-2xl mx-auto h-full flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {step === 'login' && (
                    <LoginScreen 
                      key="login" 
                      agentId={agentId}
                      setAgentId={setAgentId}
                      onLogin={handleLogin} 
                    />
                  )}
                  {step === 'geo_check' && selectedKampung && (
                    <AgentGeoCheck 
                        key="geo"
                        kampung={selectedKampung}
                        onSuccess={handleGeoSuccess}
                        isDevMode={isDevMode}
                    />
                  )}
                  {step === 'dashboard' && selectedKampung && (
                    <DashboardScreen
                      key="dashboard"
                      kampung={selectedKampung}
                      beneficiaries={beneficiaries}
                      onSelectBeneficiary={handleSelectBeneficiary}
                      onReset={handleResetDatabase}
                      isOffline={isOffline}
                      setIsOffline={setIsOffline}
                      onSync={handleSyncData}
                      allowManualOfflineToggle={allowManualOfflineToggle}
                    />
                  )}
                  {step === 'resident_profile' && selectedBeneficiary && (
                    <ResidentProfile
                      key="resident_profile"
                      beneficiary={selectedBeneficiary}
                      onSelectMode={handleModeSelect}
                      onBack={handleBack}
                    />
                  )}
                  {step === 'wakil_verification' && selectedBeneficiary && selectedKampung && (
                    <WakilVerificationScreen
                      key="wakil_verification"
                      beneficiary={selectedBeneficiary}
                      onComplete={handleWakilComplete}
                      onBack={handleBack}
                      onStepChange={setWakilInternalStep}
                      kampungId={selectedKampung.id}
                    />
                  )}
                  {step === 'mode_selection' && selectedBeneficiary && (
                    <ModeSelectionScreen
                      key="mode_selection"
                      beneficiary={selectedBeneficiary}
                      onSelectMode={handleVerificationLocationSelect}
                      onException={(reason) => {
                         if (reason === 'NOT_AT_HOME') {
                             handleBack();
                         } else {
                             handleVerificationLocationSelect('HOME');
                         }
                      }}
                      onBack={handleBack}
                    />
                  )}
                  {step === 'verification' && selectedBeneficiary && (
                    <VerificationScreen 
                      key="verification"
                      beneficiary={selectedBeneficiary}
                      beneficiaries={beneficiaries}
                      onScanComplete={handleVerificationComplete} 
                      onBack={handleBack}
                      verificationLocation={verificationLocation}
                    />
                  )}
                  {step === 'confirmation' && selectedBeneficiary && selectedKampung && (
                    <ConfirmationScreen 
                      key="confirmation" 
                      beneficiary={selectedBeneficiary}
                      kampungId={selectedKampung.id}
                      onVerified={handleConfirmationComplete} 
                      onBack={handleBack}
                      isOffline={isOffline}
                    />
                  )}
                  {step === 'success' && selectedBeneficiary && (
                    <SuccessScreen 
                      key="success"
                      beneficiary={selectedBeneficiary} 
                      onReset={() => setStep('dashboard')} 
                      isOffline={isOffline}
                    />
                  )}
                  {step === 'settings' && (
                    <SettingsScreen
                        key="settings"
                        isDevMode={isDevMode}
                        setIsDevMode={setIsDevMode}
                        allowManualOfflineToggle={allowManualOfflineToggle}
                        setAllowManualOfflineToggle={setAllowManualOfflineToggle}
                        onBack={handleBack}
                    />
                  )}
                  {step === 'history' && selectedKampung && (
                    <HistoryScreen
                        key="history"
                        kampungId={selectedKampung.id}
                        onBack={handleBack}
                    />
                  )}
                </AnimatePresence>
              </div>
          </div>

          <div className="py-4 bg-white/50 md:bg-transparent text-center text-[10px] text-gray-400 border-t border-gray-100 md:border-none shrink-0 font-mono uppercase tracking-widest">
            {t.common.version}
          </div>
        </div>
      </div>
      
      {/* Global Sync Indicator */}
      {step !== 'login' && <SyncStatusIndicator />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;