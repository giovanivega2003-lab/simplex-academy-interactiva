/**
 * Bendita Belleza — enlace entre el sitio web y Google.
 *
 * Este archivo corre en la cuenta de Google de Verónica, no en el sitio.
 * Hace tres cosas:
 *
 *   1. Recibe las solicitudes de cita que mandan las clientas y las anota en
 *      la Hoja de cálculo.
 *   2. Crea el evento en Google Calendar e invita a la clienta por correo,
 *      así le llega el aviso al teléfono sin que nadie escriba nada.
 *   3. Le devuelve la agenda al Libro de citas, para que se vea igual desde
 *      el teléfono, la tablet o la computadora.
 *
 * Instrucciones de instalación: ver GUIA.md
 */

/* ===================================================================
   LO ÚNICO QUE HAY QUE CAMBIAR
   =================================================================== */

/**
 * Clave de administración. La escribís acá y la misma tenés que escribir
 * una vez en el Libro de citas cuando te la pida.
 *
 * Es la que protege tu agenda: sin ella, nadie puede leer tus citas ni
 * cambiarles el estado a través de este enlace. Cambiá el texto de abajo por
 * algo tuyo, largo y difícil de adivinar. NO uses la misma que la clave con
 * la que abrís el Libro.
 */
var CLAVE_ADMIN = 'cambiá-esto-por-una-clave-larga-y-tuya';

/** Nombre de la hoja donde se anotan las citas. Se crea sola. */
var HOJA = 'Citas';

/** Zona horaria del salón. Bolivia no cambia de hora en todo el año. */
var DESFASE = '-04:00';

/** Datos del salón, para el texto de los eventos del calendario. */
var ESTUDIO = {
  nombre: 'Bendita Belleza',
  duena: 'Verónica Ribera',
  telefono: '+591 75323254',
  lugar: 'Bendita Belleza, Mercado Estación Argentina · Cuarto anillo, sector Tres Pasos al Frente, Santa Cruz de la Sierra, Bolivia',
  mapa: 'https://maps.app.goo.gl/kN8Gx93rWEbwNGDp6'
};

/* ===================================================================
   De acá para abajo no hace falta tocar nada
   =================================================================== */

var COLUMNAS = ['id', 'kind', 'serviceId', 'variantIndex', 'serviceName', 'variantName',
  'art', 'date', 'start', 'duration', 'clientName', 'phone', 'email', 'notes',
  'status', 'createdAt', 'priceMin', 'priceMax', 'eventoId'];

var ESTADOS = ['pending', 'confirmed', 'completed', 'cancelled', 'block'];

/* --- Entrada ------------------------------------------------------- */

function doPost(e) {
  var candado = LockService.getScriptLock();
  try {
    candado.waitLock(25000);
  } catch (error) {
    return responder({ ok: false, error: 'El servidor está ocupado. Probá de nuevo en unos segundos.' });
  }

  try {
    var peticion = JSON.parse(e.postData.contents);
    var accion = String(peticion.accion || '');

    /* «solicitar» es la única acción pública: es la que usa la página de las
       clientas. Todo lo demás exige la clave de administración. */
    if (accion !== 'solicitar' && peticion.clave !== CLAVE_ADMIN) {
      return responder({ ok: false, error: 'Clave de administración incorrecta.' });
    }

    switch (accion) {
      case 'solicitar': return responder(solicitar(peticion.cita));
      case 'ping':      return responder({ ok: true, version: 3, hoja: hoja().getName() });
      case 'listar':    return responder(listar(peticion.desde));
      case 'guardar':   return responder(guardar(peticion.cita));
      case 'estado':    return responder(cambiarEstado(peticion.id, peticion.estado));
      case 'mover':     return responder(mover(peticion.id, peticion.date, peticion.start));
      case 'correo':    return responder(ponerCorreo(peticion.id, peticion.email));
      default:          return responder({ ok: false, error: 'Acción desconocida: ' + accion });
    }
  } catch (error) {
    return responder({ ok: false, error: String(error && error.message || error) });
  } finally {
    candado.releaseLock();
  }
}

function doGet() {
  return responder({
    ok: true,
    mensaje: 'Enlace de Bendita Belleza funcionando. Esta dirección es la que hay que pegar en el sitio.'
  });
}

function responder(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}

/* --- La hoja ------------------------------------------------------- */

