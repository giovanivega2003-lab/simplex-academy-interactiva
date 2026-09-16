/* Bendita Belleza — vista de la clienta.

   Lo que se guarda aquí es la copia de la clienta: sus propias solicitudes,
   en su propio navegador. No es la agenda del salón y no sabe qué horas
   están realmente libres — eso lo confirma Verónica por WhatsApp. */
(function (global) {
  'use strict';

  var BB = global.BB;
  var $ = BB.$;
  var escapar = BB.escapar;
  var LLAVE = 'bendita_belleza_solicitudes_v1';

  var categoriaActiva = BB.CATEGORIAS[0];
  var misCitas = [];
  var puedeGuardar = true;
  var ultimaCita = null;

  /* --- Guardado local ------------------------------------------------------ */

  function cargar() {
    try {
      var crudo = localStorage.getItem(LLAVE);
      if (crudo) {
        var datos = BB.reglas.leerRespaldo(JSON.parse(crudo));
        misCitas = datos.appointments;
      }
      localStorage.setItem(LLAVE + '_prueba', '1');
      localStorage.removeItem(LLAVE + '_prueba');
    } catch (error) {
      /* Puede fallar por navegación privada, por almacenamiento bloqueado o
         porque lo guardado ya no es legible. En todos los casos la solicitud
         se puede seguir enviando: lo único que se pierde es la copia. */
      misCitas = [];
      puedeGuardar = false;
    }
  }

  function guardar() {
    if (!puedeGuardar) return;
    try {
      localStorage.setItem(LLAVE, JSON.stringify({
        version: 2, appointments: misCitas, durations: {}
      }));
    } catch (error) {
      puedeGuardar = false;
    }
  }

  /* --- Catálogo ------------------------------------------------------------ */

  function duracionServicio(servicio) { return servicio.duracion; }

  function pintarPestanas() {
    $('indices').innerHTML = BB.CATEGORIAS.map(function (categoria, i) {
      var activa = categoria === categoriaActiva;
      var cuantos = BB.CATALOGO.filter(function (s) { return s.categoria === categoria; }).length;
      return '<button class="pestana" id="pestana-' + i + '" role="tab"'
        + ' aria-controls="lista-precios" aria-selected="' + activa + '"'
        + ' tabindex="' + (activa ? 0 : -1) + '" data-categoria="' + escapar(categoria) + '">'
        + escapar(categoria) + '<small class="cifra">' + cuantos + '</small></button>';
    }).join('');
  }

  function pintarLista() {
    var servicios = BB.CATALOGO.filter(function (s) { return s.categoria === categoriaActiva; });

    $('lista-precios').setAttribute('aria-labelledby', 'pestana-' + BB.CATEGORIAS.indexOf(categoriaActiva));
    $('lista-precios').innerHTML = servicios.map(function (servicio) {
      var rango = BB.rangoServicio(servicio);
      var variaPorLargo = servicio.variantes.length > 1;
      return '<button class="servicio" type="button" data-servicio="' + servicio.id + '">'
        + '<span class="servicio__linea">'
        + '<span class="servicio__nombre">' + escapar(servicio.nombre) + '</span>'
        + '<span class="servicio__guia" aria-hidden="true"></span>'
        + '<span class="servicio__precio cifra">'
        + (variaPorLargo ? '<small>desde</small>' : '')
        + BB.precioTexto(rango.min) + '</span>'
        + '</span>'
        + '<span class="servicio__pie">'
        + '<span class="servicio__nota">' + escapar(servicio.descripcion)
        + (variaPorLargo ? ' Precio según el largo.' : '') + '</span>'
        + '<span class="servicio__tiempo">' + BB.icono('reloj')
        + BB.duracionTexto(duracionServicio(servicio)) + '</span>'
        + '<span class="servicio__ir">Agendar' + BB.icono('flecha') + '</span>'
        + '</span>'
        + '</button>';
    }).join('');

    var clave = BB.FLYER_CATEGORIA[categoriaActiva];
    $('flyer-imagen').src = 'assets/img/precios-' + clave + '-min.webp';
    $('flyer-imagen').alt = 'Catálogo impreso de ' + categoriaActiva.toLowerCase() + ' del salón';
    $('flyer-boton').dataset.flyer = clave;
    $('nota-categoria').textContent = BB.NOTA_CATEGORIA[categoriaActiva];
  }

  function cambiarCategoria(categoria, enfocar) {
    categoriaActiva = categoria;
    pintarPestanas();
    pintarLista();
    if (enfocar) {
      var indice = BB.CATEGORIAS.indexOf(categoria);
      $('pestana-' + indice).focus();
    }
  }

  /* --- Los blancos de la tarjeta ------------------------------------------- */

  function pintarBlancos() {
    var min = Infinity, max = -Infinity;
    BB.CATALOGO.forEach(function (s) {
      var r = BB.rangoServicio(s);
      min = Math.min(min, r.min);
      max = Math.max(max, r.max);
    });
    $('blanco-servicio').textContent = BB.CATALOGO.length + ' en catálogo';
    $('blanco-fecha').textContent = 'Lunes a sábado';
    $('blanco-precio').textContent = BB.precioTexto(min, max);
  }

  /* --- Formulario de solicitud --------------------------------------------- */

  function llenarServicios() {
    $('f-servicio').innerHTML = BB.CATEGORIAS.map(function (categoria) {
      var opciones = BB.CATALOGO.filter(function (s) { return s.categoria === categoria; })
        .map(function (s) { return '<option value="' + s.id + '">' + escapar(s.nombre) + '</option>'; })
        .join('');
      return '<optgroup label="' + escapar(categoria) + '">' + opciones + '</optgroup>';
    }).join('');
  }

  function eleccion() {
    var servicio = BB.servicioPorId($('f-servicio').value);
    if (!servicio) throw new Error('Elige un servicio válido.');
    var indice = Number($('f-variante').value) || 0;
    var variante = servicio.variantes[indice];
    if (!variante) throw new Error('Elige una opción válida.');
    var diseno = Boolean(servicio.diseno && $('f-diseno').checked);
    return {
      servicio: servicio,
      indice: indice,
      variante: variante,
      diseno: diseno,
      duracion: duracionServicio(servicio) + (diseno ? BB.RECARGO_DISENO.minutos : 0),
      precioMin: variante.min + (diseno ? BB.RECARGO_DISENO.precio : 0),
      precioMax: variante.max + (diseno ? BB.RECARGO_DISENO.precio : 0)
    };
  }

  function llenarVariantes() {
    var servicio = BB.servicioPorId($('f-servicio').value);
    $('f-variante').innerHTML = servicio.variantes.map(function (v, i) {
      return '<option value="' + i + '">' + escapar(v.etiqueta) + ' · '
        + BB.precioTexto(v.min, v.max) + '</option>';
    }).join('');
    $('campo-variante').hidden = servicio.variantes.length === 1;
    $('campo-diseno').hidden = !servicio.diseno;
    $('f-diseno').checked = false;
    refrescar();
  }

  function llenarHoras(horas, anterior) {
    $('f-hora').innerHTML = '<option value="">'
      + (horas.length ? 'Elige una hora' : 'Sin horas en este día') + '</option>'
      + horas.map(function (m) {
        return '<option value="' + m + '">' + BB.textoHora(m) + '</option>';
      }).join('');
    if (anterior !== '' && horas.indexOf(Number(anterior)) !== -1) $('f-hora').value = anterior;
  }

  function refrescar() {
    var elegido = eleccion();
    var dia = $('f-fecha').value;
    var horas = BB.reglas.huecos(dia, elegido.duracion, misCitas);
    llenarHoras(horas, $('f-hora').value);

    var horario = BB.diaValido(dia) ? BB.atencion(dia) : null;
    $('nota-horas').textContent = horario
      ? (horas.length
        ? 'Atención de ' + BB.textoHora(horario[0]) + ' a ' + BB.textoHora(horario[1])
          + ', hora de Bolivia. Pide la hora que te sirva: Verónica te confirma si está libre.'
        : 'Ese día ya no queda espacio para este servicio antes del cierre. Prueba con otro.')
      : 'Los domingos el salón está cerrado. Elige otro día.';

    $('resumen-precio').textContent = BB.precioTexto(elegido.precioMin, elegido.precioMax);
    $('resumen-duracion').textContent = BB.duracionTexto(elegido.duracion);
    $('resumen-detalle').textContent = elegido.servicio.variantes.length > 1
      ? 'El precio final depende del largo y volumen'
      : elegido.diseno ? 'Incluye 20 Bs de diseño' : 'Sin anticipo: se paga en el salón';

    $('f-enviar').disabled = horas.length === 0;
    $('error-solicitud').textContent = '';
  }

  function abrirSolicitud(idServicio) {
    $('form-solicitud').reset();
    $('paso-formulario').hidden = false;
    $('paso-copia').hidden = true;

    $('f-servicio').value = idServicio || BB.CATALOGO[0].id;
    var hoy = BB.diaLocal();
    $('f-fecha').min = hoy;
    $('f-fecha').max = BB.sumaDias(hoy, 180);
    $('f-fecha').value = hoy;
    llenarVariantes();

    /* Si hoy ya no entra el servicio, abre en el primer día que sí. */
    var duracion = eleccion().duracion;
    for (var i = 0; i <= 180; i++) {
      var dia = BB.sumaDias(hoy, i);
      if (BB.reglas.huecos(dia, duracion, misCitas).length) { $('f-fecha').value = dia; break; }
    }
    refrescar();

    $('dialogo-solicitud').showModal();
  }

  /* --- Mensaje de WhatsApp -------------------------------------------------- */

  function mensajeClienta(a) {
    var lineas = [
      'Hola, Verónica. Quisiera solicitar una cita en Bendita Belleza.',
      '',
      'Nombre: ' + a.clientName,
      'WhatsApp: +' + a.phone
    ];
    if (a.email) lineas.push('Correo (para la invitación de calendario): ' + a.email);
    lineas.push('Servicio: ' + a.serviceName
      + (a.variantName === 'Servicio completo' ? '' : ' — ' + a.variantName));
    if (a.art) lineas.push('Diseño elaborado o pedrería: sí');
    lineas.push('Fecha: ' + BB.etiquetaDiaLarga(a.date));
    lineas.push('Hora que pido: ' + BB.textoHora(a.start) + ' (Bolivia)');
    lineas.push('Precio de catálogo: ' + BB.precioTexto(a.priceMin, a.priceMax));
    if (a.notes) lineas.push('Observaciones: ' + a.notes);
    lineas.push('');
    lineas.push('Quedo pendiente de tu confirmación de horario y precio. Referencia: ' + a.id);
    return lineas.join('\n');
  }

  /* --- La copia de la cita -------------------------------------------------- */

  function pintarCopia(a) {
    ultimaCita = a;
    $('paso-formulario').hidden = true;
    $('paso-copia').hidden = false;

    $('copia-servicio').textContent = a.serviceName
      + (a.variantName === 'Servicio completo' ? '' : ' · ' + a.variantName)
      + (a.art ? ' · con diseño' : '');
    $('copia-fecha').textContent = BB.etiquetaDiaLarga(a.date);
    $('copia-hora').textContent = BB.textoHora(a.start) + ' · ' + BB.duracionTexto(a.duration);
    $('copia-precio').textContent = BB.precioTexto(a.priceMin, a.priceMax);
    $('copia-nombre').textContent = a.clientName;
    $('copia-referencia').textContent = a.id;

    var enlace = $('copia-whatsapp');
    enlace.href = BB.whatsapp(mensajeClienta(a));
    enlace.target = '_blank';
    enlace.rel = 'noopener noreferrer';

    $('copia-google').href = BB.calendario.urlGoogle(a);

    $('dialogo-solicitud').scrollTop = 0;
    enlace.focus();

    /* El único momento de deleite del sitio: el sello cae sobre la copia.
       Dos cuadros de espera para que el navegador pinte el estado inicial
       antes de transicionar. */
    var sello = $('copia-sello');
    sello.dataset.estampado = 'no';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { sello.dataset.estampado = 'si'; });
    });
  }

  function enviarSolicitud(evento) {
    evento.preventDefault();
    try {
      var elegido = eleccion();
      var nombre = $('f-nombre').value.trim();
      var tel = BB.reglas.telefono($('f-telefono').value);
      var correo = $('f-correo').value.trim();

      if (!nombre || nombre.length > 100) throw new Error('Escribe tu nombre, con un máximo de 100 caracteres.');
      if (!tel) throw new Error('Escribe un WhatsApp válido: 8 dígitos para Bolivia, o el número completo con código de país.');
      if (correo && !BB.calendario.correoValido(correo)) {
        throw new Error('Ese correo no parece válido. Revísalo o déjalo vacío: es opcional.');
      }
      if ($('f-hora').value === '') throw new Error('Elige una hora.');
      if (!$('f-acepto').checked) throw new Error('Confirmá que entendés que la cita queda por confirmar.');

      var fecha = $('f-fecha').value;
      var inicio = Number($('f-hora').value);
      var problema = BB.reglas.errorReserva(fecha, inicio, elegido.duracion, misCitas);
      if (problema) { refrescar(); throw new Error(problema); }

      var cita = {
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
        notes: $('f-notas').value.trim().slice(0, 1000),
        status: 'pending',
        createdAt: new Date().toISOString(),
        priceMin: elegido.precioMin,
        priceMax: elegido.precioMax
      };

      misCitas.push(cita);
      guardar();
      pintarMisCitas();
      pintarCopia(cita);
      enviarAlSalon(cita);
    } catch (error) {
      $('error-solicitud').textContent = error.message;
    }
  }

  /* --- Envío directo al salón ----------------------------------------------- */

  /* Si el enlace con Google está configurado, la solicitud llega sola a la
     agenda de Verónica. Si no lo está, o si falla, WhatsApp sigue siendo el
     camino: por eso el botón de WhatsApp nunca depende de esto. */
  function enviarAlSalon(cita) {
    var caja = $('copia-estado-nube');
    if (!BB.nube.configurada()) { caja.hidden = true; return; }

    caja.hidden = false;
    caja.className = 'aviso';
    caja.innerHTML = BB.icono('reloj') + '<span>Avisando al salón…</span>';

    BB.nube.solicitar(cita).then(function () {
      caja.className = 'aviso aviso--ok';
      caja.innerHTML = BB.icono('check')
        + '<span><strong>Tu solicitud ya llegó a la agenda del salón.</strong> '
        + 'Igual conviene mandar el WhatsApp: así Verónica te responde por ahí.</span>';
    }).catch(function () {
      caja.className = 'aviso aviso--alta';
      caja.innerHTML = BB.icono('alerta')
        + '<span>No se pudo avisar al salón automáticamente. '
        + '<strong>Mandá el WhatsApp</strong> para que reciban tu solicitud.</span>';
    });
  }

  /* --- Mis solicitudes guardadas -------------------------------------------- */

  function pintarMisCitas() {
    var hoy = BB.diaLocal();
    var vigentes = misCitas.filter(function (a) { return a.date >= hoy; })
      .sort(function (a, b) { return a.date.localeCompare(b.date) || a.start - b.start; });

    $('bloque-mis-citas').hidden = vigentes.length === 0;
    if (!vigentes.length) return;

    $('mis-citas').innerHTML = vigentes.map(function (a) {
      return '<article class="mi-cita">'
        + '<div class="mi-cita__alto">'
        + '<h3>' + escapar(a.serviceName) + '</h3>'
        + '<span class="sello sello--espera">Por confirmar</span>'
        + '</div>'
        + '<p class="apunte cifra">' + escapar(BB.etiquetaDiaLarga(a.date)) + ' · '
        + BB.textoHora(a.start) + ' · ' + BB.precioTexto(a.priceMin, a.priceMax) + '</p>'
        + '<div class="mi-cita__acciones">'
        + '<a class="boton boton--sello" target="_blank" rel="noopener noreferrer" href="'
        + escapar(BB.whatsapp(mensajeClienta(a))) + '">' + BB.icono('whatsapp') + 'Reenviar</a>'
        + '<button class="boton boton--linea" type="button" data-ics="' + escapar(a.id) + '">'
        + BB.icono('descarga') + 'Calendario</button>'
        + '<button class="boton boton--quieto" type="button" data-olvidar="' + escapar(a.id) + '">'
        + 'Quitar</button>'
        + '</div>'
        + '</article>';
    }).join('');
  }

  function citaPorId(id) {
    for (var i = 0; i < misCitas.length; i++) if (misCitas[i].id === id) return misCitas[i];
    return null;
  }

  /* --- Arranque ------------------------------------------------------------- */

  function iniciar() {
    BB.montarIconos();
    BB.prepararDialogos();
    cargar();
    pintarBlancos();
    pintarPestanas();
    pintarLista();
    llenarServicios();
    pintarMisCitas();

    if (BB.nube.configurada()) {
      $('texto-acepto').textContent = 'Entiendo que la cita queda por confirmar hasta que el '
        + 'salón me responda.';
    }

    if (!puedeGuardar) {
      $('aviso-guardado').hidden = false;
    }

    document.querySelectorAll('[data-whatsapp]').forEach(function (enlace) {
      enlace.href = BB.whatsapp(enlace.dataset.whatsapp);
      enlace.target = '_blank';
      enlace.rel = 'noopener noreferrer';
    });

    /* Pestañas de categoría */
    $('indices').addEventListener('click', function (evento) {
      var pestana = evento.target.closest('[data-categoria]');
      if (pestana) cambiarCategoria(pestana.dataset.categoria, true);
    });

    $('indices').addEventListener('keydown', function (evento) {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].indexOf(evento.key) === -1) return;
      evento.preventDefault();
      var i = BB.CATEGORIAS.indexOf(categoriaActiva);
      var total = BB.CATEGORIAS.length;
      if (evento.key === 'Home') i = 0;
      else if (evento.key === 'End') i = total - 1;
      else i = (i + (evento.key === 'ArrowRight' ? 1 : -1) + total) % total;
      cambiarCategoria(BB.CATEGORIAS[i], true);
    });

    /* Catálogo → solicitud */
    $('lista-precios').addEventListener('click', function (evento) {
      var fila = evento.target.closest('[data-servicio]');
      if (fila) abrirSolicitud(fila.dataset.servicio);
    });

    document.querySelectorAll('[data-abrir-solicitud]').forEach(function (boton) {
      boton.addEventListener('click', function () { abrirSolicitud(''); });
    });

    /* Catálogo impreso */
    $('flyer-boton').addEventListener('click', function () {
      $('flyer-grande').src = 'assets/img/precios-' + this.dataset.flyer + '.webp';
      $('flyer-grande').alt = 'Catálogo impreso de ' + categoriaActiva.toLowerCase();
      $('dialogo-flyer').showModal();
    });

    /* Formulario */
    $('f-servicio').addEventListener('change', llenarVariantes);
    ['f-variante', 'f-diseno', 'f-fecha'].forEach(function (id) {
      $(id).addEventListener('change', refrescar);
    });
    $('form-solicitud').addEventListener('submit', enviarSolicitud);

    /* Calendario desde la copia */
    $('copia-ics').addEventListener('click', function () {
      if (ultimaCita) BB.calendario.descargarIcs(ultimaCita);
    });

    /* Mis solicitudes */
    $('mis-citas').addEventListener('click', function (evento) {
      var ics = evento.target.closest('[data-ics]');
      if (ics) {
        var cita = citaPorId(ics.dataset.ics);
        if (cita) BB.calendario.descargarIcs(cita);
        return;
      }
      var olvidar = evento.target.closest('[data-olvidar]');
      if (olvidar) {
        var id = olvidar.dataset.olvidar;
        if (!global.confirm('¿Quitar esta solicitud de tu copia? El salón no se entera: si ya la enviaste por WhatsApp, sigue en pie.')) return;
        misCitas = misCitas.filter(function (a) { return a.id !== id; });
        guardar();
        pintarMisCitas();
        BB.recado('Solicitud quitada de tu copia.');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})(window);
