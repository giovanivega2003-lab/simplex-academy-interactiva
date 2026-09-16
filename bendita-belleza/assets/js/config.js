/* Bendita Belleza — conexión con Google.
   ============================================================================

   Acá va la dirección del enlace de Google (el «Apps Script») que recibe las
   solicitudes de cita. Mientras esté vacía, el sitio funciona igual que
   siempre: las solicitudes se preparan y se mandan por WhatsApp, y el Libro
   de citas guarda todo solo en este navegador.

   Cuando pegues la dirección, se enciende la sincronización: las solicitudes
   de las clientas llegan solas a tu Hoja de cálculo y a tu Google Calendar, y
   el Libro de citas muestra lo mismo desde cualquier aparato.

   Cómo conseguir esa dirección: apps-script/GUIA.md

   Tiene que ser la que termina en /exec y se ve parecida a esto:
   https://script.google.com/macros/s/AKfycb.....................3Q/exec
   ========================================================================= */

window.BB = window.BB || {};

window.BB.config = {
  URL_SCRIPT: ''
};
