const STORE_KEY = "crashCartBatch_v3";
const CARTS = ["CC-01","CC-02","CC-03","CC-04"];
const $ = (id) => document.getElementById(id);

function loadStore(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch{
    return null;
  }
}

function fmt(ts){
  try{ return new Date(ts).toLocaleString(); }catch{ return "—"; }
}

function badge(status){
  if(status === "OK") return "🟢 OK (Sealed)";
  if(status === "OPENED") return "🟡 Opened";
  if(status === "MISSING") return "🔴 Missing";
  return "⚪ Unknown";
}

function safe(v){
  const s = (v == null ? "" : String(v));
  return s.replaceAll("<","&lt;").replaceAll(">","&gt;");
}

function makeCard(cartId, data){
  const wrap = document.createElement("div");
  wrap.className = "dash-card field full";

  const title = document.createElement("div");
  title.className = "dash-title";
  title.textContent = `${cartId} — ${badge(data?.status)}`;

  const y = data?.sticker?.yellow || {};
  const o = data?.sticker?.orange || {};

  const lines = [
    `<div><b>Sticker (Yellow)</b></div>`,
    `<div>First supply: ${safe(y.firstSupply || "—")}</div>`,
    `<div>Date: ${safe(y.date || "—")}</div>`,
    `<div>Check done: ${safe(y.checkDone || "—")}</div>`,
    `<div>Tech: ${safe(y.tech || "—")}</div>`,
    `<div style="margin-top:8px"><b>Sticker (Orange)</b></div>`,
    `<div>First Drug Exp: ${safe(o.firstDrugExp || "—")}</div>`,
    `<div>Drug: ${safe(o.drugName || "—")}</div>`,
    `<div>Lock #: ${safe(o.lockNumber || "—")}</div>`,
    `<div>Check done on: ${safe(o.checkDoneOn || "—")}</div>`,
    `<div>Initials: ${safe(o.initials || "—")}</div>`,
    `<div style="margin-top:8px">Notes: ${safe(data?.notes || "—")}</div>`,
    `<div>Saved At: ${data?.savedAt ? safe(fmt(data.savedAt)) : "—"}</div>`
  ];

  const body = document.createElement("div");
  body.className = "dash-lines";
  body.innerHTML = lines.join("");

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
