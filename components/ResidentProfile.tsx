import React from 'react';
import { motion } from 'framer-motion';
import { User, Users, ChevronLeft, Shield, AlertTriangle } from 'lucide-react';
import { Beneficiary } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ResidentProfileProps {
  beneficiary: Beneficiary;
  onSelectMode: (mode: 'standard' | 'wakil') => void;
  onBack: () => void;
}

const ResidentProfile: React.FC<ResidentProfileProps> = ({ beneficiary, onSelectMode, onBack }) => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 shrink-0">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{beneficiary.name}</h2>
          <p className="text-gray-500 font-mono">{beneficiary.ic}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full max-h-[500px]">
          
          {/* Card A: Standard Proof of Life */}
          <button
            onClick={() => onSelectMode('standard')}
            className="relative group flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-green-100 bg-green-50/50 hover:bg-green-50 hover:border-green-300 transition-all duration-300 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <User className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Standard Proof of Life</h3>
            <p className="text-green-700/80 text-sm max-w-[200px]">
              For healthy pensioners who can perform biometric verification personally.
            </p>
            <div className="absolute top-6 right-6">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            </div>
          </button>

          {/* Card B: Appoint Representative / Wakil */}
          <button
            onClick={() => onSelectMode('wakil')}
            className="relative group flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-purple-100 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-purple-900 mb-2">Appoint Representative</h3>
            <p className="text-purple-700/80 text-sm max-w-[200px]">
              For bedridden pensioners. Requires legal declaration and representative verification.
            </p>
            <div className="absolute top-6 right-6">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
          </button>

        </div>
      </div>
    </motion.div>
  );
};

export default ResidentProfile;
