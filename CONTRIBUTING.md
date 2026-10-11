# Contribuir a ArtefactUI

Gracias por echar una mano. Unas pocas reglas para que el kit siga siendo coherente:

1. **Un componente nuevo va al kit, no a un ejemplo.** Añádelo a `kit/componentes.js`, enséñalo en
   `galeria/app.js` y documéntalo en `skills/artefactui/SKILL.md` (tabla «Kit de componentes»).
2. **Colores solo como tokens** (`kit/tokens.css`), con su valor en claro (paleta de Apple) y en oscuro
   (paleta exacta de Cobalt2). Comprueba el contraste: ≥ 4,5:1 en texto y ≥ 3:1 en rellenos sobre `--card`.
   Sin rojo: el peligro es rosa-violeta.
3. **Iconos generales** van al catálogo `ICONOS` (clave en español sin tildes, icono de lucide 0.460, color
   Notion, etiqueta y grupo); los de un dominio concreto, a un pack en `packs/`.
4. **Antes de abrir un PR**: `npm test` (monta el ejemplo y la galería y pasa la prueba de interacción) y
   revisa `dist/galeria.html` en oscuro (`#tema=oscuro`) y en claro (`#tema=claro`).
5. Nada de datos reales de personas o empresas en ejemplos: usa datos ficticios.