/* Dónde anota las citas.

   Funciona de las dos maneras. Si este script vive adentro de una Hoja de
   cálculo, usa esa. Si es un script suelto —creado en script.new—, busca la
   suya y, la primera vez, la crea él mismo. El identificador queda guardado
   en el propio proyecto, así que siempre vuelve a la misma planilla.

   Que sepa crearla no es un lujo: si la hoja se borra por error o Google la
   bloquea, el enlace sigue anotando en una nueva en vez de dejar de recibir
   citas. Perder un evento del calendario es molesto; perder la cita de una
   clienta sería grave. */
var CLAVE_LIBRO = 'bendita_belleza_libro';
var NOMBRE_LIBRO = 'Agenda Bendita Belleza';

function libro() {
  var propio = SpreadsheetApp.getActiveSpreadsheet();
  if (propio) return propio;

  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty(CLAVE_LIBRO);
  if (id) {
    try {
      return SpreadsheetApp.openById(id);
    } catch (error) {
      props.deleteProperty(CLAVE_LIBRO);
    }
  }

  var nuevo = SpreadsheetApp.create(NOMBRE_LIBRO);
  props.setProperty(CLAVE_LIBRO, nuevo.getId());
  return nuevo;
}

function hoja() {
  var l = libro();
  var h = l.getSheetByName(HOJA);
  if (!h) {
    h = l.insertSheet(HOJA);
    h.appendRow(COLUMNAS);
    h.setFrozenRows(1);
    h.getRange(1, 1, 1, COLUMNAS.length).setFontWeight('bold');
    /* Una planilla recién creada trae una pestaña vacía de fábrica. Si sigue
       ahí y sin nada escrito, se saca: así la hoja se abre directamente en
       las citas y no en una pestaña en blanco. */
    l.getSheets().forEach(function (otra) {
      if (otra.getSheetId() !== h.getSheetId() && otra.getLastRow() === 0 && otra.getLastColumn() === 0) {
        l.deleteSheet(otra);
      }
    });
  }
  if (h.getLastRow() === 0) {
    h.appendRow(COLUMNAS);
    h.setFrozenRows(1);
  }
  return h;
}

function filas() {
  var h = hoja();
  if (h.getLastRow() < 2) return [];
  var datos = h.getRange(2, 1, h.getLastRow() - 1, COLUMNAS.length).getValues();
  return datos.map(function (fila, i) {
    var cita = {};
    COLUMNAS.forEach(function (col, j) { cita[col] = fila[j]; });
    cita._fila = i + 2;
    return normalizar(cita);
  });
}

/* La hoja devuelve números y textos mezclados; acá se dejan con el tipo que
   el sitio espera. */
function normalizar(c) {
  c.variantIndex = Number(c.variantIndex) || 0;
  c.start = Number(c.start) || 0;
  c.duration = Number(c.duration) || 0;
  c.priceMin = Number(c.priceMin) || 0;
  c.priceMax = Number(c.priceMax) || 0;
  c.art = c.art === true || c.art === 'true' || c.art === 'Sí';
  c.date = textoFecha(c.date);
  ['id', 'kind', 'serviceId', 'serviceName', 'variantName', 'clientName', 'phone',
    'email', 'notes', 'status', 'createdAt', 'eventoId'].forEach(function (k) {
    c[k] = c[k] === null || c[k] === undefined ? '' : String(c[k]);
  });
  return c;
}

/* La hoja a veces convierte '2026-09-16' en un objeto Date. */
function textoFecha(valor) {
  if (valor instanceof Date) {
    return Utilities.formatDate(valor, 'UTC', 'yyyy-MM-dd');
  }
  return String(valor || '').slice(0, 10);
}

function buscarFila(id) {
  var todas = filas();
  for (var i = 0; i < todas.length; i++) {
    if (todas[i].id === id) return todas[i];
  }
  return null;
}

function escribirFila(numeroFila, cita) {
  var valores = COLUMNAS.map(function (col) {
    var v = cita[col];
    if (col === 'date') return "'" + textoFecha(v);   // apóstrofo: que no lo lea como fecha
    return v === undefined || v === null ? '' : v;
  });
  hoja().getRange(numeroFila, 1, 1, COLUMNAS.length).setValues([valores]);
}

/* --- Validación ---------------------------------------------------- */

function limpiar(texto, max) {
  return String(texto === undefined || texto === null ? '' : texto).slice(0, max);
}

