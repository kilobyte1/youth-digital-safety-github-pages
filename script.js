const $ = (id) => document.getElementById(id);

function getBrowser() {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "Microsoft Edge";
  if (/OPR\//.test(ua)) return "Opera";
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return "Google Chrome";
  if (/Firefox\//.test(ua)) return "Mozilla Firefox";
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
  return "Other / unknown";
}

function getOS() {
  const ua = navigator.userAgent;
  if (/Windows NT/i.test(ua)) return "Windows";
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS / iPadOS";
  if (/Mac OS X/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "Other / unknown";
}

function getDevice() {
  if (/Mobi|Android/i.test(navigator.userAgent)) return "Mobile";
  if (/Tablet|iPad/i.test(navigator.userAgent)) return "Tablet";
  return "Desktop / laptop";
}

function connectionInfo() {
  const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!c) return "Not exposed by this browser";
  const parts = [];
  if (c.effectiveType) parts.push(c.effectiveType.toUpperCase());
  if (c.saveData) parts.push("Data Saver enabled");
  return parts.length ? parts.join(" · ") : "Connection API available";
}

function fact(label, value) {
  const div = document.createElement("div");
  div.className = "fact";
  div.innerHTML = `<div class="label">${label}</div><div class="value"></div>`;
  div.querySelector(".value").textContent = value;
  return div;
}

function collectSafeBrowserInfo() {
  return [
    ["Device", getDevice()],
    ["Browser", getBrowser()],
    ["Operating system", getOS()],
    ["Screen", `${screen.width} × ${screen.height}`],
    ["Time zone", Intl.DateTimeFormat().resolvedOptions().timeZone || "Not exposed"],
    ["Language", navigator.language || "Not exposed"],
    ["Touch support", ("ontouchstart" in window || navigator.maxTouchPoints > 0) ? "Detected" : "Not detected"],
    ["Connection", connectionInfo()]
  ];
}

function show(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $(id).classList.add("active");
}

let facts = collectSafeBrowserInfo();

setTimeout(() => {
  const container = $("facts");
  facts.forEach(([label, value]) => container.appendChild(fact(label, value)));
  show("info");
}, 2200);

$("continueBtn").addEventListener("click", () => show("reveal"));
$("socialBtn").addEventListener("click", () => show("lesson"));
