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

function getArchiveItems(data){

  if(Array.isArray(data)) return data;

  if(data?.estados) return data.estados;

  if(data?.historial) return data.historial;

  return [];
}

function stateNumber(value) {
  return Number(String(value || "").replace(/\D/g,"")) || 0;
}
function renderTrajectory(data){

    const items = getArchiveItems(data)
        .sort((a,b)=>stateNumber(a.estado)-stateNumber(b.estado));

    if(!items.length) return;

    const range=$("#historyRange");
    const current=$("#historyCurrent");
    const start=$("#historyStart");
    const end=$("#historyEnd");
    const date=$("#historyDate");

    range.max=items.length-1;
    const ultimo=items.findIndex(x=>x.estado===$("#heroState")?.textContent);range.value=ultimo>=0?ultimo:items.length-1;

    start.textContent=items[0].estado;
    end.textContent=items[items.length-1].estado;

    updateState(items.length-1);

    range.oninput=(e)=>{
        updateState(Number(e.target.value));
    };

}
function updateState(i){
function updateState(i){

    const item = items[i];
    const meta = item;

// ---------- KPIs ----------
$("#dashSeed").textContent = meta.seed ?? "—";
$("#dashMemory").textContent =
  meta.memoria?.estados_con_memoria ?? "—";
$("#dashIntensity").textContent =
  meta.huella?.intensidad_huella?.toFixed?.(3) ?? "—";

$("#metricMoves").textContent =
  meta.huella?.movimientos_registrados ?? "—";

$("#metricPersistence").textContent =
  meta.huella?.persistencia?.toFixed?.(2) ?? "—";

// ---------- Geometría ----------
$("#geoDensity").textContent =
  meta.lectura?.geometria?.densidad?.toFixed?.(3) ?? "—";

$("#geoDispersion").textContent =
  meta.lectura?.geometria?.dispersion?.toFixed?.(3) ?? "—";

$("#geoAsymmetry").textContent =
  meta.lectura?.geometria?.asimetria_vertical?.toFixed?.(3) ?? "—";

$("#geoCenter").textContent =
  `${meta.lectura?.geometria?.centro_x?.toFixed?.(2) ?? "—"} / ${meta.lectura?.geometria?.centro_y?.toFixed?.(2) ?? "—"}`;

// ---------- Estado ----------
$("#heroStatus").textContent =
  meta.estado_sistema || meta.resultado || "—";

$("#systemStatus").textContent =
  meta.estado_sistema || meta.resultado || "—";

// ---------- Fuerzas ----------
renderForces(meta);

// ---------- Lectura ----------
renderReading(meta);
    current.textContent = item.estado;
    date.textContent = item.fecha;

    // ---------- CABECERA ----------
    $("#heroState").textContent = item.estado;
    $("#heroDate").textContent = item.fecha;

    $("#dashState").textContent = item.estado;
    $("#stateId").textContent = item.estado;
    $("#monitorState").textContent = item.estado;
    $("#captionState").textContent = item.estado;
    $("#captionTime").textContent = item.fecha;
    $("#dashDate").textContent = item.fecha;

    // ---------- CONTADOR ----------
    $("#metricStates").textContent = i + 1;
    $("#monitorStates").textContent = i + 1;
    $("#dashStates").textContent = i + 1;

    // ---------- IMAGEN ----------
    const img = $("#currentImage");

if(img){
    img.src = item.fragmento + "?v=" + Date.now();
    img.alt = item.estado;
}

$("#heroState").textContent = item.estado;
$("#dashState").textContent = item.estado;
$("#stateId").textContent = item.estado;
$("#monitorState").textContent = item.estado;

$("#heroDate").textContent = item.fecha;
$("#dashDate").textContent = item.fecha;
$("#captionTime").textContent = item.fecha;

$("#metricStates").textContent = i + 1;
$("#monitorStates").textContent = i + 1;
$("#dashStates").textContent = i + 1;

renderForces(meta);
renderReading(meta);
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
