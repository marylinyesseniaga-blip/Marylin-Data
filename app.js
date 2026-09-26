
const $ = (s) => document.querySelector(s);

let history = [];

// =========================
// Cargar historial
// =========================
async function init() {
  try {
    const data = await fetch("./historial_estados.json?v=" + Date.now()).then(r => r.json());

    history = (data.estados || []).sort((a, b) => a.numero_estado - b.numero_estado);

    if (!history.length) return;

    renderTrajectory();
    updateState(history.length - 1);
    renderArchive(history);
    renderMemory(history);
    renderQuestions(history);
    renderExecution(history);
    initMotion();

  } catch (e) {
    console.error("Error cargando historial", e);
  }
}

// =========================
// Slider
// =========================
function renderTrajectory() {

  const slider = $("#historyRange");
  if (!slider) return;

  slider.min = 0;
  slider.max = history.length - 1;
  slider.step = 1;
  slider.value = history.length - 1;

  $("#historyStart").textContent = history[0].estado;
  $("#historyEnd").textContent = history.at(-1).estado;
  $("#historyCurrent").textContent = history.at(-1).estado;
  $("#historyDate").textContent = history.at(-1).fecha;

  slider.addEventListener("input", (e) => {
    updateState(Number(e.target.value));
  });
}

// =========================
// Cambiar estado
// =========================
function updateState(index) {

  const item = history[index];
  if (!item) return;

  // ----- Cabecera -----
  $("#heroState").textContent = item.estado;
  $("#heroDate").textContent = item.fecha;

  $("#dashState").textContent = item.estado;
  $("#dashDate").textContent = item.fecha;

  $("#stateId").textContent = item.estado;
  $("#monitorState").textContent = item.estado;

  $("#captionState").textContent = item.estado;
  $("#captionTime").textContent = item.fecha;

  $("#historyCurrent").textContent = item.estado;
  $("#historyDate").textContent = item.fecha;

  // ----- Imagen -----
  const img = $("#currentImage");
  if (img) {
    img.src = "./" + item.fragmento + "?v=" + Date.now();
    img.alt = item.estado;
  }

  // ----- KPIs -----
  $("#dashSeed").textContent = item.seed;
  $("#dashMemory").textContent = item.memoria.estados_con_memoria;
  $("#dashIntensity").textContent = item.huella.intensidad_huella.toFixed(3);

  $("#metricStates").textContent = item.estados_registrados;
  $("#dashStates").textContent = item.estados_registrados;
  $("#monitorStates").textContent = item.estados_registrados;

  $("#metricMoves").textContent = item.huella.movimientos_registrados;
  $("#metricPersistence").textContent = item.huella.persistencia.toFixed(2);

  // ----- Estado -----
  $("#heroStatus").textContent = item.estado_sistema;
  $("#systemStatus").textContent = item.estado_sistema;

  // ----- Geometría -----
  const g = item.lectura.geometria;

  $("#geoDensity").textContent = g.densidad.toFixed(3);
  $("#geoDispersion").textContent = g.dispersion.toFixed(3);
  $("#geoAsymmetry").textContent = g.asimetria_vertical.toFixed(3);
  $("#geoCenter").textContent = `${g.centro_x.toFixed(2)} / ${g.centro_y.toFixed(2)}`;

  // ----- Fuerzas -----
  renderForces(item.fuerzas_visuales);

  // ----- Lectura -----
  renderReading(item);
}

// =========================
// Fuerzas
// =========================
function renderForces(f) {

  const orden = [
    "peso",
    "tension",
    "expansion",
    "libertad",
    "movimiento",
    "contradiccion",
    "identidad",
    "tiempo"
  ];

  const nombres = {
    peso: "Peso",
    tension: "Tensión",
    expansion: "Expansión",
    libertad: "Libertad",
    movimiento: "Movimiento",
    contradiccion: "Contradicción",
    identidad: "Identidad",
    tiempo: "Tiempo"
  };

  $("#forces").innerHTML = orden.map(k => `
    <div class="force">
      <div class="force-head">
        <span>${nombres[k]}</span>
        <strong>${Number(f[k]).toFixed(2)}</strong>
      </div>
      <div class="bar">
        <i style="width:${Math.min(100, Number(f[k]))}%"></i>
      </div>
    </div>
  `).join("");
}

// =========================
// Lectura
// =========================
function renderReading(item) {

  $("#readingTitle").textContent = item.lectura.titulo + " · " + item.estado;

  $("#readingSummary").textContent = item.lectura.resumen;

  $("#readingQuestion").textContent = item.lectura.pregunta;

  const lista = $("#readingObservations");

  if (!lista) return;

  lista.innerHTML = item.lectura.observaciones.map((o, i) => `
    <div class="reading-observation">
      <span>${String(i + 1).padStart(2, "0")}</span>
      <p>${o}</p>
    </div>
  `).join("");
}

// =========================
// Archivo inferior
// =========================
function renderArchive(items) {

  const el = $("#archive");

  if (!el) return;

  el.innerHTML = items.map(x => `
    <div class="archive-item">
      <span class="archive-id">${x.estado}</span>
      <span class="archive-state">${x.estado_sistema}</span>
      <span class="archive-date">${x.fecha}</span>
      <span class="archive-arrow">→</span>
    </div>
  `).join("");
}

// =========================
// Stubs (ya existen en tu HTML)
// =========================
function renderMemory() {}
function renderQuestions() {}
function renderExecution() {}

// =========================
// Animaciones
// =========================
function initMotion() {

  const items = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    items.forEach(i => i.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

      if (entry.isIntersecting) {

        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);

      }

    });

  }, { threshold: .12 });

  items.forEach(i => io.observe(i));
}

init();
