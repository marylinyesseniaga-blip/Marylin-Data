"""Migración de publicación pública histórica sin crear un nuevo estado."""
from pathlib import Path
import importlib.util
import json
import shutil

SCRIPT = Path(__file__).with_name("Main_v33_MARYLIN_DATA_SISTEMA_CERRADO_WEB.py")
spec = importlib.util.spec_from_file_location("marylin_web", SCRIPT)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

WEB = Path(mod.CARPETA_PUBLICACION_WEB)
LOGS = Path(mod.CARPETA_LOGS)
FRAGMENTOS = Path(mod.CARPETA_FRAGMENTOS)
WEB.mkdir(parents=True, exist_ok=True)

meta_path = WEB / "estado_actual_web.json"
meta_actual = json.loads(meta_path.read_text(encoding="utf-8")) if meta_path.exists() else {}
numero_actual = int(meta_actual.get("numero_estado", 0))
if numero_actual <= 0:
    logs = []
    for p in LOGS.glob("MD_*.txt"):
        try: logs.append(int(p.stem.split("_")[1]))
        except Exception: pass
    numero_actual = max(logs, default=0)

historial = []
for p in sorted(LOGS.glob("MD_*.txt")):
    try: n = int(p.stem.split("_")[1])
    except Exception: continue
    if n > numero_actual: continue
    info = mod.leer_log_visual(n)
    if not info: continue
    fecha, hora = mod._leer_fecha_hora_log(n)
    item = {
        "obra": "MARYLIN.DATA",
        "version_sistema": meta_actual.get("version_sistema", getattr(mod, "VERSION", "3.4")),
        "estado": f"MD_{n:04d}",
        "numero_estado": n,
        "fecha": fecha,
        "hora": hora,
        "seed": info.get("seed"),
        "estado_sistema": info.get("estado_sistema", "CONTRADICCIÓN ACTIVA"),
        "estados_registrados": n,
        "fuerzas_visuales": {k: round(float(v),4) for k,v in info.get("fuerzas",{}).items()},
        "memoria": {
            "contradiccion_heredada": round(float(info.get("contradiccion_heredada",0)),4),
            "contradiccion_acumulada": round(float(info.get("contradiccion_acumulada",0)),4),
            "estados_con_memoria": max(0,n-1),
        },
        "huella": mod.calcular_huella(n),
        "fragmento": f"MD_{n:04d}.png",
        "lectura": mod._lectura_historica_publica(f"MD_{n:04d}", info.get("fuerzas",{})),
    }
    old = WEB / f"MD_{n:04d}_lectura.json"
    if old.exists():
        try:
            old_data = json.loads(old.read_text(encoding="utf-8"))
            if old_data.get("lectura"): item["lectura"] = old_data["lectura"]
        except Exception: pass
    historial.append(item)

# Conserva la lectura completa del estado actual ya publicada.
if meta_actual.get("estado"):
    for item in historial:
        if item["estado"] == meta_actual["estado"]:
            item.update(meta_actual)
            item["fragmento"] = f"{item['estado']}.png"
            break

# Publica todos los fragmentos que realmente existen.
for p in FRAGMENTOS.glob("MD_*.png"):
    try: n = int(p.stem.split("_")[1])
    except Exception: continue
    if n <= numero_actual:
        shutil.copy2(p, WEB / p.name)

for item in historial:
    (WEB / item["fragmento"]).exists()

historial.sort(key=lambda x: int(x["numero_estado"]))

(WEB / "historial_estados.json").write_text(
    json.dumps({"obra":"MARYLIN.DATA","actualizado":meta_actual.get("fecha",""),"estados":historial}, ensure_ascii=False, indent=4),
    encoding="utf-8"
)

(WEB / "archivo_estados.json").write_text(
    json.dumps({"obra":"MARYLIN.DATA","actualizado":meta_actual.get("fecha",""),"estados":[{
        "estado":x["estado"],"fecha":x.get("fecha",""),"hora":x.get("hora",""),
        "resultado":x.get("estado_sistema",""),"fragmento":x["fragmento"]
    } for x in historial]}, ensure_ascii=False, indent=4),
    encoding="utf-8"
)

print(f"Historial público sincronizado: {len(historial)} estados")
print(f"Último estado: MD_{numero_actual:04d}")
print(f"Publicación: {WEB}")
