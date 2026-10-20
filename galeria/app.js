// Galería del kit de ArtefactUI: cada componente con sus variantes y su uso.
// Monta con: python3 kit/montar.py --app galeria/app.js --datos galeria/datos.json --pack packs/comercio.js --salida dist/galeria.html
const Uso = ({children}) => html`<code className="block rounded-xl px-3 py-2 font-mono text-xs" style=${{background: 'var(--code-bg)', color: 'var(--code-ink)'}}>${children}</code>`;
const Muestra = ({titulo, uso, children}) => html`<${Card} className="flex flex-col gap-3 p-5"><b className="text-sm font-semibold text-strong">${titulo}</b>${children}${uso ? html`<${Uso}>${uso}<//>` : null}<//>`;
const TOKENS = [['--bg', 'Fondo'], ['--card', 'Tarjeta'], ['--line', 'Separador'], ['--ink', 'Texto'], ['--muted', 'Secundario'], ['--faint', 'Terciario'],
  ['--accent-2', 'Primario'], ['--ok', 'Bien'], ['--warn', 'Atención'], ['--bad', 'Peligro'], ['--info', 'Información'], ['--nav', 'Panel']];
const Rompe = () => { throw new Error('Error simulado para enseñar <Protegido>.'); };

function App(){
  const theme = useTheme(), T = useTokens(theme.efectivo);
  const [seg, setSeg] = useState('a'), [q, setQ] = useState(''), [hoja, setHoja] = useState(false), [fila, setFila] = useState(null), nav = useNavegacion();
  const filas = [{k: 'Auriculares Pro', e: 'Web', h: 18400, i: 'audio'}, {k: 'Reloj Sport', e: 'App', h: 15200, i: 'reloj'}, {k: 'Altavoz Mini', e: 'Marketplace', h: 9800, i: 'altavoz'},
    {k: 'Teclado mecánico', e: 'Web', h: 7600, i: 'teclado'}, {k: 'Tableta 10"', e: 'App', h: 11100, i: 'tableta'}];
  return html`<div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
    <${Header} theme=${theme} eyebrow="ArtefactUI" title=${D.titulo} lede="Todos los componentes del kit, con sus variantes y cómo se usan. Cambia la apariencia con el botón de arriba para revisar los dos temas." estado=${'componentes.js · ' + D.fecha}
      links=${[['color', 'Color', 'diseno'], ['tipografia', 'Tipografía', 'documentacion'], ['iconos', 'Iconos', 'idea'], ['datos', 'Datos', 'informe'], ['controles', 'Controles', 'automatizacion'], ['estados', 'Estados', 'alerta']]} icono="paquete" />
    <main className="mt-8 flex flex-col gap-12">

      <${Section} id="color" icon="diseno" title="Color" sub="Tokens: claro con la paleta de Apple, oscuro al estilo Cobalt2. Nunca un hex suelto en App().">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">${TOKENS.map(([v, l]) => html`<${Card} key=${v} className="overflow-hidden"><div className="h-14 border-b border-line" style=${{background: `var(${v})`}}></div>
          <div className="px-3 py-2"><b className="block text-xs font-semibold text-strong">${l}</b><span className="font-mono text-xs text-muted">${v}</span></div><//>`)}</div>
        <${Muestra} titulo="Series de gráficas (--s1 … --s8)" uso="SERIES[i] · color estable por elemento: SERIES[x.i % 8]">
          <div className="flex flex-wrap gap-2">${SERIES.map((v, i) => html`<span key=${v} className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs"><span className="h-3 w-3 rounded-full" style=${{background: `var(${v})`}}></span>s${i + 1}</span>`)}</div><//>
        <${Muestra} titulo="Escala semáforo progresiva" uso="semaforo(escala(valor, bien, mal)) · <Leyenda escala={{mal, medio, bien}} />">
          <${Leyenda} escala=${{mal: 'Peligro', medio: 'alerta', bien: 'Todo bien'}} />
          <div className="flex flex-wrap gap-2">${[1, .75, .5, .25, 0].map(t => html`<${SemPill} key=${t} t=${t}>t = ${nf(t, 2)}<//>`)}</div><//>
      <//>

      <${Section} id="tipografia" icon="documentacion" title="Tipografía" sub="Estilos de texto de Apple sobre SF Pro (Inter fuera de Apple).">
        <${Card} className="flex flex-col gap-2 p-5">
          ${[['text-3xl font-bold', 'Large Title · 34'], ['text-2xl font-bold', 'Title 1 · 28'], ['text-xl font-bold', 'Title 2 · 22'], ['text-lg font-semibold', 'Title 3 · 20'], ['text-base', 'Body · 17'], ['text-sm text-muted', 'Subheadline · 15'], ['text-xs text-muted', 'Footnote · 13'], ['text-caption text-faint', 'Caption · 12']]
            .map(([c, l]) => html`<div key=${l} className="flex items-baseline justify-between gap-4 border-b border-line pb-2 last:border-0"><span className=${c + ' text-strong'}>${l.split(' · ')[0]}</span><span className="font-mono text-xs text-muted">${c} · ${l.split(' · ')[1]} px</span></div>`)}
          <div className="cifra text-3xl font-bold text-strong">24.453 € <span className="font-mono text-xs font-normal text-muted">.cifra (SF Pro Rounded)</span></div>
        <//>
      <//>

      <${Section} id="iconos" icon="idea" title="Iconos al estilo Notion" sub="Catálogo semántico en español: cada concepto con su icono y su color. Se usan por nombre en Icono, Section, Kpi, Header, Etiqueta y Callout.">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <${Muestra} titulo="Icono" uso='<Icono n="informe" size tile color />'>
            <div className="flex flex-wrap items-end gap-3"><${Icono} n="informe" size=${12} /><${Icono} n="informe" size=${16} /><${Icono} n="informe" size=${20} /><${IconoPagina} n="informe" /><${Icono} n="informe" tile=${false} /></div><//>
          <${Muestra} titulo="Colores Notion" uso="gray · brown · orange · yellow · green · blue · purple · pink">
            <div className="flex flex-wrap gap-2">${NCOLORES.map(c => html`<${Icono} key=${c} n="equipo" color=${c} size=${16} label=${NOMBRE_COLOR[c]} />`)}</div><//>
          <${Muestra} titulo="Avatar" uso='<Avatar nombre color="var(--s2)" size />'>
            <div className="flex flex-wrap items-center gap-2">${['Ana López', 'Bruno Díaz', 'Carla Ruiz', 'Dani Gil', 'Eva Mora'].map((n, i) => html`<${Avatar} key=${n} nombre=${n} color=${`var(${SERIES[i]})`} />`)}</div><//>
          <${Muestra} titulo="Etiquetas (select de Notion)" uso='<Etiqueta n="sprint">Sprint 2026.6<//>'>
            <div className="flex flex-wrap gap-1.5"><${Etiqueta} n="sprint">Sprint 2026.6<//><${Etiqueta} n="release" /><${Etiqueta} n="bug" /><${Etiqueta} n="idea" /><${Etiqueta} n="ia" /><${Etiqueta} color="brown">Sin icono<//></div><//>
        </div>
        <div className="grid gap-3 md:grid-cols-2"><${Callout} n="idea" titulo="Callout">Bloque destacado de Notion: icono, color suave y texto. <code className="font-mono text-xs">${'<Callout n titulo>'}</code><//>
          <${Callout} n="tienda" color="green">Los iconos de un dominio van en packs opcionales: esta galería carga packs/comercio.js (--pack).<//></div>
        <${CatalogoIconos} />
      <//>

      <${Section} id="datos" icon="informe" title="Datos" sub="KPI, progreso, minigráficas, listas agrupadas y gráficas.">
        <${Reveal} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <${Kpi} label="Con variación" value=${48920} suf=" €" delta=${6} hint="frente al trimestre anterior" icon="euro" />
          <${Kpi} label="Con minigráfica" value=${1842} delta=${8} hint="pedidos · 6 semanas" icon="paquete" spark=${[118, 131, 126, 140, 137, 138]} />
          <${Kpi} label="Decimales" value=${2.9} dec=${1} suf=" %" delta=${-6} tono="warn" hint="conversión" icon="conversion" />
          <${Kpi} label="Pulsable" value=${7} suf=" alertas" hint="abre el detalle" icon="alerta" onClick=${() => setHoja(true)} />
        <//>
        <div className="grid gap-4 md:grid-cols-3">
          <${Muestra} titulo="Barra y barra apilada" uso="<Bar p t /> · <Stack parts={[[valor, color], …]} />">
            <${Bar} p=${72} t=${.9} /><${Bar} p=${45} t=${.45} /><${Bar} p=${20} t=${0} /><${Stack} parts=${[[60, 'var(--s1)'], [25, 'var(--s2)'], [15, 'var(--s3)']]} /><//>
          <${Muestra} titulo="Anillo de progreso" uso="<Anillo p={72} t={escala(…)} size />">
            <div className="flex items-center gap-4"><${Anillo} p=${100} t=${1} /><${Anillo} p=${66} t=${.66} /><${Anillo} p=${33} t=${.33} /><${Anillo} p=${80} size=${72} grosor=${7} /></div><//>
          <${Muestra} titulo="Minigráfica" uso="<Spark datos={[…]} color width height />">
            <${Spark} datos=${[4, 6, 5, 8, 7, 9, 12]} width=${200} height=${40} /><${Spark} datos=${[9, 7, 8, 5, 6, 3]} width=${200} height=${40} color="var(--s3)" /><//>
        </div>
        <${Grouped}>${['Lista agrupada (<Grouped>)', 'Un contenedor, separadores finos', 'Filas con icono, valor y estado'].map((t, i) => html`<div key=${t} className="flex items-center gap-3 px-5 py-3"><${IconBadge} icon=${[I.Layers, I.Rows3, I.CircleCheck][i]} size=${28} /><span className="flex-1">${t}</span><${Pill} tono=${['ok', 'warn', 'neu'][i]}>${['Listo', 'A medias', 'Sin empezar'][i]}<//></div>`)}<//>
        <${ChartCard} title="Gráfica de área (Recharts)" resumen="Ejemplo de gráfica de área." caption="Eje Y a la derecha, rejilla ligera, puntos y degradado del primario.">
          <${R.AreaChart} data=${[118, 131, 126, 140, 137, 138].map((v, i) => ({s: 'S' + (36 + i), v}))} margin=${{top: 8, right: 0, left: 8, bottom: 0}}>
            <defs><linearGradient id="gG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor=${T.accent2} stopOpacity=${0.35} /><stop offset="100%" stopColor=${T.accent2} stopOpacity=${0} /></linearGradient></defs>
            <${R.CartesianGrid} stroke=${T.grid} vertical=${false} /><${R.XAxis} dataKey="s" ...${ejes(T)} interval=${0} padding=${{left: 12, right: 12}} /><${R.YAxis} orientation="right" ...${ejes(T)} width=${40} />
            <${R.Tooltip} content=${html`<${Tip} />`} /><${R.Area} type="monotone" dataKey="v" name="Valor" stroke=${T.accent2} strokeWidth=${2.5} fill="url(#gG)" dot=${{r: 3, fill: T.accent2, strokeWidth: 0}} isAnimationActive=${!RM} />
          <//><//>
      <//>

      <${Section} id="controles" icon="automatizacion" title="Controles" sub="Selector segmentado, búsqueda, tabla operativa, hoja de detalle y exportación.">
        <div className="grid gap-4 md:grid-cols-2">
          <${Muestra} titulo="Selector segmentado" uso="<Segmented options value onChange label />"><${Segmented} label="Ejemplo" options=${[['a', 'Mensual'], ['b', 'Acumulado'], ['c', 'Total']]} value=${seg} onChange=${setSeg} /><//>
          <${Muestra} titulo="Búsqueda (atajo «/»)" uso="<Buscador value onChange placeholder /> · coincide(q, …textos)"><${Buscador} value=${q} onChange=${setQ} placeholder="Busca en la tabla" /><//>
        </div>
        <${SortTable} rows=${filas} q=${q} rowKey=${r => r.k} onRow=${r => setFila(r.k)} activa=${fila} nav=${nav} exportar="galeria" limite=${4} cols=${[
          {k: 'k', label: 'Producto', help: 'Nombre del producto.', r: r => html`<span className="inline-flex items-center gap-2"><${Icono} n=${r.i} size=${13} />${r.k}</span>`},
          {k: 'e', label: 'Canal', help: 'Canal principal de venta.'}, {k: 'h', label: 'Ingresos', help: 'Ingresos del trimestre, en euros.', align: 'right', r: r => nf(r.h)}]} />
        <${Uso}>${'<SortTable rows cols rowKey q onRow activa={sel} nav={nav} exportar="nombre" limite={4} tono vacio /> · const nav = useNavegacion() · <Hoja nav={nav}>'}<//>
        <button type="button" onClick=${() => setHoja(true)} className="press inline-flex w-fit items-center gap-2 rounded-full bg-accent-soft px-4 py-2 text-sm font-medium text-accent"><${I.PanelRight} size=${16} /> Abrir una hoja de detalle</button>
      <//>

      <${Section} id="estados" icon="alerta" title="Estados" sub="Píldoras, avisos de datos, vacío, carga, error y avisos breves.">
        <div className="flex flex-wrap gap-2">${['ok', 'warn', 'bad', 'info', 'neu'].map(t => html`<${Pill} key=${t} tono=${t}>tono ${t}<//>`)}</div>
        <${Avisos} items=${['Faltan los datos de la semana 41 del canal Marketplace.', 'El objetivo de «Cámara de acción» es 0: no se puede calcular su cumplimiento.']} />
        <${Avisos} tono="info" titulo="Aviso informativo" items=${['Los datos son de ejemplo.']} />
        <div className="grid gap-4 md:grid-cols-3">
          <${Card}><${Vacio} titulo="Estado vacío" texto="<Vacio icon titulo texto accion />" /><//>
          <${Muestra} titulo="Cargando" uso="<Esqueleto lineas />"><${Esqueleto} lineas=${4} /><//>
          <${Protegido} nombre="este ejemplo"><${Rompe} /><//>
        </div>
        <button type="button" onClick=${() => toast('Esto es un aviso breve: se cierra solo.', 'ok')} className="press inline-flex w-fit items-center gap-2 rounded-full bg-accent-soft px-4 py-2 text-sm font-medium text-accent"><${I.Bell} size=${16} /> Lanzar un aviso breve</button>
        <${Uso}>toast('texto', 'ok' | 'warn' | 'info')<//>
      <//>
    </main>
    <${Footer} fuentes=${['kit/componentes.js', 'kit/tokens.css']} fecha=${D.fecha} />
    <${Hoja} abierta=${hoja} onCerrar=${() => setHoja(false)} titulo="Hoja de detalle" sub="Lateral en escritorio, desde abajo en móvil" icon=${I.PanelRight}>
      <${Datos} items=${[['Se cierra con', 'Esc, el fondo o la ×'], ['Foco', 'queda dentro y vuelve al cerrar'], ['Uso', '<Hoja abierta onCerrar titulo>']]} />
      <${Anillo} p=${66} t=${.66} size=${72} grosor=${7} />
    <//>
    ${(() => { const r = filas.find(x => x.k === fila), otras = r ? filas.filter(x => x.e === r.e && x.k !== r.k) : [];
      return html`<${Hoja} abierta=${!!r} onCerrar=${() => setFila(null)} nav=${nav} titulo=${r?.k} sub=${r && `Canal ${r.e}`} icon=${r?.i}>
        ${r ? html`<${React.Fragment}>
          <${Datos} items=${[['Ingresos', nf(r.h) + ' €'], ['Navegar', '↑ ↓ o los botones de arriba, en el orden de la tabla'], ['Uso', '<Hoja nav={nav}> · <SortTable activa nav>']]} />
          <${Relacionados} titulo=${`Mismo canal (${r.e})`} items=${otras.map(x => ({id: x.k, titulo: nf(x.h) + ' €', texto: 'Se ve aquí sin salir del detalle; «Ver el detalle» salta a esa fila.', abrir: () => setFila(x.k)}))} />
          ${otras.length ? null : html`<p className="text-sm text-muted">Ningún otro producto vende por ${r.e}. <code>${'<Relacionados titulo items />'}</code> no pinta nada si no hay elementos.</p>`}
        <//>` : null}<//>`; })()}
  </div>`;
}
