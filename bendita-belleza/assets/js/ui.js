/* Bendita Belleza — piezas de interfaz compartidas: iconos, recados,
   diálogos y descargas. */
(function (global) {
  'use strict';

  var BB = global.BB;

  /* --- Utilidades --------------------------------------------------------- */

  function $(id) { return document.getElementById(id); }

  function escapar(valor) {
    return String(valor === null || valor === undefined ? '' : valor)
      .replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
  }

  function descargarArchivo(datos, nombre, tipo) {
    var blob = datos instanceof Blob ? datos : new Blob([datos], { type: tipo });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 30000);
  }

  function icono(nombre, clase) {
    return '<svg class="icono ' + (clase || '') + '" aria-hidden="true" viewBox="0 0 24 24">'
      + '<use href="#i-' + nombre + '"></use></svg>';
  }

  /* --- Juego de iconos ----------------------------------------------------
     Trazo 1.7 en rejilla de 24, remates redondos. Un solo peso en todo el
     sitio: ningún glifo de teclado hace de icono. */

  var SPRITE = [
    '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">',
    '<symbol id="i-whatsapp" viewBox="0 0 24 24"><path d="M3.5 20.5l1.3-4.3A8.2 8.2 0 1 1 8 19.3l-4.5 1.2Z"/><path d="M9 8.6c.3 1 .8 2 1.6 2.8.8.8 1.8 1.4 2.8 1.7l1-1.2 2 .9-.3 1.6c-1.9.4-4-.5-5.5-2-1.5-1.5-2.4-3.6-2-5.5l1.6-.3.9 2L9 8.6Z"/></symbol>',
    '<symbol id="i-calendario" viewBox="0 0 24 24"><rect x="3.2" y="5" width="17.6" height="15.8" rx="2.4"/><path d="M3.2 9.8h17.6M8 3.2v3.6M16 3.2v3.6"/></symbol>',
    '<symbol id="i-manzana" viewBox="0 0 24 24"><path d="M16.2 12.6c0-2.2 1.8-3.2 1.9-3.3-1-1.5-2.6-1.7-3.2-1.8-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-2.9-.8-1.5 0-2.9.9-3.6 2.2-1.6 2.7-.4 6.7 1.1 8.9.7 1.1 1.6 2.3 2.8 2.2 1.1 0 1.5-.7 2.9-.7 1.3 0 1.7.7 2.9.7 1.2 0 2-1.1 2.7-2.1.5-.8.9-1.6 1.1-2.4-2.8-1.1-2.3-4.7-2.3-3.7Z"/><path d="M14.3 5.9c.6-.7 1-1.7.9-2.7-.9 0-2 .6-2.6 1.3-.6.6-1 1.6-.9 2.6 1 .1 2-.5 2.6-1.2Z"/></symbol>',
    '<symbol id="i-descarga" viewBox="0 0 24 24"><path d="M12 3.6v11.2M7.6 10.6 12 15l4.4-4.4"/><path d="M4 16.4v2.2a1.8 1.8 0 0 0 1.8 1.8h12.4a1.8 1.8 0 0 0 1.8-1.8v-2.2"/></symbol>',
    '<symbol id="i-flecha" viewBox="0 0 24 24"><path d="M4.5 12h14M13 6.5 18.5 12 13 17.5"/></symbol>',
    '<symbol id="i-check" viewBox="0 0 24 24"><path d="m4.8 12.6 4.6 4.6L19.2 7.4"/></symbol>',
    '<symbol id="i-cerrar" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></symbol>',
    '<symbol id="i-buscar" viewBox="0 0 24 24"><circle cx="10.6" cy="10.6" r="6.4"/><path d="m15.4 15.4 4.4 4.4"/></symbol>',
    '<symbol id="i-abajo" viewBox="0 0 24 24"><path d="m6 9.5 6 6 6-6"/></symbol>',
    '<symbol id="i-izq" viewBox="0 0 24 24"><path d="m14.5 6-6 6 6 6"/></symbol>',
    '<symbol id="i-der" viewBox="0 0 24 24"><path d="m9.5 6 6 6-6 6"/></symbol>',
    '<symbol id="i-reloj" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.4"/><path d="M12 7.2V12l3.2 2"/></symbol>',
    '<symbol id="i-lugar" viewBox="0 0 24 24"><path d="M19 10.4c0 5-7 10.4-7 10.4s-7-5.4-7-10.4a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10.2" r="2.6"/></symbol>',
    '<symbol id="i-telefono" viewBox="0 0 24 24"><path d="M20.4 16.6v2.6a1.8 1.8 0 0 1-2 1.8 17.6 17.6 0 0 1-7.7-2.7 17.3 17.3 0 0 1-5.3-5.3A17.6 17.6 0 0 1 2.7 5.2a1.8 1.8 0 0 1 1.8-2h2.6a1.8 1.8 0 0 1 1.8 1.5c.1.9.3 1.7.7 2.5a1.8 1.8 0 0 1-.4 1.9l-1.1 1.1a14 14 0 0 0 5.3 5.3l1.1-1.1a1.8 1.8 0 0 1 1.9-.4c.8.3 1.6.6 2.5.7a1.8 1.8 0 0 1 1.5 1.9Z"/></symbol>',
    '<symbol id="i-mas" viewBox="0 0 24 24"><path d="M12 5.2v13.6M5.2 12h13.6"/></symbol>',
    '<symbol id="i-llave" viewBox="0 0 24 24"><rect x="4.4" y="10.2" width="15.2" height="10.4" rx="2.2"/><path d="M8 10.2V7.4a4 4 0 0 1 8 0v2.8"/></symbol>',
    '<symbol id="i-hoja" viewBox="0 0 24 24"><path d="M13.4 3.4H7a2 2 0 0 0-2 2v13.2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9l-5.6-5.6Z"/><path d="M13.4 3.4V9H19M8.6 13h6.8M8.6 16.6h4.6"/></symbol>',
    '<symbol id="i-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.4"/><path d="M12 11.2v5M12 7.9v.1"/></symbol>',
    '<symbol id="i-alerta" viewBox="0 0 24 24"><path d="M10.5 4.2 2.8 17.6a1.7 1.7 0 0 0 1.5 2.6h15.4a1.7 1.7 0 0 0 1.5-2.6L13.5 4.2a1.7 1.7 0 0 0-3 0Z"/><path d="M12 9.4v4M12 16.6v.1"/></symbol>',
    '<symbol id="i-lapiz" viewBox="0 0 24 24"><path d="M15.6 4.6a2.3 2.3 0 0 1 3.3 3.3L8.3 18.5 4 19.6l1.1-4.3L15.6 4.6Z"/></symbol>',
    '<symbol id="i-veda" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.4"/><path d="m6.6 6.6 10.8 10.8"/></symbol>',
    '<symbol id="i-sobre" viewBox="0 0 24 24"><rect x="3.2" y="5.4" width="17.6" height="13.2" rx="2.2"/><path d="m3.8 7 7.1 5.2a2 2 0 0 0 2.2 0L20.2 7"/></symbol>',
    '<symbol id="i-libro" viewBox="0 0 24 24"><path d="M4 5.4A2 2 0 0 1 6 3.4h13.2v14.4H6a2 2 0 0 0-2 2V5.4Z"/><path d="M4 19.8a2 2 0 0 1 2-2h13.2v2.8H6a2 2 0 0 1-2-.8ZM8.4 7.6h6.4M8.4 11h4.4"/></symbol>',
    '</svg>'
  ].join('');

  function montarIconos() {
    if (document.getElementById('bb-sprite')) return;
    var contenedor = document.createElement('div');
    contenedor.id = 'bb-sprite';
    contenedor.hidden = true;
    contenedor.innerHTML = SPRITE;
    document.body.insertBefore(contenedor, document.body.firstChild);
  }

  /* --- Recado (aviso breve) ----------------------------------------------- */

  var relojRecado;

  function recado(mensaje) {
    var caja = $('recado');
    if (!caja) return;
    caja.textContent = mensaje;
    caja.hidden = false;
    clearTimeout(relojRecado);
    relojRecado = setTimeout(function () { caja.hidden = true; }, 6000);
  }

  /* --- Diálogos ----------------------------------------------------------- */

  /* Cierra con la animación de salida antes de soltar el diálogo, para que
     no desaparezca de golpe. El fallback cierra igual si no hay animación. */
  function cerrar(dialogo) {
    if (!dialogo || !dialogo.open) return;
    var reduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { dialogo.close(); return; }
    dialogo.classList.add('cerrando');
    var listo = false;
    var fin = function () {
      if (listo) return;
      listo = true;
      dialogo.classList.remove('cerrando');
      dialogo.close();
    };
    dialogo.addEventListener('animationend', fin, { once: true });
    setTimeout(fin, 260);
  }

  function prepararDialogos() {
    var dialogos = document.querySelectorAll('dialog');
    for (var i = 0; i < dialogos.length; i++) {
      (function (dialogo) {
        /* Clic fuera de la hoja = cerrar. Se compara contra la caja real para
           no confundir un clic sobre el contenido con uno sobre el fondo. */
        dialogo.addEventListener('click', function (evento) {
          if (evento.target !== dialogo) return;
          var caja = dialogo.getBoundingClientRect();
          if (evento.clientX < caja.left || evento.clientX > caja.right
            || evento.clientY < caja.top || evento.clientY > caja.bottom) cerrar(dialogo);
        });
        dialogo.addEventListener('cancel', function (evento) {
          evento.preventDefault();
          cerrar(dialogo);
        });
      })(dialogos[i]);
    }
    document.addEventListener('click', function (evento) {
      var boton = evento.target.closest('[data-cerrar]');
      if (boton) cerrar(boton.closest('dialog'));
    });
  }

  BB.$ = $;
  BB.escapar = escapar;
  BB.descargarArchivo = descargarArchivo;
  BB.icono = icono;
  BB.montarIconos = montarIconos;
  BB.recado = recado;
  BB.cerrarDialogo = cerrar;
  BB.prepararDialogos = prepararDialogos;
})(window);
