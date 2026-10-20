/* ===== ArtefactUI · kit de componentes =====
   Design system: HIG de Apple (claro) + Cobalt2 (oscuro), primario verde, peligro rosa-violeta, escala semáforo progresiva.
   Uso: no se edita por informe. Cada informe aporta D (datos) y App(); montar.py lo junta todo en un HTML.
   Catálogo visual: dist/galeria.html. Documentación: README.md y skills/artefactui/SKILL.md. Licencia MIT. */
const {useState, useEffect, useLayoutEffect, useMemo, useRef} = React;
const html = htm.bind(React.createElement);
const R = Recharts, I = LucideReact;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = s => String(s ?? '');
// useGrouping 'always': en es-ES el navegador no agrupa los números de 4 cifras
const nf = (n, d = 0) => (n ?? 0).toLocaleString('es-ES', {minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: 'always'});
const pct = (a, b) => b ? 100 * a / b : 0;
const cx = (...c) => c.filter(Boolean).join(' ');
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const SERIES = ['--s1', '--s2', '--s3', '--s4', '--s5', '--s6', '--s7', '--s8'];
const SEM = ['--sem1', '--sem2', '--sem3', '--sem4', '--sem5'];
const clamp01 = x => Math.max(0, Math.min(1, x));
// Posición de un valor en la escala: 1 = todo bien, 0 = peligro. bien/mal pueden ir en cualquier orden (p. ej. retraso: bien 0, mal 10)
const escala = (v, bien, mal) => clamp01((v - mal) / (bien - mal));
// Color progresivo menta → verde lima → amarillo → naranja → rosa-violeta, interpolado en OKLCH (para CSS: fondos, barras, texto)
function semaforo(t){ const x = (1 - clamp01(t)) * 4, i = Math.min(3, Math.floor(x)), f = x - i;
  return `color-mix(in oklch, var(${SEM[i]}) ${Math.round((1 - f) * 100)}%, var(${SEM[i + 1]}))`; }
// Lo mismo en hex para Recharts (no entiende variables ni color-mix): semHex(t, T)
function semHex(t, T){ const x = (1 - clamp01(t)) * 4, i = Math.min(3, Math.floor(x)), f = x - i, a = T.sem[i], b = T.sem[i + 1];
  const c = k => Math.round(parseInt(a.slice(k, k + 2), 16) * (1 - f) + parseInt(b.slice(k, k + 2), 16) * f).toString(16).padStart(2, '0');
  return '#' + c(1) + c(3) + c(5); }

