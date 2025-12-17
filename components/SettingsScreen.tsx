import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, ToggleLeft, ToggleRight } from 'lucide-react';

interface SettingsScreenProps {
  isDevMode: boolean;
  setIsDevMode: (val: boolean) => void;
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ isDevMode, setIsDevMode, onBack }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col p-6 md:p-0"
    >
      <div className="mb-8 flex items-center gap-4">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gov-900">
            <ArrowLeft size={24} />
        </button>
        <div>
            <h2 className="text-2xl font-bold text-gov-900">Settings</h2>
            <p className="text-gray-500 text-sm">Application configuration and developer tools.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
              <h3 className="font-bold text-gov-900 mb-1">Developer Options</h3>
              <p className="text-xs text-gray-500">Advanced tools for testing and debugging.</p>
          </div>
          
          <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDevMode ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                      <Shield size={20} />
                  </div>
                  <div>
                      <p className="font-medium text-gov-900">Developer Mode</p>
                      <p className="text-xs text-gray-500">Bypass GPS restrictions and simulate location.</p>
                  </div>
              </div>
              
              <button 
                onClick={() => setIsDevMode(!isDevMode)}
                className={`transition-colors ${isDevMode ? 'text-red-500' : 'text-gray-300'}`}
              >
                  {isDevMode ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
              </button>
          </div>
      </div>

      <div className="mt-auto md:hidden">
          <button onClick={onBack} className="w-full py-3 bg-gray-100 text-gov-900 font-bold rounded-xl">
              Close Settings
          </button>
      </div>
    </motion.div>
  );
};

export default SettingsScreen;
