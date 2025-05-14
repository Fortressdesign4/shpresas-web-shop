'use strict'
(() => {
  const log = (...m) => console.log("[WAF.js]", ...m);

  const ua = navigator.userAgent.toLowerCase();
  const input = [
    ua,
    document.referrer.toLowerCase(),
    location.href.toLowerCase(),
    document.documentElement.innerHTML.toLowerCase(),
    Object.keys(window).join(';').toLowerCase(),
    Object.getOwnPropertyNames(window).join(';').toLowerCase()
  ].join('|');

  const BLOCK_COMMANDS = [
    // 🔧 Windows / System-Kommandos
    "shutdown","taskkill","logoff","tsdiscon","msg.exe","winlogon",
    "cmd.exe","powershell","regsvr32","system32","c:\\","\\\\","file:///c:/",

    // 💉 Code Injection / JS Manipulation
    "<script","</script","onerror=","onload=","eval(","function(","constructor(",
    "settimeout(","setinterval(","innerhtml","outerhtml","document.write",
    "createelement(","__proto__","object.assign","defineproperty",

    // 💾 Leak & Storage APIs
    "webrtc","rtcpeerconnection","media","getusermedia","stun:","turn:","relay:",
    "sendbeacon","postmessage","navigator.connection","devicememory",
    "hardwareconcurrency","performance.memory","localstorage",
    "sessionstorage","indexeddb",

    // 🛰️ Exploit: SSRF, RCE, LFI, Path Traversal
    "file://","php://","data:text/","blob:","xlink:href","base64,",
    "atob(","btoa(","url.createobjecturl","importscripts",
    "../","..\\","%2e%2e%2f","/etc/passwd","?file=","?page=",

    // 💳 Zahlung / Payment Abuse
    "paypal","klarna","stripe","sofort","iban","bic","sepa","creditcard",
    "visa","mastercard","zahlungsmethode","applepay","googlepay","/buy","checkout",

    // 📬 Leak-Vektor E-Mail
    "@gmail.","@yahoo.","@outlook.","@protonmail.","@icloud.","@web.","mailto:",

    // 🧠 DevTools / Headless Detection
    "navigator.webdriver","document.hidden","window.outerwidth","window.outerheight",

    // 🧪 Exploits – SQLi / Shell / XSS / RCE
    "' or 1=1","union select","rdp","peerconnection","process.env","select * from","drop table","insert into",
    "update set","--",";--","xp_cmdshell","benchmark(","sleep(","load_file(",
    "wget ","curl -s","nmap","sqlmap","rat","phantom","nc -e","bash -i",
    "perl -e","python -c","os.system(","system(","exec(","shell_exec(",
    "`ls`","`cat`","ls -la","cat /etc/passwd"
  ];

  const emailLeak = /[a-z0-9._%+\-]+@(gmail|yahoo|outlook|icloud|protonmail|web|gmx)\.[a-z]{2,}/i.test(input);

  const violations = [];

  BLOCK_COMMANDS.forEach(cmd => {
    if (input.includes(cmd)) violations.push(cmd);
  });

  if (emailLeak) violations.push("E-Mail-Leak erkannt");

  if (violations.length > 0) {
    log("🚫 NIS2/ISO27001 VERSTOSS:", violations);
    
  }

  // Objekt-Blockaden
  try { delete window.RTCPeerConnection; log("✅ RTCPeerConnection entfernt"); } catch {}
  try { delete navigator.mediaDevices; log("✅ mediaDevices entfernt"); } catch {}
  try { XMLHttpRequest.prototype.open = () => { throw new Error("XHR BLOCKED"); }; log("✅ XHR blockiert"); } catch {}
  try { window.WebSocket = () => { throw new Error("WebSocket BLOCKED"); }; log("✅ WebSocket blockiert"); } catch {}
  try { window.eval = () => { throw new Error("eval BLOCKED"); }; log("✅ eval blockiert"); } catch {}
  try { window.Function = () => { throw new Error("Function BLOCKED"); }; log("✅ Function blockiert"); } catch {}
  try {
    Object.defineProperty(document, "cookie", {
      configurable: false,
      enumerable: true,
      get: () => "",
      set: () => { throw new Error("cookie BLOCKED"); }
    });
    log("✅ document.cookie Schutz aktiv");
  } catch {}

  // Headless / DevTools Erkennung
  setInterval(() => {
    if (navigator.webdriver || document.hidden) log("⚠️ Headless / DevTools erkannt");
  }, 500);
})();