// Tema: OSCURO por defecto (decisión del usuario, por encima de la HIG). El botón recorre oscuro → claro → automático
// (seguir al sistema) y la elección se recuerda en este navegador, «automático» incluido.
function useTheme(){
  const forzado = /tema=(claro|oscuro)/.test(location.hash);    // #tema=… manda en revisiones y no se guarda
  const [modo, setModo] = useState(() => { try { if (!forzado && localStorage.getItem('tema') === 'auto') return 'auto'; } catch (e) {} return document.documentElement.dataset.theme || 'dark'; });
  const [sys, setSys] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  useEffect(() => { const m = matchMedia('(prefers-color-scheme: dark)'); const f = () => setSys(m.matches ? 'dark' : 'light'); m.addEventListener('change', f); return () => m.removeEventListener('change', f); }, []);
  useEffect(() => { const r = document.documentElement; if (modo === 'auto') delete r.dataset.theme; else r.dataset.theme = modo;
    if (forzado) return; try { localStorage.setItem('tema', modo); } catch (e) {} }, [modo]);
  return {modo, efectivo: modo === 'auto' ? sys : modo, siguiente: () => setModo(m => ({dark: 'light', light: 'auto', auto: 'dark'})[m])};
}
// Colores de los tokens para Recharts (se recalculan al cambiar de tema)
function useTokens(efectivo){
  return useMemo(() => ({accent: css('--accent'), accent2: css('--accent-2'), muted: css('--muted'), faint: css('--faint'), line: css('--line'), grid: css('--grid'),
    card: css('--tip'), info: css('--info'), warn: css('--warn'), bad: css('--bad'), series: SERIES.map(css), sem: SEM.map(css)}), [efectivo]);
}
function ThemeToggle({theme}){
  const Ico = {auto: I.SunMoon, light: I.Sun, dark: I.Moon}[theme.modo];
  const lbl = {auto: 'Apariencia automática, como el sistema', light: 'Apariencia clara', dark: 'Apariencia oscura'}[theme.modo] + '. Pulsa para cambiar';
  return html`<button type="button" onClick=${theme.siguiente} title=${lbl} aria-label=${lbl}
    className="press inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card text-muted hover:text-ink"><${Ico} size=${17} strokeWidth=${1.8} /></button>`;
}
// Entrada al hacer scroll (artifact-motion): sin .play todo está completo; .play reproduce al entrar en pantalla
function Reveal({as = 'div', className = '', children}){
  const ref = useRef(null);
  useEffect(() => { const el = ref.current; if (RM || !el) return; [...el.children].forEach((c, i) => c.style.setProperty('--i', i));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { el.classList.add('play'); io.disconnect(); } }), {threshold: .15}); io.observe(el); return () => io.disconnect(); }, []);
  return React.createElement(as, {ref, className: cx('reveal', className)}, children);
}
// Contador que sube desde 0 al montarse (800 ms; respeta Reducir movimiento). El inicio es el tiempo del primer
// fotograma, no performance.now(): con relojes distintos el avance salía negativo y la cifra parpadeaba en negativo
function Count({to, dec = 0, pre = '', suf = ''}){
  const [v, setV] = useState(RM ? to : 0);
  useEffect(() => { if (RM) { setV(to); return; } let raf, t0;
    const tick = t => { t0 ??= t; const p = Math.min(1, (t - t0) / 800); setV(to * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf); }, [to]);
  return html`<span className="num">${pre}${nf(v, dec)}${suf}</span>`;
}
// Estado: color + icono + texto (HIG: nunca solo color)
const TONO = {ok: 'bg-ok-soft text-ok-ink', info: 'bg-info-soft text-info-ink', warn: 'bg-warn-soft text-warn-ink', bad: 'bg-bad-soft text-bad-ink', neu: 'bg-transparent text-muted ring-1 ring-inset ring-line'};
const ICONO = {ok: I.CircleCheck, info: I.Info, warn: I.TriangleAlert, bad: I.OctagonMinus, neu: I.CircleDashed};
const Pill = ({tono = 'neu', children, icon}) => { const Ic = icon === false ? null : (icon || ICONO[tono]);
  return html`<span className=${cx('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium', TONO[tono])}>${Ic ? html`<${Ic} size=${13} strokeWidth=${2.2} aria-hidden="true" />` : null}${children}</span>`; };
// Píldora con color progresivo: t = escala(valor, bien, mal). El texto lleva el valor, así el color no es la única señal
const SemPill = ({t, children}) => html`<span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium"
  style=${{color: `color-mix(in oklch, ${semaforo(t)} var(--sem-ink), black)`, background: `color-mix(in oklch, ${semaforo(t)} 18%, transparent)`}}>${children}</span>`;
// Leyenda cromática SIEMPRE visible junto a lo que colorea (no depende de que la guía esté abierta).
// escala: {mal, medio, bien} pinta la rampa semáforo; items: [[color CSS, etiqueta, forma 'dot'|'line'|'dash']]
const Leyenda = ({escala: e, items = []}) => html`<div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted" role="note" aria-label="Leyenda de colores">
  ${e ? html`<span className="inline-flex items-center gap-2"><span>${e.mal}</span>
    <span className="h-1.5 w-28 rounded-full" style=${{background: 'linear-gradient(90deg, var(--sem5), var(--sem4), var(--sem3), var(--sem2), var(--sem1))'}}></span>
    <span>${e.bien}</span>${e.medio ? html`<span className="text-faint">(amarillo: ${e.medio})</span>` : null}</span>` : null}
  ${items.map(([c, l, forma = 'dot']) => html`<span key=${l} className="inline-flex items-center gap-1.5">
    ${forma === 'dot' ? html`<span className="h-2.5 w-2.5 rounded-full" style=${{background: c}}></span>`
      : html`<span className="w-4" style=${{borderTop: `2px ${forma === 'dash' ? 'dashed' : 'solid'} ${c}`}}></span>`}${l}</span>`)}
</div>`;
// Iconografía (HIG: símbolos sencillos y reconocibles, del mismo peso que el texto). lucide, trazo 2.
// IconBadge: icono en un cuadrado redondeado tintado, como los de Ajustes de iOS. tint = color CSS (por defecto, el primario)
// Con una clave del catálogo (icon="equipo") pinta el icono al estilo Notion con su color
const IconBadge = ({icon, tint = 'var(--accent-2)', size = 32}) => typeof icon === 'string' ? html`<${Icono} n=${icon} size=${Math.round(size * .56)} />` : html`<span aria-hidden="true" className="inline-flex shrink-0 items-center justify-center rounded-[9px]"
  style=${{width: size, height: size, color: `color-mix(in oklch, ${tint} var(--sem-ink), black)`, background: `color-mix(in oklch, ${tint} 18%, transparent)`}}><${icon} size=${Math.round(size * .56)} strokeWidth=${2} /></span>`;
// Avatar con iniciales en un color de serie (personas, clientes, organizaciones)
const iniciales = n => n.replace(/\(.*\)/, '').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const Avatar = ({nombre, color, size = 32}) => html`<span aria-hidden="true" className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold"
  style=${{width: size, height: size, fontSize: Math.round(size * .4), color: `color-mix(in oklch, ${color} var(--sem-ink), black)`, background: `color-mix(in oklch, ${color} 22%, transparent)`}}>${iniciales(nombre)}</span>`;
// Iconos por defecto de los apartados de la guía, por la primera palabra del título (se puede pasar uno propio como tercer elemento)
const ICONO_GUIA = {fuentes: I.Database, 'fórmula': I.Sigma, colores: I.Palette, siglas: I.Type, 'límites': I.CircleAlert, navegar: I.MousePointerClick,
  calendario: I.CalendarDays, datos: I.Database, 'métricas': I.Gauge, umbrales: I.Target};
const Card = ({className = '', children}) => html`<div className=${cx('rounded-card border border-line bg-card shadow-card backdrop-blur-sm', className)}>${children}</div>`;
// Lista agrupada (estilo «inset grouped» de Apple): un contenedor, filas separadas por un separador fino sangrado
const Grouped = ({children}) => html`<${Card} className="overflow-hidden"><${Reveal} className="divide-y divide-line">${children}<//><//>`;
const Bar = ({p, color, tono, t}) => html`<div className="h-1.5 w-full overflow-hidden rounded-full bg-line"><div className="crece h-full rounded-full"
  style=${{width: Math.max(0, Math.min(100, p)) + '%', background: color || (t != null ? semaforo(t) : {ok: 'var(--ok)', neu: 'var(--faint)'}[tono || 'ok'] || `var(--${tono})`)}}></div></div>`;
// Barra apilada fina con separadores entre segmentos (HIG: separar áreas de color contiguas)
const Stack = ({parts}) => { const tot = parts.reduce((a, [v]) => a + v, 0) || 1;
  return html`<div className="flex h-1.5 gap-px overflow-hidden rounded-full bg-line">${parts.filter(([v]) => v > 0).map(([v, c], i) => html`<div key=${i} className="crece h-full" style=${{width: pct(v, tot) + '%', background: c}}></div>`)}</div>`; };
// Selector segmentado de Apple: el indicador se desliza al elegir (muelle, 280 ms)
function Segmented({options, value, onChange, label}){
  const wrap = useRef(null), [ind, setInd] = useState(null), [animar, setAnimar] = useState(false);   // solo se anima al elegir, nunca al cargar
  // Mide el botón activo. Se vuelve a medir cuando cambia el tamaño de cualquier botón (Tailwind genera las clases
  // al vuelo y la fuente carga después del primer pintado) y cuando terminan de cargar las fuentes
  const medir = () => { const b = wrap.current?.querySelector('[aria-pressed="true"]');
    setInd(i => { const n = b ? {left: b.offsetLeft, width: b.offsetWidth, top: b.offsetTop, height: b.offsetHeight} : null;
      return i && n && i.left === n.left && i.width === n.width && i.top === n.top && i.height === n.height ? i : n; }); };
  useLayoutEffect(medir, [value, options.length]);
  useEffect(() => { const el = wrap.current; if (!el) return;
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(medir) : null;
    if (ro) { ro.observe(el); [...el.querySelectorAll('button')].forEach(b => ro.observe(b)); }
    document.fonts?.ready?.then(medir); addEventListener('resize', medir);
    return () => { ro?.disconnect(); removeEventListener('resize', medir); }; }, [options.length]);
  return html`<div ref=${wrap} role="group" aria-label=${label} className="relative inline-flex flex-wrap rounded-full bg-line p-0.5">
    ${ind ? html`<span aria-hidden="true" className="absolute rounded-full shadow-card ring-1 ring-line"
      style=${{background: 'var(--sel)', left: ind.left, width: ind.width, top: ind.top, height: ind.height, transition: RM || !animar ? 'none' : 'left var(--t-ui) var(--spring), width var(--t-ui) var(--spring), top var(--t-ui) var(--spring)'}}></span>` : null}
    ${options.map(([k, l]) => html`<button key=${String(k)} type="button" aria-pressed=${value === k} onClick=${() => { setAnimar(true); onChange(k); }}
      className=${cx('press relative z-10 min-h-[30px] rounded-full px-3.5 text-xs font-medium', value === k ? '' : 'text-muted hover:text-ink')} style=${value === k ? {color: 'var(--sel-ink)'} : null}>${l}</button>`)}
  </div>`;
}
// leyenda: props de <Leyenda>, obligatoria si los colores significan algo. icon: obligatorio en toda sección (tint opcional)
const Section = ({id, title, sub, right, leyenda, icon, tint, children}) => html`<section id=${id} className="flex flex-col gap-4 scroll-mt-20">
  <div className="flex flex-wrap items-end justify-between gap-3"><div className="flex items-start gap-3">${icon ? html`<${IconBadge} icon=${icon} tint=${tint} />` : null}
    <div><h2 className="text-xl font-bold tracking-tight text-strong">${title}</h2>${sub ? html`<p className="mt-1 max-w-3xl text-sm text-muted">${sub}</p>` : null}</div></div>${right}</div>
  ${leyenda ? html`<${Leyenda} ...${leyenda} />` : null}<${Protegido} nombre=${typeof title === 'string' ? `«${title}»` : 'esta sección'}>${children}<//></section>`;

// Cabecera: barra con material translúcido, título grande, estado con punto y selector de periodo
// barra: controles propios en la barra superior, junto al título (navegación entre páginas, selector de elemento…)
function Header({theme, eyebrow, title, lede, estado, periodos, periodo, setPeriodo, links, icono, barra}){
  return html`<${React.Fragment}>
    <nav className="sticky top-0 z-20 -mx-4 border-b border-line backdrop-blur-md sm:-mx-6" style=${{background: 'var(--nav)'}}>
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-5 px-4 sm:px-6">
        <span className=${cx('truncate text-sm font-semibold text-strong', barra ? 'hidden max-w-[12rem] lg:inline' : '')}>${title}</span>
        ${barra ? html`<div className="flex shrink-0 items-center gap-1.5">${barra}</div>` : null}
        <div className=${cx('ml-auto hidden whitespace-nowrap text-sm', barra ? 'gap-4 xl:flex' : 'gap-5 md:flex')}>${links.map(([h, l, Ic]) => html`<a key=${h} href=${'#' + h} className="inline-flex items-center gap-1.5 text-muted no-underline hover:text-ink">${typeof Ic === 'string' ? html`<${Icono} n=${Ic} size=${14} tile=${false} />` : Ic ? html`<${Ic} size=${15} aria-hidden="true" />` : null}${l}</a>`)}</div>
        <div className=${cx('ml-auto', barra ? 'xl:ml-0' : 'md:ml-0')}><${ThemeToggle} theme=${theme} /></div>
      </div>
    </nav>
    <header className="flex flex-col gap-3 pt-10">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-accent">${eyebrow}</span>
        <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
          <span className="latido h-2 w-2 rounded-full bg-accent" aria-hidden="true"></span>${estado}</span>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>${icono ? html`<div className="mb-3"><${IconoPagina} n=${icono} /></div>` : null}<h1 className="text-3xl font-bold tracking-tight text-strong">${title}</h1><p className="mt-2 max-w-2xl text-base text-muted">${lede}</p></div>
        ${periodos ? html`<${Segmented} label="Periodo" options=${periodos} value=${periodo} onChange=${setPeriodo} />` : null}
      </div>
    </header>
  <//>`;
}
// Manual de interpretación (obligatorio), abierto la primera vez que se publica (divulgación progresiva).
// abierta={false} lo deja cerrado al cargar (páginas de trabajo que se abren a diario)
function Guia({formula, defs, escala: esc_, abierta = true}){
  return html`<details id="guia" open=${abierta} className="group scroll-mt-20 rounded-card border border-line bg-card shadow-card backdrop-blur-sm">
    <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent"><${I.BookOpen} size=${18} /></span>
      <span className="flex-1"><b className="block text-base font-semibold text-strong">Cómo leer este informe</b><small className="text-xs text-muted">De dónde salen los datos, cómo se calcula cada cifra y qué significa cada color</small></span>
      <${I.ChevronRight} size=${18} className="text-muted transition-transform duration-300 group-open:rotate-90" />
    </summary>
    <div className="flex flex-col gap-4 border-t border-line px-5 py-4">
      ${formula ? html`<code className="rounded-xl px-3 py-2 font-mono text-xs" style=${{background: 'var(--code-bg)', color: 'var(--code-ink)'}}>${formula}</code>` : null}
      ${esc_ ? html`<${Leyenda} escala=${esc_} />` : null}
      <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-3">${defs.map(([t, d, ic]) => { const Ic = ic || ICONO_GUIA[t.toLowerCase().split(' ')[0]] || I.Info;
        return html`<div key=${t} className="flex gap-3"><${IconBadge} icon=${Ic} size=${28} tint="var(--s2)" /><div><dt className="font-semibold text-strong">${t}</dt><dd className="mt-0.5 text-muted" dangerouslySetInnerHTML=${{__html: d}}></dd></div></div>`; })}</dl>
    </div>
  </details>`;
}
// En resumen: conclusiones con icono de idea
const Resumen = ({items}) => html`<${Card} className="flex gap-4 p-5"><${IconBadge} icon=${I.Lightbulb} tint="var(--warn)" />
  <div className="flex-1"><h2 className="text-base font-semibold text-strong">En resumen</h2>
  <ul className="mt-2 flex flex-col gap-2">${items.map((r, i) => html`<li key=${i} className="flex gap-2"><${I.ChevronRight} size=${18} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" /><span>${r}</span></li>`)}</ul></div><//>`;
// Tooltip de Recharts: material oscuro/claro, borde fino
const Tip = ({active, payload, label, fmt = v => nf(v)}) => !active || !payload?.length ? null : html`<div className="rounded-xl border border-line-strong px-3 py-2 text-xs shadow-xl" style=${{background: 'var(--tip)'}}>
  <div className="mb-1 font-semibold text-strong">${label}</div>
  ${payload.filter(p => p.value).map(p => html`<div key=${p.dataKey} className="flex items-center gap-2 text-muted"><span className="h-2 w-2 rounded-full" style=${{background: p.color || p.stroke || p.fill}}></span>${p.name}<b className="ml-auto pl-3 num font-semibold text-ink">${fmt(p.value)}</b></div>`)}</div>`;
// Ejes limpios (HIG: rejilla ligera, etiquetas tenues para que manden los datos)
const ejes = T => ({axisLine: false, tickLine: false, tick: {fill: T.muted, fontSize: 13}});
// resumen: frase con la conclusión de la gráfica; se lee en voz alta (role=img) y se muestra como título si no hay otro
const ChartCard = ({title, resumen, caption, height = 320, children}) => html`<${Card} className="p-5">
  ${title ? html`<h3 className="mb-4 text-base font-semibold text-strong">${title}</h3>` : null}
  <div style=${{height}} role="img" aria-label=${resumen || title || caption}><${R.ResponsiveContainer} width="100%" height="100%">${children}<//></div>
  ${caption ? html`<p className="caption mt-3 text-xs">${caption}</p>` : null}<//>`;

// ¿Se ve este elemento con los filtros actuales? Cada elemento lleva {slug, grupo}
const visible = f => x => (f.grupo === 'todos' || x.grupo === f.grupo) && (!f.elemento || x.slug === f.elemento);
const Footer = ({fuentes, fecha}) => html`<footer className="mt-16 flex gap-2 border-t border-line py-8 text-xs text-muted"><${I.Database} size=${15} className="shrink-0" aria-hidden="true" /><span>Fuentes: ${fuentes.join(' · ')}. Generado el ${fecha} con ArtefactUI.</span><${Toasts} /></footer>`;

/* ---------- Operativa: estado recordado, filtros, búsqueda ---------- */
// Estado que se recuerda en este navegador: conveniencia de cada usuario (filtros, pestaña). Nunca datos compartidos.
function useRecordado(clave, inicial){
  const k = 'artefactui:' + (typeof D !== 'undefined' && D.titulo ? D.titulo : document.title) + ':' + clave;
  const obj = inicial && typeof inicial === 'object' && !Array.isArray(inicial);
  const [v, setV] = useState(() => { try { const x = localStorage.getItem(k); if (x == null) return inicial; const p = JSON.parse(x); return obj ? {...inicial, ...p} : p; } catch (e) { return inicial; } });
  useEffect(() => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }, [v]);
  return [v, setV];
}
// Filtros globales de la página: {periodo, grupo, elemento, q}. set(patch), reset(), activos = cuántos difieren del inicial
function useFiltros(inicial = {}){
  const base = {periodo: null, grupo: 'todos', elemento: '', q: '', ...inicial};
  const [f, setF] = useRecordado('filtros', base);
  const activos = Object.keys(base).filter(k => k !== 'periodo' && f[k] !== base[k]).length;
  return {f, set: patch => setF(x => ({...x, ...patch})), reset: () => setF(x => ({...base, periodo: x.periodo})), activos};
}
// Búsqueda sin tildes ni mayúsculas
const norm = s => String(s ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const coincide = (q, ...t) => !q || t.some(x => norm(x).includes(norm(q)));
// Caja de búsqueda; «/» la enfoca desde cualquier sitio
function Buscador({value, onChange, placeholder = 'Buscar', atajo = true}){
  const ref = useRef(null);
  useEffect(() => { if (!atajo) return; const h = e => { if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement?.tagName || '')) { e.preventDefault(); ref.current?.focus(); } };
    addEventListener('keydown', h); return () => removeEventListener('keydown', h); }, []);
  return html`<label className="relative inline-flex min-h-[34px] items-center">
    <${I.Search} size=${15} className="pointer-events-none absolute left-3 text-faint" aria-hidden="true" />
    <input ref=${ref} type="search" value=${value} onChange=${e => onChange(e.target.value)} placeholder=${placeholder} aria-label=${placeholder}
      className="min-h-[34px] w-56 rounded-full border border-line bg-card pl-9 pr-9 text-xs placeholder:text-faint" style=${{color: 'var(--input-ink)'}} />
    ${value ? html`<button type="button" onClick=${() => onChange('')} aria-label="Borrar búsqueda" className="press absolute right-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-faint hover:text-ink"><${I.X} size=${14} /></button>`
      : atajo ? html`<kbd className="pointer-events-none absolute right-3 rounded border border-line px-1 font-mono text-[11px] text-faint">/</kbd>` : null}
  </label>`;
}
// Desplegable de filtro. options = [[valor, etiqueta]]; todos = texto de la opción vacía (sin filtro). label: nombre accesible.
// Menú propio, no <select>: el menú nativo del navegador no se ve bien dentro del visor de artifacts (sale vacío o sin contraste).
// Teclado: ↑ ↓ Inicio Fin para moverse, Intro o espacio para elegir, Esc para cerrar
let DESPLEGABLES = 0;
function Desplegable({label, value, onChange, options, todos}){
  const ops = todos != null ? [['', todos], ...options] : options;
  const [abierto, setAbierto] = useState(false), [activo, setActivo] = useState(0);
  const id = useRef('desplegable-' + (++DESPLEGABLES)).current, caja = useRef(null), boton = useRef(null), lista = useRef(null);
  const actual = ops.find(([k]) => String(k) === String(value ?? '')), sel = Math.max(0, ops.findIndex(([k]) => String(k) === String(value ?? '')));
  const abrir = () => { setActivo(sel); setAbierto(true); };
  const cerrar = (foco = true) => { setAbierto(false); if (foco) boton.current?.focus(); };
  const elegir = k => { onChange(k); cerrar(); };
  useEffect(() => { if (!abierto) return; lista.current?.focus();
    const fuera = e => { if (!caja.current?.contains(e.target)) setAbierto(false); };
    document.addEventListener('pointerdown', fuera); return () => document.removeEventListener('pointerdown', fuera); }, [abierto]);
  useEffect(() => { if (abierto) lista.current?.querySelector(`#${id}-${activo}`)?.scrollIntoView({block: 'nearest'}); }, [abierto, activo]);
  const teclaBoton = e => { if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); abrir(); } };
  const teclaLista = e => {
    const mover = n => { e.preventDefault(); setActivo(n); };
    if (e.key === 'ArrowDown') mover(Math.min(ops.length - 1, activo + 1)); else if (e.key === 'ArrowUp') mover(Math.max(0, activo - 1));
    else if (e.key === 'Home') mover(0); else if (e.key === 'End') mover(ops.length - 1);
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegir(ops[activo][0]); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cerrar(); } else if (e.key === 'Tab') cerrar(false); };
  const filtrando = String(value ?? '') !== '';
  return html`<div ref=${caja} className="relative inline-flex">
    <button ref=${boton} type="button" aria-haspopup="listbox" aria-expanded=${abierto} aria-label=${`${label}: ${actual ? actual[1] : todos || ''}`}
      onClick=${() => abierto ? cerrar() : abrir()} onKeyDown=${teclaBoton}
      className=${cx('press inline-flex min-h-[34px] max-w-[18rem] items-center gap-1.5 rounded-full border bg-card px-3.5 text-xs', filtrando ? 'border-accent-line' : 'border-line')}
      style=${{color: 'var(--input-ink)'}}><span className="truncate">${actual ? actual[1] : todos || label}</span>
      <${I.ChevronDown} size=${14} aria-hidden="true" className=${cx('shrink-0 transition-transform', abierto && 'rotate-180')} /></button>
    ${abierto ? html`<ul ref=${lista} role="listbox" tabIndex=${-1} aria-label=${label} aria-activedescendant=${`${id}-${activo}`} onKeyDown=${teclaLista}
      className="absolute left-0 top-full z-30 mt-1 max-h-72 min-w-full overflow-auto rounded-2xl border border-line-strong p-1 shadow-card outline-none"
      style=${{background: 'var(--card)', width: 'max-content', maxWidth: 'min(22rem, calc(100vw - 2rem))', animation: 'fade var(--t-ui) var(--spring)'}}>
      ${ops.map(([k, l], n) => { const elegido = String(k) === String(value ?? '');
        return html`<li key=${String(k)} id=${`${id}-${n}`} role="option" aria-selected=${elegido} onPointerEnter=${() => setActivo(n)} onClick=${() => elegir(k)}
          className=${cx('flex cursor-pointer items-center gap-2 rounded-xl px-3 py-1.5 text-xs', elegido ? 'font-semibold text-strong' : 'text-ink')}
          style=${n === activo ? {background: 'var(--row-hover)'} : null}>
          <span className="inline-flex w-3.5 shrink-0 justify-center">${elegido ? html`<${I.Check} size=${13} aria-hidden="true" className="text-accent" />` : null}</span>${l}</li>`; })}
    </ul>` : null}
  </div>`;
}
// Barra de filtros global, pegada bajo la barra superior. filtros = useFiltros().
// grupos = {id: etiqueta} (canal, región, equipo…); elementos = [{slug, nombre}] (producto, cliente, persona…); todo opcional
function BarraFiltros({filtros, periodos, grupos, elementos, etiquetaGrupos = 'Grupo', todosGrupos = 'Todos', etiquetaElementos = 'Elemento', todosElementos = 'Todos',
  buscar = true, placeholder = 'Buscar'}){
  const {f, set, reset, activos} = filtros;
  return html`<div className="sticky top-14 z-10 -mx-4 border-b border-line px-4 py-2.5 backdrop-blur-md sm:-mx-6 sm:px-6" style=${{background: 'var(--nav)'}} role="search" aria-label="Filtros">
    <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2">
      <${I.SlidersHorizontal} size=${16} className="text-faint" aria-hidden="true" />
      ${periodos ? html`<${Segmented} label="Periodo" options=${periodos} value=${f.periodo} onChange=${v => set({periodo: v})} />` : null}
      ${grupos ? html`<${Segmented} label=${etiquetaGrupos} options=${[['todos', todosGrupos], ...Object.entries(grupos)]} value=${f.elemento ? null : f.grupo} onChange=${v => set({grupo: v, elemento: ''})} />` : null}
      ${elementos ? html`<${Desplegable} label=${etiquetaElementos} value=${f.elemento} onChange=${v => set({grupo: 'todos', elemento: v})} todos=${todosElementos}
        options=${elementos.map(x => [x.slug, x.nombre])} />` : null}
      ${buscar ? html`<${Buscador} value=${f.q} onChange=${q => set({q})} placeholder=${placeholder} />` : null}
      ${activos ? html`<button type="button" onClick=${reset} className="press inline-flex min-h-[30px] items-center gap-1 rounded-full px-3 text-xs font-medium text-accent hover:bg-accent-soft"><${I.RotateCcw} size=${13} aria-hidden="true" /> Restablecer (${activos})</button>` : null}
    </div></div>`;
}

