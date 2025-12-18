import React from 'react';
import { motion } from 'framer-motion';
import { Check, Download, Share2, ArrowRight, Shield, Lock, WifiOff } from 'lucide-react';
import { Beneficiary } from '../types';

interface SuccessScreenProps {
  onReset: () => void;
  beneficiary: Beneficiary;
  isOffline: boolean;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ onReset, beneficiary, isOffline }) => {
  const totalPayout = beneficiary.monthlyPayout * beneficiary.pendingMonths;

  // Helper formatting currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full flex flex-col p-6 md:p-0 items-center md:items-stretch"
    >
      <div className="flex flex-col items-center md:flex-row md:items-center md:gap-8 mb-8">
          {/* Success Animation Header */}
          <div className="relative shrink-0">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl z-10 relative ${isOffline ? 'bg-amber-500 shadow-amber-500/30' : 'bg-green-500 shadow-green-500/30'}`}
            >
              {isOffline ? <Shield className="text-white w-12 h-12" strokeWidth={2.5} /> : <Check className="text-white w-12 h-12" strokeWidth={4} />}
            </motion.div>
            {/* Simple decorative rings */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.2, scale: 1.5 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className={`absolute inset-0 rounded-full z-0 ${isOffline ? 'bg-amber-500' : 'bg-green-500'}`}
            />
          </div>

          <div className="text-center md:text-left mt-6 md:mt-0">
              <h2 className={`text-2xl font-bold ${isOffline ? 'text-amber-900' : 'text-gov-900'}`}>
                  {isOffline ? 'Proof of Life Captured' : 'Verification Successful'}
                  <br/>{isOffline ? 'Securely Stored' : ''}
              </h2>
              <p className="text-gray-500 text-sm mt-2 max-w-xs md:max-w-none">
                {isOffline 
                    ? "Data encrypted and saved to Secure Enclave. Connect to Internet to finalize upload." 
                    : "Proof of Life accepted by KWAP. Pension Status: ACTIVE."}
              </p>
              {isOffline && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
                      <WifiOff size={12} />
                      STATUS: QUEUED FOR UPLOAD
                  </div>
              )}
              {!isOffline && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold border border-green-200">
                      <Check size={12} />
                      STATUS: CLOUD SYNCED
                  </div>
              )}
          </div>
      </div>

      {/* Verification Card */}
      <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8 relative md:w-full">
         {/* Ticket jagged edge visual trick (top) */}
         <div className={`h-3 w-full relative ${isOffline ? 'bg-amber-900' : 'bg-gov-900'}`}>
            <div className="absolute bottom-[-6px] left-0 right-0 h-3 bg-white" style={{ clipPath: 'polygon(0% 50%, 5% 0%, 10% 50%, 15% 0%, 20% 50%, 25% 0%, 30% 50%, 35% 0%, 40% 50%, 45% 0%, 50% 50%, 55% 0%, 60% 50%, 65% 0%, 70% 50%, 75% 0%, 80% 50%, 85% 0%, 90% 50%, 95% 0%, 100% 50%, 100% 100%, 0% 100%)', transform: 'rotate(180deg)' }}></div>
         </div>
         
         <div className="p-8 space-y-6">
            <div className="flex justify-between items-center pb-6 border-b-2 border-gray-100 border-dashed">
              <span className="text-sm text-gray-500 uppercase font-bold tracking-wider">{isOffline ? 'Offline Token' : 'Verification ID'}</span>
              <span className="text-base font-mono font-bold text-gov-900">
                  {isOffline ? `AES:${Math.random().toString(36).substring(2, 8).toUpperCase()}...` : `TXN-${Math.floor(Math.random() * 10000)}-XJ2`}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
               <span className="text-sm text-gray-500 font-medium">Beneficiary</span>
               <div className="text-right">
                  <span className="text-base font-bold text-gov-900 block">{beneficiary.name}</span>
                  <span className="text-xs text-gray-400 font-mono">{beneficiary.ic}</span>
               </div>
            </div>

            <div className="flex justify-between items-center">
               <span className="text-sm text-gray-500 font-medium">Date & Time</span>
               <span className="text-sm font-bold text-gov-900 text-right">{new Date().toLocaleDateString()} <br/> {new Date().toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}</span>
            </div>
            
             <div className="flex justify-between items-center pt-6 border-t-2 border-gray-100">
               <span className="text-base font-bold text-gov-900">
                   Pension Amount
               </span>
               <span className={`text-xl font-black ${isOffline ? 'text-amber-600' : 'text-green-600'}`}>
                   {formatCurrency(totalPayout)}
               </span>
            </div>
         </div>

         {/* Verification Actions */}
         <div className="bg-gray-50 px-8 py-4 flex gap-4 border-t border-gray-100">
            <button className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-gov-700 py-3 rounded-xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-200">
               <Download size={16} />
               Save
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-gov-700 py-3 rounded-xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-200">
               <Share2 size={16} />
               Share
            </button>
         </div>
      </div>

      {/* Main Action */}
      <div className="mt-auto w-full md:w-full md:self-stretch">
        <button
          onClick={onReset}
          className="w-full py-6 text-xl bg-gov-900 text-white rounded-xl font-bold shadow-[0_6px_0_0_#020617] hover:shadow-[0_3px_0_0_#020617] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all flex items-center justify-center gap-3"
        >
          Next Verification
          <ArrowRight size={24} />
        </button>
      </div>
    </motion.div>
  );
};

export default SuccessScreen;