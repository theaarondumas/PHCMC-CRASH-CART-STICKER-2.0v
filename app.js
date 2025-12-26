/* Crash Cart Batch (4 carts) - localStorage only - GitHub Pages friendly */

const CARTS = ["CC-01","CC-02","CC-03","CC-04"];
const STORE_KEY = "crashCartBatch_v1";

const $ = (id) => document.getElementById(id);

function todayISO(){
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd}`;
}

function nowStamp(){
  return new Date().toLocaleString();
}

function loadStore(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(!raw) return null;
    return JSON.parse(raw);
  }catch(e){
    return null;
  }
}

function saveStore(data){
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function freshStore(){
  return {
    profile: {
      techName: "",
      deptName: ""
    },
    activeRound: {
      date: todayISO(),
      startedAt: Date.now(),
      carts: {
        "CC-01": null,
        "CC-02": null,
        "CC-03": null,
        "CC-04": null
      }
    },
    submissions: [] // {submittedAt, round}
  };
}

function getStore(){
  const s = loadStore();
  if(!s) return freshStore();

  // If date changed, auto-start a new round for today (keeps submissions)
  if(s.activeRound?.date !== todayISO()){
    s.activeRound = {
      date: todayISO(),
      startedAt: Date.now(),
      carts: { "CC-01": null, "CC-02": null, "CC-03": null, "CC-04": null }
    };
  }
  return s;
}

function setStatus(msg){
  $("statusMsg").textContent = msg;
}

function buildProgressChecks(store){
  const box = $("progressChecks");
  box.innerHTML = "";

  CARTS.forEach(cartId => {
    const item = document.createElement("label");
    item.className = "chk";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.disabled = true;
    input.checked = !!store.activeRound.carts[cartId];

    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = cartId;

    item.appendChild(input);
    item.appendChild(tag);
    box.appendChild(item);
  });
}

function readForm(){
  return {
    firstDrugExp: $("firstDrugExp").value.trim(),
    drugName: $("drugName").value.trim(),
    lockNumber: $("lockNumber").value.trim(),
    checkDoneOn: $("checkDoneOn").value || "",
    initials: $("initials").value.trim(),
    status: $("status").value,
    notes: $("notes").value.trim()
  };
}

function fillForm(data){
  $("firstDrugExp").value = data?.firstDrugExp || "";
  $("drugName").value = data?.drugName || "";
  $("lockNumber").value = data?.lockNumber || "";
  $("checkDoneOn").value = data?.checkDoneOn || "";
  $("initials").value = data?.initials || "";
  $("status").value = data?.status || "OK";
  $("notes").value = data?.notes || "";
}

function cartSummary(data){
  if(!data) return "Empty";
  const parts = [];
  if(data.status) parts.push(data.status);
  if(data.lockNumber) parts.push(`Lock ${data.lockNumber}`);
  if(data.initials) parts.push(data.initials);
  return parts.join(" • ") || "Saved";
}

function render(){
  const store = getStore();
  saveStore(store);

  $("todayStamp").textContent = `Today: ${store.activeRound.date}`;
  $("techName").value = store.profile.techName || "";
  $("deptName").value = store.profile.deptName || "";

  buildProgressChecks(store);

  const currentCart = $("cartId").value;
  const data = store.activeRound.carts[currentCart];
  $("cartStamp").textContent = `${currentCart} • ${data ? "Saved: " + cartSummary(data) : "Not saved yet"} • ${nowStamp()}`;

  // Load cart data into the form
  fillForm(data || null);
}

function persistProfile(){
  const store = getStore();
  store.profile.techName = $("techName").value.trim();
  store.profile.deptName = $("deptName").value.trim();
  saveStore(store);
}

function saveCurrentCart(){
  persistProfile();

  const store = getStore();
  const cartId = $("cartId").value;

  const payload = readForm();

  // tiny guardrail: no MRN keywords (basic)
  const combined = JSON.stringify(payload).toLowerCase();
  if(combined.includes("mrn") || combined.includes("medical record") || combined.includes("dob")){
    setStatus("⚠️ PHI detected (mrn/dob). Remove it and save again.");
    return;
  }

  store.activeRound.carts[cartId] = {
    ...payload,
    savedAt: Date.now(),
    cartId
  };
  saveStore(store);

  setStatus(`✅ Saved ${cartId}.`);
  render();
}

function nextCart(){
  const idx = CARTS.indexOf($("cartId").value);
  const next = CARTS[(idx + 1) % CARTS.length];
  $("cartId").value = next;
  render();
}

function clearCurrentCart(){
  const store = getStore();
  const cartId = $("cartId").value;
  store.activeRound.carts[cartId] = null;
  saveStore(store);
  setStatus(`Cleared ${cartId}.`);
  render();
}

function resetRound(){
  const store = getStore();
  store.activeRound = {
    date: todayISO(),
    startedAt: Date.now(),
    carts: { "CC-01": null, "CC-02": null, "CC-03": null, "CC-04": null }
  };
  saveStore(store);
  setStatus("Round reset.");
  render();
}

function allCartsDone(store){
  return CARTS.every(id => !!store.activeRound.carts[id]);
}

function submitBatch(){
  persistProfile();
  const store = getStore();

  if(!store.profile.techName){
    setStatus("Add your name (CS Tech) before submitting.");
    return;
  }

  if(!allCartsDone(store)){
    setStatus("⚠️ Not all 4 carts are saved. Save each cart first.");
    return;
  }

  const roundCopy = structuredClone(store.activeRound);
  roundCopy.techName = store.profile.techName;
  roundCopy.deptName = store.profile.deptName;
  roundCopy.submittedAt = Date.now();

  store.submissions.unshift({
    submittedAt: Date.now(),
    round: roundCopy
  });

  // start a fresh round after submit
  store.activeRound = {
    date: todayISO(),
    startedAt: Date.now(),
    carts: { "CC-01": null, "CC-02": null, "CC-03": null, "CC-04": null }
  };

  saveStore(store);

  setStatus("🚀 Batch submitted. Opening dashboard...");
  render();

  window.open("dashboard.html", "_blank");
}

function init(){
  // default check date today
  $("checkDoneOn").value = todayISO();

  // build store if missing
  const store = getStore();
  saveStore(store);

  // events
  $("cartId").addEventListener("change", render);

  $("techName").addEventListener("blur", () => { persistProfile(); setStatus("Saved your name."); });
  $("deptName").addEventListener("blur", () => { persistProfile(); setStatus("Saved department."); });

  $("btnSaveCart").addEventListener("click", saveCurrentCart);
  $("btnNextCart").addEventListener("click", nextCart);
  $("btnClearCart").addEventListener("click", clearCurrentCart);
  $("btnResetRound").addEventListener("click", () => {
    if(confirm("Reset this round? This clears all 4 carts for today.")) resetRound();
  });
  $("btnSubmitBatch").addEventListener("click", () => {
    if(confirm("Submit batch for all 4 carts? This will save a record and start a fresh round.")) submitBatch();
  });

  $("btnOpenDashboard").addEventListener("click", () => window.open("dashboard.html","_blank"));

  render();
}

document.addEventListener("DOMContentLoaded", init);
