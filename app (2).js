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
    tiempo: "Tiempo", peso: "Peso", expansion: "Expansión", libertad: "Libertad",
    tension: "Tensión", movimiento: "Movimiento", contradiccion: "Contradicción", identidad: "Identidad"
  };
  return names[key] || key.replaceAll("_", " ");
}

function getArchiveItems(data) {
  return Array.isArray(data) ? data : (data && Array.isArray(data.estados) ? data.estados : []);
}

function stateNumber(value) {
  return Number(String(value || "").replace(/\D/g, "")) || 0;
}

function renderForces(meta) {
  const forces = meta?.fuerzas_visuales || meta?.fuerzas || {};
  const order = ["peso","tension","expansion","libertad","movimiento","contradiccion","identidad","tiempo"];
  const el = $("#forces");
  if (!el) return;
  const rows = order.filter(k => Number.isFinite(Number(forces[k]))).map(k => {
    const v = Number(forces[k]);
    return `<div class="force"><div class="force-head"><span>${label(k)}</span><strong>${v.toFixed(2)}</strong></div><div class="bar"><i style="width:${pct(v)}%"></i></div></div>`;
  });
  el.innerHTML = rows.join("");
}

function renderReading(meta) {
  const reading = meta?.lectura;
  const set = (id, value) => { const el = $(id); if (el) el.textContent = value ?? "—"; };
  if (!reading) {
    set("#readingTitle", `LECTURA DEL ESTADO · ${meta?.estado || ""}`);
    set("#readingSummary", "Lectura histórica no disponible para este estado.");
    const obs = $("#readingObservations");
    if (obs) obs.innerHTML = "";
    set("#readingQuestion", "¿Qué permanece cuando un estado se convierte en memoria?");
    return;
  }
  set("#readingTitle", `${reading.titulo || "LECTURA DEL ESTADO"} · ${meta.estado || ""}`);
  set("#readingMethod", reading.metodo || "");
  set("#readingSummary", reading.resumen || "");
  const geometry = reading.geometria || {};
  set("#geoDensity", geometry.densidad !== undefined ? Number(geometry.densidad).toFixed(3) : "—");
  set("#geoDispersion", geometry.dispersion !== undefined ? Number(geometry.dispersion).toFixed(3) : "—");
  set("#geoAsymmetry", geometry.asimetria_vertical !== undefined ? Number(geometry.asimetria_vertical).toFixed(3) : (geometry.asimetria !== undefined ? Number(geometry.asimetria).toFixed(3) : "—"));
  set("#geoCenter", geometry.centro_x !== undefined && geometry.centro_y !== undefined ? `${Number(geometry.centro_x).toFixed(2)} / ${Number(geometry.centro_y).toFixed(2)}` : "—");
  const obs = $("#readingObservations");
  if (obs) obs.innerHTML = (reading.observaciones || []).map((item, i) => `<div class="reading-observation"><span>${String(i+1).padStart(2,"0")}</span><p>${item}</p></div>`).join("");
  set("#readingQuestion", reading.pregunta || "");
}

function renderTrajectory(data, currentState) {
  const items = getArchiveItems(data).slice().sort((a,b) => stateNumber(a.estado) - stateNumber(b.estado));
  const el = $("#trajectory");
  if (!el) return;
  if (!items.length) { el.innerHTML = `<p class="section-note">Todavía no hay trayectoria publicada.</p>`; return; }
  const first = $("#trajectoryFirst"), last = $("#trajectoryLast");
  if (first) first.textContent = items[0].estado || "—";
  if (last) last.textContent = items[items.length - 1].estado || "—";
  el.innerHTML = `<div class="trajectory-track">${items.map(item => `<div class="trajectory-node ${item.estado === currentState ? "current" : ""}"><div class="dot"></div><span class="state">${item.estado || "—"}</span><span class="date">${item.fecha || ""}</span></div>`).join("")}</div>`;
}

