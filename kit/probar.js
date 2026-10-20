(async () => {
  const log = [], ok = (n, c) => log.push((c ? 'OK   ' : 'FALLA') + ' ' + n);
  try {
  const espera = ms => new Promise(r => setTimeout(r, ms));
  const tipo = (el, v) => { const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(el, v); el.dispatchEvent(new Event('input', {bubbles: true})); };
  await espera(2500);
  ok('pinta la página', !!document.querySelector('h1'));
  ok('sin errores de sección', !document.body.innerText.includes('No se ha podido pintar'));
  const filas = () => document.querySelectorAll('table tbody tr').length;
  const f0 = filas(); ok('tabla con filas (' + f0 + ')', f0 > 0);
  // ordenar
  const thBtn = document.querySelector('table thead th button');
  if (thBtn) { thBtn.click(); await espera(200); ok('ordena al pulsar cabecera', document.querySelector('table thead th').getAttribute('aria-sort') !== 'none'); }
  // búsqueda global
  const muestra = (document.querySelector('table tbody tr td:nth-child(2)')?.innerText || document.querySelector('table tbody tr td')?.innerText || '').trim().split('\n')[0];
  const q = document.querySelector('input[type=search]'); tipo(q, 'zzzz'); await espera(300);
  ok('búsqueda sin resultados muestra estado vacío', document.body.innerText.includes('Sin resultados'));
  tipo(q, ''); await espera(200); tipo(q, muestra); await espera(300);
  ok('búsqueda filtra la tabla («' + muestra.slice(0, 24) + '» → ' + filas() + ' de ' + f0 + ')', filas() >= 1 && filas() <= f0);
  ok('aparece «Restablecer»', [...document.querySelectorAll('button')].some(b => b.textContent.includes('Restablecer')));
  [...document.querySelectorAll('button')].find(b => b.textContent.includes('Restablecer')).click(); await espera(300);
  ok('restablecer vacía la búsqueda', q.value === '' && filas() === f0);
  // filtro de grupo (cualquier selector segmentado de la barra de filtros salvo el periodo)
  const grp = [...document.querySelectorAll('[role=search] [role=group]')].find(g => g.getAttribute('aria-label') !== 'Periodo');
  const cuenta = () => document.querySelectorAll('table tbody tr').length + document.querySelectorAll('main button.rounded-card').length;
  if (grp) { const bs = [...grp.querySelectorAll('button')], antes = cuenta(); bs[1].click(); await espera(300);
    const despues = cuenta(); ok('filtro de grupo reduce lo que se ve (' + antes + ' → ' + despues + ')', despues < antes); bs[0].click(); await espera(300); }
  // hoja de detalle desde la tabla
  document.querySelector('table tbody tr').click(); await espera(500);
  const dlg = document.querySelector('[role=dialog]'); ok('abre la hoja de detalle', !!dlg);
  ok('la hoja tiene el foco dentro', dlg && dlg.contains(document.activeElement));
  // navegación entre detalles (solo si la hoja la tiene: <Hoja nav> + <SortTable activa nav>)
  const sig = dlg && dlg.querySelector('button[aria-label=Siguiente]');
  if (sig) { const t0 = dlg.querySelector('h2')?.textContent; window.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true})); await espera(300);
    const t1 = document.querySelector('[role=dialog] h2')?.textContent; ok('↓ pasa al detalle siguiente (' + t0 + ' → ' + t1 + ')', !!t1 && t1 !== t0);
    window.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowUp', bubbles: true})); await espera(300);
    ok('↑ vuelve al anterior', document.querySelector('[role=dialog] h2')?.textContent === t0); }
  document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true})); window.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'})); await espera(300);
  ok('Esc cierra la hoja', !document.querySelector('[role=dialog]'));
  // tarjeta pulsable (abre su detalle)
  document.querySelector('main section button.rounded-card').click(); await espera(400);
  ok('la tarjeta abre la hoja', !!document.querySelector('[role=dialog]'));
  document.querySelector('[role=dialog] button[aria-label=Cerrar]').click(); await espera(300);
  ok('el botón cierra la hoja', !document.querySelector('[role=dialog]'));
  // periodo
  [...document.querySelectorAll('[aria-label="Periodo"] button')][0].click(); await espera(300);
  ok('cambia el periodo', [...document.querySelectorAll('[aria-label="Periodo"] button')][0].getAttribute('aria-pressed') === 'true');
  // tema
  const tb = document.querySelector('nav button[aria-label^="Apariencia"]'); tb.click(); await espera(200);
  ok('el botón de tema cambia la apariencia', document.documentElement.dataset.theme === 'light');
  // recuerda filtros
  ok('recuerda filtros en el navegador', (() => { try { return Object.keys(localStorage).some(k => k.includes(':filtros')); } catch (e) { return false; } })());
  // exportar: sin visor no hay capacidad → el botón no aparece
  ok('exportar oculto fuera del visor', ![...document.querySelectorAll('button')].some(b => b.textContent.includes('Exportar')));
  } catch (e) { log.push('FALLA se detuvo: ' + e.message + ' (la página no tiene ese elemento o falló)'); }
  const pre = document.createElement('pre'); pre.id = 'RESULTADO'; pre.textContent = log.join('\n'); document.body.appendChild(pre);
})();
