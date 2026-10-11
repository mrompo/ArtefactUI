#!/usr/bin/env python3
"""ArtefactUI · monta un dashboard en un único HTML publicable.

Uso (desde cualquier sitio):
    python3 kit/montar.py --app app.js --datos datos.json --salida vista.html [--titulo "Título corto"] [--pack packs/x.js …] [--cdn 1.0.0]

- app.js     define `function App(){ … }` con los componentes del kit (htm + React). Nada más.
- datos.json el objeto D (también vale un .js con `const D = {…};`). Debe tener al menos `titulo` y `fecha`.
- La salida lleva dentro tokens, config de Tailwind, componentes, datos y App: se publica tal cual con la
  herramienta Artifact (si la página exporta, con capabilities: {downloads: true}).

Comprobaciones: título de 2–4 palabras, iconos que existen en lucide-react 0.460, sintaxis del JS con node
(si está instalado) y colores hex sueltos en app.js (deben ser tokens). Sale con código 1 si algo falla.
"""
import argparse, json, os, re, shutil, subprocess, sys, tempfile

KIT = os.path.dirname(os.path.abspath(__file__))

HEAD = """<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{titulo}</title>
<!-- Generado con ArtefactUI (kit/montar.py). No se edita a mano: se cambian app.js y los datos y se vuelve a montar. -->
<script>/* oscuro por defecto; 'auto' guardado = seguir al sistema; #tema=claro|oscuro lo fuerza (revisiones y capturas) */var t=null;try{{t=localStorage.getItem('tema')}}catch(e){{}}var h=(location.hash.match(/tema=(claro|oscuro)/)||[])[1];if(h)t=h==='claro'?'light':'dark';if(t!=='auto')document.documentElement.dataset.theme=(t==='light'?'light':'dark')</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
{css}</style>
<script src="https://cdn.tailwindcss.com/3.4.16"></script>
<script>
{cfg}</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prop-types/15.8.1/prop-types.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/recharts/2.12.7/Recharts.min.js"></script>
<script>window.react = window.React;   // lucide-react UMD busca el global en minúsculas</script>
<script src="https://unpkg.com/lucide-react@0.460.0/dist/umd/lucide-react.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/htm@3.1.1/dist/htm.umd.js"></script>
</head>
<body>
<div id="root"></div>
<script>
/* ===== DATA ===== */
const D = {datos};
/* ===== /DATA ===== */

/* ===== COMPONENTES ===== (kit/componentes.js) */
{componentes}
/* ===== /COMPONENTES ===== */

/* ===== APP ===== */
{app}
/* ===== /APP ===== */
document.title = D.titulo;
ReactDOM.createRoot(document.getElementById('root')).render(html`<${{Protegido}} nombre="la página"><${{App}} /><//>`);
</script>
</body>
</html>
"""


