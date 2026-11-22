(function () {
  "use strict";
  var C = window.SITE_CONFIG, D = window.DEFAULT_DATA;
  var db = null;

  if (C.firebaseEnabled && window.firebase) {
    try {
      firebase.initializeApp(C.firebase);
      db = firebase.firestore();
    } catch (e) { console.warn("Firebase indisponível, a usar dados por defeito.", e); }
  }

  /* ---------- utilidades ---------- */
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  var ICONS = ["play","music","trophy","mic","disc","pin","star","users","calendar","clock","headphones","video","download","mail","phone","chat","arrow"];
  function ic(name) {
    var n = ICONS.indexOf(name) > -1 ? name : "star";
    return '<svg class="i"><use href="#i-' + n + '"/></svg>';
  }
  function url(u) { return /^https?:\/\//i.test(u || "") ? u : ""; }
  function fmtDate(d) {
    if (!d) return "";
    var dt = new Date(d); if (isNaN(dt)) return esc(d);
    return dt.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });
  }

  async function loadCol(name) {
    if (!db) return D[name];
    try {
      var snap = await db.collection(name).orderBy("order").get();
      var arr = snap.docs.map(function (d) { var o = d.data(); o.id = d.id; return o; });
      return arr.length ? arr : D[name];
    } catch (e) { console.warn(name, e); return D[name]; }
  }
  async function loadSettings() {
    var base = Object.assign({}, D.settings);
    if (!db) return base;
    try {
      var d = await db.collection("settings").doc("site").get();
      if (d.exists) {
        var o = d.data();
        Object.keys(o).forEach(function (k) { if (o[k] !== "" && o[k] != null) base[k] = o[k]; });
      }
    } catch (e) { console.warn("settings", e); }
    return base;
  }

  /* ---------- render ---------- */
  function renderSongs(list) {
    var box = $("songs");
    if (!list.length) { box.innerHTML = '<p class="empty">Em breve.</p>'; return; }
    box.innerHTML = list.map(function (s, i) {
      var thumb = url(s.cover) ? '<img src="' + esc(s.cover) + '" alt="Capa de ' + esc(s.title) + '" loading="lazy">' : esc((s.title || "?").charAt(0).toUpperCase());
      var sp = url(s.spotify), yt = url(s.youtube);
      return '<article class="track reveal"><span class="n">' + String(i + 1).padStart(2, "0") + '</span>' +
        '<div class="thumb">' + thumb + '</div>' +
        '<div><h3>' + esc(s.title) + '</h3><span class="meta">' + [esc(s.feat), esc(s.year), esc(s.desc)].filter(Boolean).join("  ·  ") + '</span></div>' +
        '<div class="links">' +
        (sp ? '<a class="link red" href="' + esc(sp) + '" target="_blank" rel="noopener">' + ic("play") + 'Spotify</a>' : '') +
        (yt ? '<a class="link" href="' + esc(yt) + '" target="_blank" rel="noopener">' + ic("video") + 'YouTube</a>' : '') +
        '</div></article>';
    }).join("");
  }

  var pendingDownload = "";
  function renderDownloads(list) {
    var box = $("downloadsList");
    box.innerHTML = list.map(function (d) {
      var u = url(d.url), social = /spotify|youtube|facebook|instagram|tiktok/i.test(u);
      var icon = u ? (social ? "headphones" : "download") : "clock";
      return '<article class="cell reveal"><div class="ico">' + ic(icon) + '</div>' +
        '<h3>' + esc(d.title) + '</h3><p>' + esc(d.desc) + '</p>' +
        '<div class="links">' +
        (u ? '<a class="link' + (social ? '' : ' red') + '" data-dl="' + esc(u) + '" href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(d.label || "Abrir") + ic("arrow") + '</a>'
           : '<span class="link" aria-disabled="true">' + esc(d.label || "Em breve") + '</span>') +
        '</div></article>';
    }).join("");
    if (C.downloadGate) {
      box.querySelectorAll("a[data-dl]").forEach(function (a) {
        if (/spotify|youtube|facebook|instagram|tiktok/i.test(a.dataset.dl)) return;
        a.addEventListener("click", function (e) {
          e.preventDefault(); pendingDownload = a.dataset.dl; $("gate").hidden = false;
        });
      });
    }
  }

  function renderNews(list) {
    var box = $("newsList");
    if (!list.length) { box.innerHTML = '<p class="empty">Sem novidades por agora.</p>'; return; }
    box.innerHTML = list.map(function (n) {
      var l = url(n.link);
      return '<article class="cell reveal">' +
        (url(n.image) ? '<div class="pic"><img src="' + esc(n.image) + '" alt="" loading="lazy"></div>' : '') +
        (n.date ? '<span class="meta">' + fmtDate(n.date) + '</span>' : '') +
        '<h3>' + esc(n.title) + '</h3><p>' + esc(n.text) + '</p>' +
        (l ? '<div class="links"><a class="link" href="' + esc(l) + '" target="_blank" rel="noopener">Ler mais' + ic("arrow") + '</a></div>' : '') +
        '</article>';
    }).join("");
  }

  function renderFacts(list) {
    $("factsList").innerHTML = list.map(function (f) {
      return '<article class="cell reveal"><div class="ico line">' + ic(f.icon) + '</div><h3>' + esc(f.title) + '</h3><p>' + esc(f.text) + '</p></article>';
    }).join("");
  }

  var timer = null;
  function renderRelease(s) {
    $("relTitle").textContent = s.releaseTitle || "Novo lançamento";
    $("relDesc").textContent = s.releaseDesc || "";
    var l = url(s.releaseLink), a = $("relLink");
    if (l) { a.href = l; a.hidden = false; } else a.hidden = true;
    $("relFollow").href = C.social.instagram;
    clearInterval(timer);
    var target = s.releaseDate ? new Date(s.releaseDate).getTime() : NaN;
    if (isNaN(target) || target <= Date.now()) {
      $("countdown").hidden = true; $("relSoon").hidden = false;
      $("relSoon").textContent = (!isNaN(target) && target <= Date.now()) ? "JÁ DISPONÍVEL" : "EM BREVE";
      return;
    }
    $("countdown").hidden = false; $("relSoon").hidden = true;
    function tick() {
      var d = Math.max(0, target - Date.now());
      var p = function (n) { return String(n).padStart(2, "0"); };
      $("cdD").textContent = p(Math.floor(d / 864e5));
      $("cdH").textContent = p(Math.floor(d % 864e5 / 36e5));
      $("cdM").textContent = p(Math.floor(d % 36e5 / 6e4));
      $("cdS").textContent = p(Math.floor(d % 6e4 / 1e3));
      if (d === 0) { clearInterval(timer); renderRelease(s); }
    }
    tick(); timer = setInterval(tick, 1000);
  }

  function renderStatic(s) {
    $("heroBio").textContent = s.bio || "";
    $("heroSpotify").href = C.social.spotify;
    $("plSpotify").href = C.social.spotify;
    $("plYoutube").href = C.social.youtube;
    $("spotifyFrame").src = "https://open.spotify.com/embed/artist/" + C.social.spotifyId + "?utm_source=generator&theme=0";
    if (url(s.heroImage)) { var im = $("heroImg"); im.src = s.heroImage; im.hidden = false; $("heroVisual").querySelectorAll(".mono,.cap").forEach(function (x) { x.hidden = true; }); }
    var pk = $("pressKit"); if (url(s.pressKit)) { pk.href = s.pressKit; pk.hidden = false; }

    $("contactList").innerHTML =
      '<li><a href="mailto:' + esc(C.contact.email) + '">' + ic("mail") + '<div><small>E-mail para espectáculos</small><b>' + esc(C.contact.email) + '</b></div></a></li>' +
      C.contact.phones.map(function (p) {
        return '<li><a href="https://wa.me/' + p.wa + '" target="_blank" rel="noopener">' + ic("phone") + '<div><small>WhatsApp · ' + esc(p.label) + '</small><b>' + esc(p.display) + '</b></div></a></li>';
      }).join("");

    var soc = [["Instagram", C.social.instagram], ["YouTube", C.social.youtube], ["Spotify", C.social.spotify], ["Facebook", C.social.facebook], ["TikTok", C.social.tiktok]];
    $("socials").innerHTML = soc.map(function (x) { return '<a class="link" href="' + x[1] + '" target="_blank" rel="noopener">' + x[0] + ic("arrow") + '</a>'; }).join("");
    $("year").textContent = new Date().getFullYear();
  }

  /* ---------- formulário de show ---------- */
  function setupBooking() {
    var f = $("bookingForm"), msg = $("formMsg");
    f.addEventListener("submit", async function (e) {
      e.preventDefault();
      var d = Object.fromEntries(new FormData(f).entries());
      if (!d.name.trim() || !d.phone.trim()) { msg.textContent = "Preenche o nome e o telefone."; return; }
      var text = "Olá! Pedido de show para Anderson Mário.\n" +
        "Nome: " + d.name + "\nTelefone: " + d.phone + "\nEvento: " + d.type +
        "\nData: " + (d.date || "a definir") + "\nLocal: " + (d.city || "a definir") +
        "\nOrçamento: " + (d.budget || "a combinar") + "\nMensagem: " + (d.message || "-");
      if (db) {
        try {
          await db.collection("bookings").add({
            name: d.name.slice(0, 120), phone: d.phone.slice(0, 40), type: d.type, date: d.date || "",
            city: (d.city || "").slice(0, 120), budget: (d.budget || "").slice(0, 60),
            message: (d.message || "").slice(0, 1500), createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        } catch (err) { console.warn("booking não guardado", err); }
      }
      msg.textContent = "A abrir o WhatsApp para concluíres o envio…";
      window.open("https://wa.me/" + C.contact.phones[0].wa + "?text=" + encodeURIComponent(text), "_blank", "noopener");
      f.reset();
    });
  }

  /* ---------- gate de download ---------- */
  function setupGate() {
    var g = $("gate");
    $("gateCancel").onclick = function () { g.hidden = true; };
    $("gateForm").addEventListener("submit", async function (e) {
      e.preventDefault();
      var d = Object.fromEntries(new FormData(e.target).entries());
      if (db) {
        try { await db.collection("leads").add({ name: d.name.slice(0, 120), phone: d.phone.slice(0, 40), file: pendingDownload.slice(0, 500), createdAt: firebase.firestore.FieldValue.serverTimestamp() }); }
        catch (err) { console.warn("lead não guardado", err); }
      }
      g.hidden = true; e.target.reset();
      window.open(pendingDownload, "_blank", "noopener");
    });
  }

  /* ---------- UI ---------- */
  function setupNav() {
    var b = $("burger"), m = $("menu");
    b.addEventListener("click", function () { b.classList.toggle("on"); m.classList.toggle("open"); });
    m.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { b.classList.remove("on"); m.classList.remove("open"); }); });
  }
  function observeReveal() {
    var els = document.querySelectorAll(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { threshold: .12 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- arranque ---------- */
  async function init() {
    setupNav(); setupBooking(); setupGate();
    var r = await Promise.all([loadSettings(), loadCol("songs"), loadCol("downloads"), loadCol("news"), loadCol("curiosities")]);
    renderStatic(r[0]); renderRelease(r[0]);
    renderSongs(r[1]); renderDownloads(r[2]); renderNews(r[3]); renderFacts(r[4]);
    observeReveal();
  }
  init();
})();
