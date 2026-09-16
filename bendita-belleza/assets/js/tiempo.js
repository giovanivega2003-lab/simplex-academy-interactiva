/* Bendita Belleza — fechas y horas, siempre en hora de Bolivia. */
(function (global) {
  'use strict';

  var BB = global.BB;
  var ZONA = BB.ESTUDIO.zona;
  var DESFASE = BB.ESTUDIO.desfase;

  /* El día de hoy en Bolivia, como 'AAAA-MM-DD'. */
  function diaLocal(ahora) {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(ahora || new Date());
  }

  function sumaDias(dia, n) {
    var d = new Date(dia + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }

  function diaValido(dia) {
    return typeof dia === 'string'
      && /^\d{4}-\d{2}-\d{2}$/.test(dia)
      && Number.isFinite(Date.parse(dia + 'T12:00:00Z'))
      && new Date(dia + 'T12:00:00Z').toISOString().slice(0, 10) === dia;
  }

  function etiquetaDia(dia) {
    return new Intl.DateTimeFormat('es-BO', {
      weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC'
    }).format(new Date(dia + 'T12:00:00Z'));
  }

  function etiquetaDiaLarga(dia) {
    return new Intl.DateTimeFormat('es-BO', {
      weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC'
    }).format(new Date(dia + 'T12:00:00Z'));
  }

  /* Minutos desde medianoche → 'HH:MM' */
  function textoHora(minutos) {
    var h = Math.floor(minutos / 60);
    var m = minutos % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  /* 'HH:MM' → minutos desde medianoche, o NaN */
  function valorHora(texto) {
    if (!/^\d{2}:\d{2}$/.test(texto)) return NaN;
    var partes = texto.split(':').map(Number);
    return partes[0] < 24 && partes[1] < 60 ? partes[0] * 60 + partes[1] : NaN;
  }

  /* Horario de atención del día: [apertura, cierre] en minutos, o null si cierra. */
  function atencion(dia) {
    var semana = new Date(dia + 'T12:00:00Z').getUTCDay();
    if (semana === 0) return null;            // domingo cerrado
    return [semana === 1 ? 480 : 540, 1200];  // lunes 08:00, resto 09:00; cierre 20:00
  }

  /* Instante real (epoch ms) de un día y minuto de Bolivia. */
  function instante(dia, minuto) {
    return new Date(dia + 'T' + textoHora(minuto) + ':00' + DESFASE).getTime();
  }

  BB.diaLocal = diaLocal;
  BB.sumaDias = sumaDias;
  BB.diaValido = diaValido;
  BB.etiquetaDia = etiquetaDia;
  BB.etiquetaDiaLarga = etiquetaDiaLarga;
  BB.textoHora = textoHora;
  BB.valorHora = valorHora;
  BB.atencion = atencion;
  BB.instante = instante;
})(window);