def leer_datos(ruta):
    txt = open(ruta, encoding='utf-8').read()
    if ruta.endswith('.json'):
        return json.loads(txt), json.dumps(json.loads(txt), ensure_ascii=False)
    m = re.search(r'const\s+D\s*=\s*(.*);\s*$', txt, re.S)
    if not m:
        sys.exit(f'{ruta}: esperaba un JSON o un .js con «const D = {{…}};»')
    return None, m.group(1).strip()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--app', required=True)
    ap.add_argument('--datos', required=True)
    ap.add_argument('--salida', required=True)
    ap.add_argument('--titulo')
    ap.add_argument('--pack', action='append', default=[], help='pack de iconos de dominio (repetible): amplía ICONOS')
    ap.add_argument('--cdn', metavar='VERSION', help='carga componentes.js desde jsDelivr (npm artefactui@VERSION) en vez de incrustarlo')
    a = ap.parse_args()

    errores, avisos = [], []
    datos_obj, datos_js = leer_datos(a.datos)
    app = open(a.app, encoding='utf-8').read().strip()
    titulo = a.titulo or (datos_obj or {}).get('titulo') or ''
    if datos_obj is not None:
        for k in ('titulo', 'fecha'):
            if not datos_obj.get(k):
                errores.append(f'datos: falta «{k}»')
    if not titulo:
        errores.append('sin título: pásalo con --titulo o como D.titulo')
    elif not 2 <= len(titulo.split()) <= 4:
        avisos.append(f'el título «{titulo}» debería tener de 2 a 4 palabras')
    if not re.search(r'\bfunction\s+App\s*\(', app):
        errores.append('app.js no define function App()')

    # Iconos de lucide usados como I.Nombre
    lista = os.path.join(KIT, 'lucide-0.460.txt')
    if os.path.exists(lista):
        validos = set(open(lista).read().split())
        comp = open(os.path.join(KIT, 'componentes.js'), encoding='utf-8').read() + ''.join(open(x, encoding='utf-8').read() for x in a.pack)
        usados = set(re.findall(r'\bI\.([A-Z][A-Za-z0-9]*)', app + comp))
        malos = sorted(usados - validos)
        if malos:
            errores.append('iconos que no existen en lucide-react 0.460: ' + ', '.join(malos))

    # Claves del catálogo de iconos Notion usadas por nombre
    comp_txt = open(os.path.join(KIT, 'componentes.js'), encoding='utf-8').read()
    m_cat = re.search(r'const ICONOS = \{(.*?)\n\};', comp_txt, re.S)
    if m_cat:
        claves = set(re.findall(r"^\s*'?([\w-]+)'?: \[I\.", m_cat.group(1) + ''.join(open(x, encoding='utf-8').read() for x in a.pack), re.M))
        usadas = set(re.findall(r'\b(?:n|icono|icon)="([a-z][\w-]*)"', app)) | set(re.findall(r"\b(?:icon|n)=\$\{'([a-z][\w-]*)'\}", app))
        for bloque in re.findall(r'links=\$\{\[(.*?)\]\}', app, re.S):              # links=[[id, texto, 'clave'], …]
            usadas |= set(re.findall(r"\[\s*'[\w-]+',\s*'[^']*',\s*'([a-z][\w-]*)'\s*\]", bloque))
        malas = sorted(usadas - claves)
        if malas:
            errores.append('claves de icono que no están en el catálogo (ICONOS): ' + ', '.join(malas))
    # {'<Algo …>'} dentro de htm se interpreta como etiqueta y rompe la página: hay que escribir ${'<Algo …>'}
    trampas = re.findall(r"(?<!\$)\{'<[A-Za-z][^']*'\}", app)
    if trampas:
        errores.append("htm interpreta como etiqueta el texto entre {'…'}; usa ${'…'}: " + ', '.join(trampas[:3]))
    # Colores sueltos en app.js (todo color debe ser un token var(--…))
    hexes = sorted(set(re.findall(r'#[0-9A-Fa-f]{6}\b', app)))
    if hexes:
        avisos.append('colores hex sueltos en app.js (usa tokens): ' + ', '.join(hexes))

    packs = ''.join('\n/* pack: ' + os.path.basename(x) + ' */\n' + open(x, encoding='utf-8').read() for x in a.pack)
    if a.cdn:
        # El kit vive en npm (artefactui@VERSION) y se sirve por jsDelivr, el CDN que admiten los artifacts de claude.ai
        componentes = ('/* componentes.js desde https://cdn.jsdelivr.net/npm/artefactui@' + a.cdn + '/kit/componentes.js */' + packs)
    else:
        componentes = open(os.path.join(KIT, 'componentes.js'), encoding='utf-8').read().strip() + packs
    html = HEAD.format(titulo=titulo,
                       css=open(os.path.join(KIT, 'tokens.css'), encoding='utf-8').read(),
                       cfg=open(os.path.join(KIT, 'tailwind.config.js'), encoding='utf-8').read(),
                       datos=datos_js,
                       componentes=componentes,
                       app=app)

    # Sintaxis del script principal
    if shutil.which('node'):
        script = re.findall(r'<script>(.*?)</script>', html, re.S)[-1]
        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as t:
            t.write(script)
        r = subprocess.run(['node', '--check', t.name], capture_output=True, text=True)
        os.unlink(t.name)
        if r.returncode:
            errores.append('error de sintaxis en el JS:\n' + r.stderr.strip())
    else:
        avisos.append('node no está instalado: no se ha comprobado la sintaxis')

    if a.cdn:
        html = html.replace('<script src="https://cdn.jsdelivr.net/npm/htm@3.1.1/dist/htm.umd.js"></script>',
            '<script src="https://cdn.jsdelivr.net/npm/htm@3.1.1/dist/htm.umd.js"></script>\n<script src="https://cdn.jsdelivr.net/npm/artefactui@' + a.cdn + '/kit/componentes.js"></script>')
    for x in avisos:
        print('aviso:', x)
    if errores:
        for x in errores:
            print('ERROR:', x)
        sys.exit(1)
    os.makedirs(os.path.dirname(os.path.abspath(a.salida)), exist_ok=True)
    open(a.salida, 'w', encoding='utf-8').write(html)
    print(f'ok: {a.salida} ({len(html) // 1024} KB)')


if __name__ == '__main__':
    main()
