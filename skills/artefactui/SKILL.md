---
name: artefactui
description: ArtefactUI, el design system para dashboards y artefactos HTML que genera la IA. Úsala siempre que vayas a crear o rehacer una página HTML, un dashboard, un informe visual o un artifact de claude.ai, y cuando el usuario diga "hazme un dashboard de…", "artifact", "vista HTML", "informe visual", "gráfica de…", "publícalo como página" o "/artefactui". Da un kit de componentes React + Tailwind + Recharts + lucide (montar.py junta datos y composición en un único HTML y lo valida; probar.py prueba la interacción), modo oscuro por defecto con la paleta exacta de Cobalt2 y claro con la de Apple, reglas de las Human Interface Guidelines, catálogo de iconos al estilo Notion, filtros globales, búsqueda, hojas de detalle, exportación a CSV, leyendas siempre visibles, escala semáforo progresiva sin rojo y la guía obligatoria «Cómo leer este informe».
---

# ArtefactUI: el design system para dashboards que genera la IA

Con ArtefactUI, todos los dashboards y artefactos que generas se parecen: mismo design system,
mismo botón de tema, mismas tablas y una guía para entenderlos. Se piensan para un perfil directivo: primero las 3–4 cifras que
importan, luego la tendencia, luego lo que está en riesgo y al final el detalle. El punto de
partida es el kit (`${CLAUDE_PLUGIN_ROOT}/kit/`) y su dashboard de ejemplo
(`${CLAUDE_PLUGIN_ROOT}/ejemplos/tienda/app.js`); el catálogo visual de componentes está en
`${CLAUDE_PLUGIN_ROOT}/dist/galeria.html`.

## Cómo se hace uno

Todo dashboard se hace con el **kit**: los componentes no se copian ni se editan por informe.

```
${CLAUDE_PLUGIN_ROOT}/kit/tokens.css            tokens de color, tipografía, movimiento y accesibilidad
${CLAUDE_PLUGIN_ROOT}/kit/tailwind.config.js    escala de Apple y tokens como clases de Tailwind
${CLAUDE_PLUGIN_ROOT}/kit/componentes.js        todos los componentes (catálogo abajo)
${CLAUDE_PLUGIN_ROOT}/kit/montar.py             junta kit + datos + App en un HTML publicable, y valida
${CLAUDE_PLUGIN_ROOT}/kit/probar.py             prueba de interacción en Chrome sin interfaz
${CLAUDE_PLUGIN_ROOT}/packs/                    packs de iconos de dominio (--pack)
${CLAUDE_PLUGIN_ROOT}/ejemplos/tienda/          dashboard de ejemplo (app.js + datos.json)
${CLAUDE_PLUGIN_ROOT}/galeria/                  catálogo visual de componentes
```

1. **Datos**: un `datos.json` (o el script que lo genera desde una API, una base de datos, un
   Excel…) con al menos `titulo` (2–4 palabras) y `fecha`, más lo que el informe necesite. Si los
   saca un script, que escriba el JSON (UTF-8, sin escapar tildes) y llame a `montar.py` al final.
2. **Composición**: un `app.js` con `function App(){…}` que compone el informe con los componentes
   del kit. Parte de `${CLAUDE_PLUGIN_ROOT}/ejemplos/tienda/app.js`. Nada de CSS ni colores
   sueltos: tokens y clases. Guarda `app.js` y `datos.json` junto al informe, en el proyecto del
   usuario, para poder regenerarlo.
3. **Montar**: `python3 ${CLAUDE_PLUGIN_ROOT}/kit/montar.py --app app.js --datos datos.json
   --salida <ruta>/vista-<tema>.html [--pack ${CLAUDE_PLUGIN_ROOT}/packs/<pack>.js]`. Comprueba
   título, iconos, claves del catálogo, sintaxis y colores sueltos. Con `--cdn <versión>` el kit se
   carga desde npm (`artefactui@<versión>` vía jsDelivr) en vez de incrustarse.
4. **Probar**: `python3 ${CLAUDE_PLUGIN_ROOT}/kit/probar.py <vista>.html` y las capturas de la
   Verificación.
5. **Publicar** con la herramienta Artifact: privado, `icon` genérico, `description` de una frase y
   `capabilities: {downloads: true}` si la página exporta (si no se declara, el botón no aparece).
   Para actualizarlo, se vuelve a montar y a publicar el mismo fichero.

Si a un informe le falta un componente, no se escribe en su `app.js`: se propone al usuario
añadirlo al kit (o a un pack). La página montada cumple el contrato de diseño de los artifacts de
claude.ai (tokens con modo oscuro, CDN con versión exacta, ancho de móvil con margen de 16 px).