function validar(c) {
  if (!c || typeof c !== 'object') throw new Error('Faltan los datos de la cita.');
  if (!/^[a-zA-Z0-9-]{1,100}$/.test(String(c.id || ''))) throw new Error('Código de cita inválido.');
  if (['appointment', 'block'].indexOf(c.kind) === -1) throw new Error('Tipo de registro inválido.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(textoFecha(c.date))) throw new Error('Fecha inválida.');
  var inicio = Number(c.start), duracion = Number(c.duration);
  if (!isFinite(inicio) || !isFinite(duracion) || inicio < 0 || duracion < 5 || inicio + duracion > 1440) {
    throw new Error('Horario inválido.');
  }
  if (ESTADOS.indexOf(c.status) === -1) throw new Error('Estado inválido.');
  if (!limpiar(c.clientName, 200).trim()) throw new Error('Falta el nombre.');

  return {
    id: limpiar(c.id, 100),
    kind: c.kind,
    serviceId: limpiar(c.serviceId, 60),
    variantIndex: Number(c.variantIndex) || 0,
    serviceName: limpiar(c.serviceName, 150),
    variantName: limpiar(c.variantName, 100),
    art: c.art === true,
    date: textoFecha(c.date),
    start: inicio,
    duration: duracion,
    clientName: limpiar(c.clientName, 100),
    phone: limpiar(c.phone, 20),
    email: limpiar(c.email, 254),
    notes: limpiar(c.notes, 1000),
    status: c.status,
    createdAt: limpiar(c.createdAt, 40) || new Date().toISOString(),
    priceMin: Number(c.priceMin) || 0,
    priceMax: Number(c.priceMax) || 0,
    eventoId: ''
  };
}

/* --- Acciones ------------------------------------------------------ */

/** Una clienta manda su solicitud desde la página pública. */
function solicitar(cruda) {
  var cita = validar(cruda);
  cita.status = 'pending';       // una solicitud siempre entra por confirmar
  cita.kind = 'appointment';

  if (buscarFila(cita.id)) {
    return { ok: true, repetida: true, cita: cita };   // reenvío, no es error
  }

  /* Freno simple contra el abuso: como mucho 40 solicitudes nuevas por día. */
  var hoy = new Date().toISOString().slice(0, 10);
  var deHoy = filas().filter(function (c) {
    return String(c.createdAt).slice(0, 10) === hoy && c.status === 'pending';
  });
  if (deHoy.length >= 40) {
    throw new Error('Se alcanzó el máximo de solicitudes por hoy. Escribinos por WhatsApp.');
  }

  cita.eventoId = crearEvento(cita);
  hoja().appendRow(COLUMNAS.map(function (col) {
    return col === 'date' ? "'" + cita.date : cita[col];
  }));
  return { ok: true, cita: cita };
}

/** Verónica guarda una cita desde el Libro (alta o corrección). */
function guardar(cruda) {
  var cita = validar(cruda);
  var existente = buscarFila(cita.id);
  if (existente) {
    cita.eventoId = existente.eventoId;
    actualizarEvento(cita);
    escribirFila(existente._fila, cita);
  } else {
    cita.eventoId = crearEvento(cita);
    hoja().appendRow(COLUMNAS.map(function (col) {
      return col === 'date' ? "'" + cita.date : cita[col];
    }));
  }
  return { ok: true, cita: cita };
}

function cambiarEstado(id, estado) {
  if (ESTADOS.indexOf(estado) === -1) throw new Error('Estado inválido.');
  var cita = buscarFila(String(id || ''));
  if (!cita) throw new Error('Esa cita ya no está en la agenda.');
  cita.status = estado;
  if (estado === 'cancelled') borrarEvento(cita);
  else actualizarEvento(cita);
  escribirFila(cita._fila, cita);
  return { ok: true, cita: cita };
}

function mover(id, fecha, inicio) {
  var cita = buscarFila(String(id || ''));
  if (!cita) throw new Error('Esa cita ya no está en la agenda.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(fecha))) throw new Error('Fecha inválida.');
  var m = Number(inicio);
  if (!isFinite(m) || m < 0 || m + cita.duration > 1440) throw new Error('Horario inválido.');
  cita.date = fecha;
  cita.start = m;
  cita.status = 'pending';
  actualizarEvento(cita);
  escribirFila(cita._fila, cita);
  return { ok: true, cita: cita };
}

function ponerCorreo(id, email) {
  var cita = buscarFila(String(id || ''));
  if (!cita) throw new Error('Esa cita ya no está en la agenda.');
  cita.email = limpiar(email, 254);
  actualizarEvento(cita);        // añade a la clienta como invitada
  escribirFila(cita._fila, cita);
  return { ok: true, cita: cita };
}

/** Devuelve la agenda. Por defecto, de hace 30 días en adelante. */
function listar(desde) {
  var corte = /^\d{4}-\d{2}-\d{2}$/.test(String(desde || ''))
    ? desde
    : new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  var citas = filas().filter(function (c) { return c.date >= corte; });
  citas.forEach(function (c) { delete c._fila; });
  return { ok: true, citas: citas, servidor: new Date().toISOString() };
}

/* --- Google Calendar ------------------------------------------------ */

function instante(fecha, minutos) {
  var h = Math.floor(minutos / 60), m = minutos % 60;
  var hh = (h < 10 ? '0' : '') + h, mm = (m < 10 ? '0' : '') + m;
  return new Date(fecha + 'T' + hh + ':' + mm + ':00' + DESFASE);
}

function tituloEvento(c) {
  return ESTUDIO.nombre + ' · ' + (c.kind === 'block' ? c.clientName : c.serviceName);
}

function detalleEvento(c) {
  var l = [];
  if (c.kind === 'block') {
    l.push('Horario bloqueado: ' + c.clientName);
  } else {
    l.push('Cita de ' + c.clientName + ' en ' + ESTUDIO.nombre + '.');
    l.push('');
    l.push('Servicio: ' + c.serviceName
      + (c.variantName && c.variantName !== 'Servicio completo' ? ' — ' + c.variantName : ''));
    if (c.art) l.push('Diseño elaborado o pedrería: sí');
    l.push('Precio de catálogo: ' + (c.priceMin === c.priceMax
      ? c.priceMin + ' Bs' : c.priceMin + '–' + c.priceMax + ' Bs'));
    if (c.phone) l.push('WhatsApp de la clienta: +' + c.phone);
    if (c.email) l.push('Correo: ' + c.email);
    if (c.notes) l.push('Observaciones: ' + c.notes);
    l.push('');
    if (c.status === 'pending') l.push('Estado: por confirmar.');
    l.push('Cómo llegar: ' + ESTUDIO.mapa);
  }
  l.push('Referencia: ' + c.id);
  return l.join('\n');
}

function opcionesEvento(c) {
  var o = { description: detalleEvento(c), location: ESTUDIO.lugar };
  if (c.email) { o.guests = c.email; o.sendInvites = true; }
  return o;
}

function crearEvento(c) {
  try {
    var evento = CalendarApp.getDefaultCalendar().createEvent(
      tituloEvento(c),
      instante(c.date, c.start),
      instante(c.date, c.start + c.duration),
      opcionesEvento(c)
    );
    return evento.getId();
  } catch (error) {
    /* Si el calendario falla, la cita igual se anota en la hoja: perder el
       evento es molesto, perder la cita sería grave. */
    return '';
  }
}

function actualizarEvento(c) {
  if (!c.eventoId) { c.eventoId = crearEvento(c); return; }
  try {
    var evento = CalendarApp.getEventById(c.eventoId);
    if (!evento) { c.eventoId = crearEvento(c); return; }
    evento.setTitle(tituloEvento(c));
    evento.setTime(instante(c.date, c.start), instante(c.date, c.start + c.duration));
    evento.setDescription(detalleEvento(c));
    evento.setLocation(ESTUDIO.lugar);
    if (c.email && evento.getGuestByEmail(c.email) === null) {
      evento.addGuest(c.email);
    }
  } catch (error) {
    c.eventoId = '';
  }
}

function borrarEvento(c) {
  if (!c.eventoId) return;
  try {
    var evento = CalendarApp.getEventById(c.eventoId);
    if (evento) evento.deleteEvent();
  } catch (error) { /* ya no estaba */ }
  c.eventoId = '';
}

/* --- Prueba manual --------------------------------------------------
   Para comprobar que todo quedó bien: en el editor de Apps Script elegí
   esta función y tocá «Ejecutar». Google te va a pedir los permisos una
   sola vez. Si termina sin error, está listo.                          */

function probar() {
  var h = hoja();
  var calendario = CalendarApp.getDefaultCalendar().getName();
  Logger.log('Hoja lista: ' + h.getName() + ' | filas: ' + Math.max(0, h.getLastRow() - 1));
  Logger.log('Planilla: ' + h.getParent().getUrl());
  Logger.log('Calendario: ' + calendario);
  if (CLAVE_ADMIN === 'cambiá-esto-por-una-clave-larga-y-tuya') {
    throw new Error('Falta cambiar CLAVE_ADMIN arriba del archivo por una clave tuya.');
  }
  Logger.log('Clave de administración: configurada.');
  Logger.log('Todo en orden.');
}
