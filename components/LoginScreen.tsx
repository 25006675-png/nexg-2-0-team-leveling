"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronRight, Loader2, MapPin, Building2, Lock, Eye, EyeOff } from 'lucide-react';
import { Kampung } from '../types';
import { KAMPUNGS } from '../utils/mockData';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginScreenProps {
  onLogin: (kampung: Kampung) => void;
  agentId: string;
  setAgentId: (id: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, agentId, setAgentId }) => {
  const { t } = useLanguage();
  const [selectedKampungId, setSelectedKampungId] = useState<string>('');
  const [password, setPassword] = useState('pension123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedKampungId || !password) return;

    if (password !== 'pension123') {
        setError(t.extra.invalidPassword);
        return;
    }

    const kampung = KAMPUNGS.find(k => k.id === selectedKampungId);
    if (!kampung) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin(kampung);
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col items-center justify-center p-8 md:p-0 bg-gradient-to-b from-gov-50 to-white md:bg-none"
    >
      <div className="w-full max-w-sm space-y-8 md:bg-white md:p-8 md:rounded-3xl md:shadow-lg md:border md:border-gray-100">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center text-center space-y-4 md:hidden">
          <div className="w-24 h-24 bg-gov-900 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/20 mb-2">
            <Shield className="text-yellow-500 w-12 h-12" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gov-900">{t.common.appName}</h2>
            <p className="text-sm text-gray-500 mt-1">{t.extra.portal}</p>
          </div>
        </div>

        {/* Tablet Header */}
        <div className="hidden md:block mb-8">
            <h2 className="text-2xl font-bold text-gov-900">{t.login.welcome}</h2>
            <p className="text-gray-500 mt-1">{t.login.secureAccess}</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="space-y-5 mt-8">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gov-900 uppercase tracking-wide ml-1">
              {t.login.ketuaId}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Shield className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-gov-900 transition-all font-mono text-lg font-medium"
                placeholder="KK-XXXX-X"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gov-900 uppercase tracking-wide ml-1">
              {t.login.selectKampung}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={selectedKampungId}
                onChange={(e) => setSelectedKampungId(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-0 focus:border-gov-900 transition-all appearance-none font-bold text-lg truncate pr-8"
              >
                <option value="" disabled>{t.login.selectKampung}</option>
                {KAMPUNGS.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name}, {k.state}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                 <Building2 className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            {selectedKampungId && (
                <p className="text-xs text-blue-600 font-medium ml-1 pt-1 flex items-center gap-1">
                    <CheckIcon /> {t.extra.zoneActive}
                </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gov-900 uppercase tracking-wide ml-1">
              {t.extra.passkey}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-gov-900 transition-all font-mono text-lg font-medium tracking-widest"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gov-900 focus:outline-none cursor-pointer z-10"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
             {error && (
                <p className="text-xs text-red-500 font-bold ml-1 pt-1 animate-pulse">
                    {error}
                </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !selectedKampungId || !password}
            className="w-full flex items-center justify-center py-5 px-6 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-gov-900 hover:bg-gov-800 focus:outline-none focus:ring-4 focus:ring-gov-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-3 h-6 w-6" />
                {t.common.loading}
              </>
            ) : (
              <>
                {t.login.login}
                <ChevronRight className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 text-center">
          <p className="text-xs text-gray-400">
            {t.extra.authorizedOnly} <br/>
            {t.extra.gpsLogged}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
)

export default LoginScreen;