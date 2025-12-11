import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Radar, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Kampung } from '../types';

interface AgentGeoCheckProps {
  kampung: Kampung;
  onSuccess: () => void;
}

type GeoStatus = 'SEARCHING' | 'FOUND' | 'VERIFYING' | 'SUCCESS';

const AgentGeoCheck: React.FC<AgentGeoCheckProps> = ({ kampung, onSuccess }) => {
  const [status, setStatus] = useState<GeoStatus>('SEARCHING');

  useEffect(() => {
    // Stage 1: Searching for GPS
    const timer1 = setTimeout(() => setStatus('FOUND'), 1500);
    // Stage 2: Verifying against Kampung Coordinates
    const timer2 = setTimeout(() => setStatus('VERIFYING'), 3000);
    // Stage 3: Success
    const timer3 = setTimeout(() => setStatus('SUCCESS'), 5000);
    // Stage 4: Navigate
    const timer4 = setTimeout(() => onSuccess(), 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onSuccess]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col items-center justify-center p-8 bg-white md:bg-transparent"
    >
      <div className="w-full max-w-sm text-center">
         
         <div className="relative w-64 h-64 mx-auto mb-10 flex items-center justify-center">
             {/* Radar Rings */}
             {status !== 'SUCCESS' && (
                <>
                    <motion.div 
                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 border-2 border-blue-500 rounded-full"
                    />
                    <motion.div 
                        animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                        transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                        className="absolute inset-0 border border-blue-300 rounded-full"
                    />
                </>
             )}

             {/* Center Icon */}
             <motion.div 
                className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center shadow-xl transition-all duration-500 ${status === 'SUCCESS' ? 'bg-green-500 shadow-green-500/30' : 'bg-white border-4 border-blue-100'}`}
                animate={status === 'SUCCESS' ? { scale: 1.1 } : { scale: 1 }}
             >
                 {status === 'SUCCESS' ? (
                     <CheckCircle2 size={64} className="text-white" />
                 ) : (
                     <MapPin size={48} className="text-blue-600 animate-bounce" />
                 )}
             </motion.div>

             {/* Connecting Line Simulation */}
             {status === 'VERIFYING' && (
                 <div className="absolute top-0 right-0 bg-gov-900 text-white text-[10px] font-mono px-2 py-1 rounded">
                     LAT: 3.145<br/>LNG: 101.55
                 </div>
             )}
         </div>

         <div className="space-y-2 mb-8">
             <h2 className="text-2xl font-bold text-gov-900">
                 {status === 'SEARCHING' && 'Locating Agent...'}
                 {status === 'FOUND' && 'GPS Signal Locked'}
                 {status === 'VERIFYING' && 'Verifying Zone...'}
                 {status === 'SUCCESS' && 'Access Granted'}
             </h2>
             <p className="text-gray-500 text-sm">
                 {status === 'SEARCHING' && 'Please stand still while we acquire your position.'}
                 {status === 'FOUND' && 'Comparing location with registered Kampung boundary.'}
                 {status === 'VERIFYING' && `Ensuring you are physically present in ${kampung.name}.`}
                 {status === 'SUCCESS' && 'You are within the authorized zone.'}
             </p>
         </div>

         {/* Status Indicators */}
         <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col gap-3">
             <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-500">Target Zone</span>
                 <span className="font-bold text-gov-900">{kampung.name}</span>
             </div>
             <div className="h-px bg-gray-200 w-full" />
             <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-500">Distance to Center</span>
                 <span className={`font-mono font-bold ${status === 'SUCCESS' ? 'text-green-600' : 'text-gray-400'}`}>
                     {status === 'SEARCHING' ? '---' : status === 'FOUND' ? 'CALC...' : '45m'}
                 </span>
             </div>
             <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-500">Geo-Fence Status</span>
                 <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                     status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                 }`}>
                     {status === 'SUCCESS' ? 'INSIDE' : 'CHECKING'}
                 </span>
             </div>
         </div>
      </div>
    </motion.div>
  );
};

export default AgentGeoCheck;