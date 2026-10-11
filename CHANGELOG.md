# Cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/); versiones con [SemVer](https://semver.org/lang/es/).

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
