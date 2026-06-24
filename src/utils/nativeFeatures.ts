import { Capacitor } from '@capacitor/core';

export const isNative = () => Capacitor.isNativePlatform();

// ============ 📷 CÂMARA ============
// Tira uma foto (ou escolhe da galeria) e devolve em base64 (data URL)
export async function takePhoto(): Promise<string | null> {
  if (!isNative()) return null; // No browser, usa o input de ficheiro normal
  try {
    const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
    const photo = await Camera.getPhoto({
      quality: 70,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt, // pergunta: Câmara ou Galeria
      promptLabelHeader: 'Imagem de Referência',
      promptLabelPhoto: 'Escolher da Galeria',
      promptLabelPicture: 'Tirar Foto',
    });
    return photo.dataUrl || null;
  } catch (err) {
    console.warn('Camera cancelada ou indisponível:', err);
    return null;
  }
}

// ============ 📍 GPS / LOCALIZAÇÃO ============
// Devolve a morada aproximada a partir das coordenadas GPS
export async function getCurrentLocation(): Promise<string | null> {
  if (!isNative()) {
    // Tenta a geolocalização do navegador
    return getBrowserLocation();
  }
  try {
    const { Geolocation } = await import('@capacitor/geolocation');
    const perm = await Geolocation.requestPermissions();
    if (perm.location === 'denied') return null;

    const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
    return await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
  } catch (err) {
    console.warn('GPS indisponível:', err);
    return null;
  }
}

function getBrowserLocation(): Promise<string | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const addr = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        resolve(addr);
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

// Converte coordenadas em morada legível (usa OpenStreetMap, gratuito)
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=pt`
    );
    const data = await res.json();
    if (data?.display_name) return data.display_name;
  } catch { /* ignore */ }
  return `Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)}`;
}

// ============ 📤 PARTILHA NATIVA ============
export async function shareContent(title: string, text: string, url?: string): Promise<boolean> {
  // App nativa
  if (isNative()) {
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share({ title, text, url, dialogTitle: 'Partilhar' });
      return true;
    } catch (err) {
      console.warn('Partilha cancelada:', err);
      return false;
    }
  }
  // Browser com Web Share API (telemóveis modernos)
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return true;
    } catch { return false; }
  }
  // Fallback: abre o WhatsApp Web
  const waText = encodeURIComponent(`${text}${url ? ' ' + url : ''}`);
  window.open(`https://wa.me/?text=${waText}`, '_blank');
  return true;
}

// ============ 🔔 NOTIFICAÇÕES ============
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const perm = await LocalNotifications.requestPermissions();
    return perm.display === 'granted';
  } catch {
    return false;
  }
}

export async function sendLocalNotification(title: string, body: string) {
  if (!isNative()) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.schedule({
      notifications: [{
        id: Math.floor(Math.random() * 100000),
        title,
        body,
        smallIcon: 'ic_stat_icon_config_sample',
        iconColor: '#e8456b',
      }],
    });
  } catch (err) {
    console.warn('Notificação indisponível:', err);
  }
}

// ============ 💾 ESTADO DA REDE (OFFLINE) ============
export async function isOnline(): Promise<boolean> {
  if (!isNative()) return navigator.onLine;
  try {
    const { Network } = await import('@capacitor/network');
    const status = await Network.getStatus();
    return status.connected;
  } catch {
    return navigator.onLine;
  }
}

export async function onNetworkChange(callback: (connected: boolean) => void): Promise<() => void> {
  if (!isNative()) {
    const onlineHandler = () => callback(true);
    const offlineHandler = () => callback(false);
    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);
    return () => {
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', offlineHandler);
    };
  }
  try {
    const { Network } = await import('@capacitor/network');
    const handle = await Network.addListener('networkStatusChange', (status) => {
      callback(status.connected);
    });
    return () => handle.remove();
  } catch {
    return () => {};
  }
}
