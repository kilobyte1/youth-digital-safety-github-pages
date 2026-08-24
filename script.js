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
// New Helper: Fetch IP, ISP, and Location metadata via ipapi.co
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
// New Helper: Fetch Battery Level and Charging Status (where supported)
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
// Updated collect() function (now async)
// -----------------------------------------------------------------
async function collect() {
  // Fetch async network & battery details in parallel
  const [ipData, batteryData] = await Promise.all([
    fetchIpDetails(),
    fetchBatteryDetails(),
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
    screen: `${screen.width} × ${screen.height} (Depth: ${screen.colorDepth}-bit)`,
    orientation: screen.orientation ? screen.orientation.type : "Unknown",

    // Hardware details (very revealing in presentations)
    hardware_cores: navigator.hardwareConcurrency || "Not exposed",
    device_memory_gb: navigator.deviceMemory || "Not exposed",
    max_touch_points: navigator.maxTouchPoints || 0,
    touch: navigator.maxTouchPoints > 0 || "ontouchstart" in window,

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
    // Keep the reveal page working even if the network request fails.
  }
}

// Execute and send on load
(async () => {
  const payload = await collect();
  await send(payload);
})();
