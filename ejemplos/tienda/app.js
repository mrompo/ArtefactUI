// Dashboard de ejemplo de ArtefactUI: ventas de una tienda online (datos ficticios). Plantilla de partida.
// Monta con: python3 kit/montar.py --app ejemplos/tienda/app.js --datos ejemplos/tienda/datos.json --pack packs/comercio.js --salida dist/tienda.html
const eur = n => `${nf(n)} €`;
const ts = x => escala(x, 100, 70);                    // cumplimiento: 100 % todo bien, 70 % o menos peligro
const cumple = p => pct(p.ingresos, p.objetivo);
const TONO_STOCK = p => p.stock < 20 ? 'bad' : p.stock < 60 ? 'warn' : null;

function App(){
  const theme = useTheme(), T = useTokens(theme.efectivo);
  const filtros = useFiltros({periodo: 'total'}), {f} = filtros;
  const [sel, setSel] = useState(null);                 // producto abierto en la hoja de detalle
  const nav = useNavegacion();                          // ↑ ↓ y anterior / siguiente entre productos, en el orden de la tabla
  const P = D.productos.map((p, i) => ({...p, i}));     // i = orden fijo → color de serie estable
  const vis = P.filter(visible(f)).filter(p => coincide(f.q, p.nombre, D.grupos[p.grupo], ICONOS[p.icono]?.[2]));
  const objetivos = D.objetivos.filter(o => coincide(f.q, o.nombre, o.detalle));
  const ingresos = vis.reduce((a, p) => a + p.ingresos, 0), objetivo = vis.reduce((a, p) => a + p.objetivo, 0);
  const serie = f.periodo === 'total' ? D.semanas : D.semanas.slice(-2);
  const sinStock = P.filter(p => p.stock < 20);
  const mejor = [...P].sort((a, b) => cumple(b) - cumple(a))[0];
  const avisos = validar(D, [
    {campo: 'productos', tipo: 'array', min: 1},
    {campo: 'semanas', tipo: 'array', min: 2, texto: 'Hacen falta al menos dos semanas para dibujar la tendencia.'},
    {si: () => !sinStock.length, texto: `${sinStock.length} productos con menos de 20 unidades en stock: ${sinStock.map(p => p.nombre).join(', ')}.`},
  ]);
  const prod = sel && P.find(p => p.slug === sel);

  return html`<div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
    <${Header} theme=${theme} icono="tienda" eyebrow=${D.eyebrow} title=${D.titulo} lede=${D.lede} estado=${D.estado}
      links=${[['guia', 'Cómo leer', 'guia'], ['tendencia', 'Tendencia', 'tendencia-sube'], ['objetivos', 'Objetivos', 'objetivo'], ['productos', 'Productos', 'categoria']]} />
    <${BarraFiltros} filtros=${filtros} periodos=${[['2s', '2 semanas'], ['total', 'Trimestre']]} grupos=${D.grupos} etiquetaGrupos="Canal" todosGrupos="Todos los canales"
      elementos=${P} etiquetaElementos="Producto" todosElementos="Todos los productos" placeholder="Buscar producto u objetivo" />
    <main className="mt-8 flex flex-col gap-12">
      <${Avisos} items=${avisos} titulo="Necesita atención" />
      <${Reveal} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <${Kpi} label="Ingresos" value=${ingresos} suf=" €" delta=${6} hint="frente al trimestre anterior" icon="euro" spark=${D.semanas.map(x => x[1])} />
        <${Kpi} label="Pedidos" value=${D.pedidos} delta=${pct(D.pedidos - D.pedidos_prev, D.pedidos_prev)} hint=${`${nf(D.pedidos_prev)} el trimestre anterior`} icon="paquete" />
        <${Kpi} label="Conversión" value=${D.conversion} dec=${1} suf=" %" delta=${pct(D.conversion - D.conversion_prev, D.conversion_prev)} tono="warn" hint=${`${nf(D.conversion_prev, 1)} % antes`} icon="conversion" />
        <${Kpi} label="Cumplimiento" value=${pct(ingresos, objetivo)} dec=${1} suf=" %" hint=${`de ${eur(objetivo)} de objetivo`} icon="objetivo"
          onClick=${() => document.getElementById('productos')?.scrollIntoView({behavior: RM ? 'auto' : 'smooth'})} />
      <//>
      <${Guia} ...${D.guia} escala=${{mal: '≤ 70 %', medio: '85 %', bien: '100 %'}} />
      <${Resumen} items=${D.resumen} />

      <${Section} id="tendencia" icon="tendencia-sube" title="Los ingresos se mantienen entre 13 y 15 mil euros por semana" sub="Ingresos de todos los canales cada semana."
        leyenda=${{items: [['var(--accent-2)', 'Ingresos semanales', 'line']]}}>
        <${ChartCard} resumen="Gráfica de área de los ingresos semanales, de la semana 36 a la 41." caption="Euros; cambia el periodo en la barra de filtros.">
          <${R.AreaChart} data=${serie.map(([s, v]) => ({s, v}))} margin=${{top: 8, right: 0, left: 8, bottom: 0}}>
            <defs><linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor=${T.accent2} stopOpacity=${0.35} /><stop offset="100%" stopColor=${T.accent2} stopOpacity=${0} /></linearGradient></defs>
            <${R.CartesianGrid} stroke=${T.grid} vertical=${false} />
            <${R.XAxis} dataKey="s" ...${ejes(T)} interval=${0} padding=${{left: 12, right: 12}} /><${R.YAxis} orientation="right" ...${ejes(T)} tickFormatter=${v => nf(v)} width=${56} />
            <${R.Tooltip} content=${html`<${Tip} fmt=${eur} />`} cursor=${{stroke: T.line}} />
            <${R.Area} type="monotone" dataKey="v" name="Ingresos" stroke=${T.accent2} strokeWidth=${2.5} fill="url(#gA)" dot=${{r: 3, fill: T.accent2, strokeWidth: 0}} activeDot=${{r: 5}} isAnimationActive=${!RM} animationDuration=${700} />
          <//>
        <//>
      <//>

      <${Section} id="objetivos" icon="objetivo" title=${`${objetivos.filter(o => o.estado !== 'ok').length} de ${objetivos.length} objetivos del trimestre necesitan atención`}
        leyenda=${{items: [['var(--ok)', 'En plazo'], ['var(--warn)', 'Atención'], ['var(--bad)', 'Bloqueado']]}}>
        ${objetivos.length ? html`<${Grouped}>${objetivos.map(o => html`<div key=${o.nombre} className="flex items-center gap-4 px-5 py-3.5">
          <${Anillo} p=${o.progreso} size=${44} grosor=${5} t=${o.estado === 'ok' ? 1 : o.estado === 'warn' ? .5 : 0} />
          <${Icono} n=${o.icono} size=${15} /><div className="min-w-0 flex-1 font-medium">${o.nombre}</div>
          <${Pill} tono=${o.estado}>${o.detalle}<//></div>`)}<//>` : html`<${Card}><${Vacio} titulo="Ningún objetivo con esos filtros" texto="Cambia la búsqueda o restablece los filtros." /><//>`}
      <//>

      <${Section} id="productos" icon="categoria" title=${`${mejor.nombre} es el producto que mejor cumple su objetivo`} sub="Pulsa un producto para ver su detalle."
        leyenda=${{escala: {mal: 'Cumplimiento ≤ 70 %', medio: '85 %', bien: '100 %'}}}>
        ${vis.length ? html`<${Reveal} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">${vis.map(p => { const c = cumple(p);
          return html`<button key=${p.slug} type="button" onClick=${() => setSel(p.slug)} className="press rounded-card text-left"><${Card} className="flex h-full flex-col gap-3 p-4 hover:ring-2 hover:ring-accent-line">
            <div className="flex items-center gap-2.5"><${Icono} n=${p.icono} size=${16} /><div className="min-w-0 flex-1"><b className="block truncate text-sm font-semibold text-strong">${p.nombre}</b><span className="text-xs text-muted">${D.grupos[p.grupo]}</span></div><${I.ChevronRight} size=${16} className="text-faint" aria-hidden="true" /></div>
            <div className="flex items-end justify-between gap-2"><span className="cifra whitespace-nowrap text-2xl font-bold text-strong">${eur(p.ingresos)}</span><${Spark} datos=${p.semanas} width=${64} height=${22} color=${`var(${SERIES[p.i % 8]})`} /></div>
            <div className="flex items-center gap-2"><div className="flex-1"><${Bar} p=${c} t=${ts(c)} /></div><${SemPill} t=${ts(c)}>${nf(c)} %<//></div>
            ${TONO_STOCK(p) ? html`<${Pill} tono=${TONO_STOCK(p)}>Quedan ${p.stock}<//>` : null}<//></button>`; })}<//>`
          : html`<${Card}><${Vacio} titulo="Ningún producto coincide con los filtros" texto="Cambia el canal, el producto o la búsqueda." accion=${html`<button type="button" onClick=${filtros.reset} className="press mt-2 rounded-full px-4 py-1.5 text-sm font-medium text-accent hover:bg-accent-soft">Restablecer filtros</button>`} /><//>`}
        <${SortTable} rows=${P.filter(visible(f))} q=${f.q} texto=${p => [p.nombre, D.grupos[p.grupo], ICONOS[p.icono]?.[2]].join(' ')} rowKey=${p => p.slug} onRow=${p => setSel(p.slug)}
          activa=${sel} nav=${nav} tono=${TONO_STOCK} exportar="ventas-por-producto" cols=${[
          {k: 'nombre', label: 'Producto', help: 'Producto y categoría.', r: p => html`<span className="inline-flex items-center gap-2"><${Icono} n=${p.icono} size=${13} /><b className="font-semibold text-strong">${p.nombre}</b></span>`},
          {k: 'grupo', label: 'Canal', help: 'Canal en el que más se vende.', v: p => D.grupos[p.grupo]},
          {k: 'ingresos', label: 'Ingresos', help: 'Ingresos del trimestre, en euros.', align: 'right', r: p => nf(p.ingresos)},
          {k: 'unidades', label: 'Unidades', help: 'Unidades vendidas.', align: 'right', r: p => nf(p.unidades)},
          {k: 'cumple', label: 'Cumplimiento', help: 'Ingresos / objetivo del trimestre.', align: 'right', v: cumple, r: p => html`<${SemPill} t=${ts(cumple(p))}>${nf(cumple(p))} %<//>`},
          {k: 'devoluciones', label: 'Devoluciones', help: 'Porcentaje de unidades devueltas.', align: 'right', r: p => `${nf(p.devoluciones, 1)} %`},
          {k: 'stock', label: 'Stock', help: 'Unidades en almacén. Borde ámbar por debajo de 60, rosa-violeta por debajo de 20.', align: 'right', r: p => nf(p.stock)},
        ]} />
      <//>
    </main>
    <${Footer} fuentes=${D.fuentes} fecha=${D.fecha} />

    <${Hoja} abierta=${!!prod} onCerrar=${() => setSel(null)} nav=${nav} titulo=${prod?.nombre} sub=${prod && `${ICONOS[prod.icono]?.[2]} · canal ${D.grupos[prod.grupo]}`} icon=${prod?.icono}>
      ${prod && html`<${React.Fragment}>
        <div className="flex items-center gap-4"><${Anillo} p=${cumple(prod)} t=${ts(cumple(prod))} size=${72} grosor=${7} />
          <div><div className="cifra text-3xl font-bold text-strong">${eur(prod.ingresos)}</div><div className="text-sm text-muted">de ${eur(prod.objetivo)} de objetivo</div></div></div>
        <div><div className="mb-2 text-sm font-semibold text-strong">Ingresos por semana</div><${Spark} datos=${prod.semanas} width=${420} height=${60} color=${`var(${SERIES[prod.i % 8]})`} /></div>
        <${Datos} items=${[['Unidades vendidas', nf(prod.unidades)], ['Precio medio', eur(prod.ingresos / prod.unidades)], ['Devoluciones', `${nf(prod.devoluciones, 1)} %`], ['Stock', `${nf(prod.stock)} unidades`]]} />
        ${TONO_STOCK(prod) ? html`<${Callout} n="stock" color=${TONO_STOCK(prod) === 'bad' ? 'pink' : 'yellow'} titulo="Reponer pronto">Quedan ${prod.stock} unidades: al ritmo actual duran menos de ${Math.max(1, Math.round(prod.stock / (prod.unidades / 13)))} semanas.<//>` : null}
      <//>`}
    <//>
  </div>`;
}