function renderArchive(data, currentState) {
  const el = $("#archive");
  if (!el) return;
  const items = getArchiveItems(data).slice().sort((a,b) => stateNumber(b.estado) - stateNumber(a.estado));
  if (!items.length) { el.innerHTML = `<p class="section-note">El archivo todavía no contiene estados publicados.</p>`; return; }
  el.innerHTML = items.map(item => {
    const img = item.fragmento || "";
    const available = !!img;
    return `<div class="archive-item ${available ? "has-image" : ""}"><span class="archive-id">${item.estado || "—"}</span><span class="archive-state">${item.resultado || "ESTADO REGISTRADO"}</span><span class="archive-date">${fmtDate(item.fecha, item.hora)}</span>${available ? `<a class="archive-arrow" href="${img}" target="_blank" rel="noopener" aria-label="Abrir ${item.estado}">↗</a>` : `<span class="archive-arrow muted-arrow">—</span>`}</div>`;
  }).join("");
}

const EMBEDDED_META = {"obra":"MARYLIN.DATA","version_sistema":"3.4","estado":"MD_0022","numero_estado":22,"fecha":"2026-09-22","hora":"18:38:55","seed":848509,"estado_sistema":"CONTRADICCIÓN ACTIVA","estados_registrados":22,"fuerzas_visuales":{"tiempo":14,"peso":90.75,"expansion":61.6667,"libertad":46,"tension":70.3333,"movimiento":46.25,"contradiccion":53.95,"identidad":67.3333},"memoria":{"contradiccion_heredada":53.2525,"contradiccion_acumulada":53.0204,"estados_con_memoria":21},"huella":{"cambio_absoluto_acumulado":1218,"movimientos_registrados":223,"intensidad_huella":0.054619,"pico_huella":0.2,"persistencia":1},"principio":"La identidad no se promedia: se acumula. Cada experiencia agrega un movimiento y los estados anteriores pueden deformar los posteriores."};
const EMBEDDED_ARCHIVE = {obra:"MARYLIN.DATA", estados:[]};

async function safeLoad(path, fallback) {
  try {
    const data = await loadJSON(path);
    console.info(`[MARYLIN.DATA] Cargado: ${path}`);
    return data;
  } catch(e) {
    console.warn(`[MARYLIN.DATA] No se pudo cargar ${path}`, e);
    return fallback;
  }
}

function normalizeHistoryData(data) {
  if (!data) return [];
  const items = getArchiveItems(data);
  return items.filter(item => item && item.estado).map(item => ({
    ...item,
    fuerzas_visuales: item.fuerzas_visuales || item.fuerzas || {},
    memoria: item.memoria || {},
    huella: item.huella || {},
    lectura: item.lectura || null
  }));
}

let HISTORY = [];
let CURRENT_META = EMBEDDED_META;

