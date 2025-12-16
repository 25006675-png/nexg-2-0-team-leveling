import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Kampung } from '../types';

interface AgentGeoCheckProps {
  kampung: Kampung;
  onSuccess: () => void;
  isDevMode: boolean;
}

type GeoStatus = 'SEARCHING' | 'FOUND' | 'VERIFYING' | 'SUCCESS' | 'FAILED';

const AgentGeoCheck: React.FC<AgentGeoCheckProps> = ({ kampung, onSuccess, isDevMode }) => {
  const [status, setStatus] = useState<GeoStatus>('SEARCHING');
  const [distance, setDistance] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Haversine formula to calculate distance in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const startVerification = () => {
    setStatus('SEARCHING');
    setErrorMsg('');
    setDistance(null);

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser');
      setStatus('FAILED');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatus('FOUND');
        
        // Simulate a small delay for "Verifying" animation
        setTimeout(() => {
          setStatus('VERIFYING');
          
          let userLat = position.coords.latitude;
          let userLng = position.coords.longitude;

          if (isDevMode) {
            // Override with Kampung coordinates
            userLat = kampung.lat;
            userLng = kampung.lng;
          }

          const dist = calculateDistance(userLat, userLng, kampung.lat, kampung.lng);
          setDistance(Math.round(dist));

          // 500 meters threshold
          if (dist <= 500) {
             setTimeout(() => {
                setStatus('SUCCESS');
                setTimeout(onSuccess, 1500);
             }, 1000);
          } else {
             setStatus('FAILED');
             setErrorMsg(`You are ${Math.round(dist)}m away. Must be within 500m.`);
          }
        }, 1500);
      },
      (error) => {
        console.error(error);
        setErrorMsg('Unable to retrieve your location. Please enable GPS.');
        setStatus('FAILED');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    startVerification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
             {status !== 'SUCCESS' && status !== 'FAILED' && (
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
                className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center shadow-xl transition-all duration-500 ${
                    status === 'SUCCESS' ? 'bg-green-500 shadow-green-500/30' : 
                    status === 'FAILED' ? 'bg-red-500 shadow-red-500/30' :
                    'bg-white border-4 border-blue-100'
                }`}
                animate={status === 'SUCCESS' || status === 'FAILED' ? { scale: 1.1 } : { scale: 1 }}
             >
                 {status === 'SUCCESS' ? (
                     <CheckCircle2 size={64} className="text-white" />
                 ) : status === 'FAILED' ? (
                     <AlertTriangle size={64} className="text-white" />
                 ) : (
                     <MapPin size={48} className="text-blue-600 animate-bounce" />
                 )}
             </motion.div>

             {/* Connecting Line Simulation */}
             {status === 'VERIFYING' && (
                 <div className="absolute top-0 right-0 bg-gov-900 text-white text-[10px] font-mono px-2 py-1 rounded">
                     LAT: {kampung.lat.toFixed(3)}<br/>LNG: {kampung.lng.toFixed(3)}
                 </div>
             )}
         </div>

         <div className="space-y-2 mb-8">
             <h2 className="text-2xl font-bold text-gov-900">
                 {status === 'SEARCHING' && 'Locating Agent...'}
                 {status === 'FOUND' && 'GPS Signal Locked'}
                 {status === 'VERIFYING' && 'Verifying Zone...'}
                 {status === 'SUCCESS' && 'Access Granted'}
                 {status === 'FAILED' && 'Access Denied'}
             </h2>
             <p className="text-gray-500 text-sm">
                 {status === 'SEARCHING' && 'Please stand still while we acquire your position.'}
                 {status === 'FOUND' && 'Comparing location with registered Kampung boundary.'}
                 {status === 'VERIFYING' && `Ensuring you are physically present in ${kampung.name}.`}
                 {status === 'SUCCESS' && 'You are within the authorized zone.'}
                 {status === 'FAILED' && (errorMsg || 'You are outside the authorized zone.')}
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
                 <span className={`font-mono font-bold ${
                     status === 'SUCCESS' ? 'text-green-600' : 
                     status === 'FAILED' ? 'text-red-600' : 
                     'text-gray-400'
                 }`}>
                     {status === 'SEARCHING' ? '---' : (distance !== null ? `${distance}m` : 'CALC...')}
                 </span>
             </div>
             <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-500">Geo-Fence Status</span>
                 <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                     status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 
                     status === 'FAILED' ? 'bg-red-100 text-red-700' :
                     'bg-gray-200 text-gray-500'
                 }`}>
                     {status === 'SUCCESS' ? 'INSIDE' : status === 'FAILED' ? 'OUTSIDE' : 'CHECKING'}
                 </span>
             </div>
         </div>

         {status === 'FAILED' && (
             <button 
                onClick={startVerification}
                className="mt-6 w-full py-3 bg-gov-900 text-white rounded-xl font-bold shadow-lg hover:bg-blue-800 transition-all"
             >
                 Retry Verification
             </button>
         )}
      </div>
    </motion.div>
  );
};

export default AgentGeoCheck;