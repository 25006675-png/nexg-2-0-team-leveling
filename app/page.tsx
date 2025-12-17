"use client";
// Force rebuild
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LogOut, Battery, Signal, Shield, Check, ChevronLeft, MapPin, Settings } from 'lucide-react';
import LoginScreen from '../components/LoginScreen';
import AgentGeoCheck from '../components/AgentGeoCheck';
import DashboardScreen from '../components/DashboardScreen';
import VerificationScreen from '../components/ScanScreen';
import ConfirmationScreen from '../components/VerifyScreen';
import SuccessScreen from '../components/SuccessScreen';
import SettingsScreen from '../components/SettingsScreen';
import { Beneficiary, Kampung, VerificationType } from '../types';

export type Step = 'login' | 'geo_check' | 'dashboard' | 'verification' | 'confirmation' | 'success' | 'settings';

// Helper to get a date relative to today
const getRelativeDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// Initial Data Set (Addresses will be patched)
const RAW_DATA: Beneficiary[] = [
  { 
    ic: "500101-13-1234", 
    name: "Haji Abu Bakar", 
    status: "Active",
    geography: 'DEEP_RURAL', // Placeholder, will be overwritten
    isOku: false,
    scheme: "B",
    lastScanDate: getRelativeDate(28),
    monthlyPayout: 1250,
    pendingMonths: 3,
    address: "PLACEHOLDER",
    lastPaid: "Dec 2024",
    photoUrl: "https://randomuser.me/api/portraits/men/75.jpg",
    completed: false
  },
  { 
    ic: "450101-03-2222", 
    name: "Mariam Isa", 
    status: "Active", 
    geography: 'RURAL', // Placeholder
    isOku: true,
    scheme: "B",
    lastScanDate: getRelativeDate(30),
    monthlyPayout: 850,
    pendingMonths: 3,
    address: "PLACEHOLDER",
    lastPaid: "Dec 2024",
    photoUrl: "https://randomuser.me/api/portraits/women/66.jpg",
    completed: false
  },
  { 
    ic: "750101-10-1111", 
    name: "Fatimah Binti Ali", 
    status: "Active", 
    geography: 'RURAL', // Placeholder
    isOku: false,
    scheme: "B",
    lastScanDate: getRelativeDate(25),
    monthlyPayout: 950,
    pendingMonths: 1,
    address: "PLACEHOLDER",
    lastPaid: "Feb 2025",
    photoUrl: "https://randomuser.me/api/portraits/women/24.jpg",
    completed: false
  },
  { 
    ic: "880303-01-9988", 
    name: "Wong Wei Chen", 
    status: "Active", 
    geography: 'DEEP_RURAL', // Placeholder
    isOku: true,
    scheme: "B",
    lastScanDate: getRelativeDate(35),
    monthlyPayout: 1100,
    pendingMonths: 2,
    address: "PLACEHOLDER",
    lastPaid: "Jan 2025",
    photoUrl: "https://randomuser.me/api/portraits/men/22.jpg",
    completed: false
  },
];

