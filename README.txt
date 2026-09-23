MARYLIN.DATA — INTERFAZ FINAL CON ARCHIVO VIVO / HISTORIAL v18

Esta carpeta contiene SOLO la interfaz web final para conectar con la PUBLICACION_WEB que ya generaste.
No crea estados nuevos y no modifica los JSON históricos ni las imágenes MD_0001–MD_0022.

CONTENIDO
- interfaz_web/index.html
- interfaz_web/style.css
- interfaz_web/app.js
- instalar_historial_web.ps1
- verificar_publicacion.py

INSTALACIÓN
1. Extrae este ZIP.
2. Desde PowerShell, ubícate en la carpeta raíz de tu proyecto MARYLIN.DATA.
3. Ejecuta el script indicando su ruta. Si extrajiste el paquete dentro de la raíz, por ejemplo:
   .\MARYLIN_DATA_WEB_FINAL_HISTORIAL_V18\instalar_historial_web.ps1
4. El script hace una copia de seguridad de index.html, style.css y app.js si existieran y luego instala la interfaz.

PRUEBA LOCAL
Después de instalar:
   python verificar_publicacion.py

Debe mostrar:
   ESTADOS: 22
   PRIMERO: MD_0001
   ULTIMO: MD_0022
   IMAGENES FALTANTES: NINGUNA

Luego ejecuta:
   python -m http.server 8765 --directory PUBLICACION_WEB

Abre en el navegador:
   http://localhost:8765

La página debe mostrar el diseño MARYLIN.DATA y, debajo de la imagen del estado, el bloque ARCHIVO VIVO con una barra para recorrer MD_0001 → MD_0022.

Al mover la barra deben cambiar:
- imagen histórica
- estado
- fecha/hora
- estado del sistema
- fuerzas visuales
- memoria/huella
- lectura formal
- geometría
- trayectoria y archivo

IMPORTANTE
No ejecutes Main_v33...py para esta prueba. No es necesario y podría generar un nuevo estado. Esta etapa solo instala y prueba la interfaz con los datos públicos que ya sincronizaste.
