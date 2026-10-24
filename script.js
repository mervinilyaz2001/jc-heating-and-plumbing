/* ============================================================
   BUSINESS DETAILS
   Edit these and the whole page updates. Anything still in
   [SQUARE BRACKETS] shows as a highlighted placeholder until
   it's filled in. Also update the matching values written in
   index.html (search for "data-config") and the JSON-LD in the
   <head>, so search engines see the same details.
   ============================================================ */
const CONFIG = {
  businessName: "James Cowman Heating & Plumbing Limited",   // the logo stays "JC Heating & Plumbing"
  phoneDisplay: "086 150 3653",
  phoneTel: "+353861503653",
  whatsapp: "353861503653",          // TODO: confirm the 086 is on WhatsApp
  email: "[EMAIL]",                  // TODO: confirm with client
  street: "Mill Road",
  town: "Bunclody",
  county: "Co. Wexford",
  ownerName: "James Cowman",
  yearsTrading: "[YEARS TRADING]",   // TODO: confirm with client (a number, e.g. "12")
  facebookUrl: "[FACEBOOK URL]",     // TODO: confirm with client (full https:// link)

  // Areas covered (confirmed by the client). The towns are the main towns in each area,
  // used for the "Do you cover my area?" checker. Add or remove towns freely.
  areas: {
    wexford:  { label: "Co. Wexford",  towns: ["Bunclody", "Enniscorthy", "Wexford Town", "Gorey", "New Ross", "Ferns", "Camolin", "Kiltealy", "Rathnure", "Rosslare"] },
    kilkenny: { label: "Co. Kilkenny", towns: ["Kilkenny City", "Graiguenamanagh", "Thomastown", "Gowran", "Goresbridge", "Callan", "Castlecomer"] },
    carlow:   { label: "Co. Carlow",   towns: ["Carlow Town", "Tullow", "Bagenalstown", "Borris", "Clonegal", "Kildavin", "Myshall", "Ballon", "Hacketstown"] },
    wicklow:  { label: "Co. Wicklow",  towns: ["Carnew", "Shillelagh", "Tinahely", "Aughrim", "Arklow", "Baltinglass", "Rathdrum", "Wicklow Town", "Greystones", "Bray"] },
    dublin:   { label: "South Dublin", towns: ["Shankill", "Dún Laoghaire", "Dalkey", "Killiney", "Blackrock", "Stillorgan", "Dundrum", "Sandyford", "Rathfarnham", "Tallaght"] }
  },
  // Other names people might type, pointing at a town above.
  // Newtownbarry is the old name for Bunclody (see TODO.md).
  townAliases: { "Newtownbarry": "Bunclody" },

  // FORM BACKEND: paste your Formspree endpoint here, e.g. "https://formspree.io/f/abcdwxyz".
  // While this is empty the form validates and shows the success message, but sends nothing.
  formEndpoint: ""
};