/* ---------- Edición: campos y estado compartido ---------- */
// Campo editable (número, texto o nota). Número: escribe con coma o punto; vacío = null. unidad: «€», «uds»…; help: texto bajo el campo.
// original: valor de partida; si el campo lo cambia, se marca y ofrece volver a él
function Campo({label, value, onChange, tipo = 'numero', unidad, help, min, max, step = 1, original, disabled, ancho = 'w-28', placeholder}){
  const num = tipo === 'numero', [txt, setTxt] = useState(value == null ? '' : num ? String(value).replace('.', ',') : value);
  useEffect(() => { const v = num ? (txt === '' ? null : Number(txt.replace(',', '.'))) : txt; if (v !== value) setTxt(value == null ? '' : num ? String(value).replace('.', ',') : value); }, [value]);
  const cambia = t => { setTxt(t); if (!num) return onChange(t); if (t.trim() === '') return onChange(null);
    const v = Number(t.replace(',', '.')); if (!Number.isNaN(v)) onChange(min != null || max != null ? Math.min(max ?? Infinity, Math.max(min ?? -Infinity, v)) : v); };
  const tocado = original !== undefined && value != null && value !== original;
  const cls = 'min-h-[34px] rounded-xl border bg-card px-3 text-sm num disabled:opacity-60 ' + (tocado ? 'border-[var(--warn)]' : 'border-line');
  const input = tipo === 'nota'
    ? html`<textarea value=${txt} onChange=${e => cambia(e.target.value)} disabled=${disabled} rows="2" placeholder=${placeholder} aria-label=${label} className=${cx(cls, 'w-full py-2')} style=${{color: 'var(--input-ink)'}}></textarea>`
    : html`<input value=${txt} onChange=${e => cambia(e.target.value)} disabled=${disabled} inputMode=${num ? 'decimal' : 'text'} placeholder=${placeholder} aria-label=${label}
        className=${cx(cls, ancho, num && 'text-right')} style=${{color: 'var(--input-ink)'}} />`;
  return html`<label className=${cx('flex flex-col gap-1', tipo === 'nota' && 'w-full')}>
    ${label ? html`<span className="text-xs font-medium text-muted">${label}</span>` : null}
    <span className="flex items-center gap-2">${input}${unidad ? html`<span className="text-xs text-muted">${unidad}</span>` : null}
      ${tocado ? html`<button type="button" onClick=${() => onChange(original)} title=${'Volver a ' + nf(original, 2)} aria-label=${'Volver al valor de partida, ' + original}
        className="press inline-flex h-7 w-7 items-center justify-center rounded-full text-faint hover:text-ink"><${I.Undo2} size=${14} /></button>` : null}</span>
    ${help ? html`<span className="caption text-xs">${help}</span>` : null}</label>`;
}
// Estado compartido en la base de datos del artifact (capacidad db; publícalo con capabilities: {db: {}, user: {}}).
// ruta: documento («escenarios/actual»). Devuelve [valor, set(patch|fn), estado]; estado: 'cargando' | 'compartido' | 'local' (sin db: solo en esta vista) | 'solo-lectura' | 'guardando'.
// Escribe el documento entero, una escritura cada vez y agrupando las ráfagas (espera 700 ms sin cambios). Fuera del visor funciona en memoria.
function useCompartido(ruta, inicial = {}){
  const [v, setV] = useState(inicial), [estado, setEstado] = useState('cargando');
  const ref = useRef(null), pend = useRef(null), timer = useRef(null), enCurso = useRef(false), ultimo = useRef(null);
  useEffect(() => { let vivo = true, unsub = null;
    const sinDb = setTimeout(() => { if (vivo && !ref.current) setEstado('local'); }, 4000);
    Promise.resolve(window.claude?.use?.('db')).then(async db => { if (!vivo) return; if (!db) { setEstado('local'); return; }
      const u = await Promise.resolve(window.claude?.use?.('user')).catch(() => null);
      const puede = u ? await u.can?.('data.write') : null;
      ref.current = db.doc(ruta);
      unsub = ref.current.onSnapshot(s => { if (!vivo || s.metadata?.hasPendingWrites) return; const d = s.exists ? s.data() : null;
        if (d && JSON.stringify(d) !== ultimo.current && !pend.current) setV({...inicial, ...d});
        setEstado(e => e === 'guardando' ? e : puede === false ? 'solo-lectura' : 'compartido'); },
        () => { if (vivo) setEstado('local'); });
    }).catch(() => { if (vivo) setEstado('local'); });
    return () => { vivo = false; clearTimeout(sinDb); unsub?.(); };
  }, [ruta]);
  const escribir = async () => { if (!ref.current || enCurso.current || !pend.current) return;
    const d = pend.current; pend.current = null; enCurso.current = true; setEstado('guardando');
    try { ultimo.current = JSON.stringify(d); await ref.current.set(d); setEstado('compartido'); }
    catch (e) { if (e?.code === 'invalid_argument') { setEstado('solo-lectura'); toast('No tienes permiso para guardar cambios en esta página', 'warn'); }
      else { setEstado('compartido'); toast('No se ha podido guardar; se reintentará con el próximo cambio', 'warn'); } }
    finally { enCurso.current = false; if (pend.current) escribir(); } };
  const set = patch => setV(x => { const n = typeof patch === 'function' ? patch(x) : {...x, ...patch};
    if (estado !== 'solo-lectura') { pend.current = n; clearTimeout(timer.current); timer.current = setTimeout(escribir, 700); } return n; });
  return [v, set, estado];
}

