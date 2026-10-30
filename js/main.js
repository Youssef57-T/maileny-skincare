(() => {
  const S = window.SITE;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const get = (path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), S);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (name, cls = "ico") => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

  // Inline the decorative sprigs so their strokes can be animated (CSS can't reach into <use>)
  $$("svg.sprig").forEach((el) => (el.innerHTML = $("#sprig").innerHTML));

  // WhatsApp: wa.me with a pre-filled message when a number is set,
  // otherwise the business's wa.link redirect.
  const wa = (msg) => {
    const num = (S.contacto.whatsapp || "").replace(/\D/g, "");
    return num
      ? `https://wa.me/${num}?text=${encodeURIComponent(msg || S.contacto.mensaje)}`
      : S.contacto.whatsappLink;
  };
  const setWa = (el, msg) => {
    el.href = wa(msg);
    el.target = "_blank";
    el.rel = "noopener";
  };

  // Plain text slots
  $$("[data-c]").forEach((el) => {
    const v = get(el.dataset.c);
    if (v != null) el.textContent = v;
  });

  $$("[data-wa]").forEach((el) => setWa(el));
  $$("[data-wa-promo]").forEach((el) => setWa(el, S.promo.mensaje));
  $$("[data-wa-faq]").forEach((el) => setWa(el, S.contacto.mensajeFaq));

  const igUrl = `https://www.instagram.com/${S.contacto.instagram}/`;
  const threadsUrl = `https://www.threads.net/@${S.contacto.threads}`;
  $$("[data-ig]").forEach((el) => (el.href = igUrl));
  $$("[data-ig-handle]").forEach((el) => (el.textContent = "@" + S.contacto.instagram));
  $$("[data-threads]").forEach((el) => (el.href = threadsUrl));

  // Trust pebbles
  $("#trust").innerHTML = S.confianza.map((t) => `
    <li class="pebble">
      <span class="well">${icon(t.icono)}</span>
      <div><strong>${esc(t.titulo)}</strong><span>${esc(t.texto)}</span></div>
    </li>`).join("");

  // Promo: hidden when switched off or after its last day ("hasta", local time)
  const promoOver = S.promo.hasta && new Date() > new Date(`${S.promo.hasta}T23:59:59`);
  if (!S.promo.activa || promoOver) $("#promo").remove();

  // Services
  $("#services").innerHTML = S.servicios.map((s) => `
    <article class="service reveal">
      <span class="well">${icon(s.icono)}</span>
      <h3>${esc(s.nombre)}</h3>
      <p>${esc(s.texto)}</p>
      <a class="link" target="_blank" rel="noopener"
         href="${esc(wa(`¡Hola Maileny! 🌸 Quiero reservar: ${s.nombre}.`))}">
        ${icon("wa")}Reservar este tratamiento
      </a>
    </article>`).join("");

  // About
  $("#about-text").innerHTML = S.sobreMi.parrafos.map((p) => `<p>${esc(p)}</p>`).join("");
  $("#about-chips").innerHTML = S.sobreMi.chips.map((c) => `<li>${esc(c)}</li>`).join("");
  if (S.sobreMi.foto) {
    $("#about-photo .arch-inner").innerHTML =
      `<img src="assets/img/${esc(S.sobreMi.foto)}" alt="${esc(S.sobreMi.nombre)}" loading="lazy">`;
  }

  // Gallery
  const sprig = `<svg viewBox="0 0 120 160" aria-hidden="true"><use href="#sprig"/></svg>`;
  const media = (item) => item.foto
    ? `<img src="assets/img/${esc(item.foto)}" alt="${esc(item.titulo)}" loading="lazy">`
    : `<span class="placeholder">${sprig}</span>`;

  $("#gallery").innerHTML = S.galeria.map((g, i) => `
    <button class="tile reveal" data-cat="${esc(g.categoria)}" data-i="${i}" aria-label="Ver ${esc(g.titulo)}">
      <span class="tile-media">${media(g)}</span>
      <span class="tile-cap">${esc(g.titulo)}</span>
    </button>`).join("");

  $$(".chip-btn").forEach((btn) => btn.addEventListener("click", () => {
    $$(".chip-btn").forEach((b) => {
      b.classList.toggle("is-active", b === btn);
      b.setAttribute("aria-pressed", b === btn);
    });
    const f = btn.dataset.filter;
    $$(".tile").forEach((t) => t.classList.toggle("is-hidden", f !== "todos" && t.dataset.cat !== f));
  }));

  // Lightbox: steps through the tiles the current filter shows; the page behind is inert
  const lb = $("#lightbox");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lbBehind = [$("#header"), $("main"), $("footer"), $(".wa-float")];
  let current = null;
  const showTile = (tile) => {
    const g = S.galeria[tile.dataset.i];
    current = tile;
    $("#lb-media").innerHTML = media(g);
    $("#lb-cap").textContent = g.titulo;
  };
  const stepLb = (d) => {
    const tiles = $$(".tile:not(.is-hidden)");
    showTile(tiles[(tiles.indexOf(current) + d + tiles.length) % tiles.length]);
  };
  const closeLb = () => {
    lb.hidden = true;
    document.body.style.overflow = "";
    lbBehind.forEach((el) => (el.inert = false));
    current && current.focus();
  };
  $("#gallery").addEventListener("click", (e) => {
    const tile = e.target.closest(".tile");
    if (!tile) return;
    showTile(tile);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    lbBehind.forEach((el) => (el.inert = true));
    $("#lb-close").focus();
  });
  $("#lb-close").addEventListener("click", closeLb);
  $("#lb-prev").addEventListener("click", () => stepLb(-1));
  $("#lb-next").addEventListener("click", () => stepLb(1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    else if (e.key === "ArrowLeft") stepLb(-1);
    else if (e.key === "ArrowRight") stepLb(1);
    else if (e.key === "Tab") {
      const items = $$("button", lb);
      const i = items.indexOf(document.activeElement);
      e.preventDefault();
      items[e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i + 1) % items.length].focus();
    }
  });

  // Horizontal swipe on touch screens
  const onSwipe = (el, fn) => {
    let x0 = null, y0 = 0;
    el.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    el.addEventListener("touchend", (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) fn(dx < 0 ? 1 : -1);
    });
  };
  onSwipe($("#lb-media"), stepLb);

  // Testimonials slider
  const stars = (n) => `<span class="stars" aria-label="${n} de 5 estrellas">${icon("star", "").repeat(n)}</span>`;
  $("#slides").innerHTML = S.testimonios.map((t, i) => `
    <figure class="slide${i ? "" : " is-active"}" style="margin:0">
      ${stars(t.estrellas)}
      <blockquote>“${esc(t.texto)}”</blockquote>
      <cite>— ${esc(t.nombre)}</cite>
    </figure>`).join("");
  $("#dots").innerHTML = S.testimonios.map((_, i) =>
    `<button class="dot${i ? "" : " is-active"}" aria-label="Testimonio ${i + 1}"${i ? "" : ' aria-current="true"'}></button>`).join("");

  // Auto-advance (never with reduced motion) pauses while hovered, focused or the tab is hidden.
  // Only changes the visitor makes are announced to screen readers.
  let cur = 0, timer;
  const holds = new Set();
  const slider = $(".slider"), slidesEl = $("#slides");
  const slides = $$(".slide"), dots = $$(".dot");
  const show = (i) => {
    cur = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("is-active", k === cur));
    dots.forEach((d, k) => {
      d.classList.toggle("is-active", k === cur);
      d.toggleAttribute("aria-current", k === cur);
    });
  };
  const auto = () => {
    clearInterval(timer);
    if (!reduced && !holds.size) timer = setInterval(() => show(cur + 1), 6500);
  };
  const hold = (key, on) => { on ? holds.add(key) : holds.delete(key); auto(); };
  const go = (i) => { slidesEl.setAttribute("aria-live", "polite"); show(i); auto(); };
  $("#prev").addEventListener("click", () => go(cur - 1));
  $("#next").addEventListener("click", () => go(cur + 1));
  dots.forEach((d, i) => d.addEventListener("click", () => go(i)));
  onSwipe(slidesEl, (d) => go(cur + d));
  slider.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && hold("hover", true));
  slider.addEventListener("pointerleave", () => hold("hover", false));
  slider.addEventListener("focusin", () => hold("focus", true));
  slider.addEventListener("focusout", (e) => !slider.contains(e.relatedTarget) && hold("focus", false));
  document.addEventListener("visibilitychange", () => hold("hidden", document.hidden));
  auto();

  // FAQ: <details name> keeps one answer open at a time
  $("#faq").innerHTML = S.preguntas.map((f) => `
    <details class="faq-item reveal" name="faq">
      <summary>${esc(f.pregunta)}<span class="faq-icon" aria-hidden="true"></span></summary>
      <div class="faq-body"><p>${esc(f.respuesta)}</p></div>
    </details>`).join("");

  // Instagram tiles (reuse gallery photos when present)
  const igIcons = ["sparkle", "drop", "flower", "leaf", "heart", "sun"];
  $("#ig-grid").innerHTML = igIcons.map((ic, i) => {
    const g = S.galeria[i];
    const inner = g && g.foto
      ? `<img src="assets/img/${esc(g.foto)}" alt="" loading="lazy">`
      : `<div class="placeholder">${icon(ic, "")}</div>`;
    return `<a class="ig-tile" href="${igUrl}" target="_blank" rel="noopener" aria-label="Ver en Instagram">${inner}</a>`;
  }).join("");

  // Contact
  const q = encodeURIComponent(S.contacto.mapa);
  $("#map").src = `https://www.google.com/maps?q=${q}&output=embed`;
  $("#maps-link").href = `https://www.google.com/maps/search/?api=1&query=${q}`;
  $("#hours").innerHTML = S.contacto.horario.map(([d, h]) => `<dt>${esc(d)}</dt><dd>${esc(h)}</dd>`).join("");
  $("#year").textContent = new Date().getFullYear();

  // Structured data for Google (business card + FAQ), built from content.js
  const ld = (data) => {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(data);
    document.head.append(s);
  };
  const site = location.origin + location.pathname.replace(/index\.html$/, "");
  const phone = (S.contacto.whatsapp || "").replace(/\D/g, "");
  ld({
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: "Maileny Skincare",
    description: S.hero.texto,
    url: site,
    image: site + "assets/img/og.jpg",
    logo: site + "assets/img/logo.png",
    address: S.contacto.direccion,
    ...(phone && { telephone: "+" + phone }),
    sameAs: [igUrl, threadsUrl],
    founder: { "@type": "Person", name: S.sobreMi.nombre, jobTitle: S.sobreMi.cargo },
    makesOffer: S.servicios.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.nombre, description: s.texto } }))
  });
  ld({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: S.preguntas.map((f) => ({ "@type": "Question", name: f.pregunta, acceptedAnswer: { "@type": "Answer", text: f.respuesta } }))
  });

  // Header: shadow on scroll, mobile menu, active link
  const header = $("#header");
  const menuBtn = $("#menu-btn"), links = $("#nav-links");
  const onScroll = () => header.classList.toggle("scrolled", scrollY > 20);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu: while open, focus stays between the toggle and the links
  // and the rest of the page is inert.
  const behind = [$("main"), $("footer"), $(".wa-float"), $(".brand"), $(".nav-cta")];
  const isOpen = () => links.classList.contains("open");
  const setMenu = (open, restoreFocus = true) => {
    links.classList.toggle("open", open);
    document.documentElement.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", open);
    menuBtn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    behind.forEach((el) => el && (el.inert = open));
    if (open) $("a", links).focus();
    else if (restoreFocus) menuBtn.focus();
  };
  menuBtn.addEventListener("click", () => setMenu(!isOpen()));
  $$("a", links).forEach((a) => a.addEventListener("click", () => setMenu(false, false)));
  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;
    if (e.key === "Escape") return setMenu(false);
    if (e.key !== "Tab") return;
    const items = [menuBtn, ...$$("a", links)];
    const i = items.indexOf(document.activeElement);
    const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i + 1) % items.length;
    e.preventDefault();
    items[next].focus();
  });
  matchMedia("(min-width: 901px)").addEventListener("change", (e) => e.matches && isOpen() && setMenu(false, false));

  const navMap = new Map($$("a", links).map((a) => [a.getAttribute("href").slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const a = navMap.get(en.target.id);
      if (!a) return;
      navMap.forEach((l) => l.classList.remove("active"));
      a.classList.add("active");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach((s) => spy.observe(s));

  // Reveal on scroll, staggered within each group
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const sibs = $$(":scope > .reveal", el.parentElement);
      el.style.transitionDelay = `${Math.min(sibs.indexOf(el), 5) * 90}ms`;
      el.classList.add("is-visible");
      // drop the stagger once revealed so hover effects aren't delayed
      setTimeout(() => (el.style.transitionDelay = ""), 1400);
      io.unobserve(el);
    });
  }, { threshold: 0.15 });
  $$(".reveal").forEach((el) => io.observe(el));
  $$(".sprig").forEach((el) => io.observe(el));

  // ---- Motion: everything below is skipped when the visitor prefers reduced motion
  if (reduced) return;

  // Gallery images get a gentle inner parallax
  $$(".tile-media > *").forEach((el) => (el.dataset.parallax = "-.08"));

  // Scroll parallax + progress bar, measured against each element's parent
  // (the element itself moves, its parent doesn't)
  const layers = $$("[data-parallax]").map((el) => ({ el, speed: parseFloat(el.dataset.parallax) || 0 }));
  const bar = $("#progress-bar");
  const small = matchMedia("(max-width: 560px)");
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = innerHeight;
    const damp = small.matches ? 0.5 : 1;
    layers.forEach(({ el, speed }) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const offset = (r.top + r.height / 2 - vh / 2) * speed * damp;
      el.style.setProperty("--py", `${offset.toFixed(1)}px`);
    });
    const max = document.documentElement.scrollHeight - vh;
    bar.style.setProperty("--p", max > 0 ? (scrollY / max).toFixed(4) : 0);
  };
  const requestUpdate = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener("scroll", requestUpdate, { passive: true });
  addEventListener("resize", requestUpdate);
  update();

  // Pointer tilt: hero logo follows the cursor, service cards lean toward it
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const tilt = (el, x, y, max) => {
      el.style.setProperty("--ty", `${(x * max).toFixed(2)}deg`);
      el.style.setProperty("--tx", `${(-y * max).toFixed(2)}deg`);
    };
    const ring = $("#lid-ring");
    $(".hero").addEventListener("pointermove", (e) => {
      const r = ring.getBoundingClientRect();
      tilt(ring, (e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5, 10);
    });
    $(".hero").addEventListener("pointerleave", () => tilt(ring, 0, 0, 0));

    $$(".service").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        tilt(card, (e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5, 8);
      });
      card.addEventListener("pointerleave", () => tilt(card, 0, 0, 0));
    });
  }

  // Count up numbers in the trust badges (e.g. "+3,400 seguidoras")
  $$(".pebble strong").forEach((el) => {
    const m = el.textContent.match(/^(\D*)(\d[\d,]*)(.*)$/);
    if (!m) return;
    const target = parseInt(m[2].replace(/,/g, ""), 10);
    const fmt = (n) => m[1] + n.toLocaleString("en-US") + m[3];
    const start = performance.now() + 800;
    const step = (now) => {
      const t = Math.min(Math.max((now - start) / 1600, 0), 1);
      el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(step);
    };
    el.textContent = fmt(0);
    requestAnimationFrame(step);
  });
})();