const App: React.FC = () => {
  const [step, setStep] = useState<Step>('login');
  const [agentId, setAgentId] = useState('KK-0012-P');
  const [selectedKampung, setSelectedKampung] = useState<Kampung | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);

  // Patch addresses and geography when Kampung changes, and merge with Local Storage
  useEffect(() => {
    if (selectedKampung) {
      // 1. Generate Base Data
      const patchedData = RAW_DATA.map((b, index) => ({
        ...b,
        geography: selectedKampung.geography, // All beneficiaries in this list belong to the selected kampung
        address: `No. ${10 + index * 5}, Jalan Utama, ${selectedKampung.name}, ${selectedKampung.postcode} ${selectedKampung.state}`
      }));

      // 2. Check Local Storage
      const storedData = localStorage.getItem('pencen_app_data');
      if (storedData) {
          try {
              const parsed: Record<string, Partial<Beneficiary>> = JSON.parse(storedData);
              const merged = patchedData.map(b => {
                  const saved = parsed[b.ic];
                  if (saved) {
                      return { ...b, ...saved }; // Restore completed status, verification type, etc.
                  }
                  return b;
              });
              setBeneficiaries(merged);
          } catch (e) {
              setBeneficiaries(patchedData);
          }
      } else {
          setBeneficiaries(patchedData);
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
          syncStatus: b.syncStatus
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
    setStep('dashboard');
  };

  const handleLogout = () => {
    setStep('login');
    setSelectedBeneficiary(null);
    setSelectedKampung(null);
  };

  const handleBack = () => {
    switch (step) {
      case 'geo_check':
        handleLogout();
        break;
      case 'dashboard':
        handleLogout();
        break;
      case 'verification':
        setStep('dashboard');
        setSelectedBeneficiary(null);
        break;
      case 'confirmation':
        setStep('verification');
        break;
      case 'success':
        setStep('dashboard');
        setSelectedBeneficiary(null);
        break;
      case 'settings':
        // Return to previous logical step, defaulting to dashboard if logged in, or login if not
        if (selectedKampung) {
            setStep('dashboard');
        } else {
            setStep('login');
        }
        break;
      default:
        break;
    }
  };

  const handleSelectBeneficiary = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setStep('verification');
  };

  const handleVerificationComplete = (type: VerificationType) => {
    if (selectedBeneficiary) {
        setSelectedBeneficiary({ ...selectedBeneficiary, verificationType: type });
    }
    setStep('confirmation');
  };

  const handleConfirmationComplete = (updatedBeneficiary: Beneficiary) => {
    // Apply sync status based on offline mode
    const finalBeneficiary: Beneficiary = {
        ...updatedBeneficiary,
        completed: true,
        syncStatus: isOffline ? 'pending' : 'synced'
    };

    setBeneficiaries(prev => prev.map(b => 
      b.ic === finalBeneficiary.ic ? finalBeneficiary : b
    ));
    
    saveBeneficiaryToStorage(finalBeneficiary);
    setSelectedBeneficiary(finalBeneficiary);
    setStep('success');
  };

  const handleResetDatabase = () => {
     localStorage.removeItem('pencen_app_data');
     if (selectedKampung) {
        const patchedData = RAW_DATA.map((b, index) => ({
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

  const steps: Step[] = ['login', 'geo_check', 'dashboard', 'verification', 'confirmation', 'success'];
  const stepLabels = {
    login: 'Login',
    geo_check: 'Zone Check',
    dashboard: 'Eligible Citizens',
    verification: 'Identity',
    confirmation: 'Confirm',
    success: 'Done',
    settings: 'Settings'
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-0 md:p-6 font-sans">
      <div className="w-full h-[100dvh] md:h-auto md:min-h-[700px] md:max-w-6xl bg-white md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative border border-gray-200">
        
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
                          <p className="text-[10px] text-blue-200 uppercase tracking-widest font-bold mb-1">Ketua ID</p>
                          <p className="font-mono text-xl font-semibold tracking-wide">{agentId}</p>
                          {selectedKampung && (
                             <div className="mt-3 pt-3 border-t border-white/10 flex items-start gap-2 text-sm text-gray-300">
                                <MapPin size={14} className="mt-0.5 shrink-0 text-yellow-500" />
                                <span className="leading-tight">{selectedKampung.name}</span>
                             </div>
                          )}
                      </div>
                      
                      <nav className="space-y-0">
                          {steps.map((s, idx) => {
                              const currentIdx = steps.indexOf(step);
                              const thisIdx = steps.indexOf(s);
                              const isActive = s === step;
                              const isPast = currentIdx > thisIdx;
                              
                              return (
                                  <div key={s} className="flex gap-4 relative group">
                                      {idx !== steps.length - 1 && (
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
                        <button onClick={() => setStep('settings')} className={`flex items-center gap-3 text-sm font-medium w-full p-3 rounded-lg transition-all ${step === 'settings' ? 'bg-white/10 text-white' : 'text-blue-200 hover:text-white hover:bg-white/5'}`}>
                            <Settings size={18} /> Settings
                        </button>
                        <button onClick={handleLogout} className="flex items-center gap-3 text-sm font-medium text-red-300 hover:text-white hover:bg-red-500/20 w-full p-3 rounded-lg transition-all">
                            <LogOut size={18} /> Exit Access
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
                    />
                  )}
                  {step === 'verification' && selectedBeneficiary && (
                    <VerificationScreen 
                      key="verification"
                      beneficiary={selectedBeneficiary} 
                      onScanComplete={handleVerificationComplete} 
                      onBack={handleBack}
                    />
                  )}
                  {step === 'confirmation' && selectedBeneficiary && (
                    <ConfirmationScreen 
                      key="confirmation" 
                      beneficiary={selectedBeneficiary}
                      onVerified={handleConfirmationComplete} 
                      onBack={handleBack}
                    />
                  )}
                  {step === 'success' && selectedBeneficiary && (
                    <SuccessScreen 
                      key="success"
                      beneficiary={selectedBeneficiary} 
                      onReset={() => setStep('dashboard')} 
                    />
                  )}
                  {step === 'settings' && (
                    <SettingsScreen
                        key="settings"
                        isDevMode={isDevMode}
                        setIsDevMode={setIsDevMode}
                        onBack={handleBack}
                    />
                  )}
                </AnimatePresence>
              </div>
          </div>

          <div className="py-4 bg-white/50 md:bg-transparent text-center text-[10px] text-gray-400 border-t border-gray-100 md:border-none shrink-0 font-mono uppercase tracking-widest">
            Ketua Kampung Access v3.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;