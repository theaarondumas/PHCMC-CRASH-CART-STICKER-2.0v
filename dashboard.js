const STORE_KEY = "crashCartBatch_v1";
const CARTS = ["CC-01","CC-02","CC-03","CC-04"];
const $ = (id) => document.getElementById(id);

function loadStore(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch(e){
    return null;
  }
}

function fmt(ts){
  try{ return new Date(ts).toLocaleString(); }catch(e){ return "—"; }
}

function badge(status){
  if(status === "OK") return "🟢 OK (Sealed)";
  if(status === "OPENED") return "🟡 Opened";
  if(status === "MISSING") return "🔴 Missing";
  return "⚪ Unknown";
}

function makeCard(cartId, data){
  const wrap = document.createElement("div");
  wrap.className = "field full";
  wrap.style.padding = "12px";
  wrap.style.borderRadius = "14px";
  wrap.style.border = "1px solid rgba(255,255,255,.10)";
  wrap.style.background = "rgba(0,0,0,.20)";

  const title = document.createElement("div");
  title.style.fontWeight = "900";
  title.style.marginBottom = "8px";
  title.textContent = `${cartId} — ${badge(data?.status)}`;

  const lines = [
    `First Drug Exp: ${data?.firstDrugExp || "—"}`,
    `Drug Name: ${data?.drugName || "—"}`,
    `Lock #: ${data?.lockNumber || "—"}`,
    `Checked On: ${data?.checkDoneOn || "—"}`,
    `Initials: ${data?.initials || "—"}`,
    `Notes: ${data?.notes || "—"}`,
    `Saved At: ${data?.savedAt ? fmt(data.savedAt) : "—"}`
  ];

  const body = document.createElement("div");
  body.style.color = "rgba(232,238,247,.85)";
  body.style.fontSize = "14px";
  body.style.lineHeight = "1.5";
  body.innerHTML = lines.map(s => `<div>${s.replaceAll("<","&lt;")}</div>`).join("");

  wrap.appendChild(title);
  wrap.appendChild(body);
  return wrap;
}

function render(){
  const store = loadStore();
  const cards = $("cards");
  cards.innerHTML = "";
  $("emptyMsg").textContent = "";

  if(!store || !store.submissions || store.submissions.length === 0){
    $("dashMeta").textContent = "No batch submitted yet. Go back and submit a batch.";
    $("dashUpdated").textContent = "—";
    $("emptyMsg").textContent = "Nothing to display.";
    return;
  }

  const latest = store.submissions[0];
  const round = latest.round;

  $("dashUpdated").textContent = `Updated: ${fmt(latest.submittedAt)}`;
  $("dashMeta").textContent = `Date: ${round.date} • Tech: ${round.techName || "—"} • Dept: ${round.deptName || "—"}`;

  CARTS.forEach(id => {
    const data = round.carts?.[id];
    cards.appendChild(makeCard(id, data));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  $("btnRefresh").addEventListener("click", render);
  $("btnBack").addEventListener("click", () => window.location.href = "index.html");
  render();
});
