#!/usr/bin/env python3
"""ArtefactUI · prueba de interacción de un dashboard montado, en Chrome sin interfaz.

Uso: python3 kit/probar.py vista.html        (Chrome se busca solo; o CHROME=/ruta/al/navegador)

Inyecta kit/probar.js en una copia temporal, la abre con Chrome headless y muestra el resultado de cada paso:
pinta, sin secciones rotas, tabla y orden, búsqueda (vacío, filtra, restablecer), filtro de grupo, hoja de detalle
(abre, foco dentro, Esc, botón), periodo, tema, filtros recordados y exportación oculta fuera del visor.
Los pasos que la página no tiene (p. ej. sin filtro de grupo) fallan: léelos con criterio. Sale con 1 si falla algo.
"""
import html, os, re, subprocess, sys, tempfile

def _chrome():
    import shutil
    for c in (os.environ.get('CHROME'), '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
              shutil.which('google-chrome'), shutil.which('google-chrome-stable'), shutil.which('chromium'), shutil.which('chromium-browser')):
        if c and os.path.exists(c):
            return c
    sys.exit('No encuentro Chrome ni Chromium: instálalo o indica la ruta con CHROME=/ruta')
CHROME = _chrome()
KIT = os.path.dirname(os.path.abspath(__file__))
pagina = open(sys.argv[1], encoding='utf-8').read()
script = open(os.path.join(KIT, 'probar.js'), encoding='utf-8').read()
with tempfile.NamedTemporaryFile('w', suffix='.html', delete=False, encoding='utf-8') as t:
    t.write(pagina.replace('</body>', '<script>\n' + script + '\n</script></body>'))
dom = subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--virtual-time-budget=20000', '--dump-dom', 'file://' + t.name],
                     capture_output=True, text=True).stdout
os.unlink(t.name)
m = re.search(r'<pre id="RESULTADO">(.*?)</pre>', dom, re.S)
if not m:
    sys.exit('Sin resultado: la página no ha llegado a pintarse (error de JS o de una librería).')
res = html.unescape(m.group(1))
print(res)
sys.exit(1 if 'FALLA' in res else 0)
