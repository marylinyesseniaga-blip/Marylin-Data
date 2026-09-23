const $ = (s) => document.querySelector(s);

async function loadJSON(file) {
  const r = await fetch(file + "?v=" + Date.now());
  if (!r.ok) throw new Error(`No se pudo cargar ${file}`);
  return r.json();
}
function fmtDate(date,time){ if(!date)return "—"; return time?`${date} · ${time}`:date; }
function pct(value){ const n=Number(value); return Number.isFinite(n)?Math.max(0,Math.min(100,n)):0; }
function label(key){ return ({tiempo:"Tiempo",peso:"Peso",expansion:"Expansión",libertad:"Libertad",tension:"Tensión",movimiento:"Movimiento",contradiccion:"Contradicción",identidad:"Identidad"})[key] || key.replaceAll("_"," "); }
function getArchiveItems(data){ return Array.isArray(data)?data:(data&&Array.isArray(data.estados)?data.estados:[]); }
function stateNumber(value){ return Number(String(value||"").replace(/\D/g,""))||0; }
function renderForces(meta){
  const forces=meta.fuerzas_visuales||meta.fuerzas||{}; const order=["peso","tension","expansion","libertad","movimiento","contradiccion","identidad","tiempo"]; const el=$("#forces"); if(!el)return;
  el.innerHTML=order.filter(k=>Number.isFinite(Number(forces[k]))).map(k=>{const v=Number(forces[k]);return `<div class="force"><div class="force-head"><span>${label(k)}</span><strong>${v.toFixed(2)}</strong></div><div class="bar"><i style="width:${pct(v)}%"></i></div></div>`;}).join("");
}
function renderReading(meta){ const reading=meta&&meta.lectura;if(!reading)return; const set=(id,v)=>{const e=$(id);if(e)e.textContent=v;}; set("#readingTitle",`${reading.titulo||"LECTURA DEL ESTADO"} · ${meta.estado||""}`);set("#readingMethod",reading.metodo||"");set("#readingSummary",reading.resumen||"");set("#readingQuestion",reading.pregunta||""); const o=$("#readingObservations");if(o)o.innerHTML=(reading.observaciones||[]).map((x,i)=>`<div class="reading-observation"><span>${String(i+1).padStart(2,"0")}</span><p>${x}</p></div>`).join(""); const g=reading.geometria||{}; set("#geoDensity",g.densidad!==undefined?Number(g.densidad).toFixed(3):"—");set("#geoDispersion",g.dispersion!==undefined?Number(g.dispersion).toFixed(3):"—");set("#geoAsymmetry",g.asimetria_vertical!==undefined?Number(g.asimetria_vertical).toFixed(3):"—");set("#geoCenter",g.centro_x!==undefined&&g.centro_y!==undefined?`${Number(g.centro_x).toFixed(2)} / ${Number(g.centro_y).toFixed(2)}`:"—"); }

const EMBEDDED_META={"obra":"MARYLIN.DATA","version_sistema":"3.4","estado":"MD_0022","numero_estado":22,"fecha":"2026-09-22","hora":"18:38:55","seed":848509,"estado_sistema":"CONTRADICCIÓN ACTIVA","estados_registrados":22,"fuerzas_visuales":{"tiempo":14,"peso":90.75,"expansion":61.6667,"libertad":46,"tension":70.3333,"movimiento":46.25,"contradiccion":53.95,"contradiccion_heredada":53.2525,"identidad":67.3333},"memoria":{"contradiccion_heredada":53.2525,"contradiccion_acumulada":53.0204,"estados_con_memoria":21},"huella":{"cambio_absoluto_acumulado":1218,"movimientos_registrados":223,"intensidad_huella":0.054619,"pico_huella":0.2,"persistencia":1},"lectura":{"titulo":"LECTURA DEL ESTADO","resumen":"El estado combina baja densidad, asimetría contenida y una dispersión amplia del campo visual.","observaciones":["La estructura conserva baja compresión y mayor disponibilidad espacial.","La expansión permanece contenida y concentra el campo visual.","Las trayectorias conservan una organización relativamente estable.","El eje conserva una deriva limitada.","La oposición entre fuerzas no domina el estado.","La memoria reciente tiene una presencia visual reducida.","Los elementos ocupan un campo amplio y se dispersan fuera del núcleo."],"pregunta":"¿Qué parte de este estado pertenece a la experiencia actual y qué parte proviene de estados anteriores?","geometria":{"densidad":0.0548,"centro_x":0.5034,"centro_y":0.5357,"asimetia_vertical":0.2435,"dispersion":0.9386},"metodo":"Lectura formal derivada de las fuerzas del sistema y de medidas básicas de la imagen; no es una interpretación psicológica."}};
const EMBEDDED_ARCHIVE={"obra":"MARYLIN.DATA","actualizado":"2026-09-22 18:38:55","estados":Array.from({length:22},(_,i)=>({estado:`MD_${String(i+1).padStart(4,"0")}`,fecha:"",hora:"",resultado:"CONTRADICCIÓN ACTIVA",fragmento:`MD_${String(i+1).padStart(4,"0")}.png`}))};

function renderArchive(data){ const el=$("#archive");if(!el)return;const items=getArchiveItems(data).sort((a,b)=>stateNumber(b.estado)-stateNumber(a.estado));el.innerHTML=items.map(item=>`<div class="archive-item"><span class="archive-id">${item.estado||"—"}</span><span class="archive-state">${item.resultado||"ESTADO REGISTRADO"}</span><span class="archive-date">${fmtDate(item.fecha,item.hora)}</span><span class="archive-arrow muted-arrow">—</span></div>`).join(""); }

