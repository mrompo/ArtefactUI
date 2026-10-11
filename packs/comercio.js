// Pack de iconos de dominio: comercio y tienda online.
// Se añade al montar: python3 kit/montar.py --app … --datos … --pack packs/comercio.js --salida …
// Un pack solo amplía el catálogo ICONOS: clave → [icono lucide, color Notion, etiqueta, grupo].
Object.assign(ICONOS, {
  tienda: [I.Store, 'green', 'Tienda', 'Comercio'],
  bolsa: [I.ShoppingBag, 'pink', 'Bolsa', 'Comercio'],
  envio: [I.Truck, 'blue', 'Envío', 'Comercio'],
  devolucion: [I.Undo2, 'orange', 'Devolución', 'Comercio'],
  almacen: [I.Warehouse, 'brown', 'Almacén', 'Comercio'],
  stock: [I.Boxes, 'brown', 'Stock', 'Comercio'],
  oferta: [I.BadgePercent, 'pink', 'Oferta', 'Comercio'],
  pago: [I.CreditCard, 'blue', 'Pago', 'Comercio'],
  valoracion: [I.Star, 'yellow', 'Valoración', 'Comercio'],
  categoria: [I.Shapes, 'purple', 'Categoría', 'Comercio'],
  conversion: [I.MousePointerClick, 'green', 'Conversión', 'Comercio'],
  recompra: [I.Repeat2, 'green', 'Recompra', 'Comercio'],
  audio: [I.Headphones, 'purple', 'Audio', 'Comercio'],
  reloj: [I.Watch, 'blue', 'Reloj', 'Comercio'],
  altavoz: [I.Speaker, 'orange', 'Altavoz', 'Comercio'],
  teclado: [I.Keyboard, 'gray', 'Teclado', 'Comercio'],
  raton: [I.Mouse, 'gray', 'Ratón', 'Comercio'],
  monitor: [I.Monitor, 'blue', 'Monitor', 'Comercio'],
  tableta: [I.Tablet, 'brown', 'Tableta', 'Comercio'],
  camara: [I.Camera, 'pink', 'Cámara', 'Comercio'],
  consola: [I.Gamepad2, 'purple', 'Consola', 'Comercio'],
});
