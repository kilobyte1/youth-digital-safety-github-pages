const cfg = window.DEMO_CONFIG || {};

function browser() {
  const u = navigator.userAgent;

  // Microsoft Edge
  if (/EdgA\//.test(u)) return "Microsoft Edge (Android)";
  if (/EdgiOS\//.test(u)) return "Microsoft Edge (iOS)";
  if (/Edg\//.test(u)) return "Microsoft Edge";

  // Opera
  if (/OPR\//.test(u)) return "Opera";
  if (/Opera Mini/i.test(u)) return "Opera Mini";

  // Firefox
  if (/FxiOS\//.test(u)) return "Firefox (iOS)";
  if (/Firefox\//.test(u)) return "Firefox";

  // Samsung Internet
  if (/SamsungBrowser\//.test(u)) return "Samsung Internet";

  // Brave
  if (navigator.brave && /Chrome\//.test(u)) return "Brave";

  // Chrome
  if (/CriOS\//.test(u)) return "Google Chrome (iOS)";
  if (/Chrome\//.test(u)) return "Google Chrome";

  // Safari
  if (/Safari\//.test(u)) return "Safari";

  return "Other";
}

function os() {
  const u = navigator.userAgent;
  if (/Windows NT/i.test(u)) return "Windows";
  if (/Android/i.test(u)) return "Android";
  if (/iPhone|iPad|iPod/i.test(u)) return "iOS / iPadOS";
  if (/Mac OS X/i.test(u)) return "macOS";
  if (/Linux/i.test(u)) return "Linux";
  return "Other";
}

function device() {
  return /Mobi|Android/i.test(navigator.userAgent)
    ? "Mobile"
    : /iPad|Tablet/i.test(navigator.userAgent)
      ? "Tablet"
      : "Desktop / laptop";
}

function connection() {
  const c =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  return c?.effectiveType?.toUpperCase() || "Not exposed";
}

// -----------------------------------------------------------------
// Helper: Fetch IP, ISP, and Location metadata via ipapi.co
// -----------------------------------------------------------------
async function fetchIpDetails() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) throw new Error("IP fetch failed");
    const data = await res.json();
    return {
      ip: data.ip || "Not detected",
      isp: data.org || data.asn || "Unknown ISP",
      city: data.city || "Unknown",
      region: data.region || "Unknown",
      country: data.country_name || "Unknown",
      latitude: data.latitude || null,
      longitude: data.longitude || null,
    };
  } catch (_) {
    return {
      ip: "Blocked/Unavailable",
      isp: "Unknown",
      city: "Unknown",
      region: "Unknown",
      country: "Unknown",
      latitude: null,
      longitude: null,
    };
  }
}

// -----------------------------------------------------------------
// Helper: Fetch Battery Level and Charging Status
// -----------------------------------------------------------------
async function fetchBatteryDetails() {
  if (typeof navigator.getBattery === "function") {
    try {
      const b = await navigator.getBattery();
      return {
        level: Math.round(b.level * 100) + "%",
        charging: b.charging ? "Yes" : "No",
      };
    } catch (_) {}
  }
  return { level: "Not exposed", charging: "Not exposed" };
}

// -----------------------------------------------------------------
// Helper: Detect Camera / Microphone Hardware Presence
// -----------------------------------------------------------------
async function fetchMediaHardware() {
  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCam = devices.some((d) => d.kind === "videoinput");
      const hasMic = devices.some((d) => d.kind === "audioinput");
      return `Camera: ${hasCam ? "Detected" : "None"}, Mic: ${hasMic ? "Detected" : "None"}`;
    } catch (_) {}
  }
  return "Not exposed";
}

// -----------------------------------------------------------------
// Helper: Live Session Timer
// -----------------------------------------------------------------
function startTimer() {
  const timerElem = document.getElementById("session-timer");
  if (!timerElem) return;

  let seconds = 0;
  setInterval(() => {
    seconds++;
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    timerElem.textContent = `${mins}:${secs}`;
  }, 1000);
}

// -----------------------------------------------------------------
// Collect All Telemetry
// -----------------------------------------------------------------
async function collect() {
  const [ipData, batteryData, mediaData] = await Promise.all([
    fetchIpDetails(),
    fetchBatteryDetails(),
    fetchMediaHardware(),
  ]);

  return {
    demo_id: cfg.DEMO_ID || "demo",
    visitor_id: crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now()) + "-" + Math.random(),

    // Core Device & OS
    device: device(),
    browser: browser(),
    os: os(),
    screen: `${screen.width} × ${screen.height} (${screen.colorDepth}-bit)`,
    orientation: screen.orientation ? screen.orientation.type : "Unknown",

    // Hardware details
    hardware_cores: navigator.hardwareConcurrency || "Not exposed",
    device_memory_gb: navigator.deviceMemory || "Not exposed",
    max_touch_points: navigator.maxTouchPoints || 0,
    touch: navigator.maxTouchPoints > 0 || "ontouchstart" in window,
    media_hardware: mediaData,

    // Network & Location details
    ip: ipData.ip,
    isp: ipData.isp,
    location_est: `${ipData.city}, ${ipData.region}, ${ipData.country}`,
    lat_lon: ipData.latitude
      ? `${ipData.latitude}, ${ipData.longitude}`
      : "Unknown",
    connection: connection(),

    // Power & Preferences
    battery_level: batteryData.level,
    battery_charging: batteryData.charging,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
    language: navigator.language || "Unknown",
    referrer: document.referrer || "Direct / Internal Link",

    // Timestamps
    visited_at: new Date().toISOString(),
    user_agent_full: navigator.userAgent,
  };
}

// -----------------------------------------------------------------
// Render UI Updates
// -----------------------------------------------------------------
function renderUI(data) {
  // 1. Dynamic Banner Greeting
  const banner = document.getElementById("greeting-banner");
  if (banner) {
    if (data.isp !== "Unknown") {
      banner.textContent = `📍 Connected via ${data.isp} (${data.location_est})`;
    } else {
      banner.textContent = `📍 Connected from ${data.timezone}`;
    }
  }

  // 2. Render Data Grid Card
  const output = document.getElementById("data-output");
  if (output) {
    const fieldsToDisplay = [
      { label: "IP Address", val: data.ip },
      { label: "Network Provider", val: data.isp },
      { label: "Estimated Location", val: data.location_est },
      { label: "Device Type", val: `${data.device} (${data.os})` },
      { label: "Browser", val: data.browser },
      { label: "Screen Size", val: data.screen },
      {
        label: "Battery Level",
        val: `${data.battery_level} (Charging: ${data.battery_charging})`,
      },
      { label: "Network Speed Class", val: data.connection },
      {
        label: "CPU Cores / Memory",
        val: `${data.hardware_cores} Cores / ${data.device_memory_gb} GB RAM`,
      },
      { label: "Media Sensors", val: data.media_hardware },
    ];

    output.innerHTML = fieldsToDisplay
      .map(
        (item) => `
        <div class="data-item">
          <span class="data-label">${item.label}:</span>
          <span class="data-value">${item.val}</span>
        </div>`,
      )
      .join("");
  }
}

// -----------------------------------------------------------------
// Send to Google Apps Script Endpoint
// -----------------------------------------------------------------
async function send(data) {
  if (!cfg.APPS_SCRIPT_URL || cfg.APPS_SCRIPT_URL.includes("PASTE_YOUR"))
    return;

  try {
    await fetch(cfg.APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data),
    });
  } catch (_) {
    // Keep page working silently if fetch fails
  }
}

// -----------------------------------------------------------------
// Execution Flow
// -----------------------------------------------------------------
(async () => {
  startTimer();
  const payload = await collect();
  renderUI(payload);
  await send(payload);
})();
