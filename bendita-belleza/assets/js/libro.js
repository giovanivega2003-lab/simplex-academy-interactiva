/* Bendita Belleza — el libro de citas de la propietaria.

   La agenda vive en este navegador y en ningún otro lado. No viaja por
   internet, no hay servidor y nadie más la ve: quien abra el enlace desde
   otro teléfono encuentra un libro vacío. La clave de acceso protege este
   aparato, que es donde están los datos. */
(function (global) {
  'use strict';

  var BB = global.BB;
  var $ = BB.$;
  var escapar = BB.escapar;

  var LLAVE_AGENDA = 'bendita_belleza_agenda_local_v1';
  var LLAVE_CLAVE = 'bendita_belleza_clave_v1';
  var LLAVE_SESION = 'bendita_belleza_sesion';

  var estado = BB.reglas.vacio();
  var puedeGuardar = true;
  var datoDanado = false;
  var citaAReprogramar = '';
  var citaDeCalendario = '';
  var nubeLista = false;          // hay enlace con Google y la clave funciona

  /* ======================================================================
     Clave de acceso
     ====================================================================== */

  var codificador = new TextEncoder();

  function hex(bytes) {
    return Array.prototype.map.call(bytes, function (b) {
      return ('0' + b.toString(16)).slice(-2);
    }).join('');
  }

  function salAleatoria() {
    var s = new Uint8Array(16);
    (global.crypto || {}).getRandomValues
      ? global.crypto.getRandomValues(s)
      : s.forEach(function (_, i) { s[i] = Math.floor(Math.random() * 256); });
    return s;
  }

  /* PBKDF2 cuando el navegador lo ofrece. Abriendo el archivo desde el disco
     algunos navegadores no dan crypto.subtle; ahí se usa un resumen simple,
     que frena menos. El aviso de la pantalla lo dice. */
  function derivar(clave, sal) {
    var subtle = (global.crypto || {}).subtle;
    if (!subtle || !subtle.importKey) {
      var h = 0x811c9dc5;
      var texto = hex(sal) + '|' + clave;
      for (var i = 0; i < texto.length; i++) {
        h ^= texto.charCodeAt(i);
        h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
      }
      return Promise.resolve({ algoritmo: 'simple', resumen: ('00000000' + h.toString(16)).slice(-8) });
    }
    return subtle.importKey('raw', codificador.encode(clave), 'PBKDF2', false, ['deriveBits'])
      .then(function (material) {
        return subtle.deriveBits(
          { name: 'PBKDF2', salt: sal, iterations: 150000, hash: 'SHA-256' }, material, 256);
      })
      .then(function (bits) {
        return { algoritmo: 'pbkdf2', resumen: hex(new Uint8Array(bits)) };
      });
  }

  function claveGuardada() {
    try { return JSON.parse(localStorage.getItem(LLAVE_CLAVE) || 'null'); }
    catch (error) { return null; }
  }

  function pintarPorton() {
    var guardada = claveGuardada();
    var nueva = !guardada;
    $('porton-titulo').textContent = nueva ? 'Creá tu clave.' : 'Tu libro de citas.';
    $('porton-texto').textContent = nueva
      ? 'Elegí una clave de al menos 4 caracteres. Se guarda solo en este teléfono, en forma cifrada, y hace falta cada vez que abras el libro en un aparato nuevo.'
      : 'Escribí tu clave para abrir la agenda de este aparato.';
    $('campo-repetir').hidden = !nueva;
    $('porton-enviar').textContent = nueva ? 'Crear clave y abrir' : 'Abrir el libro';
    $('porton-olvido').hidden = nueva;
    $('error-porton').textContent = '';
    $('porton').hidden = false;
    $('libro').hidden = true;
    $('p-clave').value = '';
    $('p-repetir').value = '';
    setTimeout(function () { $('p-clave').focus(); }, 60);
  }

  function abrirLibro() {
    try { sessionStorage.setItem(LLAVE_SESION, '1'); } catch (error) { /* sin sesión, se vuelve a pedir */ }
    $('porton').hidden = true;
    $('libro').hidden = false;
    cargarAgenda();
    $('fecha-agenda').value = BB.diaLocal();
    pintarAgenda();
    pintarDuraciones();
    arrancarNube();
  }

  function enviarPorton(evento) {
    evento.preventDefault();
    var clave = $('p-clave').value;
    var guardada = claveGuardada();
    $('error-porton').textContent = '';

    if (!guardada) {
      if (clave.length < 4) { $('error-porton').textContent = 'La clave necesita al menos 4 caracteres.'; return; }
      if (clave !== $('p-repetir').value) { $('error-porton').textContent = 'Las dos claves no coinciden.'; return; }
      var sal = salAleatoria();
      derivar(clave, sal).then(function (resultado) {
        localStorage.setItem(LLAVE_CLAVE, JSON.stringify({
          sal: hex(sal), resumen: resultado.resumen, algoritmo: resultado.algoritmo
        }));
        abrirLibro();
        BB.recado('Clave creada. Anotala en un lugar seguro: no se puede recuperar.');
      }).catch(function () {
        $('error-porton').textContent = 'No se pudo crear la clave en este navegador.';
      });
      return;
    }

    var salBytes = new Uint8Array((guardada.sal.match(/../g) || []).map(function (p) {
      return parseInt(p, 16);
    }));
    derivar(clave, salBytes).then(function (resultado) {
      if (resultado.resumen === guardada.resumen) abrirLibro();
      else $('error-porton').textContent = 'Esa clave no es la de este libro.';
    }).catch(function () {
      $('error-porton').textContent = 'No se pudo verificar la clave.';
    });
  }

  function olvidarClave() {
    var aviso = 'Si olvidaste la clave, la agenda de este aparato no se puede abrir: '
      + 'está protegida justamente para eso.\n\n'
      + 'La única salida es empezar un libro vacío y restaurar tu último respaldo JSON. '
      + 'Todo lo que no esté en un respaldo se pierde.\n\n¿Empezar un libro vacío?';
    if (!global.confirm(aviso)) return;
    if (!global.confirm('Esto borra las citas guardadas en este navegador. ¿Seguro?')) return;
    try {
      localStorage.removeItem(LLAVE_CLAVE);
      localStorage.removeItem(LLAVE_AGENDA);
    } catch (error) { /* nada que borrar */ }
    estado = BB.reglas.vacio();
    pintarPorton();
  }

  /* ======================================================================
     Estado de la agenda
     ====================================================================== */

  function avisoGuardado(texto) {
    $('aviso-almacen').textContent = texto;
    $('aviso-almacen').hidden = !texto;
  }

  function cargarAgenda() {
    try {
      var crudo = localStorage.getItem(LLAVE_AGENDA);
      if (crudo) estado = BB.reglas.leerRespaldo(JSON.parse(crudo));
      localStorage.setItem(LLAVE_AGENDA + '_prueba', '1');
      localStorage.removeItem(LLAVE_AGENDA + '_prueba');
    } catch (error) {
      if (error.name === 'SecurityError' || error.name === 'QuotaExceededError') {
        puedeGuardar = false;
        avisoGuardado('Este navegador no deja guardar de forma permanente. Las citas de esta sesión se pierden al cerrar: descargá un respaldo antes de salir.');
      } else {
        datoDanado = true;
        avisoGuardado('No se pudo leer la agenda guardada. Para no pisarla, restaurá un respaldo válido antes de tocar nada.');
      }
    }
  }

  function releer() {
    if (!puedeGuardar || datoDanado) return;
    var crudo = localStorage.getItem(LLAVE_AGENDA);
    if (crudo) estado = BB.reglas.leerRespaldo(JSON.parse(crudo));
  }

  function guardarAgenda(reemplazando) {
    if (datoDanado && !reemplazando) {
      throw new Error('Restaurá un respaldo válido antes de modificar la agenda.');
    }
    if (puedeGuardar) {
      try {
        localStorage.setItem(LLAVE_AGENDA, JSON.stringify(estado));
      } catch (error) {
        puedeGuardar = false;
        avisoGuardado('No se pudo guardar en el navegador. Las citas siguen en esta sesión: descargá un respaldo para conservarlas.');
      }
    }
    datoDanado = false;
    if (puedeGuardar) avisoGuardado('');
    pintarAgenda();
  }

  function editable() {
    if (datoDanado) throw new Error('Restaurá un respaldo válido antes de modificar la agenda.');
    releer();
  }

  function citaPorId(id) {
    for (var i = 0; i < estado.appointments.length; i++) {
      if (estado.appointments[i].id === id) return estado.appointments[i];
    }
    return null;
  }

  function duracionServicio(servicio) {
    return estado.durations[servicio.id] || servicio.duracion;
  }

  /* ======================================================================
     Sincronización con Google
     ====================================================================== */

  function pintarEstadoNube(texto, tono) {
    $('panel-nube').className = 'nube' + (tono ? ' nube--' + tono : '');
    $('nube-texto').textContent = texto;
  }

  function horaCorta() {
    return new Intl.DateTimeFormat('es-BO', {
      hour: '2-digit', minute: '2-digit', timeZone: BB.ESTUDIO.zona
    }).format(new Date());
  }

  /* Las citas del servidor se pasan por la misma validación que un respaldo.
     Se revisan de a una: si alguna viniera mal, se descarta esa sola y el
     resto de la agenda se sigue viendo. */
  function desdeServidor(citas) {
    var buenas = [];
    var descartadas = 0;
    (citas || []).forEach(function (c) {
      try {
        var r = BB.reglas.leerRespaldo({ version: 2, appointments: [c], durations: {} });
        buenas.push(r.appointments[0]);
      } catch (error) {
        descartadas++;
      }
    });
    return { citas: buenas, descartadas: descartadas };
  }

  function guardarCache() {
    if (!puedeGuardar) return;
    try { localStorage.setItem(LLAVE_AGENDA, JSON.stringify(estado)); }
    catch (error) { puedeGuardar = false; }
  }

  /* Si en este teléfono había citas que el servidor no tiene, se ofrece
     subirlas en vez de perderlas sin avisar. */
  function ofrecerSubir(locales) {
    var enServidor = {};
    estado.appointments.forEach(function (c) { enServidor[c.id] = true; });
    var sueltas = locales.filter(function (c) { return !enServidor[c.id]; });

    if (!sueltas.length) { $('aviso-subir').hidden = true; return; }

    $('aviso-subir').hidden = false;
    $('aviso-subir').innerHTML = BB.icono('alerta')
      + '<span>Este teléfono tiene <strong>' + sueltas.length + '</strong> '
      + (sueltas.length === 1 ? 'cita que no está' : 'citas que no están')
      + ' en Google. Subilas para no perderlas.<br>'
      + '<button class="boton boton--linea" type="button" id="boton-subir" '
      + 'style="margin-top:.6rem">Subir a Google</button></span>';

    $('boton-subir').addEventListener('click', function () {
      var boton = this;
      boton.disabled = true;
      boton.textContent = 'Subiendo…';
      var pendientes = sueltas.slice();
      var fallos = 0;

      var siguiente = function () {
        if (!pendientes.length) {
          BB.recado(fallos
            ? 'Se subieron ' + (sueltas.length - fallos) + ' de ' + sueltas.length + '. Probá de nuevo con el resto.'
            : 'Listo: ' + sueltas.length + (sueltas.length === 1 ? ' cita subida.' : ' citas subidas.'));
          sincronizar(false);
          return;
        }
        var cita = pendientes.shift();
        BB.nube.guardar(cita).catch(function () { fallos++; }).then(siguiente, siguiente);
      };
      siguiente();
    });
  }

  function sincronizar(avisar) {
    if (!BB.nube.configurada() || !BB.nube.claveAdmin()) return;
    pintarEstadoNube('Actualizando…', 'espera');

    BB.nube.listar().then(function (respuesta) {
      var locales = estado.appointments.slice();
      var leidas = desdeServidor(respuesta.citas);
      estado.appointments = leidas.citas;
      nubeLista = true;
      guardarCache();
      pintarAgenda();
      ofrecerSubir(locales);
      pintarEstadoNube('Al día con Google · ' + horaCorta()
        + (leidas.descartadas ? ' · ' + leidas.descartadas + ' con datos raros' : ''), 'ok');
      if (avisar) BB.recado('Agenda actualizada desde Google.');
    }).catch(function (error) {
      nubeLista = false;
      if (error.message === 'sin-clave') { pedirClaveNube(); return; }
      pintarEstadoNube('Sin conexión con Google. Estás viendo la copia de este teléfono.', 'falla');
      if (avisar) BB.recado(error.message);
    });
  }

  /* Empuja un cambio ya aplicado en pantalla. Si Google no lo acepta, se
     vuelve a leer del servidor para que lo que ves sea la verdad. */
  function empujar(promesa) {
    if (!nubeLista) return;
    promesa.catch(function (error) {
      BB.recado('Google no aceptó el cambio: ' + error.message);
      sincronizar(false);
    });
  }

  function pedirClaveNube() {
    $('nube-clave-campo').value = BB.nube.claveAdmin();
    $('error-nube').textContent = '';
    pintarEstadoNube('Falta la clave de Google para ver la agenda compartida.', 'falla');
    $('dialogo-nube').showModal();
  }

  function enviarClaveNube(evento) {
    evento.preventDefault();
    var clave = $('nube-clave-campo').value.trim();
    if (!clave) { $('error-nube').textContent = 'Escribí la clave.'; return; }
    $('nube-probar').disabled = true;
    $('nube-probar').textContent = 'Probando…';

    BB.nube.probar(clave).then(function () {
      BB.nube.guardarClaveAdmin(clave);
      BB.cerrarDialogo($('dialogo-nube'));
      BB.recado('Conectado con Google.');
      sincronizar(false);
    }).catch(function (error) {
      $('error-nube').textContent = error.message === 'sin-configurar'
        ? 'Todavía no está pegada la dirección del enlace en config.js.'
        : error.message;
    }).then(function () {
      $('nube-probar').disabled = false;
      $('nube-probar').textContent = 'Probar y guardar';
    });
  }

  function arrancarNube() {
    if (!BB.nube.configurada()) { $('panel-nube').hidden = true; return; }
    $('panel-nube').hidden = false;
    if (!BB.nube.claveAdmin()) { pedirClaveNube(); return; }
    sincronizar(false);
  }

  /* ======================================================================
     Pintado del libro
     ====================================================================== */

  function delDia() {
    var dia = $('fecha-agenda').value;
    return estado.appointments.filter(function (a) {
      return $('todas-fechas').checked || a.date === dia;
    });
  }

  function pintarAgenda() {
    var items = delDia();
    var citas = items.filter(function (a) { return a.kind === 'appointment'; });
    var confirmadas = citas.filter(function (a) { return a.status === 'confirmed'; });
    var min = confirmadas.reduce(function (n, a) { return n + a.priceMin; }, 0);
    var max = confirmadas.reduce(function (n, a) { return n + a.priceMax; }, 0);
    var todas = $('todas-fechas').checked;

    $('cuentas').innerHTML =
      '<div class="cuenta"><span class="rotulo">Citas ' + (todas ? 'registradas' : 'del día') + '</span>'
      + '<strong>' + citas.filter(function (a) { return a.status !== 'cancelled'; }).length + '</strong>'
      + '<span class="apunte">Sin contar canceladas</span></div>'
      + '<div class="cuenta"><span class="rotulo">Por confirmar</span>'
      + '<strong>' + citas.filter(function (a) { return a.status === 'pending'; }).length + '</strong>'
      + '<span class="apunte">Esperan tu respuesta</span></div>'
      + '<div class="cuenta"><span class="rotulo">Monto confirmado</span>'
      + '<strong>' + BB.precioTexto(min, max) + '</strong>'
      + '<span class="apunte">Estimado de catálogo, no es un cobro</span></div>';

    var busqueda = $('buscar').value.trim().toLocaleLowerCase('es');
    var filtro = $('filtro-estado').value;
    var visibles = items.filter(function (a) {
      var coincideEstado = filtro === 'all' || a.status === filtro;
      var texto = (a.clientName + ' ' + a.phone + ' ' + (a.email || '') + ' ' + a.serviceName)
        .toLocaleLowerCase('es');
      return coincideEstado && texto.indexOf(busqueda) !== -1;
    }).sort(function (a, b) { return a.date.localeCompare(b.date) || a.start - b.start; });

    $('pie-agenda').textContent = (todas
      ? 'Todas las fechas'
      : BB.diaValido($('fecha-agenda').value) ? BB.etiquetaDiaLarga($('fecha-agenda').value) : 'Elegí una fecha')
      + ' · ' + visibles.length + (visibles.length === 1 ? ' registro' : ' registros')
      + ' · hora de Bolivia';

    if (!visibles.length) {
      $('renglones').innerHTML = '<div class="hoja-vacia">'
        + '<svg class="icono" aria-hidden="true" viewBox="0 0 24 24"><use href="#i-libro"></use></svg>'
        + '<h3>Hoja en blanco.</h3>'
        + '<p>No hay registros con esta fecha y estos filtros.</p></div>';
      return;
    }

    $('renglones').innerHTML = visibles.map(function (a) {
      var boton = function (accion, etiqueta, icono, clase) {
        return '<button class="boton ' + (clase || 'boton--linea') + '" type="button"'
          + ' data-accion="' + accion + '" data-id="' + escapar(a.id) + '">'
          + (icono ? BB.icono(icono) : '') + etiqueta + '</button>';
      };

      var acciones = '';
      var marca = '';

      if (a.kind === 'block') {
        marca = '<span class="sello sello--apagado">Bloqueado</span>';
        if (a.status !== 'cancelled') acciones = boton('cancelar', 'Quitar bloqueo', 'veda');
      } else {
        var clases = {
          pending: 'sello--espera', confirmed: 'sello--ok',
          completed: 'sello--apagado', cancelled: 'sello--alta'
        };
        marca = '<span class="sello ' + clases[a.status] + '">'
          + BB.reglas.ETIQUETA_ESTADO[a.status] + '</span>';

        if (a.status === 'pending') acciones += boton('confirmar', 'Confirmar', 'check', 'boton--sello');
        if (a.status === 'confirmed') acciones += boton('atendida', 'Atendida', 'check');
        if (a.status === 'pending' || a.status === 'confirmed') {
          acciones += boton('reprogramar', 'Mover', 'reloj') + boton('cancelar', 'Cancelar', 'veda');
        }
        acciones += boton('calendario', 'Calendario', 'calendario');
        acciones += '<a class="boton boton--linea" target="_blank" rel="noopener noreferrer" href="'
          + escapar(BB.whatsapp(mensajeDuena(a), a.phone)) + '">'
          + BB.icono('whatsapp') + 'WhatsApp</a>';
      }

      var detalles = [];
      if (a.kind === 'appointment') {
        if (a.variantName && a.variantName !== 'Servicio completo') detalles.push(escapar(a.variantName));
        if (a.art) detalles.push('con diseño');
        detalles.push('<b>+' + escapar(a.phone) + '</b>');
        if (a.email) detalles.push(escapar(a.email));
      }

      return '<article class="cita cita--' + a.status + '">'
        + '<div class="cita__hora"><strong>' + BB.textoHora(a.start) + '</strong>'
        + '<span>hasta ' + BB.textoHora(a.start + a.duration) + '</span>'
        + '<span>' + escapar(BB.etiquetaDia(a.date)) + '</span></div>'
        + '<div class="cita__cuerpo">'
        + '<div class="cita__alto"><h3 class="cita__titulo">' + escapar(a.clientName) + '</h3>' + marca + '</div>'
        + '<p class="cita__datos">'
        + (a.kind === 'block'
          ? 'Horario bloqueado · ' + BB.duracionTexto(a.duration)
          : escapar(a.serviceName) + ' · ' + BB.precioTexto(a.priceMin, a.priceMax))
        + '</p>'
        + (detalles.length ? '<p class="cita__datos">' + detalles.join(' · ') + '</p>' : '')
        + (a.notes ? '<p class="cita__observacion">' + escapar(a.notes) + '</p>' : '')
        + '<div class="cita__acciones">' + acciones + '</div>'
        + '</div></article>';
    }).join('');
  }

  function mensajeDuena(a) {
    var entrada = a.status === 'confirmed' ? 'Tu cita está confirmada.'
      : a.status === 'cancelled' ? 'Tu cita fue cancelada.'
      : a.status === 'completed' ? 'Gracias por visitarnos.'
      : 'Queremos coordinar tu cita; el horario está por confirmar.';
    var lineas = [
      'Hola, ' + a.clientName + '. Te escribimos de Bendita Belleza. ' + entrada,
      '',
      'Servicio: ' + a.serviceName
        + (a.variantName === 'Servicio completo' ? '' : ' — ' + a.variantName),
      'Fecha: ' + BB.etiquetaDiaLarga(a.date),
      'Hora: ' + BB.textoHora(a.start) + ' (Bolivia)',
      'Precio de catálogo: ' + BB.precioTexto(a.priceMin, a.priceMax),
      'Ubicación: ' + BB.ESTUDIO.mapa
    ];
    if (a.status === 'confirmed' && !a.email) {
      lineas.push('', 'Si querés que te llegue la invitación al calendario, pasame tu correo.');
    }
    lineas.push('', 'Si necesitás algún cambio, escribinos por acá.');
    return lineas.join('\n');
  }

  /* ======================================================================
     Acciones sobre una cita
     ====================================================================== */

  function accionAgenda(evento) {
    var boton = evento.target.closest('[data-accion]');
    if (!boton) return;
    try {
      editable();
      var a = citaPorId(boton.dataset.id);
      if (!a) throw new Error('Ese registro ya no está en la agenda.');
      var accion = boton.dataset.accion;

      if (accion === 'reprogramar') {
        if (['pending', 'confirmed'].indexOf(a.status) === -1) {
          throw new Error('Esta cita ya no se puede mover.');
        }
        citaAReprogramar = a.id;
        $('mover-detalle').textContent = a.clientName + ' · ' + a.serviceName
          + ' · ' + BB.duracionTexto(a.duration);
        $('mover-fecha').min = BB.diaLocal();
        $('mover-fecha').max = BB.sumaDias(BB.diaLocal(), 180);
        $('mover-fecha').value = a.date >= BB.diaLocal() ? a.date : BB.diaLocal();
        $('error-mover').textContent = '';
        pintarHorasMover(a.start);
        $('dialogo-mover').showModal();
        return;
      }

      if (accion === 'calendario') { abrirCalendario(a); return; }

      if (accion === 'cancelar') {
        if (a.status === 'completed' || a.status === 'cancelled') {
          throw new Error('Este registro ya no se puede cancelar.');
        }
        var pregunta = a.kind === 'block'
          ? '¿Quitar el bloqueo del ' + BB.etiquetaDia(a.date) + ' a las ' + BB.textoHora(a.start) + '?'
          : '¿Cancelar la cita de ' + a.clientName + ' del ' + BB.etiquetaDia(a.date)
            + ' a las ' + BB.textoHora(a.start) + '?';
        if (!global.confirm(pregunta)) return;
        a.status = 'cancelled';
      } else if (accion === 'confirmar') {
        if (a.status !== 'pending') throw new Error('La cita ya no está por confirmar.');
        if (BB.reglas.choca(a, estado.appointments, a.id)) {
          throw new Error('Hay otro registro en ese horario. Movela antes de confirmar.');
        }
        a.status = 'confirmed';
      } else if (accion === 'atendida') {
        if (a.status !== 'confirmed') throw new Error('Confirmá la cita primero.');
        if (BB.instante(a.date, a.start) > Date.now()) {
          throw new Error('Vas a poder marcarla atendida desde la hora de inicio.');
        }
        a.status = 'completed';
      } else return;

      guardarAgenda();
      empujar(BB.nube.estado(a.id, a.status));
      BB.recado(a.kind === 'block'
        ? 'Bloqueo actualizado.'
        : 'Estado actualizado. Avisale a la clienta por WhatsApp.');
    } catch (error) {
      BB.recado(error.message);
    }
  }

  /* --- Calendario ---------------------------------------------------------- */

  function abrirCalendario(a) {
    citaDeCalendario = a.id;
    $('cal-detalle').textContent = a.clientName + ' · ' + a.serviceName + ' · '
      + BB.etiquetaDiaLarga(a.date) + ' · ' + BB.textoHora(a.start);
    $('cal-correo').value = a.email || '';
    $('error-cal').textContent = '';
    actualizarEnlaceGoogle();
    $('dialogo-calendario').showModal();
  }

  function actualizarEnlaceGoogle() {
    var a = citaPorId(citaDeCalendario);
    if (!a) return;
    var correo = $('cal-correo').value.trim();
    var valido = correo && BB.calendario.correoValido(correo);
    var copia = JSON.parse(JSON.stringify(a));
    copia.email = valido ? correo : '';
    $('cal-google').href = BB.calendario.urlGoogle(copia, {
      paraDuena: true,
      invitados: valido ? [correo] : []
    });
    $('cal-estado-correo').textContent = valido
      ? 'Google le enviará la invitación a ' + correo + ' cuando guardes el evento.'
      : correo
        ? 'Ese correo no parece válido: el evento se creará sin invitada.'
        : 'Sin correo, el evento se crea solo en tu calendario y la clienta no recibe nada.';
  }

  function guardarCorreo() {
    try {
      editable();
      var a = citaPorId(citaDeCalendario);
      if (!a) throw new Error('Ese registro ya no está en la agenda.');
      var correo = $('cal-correo').value.trim();
      if (correo && !BB.calendario.correoValido(correo)) {
        throw new Error('Ese correo no parece válido.');
      }
      a.email = correo;
      guardarAgenda();
      empujar(BB.nube.correo(a.id, correo));
      $('error-cal').textContent = '';
      BB.recado(correo ? 'Correo guardado en la cita.' : 'Correo quitado de la cita.');
    } catch (error) {
      $('error-cal').textContent = error.message;
    }
  }

  /* --- Mover --------------------------------------------------------------- */

  function pintarHorasMover(preferida) {
    var a = citaPorId(citaAReprogramar);
    if (!a) return;
    var horas = BB.reglas.huecos($('mover-fecha').value, a.duration, estado.appointments, a.id);
    var anterior = preferida === undefined ? $('mover-hora').value : String(preferida);
    $('mover-hora').innerHTML = '<option value="">'
      + (horas.length ? 'Elegí una hora' : 'Sin horas libres ese día') + '</option>'
      + horas.map(function (m) {
        return '<option value="' + m + '">' + BB.textoHora(m) + '</option>';
      }).join('');
    if (anterior !== '' && horas.indexOf(Number(anterior)) !== -1) $('mover-hora').value = anterior;
  }

  function enviarMover(evento) {
    evento.preventDefault();
    try {
      editable();
      var a = citaPorId(citaAReprogramar);
      if (!a || ['pending', 'confirmed'].indexOf(a.status) === -1) {
        throw new Error('La cita ya no se puede mover.');
      }
      if ($('mover-hora').value === '') throw new Error('Elegí una hora.');
      var fecha = $('mover-fecha').value;
      var inicio = Number($('mover-hora').value);
      var problema = BB.reglas.errorReserva(fecha, inicio, a.duration, estado.appointments, a.id);
      if (problema) { pintarHorasMover(); throw new Error(problema); }
      a.date = fecha;
      a.start = inicio;
      a.status = 'pending';
      guardarAgenda();
      empujar(BB.nube.mover(a.id, fecha, inicio));
      $('fecha-agenda').value = fecha;
      pintarAgenda();
      BB.cerrarDialogo($('dialogo-mover'));
      BB.recado('Cita movida y otra vez por confirmar. Avisale a la clienta.');
    } catch (error) {
      $('error-mover').textContent = error.message;
    }
  }

  /* --- Nueva cita ---------------------------------------------------------- */

  function eleccionNueva() {
    var servicio = BB.servicioPorId($('n-servicio').value);
    if (!servicio) throw new Error('Elegí un servicio válido.');
    var indice = Number($('n-variante').value) || 0;
    var variante = servicio.variantes[indice];
    if (!variante) throw new Error('Elegí una opción válida.');
    var diseno = Boolean(servicio.diseno && $('n-diseno').checked);
    return {
      servicio: servicio, indice: indice, variante: variante, diseno: diseno,
      duracion: duracionServicio(servicio) + (diseno ? BB.RECARGO_DISENO.minutos : 0),
      precioMin: variante.min + (diseno ? BB.RECARGO_DISENO.precio : 0),
      precioMax: variante.max + (diseno ? BB.RECARGO_DISENO.precio : 0)
    };
  }

  function llenarVariantesNueva() {
    var servicio = BB.servicioPorId($('n-servicio').value);
    $('n-variante').innerHTML = servicio.variantes.map(function (v, i) {
      return '<option value="' + i + '">' + escapar(v.etiqueta) + ' · '
        + BB.precioTexto(v.min, v.max) + '</option>';
    }).join('');
    $('n-campo-variante').hidden = servicio.variantes.length === 1;
    $('n-campo-diseno').hidden = !servicio.diseno;
    $('n-diseno').checked = false;
    refrescarNueva();
  }

  function refrescarNueva() {
    var elegido = eleccionNueva();
    var horas = BB.reglas.huecos($('n-fecha').value, elegido.duracion, estado.appointments);
    var anterior = $('n-hora').value;
    $('n-hora').innerHTML = '<option value="">'
      + (horas.length ? 'Elegí una hora' : 'Sin horas libres ese día') + '</option>'
      + horas.map(function (m) {
        return '<option value="' + m + '">' + BB.textoHora(m) + '</option>';
      }).join('');
    if (anterior !== '' && horas.indexOf(Number(anterior)) !== -1) $('n-hora').value = anterior;

    var fecha = $('n-fecha').value;
    var horario = BB.diaValido(fecha) ? BB.atencion(fecha) : null;
    $('n-nota-horas').textContent = !horario
      ? 'Los domingos el salón está cerrado. Elegí otro día.'
      : horas.length
        ? 'Atención de ' + BB.textoHora(horario[0]) + ' a ' + BB.textoHora(horario[1]) + ', hora de Bolivia.'
        : 'Ese día no queda hueco libre para este servicio antes del cierre. Probá con otra fecha, '
          + 'o acortá la duración desde «Duraciones y respaldos».';

    $('n-resumen').textContent = BB.precioTexto(elegido.precioMin, elegido.precioMax)
      + ' · ' + BB.duracionTexto(elegido.duracion);
    $('n-enviar').disabled = !horas.length || datoDanado;
    $('error-nueva').textContent = '';
  }

  function abrirNueva() {
    try { releer(); } catch (error) { BB.recado('No se pudo releer la agenda guardada.'); }
    $('form-nueva').reset();
    $('n-servicio').value = BB.CATALOGO[0].id;
    var hoy = BB.diaLocal();
    $('n-fecha').min = hoy;
    $('n-fecha').max = BB.sumaDias(hoy, 180);
    $('n-fecha').value = $('fecha-agenda').value >= hoy ? $('fecha-agenda').value : hoy;
    llenarVariantesNueva();

    /* Si el día elegido ya no tiene hueco (domingo, o pasado el cierre), abrir
       en el primero que sí lo tenga. Ella puede cambiarlo igual. */
    var duracion = eleccionNueva().duracion;
    if (!BB.reglas.huecos($('n-fecha').value, duracion, estado.appointments).length) {
      for (var i = 0; i <= 180; i++) {
        var dia = BB.sumaDias(hoy, i);
        if (BB.reglas.huecos(dia, duracion, estado.appointments).length) {
          $('n-fecha').value = dia;
          refrescarNueva();
          break;
        }
      }
    }

    $('dialogo-nueva').showModal();
  }

  function enviarNueva(evento) {
    evento.preventDefault();
    try {
      editable();
      var elegido = eleccionNueva();
      var nombre = $('n-nombre').value.trim();
      var tel = BB.reglas.telefono($('n-telefono').value);
      var correo = $('n-correo').value.trim();

      if (!nombre || nombre.length > 100) throw new Error('Escribí el nombre de la clienta.');
      if (!tel) throw new Error('Escribí un WhatsApp válido: 8 dígitos, o el número completo con código de país.');
      if (correo && !BB.calendario.correoValido(correo)) throw new Error('Ese correo no parece válido.');
      if ($('n-hora').value === '') throw new Error('Elegí una hora.');

      var fecha = $('n-fecha').value;
      var inicio = Number($('n-hora').value);
      var problema = BB.reglas.errorReserva(fecha, inicio, elegido.duracion, estado.appointments);
      if (problema) { refrescarNueva(); throw new Error(problema); }

      var nueva = {
        id: BB.reglas.identificador(),
        kind: 'appointment',
        serviceId: elegido.servicio.id,
        variantIndex: elegido.indice,
        serviceName: elegido.servicio.nombre,
        variantName: elegido.variante.etiqueta,
        art: elegido.diseno,
        date: fecha,
        start: inicio,
        duration: elegido.duracion,
        clientName: nombre,
        phone: tel,
        email: correo,
        notes: $('n-notas').value.trim().slice(0, 1000),
        status: 'pending',
        createdAt: new Date().toISOString(),
        priceMin: elegido.precioMin,
        priceMax: elegido.precioMax
      };
      estado.appointments.push(nueva);

      guardarAgenda();
      empujar(BB.nube.guardar(nueva));
      $('fecha-agenda').value = fecha;
      $('todas-fechas').checked = false;
      pintarAgenda();
      BB.cerrarDialogo($('dialogo-nueva'));
      BB.recado('Cita registrada, por confirmar.');
    } catch (error) {
      $('error-nueva').textContent = error.message;
    }
  }

  /* --- Bloqueo ------------------------------------------------------------- */

  function abrirBloqueo() {
    $('form-bloqueo').reset();
    $('error-bloqueo').textContent = '';
    var hoy = BB.diaLocal();
    $('b-fecha').min = hoy;
    $('b-fecha').max = BB.sumaDias(hoy, 180);
    $('b-fecha').value = $('fecha-agenda').value >= hoy ? $('fecha-agenda').value : hoy;
    $('b-desde').value = '13:00';
    $('b-hasta').value = '14:00';
    $('dialogo-bloqueo').showModal();
  }

  function enviarBloqueo(evento) {
    evento.preventDefault();
    try {
      editable();
      var fecha = $('b-fecha').value;
      var desde = BB.valorHora($('b-desde').value);
      var hasta = BB.valorHora($('b-hasta').value);
      var motivo = $('b-motivo').value.trim();
      if (!motivo) throw new Error('Escribí el motivo del bloqueo.');
      if (!Number.isInteger(hasta) || hasta <= desde) {
        throw new Error('La hora final tiene que ser posterior a la inicial.');
      }
      var problema = BB.reglas.errorReserva(fecha, desde, hasta - desde, estado.appointments);
      if (problema) throw new Error(problema);

      var bloqueo = {
        id: BB.reglas.identificador(), kind: 'block', serviceId: '', variantIndex: 0,
        serviceName: 'Bloqueo', variantName: '', art: false, date: fecha, start: desde,
        duration: hasta - desde, clientName: motivo, phone: '', email: '', notes: '',
        status: 'block', createdAt: new Date().toISOString(), priceMin: 0, priceMax: 0
      };
      estado.appointments.push(bloqueo);

      guardarAgenda();
      empujar(BB.nube.guardar(bloqueo));
      $('fecha-agenda').value = fecha;
      pintarAgenda();
      BB.cerrarDialogo($('dialogo-bloqueo'));
      BB.recado('Horario bloqueado.');
    } catch (error) {
      $('error-bloqueo').textContent = error.message;
    }
  }

  /* --- Duraciones y respaldos ---------------------------------------------- */

  function pintarDuraciones() {
    $('campos-duracion').innerHTML = BB.CATALOGO.map(function (s) {
      return '<label class="campo"><span class="rotulo">' + escapar(s.nombre) + '</span>'
        + '<input name="' + s.id + '" type="number" inputmode="numeric" min="15" max="660" step="5"'
        + ' required value="' + duracionServicio(s) + '"'
        + ' aria-label="Duración de ' + escapar(s.nombre) + ' en minutos"></label>';
    }).join('');
  }

  function exportarExcel() {
    try {
      releer();
      BB.descargarArchivo(
        BB.crearXlsx(BB.reglas.filasExcel(estado.appointments)),
        'Bendita_Belleza_Citas_' + BB.diaLocal() + '.xlsx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      BB.recado('Excel preparado con todos los registros.');
    } catch (error) {
      BB.recado('No se pudo preparar el Excel: ' + error.message);
    }
  }

  function exportarRespaldo() {
    try {
      releer();
      if (datoDanado) throw new Error('No se puede respaldar una agenda que no se pudo leer.');
      BB.descargarArchivo(JSON.stringify(estado, null, 2),
        'Bendita_Belleza_Respaldo_' + BB.diaLocal() + '.json', 'application/json');
      BB.recado('Respaldo descargado. Guardalo en un lugar seguro.');
    } catch (error) {
      BB.recado(error.message);
    }
  }

  function importarRespaldo(evento) {
    var archivo = evento.target.files[0];
    if (!archivo) return;
    var terminar = function () { evento.target.value = ''; };
    if (archivo.size > 5 * 1024 * 1024) {
      BB.recado('El respaldo tiene que pesar menos de 5 MB.');
      terminar();
      return;
    }
    archivo.text().then(function (texto) {
      var restaurado = BB.reglas.leerRespaldo(JSON.parse(texto));
      if (!global.confirm('Este respaldo trae ' + restaurado.appointments.length
        + ' registros y reemplaza lo que hay en este navegador. ¿Restaurarlo?')) return;
      estado = restaurado;
      guardarAgenda(true);
      pintarDuraciones();
      BB.recado('Respaldo restaurado.');
    }).catch(function (error) {
      BB.recado(error instanceof SyntaxError
        ? 'Ese archivo no es un respaldo JSON válido.'
        : error.message);
    }).then(terminar, terminar);
  }

  /* ======================================================================
     Arranque
     ====================================================================== */

  function iniciar() {
    BB.montarIconos();
    BB.prepararDialogos();

    $('form-porton').addEventListener('submit', enviarPorton);
    $('porton-olvido').addEventListener('click', olvidarClave);

    /* Catálogo en el formulario de nueva cita */
    $('n-servicio').innerHTML = BB.CATEGORIAS.map(function (categoria) {
      return '<optgroup label="' + escapar(categoria) + '">'
        + BB.CATALOGO.filter(function (s) { return s.categoria === categoria; })
          .map(function (s) { return '<option value="' + s.id + '">' + escapar(s.nombre) + '</option>'; })
          .join('')
        + '</optgroup>';
    }).join('');

    ['fecha-agenda', 'filtro-estado', 'todas-fechas'].forEach(function (id) {
      $(id).addEventListener('change', pintarAgenda);
    });
    $('buscar').addEventListener('input', pintarAgenda);

    $('dia-anterior').addEventListener('click', function () {
      $('todas-fechas').checked = false;
      $('fecha-agenda').value = BB.sumaDias($('fecha-agenda').value || BB.diaLocal(), -1);
      pintarAgenda();
    });
    $('dia-siguiente').addEventListener('click', function () {
      $('todas-fechas').checked = false;
      $('fecha-agenda').value = BB.sumaDias($('fecha-agenda').value || BB.diaLocal(), 1);
      pintarAgenda();
    });
    $('dia-hoy').addEventListener('click', function () {
      $('todas-fechas').checked = false;
      $('fecha-agenda').value = BB.diaLocal();
      pintarAgenda();
    });

    $('nueva-cita').addEventListener('click', abrirNueva);
    $('nuevo-bloqueo').addEventListener('click', abrirBloqueo);
    $('renglones').addEventListener('click', accionAgenda);

    $('n-servicio').addEventListener('change', llenarVariantesNueva);
    ['n-variante', 'n-diseno', 'n-fecha'].forEach(function (id) {
      $(id).addEventListener('change', refrescarNueva);
    });
    $('form-nueva').addEventListener('submit', enviarNueva);

    $('form-bloqueo').addEventListener('submit', enviarBloqueo);

    $('mover-fecha').addEventListener('change', function () { pintarHorasMover(); });
    $('form-mover').addEventListener('submit', enviarMover);

    $('cal-correo').addEventListener('input', actualizarEnlaceGoogle);
    $('cal-guardar').addEventListener('click', guardarCorreo);
    $('cal-ics').addEventListener('click', function () {
      var a = citaPorId(citaDeCalendario);
      if (a) BB.calendario.descargarIcs(a, { paraDuena: true });
    });

    $('exportar-excel').addEventListener('click', exportarExcel);
    $('exportar-respaldo').addEventListener('click', exportarRespaldo);
    $('importar-respaldo').addEventListener('click', function () { $('archivo-respaldo').click(); });
    $('archivo-respaldo').addEventListener('change', importarRespaldo);

    $('form-duraciones').addEventListener('submit', function (evento) {
      evento.preventDefault();
      try {
        editable();
        var duraciones = {};
        for (var i = 0; i < BB.CATALOGO.length; i++) {
          var servicio = BB.CATALOGO[i];
          var valor = Number(evento.target.elements.namedItem(servicio.id).value);
          if (!Number.isInteger(valor) || valor < 15 || valor > 660 || valor % 5 !== 0) {
            throw new Error('Usá duraciones entre 15 y 660 minutos, de 5 en 5.');
          }
          duraciones[servicio.id] = valor;
        }
        estado.durations = duraciones;
        guardarAgenda();
        BB.recado('Duraciones guardadas para las próximas citas.');
      } catch (error) {
        BB.recado(error.message);
      }
    });

    $('nube-actualizar').addEventListener('click', function () { sincronizar(true); });
    $('nube-clave').addEventListener('click', pedirClaveNube);
    $('form-nube').addEventListener('submit', enviarClaveNube);
    $('nube-olvidar').addEventListener('click', function () {
      BB.nube.olvidarClaveAdmin();
      nubeLista = false;
      BB.cerrarDialogo($('dialogo-nube'));
      pintarEstadoNube('Trabajando solo con la copia de este teléfono.', 'falla');
      BB.recado('Desconectado de Google. Las citas nuevas no se van a compartir.');
    });

    $('cerrar-libro').addEventListener('click', function () {
      try { sessionStorage.removeItem(LLAVE_SESION); } catch (error) { /* nada */ }
      pintarPorton();
    });

    /* Otra pestaña tocó la agenda */
    global.addEventListener('storage', function (evento) {
      if (evento.key !== LLAVE_AGENDA || $('libro').hidden) return;
      try {
        estado = evento.newValue
          ? BB.reglas.leerRespaldo(JSON.parse(evento.newValue))
          : BB.reglas.vacio();
        pintarAgenda();
      } catch (error) {
        BB.recado('Otra ventana modificó la agenda. Volvé a abrir el libro para revisarla.');
      }
    });

    var abierta = false;
    try { abierta = sessionStorage.getItem(LLAVE_SESION) === '1' && Boolean(claveGuardada()); }
    catch (error) { abierta = false; }

    if (abierta) abrirLibro();
    else pintarPorton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})(window);
