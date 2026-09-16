---
version: 1
slug: "bendita-belleza-index-html"
primary_target: "bendita-belleza/index.html"
related_targets: ["bendita-belleza/agenda.html"]
---

## Direction contract

THESIS: Este sitio es la papelería de un salón que trabaja — la tarjeta de cita y el libro de
citas — no un folleto de belleza. Rechaza el arreglo por defecto de la categoría: fondo crema,
serif de alto contraste, dorado, fotografía suave y una rejilla de tarjetas idénticas de
icono + título + texto. El catálogo se lee como un libro mayor con columnas de precio, porque
el precio es el producto.

OWN-WORLD: Papel autocopiativo. Fondo rosa plano e industrial del talonario (`--copia`), no
rosa pastel; papel blanco frío del original (`--papel`); tinta violeta de tampón (`--tinta`,
`--sello`); cian de línea de pauta (`--pauta`); verde de libro contable para la superficie de
la propietaria (`--libro`). Tipografía Archivo en un solo eje ancho/peso: Expanded 700/800 de
display, regular de texto, cifras tabulares en todo precio y hora. El componente base es la
línea de pauta, nunca la tarjeta: filas regladas con líder de puntos, pestañas de índice para
las categorías, perforado como separador de sección, y el sello de goma como único lenguaje de
estado. Sin sombras de papel, sin texturas rasterizadas, sin letra manuscrita.

STORY: La clienta entiende en la primera pantalla que esto es una cita concreta con un precio
publicado, no una consulta. Cree que el precio que ve es el precio que paga porque el rango y
lo que lo mueve están escritos al lado. Elige servicio, pide día y hora, y se lleva su copia:
el mensaje de WhatsApp listo y el evento en su propio calendario.

FIRST VIEWPORT: A 390px, sin foto de portada. Membrete del formulario arriba: el sello circular
de la marca a la izquierda, "BENDITA BELLEZA / BEAUTY STUDIO" en Archivo Expanded a su derecha,
y bajo una regla gruesa el número de WhatsApp y la dirección en versalitas. Debajo, la tarjeta
de cita en rosa `--copia` a sangre, con tres blancos ya rellenos sobre líneas de pauta con
líder de puntos: SERVICIO / FECHA / PRECIO. La acción primaria es el sello violeta "AGENDAR",
ancho completo, sobre la tarjeta. Al pie del viewport, la línea de perforado y el primer
renglón del libro mayor de precios asomando, para que se lea que abajo hay una lista real.

FORM: Libreta de citas — candidato 4 de la lista ordenada por resonancia, asignado por la
tirada; seed key 8b984505. La tirada corrió degradada (sin retadores ni tableros de calidad:
el dominio de la skill está bloqueado por la política de red del entorno). La copia al carbón
del talonario es también la arquitectura: `index.html` es la copia de la clienta, `agenda.html`
es el libro de la propietaria — dos papeles del mismo talonario.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the
verdict, DESIGN.md, and every shipping raster carrying its provenance
