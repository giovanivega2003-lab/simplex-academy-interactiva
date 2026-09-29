/* Bendita Belleza — conexión con Google.
   ============================================================================

   Acá va la dirección del enlace de Google (el «Apps Script») que recibe las
   solicitudes de cita.

   AHORA MISMO ESTÁ APAGADA, a propósito. Con la dirección vacía el sitio
   funciona como al principio: la solicitud se prepara y se manda por
   WhatsApp, y el Libro de citas guarda todo en este navegador. Nada queda a
   la espera de Google, así que nada se cuelga.

   Cuando volvamos a encender la sincronización, se pega acá la dirección
   nueva y listo: las solicitudes empiezan a llegar solas a la Hoja de cálculo
   y a Google Calendar, y el Libro se ve igual desde cualquier aparato.

   Cómo conseguir esa dirección: apps-script/GUIA.md

   Tiene que ser la que termina en /exec y se ve parecida a esto:
   https://script.google.com/macros/s/AKfycb.....................3Q/exec
   ========================================================================= */

window.BB = window.BB || {};

window.BB.config = {
  URL_SCRIPT: ''
};
