import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Fingerprint, UserCheck, Lock, CheckCircle2, Clock, ShieldCheck, ScanFace } from 'lucide-react';
import { Beneficiary } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import AlertModal from './AlertModal';

interface ResidentProfileProps {
  beneficiary: Beneficiary;
  onSelectMode: (mode: 'standard' | 'wakil') => void;
  onBack: () => void;
}

const ResidentProfile: React.FC<ResidentProfileProps> = ({ beneficiary, onSelectMode, onBack }) => {
  const { t } = useLanguage();
  const [showAlreadyVerifiedModal, setShowAlreadyVerifiedModal] = useState(false);
  
  // Logic: Card 2 is locked until Card 1 is completed
  // We check if serviceCount > 0 (meaning at least one verification done) OR if explicitly marked completed
  const isProofOfLifeComplete = (beneficiary.serviceCount && beneficiary.serviceCount > 0) || beneficiary.completed || false;

  const handleProofOfLifeClick = () => {
      if (isProofOfLifeComplete) {
          setShowAlreadyVerifiedModal(true);
      } else {
          onSelectMode('standard');
      }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col bg-gray-50"
    >
      <AlertModal 
        isOpen={showAlreadyVerifiedModal}
        onClose={() => setShowAlreadyVerifiedModal(false)}
        title="Verification Completed"
        message={`Biometric Proof of Life has already been successfully verified.\n\nTimestamp: ${beneficiary.lastScanDate || new Date().toLocaleString()}`}
        type="success"
        actionLabel="OK"
      />

      {/* Header */}
      <div className="bg-white px-6 pt-2 pb-6 border-b border-gray-200 shadow-sm shrink-0 z-10">
        <div className="flex items-center gap-4">
            <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
            >
            <ChevronLeft size={20} />
            </button>
            <div>
            <h2 className="text-2xl font-bold text-gov-900">{beneficiary.name}</h2>
            <div className="flex items-center gap-2 text-gray-500 font-mono text-sm">
                <span>{beneficiary.ic}</span>
                {isProofOfLifeComplete && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <CheckCircle2 size={10} /> Verified
                    </span>
                )}
            </div>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Card 1: Biometric Proof of Life */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleProofOfLifeClick}
            className="w-full bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-left relative overflow-hidden group"
          >
            <div className="flex items-start gap-5">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isProofOfLifeComplete ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                }`}>
                    {isProofOfLifeComplete ? <CheckCircle2 size={28} /> : <ScanFace size={28} />}
                </div>
                
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-gray-900">Pension Continuation</h3>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${
                            isProofOfLifeComplete 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                            {isProofOfLifeComplete ? 'VERIFIED' : 'PENDING'}
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                        Perform Proof of Life to release funds directly to your <strong className="text-gray-700">registered bank account</strong>.
                    </p>
                    
                    {isProofOfLifeComplete && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-green-600 font-medium">
                            <Clock size={14} />
                            <span>Verified on {beneficiary.lastScanDate || new Date().toLocaleDateString()}</span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Decorative accent */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                isProofOfLifeComplete ? 'bg-green-500' : 'bg-blue-500'
            }`} />
          </motion.button>

          {/* Card 2: Assign One-Time Wakil */}
          <motion.button
            disabled={!isProofOfLifeComplete}
            whileHover={isProofOfLifeComplete ? { scale: 1.01 } : {}}
            whileTap={isProofOfLifeComplete ? { scale: 0.99 } : {}}
            onClick={() => isProofOfLifeComplete && onSelectMode('wakil')}
            animate={{ 
                opacity: isProofOfLifeComplete ? 1 : 0.6,
                filter: isProofOfLifeComplete ? 'grayscale(0%)' : 'grayscale(100%)'
            }}
            transition={{ duration: 0.5 }}
            className={`w-full bg-white rounded-2xl p-6 shadow-sm border text-left relative overflow-hidden group ${
                isProofOfLifeComplete ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-200 cursor-not-allowed'
            }`}
          >
            <div className="flex items-start gap-5">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isProofOfLifeComplete ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
                }`}>
                    {isProofOfLifeComplete ? <UserCheck size={28} /> : <Lock size={28} />}
                </div>
                
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-gray-900">Wakil Withdrawal</h3>
                        {!isProofOfLifeComplete && (
                            <Lock size={16} className="text-gray-400" />
                        )}
                    </div>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                        Authorize a temporary Wakil to collect the <strong className="text-gray-700">current month's pension</strong> in cash. This mandate expires in <strong className="text-gray-700">72 hours</strong>.
                    </p>
                    
                    {!isProofOfLifeComplete ? (
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-bold text-gray-500">
                            <Lock size={12} />
                            Complete Proof of Life first
                        </div>
                    ) : (
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold">
                            <ShieldCheck size={12} />
                            Ready to Authorize
                        </div>
                    )}
                </div>
            </div>

            {/* Decorative accent */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                isProofOfLifeComplete ? 'bg-purple-500' : 'bg-gray-300'
            }`} />
            
            {/* Unlock Animation Glow */}
            {isProofOfLifeComplete && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: [0, 0.5, 0], scale: 1.5 }}
                    transition={{ duration: 1, repeat: 0 }}
                    className="absolute inset-0 bg-blue-400/20 pointer-events-none"
                />
            )}
          </motion.button>

        </div>
      </div>
    </motion.div>
  );
};

export default ResidentProfile;