## Kit de componentes

| Grupo | Componente | Para qué |
|---|---|---|
| Página | `Header` (`barra`: controles propios en la barra superior, p. ej. navegación entre páginas), `Footer` (incluye `Toasts`), `Section` (icono, leyenda y aislamiento de errores), `Card`, `Grouped`, `Reveal` | estructura, barra con material, secciones con conclusión |
| Filtros | `useFiltros`, `BarraFiltros`, `Buscador` (atajo «/»), `Desplegable`, `Segmented`, `visible`, `coincide`, `useRecordado` | filtros globales (periodo, grupo, elemento, búsqueda) que se recuerdan en el navegador; `Desplegable` para los filtros propios de una sección |
| Cifras | `Kpi` (variación, minigráfica, pulsable), `Count`, `Spark`, `Anillo`, `Bar`, `Stack` | KPI y progreso |
| Gráficas | `ChartCard` (resumen accesible), `Tip`, `ejes(T)`, `useTokens` | Recharts con los tokens del tema |
| Detalle | `Hoja` (sheet: Esc, fondo, foco atrapado), `Datos` | drill-down al pulsar una fila, tarjeta o KPI |
| Tablas | `SortTable` (orden, ayuda por columna, búsqueda `q`, `onRow`, `exportar`, `limite`, `vacio`, `fijas` para dejar fijas las primeras columnas en tablas anchas), `BotonExportar`, `toCSV` | detalle tabular y exportación a CSV para Excel |
| Color | `Pill`, `SemPill`, `Leyenda`, `IconBadge`, `Avatar`, `escala`, `semaforo`, `semHex`, `SERIES` | estado, escala progresiva, leyendas y avatares |
| Iconos (Notion) | `ICONOS`, `Icono`, `IconoPagina`, `Etiqueta`, `Callout`, `CatalogoIconos`, `icono()`, `NCOLORES` | catálogo semántico de 117 iconos con colores Notion, ampliable con packs |
| Lectura | `Guia`, `Resumen`, `Avisos` | cómo leer el informe, conclusiones y avisos de datos |
| Estados | `Vacio`, `Esqueleto`, `Protegido`, `validar`, `toast` | vacío, carga, error de sección, calidad de datos, avisos breves |
| Edición | `Campo` (número, texto o nota, con unidad y vuelta al valor de partida), `useCompartido` (estado en la BBDD del artifact: `capabilities: {db: {}, user: {}}`) | simuladores, escenarios y respuestas que se guardan y lee Claude |
| Tema | `useTheme`, `ThemeToggle` | oscuro por defecto → claro → automático |

Un dashboard **operativo** tiene, como mínimo: `BarraFiltros` conectada a todas las secciones,
`Avisos` con `validar` sobre los datos, `Kpi` con conclusión, `Guia`, gráficas con leyenda, filas o
tarjetas que abren una `Hoja` con el detalle, `SortTable` con búsqueda y `exportar`, y estados
`Vacio` cuando los filtros no dejan nada. `ejemplos/tienda/app.js` lo cumple.

## Las reglas

### 0. Base: Human Interface Guidelines de Apple

