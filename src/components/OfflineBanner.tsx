import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { isOnline, onNetworkChange } from '../utils/nativeFeatures';

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    isOnline().then(connected => setOffline(!connected));

    onNetworkChange(connected => setOffline(!connected)).then(fn => {
      cleanup = fn;
    });

    return () => { if (cleanup) cleanup(); };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[70] bg-gray-800 text-white text-xs font-medium py-2 px-4 flex items-center justify-center gap-2 animate-fade-in">
      <WifiOff className="w-4 h-4 text-rosa-400" />
      <span>Está offline — algumas funcionalidades podem estar limitadas. Os seus dados serão guardados.</span>
    </div>
  );
}
