# Sistema de diseño — «La libreta de citas»

Documentado desde el build, no antes. La fuente de verdad son los tokens de
`assets/css/libreta.css`; esto explica qué significan y cuándo se usan.

## El mundo

La papelería real de un salón que trabaja: la tarjeta de cita, el libro de citas, el talonario
autocopiativo y el sello de goma. **El componente base es el renglón, no la tarjeta.** El
catálogo se lee como un libro mayor con columnas de precio porque el precio *es* el producto.

La copia al carbón es también la arquitectura: `index.html` es la copia rosa que se lleva la
clienta, `agenda.html` es el libro verde que se queda el salón. Dos papeles del mismo talonario.

**Se rechaza explícitamente** el arreglo por defecto de la categoría: fondo crema, serif de alto
contraste, dorado, fotografía suave, rejilla de tarjetas idénticas de icono + título + texto.
El fondo `--papel` es deliberadamente **frío y con matiz violeta**, no crema: el crema tibio es
el fondo al que deriva toda página de belleza generada, y la primera versión de este build cayó
en él hasta que el detector lo marcó.

## Color

Estrategia **comprometida**: un color saturado carga entre el 30 % y el 60 % de la superficie.
En la vista de la clienta ese color es el rosa del talonario; en la de la propietaria, el verde
del libro contable.

| Token | Valor | Qué es y dónde va |
| --- | --- | --- |
| `--papel` | `#f7f4f8` | El original blanco frío. Fondo de lectura. |
| `--papel-honda` | `#ebe5ee` | Un tono más hundido: columnas secundarias, pestañas inactivas. |
| `--copia` | `#f0a8b8` | El rosa plano del papel autocopiativo. Campos enteros: la tarjeta de cita, la cabecera de los diálogos, la pestaña activa. |
| `--copia-suave` | `#f8dae1` | La misma copia, más lavada. Fondos de apoyo y estados `:hover`. |
| `--copia-honda` | `#d4788e` | Subrayados y barra de desplazamiento. |
| `--tinta` | `#2e1435` | Violeta casi negro. Todo el texto. 15,2:1 sobre `--papel`. |
| `--tinta-media` | `#55305e` | Texto secundario, teñido del mismo violeta, nunca gris. 9,8:1 sobre `--papel`, 5,6:1 sobre `--copia`. |
| `--sello` | `#7a2e8f` | Violeta de tampón. Acción primaria, precios, sellos. 7,4:1 sobre `--papel`. |
| `--pauta` | `#6fb3ce` | Cian de línea reglada. Líderes de puntos, bordes de campo. |
| `--libro` | `#f2f6ef` | El papel pálido del libro contable. Fondo de `agenda.html`. |
| `--libro-barra` | `#d7e8d4` | La banda verde que alterna renglones y hace de línea divisoria. |
| `--libro-regla` | `#2f5e45` | Verde de la regla y del membrete del libro. |
| `--marca-ok` `--marca-alta` `--marca-espera` | `#1f6b4a` `#a8341c` `#7a2e8f` | Los tres tintones de estado. |

Sin gradientes, sin cristal, sin texto con degradado. El color viene en campos enteros, no en
acentos sueltos sobre un fondo neutro.

## Tipografía

**Archivo** variable, autoalojada en `assets/fuentes/` (SIL OFL 1.1). Una sola familia con dos
extremos de su eje de ancho: es la letra de los formularios impresos.

- Titulares: `font-stretch: 118%`, `font-weight: 800`, versalitas, `letter-spacing: -0.03em`,
  `line-height: 0.94`. `h1` `clamp(2.6rem, 9.4vw, 4.6rem)`; `h2` `clamp(1.85rem, 5.6vw, 3rem)`.
- Texto: 100 % / 400, interlínea 1,55, medida máxima 68ch.
- `.rotulo` — las versalitas impresas del talonario: 11px, ancho 88 %, peso 700,
  `letter-spacing: 0.17em`. Es la etiqueta de todo blanco de formulario.
- `.cifra` — `tabular-nums` en todo precio, hora y duración, para que las columnas alineen.
- Nada baja de 11px. Los campos nunca bajan de 16px: por debajo, iOS hace zoom al enfocar y no
  vuelve.