function ensureHistoryUI() {
  if ($("#historyRange")) return;
  const panel = $(".state-image-panel");
  const telemetry = $(".state-image-panel .telemetry");
  if (!panel || !telemetry) return;
  const box = document.createElement("div");
  box.className = "history-scrubber";
  box.id = "historyScrubber";
  box.innerHTML = `
    <div class="history-head"><span>ARCHIVO VIVO</span><strong id="historySelected">MD_0022</strong></div>
    <div class="history-meta"><span id="historyDate">—</span><span id="historyStatus">—</span></div>
    <input id="historyRange" type="range" min="1" max="1" value="1" step="1" aria-label="Recorrer estados históricos">
    <div class="history-scale"><span>MD_0001</span><div id="historyTicks" class="history-ticks"></div><span>MD_0022</span></div>
    <p class="history-hint">Desplaza para recorrer los estados. La imagen y el registro cambian con cada posición.</p>`;
  telemetry.insertAdjacentElement("afterend", box);

  if (!$("#historyStyle")) {
    const style = document.createElement("style");
    style.id = "historyStyle";
    style.textContent = `
      .history-scrubber{margin-top:14px;padding:12px 10px 9px;border-top:1px solid rgba(50,45,40,.22);background:rgba(255,255,255,.16)}
      .history-head,.history-meta{display:flex;justify-content:space-between;align-items:center;gap:12px;text-transform:uppercase;letter-spacing:.08em;font-size:8px}
      .history-head strong{font-size:12px;letter-spacing:.04em;color:#a66b00}
      .history-meta{margin-top:5px;color:#777;letter-spacing:.04em}
      #historyRange{width:100%;margin:11px 0 3px;accent-color:#b57a12;cursor:pointer}
      .history-scale{display:flex;align-items:center;gap:7px;font-size:7px;color:#777}
      .history-ticks{display:flex;justify-content:space-between;align-items:center;flex:1;gap:1px}
      .history-ticks button{border:0;background:transparent;padding:2px 1px;color:#8a857d;font:7px/1 Arial,sans-serif;cursor:pointer;min-width:14px}
      .history-ticks button:hover,.history-ticks button.active{color:#a66b00;font-weight:700}
      .history-hint{margin:8px 0 0;font-size:8px;line-height:1.35;color:#6d675f}
      @media(max-width:700px){.history-ticks button{font-size:6px;min-width:9px}.history-scale{gap:3px}}
    `;
    document.head.appendChild(style);
  }
}


function getHistoryItems(historyData, archiveData, currentMeta) {
  const source = getArchiveItems(historyData);
  if (source.length) return source.slice().sort((a,b) => stateNumber(a.estado) - stateNumber(b.estado));
  return getArchiveItems(archiveData).slice().sort((a,b) => stateNumber(a.estado) - stateNumber(b.estado)).map(item => item.estado === currentMeta.estado ? {...currentMeta, ...item} : item);
}

function updateHistorySlider(items, currentState) {
  const range = $("#historyRange");
  if (!range || !items.length) return;
  range.min = 1;
  range.max = items.length;
  const index = Math.max(0, items.findIndex(x => x.estado === currentState));
  range.value = index >= 0 ? index + 1 : items.length;
  const ticks = $("#historyTicks");
  if (ticks) ticks.innerHTML = items.map((item, i) => `<button type="button" data-history-index="${i}" title="${item.estado}">${stateNumber(item.estado)}</button>`).join("");
  ticks?.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => selectHistoryState(Number(btn.dataset.historyIndex))));
  range.oninput = () => selectHistoryState(Number(range.value) - 1);
}

function setText(id, value) { const el = $(id); if (el) el.textContent = value ?? "—"; }

