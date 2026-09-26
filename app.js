const $ = (s) => document.querySelector(s);

async function loadJSON(file) {
  const r = await fetch(file + "?v=" + Date.now());
  if (!r.ok) throw new Error(`No se pudo cargar ${file}`);
  return r.json();
}

function fmtDate(date, time) {
  if (!date) return "—";
  return time ? `${date} · ${time}` : date;
}

function pct(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
}

function label(key) {
  const names = {
    tiempo: "Tiempo",
    peso: "Peso",
    expansion: "Expansión",
    libertad: "Libertad",
    tension: "Tensión",
    movimiento: "Movimiento",
    contradiccion: "Contradicción",
    identidad: "Identidad"
  };
  return names[key] || key.replaceAll("_", " ");
}

function renderForces(meta) {
  const forces = meta.fuerzas_visuales || meta.fuerzas || {};
  const order = ["peso","tension","expansion","libertad","movimiento","contradiccion","identidad","tiempo"];
  const el = $("#forces");
  if (!el) return;
  const rows = order.filter(k => Number.isFinite(Number(forces[k]))).map(k => {
    const v = Number(forces[k]);
    const width = pct(v);
    return `<div class="force"><div class="force-head"><span>${label(k)}</span><strong>${v.toFixed(2)}</strong></div><div class="bar"><i style="width:${width}%"></i></div></div>`;
  });
  if (rows.length) el.innerHTML = rows.join("");
}

function getArchiveItems(data) {
  return Array.isArray(data) ? data : (data && Array.isArray(data.estados) ? data.estados : []);
}

function stateNumber(value) {
  return Number(String(value || "").replace(/\D/g,"")) || 0;
}

function renderTrajectory(data){

    const items=getArchiveItems(data)
        .sort((a,b)=>stateNumber(a.estado)-stateNumber(b.estado));

    if(!items.length)return;

    const range=$("#historyRange");
    const current=$("#historyCurrent");
    const start=$("#historyStart");
    const end=$("#historyEnd");
    const date=$("#historyDate");

    range.max=items.length-1;
    range.value=items.length-1;

    start.textContent=items[0].estado;
    end.textContent=items[items.length-1].estado;

    updateState(items.length-1);

    range.addEventListener("input",e=>{
        updateState(Number(e.target.value));
    });

    function updateState(i){

        const item=items[i];

        current.textContent=item.estado;
        date.textContent=item.fecha;

        /* HERO */
        const hero=$("#heroState");
        if(hero)hero.textContent=item.estado;

        const heroDate=$("#heroDate");
        if(heroDate)heroDate.textContent=item.fecha;

        /* DASHBOARD */
        const dash=$("#dashState");
        if(dash)dash.textContent=item.estado;

        const caption=$("#captionState");
        if(caption)caption.textContent=item.estado;

        const stateId=$("#stateId");
        if(stateId)stateId.textContent=item.estado;

        const monitor=$("#monitorState");
        if(monitor)monitor.textContent=item.estado;

        /* CONTADOR DE ESTADOS */
        const total=$("#metricStates");
        if(total)total.textContent=i+1;

        const monitorStates=$("#monitorStates");
        if(monitorStates)monitorStates.textContent=i+1;

        const dashDate=$("#dashDate");
        if(dashDate)dashDate.textContent=item.fecha;

        /* IMAGEN PRINCIPAL */

        const img=document.querySelector("#estadoActualImg");

        if(img && item.fragmento){

            img.src=item.fragmento;
            img.alt=item.estado;

        }
    }
}
function renderArchive(data) {
  const el = $("#archive");
  if (!el) return;
  const items = getArchiveItems(data).sort((a,b) => stateNumber(b.estado) - stateNumber(a.estado));

  if (!items.length) {
    el.innerHTML = `<p class="section-note">El archivo todavía no contiene estados publicados.</p>`;
    return;
  }

  el.innerHTML = items.map(item => {
    const img = item.fragmento || "";
    const imagePath = img ? img : "";
    const available = !!img && Number.isInteger(stateNumber(item.estado)) &&
      stateNumber(item.estado) === stateNumber(window.MARYLIN_CURRENT_STATE) &&
      item.estado === window.MARYLIN_CURRENT_STATE;

    return `<div class="archive-item ${available ? "has-image" : ""}">
      <span class="archive-id">${item.estado || "—"}</span>
      <span class="archive-state">${item.resultado || "ESTADO REGISTRADO"}</span>
      <span class="archive-date">${fmtDate(item.fecha, item.hora)}</span>
      ${available ? `<a class="archive-arrow" href="${imagePath}" target="_blank" rel="noopener" aria-label="Abrir ${item.estado}">↗</a>` : `<span class="archive-arrow muted-arrow">—</span>`}
    </div>`;
  }).join("");
}


