import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { copyToClipboard } from './clipboard';

const NATIVE_TIMEOUT_MS = 4000; // el selector nativo de compartir puede tardar un poco más en abrir

function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);
}

/**
 * Comparte un link de forma confiable.
 *
 * Dentro de la APK se usa el plugin NATIVO @capacitor/share, que abre el
 * selector real de Android (WhatsApp, Gmail, etc.) — la API web
 * (navigator.share) no siempre existe dentro de un WebView, así que
 * confiar solo en ella deja el botón "Reenviar" sin hacer nada. Si el
 * plugin nativo tampoco responde a tiempo (plugin mal registrado), se
 * cae al respaldo de copiar en vez de quedarse esperando para siempre.
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
      await withTimeout(Share.share({ title, text, url }), NATIVE_TIMEOUT_MS);
      return 'shared';
    } catch (err) {
      if (err?.message === 'timeout') {
        // El plugin no respondió a tiempo — probablemente no está bien
        // registrado en esta APK. Se cae al respaldo de copiar.
        const copied = await copyToClipboard(url);
        return copied ? 'copied' : 'failed';
      }
      // Cualquier otro error suele ser el usuario cerrando el selector
      // nativo sin elegir nada — no hace falta molestarlo con un
      // respaldo de copiar para eso.
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
