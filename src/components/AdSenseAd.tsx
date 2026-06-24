import { useEffect, useState } from 'react';
import { isNative } from '../utils/nativeFeatures';

interface AdSenseAdProps {
  client?: string;
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  responsive?: 'true' | 'false';
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export default function AdSenseAd({
  client = 'ca-pub-2620818114191753', // Teu ID real de Editor do Google AdSense
  slot,
  format = 'auto',
  responsive = 'true',
  className = '',
}: AdSenseAdProps) {
  const [adError, setAdError] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);

  // No native app: never show ads (keeps it feeling like a real app, not a website)
  if (isNative()) return null;

  useEffect(() => {
    // Check if running on localhost (AdSense doesn't render ads on localhost)
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    ) {
      setIsLocalhost(true);
    }

    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (err) {
      console.warn('Google AdSense failed to load/render (this is normal if using an ad blocker):', err);
      setAdError(true);
    }
  }, [slot]);

  // If there's an error loading the ad or we are on localhost, display a beautiful, subtle placeholder
  // so the website maintains its premium look and feel.
  if (isLocalhost || adError) {
    return (
      <div className={`my-8 mx-auto max-w-4xl p-4 bg-gray-50 border border-gray-100 rounded-2xl text-center ${className}`}>
        <div className="text-[10px] text-gray-300 font-mono tracking-wider uppercase mb-1">
          Anúncio Google AdSense
        </div>
        <div className="h-24 flex items-center justify-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <p className="text-xs text-gray-400">
            {isLocalhost 
              ? 'Espaço Reservado para Anúncio (O AdSense não é exibido em localhost)' 
              : 'Espaço de Publicidade'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`my-8 mx-auto max-w-4xl overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
