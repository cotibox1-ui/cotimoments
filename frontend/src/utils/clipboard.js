/**
 * Copia texto al portapapeles de forma confiable. La API moderna
 * (navigator.clipboard.writeText) puede fallar en silencio dentro del
 * WebView de la APK (sin permisos, sin foco, o sin soporte) — cuando eso
 * pasa, se usa un respaldo clásico con un <textarea> oculto y
 * document.execCommand('copy'), que funciona en casi cualquier WebView.
 *
 * @param {string} text
 * @returns {Promise<boolean>} true si se copió de verdad, false si falló
 */
export async function copyToClipboard(text) {
  if (!text) return false;

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
