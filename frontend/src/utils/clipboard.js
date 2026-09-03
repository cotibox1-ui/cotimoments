import { Capacitor } from '@capacitor/core';
import { Clipboard } from '@capacitor/clipboard';

/**
 * Copia texto al portapapeles de forma confiable.
 *
 * Dentro de la APK se usa el plugin NATIVO @capacitor/clipboard —
 * las APIs web (navigator.clipboard, document.execCommand) son poco
 * confiables dentro de un WebView de Android y suelen fallar en
 * silencio, sin lanzar ningún error.
 *
 * En el navegador (web normal) se usa la API moderna del navegador, con
 * un respaldo clásico (execCommand) para navegadores más viejos.
 *
 * @param {string} text
 * @returns {Promise<boolean>} true si se copió de verdad, false si falló
 */
export async function copyToClipboard(text) {
  if (!text) return false;

  if (Capacitor.isNativePlatform()) {
    try {
      await Clipboard.write({ string: text });
      return true;
    } catch (err) {
      return false;
    }
  }

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // sigue al respaldo de abajo
    }
  }

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
}
