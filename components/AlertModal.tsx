import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X, WifiOff, CloudUpload } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info' | 'offline';
  actionLabel?: string;
  onAction?: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info',
  actionLabel,
  onAction
}) => {
  const { t } = useLanguage();

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 size={48} className="text-green-500" />;
      case 'warning': return <AlertTriangle size={48} className="text-orange-500" />;
      case 'error': return <AlertTriangle size={48} className="text-red-500" />;
      case 'offline': return <WifiOff size={48} className="text-gray-500" />;
      default: return <Info size={48} className="text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-green-50';
      case 'warning': return 'bg-orange-50';
      case 'error': return 'bg-red-50';
      case 'offline': return 'bg-gray-100';
      default: return 'bg-blue-50';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className={`p-8 flex flex-col items-center text-center ${getBgColor()}`}>
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    {getIcon()}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{message}</p>
            </div>
            
            <div className="p-4 bg-white border-t border-gray-100">
                <button 
                    onClick={() => {
                        if (onAction) onAction();
                        onClose();
                    }}
                    className="w-full py-3 bg-gov-900 text-white rounded-xl font-bold text-sm hover:bg-gov-800 transition-colors shadow-lg shadow-blue-900/20"
                >
                    {actionLabel || t.common.dismiss}
                </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlertModal;
