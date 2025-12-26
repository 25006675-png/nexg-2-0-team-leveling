import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Kampung } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import AlertModal from './AlertModal';

interface AgentGeoCheckProps {
  kampung: Kampung;
  onSuccess: () => void;
  isDevMode: boolean;
  isOffline?: boolean;
  onRequestSettings?: () => void;
}

type GeoStatus = 'IDLE' | 'SEARCHING' | 'FOUND' | 'VERIFYING' | 'SUCCESS' | 'FAILED';

const AgentGeoCheck: React.FC<AgentGeoCheckProps> = ({ kampung, onSuccess, isDevMode, isOffline, onRequestSettings }) => {
  const { t } = useLanguage();
  const [status, setStatus] = useState<GeoStatus>('IDLE');
  const [distance, setDistance] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showBypassAlert, setShowBypassAlert] = useState(false);

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

    const handleSuccess = (position: GeolocationPosition) => {
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

          setUserLocation({ lat: userLat, lng: userLng });

          const dist = calculateDistance(userLat, userLng, kampung.lat, kampung.lng);
          setDistance(Math.round(dist));

          // 500 meters threshold
          if (dist <= 500) {
             setTimeout(() => {
                setStatus('SUCCESS');
                // Removed automatic navigation
             }, 1000);
          } else {
             setStatus('FAILED');
             setErrorMsg(`${t.geo.outsideZone} (${Math.round(dist)}m)`);
             if (!isDevMode && onRequestSettings) {
                 setTimeout(() => setShowBypassAlert(true), 1000);
             }
          }
        }, 1500);
    };

    const handleError = (error: GeolocationPositionError) => {
        console.error(error);
        
        if (isDevMode) {
            // If Dev Mode is on, we ignore the error and simulate success with fake coordinates
            const fakePosition = {
                coords: {
                    latitude: kampung.lat,
                    longitude: kampung.lng,
                    accuracy: 10,
                    altitude: null,
                    altitudeAccuracy: null,
                    heading: null,
                    speed: null
                },
                timestamp: Date.now()
            } as GeolocationPosition;
            
            handleSuccess(fakePosition);
            return;
        }

        let msg = t.extra.unableRetrieveLoc;
        switch(error.code) {
            case error.PERMISSION_DENIED:
                msg = t.extra.locPermissionDenied;
                break;
            case error.POSITION_UNAVAILABLE:
                msg = t.extra.locUnavailable;
                break;
            case error.TIMEOUT:
                msg = t.extra.locTimeout;
                break;
        }
        setErrorMsg(msg);
        setStatus('FAILED');
        if (!isDevMode && onRequestSettings) {
            setTimeout(() => setShowBypassAlert(true), 500);
        }
    };

    // If Offline AND Dev Mode (Bypass) are ON, skip real GPS check entirely
    if (isOffline && isDevMode) {
        const fakePosition = {
            coords: {
                latitude: kampung.lat,
                longitude: kampung.lng,
                accuracy: 10,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null
            },
            timestamp: Date.now()
        } as GeolocationPosition;
        
        // Small delay to simulate "Searching"
        setTimeout(() => {
            handleSuccess(fakePosition);
        }, 1000);
        return;
    }

    if (!navigator.geolocation) {
      setErrorMsg(t.extra.geoNotSupported);
      setStatus('FAILED');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy: true, timeout: 45000, maximumAge: 0 }
    );
  };

  // Removed useEffect to prevent auto-start
  // useEffect(() => {
  //   startVerification();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col items-center justify-center p-8 bg-white md:bg-transparent"
    >
      <AlertModal
        isOpen={showBypassAlert}
        onClose={() => setShowBypassAlert(false)}
        title="Location Verification Failed"
        message="Would you like to enable Developer Mode to bypass location checks?"
        type="warning"
        actionLabel="Go to Settings"
        onAction={() => {
            setShowBypassAlert(false);
            if (onRequestSettings) onRequestSettings();
        }}
        cancelLabel="Cancel"
      />

      <div className="w-full max-w-sm text-center">
         
         <div className="relative w-64 h-64 mx-auto mb-10 flex items-center justify-center">
             {/* Radar Rings */}
             {status !== 'SUCCESS' && status !== 'FAILED' && status !== 'IDLE' && (
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
             {/* Removed absolute positioning to avoid overlap */}
         </div>

         <div className="space-y-4 mb-8">
             <h2 className="text-2xl font-bold text-gov-900">
                 {status === 'IDLE' && t.geo.zoneCheck}
                 {status === 'SEARCHING' && t.geo.verifying}
                 {status === 'FOUND' && t.geo.verifying}
                 {status === 'VERIFYING' && t.geo.verifying}
                 {status === 'SUCCESS' && t.geo.success}
                 {status === 'FAILED' && t.geo.failure}
             </h2>

             <p className="text-gray-500 text-sm">
                 {status === 'IDLE' && t.geo.zoneCheck}
                 {status === 'SEARCHING' && t.geo.verifying}
                 {status === 'FOUND' && t.geo.verifying}
                 {status === 'VERIFYING' && t.geo.verifying}
                 {status === 'SUCCESS' && t.geo.withinZone}
                 {status === 'FAILED' && (errorMsg || t.geo.outsideZone)}
             </p>

             {/* Coordinate Display */}
             {(status === 'VERIFYING' || status === 'SUCCESS' || status === 'FAILED') && userLocation && (
                 <div className="flex justify-center gap-3 w-full py-2">
                    <div className="bg-blue-900 text-white text-xs font-mono px-4 py-3 rounded-xl shadow-md text-center flex-1">
                        <span className="text-blue-300 text-xs uppercase block mb-1 font-bold tracking-wider">{t.extra.targetZone}</span>
                        <div className="font-bold text-sm">{Math.abs(kampung.lat).toFixed(5)}° {kampung.lat >= 0 ? 'N' : 'S'}</div>
                        <div className="font-bold text-sm">{Math.abs(kampung.lng).toFixed(5)}° {kampung.lng >= 0 ? 'E' : 'W'}</div>
                    </div>
                    <div className="bg-white border-2 border-gray-100 text-gray-700 text-xs font-mono px-4 py-3 rounded-xl shadow-md text-center flex-1">
                        <span className="text-gray-400 text-xs uppercase block mb-1 font-bold tracking-wider">{t.extra.you} {isDevMode && `(${t.geo.bypass})`}</span>
                        <div className="font-bold text-sm">{Math.abs(userLocation.lat).toFixed(5)}° {userLocation.lat >= 0 ? 'N' : 'S'}</div>
                        <div className="font-bold text-sm">{Math.abs(userLocation.lng).toFixed(5)}° {userLocation.lng >= 0 ? 'E' : 'W'}</div>
                    </div>
                 </div>
             )}
         </div>

         {/* Status Indicators */}
         <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col gap-3">
             <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-500">{t.extra.targetZone}</span>
                 <span className="font-bold text-gov-900">{kampung.name}</span>
             </div>
             <div className="h-px bg-gray-200 w-full" />
             <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-500">{t.geo.distance}</span>
                 <span className={`font-mono font-bold ${
                     status === 'SUCCESS' ? 'text-green-600' : 
                     status === 'FAILED' ? 'text-red-600' : 
                     'text-gray-400'
                 }`}>
                     {status === 'SEARCHING' || status === 'IDLE' ? '---' : (distance !== null ? `${distance}m` : 'CALC...')}
                 </span>
             </div>
             <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-500">{t.extra.geoFenceStatus}</span>
                 <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                     status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 
                     status === 'FAILED' ? 'bg-red-100 text-red-700' :
                     'bg-gray-200 text-gray-500'
                 }`}>
                     {status === 'SUCCESS' ? t.extra.inside : status === 'FAILED' ? t.extra.outside : t.extra.checking}
                 </span>
             </div>
         </div>

         {status === 'IDLE' && (
             <button 
                onClick={startVerification}
                className="mt-6 w-full py-3 bg-gov-900 text-white rounded-xl font-bold shadow-lg hover:bg-blue-800 transition-all"
             >
                 {t.geo.zoneCheck}
             </button>
         )}

         {status === 'SUCCESS' && (
             <button 
                onClick={onSuccess}
                className="mt-6 w-full py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
             >
                 <CheckCircle2 size={20} />
                 {t.geo.proceed}
             </button>
         )}

         {status === 'FAILED' && (
             <button 
                onClick={startVerification}
                className="mt-6 w-full py-3 bg-gov-900 text-white rounded-xl font-bold shadow-lg hover:bg-blue-800 transition-all"
             >
                 {t.geo.retry}
             </button>
         )}
      </div>
    </motion.div>
  );
};

export default AgentGeoCheck;