import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface NetworkStatusProps {
  isOffline: boolean;
  onToggle?: () => void;
  allowToggle?: boolean;
  className?: string;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ isOffline, onToggle, allowToggle = false, className = '' }) => {
  const { t } = useLanguage();

  return (
    <div 
        onClick={() => allowToggle && onToggle && onToggle()}
        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all shadow-sm ${
            isOffline 
            ? 'bg-red-100 border-red-200 text-red-600' 
            : 'bg-green-100 border-green-200 text-green-700'
        } ${allowToggle ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
    >
        {isOffline ? <WifiOff size={16} /> : <Wifi size={16} />}
        <span className="text-[10px] font-bold mt-1 uppercase">{isOffline ? t.common.offline : t.common.online}</span>
    </div>
  );
};

export default NetworkStatus;
