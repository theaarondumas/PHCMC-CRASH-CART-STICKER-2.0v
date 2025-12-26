/* Crash Cart Batch (4 carts) + LIVE sticker preview + sticker snapshot in submissions */

const CARTS = ["CC-01","CC-02","CC-03","CC-04"];
const STORE_KEY = "crashCartBatch_v3";

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
  }catch{
    return null;
  }
}

function saveStore(data){
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function freshStore(){
  return {
    profile: { techName: "", deptName: "" },
    activeRound: {
      date: todayISO(),
      startedAt: Date.now(),
      carts: { "CC-01": null, "CC-02": null, "CC-03": null, "CC-04": null }
    },
    submissions: []
  };
}

function getStore(){
  const s = loadStore() || freshStore();
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

function setText(id, val){
  const el = $(id);
  if(!el) return;
  const v = (val && String(val).trim()) ? String(val).trim() : "—";
  el.textContent = v;
}

/* ✅ Read/Fill all inputs (Yellow + Orange) */
function readForm(){
  return {
    // Yellow
    firstSupplyExp: $("firstSupplyExp").value.trim(),
    yellowCheckDoneOn: $("yellowCheckDoneOn").value || "",

    // Orange
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
  // Yellow
  $("firstSupplyExp").value = data?.firstSupplyExp || "";
  $("yellowCheckDoneOn").value = data?.yellowCheckDoneOn || "";

  // Orange
  $("firstDrugExp").value = data?.firstDrugExp || "";
  $("drugName").value = data?.drugName || "";
  $("lockNumber").value = data?.lockNumber || "";
  $("checkDoneOn").value = data?.checkDoneOn || "";
  $("initials").value = data?.initials || "";
  $("status").value = data?.status || "OK";
  $("notes").value = data?.notes || "";
}

/* ✅ Sticker snapshot uses Yellow + Orange fields */
function buildStickerSnapshot(store, cartId){
  const cartData = store.activeRound.carts[cartId] || {};
  const tech = ($("techName").value || store.profile.techName || "").trim();
  const live = readForm();

  const firstSupplyExp     = (live.firstSupplyExp     || cartData.firstSupplyExp     || "").trim();
  const yellowCheckDoneOn  = (live.yellowCheckDoneOn  || cartData.yellowCheckDoneOn  || "").trim();

  const firstDrugExp = (live.firstDrugExp || cartData.firstDrugExp || "").trim();
  const drugName     = (live.drugName     || cartData.drugName     || "").trim();
  const lockNumber   = (live.lockNumber   || cartData.lockNumber   || "").trim();
  const checkDoneOn  = (live.checkDoneOn  || cartData.checkDoneOn  || "").trim();
  const initials     = (live.initials     || cartData.initials     || "").trim();

  return {
    yellow: {
      firstSupply: firstSupplyExp || "—",
      date: store.activeRound.date || todayISO(),
      checkDone: yellowCheckDoneOn || "—",
      tech: tech || "—"
    },
    orange: {
      firstDrugExp: firstDrugExp || "—",
      drugName: drugName || "—",
      lockNumber: lockNumber || "—",
      checkDoneOn: checkDoneOn || "—",
      initials: initials || "—"
    }
  };
}

function updateStickerPreview(){
  const store = getStore();
  const cartId = $("cartId").value;
  const cartData = store.activeRound.carts[cartId] || {};
  const live = readForm();

  const tech = ($("techName").value || store.profile.techName || "").trim();

  // Yellow sticker preview
  setText("pv_firstSupply", live.firstSupplyExp || cartData.firstSupplyExp || "");
  setText("pv_date", store.activeRound.date);
  setText("pv_checkDone", live.yellowCheckDoneOn || cartData.yellowCheckDoneOn || "");
  setText("pv_tech", tech);

  // Orange sticker preview
  setText("pv_firstDrugExp", live.firstDrugExp || cartData.firstDrugExp || "");
  setText("pv_drugName", live.drugName || cartData.drugName || "");
  setText("pv_lockNumber", live.lockNumber || cartData.lockNumber || "");
  setText("pv_orangeCheckDoneOn", live.checkDoneOn || cartData.checkDoneOn || "");
  setText("pv_initials", live.initials || cartData.initials || "");

  // stamps
  $("yellowStamp").textContent = `Yellow • ${nowStamp()}`;
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

function cartSummary(data){
  if(!data) return "Not saved";
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

  const cartId = $("cartId").value;
  const data = store.activeRound.carts[cartId];

  $("cartStamp").textContent = `${cartId} • ${data ? "Saved: " + cartSummary(data) : "Not saved yet"} • ${nowStamp()}`;

  fillForm(data || null);

  updateStickerPreview();
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

  // PHI guardrail
  const combined = JSON.stringify(payload).toLowerCase();
  if(combined.includes("mrn") || combined.includes("medical record") || combined.includes("dob")){
    setStatus("⚠️ PHI detected (mrn/dob). Remove it and save again.");
    return;
  }

  const sticker = buildStickerSnapshot(store, cartId);

  store.activeRound.carts[cartId] = {
    ...payload,
    savedAt: Date.now(),
    cartId,
    sticker
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

  // ensure sticker snapshots exist at submit time
  CARTS.forEach(id => {
    const cart = store.activeRound.carts[id];
    if(cart){
      cart.sticker = cart.sticker || buildStickerSnapshot(store, id);
    }
  });

  const roundCopy = structuredClone(store.activeRound);
  roundCopy.techName = store.profile.techName;
  roundCopy.deptName = store.profile.deptName;
  roundCopy.submittedAt = Date.now();

  store.submissions.unshift({ submittedAt: Date.now(), round: roundCopy });

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
  // default dates
  $("checkDoneOn").value = todayISO();
  $("yellowCheckDoneOn").value = todayISO();

  const store = getStore();
  saveStore(store);

  $("cartId").addEventListener("change", render);

  $("techName").addEventListener("blur", () => { persistProfile(); setStatus("Saved your name."); updateStickerPreview(); });
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

  // live preview updates while typing (Yellow + Orange)
  const liveIds = [
    "firstSupplyExp","yellowCheckDoneOn",
    "firstDrugExp","drugName","lockNumber","checkDoneOn","initials","notes","status"
  ];
  liveIds.forEach(id => {
    const el = $(id);
    if(el){
      el.addEventListener("input", updateStickerPreview);
      el.addEventListener("change", updateStickerPreview);
    }
  });
  $("techName").addEventListener("input", updateStickerPreview);

  render();
}

document.addEventListener("DOMContentLoaded", init);
