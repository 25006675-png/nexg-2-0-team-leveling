import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, ChevronLeft, MapPin, Eye, Banknote, Calendar, Home, Building2, WifiOff } from 'lucide-react';
import { Beneficiary } from '../types';
import { OfflineManager } from '../utils/OfflineManager';

interface VerifyScreenProps {
  onVerified: (updatedBeneficiary: Beneficiary) => void;
  beneficiary: Beneficiary;
  onBack: () => void;
}

const VerifyScreen: React.FC<VerifyScreenProps> = ({ onVerified, beneficiary, onBack }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const totalPayout = beneficiary.monthlyPayout * beneficiary.pendingMonths;

  const handleSave = () => {
     setIsSaving(true);
     
     // Simulate processing
     setTimeout(() => {
         if (isOffline) {
             // Offline Flow
             OfflineManager.addToQueue(beneficiary);
             alert("No Internet Connection.\n\nData has been encrypted and saved to the Secure Enclave. It will be uploaded automatically when connection is restored.");
         }
         
         onVerified({ ...beneficiary, status: 'Verified' });
     }, 1500);
  };

  // Helper formatting currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full flex flex-col p-6 md:p-0"
    >
      <div className="hidden md:flex mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gov-900 transition-colors">
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gov-900">Service Confirmation</h2>
        <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-100 flex items-center gap-1">
                <Eye size={10} />
                Identity & Location Verified
            </span>
        </div>
      </div>

      <div className="flex flex-col gap-6 mb-8">
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start gap-5 mb-4">
                    <img 
                    src={beneficiary.photoUrl} 
                    alt={beneficiary.name} 
                    className="w-20 h-20 rounded-xl object-cover border-2 border-gray-100 bg-gray-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xl text-gov-900 leading-tight">{beneficiary.name}</h3>
                        <p className="text-sm text-gray-500 font-mono mt-1">{beneficiary.ic}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded border flex items-center gap-1
                                ${beneficiary.geography === 'DEEP_RURAL' ? 'bg-purple-100 text-purple-900 border-purple-200' : 'bg-orange-100 text-orange-900 border-orange-200'}
                            `}>
                                <MapPin size={12} />
                                {beneficiary.geography.replace('_', ' ')}
                            </span>
                            {beneficiary.verificationType && (
                                <span className="text-[10px] font-bold px-2 py-1 rounded border flex items-center gap-1 bg-blue-100 text-blue-900 border-blue-200">
                                    {beneficiary.verificationType === 'HOME' ? <Home size={12} /> : <Building2 size={12}/>}
                                    {beneficiary.verificationType === 'HOME' ? 'Home Visit' : 'Community Hall'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex items-start gap-3">
                    <MapPin size={16} className="text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-600 font-medium">{beneficiary.address}</p>
                </div>
          </div>

          <div className="bg-gov-50 rounded-xl p-5 border border-gov-100">
               <label className="text-[10px] font-bold text-gov-500 uppercase tracking-wider mb-3 block">
                   Pension Details
               </label>
               
               <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                   <div className="p-4 flex justify-between items-center border-b border-gray-100">
                       <div className="flex items-center gap-3">
                           <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                               <Banknote size={18} />
                           </div>
                           <span className="text-sm font-medium text-gray-600">Monthly Rate</span>
                       </div>
                       <span className="font-mono font-semibold text-gray-900">{formatCurrency(beneficiary.monthlyPayout)}</span>
                   </div>
                   
                   <div className="p-4 flex justify-between items-center border-b border-gray-100">
                       <div className="flex items-center gap-3">
                           <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
                               <Calendar size={18} />
                           </div>
                           <span className="text-sm font-medium text-gray-600">Pending Months</span>
                       </div>
                       <span className="font-mono font-semibold text-gray-900">x {beneficiary.pendingMonths}</span>
                   </div>

                   <div className="p-4 flex justify-between items-center bg-green-50/50">
                       <span className="text-sm font-bold text-gov-900">Total Pension Value</span>
                       <span className="font-mono text-xl font-bold text-green-600">{formatCurrency(totalPayout)}</span>
                   </div>
               </div>
               
               <p className="text-[10px] text-gray-400 mt-3 text-center">
                   System will log proof of life for this period.
               </p>
          </div>
      </div>

      <div className="mt-auto w-full">
         <button
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full rounded-xl p-5 flex items-center justify-between transition-all group relative overflow-hidden ${
            !isSaving
                ? isOffline 
                    ? 'bg-amber-600 text-white hover:shadow-[0_3px_0_0_#78350f] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] shadow-[0_6px_0_0_#78350f]'
                    : 'bg-gov-900 text-white hover:shadow-[0_3px_0_0_#020617] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] shadow-[0_6px_0_0_#020617]' 
                : 'bg-gray-800 text-gray-400 cursor-wait shadow-[0_6px_0_0_#1f2937]'
            }`}
        >
            <div className="text-left relative z-10">
                <span className="block text-lg font-bold">
                    {isSaving 
                        ? (isOffline ? 'Encrypting...' : 'Processing...') 
                        : (isOffline ? 'Save to Secure Enclave' : 'Confirm Proof of Life')
                    }
                </span>
                <span className={`text-xs ${isOffline ? 'text-amber-100' : 'text-blue-200'}`}>
                     {isSaving 
                        ? 'Synchronizing...' 
                        : (isOffline ? 'No Internet - Store & Forward' : `Verify Pension Value of ${formatCurrency(totalPayout)}`)
                     }
                </span>
            </div>
            <div className="p-3 rounded-xl bg-white/10">
                {isOffline ? <WifiOff size={24} /> : <Save size={24} className={isSaving ? 'animate-bounce' : ''} />}
            </div>
        </button>
        {isOffline && (
            <p className="text-center text-xs text-amber-700 mt-3 font-medium flex items-center justify-center gap-1">
                <WifiOff size={12} />
                Offline Mode: Data will be stored locally
            </p>
        )}
      </div>
    </motion.div>
  );
};

export default VerifyScreen;