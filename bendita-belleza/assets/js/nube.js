/* Bendita Belleza — hablar con el enlace de Google.

   El sitio sigue funcionando sin esto. Si no hay dirección configurada, o si
   no hay internet, todo cae con elegancia al camino de siempre: la solicitud
   se guarda en el teléfono y se manda por WhatsApp. */
(function (global) {
  'use strict';

  var BB = global.BB;
  var LLAVE_CLAVE_ADMIN = 'bendita_belleza_clave_admin';

  function url() {
    return String((BB.config && BB.config.URL_SCRIPT) || '').trim();
  }

  function configurada() {
    return /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(url());
  }

  /* La clave de administración nunca viaja en el código del sitio: Verónica
     la escribe una vez en el Libro y queda en su navegador. */
  function claveAdmin() {
    try { return localStorage.getItem(LLAVE_CLAVE_ADMIN) || ''; }
    catch (error) { return ''; }
  }

  function guardarClaveAdmin(valor) {
    try { localStorage.setItem(LLAVE_CLAVE_ADMIN, String(valor || '')); }
    catch (error) { /* sin almacenamiento, se pedirá de nuevo */ }
  }

  function olvidarClaveAdmin() {
    try { localStorage.removeItem(LLAVE_CLAVE_ADMIN); }
    catch (error) { /* nada que borrar */ }
  }

  /* Se manda como texto plano a propósito: así el navegador no hace la
     consulta previa de CORS, que Apps Script no sabe responder. El script lo
     recibe igual y lo interpreta como JSON. */
  function pedir(cuerpo, milisegundos) {
    if (!configurada()) {
      return Promise.reject(new Error('sin-configurar'));
    }

    var corte;
    var aborto = global.AbortController ? new AbortController() : null;
    var espera = new Promise(function (_, rechazar) {
      corte = setTimeout(function () {
        if (aborto) aborto.abort();
        rechazar(new Error('La conexión con Google tardó demasiado.'));
      }, milisegundos || 20000);
    });

    var consulta = fetch(url(), {
      method: 'POST',
      body: JSON.stringify(cuerpo),
      redirect: 'follow',
      signal: aborto ? aborto.signal : undefined
    }).catch(function (error) {
      /* El navegador dice «Failed to fetch» tanto cuando no hay internet como
         cuando Google, en vez de contestar, manda a una pantalla de inicio de
         sesión — que es lo que pasa si la implementación quedó en «Solo yo».
         Desde acá las dos se ven igual, así que el aviso nombra las dos. */
      if (error && error.name === 'AbortError') throw error;
      throw new Error('No se pudo hablar con Google. Revisá que tengas internet y que el enlace esté implementado para «Cualquier persona»: en Apps Script, Implementar → Gestionar implementaciones → lápiz ✏ → «Quién tiene acceso».');
    }).then(function (respuesta) {
      if (!respuesta.ok) throw new Error('Google respondió ' + respuesta.status + '.');
      return respuesta.text();
    }).then(function (texto) {
      var datos;
      try { datos = JSON.parse(texto); }
      catch (error) { throw new Error('La respuesta de Google no se entendió. Revisá que el enlace esté publicado para «cualquier persona».'); }
      if (!datos.ok) throw new Error(datos.error || 'Google rechazó la operación.');
      return datos;
    });

    return Promise.race([consulta, espera]).then(function (r) {
      clearTimeout(corte);
      return r;
    }, function (e) {
      clearTimeout(corte);
      throw e;
    });
  }

  function conClave(cuerpo, ms) {
    var clave = claveAdmin();
    if (!clave) return Promise.reject(new Error('sin-clave'));
    cuerpo.clave = clave;
    return pedir(cuerpo, ms);
  }

  BB.nube = {
    configurada: configurada,
    claveAdmin: claveAdmin,
    guardarClaveAdmin: guardarClaveAdmin,
    olvidarClaveAdmin: olvidarClaveAdmin,

    /* Público: la clienta manda su solicitud. */
    solicitar: function (cita) {
      return pedir({ accion: 'solicitar', cita: cita }, 15000);
    },

    /* Privado: sólo el Libro de citas. */
    probar: function (clave) {
      return pedir({ accion: 'ping', clave: clave }, 15000);
    },
    listar: function (desde) {
      return conClave({ accion: 'listar', desde: desde }, 25000);
    },
    guardar: function (cita) {
      return conClave({ accion: 'guardar', cita: cita });
    },
    estado: function (id, estado) {
      return conClave({ accion: 'estado', id: id, estado: estado });
    },
    mover: function (id, date, start) {
      return conClave({ accion: 'mover', id: id, date: date, start: start });
    },
    correo: function (id, email) {
      return conClave({ accion: 'correo', id: id, email: email });
    }
  };
})(window);