function renderReading(meta) {
  const reading = meta && meta.lectura;
  if (!reading) return;

  const title = document.querySelector("#readingTitle");
  const method = document.querySelector("#readingMethod");
  const summary = document.querySelector("#readingSummary");
  const observations = document.querySelector("#readingObservations");
  const question = document.querySelector("#readingQuestion");

  if (title) title.textContent = `${reading.titulo || "LECTURA DEL ESTADO"} · ${meta.estado || ""}`;
  if (method) method.textContent = reading.metodo || "";
  if (summary) summary.textContent = reading.resumen || "";
  if (observations) {
    observations.innerHTML = (reading.observaciones || []).map((item, i) =>
      `<div class="reading-observation"><span>${String(i+1).padStart(2,"0")}</span><p>${item}</p></div>`
    ).join("");
  }
  if (question) question.textContent = reading.pregunta || "";
}

const EMBEDDED_META = {"obra": "MARYLIN.DATA", "version_sistema": "3.4", "estado": "MD_0022", "numero_estado": 22, "fecha": "2026-09-22", "hora": "18:38:55", "seed": 848509, "estado_sistema": "CONTRADICCIÓN ACTIVA", "estados_registrados": 22, "fuerzas_visuales": {"tiempo": 14.0, "peso": 90.75, "expansion": 61.6667, "libertad": 46.0, "tension": 70.3333, "movimiento": 46.25, "contradiccion": 53.95, "contradiccion_heredada": 53.2525, "identidad": 67.3333}, "memoria": {"contradiccion_heredada": 53.2525, "contradiccion_acumulada": 53.0204, "estados_con_memoria": 21}, "huella": {"cambio_absoluto_acumulado": 1218.0, "movimientos_registrados": 223, "intensidad_huella": 0.054619, "pico_huella": 0.2, "persistencia": 1.0}, "imagenes": {"estado_actual": "estado_actual.png", "identidad_acumulada": "identidad_acumulada_actual.png", "mapa_temporal": "mapa_temporal_actual.png"}, "principio": "La identidad no se promedia: se acumula. Cada experiencia agrega un movimiento y los estados anteriores pueden deformar los posteriores.", "lectura": {"titulo": "LECTURA DEL ESTADO", "resumen": "El estado combina baja densidad, asimetría contenida y una dispersión amplia del campo visual.", "observaciones": ["La estructura conserva baja compresión y mayor disponibilidad espacial.", "La expansión permanece contenida y concentra el campo visual.", "Las trayectorias conservan una organización relativamente estable.", "El eje conserva una deriva limitada.", "La oposición entre fuerzas no domina el estado.", "La memoria reciente tiene una presencia visual reducida.", "Los elementos ocupan un campo amplio y se dispersan fuera del núcleo."], "pregunta": "¿Qué parte de este estado pertenece a la experiencia actual y qué parte proviene de estados anteriores?", "geometria": {"densidad": 0.0548, "centro_x": 0.5034, "centro_y": 0.5357, "asimetia": 0.0012, "asimetia_vertical": 0.2435, "dispersion": 0.9386}, "metodo": "Lectura formal derivada de las fuerzas del sistema y de medidas básicas de la imagen; no es una interpretación psicológica."}};
const EMBEDDED_ARCHIVE = {"obra": "MARYLIN.DATA", "actualizado": "2026-09-22 18:38:55", "estados": [{"estado": "MD_0001", "fecha": "2026-09-01", "hora": "22:35:15", "resultado": "CONTRADICCIÓN ACTIVA", "fragmento": "MD_0001.png"}, {"estado": "MD_0002", "fecha": "2026-09-02", "hora": "16:55:11", "resultado": "CONTRADICCIÓN ACTIVA", "fragmento": "MD_0002.png"}, {"estado": "MD_0003", "fecha": "2026-09-03", "hora": "19:57:58", "resultado": "CONTRADICCIÓN ACTIVA", "fragmento": "MD_0003.png"}, {"estado": "MD_0004", "fecha": "2026-09-04", "hora": "21:01:29", "resultado": "CONTRADICCIÓN ACTIVA", "fragmento": "MD_0004.png"}, {"estado": "MD_0005", "fecha": "2026-09-05", "hora": "19:57:50", "resultado": "CONTRADICCIÓN ACTIVA", "fragmento": "MD_0005.png"}, {"estado": "MD_0006", "fecha": "2026-09-07", "hora": "07:37:28", "resultado": "CONTRADICCIÓN ACTIVA", "fragmento": "MD_0006.png"}, {"estado": "MD_0007", "fecha": "2026-09-07", "hora": "17:06:09", "resultado": "CONTRADICCIÓN ACTIVA", "fragmento": "MD_0007.png"}, {"estado": "MD_0008", "fecha": "2026-09-08", "hora": "13:37:50", "resultado": "CONTRADICCIÓN ACTIVA", "fragmento": "MD_0008.png"}, {"estado": "MD_0009", "fecha": "2026-09-09", "hora": "21:00:19", "resultado": "CONTRADICCIÓN ACTIVA", "fragmento": "MD_0009.png"}, {"estado": "MD_0010", "fecha": "2026-09-10", "hora": "19:22:26", "resultado": "CONTRADICCIÓN ACTIVA", "fragmento": "MD_0010.png"}, {"estado": "MD_0011", "fecha": "2026-09-11", "hora": "21:39:37", "resultado": "CONTRADICCIÓN ACTIVA", "fragmento": "MD_0011.png"}, {"estado": "MD_0012", "fecha": "2026-09-12", "hora": "22:11:41", "resultado": "CONTRADICCIÓN ACTIVA", "fragmento": "MD_0012.png"}, {"estado": "MD_0013", "fecha": "2026-09-13", "hora": "21:11:11", "resultado": "CONTRADICCIÓN ACTIVA", "fragmento": "MD_0013.png"}, {"estado": "MD_0014", "fecha": "2026-09-14", "hora": "21:43:21", "resultado": "CONTRADICCIÓN ACTIVA", "fragmento": "MD_0014.png"}, {"estado": "MD_0015", "fecha": "2026-09-15", "hora": "20:58:12", "resultado": "CONTRADICCIÓN ACTIVA", "fragmento": "MD_0015.png"}, {"estado": "MD_0016", "fecha": "2026-09-16", "hora": "19:20:19", "resultado": "CONTRADICCIÓN ACTIVA", "fragmento": "MD_0016.png"}, {"estado": "MD_0017", "fecha": "2026-09-17", "hora": "20:57:54", "resultado": "CONTRADICCIÓN ACTIVA", "fragmento": "MD_0017.png"}, {"estado": "MD_0018", "fecha": "2026-09-19", "hora": "17:23:44", "resultado": "CONTRADICCIÓN ACTIVA", "fragmento": "MD_0018.png"}, {"estado": "MD_0019", "fecha": "2026-09-20", "hora": "09:51:00", "resultado": "CONTRADICCIÓN ACTIVA", "fragmento": "MD_0019.png"}, {"estado": "MD_0020", "fecha": "2026-09-20", "hora": "19:38:59", "resultado": "CONTRADICCIÓN ACTIVA", "fragmento": "MD_0020.png"}, {"estado": "MD_0021", "fecha": "2026-09-21", "hora": "18:45:09", "resultado": "CONTRADICCIÓN ACTIVA", "fragmento": "MD_0021.png"}, {"estado": "MD_0022", "fecha": "2026-09-22", "hora": "18:38:28", "resultado": "CONTRADICCIÓN ACTIVA", "fragmento": "MD_0022.png"}]};

