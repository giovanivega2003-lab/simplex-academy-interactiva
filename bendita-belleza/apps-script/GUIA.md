# Conectar el sitio con tu Google

Esto se hace **una sola vez** y toma unos 10 minutos. Cuando termines:

- Las solicitudes de tus clientas te van a llegar **solas** a una Hoja de cálculo y a tu
  **Google Calendar**, sin que copies nada a mano.
- A la clienta que dejó su correo le va a llegar **la invitación del calendario** automáticamente,
  con su aviso al teléfono.
- Tu **Libro de citas** va a mostrar lo mismo desde el teléfono, la tablet o la computadora.

Es gratis: usa tu propia cuenta de Google.

> Hacelo desde una **computadora** si podés. En el teléfono se puede, pero el editor de Google
> es incómodo en pantalla chica.

---

## Paso 1 — Abrir el editor de código

Entrá a [script.new](https://script.new) con la cuenta de Google del salón.

Se abre un proyecto nuevo con un archivo llamado `Código.gs` que trae unas pocas líneas de
ejemplo.

> **La Hoja de cálculo no hace falta crearla.** El enlace la crea él mismo la primera vez que
> corre, con el nombre *Agenda Bendita Belleza*, y en el paso 4 te dice dónde quedó. Si algún
> día esa hoja se borra o Google la bloquea, el enlace hace una nueva y sigue anotando citas en
> vez de dejar de recibirlas.

---

## Paso 2 — Pegar el código

1. **Borrá todo** lo que haya en ese archivo (tocá adentro, `Ctrl+A`, `Suprimir`).
2. Abrí el archivo **`apps-script/Codigo.gs`** de este repositorio, copiá **todo** su contenido
   y pegalo ahí.
3. Arriba a la izquierda, ponele un nombre al proyecto, por ejemplo **Enlace Bendita Belleza**.

---

## Paso 3 — Poner tu clave

Cerca del principio del código vas a ver esta línea:

```js
var CLAVE_ADMIN = 'cambiá-esto-por-una-clave-larga-y-tuya';
```

Cambiá ese texto por una clave tuya, **larga y difícil de adivinar**. Por ejemplo:

```js
var CLAVE_ADMIN = 'Bendita2026-Mercado-Estacion-77x';
```

**Anotala donde no se pierda.** La vas a necesitar una vez en el Libro de citas.

> No uses la misma clave con la que abrís el Libro. Son dos cosas distintas: esta protege el
> enlace con Google; la otra protege el Libro en tu teléfono.

Guardá con el ícono del diskette o `Ctrl+S`.

---

## Paso 4 — Dar los permisos

Arriba hay un desplegable de funciones. Elegí **`probar`** y tocá **Ejecutar** (▶).

Google te va a pedir permiso. Esta parte asusta un poco, pero es normal:

1. **Revisar permisos** → elegí tu cuenta.
2. Aparece una pantalla que dice *«Google no ha verificado esta aplicación»*. Es esperable:
   la aplicación sos vos misma, recién creada, y Google solo verifica las que se publican para
   el público. Tocá **Configuración avanzada** (abajo a la izquierda).
3. Tocá **Ir a Enlace Bendita Belleza (no seguro)**.
4. **Permitir**.

Le estás dando permiso a tu propio script para escribir en tu hoja y en tu calendario. Nadie más
que vos puede modificarlo.

Si al terminar el registro de ejecución dice **«Todo en orden»**, el paso salió bien. Si dice que
falta cambiar `CLAVE_ADMIN`, volvé al paso 3.

En ese mismo registro, la línea **`Planilla:`** trae el enlace de la Hoja de cálculo que acabás
de crear sin querer. **Guardala en favoritos**: ahí van a ir quedando todas las citas, y desde
*Archivo → Descargar* la bajás como Excel cuando quieras.

---

## Paso 5 — Publicar el enlace

1. Arriba a la derecha: **Implementar → Nueva implementación**.
2. Tocá el engranaje ⚙ junto a *Seleccionar tipo* y elegí **Aplicación web**.
3. Completá así:
   - **Descripción**: `Enlace del sitio`
   - **Ejecutar como**: **Yo** (tu correo)
   - **Quién tiene acceso**: **Cualquier persona**
4. **Implementar**.

> **«Cualquier persona» suena peor de lo que es.** Hace falta para que la página de tus clientas
> pueda dejarte la solicitud sin que ellas tengan cuenta de Google. Lo único que alguien sin tu
> clave puede hacer con esa dirección es **dejar una solicitud nueva**, que entra como «por
> confirmar» y la ves vos. Para **leer** tu agenda o **cambiar** algo hace falta la clave del
> paso 3. Además el script rechaza los datos mal formados y limita a 40 solicitudes nuevas por
> día.

Al final te muestra una **URL de la aplicación web**. Es larga y termina en **`/exec`**:

```
https://script.google.com/macros/s/AKfycb............/exec
```

**Copiala.**

---

## Paso 6 — Pegarla en el sitio

Pegá esa dirección en el archivo **`assets/js/config.js`** de este repositorio, entre las
comillas:

```js
window.BB.config = {
  URL_SCRIPT: 'https://script.google.com/macros/s/AKfycb.........../exec'
};
```

Se puede hacer desde el teléfono, en la web de GitHub:

1. Abrí `assets/js/config.js` en el repositorio.
2. Tocá el **lápiz** ✏ (arriba a la derecha).
3. Pegá la dirección entre las comillas vacías.
4. **Commit changes**.

En un par de minutos GitHub vuelve a publicar el sitio con el enlace puesto.

> Si preferís, mandame la dirección y la pego yo.

---

## Paso 7 — Conectar el Libro

1. Abrí el **Libro de citas** y entrá con tu clave de siempre.
2. Aparece una franja arriba que pide la **clave de Google**.
3. Escribí la del **paso 3** y tocá **Probar y guardar**.

Si dice **«Al día con Google»**, ya está. Si en este teléfono tenías citas que Google no tiene,
te va a ofrecer **subirlas** para no perderlas.

---

## Probarlo

1. Abrí la página de las clientas en otro teléfono (o en una ventana de incógnito).
2. Pedí una cita cualquiera.
3. En el Libro, tocá **Actualizar**. La cita tiene que aparecer.
4. Mirá tu Google Calendar: el evento tiene que estar ahí. Si pusiste un correo en la prueba,
   a esa dirección le llegó la invitación.

---

## Si algo falla

**«Clave de administración incorrecta»**
La clave del Libro no coincide con la del paso 3. Fijate en mayúsculas y espacios de más al
copiar.

**«No se pudo hablar con Google»** (o «Failed to fetch» si tu navegador está en inglés)
Google no contestó con datos: te mandó a una pantalla de inicio de sesión. Es la señal de que
la implementación quedó en **«Solo yo»**. Para comprobarlo sin tocar nada, pegá tu dirección
`/exec` en una pestaña del navegador: si está bien, se ve un texto que empieza con
`{"ok":true`; si te pide iniciar sesión o dice que no tenés permiso, el acceso está mal.

Se arregla en **Implementar → Gestionar implementaciones → lápiz ✏**. Ojo: Apps Script nunca
dice «público» ni «privado», y los desplegables **no se ven hasta que tocás el lápiz**. El
ajuste se llama **«Quién tiene acceso»** y tiene que decir **Cualquier persona** (no «Cualquier
persona con una cuenta de Google»: tus clientas no tienen por qué tener una).

**«La respuesta de Google no se entendió»**
Lo mismo de arriba, o una implementación con código viejo. Revisá *Quién tiene acceso* y, de
paso, poné **Versión: Nueva versión**.

**«Sin conexión con Google»**
Puede ser señal o que Google tardó. El Libro sigue mostrando la copia de tu teléfono; tocá
**Actualizar** cuando vuelvas a tener datos.

**Las citas llegan a la hoja pero no al calendario**
El script guarda la cita igual aunque el calendario falle, a propósito: perder un evento es
molesto, perder la cita sería grave. Volvé a correr **`probar`** en el editor y revisá que los
permisos de Calendar estén dados.

**La Hoja dice «No puedes acceder a este documento porque infringe nuestros Términos del Servicio»**
Es un bloqueo automático de Google Drive sobre ese archivo, no un problema del código. Pasa a
veces con archivos recién creados y no siempre hay motivo real. Como el enlace sabe hacerse una
hoja nueva, la salida es corta: en el editor de Apps Script, **Configuración del proyecto ⚙ →
Propiedades del script**, borrá la propiedad `bendita_belleza_libro` y volvé a correr **`probar`**.
Te crea una planilla nueva y te deja su enlace en el registro.

Si la hoja bloqueada tenía citas que no querés perder, pedí la revisión desde Drive
(clic derecho sobre el archivo → *Solicitar revisión*) antes de darla por perdida.

**Cambiaste el código y no pasa nada**
Cada cambio necesita una implementación nueva: **Implementar → Gestionar implementaciones →**
lápiz ✏ **→ Versión: Nueva → Implementar**. La dirección `/exec` no cambia.

---

## Seguridad, en claro

- **Dónde quedan tus citas:** en tu Hoja de cálculo y tu Calendar, dentro de tu cuenta de
  Google. El sitio no guarda nada; solo pregunta.
- **Quién puede leerlas:** vos, y quien tenga la clave del paso 3. Esa clave no está escrita en
  ningún archivo del sitio: se guarda solo en el navegador donde la escribiste.
- **Qué puede hacer un desconocido con la dirección `/exec`:** dejar una solicitud de cita, que
  entra como «por confirmar». Nada más. No puede leer, ni borrar, ni cambiar.
- **Si sospechás que tu clave se filtró:** cambiá `CLAVE_ADMIN` en el código, hacé una
  implementación nueva (ver arriba) y escribí la nueva clave en el Libro.
- **Los respaldos siguen siendo buena idea.** El botón **Respaldo** del Libro baja todo a un
  archivo. La Hoja de cálculo también se puede descargar desde *Archivo → Descargar*.