let ARCHIVE=[]; let CURRENT_META=EMBEDDED_META;
function renderHistoryScrubber(items,currentState){
  ARCHIVE=items.sort((a,b)=>stateNumber(a.estado)-stateNumber(b.estado));
  const range=$("#historyRange"), ticks=$("#historyTicks"); if(!range||!ticks)return;
  range.max=String(Math.max(1,ARCHIVE.length)); range.value=String(Math.max(1,stateNumber(currentState)||ARCHIVE.length));
  ticks.innerHTML=ARCHIVE.map((item,i)=>`<button type="button" data-index="${i+1}" class="history-tick ${item.estado===currentState?"active":""}" aria-label="Ver ${item.estado}">${String(i+1).padStart(2,"0")}</button>`).join("");
  const select=(n)=>selectHistoricalState(n);
  range.addEventListener("input",e=>select(Number(e.target.value)));
  ticks.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{const n=Number(b.dataset.index);range.value=String(n);select(n);}));
  select(Number(range.value));
}
function setText(id,value){const e=$(id);if(e)e.textContent=value??"—";}
function selectHistoricalState(n){
  const item=ARCHIVE[Math.max(0,Math.min(ARCHIVE.length-1,n-1))]; if(!item)return;
  const id=item.estado||`MD_${String(n).padStart(4,"0")}`; setText("#historySelected",id);setText("#historyDate",fmtDate(item.fecha,item.hora));setText("#historyStatus",item.resultado||"ESTADO REGISTRADO");
  document.querySelectorAll(".history-tick").forEach((b,i)=>b.classList.toggle("active",i===n-1));
  const img=$("#currentImage"); const cap=$("#captionState"); const time=$("#captionTime");
  if(cap)cap.textContent=id; if(time)time.textContent=fmtDate(item.fecha,item.hora);
  if(img){ img.classList.remove("history-missing"); img.alt=`Estado visual ${id} de MARYLIN.DATA`; img.src=(id===CURRENT_META.estado?(CURRENT_META.imagenes?.estado_actual||"estado_actual.png"):(item.fragmento||`${id}.png`)); img.onerror=()=>{img.onerror=null;img.classList.add("history-missing");img.src="data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='900' height='700' viewBox='0 0 900 700'><rect width='900' height='700' fill='#eeeae1'/><text x='450' y='330' text-anchor='middle' font-family='Arial' font-size='30' fill='#5d5a53'>${id}</text><text x='450' y='375' text-anchor='middle' font-family='Arial' font-size='17' fill='#77736b'>Fragmento histórico pendiente de publicación</text></svg>`);}; }
}

async function safeLoad(path,fallback){try{return await loadJSON(path);}catch(e){return fallback;}}
async function init(){
  try{
    const meta=await safeLoad("estado_actual_web.json",EMBEDDED_META);const archive=await safeLoad("archivo_estados.json",EMBEDDED_ARCHIVE);CURRENT_META=meta;
    const state=meta.estado||"—",date=meta.fecha||"—",time=meta.hora||"";window.MARYLIN_CURRENT_STATE=state;
    const mem=meta.memoria||{},huella=meta.huella||{},geometry=(meta.lectura&&meta.lectura.geometria)||{};
    const set=(id,v)=>{const e=$(id);if(e)e.textContent=v;};
    ["#heroState","#stateId","#dashState"].forEach(id=>set(id,state));set("#heroDate",date);set("#heroStatus",meta.estado_sistema||"—");set("#monitorState",state);set("#monitorStates",meta.estados_registrados??"—");set("#monitorMemory",mem.estados_con_memoria??"—");set("#monitorIntensity",huella.intensidad_huella!==undefined?Number(huella.intensidad_huella).toFixed(3):"—");set("#dashDate",fmtDate(date,time));set("#dashVersion",meta.version_sistema||"—");set("#dashSeed",meta.seed??"—");set("#dashMemory",mem.estados_con_memoria??"—");set("#dashIntensity",huella.intensidad_huella!==undefined?Number(huella.intensidad_huella).toFixed(3):"—");set("#geoDensity",geometry.densidad!==undefined?Number(geometry.densidad).toFixed(3):"—");set("#geoDispersion",geometry.dispersion!==undefined?Number(geometry.dispersion).toFixed(3):"—");set("#geoAsymmetry",geometry.asimetria_vertical!==undefined?Number(geometry.asimetria_vertical).toFixed(3):"—");set("#geoCenter",geometry.centro_x!==undefined&&geometry.centro_y!==undefined?`${Number(geometry.centro_x).toFixed(2)} / ${Number(geometry.centro_y).toFixed(2)}`:"—");set("#captionState",state);set("#captionTime",fmtDate(date,time));set("#systemStatus",meta.estado_sistema||"—");set("#footerVersion",`v${meta.version_sistema||"—"}`);set("#footerUpdated",fmtDate(date,time));
    renderForces(meta);set("#metricStates",meta.estados_registrados??"—");set("#metricMemoryStates",mem.estados_con_memoria??"—");set("#metricMoves",huella.movimientos_registrados??"—");set("#metricPersistence",huella.persistencia!==undefined?Number(huella.persistencia).toFixed(2):"—");set("#metricIntensity",huella.intensidad_huella!==undefined?Number(huella.intensidad_huella).toFixed(3):"—");renderReading(meta);renderArchive(archive);renderHistoryScrubber(getArchiveItems(archive),state);
  }catch(err){console.error(err);}
}
function initMotion(){const items=document.querySelectorAll('.section, .hero-monitor, .state-dash-card, .code-card, .anatomy-grid > div');items.forEach(el=>el.classList.add('reveal'));if(!('IntersectionObserver'in window)){items.forEach(el=>el.classList.add('is-visible'));return;}const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target);}}),{threshold:.08});items.forEach(el=>io.observe(el));}
initMotion();init();
