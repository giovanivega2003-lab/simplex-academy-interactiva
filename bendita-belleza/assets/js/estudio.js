/* Bendita Belleza — datos del estudio y catálogo de servicios.
   Los precios y duraciones son los del catálogo impreso del salón. */
(function (global) {
  'use strict';

  var ESTUDIO = {
    nombre: 'Bendita Belleza',
    descriptor: 'Beauty Studio',
    duena: 'Verónica Ribera',
    telefono: '59175323254',
    telefonoVisible: '+591 75323254',
    mapa: 'https://maps.app.goo.gl/kN8Gx93rWEbwNGDp6',
    direccion: 'Mercado Estación Argentina · Cuarto anillo, sector Tres Pasos al Frente',
    ciudad: 'Santa Cruz de la Sierra, Bolivia',
    zona: 'America/La_Paz',
    // Bolivia no aplica horario de verano: el desfase es fijo todo el año.
    desfase: '-04:00'
  };

  var completo = function (n) { return [{ etiqueta: 'Servicio completo', min: n, max: n }]; };
  var largos = function (a, b, c, primero) {
    return [
      { etiqueta: primero || 'Cabello corto', min: a, max: a },
      { etiqueta: 'Cabello mediano', min: b, max: b },
      { etiqueta: 'Cabello largo', min: c, max: c }
    ];
  };

  var CATEGORIAS = ['Uñas', 'Cabello', 'Maquillaje', 'Peinados'];

  var CATALOGO = [
    { id: 'manicure-pedicure', nombre: 'Manicure + pedicure', categoria: 'Uñas', descripcion: 'Cuidado de manos y pies con esmaltado tradicional.', duracion: 60, variantes: completo(60), diseno: true },
    { id: 'manicure', nombre: 'Manicure tradicional', categoria: 'Uñas', descripcion: 'Cuidado y esmaltado tradicional de manos.', duracion: 30, variantes: completo(30), diseno: true },
    { id: 'pedicure', nombre: 'Pedicure tradicional', categoria: 'Uñas', descripcion: 'Cuidado y esmaltado tradicional de pies.', duracion: 30, variantes: completo(30), diseno: true },
    { id: 'combo-gel', nombre: 'Manicure + pedicure en gel', categoria: 'Uñas', descripcion: 'Esmaltado en gel para manos y pies.', duracion: 90, variantes: completo(120), diseno: true },
    { id: 'manicure-gel', nombre: 'Manicure en gel', categoria: 'Uñas', descripcion: 'Color y brillo con esmaltado en gel.', duracion: 45, variantes: completo(60), diseno: true },
    { id: 'pedicure-gel', nombre: 'Pedicure en gel', categoria: 'Uñas', descripcion: 'Esmaltado en gel para tus pies.', duracion: 45, variantes: completo(60), diseno: true },
    { id: 'soft-gel', nombre: 'Soft gel', categoria: 'Uñas', descripcion: 'Extensiones de uñas con acabado personalizado.', duracion: 120, variantes: completo(100), diseno: true },
    { id: 'esculpidas', nombre: 'Uñas esculpidas en gel', categoria: 'Uñas', descripcion: 'Forma y largo con construcción en gel.', duracion: 150, variantes: completo(120), diseno: true },
    { id: 'postizas', nombre: 'Uñas postizas', categoria: 'Uñas', descripcion: 'Colocación y acabado de uñas postizas.', duracion: 45, variantes: completo(50), diseno: true },
    { id: 'acripie', nombre: 'Acripie', categoria: 'Uñas', descripcion: 'Servicio de uñas para los pies.', duracion: 90, variantes: completo(100), diseno: true },
    { id: 'retiro', nombre: 'Retiro de material', categoria: 'Uñas', descripcion: 'Retiro de soft gel, acrílico, poligel o gel.', duracion: 60, variantes: completo(50), diseno: false },
    { id: 'bano-crema', nombre: 'Baño de crema', categoria: 'Cabello', descripcion: 'Hidratación, brillo y suavidad. Incluye planchado.', duracion: 90, variantes: largos(70, 100, 120, 'Cabello hasta el hombro'), diseno: false },
    { id: 'botox', nombre: 'Botox capilar', categoria: 'Cabello', descripcion: 'Tratamiento de cuidado capilar. Incluye planchado.', duracion: 120, variantes: largos(100, 130, 150), diseno: false },
    { id: 'alisado', nombre: 'Alisado marroquí', categoria: 'Cabello', descripcion: 'Acabado lacio y suave. Incluye planchado.', duracion: 150, variantes: largos(150, 250, 350), diseno: false },
    { id: 'matizado', nombre: 'Matizado de cabello', categoria: 'Cabello', descripcion: 'Matización para realzar el color. Incluye planchado.', duracion: 90, variantes: largos(80, 100, 120), diseno: false },
    { id: 'ampollas', nombre: 'Tratamiento con ampollas', categoria: 'Cabello', descripcion: 'Cuidado y nutrición capilar. Incluye planchado.', duracion: 90, variantes: largos(70, 100, 120), diseno: false },
    { id: 'social', nombre: 'Maquillaje social', categoria: 'Maquillaje', descripcion: 'Incluye limpieza, preparación de la piel y pestañas postizas.', duracion: 60, variantes: completo(80), diseno: false },
    { id: 'resistencia', nombre: 'Maquillaje de alta resistencia', categoria: 'Maquillaje', descripcion: 'Incluye limpieza, preparación de la piel y pestañas postizas.', duracion: 60, variantes: completo(100), diseno: false },
    { id: 'blindada', nombre: 'Maquillaje piel blindada', categoria: 'Maquillaje', descripcion: 'Incluye limpieza, preparación de la piel y pestañas postizas.', duracion: 60, variantes: completo(130), diseno: false },
    { id: 'folklorico', nombre: 'Maquillaje folklórico full color', categoria: 'Maquillaje', descripcion: 'Con piel blindada, preparación y pestañas postizas.', duracion: 90, variantes: completo(150), diseno: false },
    { id: 'planchado', nombre: 'Planchado', categoria: 'Peinados', descripcion: 'Precio según largo y volumen del cabello.', duracion: 40, variantes: [{ etiqueta: 'Cabello corto', min: 40, max: 40 }, { etiqueta: 'Cabello mediano', min: 60, max: 60 }, { etiqueta: 'Cabello largo', min: 70, max: 80 }], diseno: false },
    { id: 'bucleado', nombre: 'Bucleado', categoria: 'Peinados', descripcion: 'Ondas y movimiento para tu cabello.', duracion: 40, variantes: largos(50, 70, 80), diseno: false },
    { id: 'cola', nombre: 'Cola alta', categoria: 'Peinados', descripcion: 'Con cola planchada o bucleada.', duracion: 40, variantes: completo(50), diseno: false },
    { id: 'alzado', nombre: 'Peinado con cabello alzado', categoria: 'Peinados', descripcion: 'Con simba y planchado o bucleado.', duracion: 40, variantes: completo(70), diseno: false }
  ];

  var NOTA_CATEGORIA = {
    'Uñas': 'Los diseños elaborados o la pedrería pueden añadir 20 Bs al servicio. El retiro de material se agenda por separado.',
    'Cabello': 'Los tratamientos incluyen planchado. El precio depende del largo y volumen del cabello; se confirma al evaluar el servicio.',
    'Maquillaje': 'Todos los maquillajes incluyen limpieza, preparación de la piel y pestañas postizas.',
    'Peinados': 'El precio del planchado depende del largo y volumen. Para cabello largo, el catálogo indica 70–80 Bs.'
  };

  var FLYER_CATEGORIA = {
    'Uñas': 'unas',
    'Cabello': 'cabello',
    'Maquillaje': 'maquillaje',
    'Peinados': 'maquillaje'
  };

  var RECARGO_DISENO = { precio: 20, minutos: 30 };

  function precioTexto(min, max) {
    if (max === undefined) max = min;
    return min === max ? min + ' Bs' : min + '–' + max + ' Bs';
  }

  function duracionTexto(m) {
    var horas = Math.floor(m / 60);
    var minutos = m % 60;
    var partes = [];
    if (horas) partes.push(horas + ' h');
    if (minutos) partes.push(minutos + ' min');
    return partes.join(' ');
  }

  function servicioPorId(id) {
    for (var i = 0; i < CATALOGO.length; i++) {
      if (CATALOGO[i].id === id) return CATALOGO[i];
    }
    return null;
  }

  function rangoServicio(servicio) {
    var min = Infinity, max = -Infinity;
    for (var i = 0; i < servicio.variantes.length; i++) {
      min = Math.min(min, servicio.variantes[i].min);
      max = Math.max(max, servicio.variantes[i].max);
    }
    return { min: min, max: max };
  }

  function whatsapp(texto, telefono) {
    var numero = String(telefono || ESTUDIO.telefono).replace(/\D/g, '');
    return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(texto);
  }

  global.BB = global.BB || {};
  global.BB.ESTUDIO = ESTUDIO;
  global.BB.CATEGORIAS = CATEGORIAS;
  global.BB.CATALOGO = CATALOGO;
  global.BB.NOTA_CATEGORIA = NOTA_CATEGORIA;
  global.BB.FLYER_CATEGORIA = FLYER_CATEGORIA;
  global.BB.RECARGO_DISENO = RECARGO_DISENO;
  global.BB.precioTexto = precioTexto;
  global.BB.duracionTexto = duracionTexto;
  global.BB.servicioPorId = servicioPorId;
  global.BB.rangoServicio = rangoServicio;
  global.BB.whatsapp = whatsapp;
})(window);