## Componentes propios

- **`.renglon`** — etiqueta, líder de puntos y valor. El líder es un `span` vacío con
  `border-bottom: 2px dotted` y `align-self: baseline`, así se apoya en la misma línea base que
  la etiqueta aunque el valor ocupe dos líneas. Es la unidad de composición de todo el sitio.
- **`.sello`** — el sello de goma: versalitas condensadas, doble filete (`border` + `box-shadow:
  inset`), `rotate(-2.5deg)`, `mix-blend-mode: multiply` y opacidad 0,88 para que lea como tinta
  sobre el papel. Es el **único** lenguaje de estado, en las dos vistas.
- **`.pestana`** — pestañas de índice de carpeta: la activa sube 3px y se une a la hoja de abajo
  compartiendo su color de borde inferior.
- **`.perforado`** — la línea de troquelado entre secciones, con `mask-image` de círculos
  repetidos. Geometría, no textura rasterizada.
- **`.cuentas`** — flex, no grid: al envolver, los renglones crecen hasta llenar la fila y no
  dejan un hueco de color. Las divisiones son el fondo asomando por un `gap: 1px`.
- **Iconos** — juego propio de SVG en `assets/js/ui.js`, trazo 1,7 en rejilla de 24, remates
  redondos, montado como `<symbol>` y usado con `<use>`. Ningún glifo de teclado hace de icono.

## Movimiento

Un solo momento de autor: **el sello cae sobre la copia de la cita** al preparar la solicitud, y
el mismo sello marca los estados en la agenda. Todo lo demás es respuesta, no espectáculo.

| Qué | Herramienta | Propiedades | Curva y tiempo |
| --- | --- | --- | --- |
| El sello | transición CSS por clase | `transform` + `opacity`, de `rotate(-14deg) scale(1.28)` a `rotate(-6deg) scale(1)` | `--sale` 260ms |
| Diálogos | `@keyframes` al abrir, clase `.cerrando` al salir | `opacity` + `scale(0.97) translateY(10px)` | `--sale` 220ms / 160ms |
| Pestañas de categoría | transición de color | `background-color`, `color` | `ease` 150ms |
| Renglón del catálogo | transición de color | `background-color`, color del líder | `ease` 120ms |
| Botones al pulsar | transición | `transform: translateY(1px) scale(0.99)` | `--sale` 120ms |
| Recado | transición, no keyframes | `opacity` + `translateY` | `--sale` 220ms |

Curvas: `--sale: cubic-bezier(0.23, 1, 0.32, 1)`, `--entra-sale: cubic-bezier(0.77, 0, 0.175, 1)`.
Nada de `ease-in` en interfaz, nada de `transition: all`, nada de `scale(0)`, nada que anime
`width`/`height`/`top`/`left`.

**No se anima el cambio de categoría**: el panel no se mueve de sitio, así que no hay salto que
suavizar, y la lista se ve decenas de veces por sesión. El cambio de estado de la pestaña es
toda la respuesta que hace falta.

Todo el movimiento pasa por `@media (prefers-reduced-motion: reduce)`, que deja las opacidades y
quita los desplazamientos. Todo `:hover` vive dentro de `@media (hover: hover) and (pointer:
fine)`.

## En el teléfono

Es el aparato real: la composición se decide a 390px y el escritorio es la adaptación.

`viewport-fit=cover` con `env(safe-area-inset-*)` en membrete, pie y recado;
`interactive-widget=resizes-content`; `-webkit-tap-highlight-color: transparent`;
`touch-action: manipulation` y `user-select: none` en los controles; `overscroll-behavior:
contain` en el cuerpo de los diálogos (en la raíz no, porque esto es un documento que se
desplaza y el tirón para recargar es bienvenido); `100dvh` en el portón de la agenda; y bajo
`@media (pointer: coarse)` los enlaces que están solos suben a 44px de alto.

## Superficies del navegador

Se tematiza lo que no se dibuja: `::selection` violeta, `accent-color` y `caret-color`,
`scrollbar-color`, y un anillo de foco de 3px en `--sello` (en `--libro-regla` dentro del
libro). Es lo más barato que separa una página construida de una ensamblada.
