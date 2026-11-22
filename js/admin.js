(function () {
  "use strict";
  var C = window.SITE_CONFIG;
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  if (!C.firebaseEnabled || !window.firebase) { $("noFb").hidden = false; return; }
  firebase.initializeApp(C.firebase);
  var auth = firebase.auth(), db = firebase.firestore(), storage = firebase.storage();

  /* Esquema de cada colecção: [campo, rótulo, tipo] — tipos: text | area | image | url | date */
  var SCHEMA = {
    songs: { label: "Músicas", title: "title", sub: "feat", fields: [
      ["title", "Título", "text"], ["feat", "Participação (ex.: feat. Fulano)", "text"], ["year", "Ano", "text"],
      ["desc", "Tipo (Single, Álbum…)", "text"], ["cover", "Capa", "image"],
      ["spotify", "Link Spotify", "url"], ["youtube", "Link YouTube", "url"]] },
    downloads: { label: "Downloads", title: "title", sub: "desc", fields: [
      ["title", "Título", "text"], ["desc", "Descrição", "area"], ["label", "Texto do botão", "text"],
      ["url", "Link do ficheiro (MP3, Drive…)", "url"]] },
    news: { label: "Novidades", title: "title", sub: "date", fields: [
      ["title", "Título", "text"], ["date", "Data", "date"], ["text", "Texto", "area"],
      ["image", "Imagem", "image"], ["link", "Link (opcional)", "url"]] },
    curiosities: { label: "Curiosidades", title: "title", sub: "text", fields: [
      ["icon", "Ícone", "icon"], ["title", "Título", "text"], ["text", "Texto", "area"]] }
  };
  var TABS = ["songs", "downloads", "news", "curiosities", "settings", "bookings", "leads"];
  var LABELS = { settings: "Site & Lançamento", bookings: "Pedidos de show", leads: "Contactos de fãs" };
  var current = "songs";

  /* ---------- auth ---------- */
  auth.onAuthStateChanged(function (u) {
    $("loginForm").hidden = !!u; $("panel").hidden = !u;
    if (u) { buildTabs(); show(current); }
  });
  $("loginForm").addEventListener("submit", function (e) {
    e.preventDefault(); $("loginMsg").textContent = "";
    auth.signInWithEmailAndPassword($("email").value, $("pass").value)
      .catch(function () { $("loginMsg").textContent = "E-mail ou palavra-passe incorrectos."; });
  });
  $("logout").onclick = function () { auth.signOut(); };

  function buildTabs() {
    $("tabs").innerHTML = TABS.map(function (t) {
      return '<button data-t="' + t + '" class="' + (t === current ? "on" : "") + '">' + esc((SCHEMA[t] && SCHEMA[t].label) || LABELS[t]) + '</button>';
    }).join("");
    $("tabs").querySelectorAll("button").forEach(function (b) {
      b.onclick = function () { current = b.dataset.t; buildTabs(); show(current); };
    });
  }
  function show(t) {
    if (SCHEMA[t]) return crud(t);
    if (t === "settings") return settings();
    return readOnly(t);
  }

  /* ---------- upload de imagem ---------- */
  function uploadInput(input, status) {
    return function (e) {
      var f = e.target.files[0]; if (!f) return;
      if (!/^image\//.test(f.type) || f.size > 5 * 1024 * 1024) { status.textContent = "Usa uma imagem até 5 MB."; return; }
      status.textContent = "A enviar…";
      var ref = storage.ref("uploads/" + Date.now() + "-" + f.name.replace(/[^\w.\-]/g, "_"));
      ref.put(f).then(function () { return ref.getDownloadURL(); })
        .then(function (u) { input.value = u; status.textContent = "Imagem enviada"; })
        .catch(function () { status.textContent = "Falha no envio (verifica as regras do Storage)."; });
    };
  }
  function fieldHtml(f, val) {
    var n = f[0], lab = f[1], t = f[2], v = esc(val || "");
    if (t === "area") return '<label>' + lab + '<textarea name="' + n + '" rows="3">' + v + '</textarea></label>';
    if (t === "image") return '<label>' + lab + '<div class="imgrow"><input name="' + n + '" value="' + v + '" placeholder="Cola um link ou envia ficheiro"><input type="file" accept="image/*" data-up="' + n + '"></div><span class="note" data-st="' + n + '"></span></label>';
    if (t === "icon") {
      var names = ["star", "music", "trophy", "mic", "disc", "pin", "users", "calendar", "headphones", "video", "clock", "play"];
      return '<label>' + lab + '<select name="' + n + '">' + names.map(function (x) {
        return '<option value="' + x + '"' + (x === (val || "star") ? " selected" : "") + '>' + x + '</option>';
      }).join("") + '</select></label>';
    }
    if (t === "date") return '<label>' + lab + '<input type="date" name="' + n + '" value="' + v + '"></label>';
    return '<label>' + lab + '<input name="' + n + '" value="' + v + '"></label>';
  }
  function bindUploads(form) {
    form.querySelectorAll("input[data-up]").forEach(function (fi) {
      var name = fi.dataset.up;
      fi.addEventListener("change", uploadInput(form.elements[name], form.querySelector('[data-st="' + name + '"]')));
    });
  }

  /* ---------- CRUD ---------- */
  async function crud(col) {
    var S = SCHEMA[col], editing = null;
    var snap = await db.collection(col).orderBy("order").get();
    var rows = snap.docs.map(function (d) { var o = d.data(); o.id = d.id; return o; });

    $("view").innerHTML = '<div class="adm-grid"><div class="box"><h3 id="formTitle" style="margin-bottom:14px">Adicionar</h3>' +
      '<form class="adm-form" id="f">' + S.fields.map(function (f) { return fieldHtml(f, ""); }).join("") +
      '<div class="btns" style="margin:6px 0 0"><button class="btn btn-primary" type="submit">Guardar</button>' +
      '<button class="btn btn-ghost" type="button" id="cancel" hidden>Cancelar edição</button></div><p class="note" id="msg"></p></form></div>' +
      '<div class="box"><h3 style="margin-bottom:14px">' + esc(S.label) + ' (' + rows.length + ')</h3><div id="list">' +
      (rows.length ? rows.map(function (r) {
        return '<div class="item"><div><b>' + esc(r[S.title]) + '</b><small>' + esc((r[S.sub] || "").toString().slice(0, 70)) + '</small></div>' +
          '<div class="acts"><button class="link" data-e="' + r.id + '">Editar</button><button class="link danger" data-d="' + r.id + '">Apagar</button></div></div>';
      }).join("") : '<p class="meta">Ainda vazio. O site mostra os dados de exemplo até adicionares o primeiro item.</p>') +
      '</div></div></div>';

    var form = $("f"); bindUploads(form);
    function reset() { editing = null; form.reset(); $("formTitle").textContent = "Adicionar"; $("cancel").hidden = true; }
    $("cancel").onclick = reset;

    $("list").querySelectorAll("[data-e]").forEach(function (b) {
      b.onclick = function () {
        var r = rows.find(function (x) { return x.id === b.dataset.e; }); editing = r.id;
        S.fields.forEach(function (f) { form.elements[f[0]].value = r[f[0]] || (f[2] === "icon" ? "star" : ""); });
        $("formTitle").textContent = "Editar"; $("cancel").hidden = false; window.scrollTo({ top: 0, behavior: "smooth" });
      };
    });
    $("list").querySelectorAll("[data-d]").forEach(function (b) {
      b.onclick = async function () {
        if (!confirm("Apagar este item?")) return;
        await db.collection(col).doc(b.dataset.d).delete(); crud(col);
      };
    });
    form.onsubmit = async function (e) {
      e.preventDefault();
      var data = {};
      S.fields.forEach(function (f) { data[f[0]] = form.elements[f[0]].value.trim(); });
      if (!data[S.title]) { $("msg").textContent = "Falta o título."; return; }
      try {
        if (editing) await db.collection(col).doc(editing).update(data);
        else { data.order = -Date.now(); await db.collection(col).add(data); }
        crud(col);
      } catch (err) { $("msg").textContent = "Erro ao guardar: " + err.message; }
    };
  }

  /* ---------- definições do site ---------- */
  async function settings() {
    var doc = await db.collection("settings").doc("site").get(), s = doc.exists ? doc.data() : {};
    var F = [
      ["bio", "Biografia curta (página inicial)", "area"], ["heroImage", "Foto principal (página inicial)", "image"],
      ["pressKit", "Link do press kit (PDF)", "url"],
      ["releaseTitle", "Próximo lançamento — título", "text"], ["releaseDesc", "Próximo lançamento — descrição", "area"],
      ["releaseDate", "Data de lançamento (deixa vazio para 'Em breve')", "date"], ["releaseLink", "Link do lançamento", "url"]];
    $("view").innerHTML = '<div class="box" style="max-width:640px"><form class="adm-form" id="sf">' +
      F.map(function (f) { return fieldHtml(f, s[f[0]]); }).join("") +
      '<button class="btn btn-primary" type="submit">Guardar</button><p class="note" id="smsg"></p></form></div>';
    var form = $("sf"); bindUploads(form);
    form.onsubmit = async function (e) {
      e.preventDefault(); var data = {};
      F.forEach(function (f) { data[f[0]] = form.elements[f[0]].value.trim(); });
      try { await db.collection("settings").doc("site").set(data, { merge: true }); $("smsg").textContent = "Guardado"; }
      catch (err) { $("smsg").textContent = "Erro: " + err.message; }
    };
  }

  /* ---------- listas só de leitura ---------- */
  async function readOnly(col) {
    var snap = await db.collection(col).orderBy("createdAt", "desc").limit(100).get();
    var rows = snap.docs.map(function (d) { var o = d.data(); o.id = d.id; return o; });
    $("view").innerHTML = '<div class="box"><h3 style="margin-bottom:14px">' + esc(LABELS[col]) + ' (' + rows.length + ')</h3>' +
      (rows.length ? rows.map(function (r) {
        var when = r.createdAt && r.createdAt.toDate ? r.createdAt.toDate().toLocaleString("pt-PT") : "";
        var det = col === "bookings"
          ? [r.type, r.date, r.city, r.budget, r.message].filter(Boolean).join(" · ")
          : (r.file || "");
        var phone = String(r.phone || "").replace(/[^\d]/g, "");
        return '<div class="item"><div><b>' + esc(r.name) + ' — ' + esc(r.phone) + '</b><small>' + esc(det) + '</small><br><small>' + esc(when) + '</small></div>' +
          '<div class="acts">' + (phone ? '<a class="link red" target="_blank" rel="noopener" href="https://wa.me/' + phone + '">WhatsApp</a>' : '') +
          '<button class="link danger" data-d="' + r.id + '">Apagar</button></div></div>';
      }).join("") : '<p class="meta">Ainda não há registos.</p>') + '</div>';
    $("view").querySelectorAll("[data-d]").forEach(function (b) {
      b.onclick = async function () { if (confirm("Apagar este registo?")) { await db.collection(col).doc(b.dataset.d).delete(); readOnly(col); } };
    });
  }
})();
