from pathlib import Path
import json

web = Path('PUBLICACION_WEB')
required = ['index.html','style.css','app.js','historial_estados.json','archivo_estados.json','estado_actual_web.json']
print('PUBLICACION_WEB:', web.resolve())
for name in required:
    print(f'{name}:', 'OK' if (web/name).exists() else 'FALTA')

h = web/'historial_estados.json'
if h.exists():
    data = json.loads(h.read_text(encoding='utf-8'))
    states = data.get('estados', []) if isinstance(data, dict) else data
    print('ESTADOS:', len(states))
    if states:
        print('PRIMERO:', states[0].get('estado'))
        print('ULTIMO:', states[-1].get('estado'))
        geo = states[-1].get('lectura', {}).get('geometria')
        print('GEOMETRIA ULTIMO:', geo)
        missing = []
        for item in states:
            frag = item.get('fragmento')
            if frag and not (web/frag).exists():
                missing.append(frag)
        print('IMAGENES FALTANTES:', missing if missing else 'NINGUNA')
