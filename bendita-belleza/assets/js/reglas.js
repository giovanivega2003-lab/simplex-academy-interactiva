/* Bendita Belleza — reglas de la agenda.

   Los nombres de campo del registro se mantienen en inglés a propósito: son
   los mismos que usaba la versión anterior del sitio, así que los respaldos
   JSON que Verónica ya tenga se pueden restaurar aquí sin convertir nada. */
(function (global) {
  'use strict';

  var BB = global.BB;

  var ESTADOS = ['pending', 'confirmed', 'completed', 'cancelled', 'block'];

  var ETIQUETA_ESTADO = {
    pending: 'Por confirmar',
    confirmed: 'Confirmada',
    completed: 'Atendida',
    cancelled: 'Cancelada',
    block: 'Bloqueado'
  };

  function vacio() { return { version: 2, appointments: [], durations: {} }; }

  function ocupa(cita) { return cita.status !== 'cancelled'; }

  function solapan(a, b) {
    return a.date === b.date && a.start < b.start + b.duration && b.start < a.start + a.duration;
  }

  function choca(candidata, citas, exceptoId) {
    for (var i = 0; i < citas.length; i++) {
      var c = citas[i];
      if (c.id !== exceptoId && ocupa(c) && solapan(candidata, c)) return true;
    }
    return false;
  }

  /* Devuelve '' si la reserva es válida, o el motivo en palabras. */
  function errorReserva(dia, inicio, duracion, citas, exceptoId, ahora) {
    ahora = ahora || new Date();
    exceptoId = exceptoId || '';
    if (!BB.diaValido(dia)) return 'Elige una fecha válida.';
    var hoy = BB.diaLocal(ahora);
    if (dia < hoy || dia > BB.sumaDias(hoy, 180)) {
      return 'Elige una fecha entre hoy y los próximos 180 días.';
    }
    var horario = BB.atencion(dia);
    if (!horario) return 'Los domingos el salón está cerrado. Elige otro día.';
    if (!Number.isInteger(inicio) || !Number.isInteger(duracion) || duracion < 5
      || inicio < horario[0] || inicio + duracion > horario[1]) {
      return 'El servicio completo debe caber dentro del horario de atención: '
        + BB.textoHora(horario[0]) + ' a ' + BB.textoHora(horario[1]) + '.';
    }
    if (BB.instante(dia, inicio) <= ahora.getTime()) {
      return 'Esa hora ya pasó. Elige un horario posterior.';
    }
    if (choca({ date: dia, start: inicio, duration: duracion }, citas, exceptoId)) {
      return 'Ese horario ya está ocupado en esta agenda. Elige otro.';
    }
    return '';
  }

  /* Horas libres de un día, en pasos de 15 minutos. */
  function huecos(dia, duracion, citas, exceptoId, ahora) {
    if (!BB.diaValido(dia)) return [];
    var horario = BB.atencion(dia);
    if (!horario) return [];
    var libres = [];
    for (var m = horario[0]; m + duracion <= horario[1]; m += 15) {
      if (!errorReserva(dia, m, duracion, citas, exceptoId, ahora)) libres.push(m);
    }
    return libres;
  }

  /* Normaliza un teléfono boliviano o internacional a solo dígitos. */
  function telefono(crudo) {
    if (typeof crudo !== 'string' || !/^\+?[\d\s().-]+$/.test(crudo.trim())) return '';
    var digitos = crudo.replace(/\D/g, '');
    if (digitos.length === 8) digitos = '591' + digitos;
    return /^[1-9]\d{7,14}$/.test(digitos) ? digitos : '';
  }

  /* --- Respaldos ----------------------------------------------------------- */

  function leerRespaldo(valor) {
    var versionOk = valor && (valor.version === 1 || valor.version === 2);
    if (!versionOk || !Array.isArray(valor.appointments) || valor.appointments.length > 10000
      || !valor.durations || typeof valor.durations !== 'object' || Array.isArray(valor.durations)) {
      throw new Error('El archivo no es un respaldo compatible de Bendita Belleza.');
    }

    var resultado = vacio();

    for (var i = 0; i < BB.CATALOGO.length; i++) {
      var servicio = BB.CATALOGO[i];
      var duracion = valor.durations[servicio.id];
      if (duracion !== undefined) {
        if (!Number.isInteger(duracion) || duracion < 15 || duracion > 660 || duracion % 5 !== 0) {
          throw new Error('El respaldo contiene una duración inválida.');
        }
        resultado.durations[servicio.id] = duracion;
      }
    }

    var vistos = {};
    var corto = function (s, max) { return typeof s === 'string' && s.length <= max; };

    for (var j = 0; j < valor.appointments.length; j++) {
      var a = valor.appointments[j];
      /* El correo es opcional y no existía en la versión 1. */
      var correo = a && a.email === undefined ? '' : a && a.email;

      if (!a || !corto(a.id, 100) || !/^[a-zA-Z0-9-]+$/.test(a.id) || vistos[a.id]
        || ['appointment', 'block'].indexOf(a.kind) === -1 || !BB.diaValido(a.date)
        || !Number.isInteger(a.start) || !Number.isInteger(a.duration)
        || a.start < 0 || a.duration < 5 || a.start + a.duration > 1440
        || ESTADOS.indexOf(a.status) === -1 || !corto(a.clientName, 100) || !corto(a.phone, 20)
        || !corto(correo, 254) || !corto(a.notes, 1000)
        || !corto(a.createdAt, 40) || !Number.isFinite(Date.parse(a.createdAt))
        || !corto(a.serviceName, 150) || !corto(a.variantName, 100) || typeof a.art !== 'boolean'
        || !Number.isFinite(a.priceMin) || !Number.isFinite(a.priceMax)
        || a.priceMin < 0 || a.priceMax < a.priceMin || a.priceMax > 100000) {
        throw new Error('El respaldo contiene una cita inválida o repetida.');
      }

      if (correo && !BB.calendario.correoValido(correo)) {
        throw new Error('El respaldo contiene un correo electrónico inválido.');
      }

      if (a.kind === 'appointment') {
        var srv = BB.servicioPorId(a.serviceId);
        if (!srv || !Number.isInteger(a.variantIndex) || !srv.variantes[a.variantIndex]
          || !telefono(a.phone) || !a.clientName.trim() || a.status === 'block'
          || (a.art && !srv.diseno)) {
          throw new Error('No se pudo validar un servicio o teléfono del respaldo.');
        }
      } else if (['block', 'cancelled'].indexOf(a.status) === -1) {
        throw new Error('El respaldo contiene un bloqueo inválido.');
      }

      vistos[a.id] = true;
      resultado.appointments.push({
        id: a.id,
        kind: a.kind,
        serviceId: a.kind === 'block' ? '' : a.serviceId,
        variantIndex: a.kind === 'block' ? 0 : a.variantIndex,
        art: a.art,
        serviceName: a.serviceName,
        variantName: a.variantName,
        date: a.date,
        start: a.start,
        duration: a.duration,
        clientName: a.clientName,
        phone: a.phone,
        email: correo.trim(),
        notes: a.notes,
        status: a.status,
        createdAt: a.createdAt,
        priceMin: a.priceMin,
        priceMax: a.priceMax
      });
    }

    var activas = resultado.appointments.filter(ocupa)
      .sort(function (a, b) { return a.date.localeCompare(b.date) || a.start - b.start; });
    for (var k = 1; k < activas.length; k++) {
      if (solapan(activas[k - 1], activas[k])) {
        throw new Error('El respaldo tiene horarios superpuestos. Revisa las citas antes de importarlo.');
      }
    }

    return resultado;
  }

  /* --- Excel --------------------------------------------------------------- */

  function filasExcel(citas) {
    var cabecera = ['Código', 'Tipo', 'Clienta / motivo', 'WhatsApp', 'Correo', 'Servicio', 'Opción',
      'Fecha (Bolivia)', 'Hora inicio', 'Hora fin', 'Duración (min)', 'Precio mínimo (Bs)',
      'Precio máximo (Bs)', 'Diseño adicional', 'Estado', 'Observaciones', 'Creada (UTC)'];
    var filas = citas.slice().sort(function (a, b) {
      return a.date.localeCompare(b.date) || a.start - b.start;
    }).map(function (a) {
      return [
        a.id,
        a.kind === 'block' ? 'Bloqueo' : 'Cita',
        a.clientName,
        a.phone ? '+' + a.phone : '',
        a.email || '',
        a.serviceName,
        a.variantName,
        a.date,
        BB.textoHora(a.start),
        BB.textoHora(a.start + a.duration),
        a.duration,
        a.priceMin,
        a.priceMax,
        a.art ? 'Sí (+20 Bs incluidos)' : 'No',
        ETIQUETA_ESTADO[a.status],
        a.notes,
        a.createdAt
      ];
    });
    return [cabecera].concat(filas);
  }

  function identificador() {
    if (global.crypto && global.crypto.randomUUID) return 'BB-' + global.crypto.randomUUID();
    return 'BB-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
  }

  BB.reglas = {
    ESTADOS: ESTADOS,
    ETIQUETA_ESTADO: ETIQUETA_ESTADO,
    vacio: vacio,
    ocupa: ocupa,
    solapan: solapan,
    choca: choca,
    errorReserva: errorReserva,
    huecos: huecos,
    telefono: telefono,
    leerRespaldo: leerRespaldo,
    filasExcel: filasExcel,
    identificador: identificador
  };
})(window);
