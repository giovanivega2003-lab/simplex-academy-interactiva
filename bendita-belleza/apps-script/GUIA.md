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

## Paso 1 — Crear la Hoja de cálculo

1. Entrá a [sheets.new](https://sheets.new) con la cuenta de Google del salón.
2. Ponele un nombre arriba a la izquierda, por ejemplo **Agenda Bendita Belleza**.

Eso es todo. No escribas nada adentro: las columnas se crean solas.

---

## Paso 2 — Abrir el editor de código

En esa misma hoja, arriba en el menú: **Extensiones → Apps Script**.

Se abre una pestaña nueva con un archivo llamado `Código.gs` que trae unas pocas líneas de
ejemplo.

---

## Paso 3 — Pegar el código

1. **Borrá todo** lo que haya en ese archivo (tocá adentro, `Ctrl+A`, `Suprimir`).
2. Abrí el archivo **`apps-script/Codigo.gs`** de este repositorio, copiá **todo** su contenido
   y pegalo ahí.
3. Arriba a la izquierda, ponele un nombre al proyecto, por ejemplo **Enlace Bendita Belleza**.

---

## Paso 4 — Poner tu clave

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

## Paso 5 — Dar los permisos

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
falta cambiar `CLAVE_ADMIN`, volvé al paso 4.

---

## Paso 6 — Publicar el enlace

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
> paso 4. Además el script rechaza los datos mal formados y limita a 40 solicitudes nuevas por
> día.

Al final te muestra una **URL de la aplicación web**. Es larga y termina en **`/exec`**:

```
https://script.google.com/macros/s/AKfycb............/exec
```

**Copiala.**

---

## Paso 7 — Pegarla en el sitio

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

## Paso 8 — Conectar el Libro

1. Abrí el **Libro de citas** y entrá con tu clave de siempre.
2. Aparece una franja arriba que pide la **clave de Google**.
3. Escribí la del **paso 4** y tocá **Probar y guardar**.

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
La clave del Libro no coincide con la del paso 4. Fijate en mayúsculas y espacios de más al
copiar.

**«La respuesta de Google no se entendió»**
Casi siempre es que en el paso 6 quedó *Quién tiene acceso* en «Solo yo». Volvé a
**Implementar → Gestionar implementaciones**, editá con el lápiz y cambialo a
**Cualquier persona**.

**«Sin conexión con Google»**
Puede ser señal o que Google tardó. El Libro sigue mostrando la copia de tu teléfono; tocá
**Actualizar** cuando vuelvas a tener datos.

**Las citas llegan a la hoja pero no al calendario**
El script guarda la cita igual aunque el calendario falle, a propósito: perder un evento es
molesto, perder la cita sería grave. Volvé a correr **`probar`** en el editor y revisá que los
permisos de Calendar estén dados.

**Cambiaste el código y no pasa nada**
Cada cambio necesita una implementación nueva: **Implementar → Gestionar implementaciones →**
lápiz ✏ **→ Versión: Nueva → Implementar**. La dirección `/exec` no cambia.

---

## Seguridad, en claro

- **Dónde quedan tus citas:** en tu Hoja de cálculo y tu Calendar, dentro de tu cuenta de
  Google. El sitio no guarda nada; solo pregunta.
- **Quién puede leerlas:** vos, y quien tenga la clave del paso 4. Esa clave no está escrita en
  ningún archivo del sitio: se guarda solo en el navegador donde la escribiste.
- **Qué puede hacer un desconocido con la dirección `/exec`:** dejar una solicitud de cita, que
  entra como «por confirmar». Nada más. No puede leer, ni borrar, ni cambiar.
- **Si sospechás que tu clave se filtró:** cambiá `CLAVE_ADMIN` en el código, hacé una
  implementación nueva (ver arriba) y escribí la nueva clave en el Libro.
- **Los respaldos siguen siendo buena idea.** El botón **Respaldo** del Libro baja todo a un
  archivo. La Hoja de cálculo también se puede descargar desde *Archivo → Descargar*.
