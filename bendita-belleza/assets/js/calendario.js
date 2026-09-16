/* Bendita Belleza — enlace con calendarios.

   Sin servidor no se puede crear un evento ni enviar un correo por cuenta
   propia. Lo que sí se puede, y es lo que hace este módulo:

   1. Armar un archivo .ics estándar (RFC 5545) que la clienta descarga. Es
      el camino que funciona en iPhone y Apple Calendar, y también en
      Android y Outlook.
   2. Armar el enlace de «añadir a Google Calendar», que abre el evento ya
      relleno en la cuenta de quien lo abre.
   3. Para la propietaria, el mismo enlace con el correo de la clienta como
      invitada: cuando Verónica guarda el evento, Google le envía a la
      clienta la invitación por correo. Ese correo lo manda Google, no este
      sitio. */
(function (global) {
  'use strict';

  var BB = global.BB;
  var ESTUDIO = BB.ESTUDIO;

  var LUGAR = ESTUDIO.nombre + ', ' + ESTUDIO.direccion + ', ' + ESTUDIO.ciudad;

  /* --- Marcas de tiempo ---------------------------------------------------- */

  /* 'AAAAMMDDTHHMMSSZ' a partir de un día y un minuto de Bolivia. */
  function marca(dia, minuto) {
    return new Date(BB.instante(dia, minuto)).toISOString()
      .replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  function marcaAhora() {
    return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  /* --- Texto del evento ---------------------------------------------------- */

  function titulo(cita) {
    return ESTUDIO.nombre + ' · ' + cita.serviceName;
  }

  function detalle(cita, paraDuena) {
    var lineas = [];
    lineas.push(paraDuena
      ? 'Cita de ' + cita.clientName + ' en ' + ESTUDIO.nombre + '.'
      : 'Tu cita en ' + ESTUDIO.nombre + ', con ' + ESTUDIO.duena + '.');
    lineas.push('');
    lineas.push('Servicio: ' + cita.serviceName
      + (cita.variantName && cita.variantName !== 'Servicio completo' ? ' — ' + cita.variantName : ''));
    if (cita.art) lineas.push('Diseño elaborado o pedrería: sí');
    lineas.push('Duración de referencia: ' + BB.duracionTexto(cita.duration));
    lineas.push('Precio de catálogo: ' + BB.precioTexto(cita.priceMin, cita.priceMax));
    if (paraDuena) {
      lineas.push('WhatsApp de la clienta: +' + cita.phone);
      if (cita.email) lineas.push('Correo: ' + cita.email);
    } else {
      lineas.push('WhatsApp del salón: ' + ESTUDIO.telefonoVisible);
    }
    if (cita.notes) lineas.push('Observaciones: ' + cita.notes);
    lineas.push('');
    if (cita.status === 'pending') {
      lineas.push(paraDuena
        ? 'Estado: por confirmar.'
        : 'Horario solicitado, a la espera de que el salón lo confirme por WhatsApp.');
    }
    lineas.push('Cómo llegar: ' + ESTUDIO.mapa);
    lineas.push('Referencia: ' + cita.id);
    return lineas.join('\n');
  }

  var ESTADO_ICS = {
    pending: 'TENTATIVE',
    confirmed: 'CONFIRMED',
    completed: 'CONFIRMED',
    cancelled: 'CANCELLED',
    block: 'CONFIRMED'
  };

  /* --- Archivo .ics -------------------------------------------------------- */

  /* Escape de valores TEXT según RFC 5545 §3.3.11. */
  function escapaIcs(valor) {
    return String(valor === null || valor === undefined ? '' : valor)
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n');
  }

  /* Plegado a 75 octetos (RFC 5545 §3.1). Se cuenta en bytes UTF-8, no en
     caracteres: los acentos ocupan dos y partir mal la línea rompe el
     archivo en los lectores estrictos, como el de iOS. */
  var codificador = global.TextEncoder ? new TextEncoder() : null;

  function octetos(texto) {
    return codificador ? codificador.encode(texto).length : texto.length;
  }

  function plegar(linea) {
    if (octetos(linea) <= 75) return linea;
    var salida = [];
    var actual = '';
    var cuenta = 0;
    var caracteres = Array.from(linea);
    for (var i = 0; i < caracteres.length; i++) {
      var c = caracteres[i];
      var n = octetos(c);
      if (cuenta + n > 75) {
        salida.push(actual);
        actual = ' ' + c;      // las líneas de continuación abren con espacio
        cuenta = 1 + n;
      } else {
        actual += c;
        cuenta += n;
      }
    }
    salida.push(actual);
    return salida.join('\r\n');
  }

  function textoIcs(cita, opciones) {
    opciones = opciones || {};
    var paraDuena = Boolean(opciones.paraDuena);
    var lineas = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Bendita Belleza//Agenda//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + escapaIcs(cita.id) + '@bendita-belleza',
      'DTSTAMP:' + marcaAhora(),
      'DTSTART:' + marca(cita.date, cita.start),
      'DTEND:' + marca(cita.date, cita.start + cita.duration),
      'SUMMARY:' + escapaIcs(titulo(cita)),
      'DESCRIPTION:' + escapaIcs(detalle(cita, paraDuena)),
      'LOCATION:' + escapaIcs(LUGAR),
      'URL:' + escapaIcs(ESTUDIO.mapa),
      'STATUS:' + (ESTADO_ICS[cita.status] || 'TENTATIVE'),
      'TRANSP:OPAQUE'
    ];
    if (cita.status !== 'cancelled') {
      lineas.push(
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'TRIGGER:-P1D',
        'DESCRIPTION:' + escapaIcs('Mañana tienes tu cita en ' + ESTUDIO.nombre),
        'END:VALARM',
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'TRIGGER:-PT2H',
        'DESCRIPTION:' + escapaIcs('Tu cita en ' + ESTUDIO.nombre + ' es en 2 horas'),
        'END:VALARM'
      );
    }
    lineas.push('END:VEVENT', 'END:VCALENDAR');
    return lineas.map(plegar).join('\r\n') + '\r\n';
  }

  function nombreArchivo(cita) {
    return 'Cita_Bendita_Belleza_' + cita.date + '_' + BB.textoHora(cita.start).replace(':', '') + '.ics';
  }

  function descargarIcs(cita, opciones) {
    var blob = new Blob([textoIcs(cita, opciones)], { type: 'text/calendar;charset=utf-8' });
    BB.descargarArchivo(blob, nombreArchivo(cita));
  }

  /* --- Google Calendar ----------------------------------------------------- */

  function urlGoogle(cita, opciones) {
    opciones = opciones || {};
    var parametros = [
      'action=TEMPLATE',
      'text=' + encodeURIComponent(titulo(cita)),
      'dates=' + marca(cita.date, cita.start) + '/' + marca(cita.date, cita.start + cita.duration),
      'details=' + encodeURIComponent(detalle(cita, Boolean(opciones.paraDuena))),
      'location=' + encodeURIComponent(LUGAR),
      'ctz=' + encodeURIComponent(ESTUDIO.zona)
    ];
    /* Con invitadas, Google envía la invitación por correo al guardar. */
    if (opciones.invitados && opciones.invitados.length) {
      parametros.push('add=' + encodeURIComponent(opciones.invitados.join(',')));
    }
    return 'https://calendar.google.com/calendar/render?' + parametros.join('&');
  }

  /* --- Correo -------------------------------------------------------------- */

  /* Validación deliberadamente permisiva: sirve para no guardar basura,
     no para decidir si una dirección existe. */
  function correoValido(valor) {
    if (typeof valor !== 'string') return false;
    var limpio = valor.trim();
    return limpio.length > 0 && limpio.length <= 254 && /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(limpio);
  }

  BB.calendario = {
    titulo: titulo,
    detalle: detalle,
    textoIcs: textoIcs,
    descargarIcs: descargarIcs,
    nombreArchivo: nombreArchivo,
    urlGoogle: urlGoogle,
    correoValido: correoValido
  };
})(window);
