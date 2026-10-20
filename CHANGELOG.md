# Cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/); versiones con [SemVer](https://semver.org/lang/es/).

## [Sin publicar]

- Navegación entre detalles: `useNavegacion()` une una `SortTable` con su `Hoja`. La tabla recibe `activa` (la clave de la fila abierta) y `nav`: resalta la fila y ↑ ↓ pasan a la anterior o la siguiente en el orden que se ve, con búsqueda, filtros y orden por columna; si la siguiente está tras «Mostrar más», se despliega. La `Hoja` recibe `nav`: botones anterior / siguiente y la posición («3 de 12»), y vuelve arriba al cambiar de detalle. Dentro de un campo de texto las flechas siguen moviendo el cursor. La usan el ejemplo de la tienda y la galería.
- `Relacionados`: lista para una `Hoja` con lo que cita el detalle (dependencias, causas, documentos), con su descripción y estado a la vista y un enlace opcional a su propio detalle.
- `probar.py` comprueba ↓ y ↑ cuando la hoja tiene navegación.
- Corregido: la animación de las barras se llamaba `.grow`, igual que la utilidad de Tailwind `grow` (`flex-grow: 1`); dentro de un contenedor flex estiraba los segmentos y falseaba los porcentajes. Ahora es `.crece`, y `montar.py` avisa si se usa `grow` en `className`.
- `Campo`: campo editable (número con coma o punto, texto o nota) con unidad, ayuda y vuelta al valor de partida.
- `useCompartido(ruta, inicial)`: estado guardado en la base de datos del artifact (capacidad `db`), agrupando ráfagas y con estado visible (compartido, local, solo lectura, guardando).
- `SortTable` acepta `fijas`: deja fijas las primeras columnas al desplazar en horizontal (desde 640 px), con fondo opaco que sigue al hover.
- `Guia` acepta `abierta={false}` para arrancar cerrada.
- `Desplegable`: menú de filtro propio (no `<select>`, cuyo menú nativo sale vacío o sin contraste dentro del visor de artifacts), con opción «todos», teclado y cierre al pulsar fuera. Lo usa la `BarraFiltros` y sirve para filtros propios de una sección.
- `Header` acepta `barra`: controles propios en la barra superior, junto al título (navegación entre páginas, selector de elemento).

## [1.0.0] · 2026-10-11

Primera versión pública.

- Kit de componentes (`kit/componentes.js`): página, filtros globales por grupo y elemento, KPI, gráficas, hojas de detalle,
  tablas operativas con exportación a CSV, estados de vacío, carga y error, avisos de datos y tema.
- Design system: modo oscuro por defecto con la paleta exacta de Cobalt2; claro con la paleta de Apple;
  reglas de las Human Interface Guidelines; escala semáforo progresiva sin rojo; leyendas siempre visibles.
- Catálogo de 117 iconos al estilo Notion con colores por tema, y packs de dominio (`packs/comercio.js`).
- `kit/montar.py`: junta datos y composición en un único HTML y valida título, iconos, claves del catálogo,
  sintaxis y colores sueltos. Opciones `--pack` y `--cdn`.
- `kit/probar.py`: prueba de interacción en Chrome sin interfaz.
- Plugin de Claude Code con la skill `artefactui`.
- Ejemplo: panel de ventas de una tienda online con datos ficticios (`ejemplos/tienda`).