/* ---------- Avisos breves (toasts) ---------- */
const TOASTS = {lista: [], subs: new Set()};
const emitirToasts = () => TOASTS.subs.forEach(f => f(TOASTS.lista));
function toastQuitar(id){ TOASTS.lista = TOASTS.lista.filter(t => t.id !== id); emitirToasts(); }
// toast(texto, tono): breve, no bloquea, se cierra solo a los 6 s o con la ×
function toast(texto, tono = 'ok'){ const id = Date.now() + Math.random(); TOASTS.lista = [...TOASTS.lista, {id, texto, tono}]; emitirToasts(); setTimeout(() => toastQuitar(id), 6000); }
function Toasts(){
  const [l, setL] = useState(TOASTS.lista);
  useEffect(() => { TOASTS.subs.add(setL); return () => TOASTS.subs.delete(setL); }, []);
  return html`<div aria-live="polite" className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2">${l.map(t => { const Ic = ICONO[t.tono] || I.Info;
    return html`<div key=${t.id} className="flex items-center gap-2.5 rounded-xl border border-line px-4 py-2.5 text-sm text-ink shadow-xl" style=${{background: 'var(--tip)', borderColor: 'var(--toast-line)', animation: RM ? 'none' : 'rise var(--t-ui) var(--spring)'}}>
      <${Ic} size=${16} className=${'shrink-0 text-' + t.tono + '-ink'} aria-hidden="true" /><span className="flex-1">${t.texto}</span>
      <button type="button" onClick=${() => toastQuitar(t.id)} aria-label="Cerrar aviso" className="press text-faint hover:text-ink"><${I.X} size=${14} /></button></div>`; })}</div>`;
}