Todo el design system parte de las HIG
([developer.apple.com/design/human-interface-guidelines](https://developer.apple.com/design/human-interface-guidelines/)):
tipografía, color, modo oscuro, materiales, layout, gráficas, accesibilidad y movimiento. Las
decisiones propias de ArtefactUI que mandan sobre ellas: el oscuro sigue a Cobalt2 /
Solarized (azul marino `#193549`, nunca negro, con acentos de igual intensidad); sin rojo (el peligro es rosa-violeta,
entre systemPink y systemPurple); escala semáforo progresiva; leyenda
siempre visible; y **modo oscuro por defecto** con botón de apariencia (las HIG piden seguir al sistema y
desaconsejan un ajuste propio; ArtefactUI arranca siempre en oscuro, con el botón para pasar a
claro o a automático).

Lo que se toma de las HIG, regla a regla:

| HIG | En la plantilla |
|---|---|
| Fuente del sistema con tamaño óptico dinámico | SF Pro (`-apple-system`), Inter como respaldo fuera de Apple; SF Pro Rounded (`.cifra`) para cifras grandes |
| Estilos de texto (Body 17, Footnote 13, mínimo 11) | escala de Tailwind = estilos de Apple (regla 3) |
| Mayúsculas solo en rótulos muy cortos; pocas familias | etiquetas en minúsculas, sin mono salvo fórmulas y códigos |
| Paleta de colores del sistema (systemBlue, systemGreen…) | tokens de la regla 2, con los valores de Apple para claro y oscuro |
| Colores semánticos por jerarquía | `--bg`, `--card`, `--ink`/`--muted`/`--faint`, `--line` (= systemBackground, secondarySystemBackground, label…, separator) |
| Contraste ≥ 4,5:1, buscar 7:1 en texto pequeño | en claro, todo el texto pequeño (secundario, terciario, píldoras, `-ink`) llega a 7:1; en oscuro, ≥ 4,5:1 |
| Aumentar contraste y Reducir transparencia | `@media (prefers-contrast:more)` y `(prefers-reduced-transparency:reduce)` |
| No transmitir nada solo con color | cada estado lleva icono (`<Pill>`) o texto con el valor (`<SemPill>`) |
| Símbolos sencillos del mismo peso que el texto | regla 3b: catálogo de iconos al estilo Notion en secciones, guía, KPI, categorías y estados |
| Agrupar con contenedores y separadores; divulgación progresiva | `<Grouped>` (lista agrupada) y la guía plegable |
| Controles de 28 px como mínimo (44 en táctil) | botones y selector segmentado de 30–36 px |
| Gráficas: título con el mensaje, rejilla ligera, separar áreas de color, resumen accesible, eje del lado final | `<Section title>` con la conclusión, `ejes(T)`, `<Stack>` y `stroke` entre segmentos, `<ChartCard resumen>`, `YAxis orientation="right"` |
| Movimiento con propósito, breve, interrumpible, opcional | regla 9 |

### 1. Stack: React + Tailwind + Recharts + lucide, montado en un solo HTML

| Librería | URL (versión exacta) | Global |
|---|---|---|
| Tailwind (Play CDN) | `https://cdn.tailwindcss.com/3.4.16` | `tailwind.config` |
| React / ReactDOM | `cdnjs …/react/18.3.1/umd/react.production.min.js` y `react-dom` | `React`, `ReactDOM` |
| prop-types (lo pide Recharts) | `cdnjs …/prop-types/15.8.1/prop-types.min.js` | `PropTypes` |
| Recharts | `cdnjs …/recharts/2.12.7/Recharts.min.js` | `Recharts` (alias `R`) |
| lucide-react | `unpkg …/lucide-react@0.460.0/dist/umd/lucide-react.min.js` (antes, `window.react = React`) | `LucideReact` (alias `I`) |
| htm | `jsdelivr …/htm@3.1.1/dist/htm.umd.js` | `htm` → ``html`…` `` |

- **JSX con `htm`, no con Babel**: plantillas etiquetadas, sin transpilar en el navegador ni
  `eval` (Babel standalone pesa 3 MB y la CSP del artifact puede bloquearlo). Componentes como
  `<${Kpi} …/>`, cierre `<//>`, y `className`, nunca `class`.
- **Solo clases utilitarias de Tailwind**; los colores, a través de los tokens (`bg-card`,
  `text-muted`, `border-line`, `text-accent`…), que la config de Tailwind mapea a variables CSS.
- **Iconos de lucide**, trazo fino (`size={16}`, `strokeWidth={1.8}`). Nada de emojis como icono.
- Ninguna otra librería ni dependencia externa salvo Google Fonts (Inter y JetBrains Mono, solo como respaldo de SF Pro y SF Mono). `montar.py` pone todo esto en la cabecera: no se escribe a mano.

### 2. Color: paleta del sistema de Apple

El claro usa los colores del sistema de Apple. El **oscuro usa al 100 % la paleta de Cobalt2**
(`wesbos/cobalt2-vscode`): cada token es un color del tema, sin aclarados propios. Para que todos
pasen el contraste de la guía, las tarjetas son los paneles del tema (`#15232D`) y no la línea
resaltada; sobre ellos el azul de comentarios da 4,6:1, el gris `#AAAAAA` 6,9:1 y el magenta 8,2:1.
Si añades un color al oscuro, sácalo del tema; si no pasa el contraste sobre `#15232D`, usa otro
color del tema, no lo aclares. Además toma
su estructura: paneles `#15232D` (barra, cabeceras de tabla, tooltips, fórmulas), bordes sólidos
`#0D3A58`, el azul de selección `#0050A4`, pies en cursiva azul como sus comentarios, fórmulas en
su amarillo y el foco con el amarillo de su cursor. Cada color de estado tiene dos
usos, como en Apple: **relleno** (el color del sistema, para barras, puntos y gráficas) y **texto**
(`-ink`, su variante accesible, para píldoras y cifras de color).

| Token (clase Tailwind) | Claro (Apple) | Oscuro (Cobalt2 exacto) | Equivale a | Para qué |
|---|---|---|---|---|
| `--bg` | `#F2F2F7` | `#193549` | systemGroupedBackground · `editor.background` | fondo de página |
| `--card` (`bg-card shadow-card`) | `#FFFFFF` | `#15232D` | secondarySystemGroupedBackground · `sideBar`/`editorWidget.background` | tarjetas y listas agrupadas, `rounded-card` (16 px) |
| `--line` · `--line-strong` | `rgba(60,60,67,.18)` | `#0D3A58` · `#3B5364` | separator · `editorWidget.border` · `editorIndentGuide` | separadores, bordes, pistas de barras, rejilla |
| `--ink` / `--muted` / `--faint` | `#1C1C1E` / `#3F3F43` / `#515155` | `#FFFFFF` / `#CCCCCC` / `#AAAAAA` | label… · `foreground` / `sideBar.foreground` | texto, secundario, terciario |
| `--accent` / `--accent-2` | `#175D28` / `#34C759` | `#3AD900` | systemGreen · verde de Cobalt2 (**primario**) | interactivo, selección, cifra principal, serie principal |
| `--ok` · `--ok-ink` | `#00C7BE` · `#085B57` | `#80FFBB` | systemMint · menta de Cobalt2 | bien, cerrado, en plazo |
| `--warn` · `--warn-ink` | `#FFCC00` · `#724B00` | `#FFC600` | systemYellow · amarillo de Cobalt2 | atención, a medias |
| `--bad` · `--bad-ink` | `#D946A8` · `#8F1E6C` | `#FB94FF` | **rosa-violeta** · magenta de Cobalt2, nunca rojo | bloqueo, peligro |
| `--info` · `--info-ink` | `#1A9AB8` · `#005A70` | `#9EFFFF` | systemTeal · cian de Cobalt2 | información, sugerencias |
| `--sem1` … `--sem5` | `#00C7BE` `#88D775` `#FFCC00` `#FF9500` `#D946A8` | `#80FFBB` `#A5FF90` `#FFC600` `#FF9D00` `#FB94FF` | mint → yellow → orange → rosa-violeta | **semáforo progresivo** |
| `--s1` … `--s8` | green, blue, violeta `#7C3AED`, brown, menta claro, azul claro, arena, gris acero | `#3AD900` `#0088FF` `#FF0088` `#E1EFFF` `#A5FF90` `#FFEE80` `#FFB454` `#AAAAAA` | — | **series** de gráficas |
| `--nav` · `--thead` · `--tip` | barra translúcida · transparente · blanco | `#122738` (`activityBar`, `menu`, `notifications`) | — | barra superior, cabecera de tablas, tooltips, avisos breves |
| `--sel` · `--row-hover` | blanco · tinte suave | `#0050A4` (`editor.selectionBackground`) · `#1F4662` (`lineHighlightBackground`) | — | selector segmentado, fila bajo el ratón |
| `--caption` | secundario · normal | `#0088FF` *cursiva* (comentarios) | — | pies de gráfica y ayuda de columnas, siempre sobre tarjeta |
| `--code-bg` · `--code-ink` · `--input-ink` · `--focus` | tinte · texto · texto · primario | `#193549` · `#FFC600` · `#FFC600` · `#FFC600` (`input.foreground`, cursor) | — | fórmulas, texto de búsqueda, anillo de foco |
| `--sheet-line` · `--toast-line` | separador | `#FFC600` (`peekView.border`, `notifications.border`) | — | borde de hojas de detalle y avisos breves |

- **El primario es el verde** (systemGreen): lo interactivo, la selección, la cifra principal, la
  serie principal y el gradiente de las gráficas.
- **Un color, un significado** (HIG): como el verde es el primario, el estado «bien» es menta
  (systemMint); amarillo es atención, rosa-violeta es bloqueo y cian es información; las series usan colores del sistema que
  no se usan para estado. En una gráfica con pocas series, elige las más separadas (p. ej.
  `[0, 1, 3, 6]`: green, blue, purple, brown); blue, cyan e indigo juntos se confunden.
- **Escalas progresivas.** Cuando el color depende de un valor (cumplimiento de objetivo, uso, retraso,
  cumplimiento…), no elijas entre tres estados: usa la rampa semáforo, que pasa de forma continua
  de menta a amarillo y naranja.
  - `escala(valor, bien, mal)` → `t` entre 0 (peligro) y 1 (todo bien); `bien` y `mal` en el orden
    que toque (retraso: `escala(dias, 0, 10)`).
  - `semaforo(t)` da el color para CSS; `semHex(t, T)` el mismo en hex para Recharts. `<SemPill>`
    oscurece el texto en claro (`--sem-ink`) para que el amarillo se lea sobre blanco.
  - `<Bar p t>` y `<SemPill t>` lo aplican; `<Guia escala={{mal, medio, bien}}>` pinta además la
    leyenda en degradado dentro de la guía.
  - Los estados discretos (`tono:'ok'|'warn'|'bad'|'info'|'neu'`) quedan para cosas que de verdad
    son de sí o no (bloqueada, en plazo).
- **Leyenda cromática siempre visible.** Toda sección, gráfica o tabla cuyos colores signifiquen
  algo lleva su leyenda **encima, a la vista**, con `<Section leyenda={{escala, items}}>` (o
  `<Leyenda>` suelta). No basta con que esté en la guía, que se puede plegar, ni con explicarlo en
  el pie de la gráfica. Incluye la rampa con los valores de sus extremos, los estados discretos que
  aparezcan (gris = sin empezar…) y las series (`items: [[color, etiqueta, 'dot'|'line'|'dash']]`).
  Con la leyenda de sección no hace falta la de Recharts.
- **Sin rojo: el peligro es rosa-violeta.** `--bad` se reserva para bloqueos reales (algo parado, un plazo incumplido). Lo
  que aún no ha empezado va en **neutro** (`tono:'neu'`, gris), lo que está a medias en amarillo y lo
  terminado en menta. Un informe lleno de rosa-violeta es una señal de que se está usando como alarma
  por defecto.
- **Color estable por elemento**: `SERIES[x.i % 8]` con `i` = orden fijo del elemento (producto, persona, canal…) en los datos de origen.
- Si añades un color: valor del sistema de Apple en claro y de la paleta de Cobalt2 en oscuro, variante `-ink` si va a ser
  texto, y comprobación de contraste (≥ 4,5:1 texto, ≥ 3:1 rellenos) contra `--card`.

### 3. Tipografía (estilos de texto de Apple)

- **Fuente del sistema**: `-apple-system` (SF Pro, con tamaño óptico dinámico) en Mac, iPhone e
  iPad; **Inter** solo como respaldo en otros sistemas. Cifras grandes (KPI, importes de las
  tarjetas) con la clase `.cifra`: SF Pro Rounded, como en Salud y Actividad. Mono (`SF Mono`) solo
  para fórmulas y códigos (`A1`, `PED-1042`). Una familia, no tres.
- La escala de Tailwind **es** la de los estilos de texto de Apple (iOS, tamaño por defecto):

  | Clase | Estilo Apple | Tamaño / interlineado | Uso |
  |---|---|---|---|
  | `text-3xl font-bold` | Large Title | 34 / 41 | título de la página, cifras KPI |
  | `text-2xl` | Title 1 | 28 / 34 | importes de tarjetas |
  | `text-xl font-bold` | Title 2 | 22 / 28 | títulos de sección |
  | `text-lg` | Title 3 | 20 / 25 | subtítulos |
  | `text-base` | Body | 17 / 25 | texto, entradilla, resumen |
  | `text-callout` | Callout | 16 / 21 | texto destacado secundario |
  | `text-sm` | Subheadline | 15 / 20 | etiquetas de KPI, tablas, explicaciones |
  | `text-xs` | Footnote | 13 / 18 | leyendas, pies de gráfica, cabeceras de tabla, píldoras |
  | `text-caption` | Caption 1 | 12 / 16 | metadatos muy secundarios; nada por debajo de 11 |

- **Sin mayúsculas sostenidas ni espaciado añadido** en etiquetas: «Total 2027», no «TOTAL 2027».
  La jerarquía sale del tamaño, el peso (Regular, Medium, Semibold, Bold; nunca Light ni Thin) y el
  color (`text-strong` > `text-ink` > `text-muted` > `text-faint`).
- Cifras con `tabular-nums` (clase `num`), títulos con `text-wrap:balance` y párrafos con
  `pretty`. Párrafos de explicación a `max-w-2xl`/`max-w-3xl`.
- Una cifra grande nunca se parte: `whitespace-nowrap` y la etiqueta que la acompaña, en otra línea.

### 3b. Iconografía: catálogo al estilo Notion

Las HIG piden símbolos sencillos, reconocibles y del mismo peso que el texto. El kit trae un
**catálogo semántico al estilo Notion** (`ICONOS` en `componentes.js`, 117 conceptos en español
agrupados en Personas y equipo, Proyectos y gestión, Desarrollo, Infraestructura y datos, Dinero y
finanzas, Tiempo y calendario, Comunicación y documentos y Herramientas). Los iconos de un dominio
concreto van en **packs** (`packs/comercio.js` es el ejemplo) que se añaden con `--pack`.
Cada clave lleva un icono de lucide (trazo 1,9, lo más cercano a SF Symbols) y un color Notion por
defecto. El catálogo visual y buscable está en la galería (`CatalogoIconos`).

| Pieza | Uso |
|---|---|
| `<Icono n="informe" size tile color label />` | icono en su cuadrado tintado (o suelto con `tile={false}`); `label` solo si el icono significa algo por sí solo |
| `<Header icono="informe">` | icono de página de Notion, grande, sobre el título |
| `<Section icon="objetivo">`, `<Kpi icon="kpi">`, `<Hoja icon="paquete">`, `links=[[id, texto, 'clave']]` | aceptan la clave del catálogo además de un componente de lucide |
| `<Etiqueta n="sprint">Sprint 2026.6<//>` | la «select» de Notion: texto en el color normal, color en el fondo y el icono |
| `<Callout n="idea" titulo>` | el bloque destacado de Notion |
| `icono('clave')` | el componente de lucide de una clave, para usos propios |

**Colores Notion** (`--n-<color>`, `--n-<color>-bg`, `--n-<color>-tag`): `gray`, `brown`, `orange`,
`yellow`, `green`, `blue`, `purple`, `pink`. En claro son los de Notion, con el glifo oscurecido a
≥ 4,5:1 sobre su fondo; en oscuro, los colores exactos de Cobalt2 (gris `#AAAAAA`, marrón `#FFB454`,
naranja `#FF9D00`, amarillo `#FFC600`, verde `#3AD900`, azul `#0088FF`, morado `#FB94FF`, rosa `#FF0088`).
No hay rojo. Son colores de **identidad** (qué es), nunca de estado (cómo va): el estado sigue
yendo con `Pill`, `SemPill` y la escala semáforo.

Reglas:
- Iconos **siempre** en: títulos de sección, apartados de la guía, KPI, categorías/tipos/proyectos
  (el mismo icono en listas, tablas, tarjetas y hojas), estados dentro de las píldoras, barra
  superior y resumen. Personas y organizaciones con `<Avatar>` (iniciales en su color de serie), no con icono.
- **Primero el catálogo**: si el concepto está en `ICONOS`, se usa su clave. Si falta y es de un
  dominio concreto, va en un pack (`Object.assign(ICONOS, {clave: [I.Icono, 'color', 'Etiqueta', 'Grupo']})`);
  si es general, se propone añadirlo al catálogo. Nunca un icono suelto en `app.js`.
- Un concepto, un icono y un color en toda la página. Más gris que color: el color sirve para
  distinguir tipos, no para decorar.
- `montar.py` comprueba que los nombres de lucide y las claves del catálogo existen; una clave que
  no existe rompe la página entera.
- Iconos decorativos con `aria-hidden` (ya lo hace `Icono`). Nada de emojis.

### 4. Modo claro y oscuro

- Colores **solo como tokens** en `:root` (claro), repetidos en
  `@media (prefers-color-scheme:dark){:root:not([data-theme="light"])…}` y en
  `:root[data-theme="dark"]`. Ningún hex suelto en el HTML ni en `App()`.
- `useTheme()` + `<ThemeToggle>`: automático → claro → oscuro, guardado en `localStorage('tema')`
  dentro de `try/catch`; el script de la cabecera lo aplica antes de pintar.
- **El modo por defecto es el oscuro**. Sin preferencia guardada,
  la página arranca en oscuro, ya aplicado antes de pintar para que no haya destello claro. El botón
  recorre oscuro → claro → automático (seguir al sistema) y la elección se recuerda en el navegador,
  «automático» incluido. Abrir la página con `#tema=claro` o `#tema=oscuro` fuerza el tema sin
  guardarlo (revisiones y capturas). Revisa siempre primero la captura oscura.
- **Aumentar contraste** y **Reducir transparencia** del sistema están soportados en el CSS: con el
  primero se marcan separadores y texto secundario; con el segundo las tarjetas y la barra son
  opacas y sin desenfoque. Si añades tokens, añade también sus variantes ahí.
- Recharts no lee variables CSS: usa `const T = useTokens(theme.efectivo)` y pasa `T.accent`,
  `T.series[i]`… Así las gráficas se repintan al cambiar de tema.

### 5. Layout ejecutivo

En este orden, quitando lo que no aplique:

1. **Barra** sticky con blur: título, enlaces a secciones y botón de tema.
2. **Cabecera** (`<Header>`): eyebrow en mono, título grande, badge de contexto con punto vivo
   (`Sprint Q3 · 12 días restantes`, `Cierre de trimestre · 21 días`) y botones de **corte
   de periodo** (`7D / Total`, `Mensual / Acumulado`…) que cambian el gráfico principal.
3. **3–4 KPI** (`<Kpi>`): etiqueta pequeña en mayúsculas, cifra grande en negrita que cuenta
   desde 0, badge de **variación** con icono de tendencia (tono según si la subida es buena o
   mala) y una línea de contexto. Elige las cifras que un directivo miraría primero.
4. **Cómo leer este informe** (`<Guia>`), obligatorio, ver regla 6. Debajo, **En resumen**.
5. **Gráfico principal** (`<ChartCard>` + Recharts): área o línea con **degradado del primario (systemGreen)**
   transparente, ejes sin línea ni marcas (`ejes(T)`), rejilla horizontal tenue y tooltip propio
   (`<Tip>`, fondo oscuro y borde fino). Agrupa los datos temporales en la serie que tenga sentido
   (semanas, meses, sprints).
6. **Hitos / estado** (`<Card>` + `<Bar>` + `<Pill>`): iniciativas, épicas o categorías con barra
   de progreso de `h-1.5` y badge de estado redondeado.
7. **Desglose por elemento** (regla 8), con sus gráficas.
8. **Detalle** en tablas ordenables y **pie** con fuentes.

Columna de `max-w-6xl`, `px-4` en móvil (16 px) y nada de scroll horizontal fuera de las tablas.

Pautas de layout de las HIG:

- **Títulos de sección que dicen la conclusión**, calculada con los datos («Las ventas de la app
  ya superan a las de la web», no «Ventas por canal»). El subtítulo dice qué se mide.
- **Listas agrupadas** (`<Grouped>`) para filas de estado, hitos o categorías: un contenedor con
  separadores finos, no una tarjeta por fila.
- Tarjetas con esquinas de 16 px (`rounded-card`); controles de 28 px de alto como mínimo y
  separación generosa entre ellos.
- Selectores con `<Segmented>` (el control segmentado de Apple), nunca botones sueltos.
- Gráficas: eje Y en el lado final (`orientation="right"`), puntos sobre la línea cuando hay pocos
  valores, separadores entre segmentos apilados (`stroke` del color de la tarjeta, o `<Stack>`) y
  `<ChartCard resumen>` con una frase que lee el lector de pantalla. La información crítica nunca
  depende de pasar el ratón.

Otras gráficas de Recharts: barras horizontales (`layout="vertical"`) para comparar categorías o
elementos, apiladas (`stackId`) para repartos, `ReferenceLine` discontinua para objetivos o el año
anterior. Donut solo con ≤ 4 partes. Cada gráfica lleva `caption` que dice cómo leerla, ejes con
unidad y tooltip con la cifra exacta.

### 6. Cómo leer este informe (obligatorio)

`<Guia formula defs>` justo después de los KPI, **abierta** la primera vez que se publica.
Contiene siempre:

- **Fuentes y fecha**: de dónde sale cada cifra (la herramienta, el proyecto o la tabla, el fichero…)
  y a qué fecha. El pie las repite.
- **Fórmula** de la cifra principal, en una línea.
- **Umbrales y colores**: qué significa cada color en *este* informe y, si hay escala progresiva,
  su leyenda en degradado (`escala`) con los valores de cada extremo.
- **Siglas** que aparezcan.
- **Límites**: qué no mide el informe o qué lo puede sesgar, y los supuestos (p. ej. un
  calendario de pagos estimado). Si falta un dato (conector sin autorizar, resultados incompletos),
  se dice aquí.
- **Navegar** cuando haya filtros: qué filtra el selector.

El apartado **En resumen** lleva 2–5 frases: una conclusión por frase, cada una con la cifra que
la sostiene. Frases directas y tono natural, en el idioma del usuario.

### 7. Tablas ordenables

- Toda tabla de datos es `<SortTable cols rows rowKey tono>`: se ordena pulsando la cabecera
  (números de mayor a menor la primera vez, texto A→Z; vacíos al final).
- Cada columna lleva `help`: sale en el icono **i** de la cabecera y repetida en la lista bajo la
  tabla (en móvil no hay hover).
- `v: fila => número` para ordenar por el valor crudo cuando la celda muestra texto formateado.
- Números a la derecha (`align:'right'`) y con `nf()` (formato español con separador de miles
  siempre). `tono: fila => 'ok'|'warn'|'bad'|'info'` pinta el borde izquierdo de la fila.
- Operativa: `q` (la búsqueda de la `BarraFiltros`; `texto: fila => cadena` dice dónde buscar),
  `onRow` (abre la `Hoja` de detalle; la fila es accesible con Enter), `exportar="nombre"` (CSV para
  Excel en español, con lo que se ve), `limite` («Mostrar las N restantes») y `vacio` (mensaje sin
  resultados). El contador de filas dice siempre cuántas se ven de cuántas hay.

### 8. Desglose por elemento (siempre que haya una dimensión)

Si los datos tienen una dimensión natural (productos, clientes, canales, regiones, servicios,
personas…), el dashboard permite verlos uno a uno:

- `BarraFiltros` con `grupos` (p. ej. canales o regiones, con `etiquetaGrupos`) y `elementos` (p. ej.
  productos o clientes, con `etiquetaElementos`); `visible(f)` y `coincide(f.q, …)` filtran a la vez
  tarjetas, gráficas y tablas. Cada elemento lleva `{slug, grupo}`.
- **Tarjeta por elemento** con su icono (o `Avatar` si es una persona u organización), su cifra en
  grande, una mini barra o minigráfica y, si hace falta, un aviso. Cada tarjeta abre su `Hoja`.
- **Columna del elemento** en las tablas de detalle, ordenable.
- **Compara entre grupos** solo indicadores comparables; si no lo son, dilo en la guía.
- Respeta las exclusiones o agregaciones que indique el usuario.

### 9. Movimiento: HIG + `artifact-motion`

Si está disponible la skill **`artifact-motion`**, úsala para los patrones visuales; su sistema
visual no se usa aquí. Del lado de las HIG: movimiento **con propósito, breve, preciso,
interrumpible y opcional**, nunca la única forma de comunicar algo, y sin animar interacciones que
se repiten mucho.

| Token | Valor | Para qué |
|---|---|---|
| `--spring` | `cubic-bezier(.32,.72,0,1)` | curva tipo muelle sin rebote, para todo |
| `--t-ui` | 280 ms | controles: selector segmentado, pulsación, hover |
| `--t-entrada` | 500 ms | entrada escalonada de tarjetas y filas (50 ms entre una y otra) |
| `--t-datos` | 700–800 ms | contadores, barras que crecen, gráficas |

Ya incluido en la plantilla:

- `<Count>`: los KPI suben desde 0 en 800 ms.
- `<Reveal>` y `<Grouped>`: entrada escalonada al entrar en pantalla, y barras (`.crece`) que crecen; no uses `grow` de Tailwind para eso, que estira el elemento en un contenedor flex.
  Sin `.play`, todo está en su estado final.
- `<Segmented>`: el indicador se desliza al elegir; `.press`: los botones ceden un 3 % al pulsar.
- Recharts anima al montarse (`animationDuration=${700}`, `isAnimationActive=${!RM}`); al cambiar
  de periodo, el título de la sección también cambia, para que el cambio no dependa de la animación.
- `.latido`: el punto del estado late despacio (2,4 s); es la única animación en bucle permitida.
- `prefers-reduced-motion` anula todo (CSS y JS), bucles incluidos.

Si la página **explica** algo (un proceso, un flujo, estados que cambian), elige el patrón
protagonista adecuado (stepper con autoplay, terminal, kanban con FLIP…) y dibújalo
con estos tokens. Autoplays siempre con pausa y barra de progreso.

## Verificación antes de publicar

```bash
K=${CLAUDE_PLUGIN_ROOT}/kit; F=<ruta>/vista.html; S=<carpeta temporal>; C="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
python3 $K/montar.py --app app.js --datos datos.json --salida $F     # título, iconos, sintaxis, colores sueltos
python3 $K/probar.py $F                                             # interacción: filtros, búsqueda, hoja, tema, orden…
# capturas en el estado final (sin animaciones a medias), primero la oscura
# el oscuro es el modo por defecto; #tema=claro|oscuro fuerza el tema sin guardarlo
"$C" --headless=new --disable-gpu --force-prefers-reduced-motion --virtual-time-budget=9000 --window-size=1280,3000 --screenshot=$S/oscuro.png "file://$F#tema=oscuro"
"$C" --headless=new --disable-gpu --force-prefers-reduced-motion --virtual-time-budget=9000 --window-size=1280,3000 --screenshot=$S/claro.png "file://$F#tema=claro"
```

`probar.py` marca como FALLA los pasos que la página no tiene (p. ej. sin filtro de grupo): léelos
con criterio. En las capturas, mira que React haya pintado, colores de las gráficas en los dos
temas, leyendas, iconos **i** y guía visible. Revisa que ninguna cifra contradiga al informe del que
sale. La exportación solo se puede probar en el visor de
claude.ai (fuera de él, el botón se oculta).