async function safeLoad(path, fallback) {
  try { return await loadJSON(path); } catch(e) { return fallback; }
}

async function init() {
  try {
    const meta = await safeLoad("estado_actual_web.json", EMBEDDED_META);
    const archive = await safeLoad("archivo_estados.json", EMBEDDED_ARCHIVE);

    const state = meta.estado || "—";
    window.MARYLIN_CURRENT_STATE = state;
    const date = meta.fecha || "—";
    const time = meta.hora || "";

    $("#heroState").textContent = state;
    $("#heroDate").textContent = date;
    $("#heroStatus").textContent = meta.estado_sistema || "—";
    $("#stateId").textContent = state;

    const mem = meta.memoria || {};
    const huella = meta.huella || {};
    const geometry = (meta.lectura && meta.lectura.geometria) || {};

    // Panel de sistema / dashboard
    const set = (id, value) => { const el = document.querySelector(id); if (el) el.textContent = value; };
    set("#monitorVersion", `v${meta.version_sistema || "—"}`);
    set("#monitorState", state);
    set("#monitorStatus", meta.estado_sistema || "—");
    set("#monitorStates", meta.estados_registrados ?? "—");
    set("#monitorMemory", mem.estados_con_memoria ?? "—");
    set("#monitorMoves", huella.movimientos_registrados ?? "—");
    set("#monitorIntensity", huella.intensidad_huella !== undefined ? Number(huella.intensidad_huella).toFixed(3) : "—");
    set("#monitorDate", fmtDate(date, time));
    set("#dashState", state);
    set("#dashDate", fmtDate(date, time));
    set("#dashVersion", meta.version_sistema || "—");
    set("#dashSeed", meta.seed ?? "—");
    set("#dashMemory", mem.estados_con_memoria ?? "—");
    set("#dashIntensity", huella.intensidad_huella !== undefined ? Number(huella.intensidad_huella).toFixed(3) : "—");
    set("#geoDensity", geometry.densidad !== undefined ? Number(geometry.densidad).toFixed(3) : "—");
    set("#geoDispersion", geometry.dispersion !== undefined ? Number(geometry.dispersion).toFixed(3) : "—");
    set("#geoAsymmetry", geometry.asimetria_vertical !== undefined ? Number(geometry.asimetria_vertical).toFixed(3) : "—");
    set("#geoCenter", geometry.centro_x !== undefined && geometry.centro_y !== undefined ? `${Number(geometry.centro_x).toFixed(2)} / ${Number(geometry.centro_y).toFixed(2)}` : "—");
    $("#captionState").textContent = state;
    $("#captionTime").textContent = fmtDate(date, time);
    $("#systemStatus").textContent = meta.estado_sistema || "—";
    $("#footerVersion").textContent = `v${meta.version_sistema || "—"}`;
    $("#footerUpdated").textContent = fmtDate(date, time);

    renderForces(meta);

    $("#metricStates").textContent = meta.estados_registrados ?? "—";
    $("#metricMemoryStates").textContent = mem.estados_con_memoria ?? "—";
    $("#metricMoves").textContent = huella.movimientos_registrados ?? "—";
    $("#metricPersistence").textContent = huella.persistencia !== undefined ? Number(huella.persistencia).toFixed(2) : "—";
    $("#metricIntensity").textContent = huella.intensidad_huella !== undefined ? Number(huella.intensidad_huella).toFixed(3) : "—";

    renderReading(meta);
    renderTrajectory(archive);
    renderArchive(archive);
  } catch (err) {
    console.error(err);
    document.body.insertAdjacentHTML("afterbegin",
      `<div style="padding:12px 18px;background:#151515;color:#fff;font:12px monospace">
       No fue posible cargar los datos públicos. Si estás probando el sitio localmente, ábrelo mediante un servidor web local.
       </div>`);
  }
}
function initMotion() {
  const items = document.querySelectorAll('.section, .hero-monitor, .state-dash-card, .code-card, .anatomy-grid > div');
  items.forEach(el => el.classList.add('reveal'));
  if (!('IntersectionObserver' in window)) { items.forEach(el => el.classList.add('is-visible')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); } });
  }, { threshold: 0.08 });
  items.forEach(el => io.observe(el));
}
initMotion();
init();
/* ======================================
   ARCHIVO VIVO INTERACTIVO
====================================== */

const slider=document.getElementById("historyRange");

if(slider){

slider.addEventListener("input",()=>{

const n=parseInt(slider.value);

const codigo=`MD_${String(n).padStart(4,"0")}`;

document.getElementById("historyCurrent").textContent=codigo;
document.getElementById("historyDate").textContent=`2026-09-${String(Math.min(n,30)).padStart(2,"0")}`;

document.getElementById("stateId").textContent=codigo;
document.getElementById("dashState").textContent=codigo;
document.getElementById("heroState").textContent=codigo;
document.getElementById("monitorState").textContent=codigo;
document.getElementById("captionState").textContent=codigo;

const img=`${codigo}.png`;

document.getElementById("currentImage").src=img;

});

}