/* ---------- Exportación (capacidad downloads del artifact) ---------- */
// CSV para Excel en español: separador «;», coma decimal, BOM UTF-8
const toCSV = (cols, rows) => { const q = v => { const s = v == null ? '' : typeof v === 'number' ? String(Math.round(v * 100) / 100).replace('.', ',') : String(v);
  return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return '﻿' + [cols.map(c => q(c.label)), ...rows.map(r => cols.map(c => q(c.csv ? c.csv(r) : c.v ? c.v(r) : r[c.k])))].map(l => l.join(';')).join('\r\n'); };
// null mientras no hay capacidad (o fuera del visor): el botón no se muestra
function useDescargas(){
  const [d, setD] = useState(null);
  useEffect(() => { let vivo = true; Promise.resolve(window.claude?.use?.('downloads')).then(x => { if (vivo) setD(x || null); }).catch(() => {}); return () => { vivo = false; }; }, []);
  return d;
}
// Publica la página con capabilities: {downloads: true}. El usuario confirma cada descarga
function BotonExportar({nombre, cols, rows, formato = 'csv'}){
  const dl = useDescargas();
  if (!dl) return null;
  const go = async () => {
    try { await dl.save({filename: `${nombre}.${formato}`, data: formato === 'json' ? JSON.stringify(rows, null, 2) : toCSV(cols, rows)}); toast(`Descargado ${nombre}.${formato}`, 'ok'); }
    catch (e) { if (e?.code === 'declined') return; toast(e?.code === 'rate_limited' ? 'Ya hay una descarga esperando confirmación' : 'No se ha podido descargar el fichero', 'warn'); }
  };
  return html`<button type="button" onClick=${go} className="press inline-flex min-h-[30px] items-center gap-1.5 rounded-full border border-line bg-card px-3 text-xs font-medium text-ink hover:text-accent">
    <${I.Download} size=${14} aria-hidden="true" /> Exportar ${formato.toUpperCase()}</button>`;
}

/* ---------- Estados: vacío, carga, error, avisos de datos ---------- */
const Vacio = ({icon = I.SearchX, titulo = 'Nada que mostrar', texto, accion}) => html`<div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
  <${IconBadge} icon=${icon} tint="var(--s8)" size=${40} /><b className="mt-1 text-base font-semibold text-strong">${titulo}</b>
  ${texto ? html`<p className="max-w-sm text-sm text-muted">${texto}</p>` : null}${accion || null}</div>`;
const Esqueleto = ({lineas = 3, alto = 14}) => html`<div className="flex flex-col gap-2" aria-busy="true" aria-label="Cargando">
  ${Array.from({length: lineas}, (_, i) => html`<div key=${i} className="latido rounded-md bg-line" style=${{height: alto, width: (100 - i * 14) + '%'}}></div>`)}</div>`;
// Si una sección falla al pintar, el resto de la página sigue funcionando
class Protegido extends React.Component {
  constructor(p){ super(p); this.state = {error: null}; }
  static getDerivedStateFromError(error){ return {error}; }
  componentDidCatch(e){ console.error(e); }
  render(){ return this.state.error
    ? html`<${Card}><${Vacio} icon=${I.Bug} titulo=${'No se ha podido pintar ' + (this.props.nombre || 'esta sección')} texto=${String(this.state.error?.message || this.state.error)} /><//>`
    : this.props.children; }
}
// Valida los datos de entrada. reglas: [{campo: 'filas', tipo: 'array'|'number'|'string', min, si: (v, D) => bool, texto}] → lista de avisos
function validar(datos, reglas){
  const av = [];
  for (const r of reglas){
    const v = r.campo ? r.campo.split('.').reduce((o, k) => o?.[k], datos) : datos;
    if (r.campo && (v == null || v === '')) { av.push(r.texto || `Falta «${r.campo}» en los datos.`); continue; }
    if (r.tipo === 'array' && (!Array.isArray(v) || v.length < (r.min ?? 0))) { av.push(r.texto || `«${r.campo}» debería tener al menos ${r.min ?? 0} elementos.`); continue; }
    if (r.tipo && r.tipo !== 'array' && typeof v !== r.tipo) { av.push(r.texto || `«${r.campo}» no es de tipo ${r.tipo}.`); continue; }
    if (r.si && !r.si(v, datos)) av.push(r.texto);
  }
  return av;
}
// Aviso visible (calidad de datos, decisiones pendientes). tono: warn | info
const Avisos = ({items, titulo = 'Revisa los datos', tono = 'warn'}) => !items?.length ? null : html`<div role="status" className="flex gap-3 rounded-card border px-5 py-4"
  style=${{borderColor: `var(--${tono})`, background: `var(--${tono}-soft)`}}><${tono === 'info' ? I.Info : I.TriangleAlert} size=${20} className=${'mt-0.5 shrink-0 text-' + tono + '-ink'} aria-hidden="true" />
  <div><b className="text-sm font-semibold text-strong">${titulo}</b><ul className="mt-1 list-disc pl-5 text-sm text-ink">${items.map((t, i) => html`<li key=${i}>${t}</li>`)}</ul></div></div>`;

/* ---------- Visualización compacta ---------- */
// Anillo de progreso (estilo Actividad). t opcional = color progresivo del semáforo
function Anillo({p, t, size = 56, grosor = 6, label}){
  const r = (size - grosor) / 2, c = 2 * Math.PI * r, col = t != null ? semaforo(t) : 'var(--accent-2)';
  const [v, setV] = useState(RM ? p : 0);
  useEffect(() => { if (RM) { setV(p); return; } const id = requestAnimationFrame(() => setV(p)); return () => cancelAnimationFrame(id); }, [p]);
  return html`<span className="relative inline-flex shrink-0 items-center justify-center" style=${{width: size, height: size}} role="img" aria-label=${label ?? `${nf(p)} %`}>
    <svg width=${size} height=${size} className="-rotate-90"><circle cx=${size / 2} cy=${size / 2} r=${r} fill="none" style=${{stroke: 'var(--line)'}} strokeWidth=${grosor} />
      <circle cx=${size / 2} cy=${size / 2} r=${r} fill="none" style=${{stroke: col, transition: RM ? 'none' : 'stroke-dashoffset var(--t-datos) var(--spring)'}} strokeWidth=${grosor} strokeLinecap="round"
        strokeDasharray=${c} strokeDashoffset=${c * (1 - Math.min(100, Math.max(0, v)) / 100)} /></svg>
    <span className="cifra absolute text-xs font-semibold text-strong">${label ?? nf(p) + '%'}</span></span>`;
}
// Minigráfica de tendencia para KPI y tarjetas
function Spark({datos, width = 96, height = 28, color = 'var(--accent-2)'}){
  if (!datos?.length) return null;
  const mn = Math.min(...datos), mx = Math.max(...datos), sx = width / ((datos.length - 1) || 1), sy = v => height - 3 - ((v - mn) / ((mx - mn) || 1)) * (height - 6);
  const d = datos.map((v, i) => `${i ? 'L' : 'M'}${(i * sx).toFixed(1)},${sy(v).toFixed(1)}`).join(' ');
  return html`<svg width=${width} height=${height} aria-hidden="true" className="overflow-visible"><path d=${d} fill="none" style=${{stroke: color}} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx=${(datos.length - 1) * sx} cy=${sy(datos[datos.length - 1])} r="2.75" style=${{fill: color}} /></svg>`;
}
// Lista de datos clave-valor para hojas de detalle
const Datos = ({items}) => html`<dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line">${items.filter(Boolean).map(([l, v]) => html`<div key=${l} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
  <dt className="text-muted">${l}</dt><dd className="num text-right font-medium text-strong">${v}</dd></div>`)}</dl>`;

// Relacionados: lo que cita un detalle (dependencias, causas, documentos), con su descripción a la vista para no tener que ir
// a buscarlo a otra sección. items = [{id, titulo, texto?, estado? (p. ej. un <Pill>), extra? (nodo), abrir? () => …}]
const Relacionados = ({titulo = 'Relacionado', items}) => !items?.length ? null : html`<div className="flex flex-col gap-2"><h3 className="text-sm font-semibold text-strong">${titulo}</h3>
  <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line">${items.map(x => html`<div key=${x.id} className="flex flex-col gap-1.5 px-4 py-3">
    <div className="flex items-start gap-2"><b className="shrink-0 font-semibold text-strong">${x.id}</b><span className="min-w-0 flex-1 text-sm text-strong">${x.titulo}</span>${x.estado || null}</div>
    ${x.texto ? html`<p className="text-sm text-muted">${x.texto}</p>` : null}${x.extra || null}
    ${x.abrir ? html`<div><button type="button" onClick=${x.abrir} className="press text-xs font-medium text-accent hover:underline">Ver el detalle de ${x.id}</button></div>` : null}
  </div>`)}</div></div>`;

/* ---------- Navegación entre detalles ---------- */
// const nav = useNavegacion(); <SortTable onRow activa={clave abierta} nav={nav} /> y <Hoja nav={nav}>. La tabla publica dónde está la fila
// abierta en el orden que se ve (búsqueda, filtros y orden por columna incluidos) y atiende ↑ ↓; la hoja pinta anterior / siguiente
// y «3 de 12». Un nav por tabla. Si dos tablas abren la misma hoja, activa solo en la que la abrió.
function useNavegacion(){
  const [pos, setPos] = useState(null), ir = useRef(null);
  return useMemo(() => ({pos, setPos, ir}), [pos]);
}

/* ---------- Hoja de detalle (sheet de Apple) ---------- */
// Lateral en escritorio, desde abajo en móvil. Esc o el fondo la cierran; el foco queda dentro y vuelve al cerrar.
// nav (useNavegacion): botones anterior / siguiente y posición; ↑ ↓ los atiende la tabla
function Hoja({abierta, onCerrar, titulo, sub, icon, avatar, nav, children}){
  const ref = useRef(null), p = nav?.pos;
  useEffect(() => { if (abierta) ref.current?.scrollTo?.({top: 0}); }, [p?.i]);   // al pasar de un detalle a otro, desde arriba
  useEffect(() => {
    if (!abierta) return;
    const prev = document.activeElement, el = ref.current, foco = () => [...el.querySelectorAll('button, [href], input, select, [tabindex]:not([tabindex="-1"])')];
    el.focus();                                                 // el panel, no el primer botón: sin anillo de foco al abrir con el ratón
    const h = e => { if (e.key === 'Escape') onCerrar();
      if (e.key === 'Tab') { const f = foco(); if (!f.length) return; const a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } } };
    addEventListener('keydown', h); document.body.style.overflow = 'hidden';
    return () => { removeEventListener('keydown', h); document.body.style.overflow = ''; prev?.focus?.(); };
  }, [abierta]);
  if (!abierta) return null;
  return html`<div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label=${titulo}>
    <div className="absolute inset-0 bg-black/40" onClick=${onCerrar} style=${{animation: RM ? 'none' : 'fade var(--t-ui) ease-out'}}></div>
    <div ref=${ref} tabIndex="-1" className="absolute inset-x-0 bottom-0 outline-none max-h-[88vh] overflow-y-auto rounded-t-[22px] border border-line p-6 shadow-2xl sm:inset-y-3 sm:left-auto sm:right-3 sm:max-h-none sm:w-[480px] sm:rounded-[22px]"
      style=${{background: 'var(--card)', borderColor: 'var(--sheet-line)', animation: RM ? 'none' : 'hoja var(--t-entrada) var(--spring)'}}>
      <div className="mb-5 flex items-start gap-3">${avatar || (icon ? html`<${IconBadge} icon=${icon} size=${40} />` : null)}
        <div className="min-w-0 flex-1"><h2 className="text-xl font-bold tracking-tight text-strong">${titulo}</h2>${sub ? html`<p className="mt-0.5 text-sm text-muted">${sub}</p>` : null}</div>
        <button type="button" onClick=${onCerrar} aria-label="Cerrar" className="press inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-line text-muted hover:text-ink"><${I.X} size=${18} /></button></div>
      ${p && p.n > 1 ? html`<div className="-mt-2 mb-4 flex items-center gap-2 text-xs text-muted">
        ${[[-1, 'Anterior', I.ChevronUp, p.i === 0], [1, 'Siguiente', I.ChevronDown, p.i === p.n - 1]].map(([d, l, Ic, fin]) => html`<button key=${l} type="button" disabled=${fin} onClick=${() => nav.ir.current?.(d)} aria-label=${l}
          className="press inline-flex h-7 w-7 items-center justify-center rounded-full bg-line text-muted hover:text-ink disabled:opacity-40"><${Ic} size=${15} /></button>`)}
        <span className="num">${p.i + 1} de ${p.n}</span><span className="text-faint">· también con ↑ ↓</span></div>` : null}
      <div className="flex flex-col gap-5">${children}</div></div></div>`;
}

