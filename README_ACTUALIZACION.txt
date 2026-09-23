MARYLIN.DATA — ACTUALIZACIÓN v17 / NAVEGADOR HISTÓRICO
=======================================================

OBJETIVO
--------
La barra ARCHIVO VIVO deja de ser únicamente visual. Ahora recorre los estados
publicados y actualiza simultáneamente imagen, fecha, estado, seed, memoria,
huella, fuerzas visuales y lectura formal.

ARCHIVOS DE ESTA ACTUALIZACIÓN
------------------------------
1. app.js
   Reemplaza el app.js actual de GitHub.
   - Carga historial_estados.json.
   - Conecta el slider con los datos históricos.
   - Si la barra no existe en index.html, la crea automáticamente.
   - También crea su CSS automáticamente; no es obligatorio tocar style.css.
   - Mantiene el fallback para la web si historial_estados.json todavía no existe.

2. Main_v33_MARYLIN_DATA_SISTEMA_CERRADO_WEB.py
   Reemplaza la versión WEB actual del script local.
   - Conserva la publicación actual.
   - Genera historial_estados.json.
   - Publica datos públicos por estado.
   - Copia TODOS los MD_XXXX.png existentes hasta el estado actual.
   - Conserva una lectura pública anterior cuando ya estaba publicada.
   - No publica experiencia autobiográfica ni logs.

NUEVOS ARCHIVOS QUE GENERA EL PYTHON
------------------------------------
PUBLICACION_WEB/
  historial_estados.json
  MD_0001.png
  MD_0002.png
  ...
  MD_00XX.png
  MD_0001_lectura.json
  MD_0002_lectura.json
  ...

Los JSON de lectura son públicos y contienen únicamente información formal,
no la experiencia autobiográfica completa.

IMPORTANTE
----------
No se deben inventar fuerzas o imágenes históricas que no existan en el archivo
local. El script toma los logs y fragmentos reales disponibles. Si un estado
histórico no tiene log o fragmento, no se fabrica: quedará fuera de la carga
histórica o deberá recuperarse primero desde el archivo original.

PUBLICACIÓN EN GITHUB
---------------------
1. Ejecuta tu Python normalmente.
2. Revisa que PUBLICACION_WEB contenga:
   - estado_actual_web.json
   - archivo_estados.json
   - historial_estados.json
   - estado_actual.png
   - MD_0001.png ... MD_00XX.png
3. En GitHub reemplaza app.js por el app.js de esta carpeta.
4. Sube también los nuevos JSON y los MD_XXXX.png generados.
5. No necesitas cambiar el QR: la URL pública sigue siendo la misma.

PRUEBA
------
Abre la página y ve a Estado actual.
Mueve ARCHIVO VIVO desde el primer estado hasta el último.
Cada posición debe cambiar:
- MD_XXXX
- fecha/hora
- imagen
- estado del sistema
- fuerzas visuales
- memoria/huella
- lectura formal

Cuando generes MD_0023, el mismo flujo debe incorporar el nuevo estado sin
reconstruir manualmente la interfaz.
