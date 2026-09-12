import { Capacitor } from '@capacitor/core';
import { Clipboard } from '@capacitor/clipboard';

// Si el plugin nativo no quedó bien registrado en la APK (pasa cuando
// Android Studio no recompila del todo tras agregar un plugin nuevo), la
// llamada puede quedarse esperando una respuesta que nunca llega — ni
// éxito ni error, en silencio total. Con este límite de tiempo, en vez de
// quedarse colgado para siempre, se cae al respaldo web.
const NATIVE_TIMEOUT_MS = 2500;

function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);
}

const webFallbackCopy = (text) => {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    return false;
  }
};

/**
 * Copia texto al portapapeles de forma confiable.
 *
 * Dentro de la APK se usa el plugin NATIVO @capacitor/clipboard —
 * las APIs web (navigator.clipboard, document.execCommand) son poco
 * confiables dentro de un WebView de Android y suelen fallar en
 * silencio, sin lanzar ningún error. Si el plugin nativo tampoco
 * responde a tiempo (plugin mal registrado), se cae al respaldo web
 * clásico en vez de quedarse esperando para siempre.
 *
 * En el navegador (web normal) se usa la API moderna del navegador, con
 * el mismo respaldo clásico para navegadores más viejos.
 *
 * @param {string} text
 * @returns {Promise<{ok: boolean, detail: string}>} detail explica qué
 *   método se usó, o el error técnico real si todo falló — para poder
 *   diagnosticar la causa exacta en vez de adivinar.
 */
export async function copyToClipboard(text) {
  if (!text) return { ok: false, detail: 'Sin texto para copiar.' };

  if (Capacitor.isNativePlatform()) {
    try {
      await withTimeout(Clipboard.write({ string: text }), NATIVE_TIMEOUT_MS);
      return { ok: true, detail: 'plugin nativo' };
    } catch (err) {
      // el plugin falló o no respondió a tiempo — se intenta el respaldo
      // web clásico, que en algunos WebViews de Android sí funciona
      // aunque el plugin nativo no esté bien registrado.
      const nativeErrorMsg = err?.message || String(err);
      const fallbackOk = webFallbackCopy(text);
      return {
        ok: fallbackOk,
        detail: fallbackOk
          ? `respaldo web (el plugin nativo falló: ${nativeErrorMsg})`
          : `plugin nativo falló: ${nativeErrorMsg} — respaldo web también falló`,
      };
    }
  }

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return { ok: true, detail: 'API del navegador' };
    } catch (err) {
      // sigue al respaldo de abajo
    }
  }

  const fallbackOk = webFallbackCopy(text);
  return { ok: fallbackOk, detail: fallbackOk ? 'respaldo web' : 'todos los métodos fallaron' };
}