/* ---------- KPI y tabla, versión operativa ---------- */
// KPI: etiqueta, cifra que cuenta desde 0, variación con icono, minigráfica opcional (spark) y clic para ver el detalle (onClick)
function Kpi({label, value, dec = 0, pre = '', suf = '', delta, tono = 'ok', hint, icon, spark, onClick}){
  const Tr = delta == null ? null : delta >= 0 ? I.TrendingUp : I.TrendingDown;
  const cuerpo = html`<${React.Fragment}>
    <div className="flex items-center justify-between gap-2"><span className="text-sm font-medium text-muted">${label}</span>${typeof icon === 'string' ? html`<${Icono} n=${icon} size=${15} />` : icon ? html`<${icon} size=${18} className="text-faint" aria-hidden="true" />` : null}</div>
    <div className="cifra whitespace-nowrap text-3xl font-bold text-strong"><${Count} to=${value} dec=${dec} pre=${pre} suf=${suf} /></div>
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">${delta != null ? html`<${Pill} tono=${tono} icon=${Tr}>${delta >= 0 ? '+' : ''}${nf(delta, 0)} %<//>` : null}<span>${hint}</span>
      ${spark ? html`<span className="ml-auto"><${Spark} datos=${spark} width=${72} height=${22} /></span>` : null}
      ${onClick ? html`<${I.ChevronRight} size=${15} className=${spark ? 'text-faint' : 'ml-auto text-faint'} aria-hidden="true" />` : null}</div><//>`;
  return onClick
    ? html`<button type="button" onClick=${onClick} className="press rounded-card text-left"><${Card} className="flex h-full flex-col gap-2 p-5 transition-shadow hover:ring-2 hover:ring-accent-line">${cuerpo}<//></button>`
    : html`<${Card} className="flex flex-col gap-2 p-5">${cuerpo}<//>`;
}
// Tabla operativa: ordena por cabecera, explica cada columna (i), filtra por q (texto: fila => cadena), abre el detalle (onRow),
// exporta lo que se ve (exportar = nombre del fichero), muestra un estado vacío (vacio) y limita filas con «Mostrar más» (limite).
// fijas = n deja fijas las n primeras columnas al desplazar en horizontal (desde 640 px de ancho; en móvil no caben).
// activa = clave de la fila abierta en la hoja: se resalta y ↑ ↓ pasan a la anterior / siguiente en el orden que se ve; nav = useNavegacion()
function SortTable({cols, rows, rowKey, tono, minWidth = 720, q = '', texto, onRow, vacio, exportar, limite = 0, fijas = 0, activa, nav}){
  const [sort, setSort] = useState({k: null, dir: 1}), [mas, setMas] = useState(false);
  const filtradas = useMemo(() => !q ? rows : rows.filter(r => coincide(q, texto ? texto(r) : cols.map(c => c.v ? c.v(r) : r[c.k]).join(' '))), [rows, q]);
  const sorted = useMemo(() => { if (!sort.k) return filtradas; const c = cols.find(c => c.k === sort.k), val = c.v || (r => r[c.k]);
    return [...filtradas].sort((a, b) => { const x = val(a), y = val(b); if (x == null || x === '') return 1; if (y == null || y === '') return -1;
      return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'es')) * sort.dir; }); }, [filtradas, sort]);
  const vis = limite && !mas ? sorted.slice(0, limite) : sorted;
  // Fila abierta: ↑ ↓ (fuera de campos de texto y si nadie más usó la tecla) pasan a la anterior / siguiente; nav lo comparte con la Hoja
  const iAct = activa == null || !onRow ? -1 : sorted.findIndex(r => rowKey(r) === activa);
  const mover = d => { const j = iAct + d; if (iAct < 0 || j < 0 || j >= sorted.length) return false;
    if (limite && !mas && j >= limite) setMas(true); onRow(sorted[j]); return true; };
  const moverRef = useRef(mover); moverRef.current = mover;
  useEffect(() => { if (iAct < 0) return;
    const h = e => { if ((e.key !== 'ArrowDown' && e.key !== 'ArrowUp') || e.defaultPrevented || e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = document.activeElement; if (/^(input|textarea|select)$/i.test(a?.tagName || '') || a?.isContentEditable) return;
      if (moverRef.current(e.key === 'ArrowDown' ? 1 : -1)) e.preventDefault(); };
    addEventListener('keydown', h); return () => removeEventListener('keydown', h); }, [iAct >= 0]);
  useEffect(() => { if (!nav) return; nav.ir.current = iAct < 0 ? null : d => moverRef.current(d);
    const n = sorted.length; nav.setPos(p => iAct < 0 ? null : p && p.i === iAct && p.n === n ? p : {i: iAct, n}); });
  const click = c => setSort(s => { const num = rows.some(r => typeof (c.v || (x => x[c.k]))(r) === 'number');
    return s.k === c.k ? {k: c.k, dir: -s.dir} : {k: c.k, dir: num ? -1 : 1}; });
  const borde = {ok: 'var(--ok)', warn: 'var(--warn)', bad: 'var(--bad)', info: 'var(--info)'};
  const [ayuda, setAyuda] = useState(null);                       // columna con la ayuda abierta (botón «i»)
  useEffect(() => { if (!ayuda) return; const cerrar = e => { if (e.type === 'click' || e.key === 'Escape') setAyuda(null); };
    addEventListener('click', cerrar); addEventListener('keydown', cerrar); return () => { removeEventListener('click', cerrar); removeEventListener('keydown', cerrar); }; }, [ayuda]);
  const ncol = cols.length + (onRow ? 1 : 0);
  // Columnas fijas: se mide el ancho de las cabeceras y cada una se pega a la suma de las anteriores
  const tabla = useRef(null), [lefts, setLefts] = useState([]);
  useLayoutEffect(() => { if (!fijas || !tabla.current) return;
    const medir = () => { const ths = [...tabla.current.querySelectorAll('thead th')].slice(0, fijas); let x = 0;
      const n = ths.map(th => { const l = x; x += th.offsetWidth; return l; }); setLefts(o => o.join() === n.join() ? o : n); };
    medir(); const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(medir) : null;
    if (ro) [...tabla.current.querySelectorAll('thead th')].slice(0, fijas).forEach(th => ro.observe(th));
    return () => ro?.disconnect(); }, [fijas, cols.length, vis.length]);
  // Con columnas fijas la tabla no colapsa bordes: cada celda dibuja su línea inferior y las fijas la conservan al desplazar
  const fija = (i, extra) => i < fijas ? {left: lefts[i] || 0, boxShadow: [extra, i === fijas - 1 ? '1px 0 0 var(--line-strong)' : null].filter(Boolean).join(', ') || undefined} : (extra ? {boxShadow: extra} : null);
  return html`<div>
    <div className="mb-2 flex min-h-[30px] items-center justify-between gap-2 text-xs text-muted">
      <span aria-live="polite">${filtradas.length === rows.length ? `${rows.length} filas` : `${filtradas.length} de ${rows.length} filas`}${onRow ? ' · pulsa una fila para ver el detalle' + (nav ? '; con ↑ ↓ pasas de una a otra' : '') : ''}</span>
      ${exportar ? html`<${BotonExportar} nombre=${exportar} cols=${cols} rows=${sorted} />` : null}</div>
    <${Card} className="overflow-x-auto"><table ref=${tabla} className=${cx('w-full text-sm', !fijas && 'border-collapse')} style=${fijas ? {minWidth, borderCollapse: 'separate', borderSpacing: 0} : {minWidth}}>
      <thead><tr className="border-b border-line" style=${{background: 'var(--thead)'}}>${cols.map((c, i) => html`<th key=${c.k} scope="col" style=${fija(i)} aria-sort=${sort.k === c.k ? (sort.dir > 0 ? 'ascending' : 'descending') : 'none'}
        className=${cx('whitespace-nowrap px-4 py-3 text-xs font-semibold text-muted', c.align === 'right' ? 'text-right' : 'text-left', i < fijas && 'fija', fijas && 'border-b border-line')}>
        <span className=${cx('inline-flex items-center gap-1', c.align === 'right' && 'flex-row-reverse')}>
          <button type="button" onClick=${() => click(c)} className="press inline-flex min-h-[28px] items-center gap-1 hover:text-ink">${c.label}
            ${sort.k === c.k ? html`<${sort.dir > 0 ? I.ArrowUp : I.ArrowDown} size=${13} />` : html`<${I.ArrowUpDown} size=${13} className="opacity-40" />`}</button>
          ${c.help ? html`<span className="relative inline-flex"><button type="button" aria-label=${'Qué es «' + c.label + '»'} aria-expanded=${ayuda === c.k} title=${c.help}
              onClick=${e => { e.stopPropagation(); setAyuda(x => x === c.k ? null : c.k); }} className="press inline-flex h-6 w-6 items-center justify-center rounded-full text-faint hover:text-accent"><${I.Info} size=${14} /></button>
            ${ayuda === c.k ? html`<span role="tooltip" className=${cx('absolute top-full z-30 mt-1 w-60 whitespace-normal rounded-xl border border-line-strong px-3 py-2 text-left text-xs font-normal text-ink shadow-xl', c.align === 'right' ? 'right-0' : 'left-0')}
              style=${{background: 'var(--tip)'}}>${c.help}</span>` : null}</span>` : null}
        </span></th>`)}${onRow ? html`<th className=${cx('w-8', fijas && 'border-b border-line')} aria-label="Detalle"></th>` : null}</tr></thead>
      <tbody>${vis.length ? vis.map((r, ri) => html`<tr key=${rowKey(r)} className=${cx('border-b border-line transition-colors last:border-0 hover:bg-[var(--row-hover)]', onRow && 'cursor-pointer', ri === iAct && 'activa bg-[var(--row-hover)]')}
          aria-current=${ri === iAct ? 'true' : null} tabIndex=${onRow ? 0 : null} onClick=${onRow ? () => onRow(r) : null} onKeyDown=${onRow ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRow(r); } } : null}>
        ${cols.map((c, i) => html`<td key=${c.k} className=${cx('px-4 py-3 align-top num', c.align === 'right' && 'text-right', i < fijas && 'fija', fijas && ri < vis.length - 1 && 'border-b border-line')}
          style=${fija(i, i === 0 && tono && tono(r) ? `inset 3px 0 0 ${borde[tono(r)]}` : null)}>${c.r ? c.r(r) : esc(c.v ? c.v(r) : r[c.k])}</td>`)}
        ${onRow ? html`<td className=${cx('px-2 py-3 text-faint', fijas && ri < vis.length - 1 && 'border-b border-line')}><${I.ChevronRight} size=${16} aria-hidden="true" /></td>` : null}</tr>`)
      : html`<tr><td colSpan=${ncol}><${Vacio} titulo="Sin resultados" texto=${vacio || (q ? `Nada coincide con «${q}». Prueba con otra palabra o restablece los filtros.` : 'No hay filas que mostrar.')} /></td></tr>`}</tbody>
    </table>
    ${cols.some(c => c.help) ? html`<dl className="grid gap-x-6 gap-y-2 border-t border-line px-4 py-3 text-xs sm:grid-cols-2 lg:grid-cols-4">${cols.filter(c => c.help).map(c => html`<div key=${c.k}><dt className="font-semibold text-ink">${c.label}</dt><dd className="caption mt-0.5">${c.help}</dd></div>`)}</dl>` : null}<//>
    ${limite && sorted.length > limite ? html`<div className="mt-2 flex justify-center"><button type="button" onClick=${() => setMas(m => !m)} className="press min-h-[30px] rounded-full px-4 text-xs font-medium text-accent hover:bg-accent-soft">
      ${mas ? 'Mostrar menos' : `Mostrar las ${sorted.length - limite} restantes`}</button></div>` : null}

  </div>`;
}

