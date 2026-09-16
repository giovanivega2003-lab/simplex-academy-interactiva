# Bendita Belleza · Beauty Studio

Sitio del estudio de Verónica Ribera, en el Mercado Estación Argentina de Santa Cruz de la
Sierra. Son **dos páginas separadas**, que era el problema principal de la versión anterior:
antes las dos vistas vivían en el mismo archivo, así que no se podía pasar el catálogo a una
clienta sin darle también el panel de la propietaria.

| Página | Archivo | Para quién |
| --- | --- | --- |
| Catálogo y solicitud de cita | `index.html` | Las clientas. Este es el enlace que se comparte. |
| Libro de citas | `agenda.html` | Solo Verónica. Pide clave y no aparece enlazado desde la página pública. |

No hay cuentas ni cobros. El sitio corre entero en el navegador.

**Sincronización (opcional).** Por defecto, la solicitud de una clienta llega al salón por
WhatsApp y Verónica la registra a mano. Si se conecta el enlace con Google —ver
[`apps-script/GUIA.md`](apps-script/GUIA.md)— las solicitudes llegan solas a una Hoja de cálculo
y a Google Calendar, la clienta recibe su invitación por correo, y el Libro de citas se ve igual
desde cualquier aparato. Es gratis y se configura una sola vez. Mientras `assets/js/config.js`
esté vacío, todo funciona como al principio.

---

## Cómo publicarlo (GitHub Pages)

1. Subí **el contenido de esta carpeta** a la raíz del repositorio
   `giovanivega2003-lab/Bendita-Belleza-`. En la raíz tienen que quedar `index.html`,
   `agenda.html`, `assets/`, `.nojekyll` y `robots.txt`.
2. En GitHub: **Settings → Pages**.
3. En *Source* elegí **Deploy from a branch**, rama `main`, carpeta `/ (root)`. Guardá.
4. A los pocos minutos quedan publicados:
   - Clientas → `https://giovanivega2003-lab.github.io/Bendita-Belleza-/`
   - Agenda → `https://giovanivega2003-lab.github.io/Bendita-Belleza-/agenda.html`

> **El repositorio tiene que ser público.** En el plan gratuito de GitHub, Pages solo publica
> repositorios públicos; con el repositorio privado la opción no aparece o falla. Hacerlo
> público no expone nada delicado: el sitio está pensado para que lo vea cualquiera, y las
> citas nunca están en el repositorio — viven en el navegador de Verónica. Se cambia en
> *Settings → General → Danger Zone → Change repository visibility*.

En `.github/workflows/pages.yml` queda un flujo de trabajo alternativo, que **no corre solo**:
solo se lanza a mano desde la pestaña *Actions*, y sirve si algún día preferís publicar con
GitHub Actions en vez de *Deploy from a branch*. Con el camino simple de arriba no hace falta
tocarlo.

El archivo `.nojekyll` evita que GitHub procese el sitio con Jekyll, y `robots.txt` le pide a
los buscadores que no indexen `agenda.html`.

---

## La agenda y la privacidad

Esto es importante y conviene entenderlo bien:

- **Las citas no viajan por internet.** Se guardan en el `localStorage` del navegador de
  Verónica y en ningún otro lado. Quien abra `agenda.html` desde otro teléfono ve un libro
  vacío: no hay nada suyo que pueda leer, porque los datos nunca salieron de su aparato.
- **La clave protege el aparato**, que es donde están los datos. Sirve contra alguien que
  agarra el teléfono. No es una cerradura contra alguien con conocimientos técnicos y acceso
  físico al aparato, y la propia pantalla lo dice.
- **Si se olvida la clave no hay recuperación.** Es a propósito: si se pudiera saltar, la clave
  no protegería nada. La única salida es empezar un libro vacío y restaurar un respaldo.
- **Por eso el botón «Respaldo» está en la barra principal**, no escondido. El archivo JSON que
  descarga es lo único que devuelve las citas si se pierde el teléfono o la clave. Conviene
  bajarlo seguido y guardarlo en el correo o en Drive.
- Los respaldos JSON de la versión anterior del sitio **se pueden restaurar acá** sin
  convertir nada.

La clienta también tiene su propia copia local en `index.html`: las solicitudes que preparó en
su teléfono, para reenviar el mensaje o volver a guardar la cita en su calendario. Son suyas y
no llegan al salón hasta que las manda por WhatsApp.

**Agendar desde el propio aparato.** Una solicitud hecha en `index.html` también se copia al
Libro **de ese mismo navegador**. Sirve cuando Verónica agenda ella misma —una clienta que llega
al local o que llama— y para probar el sitio: la cita aparece enseguida en el Libro, lista para
confirmar. Es el comportamiento que tenía la versión de un solo archivo, donde las dos vistas
compartían el almacenamiento.