function selectHistoryState(index) {
  if (!HISTORY.length) return;
  const item = HISTORY[Math.max(0, Math.min(HISTORY.length - 1, index))];
  CURRENT_META = item;
  window.MARYLIN_CURRENT_STATE = item.estado;

  setText("#heroState", item.estado);
  setText("#heroDate", item.fecha || "—");
  setText("#heroStatus", item.estado_sistema || item.resultado || "—");
  setText("#stateId", item.estado);
  setText("#monitorState", item.estado);
  setText("#monitorStates", item.estados_registrados ?? HISTORY.length);
  setText("#monitorMemory", item.memoria?.estados_con_memoria ?? Math.max(0, stateNumber(item.estado)-1));
  setText("#monitorIntensity", item.huella?.intensidad_huella !== undefined ? Number(item.huella.intensidad_huella).toFixed(3) : "—");
  setText("#dashState", item.estado);
  setText("#dashDate", fmtDate(item.fecha, item.hora));
  setText("#dashVersion", item.version_sistema || "—");
  setText("#dashSeed", item.seed ?? "—");
  setText("#dashMemory", item.memoria?.estados_con_memoria ?? Math.max(0, stateNumber(item.estado)-1));
  setText("#dashIntensity", item.huella?.intensidad_huella !== undefined ? Number(item.huella.intensidad_huella).toFixed(3) : "—");
  setText("#captionState", item.estado);
  setText("#captionTime", fmtDate(item.fecha, item.hora));
  setText("#systemStatus", item.estado_sistema || item.resultado || "—");
  setText("#footerVersion", `v${item.version_sistema || "—"}`);
  setText("#footerUpdated", fmtDate(item.fecha, item.hora));
  setText("#metricStates", item.estados_registrados ?? HISTORY.length);
  setText("#metricMemoryStates", item.memoria?.estados_con_memoria ?? Math.max(0, stateNumber(item.estado)-1));
  setText("#metricMoves", item.huella?.movimientos_registrados ?? "—");
  setText("#metricMoves2", item.huella?.movimientos_registrados ?? "—");
  setText("#metricChange", item.huella?.cambio_absoluto_acumulado ?? "—");
  setText("#metricPeak", item.huella?.pico_huella !== undefined ? Number(item.huella.pico_huella).toFixed(2) : "—");
  setText("#metricPersistence", item.huella?.persistencia !== undefined ? Number(item.huella.persistencia).toFixed(2) : "—");
  setText("#metricPersistence2", item.huella?.persistencia !== undefined ? Number(item.huella.persistencia).toFixed(2) : "—");
  setText("#metricIntensity", item.huella?.intensidad_huella !== undefined ? Number(item.huella.intensidad_huella).toFixed(3) : "—");

  const img = $("#currentImage");
  if (img) {
    const src = item.fragmento || (item.imagenes?.estado_actual) || (item.estado === EMBEDDED_META.estado ? "estado_actual.png" : "");
    if (src) { img.src = src + (src.includes("?") ? "&" : "?") + "v=" + Date.now(); img.alt = `Fragmento visual ${item.estado}`; }
  }

  renderForces(item);
  renderReading(item);
  renderTrajectory({estados:HISTORY}, item.estado);
  renderArchive({estados:HISTORY}, item.estado);

  const range = $("#historyRange");
  if (range) range.value = index + 1;
  const selected = $("#historySelected");
  if (selected) selected.textContent = item.estado;
  const date = $("#historyDate");
  if (date) date.textContent = fmtDate(item.fecha, item.hora);
  const status = $("#historyStatus");
  if (status) status.textContent = item.estado_sistema || item.resultado || "ESTADO REGISTRADO";
  $("#historyTicks")?.querySelectorAll("button").forEach((btn, i) => btn.classList.toggle("active", i === index));
}

async function init() {
  ensureHistoryUI();
  try {
    const meta = await safeLoad("estado_actual_web.json", EMBEDDED_META);
    const archive = await safeLoad("archivo_estados.json", EMBEDDED_ARCHIVE);
    const history = await safeLoad("historial_estados.json", null);
    CURRENT_META = meta;
    const normalizedHistory = normalizeHistoryData(history);
    HISTORY = normalizedHistory.length ? normalizedHistory : getHistoryItems(null, archive, meta);
    if (!HISTORY.length) HISTORY = [meta];

    const currentIndex = Math.max(0, HISTORY.findIndex(x => x.estado === meta.estado));
    updateHistorySlider(HISTORY, meta.estado);
    selectHistoryState(currentIndex >= 0 ? currentIndex : HISTORY.length - 1);

    const range = $("#historyRange");
    if (range) range.value = currentIndex + 1;
  } catch (err) {
    console.error(err);
    document.body.insertAdjacentHTML("afterbegin", `<div style="padding:12px 18px;background:#151515;color:#fff;font:12px monospace">No fue posible cargar los datos públicos. Si estás probando el sitio localmente, ábrelo mediante un servidor web local.</div>`);
  }
}

function initMotion() {
  const items = document.querySelectorAll('.section, .hero-monitor, .state-dash-card, .code-card, .anatomy-grid > div');
  items.forEach(el => el.classList.add('reveal'));
  if (!('IntersectionObserver' in window)) { items.forEach(el => el.classList.add('is-visible')); return; }
  const io = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); } }); }, { threshold: 0.08 });
  items.forEach(el => io.observe(el));
}

initMotion();
init();

