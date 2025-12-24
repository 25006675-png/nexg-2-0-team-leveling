import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, ToggleLeft, ToggleRight, Wifi, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsScreenProps {
  isDevMode: boolean;
  setIsDevMode: (val: boolean) => void;
  allowManualOfflineToggle: boolean;
  setAllowManualOfflineToggle: (val: boolean) => void;
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  isDevMode, 
  setIsDevMode, 
  allowManualOfflineToggle, 
  setAllowManualOfflineToggle, 
  onBack 
}) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col px-6 pt-2 pb-6 md:p-0"
    >
      <div className="mb-8 flex items-center gap-4">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gov-900">
            <ArrowLeft size={24} />
        </button>
        <div>
            <h2 className="text-2xl font-bold text-gov-900">{t.settings.title}</h2>
            <p className="text-gray-500 text-sm">{t.settings.configDesc}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
              <h3 className="font-bold text-gov-900 mb-1">{t.settings.language}</h3>
              <p className="text-xs text-gray-500">{t.settings.languageDesc}</p>
          </div>
          
          <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600`}>
                      <Globe size={20} />
                  </div>
                  <div>
                      <p className="font-medium text-gov-900">{language === 'en' ? t.settings.english : t.settings.malay}</p>
                      <p className="text-xs text-gray-500">{language === 'en' ? 'English' : 'Bahasa Melayu'}</p>
                  </div>
              </div>
              
              <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${language === 'en' ? 'bg-white text-gov-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    EN
                  </button>
                  <button 
                    onClick={() => setLanguage('ms')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${language === 'ms' ? 'bg-white text-gov-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    BM
                  </button>
              </div>
          </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
              <h3 className="font-bold text-gov-900 mb-1">{t.settings.devMode}</h3>
              <p className="text-xs text-gray-500">{t.settings.advancedTools}</p>
          </div>
          
          <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDevMode ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                      <Shield size={20} />
                  </div>
                  <div>
                      <p className="font-medium text-gov-900">{t.settings.locationBypass}</p>
                      <p className="text-xs text-gray-500">{t.settings.locationBypassDesc}</p>
                  </div>
              </div>
              
              <button 
                onClick={() => setIsDevMode(!isDevMode)}
                className={`transition-colors ${isDevMode ? 'text-red-500' : 'text-gray-300'}`}
              >
                  {isDevMode ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
              </button>
          </div>

          <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors border-t border-gray-100">
              <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${allowManualOfflineToggle ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                      <Wifi size={20} />
                  </div>
                  <div>
                      <p className="font-medium text-gov-900">{t.settings.manualOffline}</p>
                      <p className="text-xs text-gray-500">{t.settings.manualOfflineDesc}</p>
                  </div>
              </div>
              
              <button 
                onClick={() => setAllowManualOfflineToggle(!allowManualOfflineToggle)}
                className={`transition-colors ${allowManualOfflineToggle ? 'text-blue-500' : 'text-gray-300'}`}
              >
                  {allowManualOfflineToggle ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
              </button>
          </div>
      </div>

      <div className="mt-auto md:hidden">
          <button onClick={onBack} className="w-full py-3 bg-gray-100 text-gov-900 font-bold rounded-xl">
              {t.common.back}
          </button>
      </div>
    </motion.div>
  );
};

export default SettingsScreen;