(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollBehaviour = reduced ? "auto" : "smooth";
  const isPlaceholder = (v) => !v || /^\[.*\]$/.test(String(v).trim());
  const waLink = (text) => `https://wa.me/${CONFIG.whatsapp}` + (text ? `?text=${encodeURIComponent(text)}` : "");
  const restartAnim = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  /* ============ APPLY CONFIG ============ */
  $$("[data-config]").forEach((el) => {
    const key = el.dataset.config;
    const val = CONFIG[key];
    if (val === undefined) return;
    if (key === "facebookUrl") { el.hidden = !isPlaceholder(val); return; }
    el.textContent = val;
    el.classList.toggle("todo", isPlaceholder(val));
  });

  $$("[data-config-href]").forEach((el) => {
    const type = el.dataset.configHref;
    let href = null;
    if (type === "tel") href = "tel:" + CONFIG.phoneTel;
    else if (type === "whatsapp") href = waLink(el.dataset.waText);
    else if (type === "email") href = isPlaceholder(CONFIG.email) ? null : "mailto:" + CONFIG.email;
    else if (type === "facebook") href = isPlaceholder(CONFIG.facebookUrl) ? null : CONFIG.facebookUrl;
    if (href) {
      el.setAttribute("href", href);
    } else {
      // no real value yet, so don't leave a dead link
      el.removeAttribute("href");
      el.removeAttribute("target");
    }
  });

  $("#year").textContent = new Date().getFullYear();

  /* ============ SCROLL LOCK (pop-ups and menu) ============ */
  const lockScroll = (on) => {
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.classList.toggle("no-scroll", on);
    document.body.style.paddingRight = on && sbw > 0 ? sbw + "px" : "";
  };

  /* ============ IMAGE PLACEHOLDERS ============
     Each <figure class="ph" data-img="images/..."> tries to load its photo.
     If the file is there, the photo fades in over the placeholder.
     If it isn't (404), the placeholder stays. Just upload the file with the right name. */
  document.addEventListener("ph:loaded", (e) => {
    const fig = e.target;
    if (!fig.closest(".g-item")) return;
    fig.tabIndex = 0;
    fig.setAttribute("role", "button");
    fig.setAttribute("aria-label", "View larger: " + (fig.dataset.alt || "photo"));
  });

  $$(".ph[data-img]").forEach((fig) => {
    const src = fig.dataset.img;
    if (!src) return;
    const img = document.createElement("img");
    img.alt = fig.dataset.alt || "";
    img.loading = fig.dataset.eager ? "eager" : "lazy";
    img.decoding = "async";
    // optional focal point, e.g. data-pos="62% 45%", so the crop keeps the subject at every screen size
    if (fig.dataset.pos) img.style.objectPosition = fig.dataset.pos;
    img.addEventListener("load", () => {
      fig.classList.add("has-img");
      fig.dispatchEvent(new CustomEvent("ph:loaded", { bubbles: true }));
    }, { once: true });
    img.addEventListener("error", () => img.remove(), { once: true });
    img.src = src;
    fig.prepend(img);
  });

  /* ============ SCROLL-LINKED BITS (one rAF-throttled loop) ============ */
  const scrollFns = [];
  let ticking = false;
  const runScroll = () => { ticking = false; scrollFns.forEach((fn) => fn()); };
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(runScroll); }
  }, { passive: true });
  window.addEventListener("resize", runScroll);

  const header = $("#siteHeader");
  scrollFns.push(() => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.style.setProperty("--p", max > 0 ? clamp(y / max, 0, 1).toFixed(4) : 0);
  });

  /* process pipe fills as you scroll past the steps */
  const steps = $("#steps");
  const stepsFill = $("#stepsFill");
  scrollFns.push(() => {
    const r = steps.getBoundingClientRect();
    const vh = window.innerHeight;
    const desktop = window.innerWidth >= 1024;
    let p = desktop ? (vh * 0.9 - r.top) / (vh * 0.55) : (vh * 0.7 - r.top) / r.height;
    p = reduced ? 1 : clamp(p, 0, 1);
    stepsFill.style.width = desktop ? p * 100 + "%" : "";
    stepsFill.style.height = desktop ? "" : p * 100 + "%";
  });

  /* highlight the nav link for the section on screen */
  const navLinks = $$(".nav-link");
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  navLinks.forEach((l) => { const s = $(l.getAttribute("href")); if (s) spy.observe(s); });

  /* ============ MOBILE MENU ============ */
  const menu = $("#mobileMenu");
  const menuToggle = $("#menuToggle");
  const menuClosed = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    lockScroll(false);
  };
  const closeMenu = () => { if (menu.open) menu.close(); menuClosed(); };
  menuToggle.addEventListener("click", () => {
    menu.showModal();
    menuToggle.setAttribute("aria-expanded", "true");
    lockScroll(true);
  });
  menu.addEventListener("cancel", (e) => { e.preventDefault(); closeMenu(); });
  menu.addEventListener("close", menuClosed);
  $("#mobileMenuClose").addEventListener("click", closeMenu);
  menu.addEventListener("click", (e) => { if (e.target === menu) closeMenu(); });
  $$("a", menu).forEach((a) => a.addEventListener("click", closeMenu));
  window.addEventListener("resize", () => { if (window.innerWidth >= 1180) closeMenu(); });

  /* ============ SCROLL REVEAL ============ */
  $$("[data-stagger]").forEach((group) => {
    let i = 0;
    Array.from(group.children).forEach((child) => {
      if (child.hasAttribute("data-reveal")) child.style.setProperty("--d", Math.min(i++ * 70, 420) + "ms");
    });
  });
  const revealEls = $$("[data-reveal]");
  if (reduced || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in-view"));
  } else {
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in-view");
        revealIO.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach((el) => revealIO.observe(el));
  }

  /* ============ CONTACT FORM PREFILL ============
     Any link to #contact with data-select="Service name" picks that service in the form.
     data-message="..." starts the message box off (only if they haven't typed anything). */
  const form = $("#quoteForm");
  const serviceSelect = $("#serviceSelect");
  const serviceField = $("#serviceField");
  const messageBox = $("#fMessage");
  const townBox = $("#fTown");

  messageBox.addEventListener("input", () => { messageBox.dataset.auto = "0"; });

  const prefill = (service, message) => {
    if (service && Array.from(serviceSelect.options).some((o) => o.value === service)) {
      serviceSelect.value = service;
      serviceSelect.removeAttribute("aria-invalid");
      $("#fServiceErr").textContent = "";
      restartAnim(serviceField, "flash");
    }
    if (message && (!messageBox.value.trim() || messageBox.dataset.auto === "1")) {
      messageBox.value = message;
      messageBox.dataset.auto = "1";
    }
  };

  const goToContact = (service, message) => {
    prefill(service, message);
    $("#contact").scrollIntoView({ behavior: scrollBehaviour, block: "start" });
    setTimeout(() => $("#fName").focus({ preventScroll: true }), reduced ? 0 : 800);
  };

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href='#contact']");
    if (!link || link.closest(".svc-modal")) return;
    prefill(link.dataset.select, link.dataset.message);
  });

  /* ============ "DOES THIS SOUND FAMILIAR?" CHECKLIST ============ */
  const symptomInputs = $$(".symptom input");
  const symptomCount = $("#symptomCount");
  const familiarBook = $("#familiarBook");
  const familiarPhoto = $("#familiarPhoto");
  const photoText = familiarPhoto.dataset.waText;
  const updateSymptoms = () => {
    const ticked = symptomInputs.filter((i) => i.checked).map((i) => i.value);
    const n = ticked.length;
    symptomCount.textContent = n === 0 ? "" : n === 1
      ? "You've ticked 1. It's worth getting looked at."
      : `You've ticked ${n}. They're worth getting looked at.`;
    const list = ticked.join(", ");
    familiarBook.dataset.message = n ? `I've noticed: ${list}. ` : "";
    familiarPhoto.href = waLink(photoText + (n ? ` I've noticed: ${list}.` : ""));
  };
  symptomInputs.forEach((i) => i.addEventListener("change", updateSymptoms));

  /* ============ SERVICE POP-UPS ============ */
  const modal = $("#svcModal");
  const smBody = $("#smBody");
  const smQuote = $("#smQuote");
  const DETAILS = {};
  $$(".svc-detail").forEach((d) => { DETAILS[d.dataset.service] = d; });
  // skip any service whose card has been hidden with data-show="false"
  const ORDER = Object.keys(DETAILS).filter((k) => {
    const btn = $(`.svc-card [data-open="${k}"]`);
    const card = btn && btn.closest(".svc-card");
    return !card || card.dataset.show !== "false";
  });
  let current = null;
  let pushed = false;
  let closing = false;
  let afterClose = null;

  const fill = (key) => {
    const d = DETAILS[key];
    current = key;
    $("#smTag").textContent = d.dataset.tag;
    $("#smTitle").textContent = d.dataset.title;
    smBody.innerHTML = d.innerHTML;
    smBody.scrollTop = 0;
    smQuote.dataset.select = d.dataset.select;
    const i = ORDER.indexOf(key);
    const prev = ORDER[(i - 1 + ORDER.length) % ORDER.length];
    const next = ORDER[(i + 1) % ORDER.length];
    $("#smPrevName").textContent = DETAILS[prev].dataset.title;
    $("#smNextName").textContent = DETAILS[next].dataset.title;
  };

  const openService = (key, fromHistory) => {
    if (!DETAILS[key]) return;
    if (modal.open) { swapService(key, !fromHistory); return; }
    fill(key);
    modal.showModal();
    lockScroll(true);
    if (!fromHistory) {
      history.pushState({ svc: key }, "", "#service-" + key);
      pushed = true;
    }
  };

  const reallyClose = () => {
    if (!modal.open || closing) return;
    closing = true;
    const finish = () => {
      modal.classList.remove("closing");
      modal.close();
      lockScroll(false);
      closing = false;
      const cb = afterClose;
      afterClose = null;
      if (cb) setTimeout(cb, 30);
    };
    if (reduced) { finish(); return; }
    modal.classList.add("closing");
    setTimeout(finish, 260);
  };

  const requestClose = (cb) => {
    if (!modal.open) return;
    afterClose = cb || null;
    if (pushed) {
      pushed = false;
      history.back();
      setTimeout(() => { if (modal.open) reallyClose(); }, 450); // in case popstate never comes
    } else {
      if (/^#service-/.test(location.hash)) history.replaceState(null, "", location.pathname + location.search);
      reallyClose();
    }
  };

  const swapService = (key, updateHistory = true) => {
    if (!DETAILS[key] || key === current) return;
    fill(key);
    restartAnim(smBody, "swap");
    if (updateHistory) history.replaceState({ svc: key }, "", "#service-" + key);
  };
  const stepService = (n) => {
    const i = ORDER.indexOf(current);
    swapService(ORDER[(i + n + ORDER.length) % ORDER.length]);
  };

  window.addEventListener("popstate", () => {
    const m = location.hash.match(/^#service-([\w-]+)$/);
    if (m && DETAILS[m[1]]) {
      if (modal.open) swapService(m[1], false);
      else openService(m[1], true);
    } else if (modal.open) {
      pushed = false;
      reallyClose();
    }
  });

  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-open]");
    if (!opener) return;
    e.preventDefault();
    openService(opener.dataset.open);
  });
  modal.addEventListener("cancel", (e) => { e.preventDefault(); requestClose(); });
  modal.addEventListener("click", (e) => { if (e.target === modal) requestClose(); });
  $("#smClose").addEventListener("click", () => requestClose());
  $("#smPrev").addEventListener("click", () => stepService(-1));
  $("#smNext").addEventListener("click", () => stepService(1));
  modal.addEventListener("keydown", (e) => {
    if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && !e.target.closest("input, textarea, select")) {
      e.preventDefault();
      stepService(e.key === "ArrowRight" ? 1 : -1);
    }
  });
  smQuote.addEventListener("click", (e) => {
    e.preventDefault();
    const service = smQuote.dataset.select;
    requestClose(() => goToContact(service));
  });

  // open straight from a shared link, e.g. index.html#service-servicing
  const initial = location.hash.match(/^#service-([\w-]+)$/);
  if (initial && DETAILS[initial[1]]) setTimeout(() => openService(initial[1], true), 300);

  /* ============ FAQ ACCORDIONS (page and pop-ups) ============ */
  document.addEventListener("click", (e) => {
    const q = e.target.closest(".faq-q");
    if (!q) return;
    const item = q.closest(".faq-item");
    const open = !item.classList.contains("open");
    item.classList.toggle("open", open);
    q.setAttribute("aria-expanded", String(open));
  });

  /* ============ WHAT'S YOUR HEATING DOING? ============
     General guidance only. Edit the wording here. */
  const CHECK = {
    noheat: {
      title: "No heat at all", tag: "Check the basics first",
      cause: "Often something simple: the oil has run out, the timer or thermostat has been knocked, or the burner has locked out. It can also be a failed pump or a fault on the burner itself.",
      fix: "Run through the basics with you over the phone first. If it's not something you can sort yourself, we'll come out, find the fault and fix it, or tell you straight if the boiler is past it.",
      tip: "Check the oil gauge on the tank, the timer and the thermostat. If the reset button on the burner is lit, press it once only. If it locks out again, leave it and ring us.",
      select: "Central heating install or repair", more: "heating"
    },
    nohotwater: {
      title: "No hot water", tag: "Usually one part",
      cause: "If the heating works but the hot taps don't, it's usually on the hot water side: a timer setting, a stuck motorised valve, a faulty cylinder thermostat, or a failed immersion element.",
      fix: "Test the valve, the cylinder thermostat and the immersion, then replace whatever has failed. If the cylinder itself is old or leaking, we'll talk you through a replacement.",
      tip: "Check the timer is set for hot water. The immersion switch in the hot press can often get you hot water while you wait.",
      select: "Hot water, cylinder or immersion", more: "hotwater"
    },
    coldtop: {
      title: "Radiators cold at the top", tag: "Usually air",
      cause: "Air trapped at the top of the radiator. A little air is normal, but if you're bleeding them every few weeks, something is letting air in or the system is low on water. Cold at the bottom instead usually points to sludge.",
      fix: "Bleed and balance the system, then find out why air keeps getting in. That can be a small leak, or a problem with the header tank or the pressure.",
      tip: "You can bleed a radiator yourself with a radiator key. Turn the heating off and let it cool first, and hold a cloth under the valve.",
      select: "Central heating install or repair", more: "heating"
    },
    pressure: {
      title: "Boiler losing pressure", tag: "Sealed systems",
      cause: "This applies to pressurised (sealed) systems with a gauge on the boiler. Pressure usually drops because of a leak somewhere on the system, a worn pressure relief valve, or an expansion vessel that has lost its charge.",
      fix: "Check the expansion vessel and the relief valve, then trace any leak. We fix the cause, rather than just topping it up.",
      tip: "Look for damp patches near pipes and radiator valves, and check whether the small pipe running outside from the boiler is dripping.",
      select: "Central heating install or repair", more: "heating"
    },
    cutting: {
      title: "Boiler keeps cutting out", tag: "Often a service job",
      cause: "On an oil boiler, a burner that keeps locking out often points to a fuel supply problem, a blocked filter or nozzle, or a dirty burner that's overdue a service. A low tank with sludge at the bottom can do it too.",
      fix: "Service the burner, change the nozzle and filter, and check the oil supply line. If the boiler is old and keeps failing, we'll give you an honest view on repair against replacement.",
      tip: "Don't keep pressing the reset button. If it locks out twice, leave it off and ring us.",
      select: "Oil boiler service", more: "servicing"
    },
    noise: {
      title: "Banging or gurgling noises", tag: "Air, sludge or scale",
      cause: "Gurgling is usually air in the system. Banging, or a rumbling like a kettle, can mean sludge or limescale has built up in the boiler, a problem with the pump, or pipes that aren't clipped properly.",
      fix: "Find where the noise is coming from, bleed the system, and clean it out if there's sludge or scale. Loose pipes get clipped.",
      tip: "Note when it happens: when the heating comes on, when a tap is turned off, or all the time. It helps us track it down.",
      select: "Central heating install or repair", more: "heating"
    },
    leak: {
      title: "Leak or drip", tag: "Don't leave it",
      cause: "Could be a worn valve, a loose joint, a failed seal under a sink, or a pinhole in an old pipe. Small leaks get bigger, and the water does damage you can't see.",
      fix: "Find the source, fix it properly, and check nothing else has been affected.",
      tip: "If it's more than a drip, turn off the water at the stopcock (usually under the kitchen sink) and put a basin under it.",
      select: "Plumbing repair or leak", more: "repairs"
    },
    oil: {
      title: "Oil use seems high", tag: "Worth a proper look",
      cause: "An older boiler that's burning less efficiently, a burner that's overdue a service, controls that run the heating when nobody's home, or now and then a leak in the oil line or tank.",
      fix: "Service and set up the burner first, then look at your controls and the age of the boiler. If a replacement makes sense we'll tell you, and if it doesn't, we'll tell you that too.",
      tip: "Watch the tank gauge for a week. A sudden drop with no change in use needs checking straight away, as it could be a leak.",
      select: "Boiler replacement or upgrade", more: "boiler"
    }
  };
  const MORE_NAME = {
    boiler: "Boiler Replacement", servicing: "Oil Boiler Servicing", heating: "Central Heating",
    hotwater: "Hot Water & Cylinders", repairs: "Plumbing Repairs"
  };
  const checkOpts = $$(".check-opt");
  const checkResult = $("#checkResult");
  const checkInner = $("#checkInner");
  const checkCta = $("#checkCta");
  const checkMore = $("#checkMore");

  const setCheck = (key, byUser) => {
    const d = CHECK[key];
    if (!d) return;
    checkOpts.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.problem === key)));
    $("#checkTag").textContent = d.tag;
    $("#checkTitle").textContent = d.title;
    $("#checkCause").textContent = d.cause;
    $("#checkFix").textContent = d.fix;
    $("#checkTip").textContent = d.tip || "";
    $("#checkTipWrap").hidden = !d.tip;
    checkCta.dataset.select = d.select;
    checkCta.dataset.message = `Heating check: ${d.title}. `;
    checkMore.dataset.open = d.more;
    checkMore.setAttribute("href", "#service-" + d.more);
    checkMore.firstChild.textContent = `More on ${MORE_NAME[d.more]} `;
    restartAnim(checkInner, "swap");
    // on phones the answer is below the buttons, so bring it into view
    if (byUser && window.innerWidth < 1024) {
      const r = checkResult.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.55) checkResult.scrollIntoView({ behavior: scrollBehaviour, block: "start" });
    }
  };
  checkOpts.forEach((b) => b.addEventListener("click", () => setCheck(b.dataset.problem, true)));

  /* ============ WHEN TO BOOK ============ */
  const MONTHS = [
    { n: "January", type: "winter", title: "Deep winter", text: "The coldest stretch of the year, when your boiler is working hardest. Don't let the oil tank run too low, and if the heating is struggling, ring before it stops altogether." },
    { n: "February", type: "winter", title: "Still working hard", text: "Patchy heat, noisy radiators or a burner that's slow to fire? Get it looked at now, rather than limping on until spring." },
    { n: "March", type: "plan", title: "Plan your upgrade", text: "If your boiler barely made it through the winter, now's the time to get a quote for a replacement. Book it in for the warmer months and you won't be without heat when you need it." },
    { n: "April", type: "upgrade", title: "Upgrade season starts", text: "With the heating on less, spring is a good time for boiler swaps, heat pump installs and new heating systems. You won't miss the heat while the work is done." },
    { n: "May", type: "upgrade", title: "Good weather for bigger jobs", text: "Boiler replacements, heat pumps, underfloor heating and bathroom refits all go easier when you're not depending on the heating." },
    { n: "June", type: "upgrade", title: "Heating off, work on", text: "One of the easiest months for a full heating upgrade or a new bathroom. If you're applying for an SEAI grant, leave time for approval before the work starts." },
    { n: "July", type: "upgrade", title: "Get your service in the diary", text: "Still a great time for bigger jobs. It's also worth booking your boiler service now, so it's done before the autumn rush." },
    { n: "August", type: "service", title: "Best time for a service", text: "Late summer is the ideal time to get your oil boiler serviced. It's ready before the first cold night, and you're not waiting in a queue." },
    { n: "September", type: "service", title: "Service before the cold", text: "Early autumn is still a great time for a service. Turn the heating on for a test run too, so any problem shows up before you need it." },
    { n: "October", type: "winter", title: "Get ready for winter", text: "The cold is on the way. If your boiler hasn't been serviced in the last 12 months, get it booked now. Bleed the radiators and check your oil level." },
    { n: "November", type: "winter", title: "Winter checks", text: "Lag any exposed pipes in the attic or outside, and make sure you know where your stopcock is in case a pipe freezes and bursts." },
    { n: "December", type: "winter", title: "Heating on full time", text: "If something isn't right, ring early rather than waiting for it to give up over Christmas. Keep the oil topped up before the holidays." }
  ];
  const TYPE_LABEL = {
    service: "Best time for a service", upgrade: "Best for upgrades and installs",
    plan: "Plan ahead", winter: "Winter checks"
  };
  const URGENCY = {
    service: "Late summer and early autumn are the best time for a boiler service. Get your name down now, before the cold sets in.",
    winter: "Boiler services book up fast once the cold sets in. Get your name down now.",
    upgrade: "Spring and summer are the best time for boiler swaps and heat pump installs. Get your free quote in early.",
    plan: "Thinking about a new boiler? Get a quote now and have it fitted well before next winter."
  };
  const nowMonth = new Date().getMonth();
  const seasonBar = $("#seasonBar");
  const seasonDetail = $("#seasonDetail");
  const seasonInner = $("#seasonInner");
  const seasonCta2 = $("#seasonCta2");

  MONTHS.forEach((m, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "month" + (i === nowMonth ? " is-now" : "");
    b.dataset.type = m.type;
    b.setAttribute("aria-pressed", "false");
    b.setAttribute("aria-label", `${m.n}${i === nowMonth ? ", this month" : ""}: ${m.title}`);
    b.innerHTML = `<span>${m.n.slice(0, 3)}</span><span class="m-bar"></span>` + (i === nowMonth ? `<span class="m-now">Now</span>` : "");
    b.addEventListener("click", () => setMonth(i, true));
    seasonBar.appendChild(b);
  });
  const monthBtns = $$(".month", seasonBar);

  const setMonth = (i, animate) => {
    const m = MONTHS[i];
    monthBtns.forEach((b, k) => b.setAttribute("aria-pressed", String(k === i)));
    seasonDetail.dataset.type = m.type;
    $("#seasonNow").textContent = (i === nowMonth ? `This month · ${m.n}` : m.n) + ` · ${TYPE_LABEL[m.type]}`;
    $("#seasonTitle").textContent = m.title;
    $("#seasonText").textContent = m.text;
    seasonCta2.hidden = !(m.type === "upgrade" || m.type === "plan");
    if (animate) restartAnim(seasonInner, "swap");
  };
  setMonth(nowMonth, false);
  $("#urgencyNote").textContent = URGENCY[MONTHS[nowMonth].type];

  /* ============ RECENT WORK: FILTER + LIGHTBOX ============ */
  const galleryItems = $$(".g-item");
  const filterBtns = $$(".gf-btn");
  filterBtns.forEach((btn) => btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    filterBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    let shown = 0;
    galleryItems.forEach((item) => {
      const show = f === "all" || item.dataset.cat === f;
      item.classList.toggle("is-hidden", !show);
      if (show) {
        shown++;
        item.classList.add("in-view");
        restartAnim(item, "fade-in");
      }
    });
    $("#galleryEmpty").hidden = shown > 0;
  }));

  const lightbox = $("#lightbox");
  const lbImg = $("#lbImg");
  const lbCaption = $("#lbCaption");
  let lbList = [];
  let lbIndex = 0;
  const showLightboxItem = (i) => {
    lbIndex = (i + lbList.length) % lbList.length;
    const item = lbList[lbIndex];
    const img = $(".ph > img", item);
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = $(".g-cap", item).textContent.trim();
  };
  const openLightbox = (item) => {
    lbList = galleryItems.filter((it) => !it.classList.contains("is-hidden") && $(".ph", it).classList.contains("has-img"));
    const i = lbList.indexOf(item);
    if (i < 0) return;
    showLightboxItem(i);
    const many = lbList.length > 1;
    $("#lbPrev").hidden = !many;
    $("#lbNext").hidden = !many;
    lightbox.showModal();
    lockScroll(true);
  };
  const closeLightbox = () => { if (lightbox.open) lightbox.close(); lockScroll(false); };
  lightbox.addEventListener("close", () => lockScroll(false));
  lightbox.addEventListener("cancel", (e) => { e.preventDefault(); closeLightbox(); });
  $("#lbClose").addEventListener("click", closeLightbox);
  $("#lbPrev").addEventListener("click", () => showLightboxItem(lbIndex - 1));
  $("#lbNext").addEventListener("click", () => showLightboxItem(lbIndex + 1));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox || e.target.classList.contains("lb-figure")) closeLightbox(); });
  lightbox.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") showLightboxItem(lbIndex + 1);
    if (e.key === "ArrowLeft") showLightboxItem(lbIndex - 1);
  });
  const galleryGrid = $("#galleryGrid");
  galleryGrid.addEventListener("click", (e) => {
    const fig = e.target.closest(".ph.has-img");
    if (fig) openLightbox(fig.closest(".g-item"));
  });
  galleryGrid.addEventListener("keydown", (e) => {
    const fig = e.target.closest(".ph.has-img");
    if (fig && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openLightbox(fig.closest(".g-item")); }
  });

  /* ============ AREAS: TOWN CHECKER ============ */
  const AREAS = CONFIG.areas;
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/&/g, "and").replace(/[^a-z]/g, "");
  // what people might type for a whole area rather than a town
  const AREA_WORDS = {
    wexford: ["wexford", "cowexford", "countywexford", "northwexford", "southwexford"],
    kilkenny: ["kilkenny", "cokilkenny", "countykilkenny"],
    carlow: ["carlow", "cocarlow", "countycarlow"],
    wicklow: ["wicklow", "cowicklow", "countywicklow", "southwicklow"],
    dublin: ["dublin", "southdublin", "dublinsouth", "codublin", "countydublin", "southcodublin", "southcountydublin", "dunlaoghairerathdown"]
  };
  const areaTabs = $$(".area-tab");
  const areaChips = $("#areaChips");
  const areaResult = $("#areaResult");
  const areaInput = $("#areaInput");
  const hubParts = $$(".hub-node, .hub-pipe");
  const townList = $("#townList");

  Object.values(AREAS).forEach((a) => a.towns.forEach((t) => {
    const o = document.createElement("option");
    o.value = t;
    townList.appendChild(o);
  }));

  const showRegion = (key, highlight) => {
    if (!AREAS[key]) return;
    areaTabs.forEach((t) => t.setAttribute("aria-pressed", String(t.dataset.region === key)));
    hubParts.forEach((p) => p.classList.toggle("on", p.dataset.region === key));
    areaChips.textContent = "";
    AREAS[key].towns.forEach((t, i) => {
      const li = document.createElement("li");
      li.textContent = t;
      li.style.setProperty("--ci", i);
      if (t === highlight) li.classList.add("hl");
      areaChips.appendChild(li);
    });
  };
  areaTabs.forEach((t) => t.addEventListener("click", () => showRegion(t.dataset.region)));
  $$(".hub-node").forEach((n) => n.addEventListener("click", () => showRegion(n.dataset.region)));
  showRegion("wexford");

  const setAreaResult = (ok, parts) => {
    areaResult.className = "area-result " + (ok ? "ok" : "no");
    areaResult.textContent = "";
    parts.forEach((p) => {
      if (typeof p === "string") { areaResult.appendChild(document.createTextNode(p)); return; }
      const a = document.createElement("a");
      a.href = p.href;
      a.textContent = p.text;
      if (p.onClick) a.addEventListener("click", p.onClick);
      areaResult.appendChild(a);
    });
  };
  const quoteLink = (town) => ({
    href: "#contact", text: "Get a free quote",
    onClick: () => { if (town && !townBox.value.trim()) townBox.value = town; }
  });
  const ringLink = { href: "tel:" + CONFIG.phoneTel, text: "Give us a ring and ask." };

  $("#areaSearch").addEventListener("submit", (e) => {
    e.preventDefault();
    const raw = areaInput.value.trim();
    const q = norm(raw);
    if (!q) { areaInput.focus(); return; }

    // 1. exact town  2. old or other name  3. a whole area ("Kilkenny")  4. start of a town name
    const findTown = (match) => {
      for (const [key, a] of Object.entries(AREAS)) {
        const town = a.towns.find((t) => match(norm(t)));
        if (town) return { key, town };
      }
      return null;
    };
    let hit = findTown((t) => t === q);
    let alias = null;
    if (!hit) {
      const aliasName = Object.keys(CONFIG.townAliases).find((n) => norm(n) === q);
      if (aliasName) {
        const target = CONFIG.townAliases[aliasName];
        const key = Object.keys(AREAS).find((k) => AREAS[k].towns.includes(target));
        if (key) { hit = { key, town: target }; alias = aliasName; }
      }
    }
    if (!hit) {
      const key = Object.keys(AREA_WORDS).find((k) => AREA_WORDS[k].includes(q));
      if (key) hit = { key, town: null };
    }
    if (!hit && q.length >= 3) hit = findTown((t) => t.startsWith(q));

    if (hit && hit.town) {
      showRegion(hit.key, hit.town);
      const lead = alias
        ? `Yes. ${alias} is the old name for ${hit.town}, and that's where we're based. `
        : hit.town === CONFIG.town ? `Yes, ${hit.town} is where we're based. ` : `Yes, we cover ${hit.town}. `;
      setAreaResult(true, [lead, quoteLink(hit.town)]);
    } else if (hit) {
      showRegion(hit.key);
      setAreaResult(true, [`We cover ${AREAS[hit.key].label}. Here are the main ${hit.key === "dublin" ? "areas" : "towns"}. Not on the list? `, ringLink]);
    } else {
      setAreaResult(false, ["Not on the list? ", ringLink]);
    }
  });

  /* ============ CONTACT FORM ============ */
  const fields = { name: $("#fName"), phone: $("#fPhone"), town: townBox, service: serviceSelect };
  const RULES = {
    name: (v) => v.trim().length >= 2 || "Please tell us your name.",
    phone: (v) => {
      const t = v.trim();
      if (!t) return "Please add a phone number so we can ring you back.";
      const digits = t.replace(/\D/g, "");
      return (/^[0-9+()\s-]+$/.test(t) && digits.length >= 7 && digits.length <= 15) || "That number doesn't look right. Please check it.";
    },
    town: (v) => v.trim().length >= 2 || "Which town or area are you in?",
    service: (v) => !!v || "Pick the closest match, or \"Not sure yet\"."
  };
  const validateField = (key) => {
    const el = fields[key];
    const res = RULES[key](el.value);
    const ok = res === true;
    if (ok) el.removeAttribute("aria-invalid");
    else el.setAttribute("aria-invalid", "true");
    $("#" + el.getAttribute("aria-describedby")).textContent = ok ? "" : res;
    return ok;
  };
  Object.keys(fields).forEach((key) => {
    const el = fields[key];
    el.addEventListener("blur", () => { if (el.value.trim()) validateField(key); });
    el.addEventListener(key === "service" ? "change" : "input", () => {
      if (el.getAttribute("aria-invalid") === "true") validateField(key);
    });
  });

  const formSuccess = $("#formSuccess");
  const formStatus = $("#formStatus");
  const formSubmit = $("#formSubmit");
  const submitLabel = formSubmit.innerHTML;

  const showSuccess = () => {
    form.reset();
    messageBox.dataset.auto = "0";
    formSuccess.hidden = false;
    formSuccess.querySelector("h3").setAttribute("tabindex", "-1");
    formSuccess.querySelector("h3").focus({ preventScroll: true });
  };
  const showFailure = () => {
    formStatus.textContent = `Sorry, that didn't send. Please try again, or ring ${CONFIG.phoneDisplay}.`;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    formStatus.textContent = "";
    if (form.querySelector("[name=_gotcha]").value) return; // spam bot
    const bad = Object.keys(fields).filter((key) => !validateField(key));
    if (bad.length) { fields[bad[0]].focus(); return; }

    /* ---- FORM BACKEND ----
       Paste a Formspree endpoint into CONFIG.formEndpoint at the top of this file
       and enquiries will be sent there. Nothing else needs to change. */
    if (!CONFIG.formEndpoint) {
      console.info("Form not connected yet: add CONFIG.formEndpoint in script.js. Nothing was sent.");
      showSuccess();
      return;
    }
    formSubmit.disabled = true;
    formSubmit.textContent = "Sending...";
    fetch(CONFIG.formEndpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      .then((r) => { if (r.ok) showSuccess(); else showFailure(); })
      .catch(showFailure)
      .finally(() => { formSubmit.disabled = false; formSubmit.innerHTML = submitLabel; });
  });
  $("#formAgain").addEventListener("click", () => {
    formSuccess.hidden = true;
    $("#fName").focus();
  });

  /* ============ STICKY MOBILE BAR ============
     Shows once the hero buttons scroll away, hides again over the contact form. */
  const mobileBar = $("#mobileBar");
  let pastHero = false;
  let atContact = false;
  const updateBar = () => mobileBar.classList.toggle("show", pastHero && !atContact);
  new IntersectionObserver(([e]) => {
    pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
    updateBar();
  }).observe($("#heroActions"));
  new IntersectionObserver(([e]) => {
    atContact = e.isIntersecting;
    updateBar();
  }, { threshold: 0.15 }).observe(form);

  runScroll();
})();