Entre aparatos distintos esto no puede funcionar, y en la versión anterior tampoco funcionaba:
solo lo parecía cuando una misma persona probaba las dos vistas en un mismo teléfono. Para que
la solicitud de una clienta, hecha en **su** celular, llegue al Libro de Verónica, hace falta el
enlace con Google.

---

## Cómo funciona el calendario

Sin servidor, una página no puede crear un evento ni mandar un correo por su cuenta. Lo que sí
hace, y está armado en `assets/js/calendario.js`:

**Del lado de la clienta**, al terminar la solicitud:
- **Google Calendar** — abre el evento ya relleno en su cuenta.
- **iPhone y otros** — baja un archivo `.ics` estándar. En iPhone se abre solo en el Calendario
  y basta con tocar «Agregar»; en Android y Outlook también sirve. Este es el camino para
  iPhone: Apple no usa enlaces de Google.

El evento se guarda como *horario pedido*, con aviso un día antes y dos horas antes. La hora se
calcula en hora de Bolivia (`America/La_Paz`, UTC−4 todo el año) y se escribe en UTC, que es lo
que cualquier calendario entiende sin ambigüedad.

**Del lado de Verónica**, en cada cita hay un botón **Calendario**:
- Si la clienta dejó su correo (o Verónica lo escribe ahí mismo), el enlace crea el evento en
  **su** Google Calendar con la clienta como invitada. **Al guardar el evento, Google le manda
  la invitación por correo.** Ese correo lo envía Google desde su cuenta, no el sitio.
- Sin correo, el evento se crea solo en su calendario y la clienta no recibe nada.

El correo de la clienta es **opcional** en todo el recorrido. Sin él, la cita funciona igual: se
pide por WhatsApp y se guarda a mano en el calendario.

---

## Estructura

```
index.html              vista de la clienta
agenda.html             vista de la propietaria
robots.txt              pide no indexar la agenda
.nojekyll               GitHub Pages sirve los archivos tal cual
assets/
  css/
    libreta.css         sistema de diseño: papel, tinta, pauta, sello, botones, campos
    cliente.css         la copia rosa del talonario
    agenda.css          el libro contable verde
  fuentes/
    archivo-*.woff2     Archivo variable, autoalojada (SIL OFL 1.1)
  img/
    sello-*.webp        el logo recortado a disco con transparencia
    precios-*.webp      fotos de los catálogos impresos (grande y miniatura)
  js/
    config.js           la dirección del enlace con Google (vacío = sin sincronizar)
    nube.js             hablar con ese enlace
    estudio.js          datos del estudio y catálogo de servicios
    tiempo.js           fechas y horas en hora de Bolivia
    ui.js               iconos, recados, diálogos, descargas
    calendario.js       .ics y enlaces de Google Calendar
    reglas.js           validación de la agenda, respaldos, filas de Excel
    xlsx.js             escritor XLSX mínimo
    cliente.js          la página de la clienta
    libro.js            la agenda de la propietaria
apps-script/
  Codigo.gs             el código que corre en la cuenta de Google de Verónica
  GUIA.md               cómo instalarlo, paso a paso
```

Los scripts son clásicos, no módulos ES, a propósito: así el sitio también funciona abriendo
los archivos directamente desde el disco, sin servidor.

---

## Cambiar precios, servicios y horarios

Casi todo vive en **`assets/js/estudio.js`**, en castellano y sin sintaxis rara:

- Teléfono, dirección y enlace del mapa: el objeto `ESTUDIO` al principio.
- Servicios, precios y duraciones: la lista `CATALOGO`. Cada servicio tiene `nombre`,
  `descripcion`, `duracion` en minutos y `variantes` con los precios. `completo(60)` es un
  precio único de 60 Bs; `largos(70, 100, 120)` son los tres largos de cabello.
- El recargo por diseño elaborado: `RECARGO_DISENO`.

Los **horarios de atención** están en `assets/js/tiempo.js`, en la función `atencion()`:
domingo cerrado, lunes desde las 08:00, el resto desde las 09:00, cierre a las 20:00. Si
cambian, hay que actualizar también el texto de la sección «Te esperamos» en `index.html`.

Las **duraciones** también se ajustan desde la propia agenda, en «Duraciones y respaldos», sin
tocar código; esas se guardan por navegador.

---

## Lo que el sitio no hace

Conviene tenerlo claro para no prometerlo:

- No manda el WhatsApp solo. Prepara el texto y abre WhatsApp; la clienta aprieta enviar.
- No conoce la disponibilidad real. La página de la clienta valida el horario de atención y que
  la hora no haya pasado, nada más: **pide** una hora, no la reserva. La confirma Verónica.
- No cobra ni toma anticipos.
- **Sin el enlace con Google**, la agenda no se comparte entre aparatos y las solicitudes hay
  que registrarlas a mano desde el WhatsApp que llega. Con el enlace puesto, las dos cosas se
  resuelven.
