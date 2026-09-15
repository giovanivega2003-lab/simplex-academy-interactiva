# Skills instaladas

Skills de diseño y animación de interfaz, instaladas a nivel de proyecto en
`.claude/skills/` con la CLI [`npx skills`](https://github.com/vercel-labs/skills).
El inventario y los hashes de origen viven en `skills-lock.json`.

## 1. Animación de interfaz — [`emilkowalski/skills`](https://github.com/emilkowalski/skills)

Emil Kowalski (autor de Sonner y Vaul). 13 skills:

| Skill | Para qué |
| --- | --- |
| `animate` | Construir una animación desde cero (web). |
| `review-animations` | Criticar el movimiento de un diff contra un listón alto. |
| `improve-animations` | Auditar el movimiento de todo un proyecto y planificar mejoras. |
| `find-animation-opportunities` | Detectar qué debería animarse y qué no. |
| `animation-vocabulary` | Glosario inverso: describir un efecto → nombre exacto. |
| `apple-design` | Movimiento físico y fluido estilo Apple, llevado a la web. |
| `emil-design-eng` | Filosofía de pulido de UI y detalles invisibles. |
| `mobile-native` | Que una web se sienta nativa en el teléfono. |
| `prototype` | Varias versiones de una pieza de UI para elegir en vivo. |
| `pick-ui-library` | Elegir librería para una tarea de frontend concreta. |
| `ask-sonner` | Guía de la librería de toasts Sonner. |
| `animate-expo` | Animación en React Native / Expo. |
| `write-swift` | Swift moderno. |

`animate-expo` y `write-swift` no aplican a este proyecto (web), pero se instaló
el repositorio completo.

## 2. Limpieza y jerarquía visual — [`pbakaus/Impeccable`](https://github.com/pbakaus/Impeccable)

1 skill, `impeccable`: diseñar, rediseñar, auditar y pulir interfaces —
jerarquía visual, arquitectura de información, carga cognitiva, tipografía,
espaciado, layout, color, movimiento, accesibilidad, estados de error y
sistemas de diseño reutilizables. Incluye herramientas de iteración en vivo
sobre el navegador en `.claude/skills/impeccable/scripts/`.

## 3. Referencias reales de diseño — [`Leonxlnx/taste-skill`](https://github.com/Leonxlnx/taste-skill)

13 skills contra el diseño genérico ("anti-slop"), incluidas las de generación
de tableros de referencia visual:

| Skill | Para qué |
| --- | --- |
| `design-taste-frontend` | Skill principal: lee el brief, infiere la dirección y evita lo plantillero. |
| `design-taste-frontend-v1` | Versión anterior de la anterior. |
| `imagegen-frontend-web` | Genera una imagen de referencia por sección de una web. |
| `imagegen-frontend-mobile` | Referencias de pantallas para app móvil. |
| `image-to-code` | Generar la imagen de diseño y luego implementarla en código. |
| `redesign-existing-projects` | Rediseñar algo existente sin romper su funcionalidad. |
| `high-end-visual-design` | Fuentes, espaciado, sombras y animación de agencia. |
| `brandkit` | Tableros de identidad y guidelines de marca. |
| `minimalist-ui` | Dirección editorial limpia, monocromo cálido. |
| `industrial-brutalist-ui` | Dirección brutalista / terminal. |
| `gpt-taste` | Tipografía editorial ancha y movimiento GSAP con ScrollTrigger. |
| `stitch-design-taste` | Genera `DESIGN.md` para Google Stitch. |
| `full-output-enforcement` | Evita que el modelo trunque el código generado. |

## Mantenimiento

```bash
npx skills list                 # ver lo instalado
npx skills update               # actualizar a la última versión de cada repo
npx skills experimental_install # restaurar desde skills-lock.json
```

Las skills se ejecutan con los permisos completos del agente: conviene revisar
cualquier cambio tras un `update`.
