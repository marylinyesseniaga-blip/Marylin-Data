from pathlib import Path

archivos = [
    Path("PUBLICACION_WEB/index.html"),
    Path("PUBLICACION_WEB/app.js"),
]

for archivo in archivos:
    texto = archivo.read_text(encoding="utf-8-sig")

    if any(m in texto for m in ("Ã", "Â", "â€", "â†", "â€”", "â€“")):
        try:
            corregido = texto.encode("cp1252").decode("utf-8")
            archivo.write_text(corregido, encoding="utf-8")
            print(f"{archivo}: CORREGIDO")
        except UnicodeError as e:
            print(f"{archivo}: ERROR -> {e}")
    else:
        archivo.write_text(texto, encoding="utf-8")
        print(f"{archivo}: YA ESTABA CORRECTO")