/* ---------- Iconos al estilo Notion ----------
   Catálogo semántico: clave en español (sin tildes) → [icono lucide, color Notion por defecto, etiqueta, grupo].
   Se usan por nombre: <Icono n="informe" />, <Section icon="objetivo">, <Kpi icon="kpi">, <Header icono="informe">.
   Colores Notion (identidad, nunca estado): gray, brown, orange, yellow, green, blue, purple, pink. Sin rojo. Sin emojis. */
const NCOLORES = ['gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'];
const NOMBRE_COLOR = {gray: 'Gris', brown: 'Marrón', orange: 'Naranja', yellow: 'Amarillo', green: 'Verde', blue: 'Azul', purple: 'Morado', pink: 'Rosa'};
const ICONOS = {
  // Personas y equipo
  persona: [I.UserRound, 'gray', "Persona", "Personas y equipo"],
  usuario: [I.CircleUserRound, 'blue', "Usuario", "Personas y equipo"],
  cliente: [I.Contact, 'green', "Cliente", "Personas y equipo"],
  equipo: [I.Users, 'blue', "Equipo", "Personas y equipo"],
  colaborador: [I.Handshake, 'brown', "Colaborador", "Personas y equipo"],
  objetivo: [I.Target, 'green', "Objetivo", "Personas y equipo"],
  kpi: [I.Gauge, 'green', "KPI", "Personas y equipo"],
  formacion: [I.GraduationCap, 'purple', "Formación", "Personas y equipo"],
  certificacion: [I.Award, 'yellow', "Certificación", "Personas y equipo"],
  // Proyectos y gestión
  proyecto: [I.FolderKanban, 'blue', "Proyecto", "Proyectos y gestión"],
  epica: [I.Mountain, 'purple', "Épica", "Proyectos y gestión"],
  historia: [I.BookOpen, 'blue', "Historia", "Proyectos y gestión"],
  tarea: [I.SquareCheck, 'gray', "Tarea", "Proyectos y gestión"],
  subtarea: [I.ListTree, 'gray', "Subtarea", "Proyectos y gestión"],
  sprint: [I.Timer, 'orange', "Sprint", "Proyectos y gestión"],
  version: [I.Tag, 'blue', "Versión", "Proyectos y gestión"],
  release: [I.Rocket, 'green', "Release", "Proyectos y gestión"],
  roadmap: [I.Map, 'brown', "Roadmap", "Proyectos y gestión"],
  hito: [I.Flag, 'green', "Hito", "Proyectos y gestión"],
  kickoff: [I.Play, 'green', "Kickoff", "Proyectos y gestión"],
  backlog: [I.Inbox, 'gray', "Backlog", "Proyectos y gestión"],
  prioridad: [I.ArrowUpNarrowWide, 'orange', "Prioridad", "Proyectos y gestión"],
  dependencia: [I.Link2, 'gray', "Dependencia", "Proyectos y gestión"],
  riesgo: [I.ShieldAlert, 'orange', "Riesgo", "Proyectos y gestión"],
  decision: [I.Scale, 'brown', "Decisión", "Proyectos y gestión"],
  pendiente: [I.CircleDashed, 'gray', "Pendiente", "Proyectos y gestión"],
  bloqueo: [I.OctagonMinus, 'pink', "Bloqueo", "Proyectos y gestión"],
  planificacion: [I.CalendarRange, 'blue', "Planificación", "Proyectos y gestión"],
  estimacion: [I.Ruler, 'brown', "Estimación", "Proyectos y gestión"],
  // Desarrollo
  codigo: [I.Code, 'blue', "Código", "Desarrollo"],
  repositorio: [I.GitBranch, 'gray', "Repositorio", "Desarrollo"],
  'merge-request': [I.GitPullRequest, 'purple', "Merge request", "Desarrollo"],
  commit: [I.GitCommitHorizontal, 'gray', "Commit", "Desarrollo"],
  revision: [I.Eye, 'blue', "Revisión", "Desarrollo"],
  bug: [I.Bug, 'pink', "Bug", "Desarrollo"],
  incidencia: [I.Siren, 'orange', "Incidencia", "Desarrollo"],
  hotfix: [I.Wrench, 'orange', "Hotfix", "Desarrollo"],
  test: [I.FlaskConical, 'green', "Test", "Desarrollo"],
  calidad: [I.BadgeCheck, 'green', "Calidad", "Desarrollo"],
  api: [I.Plug, 'blue', "API", "Desarrollo"],
  webhook: [I.Webhook, 'purple', "Webhook", "Desarrollo"],
  terminal: [I.SquareTerminal, 'gray', "Terminal", "Desarrollo"],
  paquete: [I.Package, 'brown', "Paquete", "Desarrollo"],
  documentacion: [I.FileText, 'gray', "Documentación", "Desarrollo"],
  especificacion: [I.FileCode, 'blue', "Especificación", "Desarrollo"],
  diseno: [I.PenTool, 'pink', "Diseño", "Desarrollo"],
  ia: [I.Sparkles, 'purple', "IA", "Desarrollo"],
  agente: [I.Bot, 'purple', "Agente", "Desarrollo"],
  automatizacion: [I.Workflow, 'blue', "Automatización", "Desarrollo"],
  // Infraestructura y datos
  nube: [I.Cloud, 'blue', "Nube", "Infraestructura y datos"],
  servidor: [I.Server, 'gray', "Servidor", "Infraestructura y datos"],
  'base-de-datos': [I.Database, 'brown', "Base de datos", "Infraestructura y datos"],
  cola: [I.Layers, 'orange', "Cola", "Infraestructura y datos"],
  observabilidad: [I.Activity, 'green', "Observabilidad", "Infraestructura y datos"],
  logs: [I.ScrollText, 'gray', "Logs", "Infraestructura y datos"],
  alerta: [I.BellRing, 'orange', "Alerta", "Infraestructura y datos"],
  seguridad: [I.Shield, 'blue', "Seguridad", "Infraestructura y datos"],
  certificado: [I.ShieldCheck, 'green', "Certificado", "Infraestructura y datos"],
  dominio: [I.Globe, 'blue', "Dominio", "Infraestructura y datos"],
  red: [I.Network, 'gray', "Red", "Infraestructura y datos"],
  despliegue: [I.CloudUpload, 'green', "Despliegue", "Infraestructura y datos"],
  contenedor: [I.Container, 'blue', "Contenedor", "Infraestructura y datos"],
  rendimiento: [I.Zap, 'yellow', "Rendimiento", "Infraestructura y datos"],
  backup: [I.HardDrive, 'gray', "Backup", "Infraestructura y datos"],
  'coste-cloud': [I.ChartNoAxesCombined, 'orange', "Coste cloud", "Infraestructura y datos"],
  // Dinero y finanzas
  presupuesto: [I.Wallet, 'green', "Presupuesto", "Dinero y finanzas"],
  gasto: [I.Receipt, 'orange', "Gasto", "Dinero y finanzas"],
  ahorro: [I.PiggyBank, 'pink', "Ahorro", "Dinero y finanzas"],
  factura: [I.FileSpreadsheet, 'gray', "Factura", "Dinero y finanzas"],
  licencia: [I.KeyRound, 'yellow', "Licencia", "Dinero y finanzas"],
  suscripcion: [I.RefreshCw, 'blue', "Suscripción", "Dinero y finanzas"],
  contrato: [I.FileSignature, 'brown', "Contrato", "Dinero y finanzas"],
  proveedor: [I.Building2, 'gray', "Proveedor", "Dinero y finanzas"],
  euro: [I.Euro, 'green', "Euro", "Dinero y finanzas"],
  dolar: [I.DollarSign, 'green', "Dólar", "Dinero y finanzas"],
  compra: [I.ShoppingCart, 'orange', "Compra", "Dinero y finanzas"],
  equipamiento: [I.Laptop, 'gray', "Equipamiento", "Dinero y finanzas"],
  evento: [I.Ticket, 'pink', "Evento", "Dinero y finanzas"],
  viaje: [I.Plane, 'blue', "Viaje", "Dinero y finanzas"],
  'tendencia-sube': [I.TrendingUp, 'green', "Tendencia al alza", "Dinero y finanzas"],
  'tendencia-baja': [I.TrendingDown, 'orange', "Tendencia a la baja", "Dinero y finanzas"],
  // Tiempo y calendario
  calendario: [I.CalendarDays, 'blue', "Calendario", "Tiempo y calendario"],
  fecha: [I.Calendar, 'gray', "Fecha", "Tiempo y calendario"],
  reunion: [I.CalendarClock, 'purple', "Reunión", "Tiempo y calendario"],
  horas: [I.Clock, 'blue', "Horas", "Tiempo y calendario"],
  duracion: [I.Hourglass, 'orange', "Duración", "Tiempo y calendario"],
  plazo: [I.AlarmClock, 'orange', "Plazo", "Tiempo y calendario"],
  trimestre: [I.CalendarFold, 'brown', "Trimestre", "Tiempo y calendario"],
  cuatrimestre: [I.CalendarRange, 'purple', "Cuatrimestre", "Tiempo y calendario"],
  semana: [I.CalendarDays, 'gray', "Semana", "Tiempo y calendario"],
  historial: [I.History, 'gray', "Historial", "Tiempo y calendario"],
  // Comunicación y documentos
  nota: [I.StickyNote, 'yellow', "Nota", "Comunicación y documentos"],
  idea: [I.Lightbulb, 'yellow', "Idea", "Comunicación y documentos"],
  pregunta: [I.CircleHelp, 'blue', "Pregunta", "Comunicación y documentos"],
  informe: [I.FileChartColumn, 'blue', "Informe", "Comunicación y documentos"],
  resumen: [I.AlignLeft, 'gray', "Resumen", "Comunicación y documentos"],
  correo: [I.Mail, 'blue', "Correo", "Comunicación y documentos"],
  chat: [I.MessageCircle, 'green', "Chat", "Comunicación y documentos"],
  anuncio: [I.Megaphone, 'orange', "Anuncio", "Comunicación y documentos"],
  enlace: [I.Link, 'gray', "Enlace", "Comunicación y documentos"],
  adjunto: [I.Paperclip, 'gray', "Adjunto", "Comunicación y documentos"],
  pagina: [I.File, 'gray', "Página", "Comunicación y documentos"],
  'base-notion': [I.Table2, 'gray', "Base de Notion", "Comunicación y documentos"],
  marcador: [I.Bookmark, 'brown', "Marcador", "Comunicación y documentos"],
  cita: [I.Quote, 'gray', "Cita", "Comunicación y documentos"],
  guia: [I.BookOpen, 'green', "Guía", "Comunicación y documentos"],
  aviso: [I.Info, 'blue', "Aviso", "Comunicación y documentos"],
  // Herramientas
  jira: [I.SquareKanban, 'blue', "Jira", "Herramientas"],
  monday: [I.LayoutGrid, 'pink', "Monday", "Herramientas"],
  notion: [I.NotebookPen, 'gray', "Notion", "Herramientas"],
  gitlab: [I.GitMerge, 'orange', "GitLab", "Herramientas"],
  github: [I.GitFork, 'gray', "GitHub", "Herramientas"],
  teams: [I.Video, 'purple', "Teams", "Herramientas"],
  excel: [I.Sheet, 'green', "Excel", "Herramientas"],
  grafana: [I.ChartLine, 'orange', "Grafana", "Herramientas"],
  postman: [I.Send, 'orange', "Postman", "Herramientas"],
  claude: [I.Sparkle, 'brown', "Claude", "Herramientas"],
};
const icono = n => (typeof n === 'string' ? ICONOS[n]?.[0] : n) || null;
// Icono Notion: glifo en su color, sobre cuadrado tintado (tile) o suelto. n = clave del catálogo, o icon + color
function Icono({n, icon, color, size = 20, tile = true, label}){
  const e = ICONOS[n], Ic = icon || e?.[0] || I.CircleHelp, c = color || e?.[1] || 'gray', box = Math.round(size * 1.5);
  const a11y = label ? {role: 'img', 'aria-label': label} : {'aria-hidden': 'true'};
  return tile
    ? html`<span ...${a11y} className="inline-flex shrink-0 items-center justify-center rounded-[6px]" style=${{width: box, height: box, color: `var(--n-${c})`, background: `var(--n-${c}-bg)`}}><${Ic} size=${size} strokeWidth=${1.9} /></span>`
    : html`<span ...${a11y} className="inline-flex shrink-0" style=${{color: `var(--n-${c})`}}><${Ic} size=${size} strokeWidth=${1.9} /></span>`;
}
// Icono de página de Notion: grande, junto al título (Header lo pinta con icono="clave")
const IconoPagina = ({n, icon, color}) => html`<${Icono} n=${n} icon=${icon} color=${color} size=${30} />`;
// Etiqueta: la «select» de Notion. Texto en el color normal (se lee siempre), color en el fondo y en el icono
function Etiqueta({color, n, children}){
  const e = ICONOS[n], c = color || e?.[1] || 'gray';
  return html`<span className="inline-flex items-center gap-1 whitespace-nowrap rounded-[5px] px-1.5 py-0.5 text-xs font-medium text-ink" style=${{background: `var(--n-${c}-tag)`}}>
    ${e ? html`<span className="inline-flex" style=${{color: `var(--n-${c})`}}><${e[0]} size=${12} strokeWidth=${2.2} aria-hidden="true" /></span>` : null}${children ?? e?.[2]}</span>`;
}
// Callout: el bloque destacado de Notion
function Callout({n = 'idea', icon, color, titulo, children}){
  const c = color || ICONOS[n]?.[1] || 'gray';
  return html`<div className="flex gap-3 rounded-xl px-4 py-3.5" style=${{background: `var(--n-${c}-bg)`}}><${Icono} n=${n} icon=${icon} color=${c} size=${20} tile=${false} />
    <div className="min-w-0 flex-1 text-sm text-ink">${titulo ? html`<b className="block font-semibold text-strong">${titulo}</b>` : null}${children}</div></div>`;
}
// Catálogo buscable y por colores (lo usa la galería); al pulsar un icono, un aviso enseña cómo usarlo
function CatalogoIconos(){
  const [q, setQ] = useState(''), [color, setColor] = useState('');
  const grupos = [...new Set(Object.values(ICONOS).map(e => e[3]))];
  const total = Object.entries(ICONOS).filter(([k, e]) => coincide(q, k, e[2], e[3])).length;
  return html`<div className="flex flex-col gap-5">
    <div className="flex flex-wrap items-center gap-2"><${Buscador} value=${q} onChange=${setQ} placeholder="Buscar icono" atajo=${false} />
      <${Segmented} label="Color" options=${[['', 'Por defecto'], ...NCOLORES.map(c => [c, NOMBRE_COLOR[c]])]} value=${color} onChange=${setColor} />
      <span className="text-xs text-muted">${total} de ${Object.keys(ICONOS).length} iconos</span></div>
    ${total ? grupos.map(g => { const items = Object.entries(ICONOS).filter(([k, e]) => e[3] === g && coincide(q, k, e[2], g)); if (!items.length) return null;
      return html`<div key=${g}><div className="mb-2 text-xs font-semibold text-muted">${g} · ${items.length}</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">${items.map(([k, e]) => html`<button key=${k} type="button" onClick=${() => toast(`<Icono n="${k}" /> · ${e[2]}`, 'info')}
          className="press flex items-center gap-2.5 rounded-xl border border-line bg-card px-3 py-2 text-left hover:ring-2 hover:ring-accent-line">
          <${Icono} n=${k} color=${color || undefined} size=${16} /><span className="min-w-0"><span className="block truncate text-sm text-strong">${e[2]}</span><span className="block truncate font-mono text-[11px] text-faint">${k}</span></span></button>`)}</div></div>`; })
      : html`<${Card}><${Vacio} titulo="Ningún icono coincide" texto=${`Nada coincide con «${q}».`} /><//>`}
  </div>`;
}
