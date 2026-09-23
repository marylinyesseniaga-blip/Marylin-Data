$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$source = Join-Path $root 'interfaz_web'
$target = Join-Path (Get-Location) 'PUBLICACION_WEB'

if (-not (Test-Path $target)) {
    throw "No encuentro PUBLICACION_WEB en: $(Get-Location)"
}

$requiredData = @('historial_estados.json','archivo_estados.json','estado_actual_web.json','estado_actual.png','identidad_acumulada_actual.png','mapa_temporal_actual.png')
foreach ($f in $requiredData) {
    if (-not (Test-Path (Join-Path $target $f))) {
        Write-Warning "Falta en PUBLICACION_WEB: $f"
    }
}

$stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$backup = Join-Path $target ("_backup_interfaz_" + $stamp)
New-Item -ItemType Directory -Path $backup | Out-Null
foreach ($f in @('index.html','style.css','app.js')) {
    $p = Join-Path $target $f
    if (Test-Path $p) { Copy-Item $p $backup -Force }
}

Copy-Item (Join-Path $source 'index.html') $target -Force
Copy-Item (Join-Path $source 'style.css') $target -Force
Copy-Item (Join-Path $source 'app.js') $target -Force

Write-Host ''
Write-Host 'INTERFAZ HISTORIAL INSTALADA CORRECTAMENTE.' -ForegroundColor Green
Write-Host "PUBLICACION_WEB: $target"
Write-Host "Backup de interfaz anterior: $backup"
Write-Host ''
Write-Host 'Siguiente prueba:' -ForegroundColor Cyan
Write-Host 'python -m http.server 8765 --directory PUBLICACION_WEB'
Write-Host 'Luego abre: http://localhost:8765'
