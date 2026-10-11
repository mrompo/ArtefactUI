// Escala tipográfica = estilos de texto de Apple (iOS, tamaño por defecto). xs Footnote · sm Subheadline · base Body · lg Title 3 · xl Title 2 · 2xl Title 1 · 3xl Large Title
tailwind.config = {theme: {extend: {
  colors: {bg: 'var(--bg)', card: 'var(--card)', line: 'var(--line)', 'line-strong': 'var(--line-strong)', ink: 'var(--ink)', strong: 'var(--ink-strong)',
    muted: 'var(--muted)', faint: 'var(--faint)', accent: 'var(--accent)', 'accent-soft': 'var(--accent-soft)', 'accent-line': 'var(--accent-line)',
    ok: 'var(--ok)', 'ok-ink': 'var(--ok-ink)', 'ok-soft': 'var(--ok-soft)', info: 'var(--info)', 'info-ink': 'var(--info-ink)', 'info-soft': 'var(--info-soft)',
    warn: 'var(--warn)', 'warn-ink': 'var(--warn-ink)', 'warn-soft': 'var(--warn-soft)', bad: 'var(--bad)', 'bad-ink': 'var(--bad-ink)', 'bad-soft': 'var(--bad-soft)'},
  boxShadow: {card: 'var(--shadow)'},
  fontSize: {caption: ['12px', '16px'], xs: ['13px', '18px'], sm: ['15px', '20px'], callout: ['16px', '21px'], base: ['17px', '25px'],
    lg: ['20px', '25px'], xl: ['22px', '28px'], '2xl': ['28px', '34px'], '3xl': ['34px', '41px']},
  borderRadius: {card: '16px'},
  fontFamily: {mono: ['"SF Mono"', 'ui-monospace', '"JetBrains Mono"', 'monospace']}}}};
