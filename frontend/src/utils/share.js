import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { copyToClipboard } from './clipboard';

/**
 * Comparte un link de forma confiable.
 *
 * Dentro de la APK se usa el plugin NATIVO @capacitor/share, que abre el
 * selector real de Android (WhatsApp, Gmail, etc.) — la API web
 * (navigator.share) no siempre existe dentro de un WebView, así que
 * confiar solo en ella deja el botón "Reenviar" sin hacer nada.
 *
 * En el navegador se usa la API web si existe, y si no, se copia el
 * link al portapapeles como respaldo.
 *
 * @param {{ title?: string, text?: string, url: string }} payload
 * @returns {Promise<'shared'|'copied'|'failed'>}
 */
export async function shareLink({ title, text, url }) {
  if (!url) return 'failed';

  if (Capacitor.isNativePlatform()) {
    try {
      await Share.share({ title, text, url });
      return 'shared';
    } catch (err) {
      // El usuario cerró el selector nativo sin elegir nada — no es un
      // error real, no hace falta caer al respaldo de copiar.
      return 'shared';
    }
  }

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch (err) {
      return 'shared'; // igual: cierre manual del selector, no es error
    }
  }

  const copied = await copyToClipboard(url);
  return copied ? 'copied' : 'failed';
}
