/* Portfolio 3D de Bienvenu Cedrick Bakary Yapo
   HTML + Bootstrap + JavaScript + Three.js (r128).
   Principe : la page fait 8 écrans de haut ; le défilement déplace la caméra dans le salon.
   Le contenu (textes, projets, parcours) est dans js/data.js. */
(function () {
  "use strict";
  var T = THREE, D = window.PORTFOLIO;
  var GH = D.github, CV = D.cv;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var S = { p: 0, mx: 0, my: 0, hv: null };
  // 8 étapes : maison, nom, photo, bureau, projets, fauteuil, télé, téléphone
  var STEP = { home: 0, name: 1, photo: 2, desk: 3, projects: 4, sofa: 5, tv: 6, phone: 7 };
  var LAST = STEP.phone;

  /* ---------- Contenu ---------- */
  var PERSO = D.perso, ACAD = D.acad, PARC = D.parcours, SK = D.competences;

  /* ---------- Version texte (lecteurs d'écran) ---------- */
  function li(text, href) {
    var el = document.createElement("li");
    el.textContent = text;
    if (href) {
      var a = document.createElement("a");
      a.href = href; a.target = "_blank"; a.rel = "noopener";
      a.textContent = " Voir le code sur GitHub";
      el.appendChild(a);
    }
    return el;
  }
  PERSO.forEach(function (p) { document.getElementById("list-perso").appendChild(li(p[0] + " : " + p[1], GH + p[3])); });
  ACAD.forEach(function (p) { document.getElementById("list-acad").appendChild(li(p[0] + " : " + p[1], GH + p[3])); });
  PARC.forEach(function (p) { document.getElementById("list-parcours").appendChild(li(p[0] + " : " + p[1] + ", " + p[2])); });
  SK.forEach(function (s) {
    var dl = document.getElementById("list-skills"), dt = document.createElement("dt"), dd = document.createElement("dd");
    dt.textContent = s[0]; dd.textContent = s[1]; dl.appendChild(dt); dl.appendChild(dd);
  });

  /* ---------- Défilement et navigation ---------- */
  function go(i) { scrollTo({ top: i * innerHeight, behavior: reduce ? "auto" : "smooth" }); }
  function onScroll() {
    // innerHeight peut valoir 0 pendant le chargement : on évite alors une division par zéro (NaN)
    var p = innerHeight > 0 ? scrollY / innerHeight : 0;
    S.p = Math.min(Math.max(p || 0, 0), LAST);
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();
  var dots = [].slice.call(document.querySelectorAll(".dots button"));
  dots.forEach(function (b) { b.addEventListener("click", function () { go(+b.dataset.go); }); });

  function openLink(url) {
    if (url === "cv") window.open(CV, "_blank");
    else if (url.indexOf("mailto:") === 0) location.href = url;
    else window.open(url, "_blank", "noopener");
  }

  /* ---------- Le salon en 3D ---------- */
  var cv = document.getElementById("gl"), r;
  try { r = new T.WebGLRenderer({ canvas: cv, antialias: true }); } catch (e) { return; }
  r.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  r.outputEncoding = T.sRGBEncoding;
  r.toneMapping = T.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.0;
  r.shadowMap.enabled = true;
  r.shadowMap.type = T.PCFSoftShadowMap;

  var sc = new T.Scene();
  sc.background = new T.Color(0x12332b);
  var cam = new T.PerspectiveCamera(40, 1, 0.1, 60);

  var sd = 7;
  function rnd() { return (sd = (sd * 16807) % 2147483647) / 2147483647; }
  function M(c, o) { return new T.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.7, metalness: 0 }, o)); }
  function put(g, m, x, y, z, o) {
    o = o || {};
    var k = new T.Mesh(g, m);
    k.position.set(x, y, z);
    k.castShadow = o.c !== false; k.receiveShadow = o.r !== false;
    if (o.ry) k.rotation.y = o.ry;
    if (o.rx) k.rotation.x = o.rx;
    (o.p || sc).add(k);
    return k;
  }
  function B(w, hh, d, m, x, y, z, o) { return put(new T.BoxGeometry(w, hh, d), m, x, y, z, o); }
  // Texture dessinée en Canvas 2D ; redraw() la redessine (horloge, télé, polices chargées)
  function tex(w, hh, draw) {
    var c = document.createElement("canvas"); c.width = w; c.height = hh;
    var x = c.getContext("2d"); draw(x, w, hh);
    var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4;
    t.redraw = function () { draw(x, w, hh); t.needsUpdate = true; };
    return t;
  }
  function rr(x, a, b, w, hh, rad) {
    x.beginPath(); x.moveTo(a + rad, b); x.arcTo(a + w, b, a + w, b + hh, rad); x.arcTo(a + w, b + hh, a, b + hh, rad);
    x.arcTo(a, b + hh, a, b, rad); x.arcTo(a, b, a + w, b, rad); x.closePath();
  }
  function flat(t, w, hh, x, y, z, ry) {
    return put(new T.PlaneGeometry(w, hh), new T.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }), x, y, z, { c: false, r: false, ry: ry });
  }
  var texs = [], pick = [];

  // Murs, sol, plafond
  function wallM(c) { return M(c, { roughness: 0.95 }); }
  var WH = 7;
  put(new T.PlaneGeometry(12, WH), wallM(0x1f8a68), 0, WH / 2, -5, { c: false });
  put(new T.PlaneGeometry(11, WH), wallM(0x17705a), -6, WH / 2, 0.5, { c: false, ry: Math.PI / 2 });
  put(new T.PlaneGeometry(11, WH), wallM(0x17705a), 6, WH / 2, 0.5, { c: false, ry: -Math.PI / 2 });
  put(new T.PlaneGeometry(12, 11), wallM(0x1d4d3f), 0, WH, 0.5, { c: false, rx: Math.PI / 2 });
  var fl = tex(512, 512, function (x, w, hh) {
    x.fillStyle = "#b88a5a"; x.fillRect(0, 0, w, hh);
    for (var i = 0; i < 16; i++) {
      x.fillStyle = i % 2 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.06)"; x.fillRect(0, i * 32, w, 32);
      x.fillStyle = "rgba(60,35,15,.35)"; x.fillRect(0, i * 32, w, 2);
    }
  });
  put(new T.PlaneGeometry(12, 11), M(0xffffff, { map: fl, roughness: 0.55 }), 0, 0, 0.5, { c: false, rx: -Math.PI / 2 });
  put(new T.PlaneGeometry(3.4, 4.4), M(0x16352d, { roughness: 1 }), 3.7, 0.012, -0.8, { c: false, rx: -Math.PI / 2 });

  // Bureau
  var white = M(0xf4f4f0, { roughness: 0.5 }), dark = M(0x1b2024, { roughness: 0.6 });
  B(3.8, 0.1, 1.7, white, 0, 1.6, -4.05);
  [[-1.8, -4.75], [1.8, -4.75], [-1.8, -3.35], [1.8, -3.35]].forEach(function (p) { B(0.08, 1.55, 0.08, white, p[0], 0.8, p[1]); });
  B(1.8, 1.05, 0.06, dark, -0.6, 2.4, -4.35); B(0.1, 0.5, 0.1, dark, -0.6, 1.9, -4.35); B(0.6, 0.03, 0.35, dark, -0.6, 1.67, -4.3);

  // Écran : dossiers de compétences
  var FO = D.dossiers;
  var scrM = tex(1024, 580, function (x, W, H) {
    var g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#f77f00"); g.addColorStop(0.55, "#d9a12b"); g.addColorStop(1, "#009e60");
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = "rgba(255,255,255,.9)"; rr(x, 60, 40, W - 120, H - 120, 18); x.fill();
    ["#ff5f57", "#febc2e", "#28c840"].forEach(function (c, i) { x.fillStyle = c; x.beginPath(); x.arc(92 + i * 26, 68, 8, 0, 7); x.fill(); });
    x.textAlign = "center";
    FO.forEach(function (n, i) {
      var cx = 100 + (i % 4) * 206 + 103, cy = 115 + ((i / 4) | 0) * 125;
      x.fillStyle = "#7bbcf5"; rr(x, cx - 40, cy, 36, 14, 5); x.fill();
      x.fillStyle = "#4a9bec"; rr(x, cx - 40, cy + 8, 80, 56, 8); x.fill();
      x.fillStyle = "#2b3b3a"; x.font = "500 20px Hanken Grotesk,Arial,sans-serif"; x.fillText(n, cx, cy + 92);
    });
  });
  texs.push(scrM);
  put(new T.PlaneGeometry(1.7, 0.95), new T.MeshBasicMaterial({ map: scrM }), -0.6, 2.4, -4.312, { c: false, r: false });
  B(0.7, 0.02, 0.2, white, -0.6, 1.67, -3.72); B(0.07, 0.03, 0.11, white, -0.1, 1.67, -3.72);

  // Ordinateur portable
  var metal = M(0xc8ccd0, { metalness: 0.6, roughness: 0.4 });
  var scr = tex(512, 320, function (x, w, hh) {
    x.fillStyle = "#0f2a24"; x.fillRect(0, 0, w, hh);
    ["#f77f00", "#ffffff", "#009e60"].forEach(function (c, i) { x.fillStyle = c; x.beginPath(); x.arc(20 + i * 20, 20, 6, 0, 7); x.fill(); });
    x.fillStyle = "#fff"; x.font = "800 28px Unbounded,Arial Black,sans-serif"; x.fillText("Bienvenu Yapo", 24, 84);
    x.fillStyle = "#9fd8bd"; x.font = "20px Arial,sans-serif"; x.fillText("Développeur web et mobile", 24, 116);
    for (var i = 0; i < 7; i++) {
      x.fillStyle = i % 2 ? "#f77f00" : "#009e60"; x.fillRect(24, 150 + i * 20, 40 + ((i * 53) % 140), 8);
      x.fillStyle = "#3b5a50"; x.fillRect(80 + ((i * 53) % 140), 150 + i * 20, 90, 8);
    }
    x.fillStyle = "#fff"; x.font = "18px Arial,sans-serif"; x.fillText(D.email, 24, 306);
  });
  texs.push(scr);
  B(1.1, 0.04, 0.75, metal, 1.15, 1.67, -3.8);
  var lp = new T.Group(); lp.position.set(1.15, 2.02, -4.15); lp.rotation.x = -0.2; sc.add(lp);
  B(1.1, 0.7, 0.03, metal, 0, 0, 0, { p: lp });
  put(new T.PlaneGeometry(1.0, 0.6), new T.MeshBasicMaterial({ map: scr }), 0, 0, 0.017, { c: false, r: false, p: lp });
  put(new T.CylinderGeometry(0.09, 0.08, 0.14, 24), M(0xf77f00), -1.6, 1.72, -3.7);

  // Chaise pivotante
  var ch = new T.Group(); ch.position.set(0, 0, -2.5); sc.add(ch);
  put(new T.CylinderGeometry(0.55, 0.55, 0.06, 32), dark, 0, 0.1, 0, { p: ch });
  put(new T.CylinderGeometry(0.06, 0.06, 0.8, 16), dark, 0, 0.55, 0, { p: ch });
  B(1, 0.16, 1, dark, 0, 0.98, 0, { p: ch }); B(1, 1.1, 0.14, dark, 0, 1.6, 0.5, { p: ch });
  B(0.12, 0.4, 0.8, dark, -0.56, 1.2, 0, { p: ch }); B(0.12, 0.4, 0.8, dark, 0.56, 1.2, 0, { p: ch });
  put(new T.CylinderGeometry(0.28, 0.22, 0.55, 20), M(0x2b3a36), -2.3, 0.28, -4.3);

  // Pendule de Newton
  var ncm = M(0xc9d1d6, { metalness: 0.55, roughness: 0.25 }), nc = new T.Group(); nc.position.set(0.32, 1.65, -3.45); sc.add(nc);
  B(0.4, 0.02, 0.2, dark, 0, 0.01, 0, { p: nc });
  [-0.19, 0.19].forEach(function (px) { [-0.07, 0.07].forEach(function (pz) { B(0.012, 0.3, 0.012, ncm, px, 0.17, pz, { p: nc }); }); });
  [-0.07, 0.07].forEach(function (pz) { B(0.4, 0.012, 0.012, ncm, 0, 0.32, pz, { p: nc }); });
  var nb = [];
  for (var i = 0; i < 5; i++) {
    var pv = new T.Group(); pv.position.set(-0.12 + i * 0.06, 0.32, 0); nc.add(pv);
    put(new T.CylinderGeometry(0.0015, 0.0015, 0.2, 4), ncm, 0, -0.1, 0, { p: pv, c: false });
    put(new T.SphereGeometry(0.03, 16, 12), ncm, 0, -0.2, 0, { p: pv });
    nb.push(pv);
  }

  // Étagère murale, plante et guirlande
  B(2.6, 0.08, 0.4, white, 0, 3.5, -4.8);
  var bx = -0.9;
  for (i = 0; i < 9; i++) {
    var bw = 0.07 + rnd() * 0.07, bh = 0.3 + rnd() * 0.25;
    B(bw, bh, 0.26, M([0xf77f00, 0x009e60, 0xffffff, 0x1f5fbf, 0xe8e4d8][i % 5], { roughness: 0.8 }), bx + 0.2, 3.54 + bh / 2, -4.8);
    bx += bw + 0.012;
  }
  put(new T.CylinderGeometry(0.12, 0.09, 0.2, 20), M(0xf4f4f0), -1.0, 3.64, -4.8);
  var gm = M(0x2fbf71);
  [[0, 0.25, 0], [0.08, 0.38, 0.05], [-0.08, 0.34, -0.03], [0, 0.5, 0.02]].forEach(function (p) {
    put(new T.SphereGeometry(0.1, 12, 10), gm, -1.0 + p[0], 3.64 + p[1], -4.8 + p[2], { r: false });
  });
  var bms = [0xffc266, 0xfff4dc, 0x7dffb8].map(function (c) { return new T.MeshBasicMaterial({ color: c, toneMapped: false }); });
  for (i = 0; i < 17; i++) {
    var u = i / 16;
    put(new T.SphereGeometry(0.03, 8, 8), bms[i % 3], -1.4 + u * 2.8, 4.38 - Math.sin(u * Math.PI) * 0.2, -4.95, { c: false, r: false });
  }

  // Bibliothèque basse, devant à gauche (comme dans la vidéo)
  var bc = new T.Group(); bc.position.set(-5.6, 0, 3.3); bc.rotation.y = Math.PI / 2; sc.add(bc);
  B(0.06, 1.85, 0.7, white, -1.2, 0.92, 0, { p: bc }); B(0.06, 1.85, 0.7, white, 1.2, 0.92, 0, { p: bc }); B(2.4, 1.85, 0.04, white, 0, 0.92, -0.33, { p: bc });
  B(2.46, 0.06, 0.7, white, 0, 1.85, 0, { p: bc });
  for (i = 0; i < 2; i++) {
    var y = 0.05 + i * 0.9;
    B(2.4, 0.06, 0.7, white, 0, y, 0, { p: bc });
    var x = -1.12;
    while (x < 1.0) {
      var w2 = 0.08 + rnd() * 0.12, h2 = 0.4 + rnd() * 0.35;
      if (rnd() < 0.18) { x += 0.3; continue; }
      B(w2, h2, 0.45, M([0xf77f00, 0x009e60, 0xffffff, 0x1f5fbf, 0x8a1c2b, 0xe8e4d8][(rnd() * 6) | 0], { roughness: 0.8 }), x + w2 / 2, y + 0.03 + h2 / 2, 0, { p: bc });
      x += w2 + 0.012;
    }
  }

  // Horloge à l'heure réelle
  var clk = tex(256, 256, function (x, W) {
    var d = new Date(), c = W / 2;
    x.clearRect(0, 0, W, W);
    x.fillStyle = "#12201c"; x.beginPath(); x.arc(c, c, c - 4, 0, 7); x.fill();
    x.fillStyle = "#f4f4f0"; x.beginPath(); x.arc(c, c, c - 16, 0, 7); x.fill();
    x.strokeStyle = "#12201c"; x.lineCap = "round";
    for (var k = 0; k < 12; k++) {
      var a = k * Math.PI / 6; x.lineWidth = k % 3 ? 4 : 8;
      x.beginPath(); x.moveTo(c + Math.sin(a) * (c - 34), c - Math.cos(a) * (c - 34)); x.lineTo(c + Math.sin(a) * (c - 24), c - Math.cos(a) * (c - 24)); x.stroke();
    }
    function hand(a, l, w, col) { x.strokeStyle = col; x.lineWidth = w; x.beginPath(); x.moveTo(c, c); x.lineTo(c + Math.sin(a) * l, c - Math.cos(a) * l); x.stroke(); }
    var m = d.getMinutes() + d.getSeconds() / 60;
    hand((d.getHours() % 12 + m / 60) * Math.PI / 6, 60, 9, "#12201c");
    hand(m * Math.PI / 30, 92, 6, "#12201c");
    hand(d.getSeconds() * Math.PI / 30, 100, 3, "#f77f00");
    x.fillStyle = "#f77f00"; x.beginPath(); x.arc(c, c, 8, 0, 7); x.fill();
  });
  flat(clk, 0.8, 0.8, 3.75, 3.55, 5.96, Math.PI);

  // Photo encadrée et phrase d'accueil sur le mur du fond
  function frame(w, hh, map, x, y, z, ry, url) {
    var g = new T.Group(); g.position.set(x, y, z); g.rotation.y = ry; sc.add(g);
    B(w + 0.16, hh + 0.16, 0.08, white, 0, 0, 0, { p: g, r: false });
    var pl = put(new T.PlaneGeometry(w, hh), new T.MeshBasicMaterial({ map: map }), 0, 0, 0.045, { c: false, r: false, p: g });
    if (url) { pl.userData.url = url; pl.userData.fr = 1; pick.push(pl); }
    return pl;
  }
  // Médaillon décoratif (sans photo) : halo doux, anneau orange -> or -> vert, rosace dorée
  var medal = tex(1024, 1024, function (x, W) {
    var c = W / 2, k, a;
    x.clearRect(0, 0, W, W);
    var halo = x.createRadialGradient(c, c, 300, c, c, 510);
    halo.addColorStop(0, "rgba(255,211,106,.55)"); halo.addColorStop(1, "rgba(255,211,106,0)");
    x.fillStyle = halo; x.fillRect(0, 0, W, W);
    var ring = x.createLinearGradient(0, 0, W, W);
    ring.addColorStop(0, "#f77f00"); ring.addColorStop(0.5, "#ffd36a"); ring.addColorStop(1, "#009e60");
    x.fillStyle = ring; x.beginPath(); x.arc(c, c, 400, 0, 7); x.fill();
    var bg = x.createRadialGradient(c, c - 80, 40, c, c, 380);
    bg.addColorStop(0, "#1f6b55"); bg.addColorStop(1, "#0c2f26");
    x.fillStyle = bg; x.beginPath(); x.arc(c, c, 378, 0, 7); x.fill();
    x.save(); x.beginPath(); x.arc(c, c, 370, 0, 7); x.clip();
    // Rosace : douze cercles entrelacés
    x.strokeStyle = "rgba(255,211,106,.55)"; x.lineWidth = 3;
    for (k = 0; k < 12; k++) { a = k / 12 * Math.PI * 2; x.beginPath(); x.arc(c + Math.cos(a) * 150, c + Math.sin(a) * 150, 150, 0, 7); x.stroke(); }
    // Anneaux concentriques fins
    x.strokeStyle = "rgba(255,255,255,.18)"; x.lineWidth = 2;
    [90, 230, 300, 345].forEach(function (rad) { x.beginPath(); x.arc(c, c, rad, 0, 7); x.stroke(); });
    x.restore();
    // Losange central doré
    var g = x.createLinearGradient(c, c - 60, c, c + 60); g.addColorStop(0, "#ffe08a"); g.addColorStop(1, "#e0a526");
    x.fillStyle = g; x.beginPath(); x.moveTo(c, c - 60); x.lineTo(c + 42, c); x.lineTo(c, c + 60); x.lineTo(c - 42, c); x.closePath(); x.fill();
    for (k = 0; k < 18; k++) {
      a = k / 18 * Math.PI * 2;
      x.fillStyle = k % 3 === 0 ? "#f77f00" : k % 3 === 1 ? "#ffffff" : "#009e60";
      x.beginPath(); x.arc(c + Math.cos(a) * 450, c + Math.sin(a) * 450, k % 2 ? 7 : 11, 0, 7); x.fill();
    }
  });
  texs.push(medal);
  put(new T.PlaneGeometry(1.8, 1.8), new T.MeshBasicMaterial({ map: medal, transparent: true, toneMapped: false, depthWrite: false }), -2.95, 4.45, -4.96, { c: false, r: false });

  // Texte peint au centre du mur du fond, au-dessus de l'étagère (comme dans la vidéo)
  var hi = tex(1400, 360, function (x, W, H) {
    x.clearRect(0, 0, W, H); x.textAlign = "center"; x.shadowColor = "rgba(0,0,0,.35)"; x.shadowBlur = 10;
    x.fillStyle = "#fff"; x.font = "500 62px Hanken Grotesk,Arial,sans-serif";
    x.fillText("Je m’appelle Bienvenu Cedrick Bakary Yapo", W / 2, 110);
    // Deuxième ligne : « créatif » en grand et doré ; on réduit la taille jusqu'à ce que la ligne tienne
    var a = "Je suis un développeur web ", b = "créatif", c = " et mobile.", k = 1, wa, wb, wc;
    do {
      x.font = "500 " + Math.round(62 * k) + "px Hanken Grotesk,Arial,sans-serif"; wa = x.measureText(a).width; wc = x.measureText(c).width;
      x.font = "800 " + Math.round(96 * k) + "px Unbounded,Arial Black,sans-serif"; wb = x.measureText(b).width;
      k -= 0.05;
    } while (wa + wb + wc > W - 60 && k > 0.4);
    k += 0.05;
    var start = W / 2 - (wa + wb + wc) / 2; x.textAlign = "left";
    x.font = "500 " + Math.round(62 * k) + "px Hanken Grotesk,Arial,sans-serif"; x.fillStyle = "#fff"; x.fillText(a, start, 240);
    x.font = "800 " + Math.round(96 * k) + "px Unbounded,Arial Black,sans-serif"; x.fillStyle = "#ffd36a"; x.fillText(b, start + wa, 240);
    x.font = "500 " + Math.round(62 * k) + "px Hanken Grotesk,Arial,sans-serif"; x.fillStyle = "#fff"; x.fillText(c, start + wa + wb, 240);
  });
  texs.push(hi);
  flat(hi, 3.9, 1.0, 0, 5.2, -4.97, 0);

  /* --- Mur des projets (mur de gauche) : deux catégories --- */
  function projTex(p) {
    var t = tex(640, 480, function (x, w, hh) {
      var g = x.createLinearGradient(0, 0, w, hh); g.addColorStop(0, p[4]); g.addColorStop(1, p[5]);
      x.fillStyle = g; x.fillRect(0, 0, w, hh);
      x.fillStyle = "rgba(255,255,255,.14)"; x.beginPath(); x.arc(w - 70, 70, 120, 0, 7); x.fill();
      x.fillStyle = "#fff"; var fs = 64;
      x.font = "800 " + fs + "px Unbounded,Arial Black,sans-serif";
      while (x.measureText(p[0]).width > w - 80 && fs > 26) { fs -= 4; x.font = "800 " + fs + "px Unbounded,Arial Black,sans-serif"; }
      x.fillText(p[0], 40, hh / 2 + 10);
      x.font = "500 26px Arial,sans-serif"; x.fillStyle = "rgba(255,255,255,.9)";
      x.fillText(p[2] || "Projet GitHub", 40, hh / 2 + 60);
      x.fillText("Voir le code", 40, hh - 40);
    });
    texs.push(t);
    return t;
  }
  // Étiquette dorée (titre et catégories)
  function goldLabel(text, size) {
    var t = tex(1024, 200, function (x, W, H) {
      x.clearRect(0, 0, W, H); x.textAlign = "center"; x.font = "800 " + size + "px Unbounded,Arial Black,sans-serif";
      x.fillStyle = "#8a5a0c"; for (var k = 6; k > 0; k--) x.fillText(text, W / 2 + k * 0.5, 130 + k * 0.9);
      var g = x.createLinearGradient(0, 40, 0, 140); g.addColorStop(0, "#ffe08a"); g.addColorStop(1, "#e0a526");
      x.fillStyle = g; x.fillText(text, W / 2, 130);
    });
    texs.push(t);
    return t;
  }
  var ttlP = flat(goldLabel("Mes Projets", 96), 3.6, 0.7, -5.9, 5.75, -1.2, Math.PI / 2);
  flat(goldLabel("Projets personnels", 64), 2.6, 0.5, -5.9, 4.95, -1.2, Math.PI / 2);
  flat(goldLabel("Projets académiques", 64), 2.6, 0.5, -5.9, 2.82, -1.2, Math.PI / 2);
  // Le mur de gauche regarde vers +x : le z croissant va de gauche à droite pour le visiteur
  [-3.4, -1.2, 1.0].forEach(function (z, k) { frame(1.9, 1.43, projTex(PERSO[k]), -5.93, 3.95, z, Math.PI / 2, GH + PERSO[k][3]); });
  [-2.3, -0.1].forEach(function (z, k) { frame(1.9, 1.43, projTex(ACAD[k]), -5.93, 1.75, z, Math.PI / 2, GH + ACAD[k][3]); });

  // Canapé contre le mur du fond, à droite du bureau, avec coussins blancs (comme dans la vidéo)
  var sofa = M(0xffb000, { roughness: 0.85 }), soft = M(0xffc94d, { roughness: 0.9 }), pillow = M(0xf6f6f2, { roughness: 0.9 });
  B(3.4, 0.6, 1.2, sofa, 3.75, 0.4, -4.25); B(3.4, 1.1, 0.3, sofa, 3.75, 0.95, -4.85);
  B(0.3, 0.85, 1.2, sofa, 2.2, 0.55, -4.25); B(0.3, 0.85, 1.2, sofa, 5.3, 0.55, -4.25);
  B(1.45, 0.28, 0.95, soft, 3.02, 0.84, -4.12); B(1.45, 0.28, 0.95, soft, 4.48, 0.84, -4.12);
  var pl1 = B(0.55, 0.5, 0.16, pillow, 2.75, 1.22, -4.55); pl1.rotation.z = 0.15;
  B(0.55, 0.5, 0.16, pillow, 3.3, 1.22, -4.55);
  var pl3 = B(0.55, 0.5, 0.16, pillow, 4.85, 1.22, -4.55); pl3.rotation.z = -0.15;
  // Tapis et table basse en verre devant le canapé
  put(new T.PlaneGeometry(3.6, 2.2), M(0xf2efe8, { roughness: 1 }), 3.75, 0.013, -2.6, { c: false, rx: -Math.PI / 2 });
  B(1.6, 0.05, 0.9, M(0xbcd7cf, { roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.75 }), 3.75, 0.55, -2.6);
  [[3.05, -2.95], [4.45, -2.95], [3.05, -2.25], [4.45, -2.25]].forEach(function (p) { B(0.05, 0.53, 0.05, dark, p[0], 0.27, p[1]); });
  put(new T.CylinderGeometry(0.02, 0.02, 2.8, 8), dark, -5.4, 1.4, 5.3);
  put(new T.SphereGeometry(0.28, 20, 16), new T.MeshBasicMaterial({ color: 0xffe2a8 }), -5.4, 2.9, 5.3, { c: false });

  /* --- Télé : le parcours défile à l'écran --- */
  // Générique de la télé : [texte, style] ; "d" = date dorée, "t" = titre, "" = texte
  var TV_LINES = [["Chroniqueur radio, monteur vidéo :", "t"], ["j’aime raconter des histoires", ""], ["en mots et en images.", ""], ["", ""], ["Mon parcours", "t"], ["", ""]];
  PARC.forEach(function (p) { TV_LINES.push([p[0], "d"], [p[1], "t"], [p[2], ""], ["", ""]); });
  var TV_LH = 72, tvScroll = 0, tvStart = 0;
  var tvT = tex(1024, 576, function (x, W, H) {
    x.shadowBlur = 0; x.fillStyle = "#05060c"; x.fillRect(0, 0, W, H);
    x.textAlign = "center"; x.shadowColor = "#f77f00"; x.shadowBlur = 20;
    var total = TV_LINES.length * TV_LH + H;
    var y0 = H + 40 - (tvScroll % total);
    TV_LINES.forEach(function (l, k) {
      var y = y0 + k * TV_LH;
      if (y < -40 || y > H + 60 || !l[0]) return;
      x.font = l[1] === "t" ? "800 50px Hanken Grotesk,Arial,sans-serif" : "500 42px Hanken Grotesk,Arial,sans-serif";
      x.fillStyle = l[1] === "d" ? "#ffd36a" : l[1] === "t" ? "#ffffff" : "#ffe9d2";
      x.fillText(l[0], W / 2, y);
    });
    // Fondu en haut et en bas de l'écran
    var g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "rgba(5,6,12,1)"); g.addColorStop(0.16, "rgba(5,6,12,0)"); g.addColorStop(0.84, "rgba(5,6,12,0)"); g.addColorStop(1, "rgba(5,6,12,1)");
    x.shadowBlur = 0; x.fillStyle = g; x.fillRect(0, 0, W, H);
  });
  texs.push(tvT);
  // Grande télé sur le mur d'en face, exactement face au canapé jaune (même axe x = 3.75)
  put(new T.PlaneGeometry(12, WH), wallM(0x17705a), 0, WH / 2, 6, { c: false, ry: Math.PI });
  var tv = new T.Group(); tv.position.set(3.75, 1.75, 5.93); tv.rotation.y = Math.PI; sc.add(tv);
  B(3.7, 2.15, 0.08, dark, 0, 0, 0, { p: tv });
  put(new T.PlaneGeometry(3.56, 2.0), new T.MeshBasicMaterial({ map: tvT, toneMapped: false }), 0, 0, 0.045, { c: false, r: false, p: tv });
  // Meuble télé
  B(3.4, 0.45, 0.45, M(0x8a5a35, { roughness: 0.6 }), 3.75, 0.23, 5.72);
  B(3.42, 0.04, 0.47, dark, 3.75, 0.47, 5.72);
  var tvl = new T.PointLight(0xffb15c, 0.8, 7); tvl.position.set(3.75, 1.8, 4.9); sc.add(tvl);

  // Porte juste à droite de la télé, vue depuis le canapé
  var dr = new T.Group(); dr.position.set(1.0, 1.1, 5.96); dr.rotation.y = Math.PI; sc.add(dr);
  var dm = M(0xe9ece6, { roughness: 0.6 });
  B(1.1, 2.2, 0.06, white, 0, 0, 0, { p: dr }); B(0.82, 0.8, 0.02, dm, 0, 0.55, 0.04, { p: dr }); B(0.82, 0.8, 0.02, dm, 0, -0.5, 0.04, { p: dr });
  put(new T.SphereGeometry(0.05, 12, 10), dark, 0.4, 0, 0.07, { p: dr });

  // Pop-corn sur la table vitrée devant le canapé
  var bk = new T.Group(); bk.position.set(3.75, 0.575, -2.75); sc.add(bk);
  var st = tex(256, 64, function (x, W, H) { for (var k = 0; k < 8; k++) { x.fillStyle = k % 2 ? "#fff" : "#d62828"; x.fillRect(k * 32, 0, 32, H); } });
  put(new T.CylinderGeometry(0.15, 0.11, 0.26, 24), M(0xffffff, { map: st }), 0, 0.13, 0, { p: bk });
  var pc = M(0xfff0c4, { roughness: 0.9 });
  for (i = 0; i < 14; i++) put(new T.IcosahedronGeometry(0.045, 0), pc, (rnd() - 0.5) * 0.2, 0.28 + rnd() * 0.09, (rnd() - 0.5) * 0.2, { p: bk, c: false });

  /* --- iPhone posé sur le bureau, à gauche du clavier : les contacts --- */
  // Dimensions locales (avant mise à l'échelle) : proportions d'un iPhone 15 Pro
  var PW = 0.36, PH = 0.74, PR = 0.06, PD = 0.03, PB = 0.008;
  function roundRect(w, hh, rad) {
    var s = new T.Shape(), x0 = -w / 2, y0 = -hh / 2;
    s.moveTo(x0 + rad, y0); s.lineTo(x0 + w - rad, y0); s.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + rad);
    s.lineTo(x0 + w, y0 + hh - rad); s.quadraticCurveTo(x0 + w, y0 + hh, x0 + w - rad, y0 + hh);
    s.lineTo(x0 + rad, y0 + hh); s.quadraticCurveTo(x0, y0 + hh, x0, y0 + hh - rad);
    s.lineTo(x0, y0 + rad); s.quadraticCurveTo(x0, y0, x0 + rad, y0);
    return s;
  }
  var ph = new T.Group(); ph.position.set(-1.25, 1.663, -3.5); ph.rotation.set(-Math.PI / 2, 0, 0.3); ph.scale.setScalar(0.6); sc.add(ph);
  var titanium = M(0x8a8d91, { metalness: 0.85, roughness: 0.32 }), glass = M(0x050608, { roughness: 0.08, metalness: 0.2 });
  // Coque : face avant et arrière en verre noir (groupe 0), tranche arrondie en titane (groupe 1)
  var bodyG = new T.ExtrudeGeometry(roundRect(PW - 2 * PB, PH - 2 * PB, PR - PB), { depth: PD, bevelEnabled: true, bevelThickness: 0.006, bevelSize: PB, bevelSegments: 4, curveSegments: 14 });
  bodyG.translate(0, 0, -PD / 2);
  var body = new T.Mesh(bodyG, [glass, titanium]); body.castShadow = true; body.receiveShadow = true; ph.add(body);
  var FRONT = PD / 2 + 0.006;
  // Boutons latéraux : action et volume à gauche, marche/arrêt à droite
  [[-1, 0.2, 0.05], [-1, 0.11, 0.08], [-1, 0.01, 0.08], [1, 0.13, 0.12]].forEach(function (b) {
    B(0.008, b[2], 0.014, titanium, b[0] * (PW / 2 + 0.002), b[1], 0, { p: ph, c: false });
  });
  // Écran : texture aux coins arrondis, mise à jour chaque minute (heure réelle)
  var SW = PW - 0.03, SH = PH - 0.03, TW = 512, TH = Math.round(TW * SH / SW);
  function scr2local(px, py) { return [(px / TW - 0.5) * SW, (0.5 - py / TH) * SH]; }
  var APPS = [
    ["LinkedIn", "#0a66c2", function (x) { x.font = "800 130px Arial,sans-serif"; x.fillText("in", 128, 172); }, D.linkedin],
    ["GitHub", "#24292f", function (x) { x.font = "800 50px Arial,sans-serif"; x.fillText("GitHub", 128, 145); }, GH.replace(/\/$/, "")],
    ["Mail", "#f77f00", function (x) { x.lineWidth = 12; x.lineJoin = "round"; x.strokeRect(52, 76, 152, 104); x.beginPath(); x.moveTo(52, 76); x.lineTo(128, 140); x.lineTo(204, 76); x.stroke(); }, "mailto:" + D.email],
    ["Mon CV", "#009e60", function (x) { x.font = "800 120px Arial,sans-serif"; x.fillText("CV", 128, 165); }, "cv"]
  ];
  var ICON_PX = 150, APP_POS = [[150, 560], [362, 560], [150, 800], [362, 800]];
  var pscr = tex(TW, TH, function (x, W, H) {
    var d = new Date(), k;
    x.clearRect(0, 0, W, H);
    x.save(); rr(x, 0, 0, W, H, 62); x.clip();
    // Fond d'écran : vert ivoirien vers orange, avec deux halos flous
    var g = x.createLinearGradient(0, 0, W * 0.4, H); g.addColorStop(0, "#0e3b30"); g.addColorStop(0.55, "#00865a"); g.addColorStop(1, "#f77f00");
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    [[W * 0.85, H * 0.3, 260, "rgba(255,211,106,.45)"], [W * 0.1, H * 0.75, 300, "rgba(255,255,255,.18)"]].forEach(function (b) {
      var rg = x.createRadialGradient(b[0], b[1], 0, b[0], b[1], b[2]); rg.addColorStop(0, b[3]); rg.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = rg; x.fillRect(0, 0, W, H);
    });
    // Barre d'état : heure, réseau, batterie, et Dynamic Island
    var hm = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    x.fillStyle = "#fff"; x.textAlign = "center"; x.font = "600 30px Hanken Grotesk,Arial,sans-serif"; x.fillText(hm, 92, 60);
    for (k = 0; k < 4; k++) { x.fillStyle = "#fff"; x.fillRect(360 + k * 11, 58 - (k + 1) * 6, 7, (k + 1) * 6); }
    x.strokeStyle = "rgba(255,255,255,.8)"; x.lineWidth = 2.5; rr(x, 412, 38, 48, 22, 7); x.stroke();
    x.fillStyle = "#fff"; rr(x, 416, 42, 34, 14, 4); x.fill(); x.fillRect(462, 45, 3, 8);
    x.fillStyle = "#000"; rr(x, W / 2 - 78, 24, 156, 46, 23); x.fill();
    x.fillStyle = "#1b2a3a"; x.beginPath(); x.arc(W / 2 + 52, 47, 9, 0, 7); x.fill();
    // Widget : date, heure en grand, nom
    x.fillStyle = "rgba(255,255,255,.16)"; rr(x, 36, 110, W - 72, 250, 40); x.fill();
    x.fillStyle = "rgba(255,255,255,.85)"; x.font = "600 26px Hanken Grotesk,Arial,sans-serif";
    x.fillText(d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }), W / 2, 162);
    x.fillStyle = "#fff"; x.font = "800 104px Unbounded,Arial Black,sans-serif"; x.fillText(hm, W / 2, 272);
    x.font = "500 27px Hanken Grotesk,Arial,sans-serif"; x.fillText("Bienvenu Yapo · développeur", W / 2, 326);
    // Noms des apps sous les icônes (les icônes sont des objets 3D cliquables posés dessus)
    x.font = "600 26px Hanken Grotesk,Arial,sans-serif"; x.shadowColor = "rgba(0,0,0,.4)"; x.shadowBlur = 6;
    APPS.forEach(function (a, i) { x.fillText(a[0], APP_POS[i][0], APP_POS[i][1] + ICON_PX / 2 + 40); });
    x.shadowBlur = 0;
    // Pastille « Rechercher », puis barre d'accueil
    x.fillStyle = "rgba(255,255,255,.22)"; rr(x, W / 2 - 95, H - 140, 190, 50, 25); x.fill();
    x.fillStyle = "#fff"; x.font = "600 24px Hanken Grotesk,Arial,sans-serif"; x.fillText("Rechercher", W / 2, H - 107);
    x.fillStyle = "rgba(255,255,255,.9)"; rr(x, W / 2 - 80, H - 30, 160, 9, 4.5); x.fill();
    x.restore();
  });
  texs.push(pscr);
  put(new T.PlaneGeometry(SW, SH), new T.MeshBasicMaterial({ map: pscr, transparent: true }), 0, 0, FRONT + 0.002, { c: false, r: false, p: ph });
  function ico(bg, d) {
    return tex(256, 256, function (x, W, H) {
      x.clearRect(0, 0, W, H); x.fillStyle = bg; rr(x, 8, 8, W - 16, H - 16, 58); x.fill();
      x.fillStyle = "#fff"; x.strokeStyle = "#fff"; x.textAlign = "center"; d(x);
    });
  }
  var ICON = ICON_PX / TW * SW;
  APPS.forEach(function (a, k) {
    var p = scr2local(APP_POS[k][0], APP_POS[k][1]);
    var m = put(new T.PlaneGeometry(ICON, ICON), new T.MeshBasicMaterial({ map: ico(a[1], a[2]), transparent: true }), p[0], p[1], FRONT + 0.005, { c: false, r: false, p: ph });
    m.userData.url = a[3]; m.userData.z = [LAST - 0.4, LAST + 0.1]; pick.push(m);
  });

  // Ma photo encadrée (mur de droite) : passe-partout crème, photo recadrée sur la silhouette
  var photoImg = new Image();
  var photoT = tex(768, 1024, function (x, W, H) {
    x.fillStyle = "#f6f1e6"; x.fillRect(0, 0, W, H);
    var m = 64, pw = W - 2 * m, phh = H - 2 * m;
    x.fillStyle = "#d9d2c3"; x.fillRect(m - 4, m - 4, pw + 8, phh + 8);
    if (photoImg.complete && photoImg.naturalWidth) {
      // Zone utile de la photo (765 x 1020) : la personne, du visage aux chaussures, au format 3:4
      var iw = photoImg.naturalWidth, ih = photoImg.naturalHeight;
      var sw = iw * 0.61, sh = sw * phh / pw, sx = (iw - sw) / 2, sy = Math.min(ih * 0.29, ih - sh);
      x.drawImage(photoImg, sx, sy, sw, sh, m, m, pw, phh);
    } else {
      x.fillStyle = "#1f6b55"; x.fillRect(m, m, pw, phh);
    }
    // Léger dégradé d'ombre en haut du passe-partout
    var g = x.createLinearGradient(0, m, 0, m + 40); g.addColorStop(0, "rgba(0,0,0,.25)"); g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g; x.fillRect(m, m, pw, 40);
  });
  texs.push(photoT);
  photoImg.onload = function () { photoT.redraw(); };
  photoImg.src = window.PHOTO;
  var wn = new T.Group(); wn.position.set(5.94, 2.15, -1.8); wn.rotation.y = -Math.PI / 2; sc.add(wn);
  var wood = M(0x2a1a10, { roughness: 0.45 }), gold = M(0xd9a441, { roughness: 0.3, metalness: 0.7 });
  B(1.62, 2.1, 0.08, wood, 0, 0, 0, { p: wn });
  B(1.44, 1.92, 0.09, gold, 0, 0, 0.004, { p: wn });
  put(new T.PlaneGeometry(1.38, 1.84), new T.MeshBasicMaterial({ map: photoT }), 0, 0, 0.052, { c: false, r: false, p: wn });
  // Lumière douce qui éclaire le cadre
  var spot = new T.SpotLight(0xffe2b0, 0.9, 4, 0.7, 0.6); spot.position.set(5.6, 3.4, -1.8); spot.target.position.set(5.95, 2.1, -1.8);
  sc.add(spot); sc.add(spot.target);
  // Présentation peinte au-dessus de la photo
  var about = tex(1400, 420, function (x, W) {
    x.clearRect(0, 0, W, 420); x.shadowColor = "rgba(0,0,0,.35)"; x.shadowBlur = 10;
    x.font = "500 60px Hanken Grotesk,Arial,sans-serif";
    var a = "J’habite à ", b = "Grand-Bassam, Côte d’Ivoire", c = ".";
    var wa = x.measureText(a).width, wb = x.measureText(b).width, wc = x.measureText(c).width, st0 = W / 2 - (wa + wb + wc) / 2;
    x.textAlign = "left"; x.fillStyle = "#ffffff"; x.fillText(a, st0, 110);
    x.fillStyle = "#ffd36a"; x.fillText(b, st0 + wa, 110); x.fillStyle = "#ffffff"; x.fillText(c, st0 + wa + wb, 110);
    x.textAlign = "center";
    x.fillText("Étudiant en Licence 2 de génie logiciel à l’IIT,", W / 2, 200);
    x.fillText("vainqueur du Hackathon IIT 2026, je cherche", W / 2, 290);
    x.fillText("un stage en développement web et mobile.", W / 2, 380);
  });
  texs.push(about);
  flat(about, 3.4, 1.02, 5.96, 3.75, -1.8, -Math.PI / 2);

  // Poussière en suspension
  var N = 140, pa = new Float32Array(N * 3);
  for (i = 0; i < N; i++) { pa[i * 3] = (rnd() - 0.5) * 10; pa[i * 3 + 1] = 0.6 + rnd() * 5.6; pa[i * 3 + 2] = -4.5 + rnd() * 9; }
  var dg = new T.BufferGeometry(); dg.setAttribute("position", new T.BufferAttribute(pa, 3));
  var dust = new T.Points(dg, new T.PointsMaterial({ color: 0xfff1cf, size: 2, sizeAttenuation: false, transparent: true, opacity: 0.55, depthWrite: false }));
  sc.add(dust);

  // Lumières
  sc.add(new T.HemisphereLight(0xd8ecff, 0x7a4a22, 0.6));
  var sun = new T.DirectionalLight(0xffe2b8, 1.05); sun.position.set(9, 8, 5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 30 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sc.add(sun);
  var warm = new T.PointLight(0xffa24a, 1.2, 10); warm.position.set(0, 3.2, -2.5); sc.add(warm);
  var lamp = new T.PointLight(0xffb866, 0.9, 8); lamp.position.set(-5.4, 2.8, 5.3); sc.add(lamp);
  if (document.fonts) document.fonts.ready.then(function () { texs.forEach(function (t) { t.redraw(); }); });

  /* --- Parcours de la caméra : un point de vue par section ---
     On n'interpole pas la cible du regard (une cible qui passe derrière la caméra la fait se
     retourner d'un coup) mais l'angle horizontal (lacet) et vertical (tangage).
     Lacet : 0 = mur du fond, +π/2 = mur de gauche (projets), -π/2 = mur de droite (photo),
     ±π = mur de la télé. « sens » impose le sens de rotation depuis l'étape précédente
     (+1 = vers la gauche, -1 = vers la droite, 0 = le plus court) ; « via » courbe le trajet
     et « viaPitch » incline le regard à mi-chemin (pour voir le bureau en passant). */
  var LEFT = 1, RIGHT = -1;
  function V(x, y, z) { return new T.Vector3(x, y, z); }
  function W(pos, target, sens, via, viaPitch) {
    var dx = target.x - pos.x, dy = target.y - pos.y, dz = target.z - pos.z;
    return { p: pos, a: Math.atan2(-dx, -dz), b: Math.atan2(dy, Math.hypot(dx, dz)), sens: sens || 0, via: via, vb: viaPitch };
  }
  var WP = [];
  WP[STEP.home] = W(V(0.4, 2.7, 5.2), V(0, 2.7, -4));                  // La maison entière
  WP[STEP.name] = W(V(-0.9, 4.5, 0.4), V(-0.9, 4.5, -5));              // Mur du fond : le nom et le médaillon
  WP[STEP.photo] = W(V(0.4, 2.85, -1.8), V(6, 2.75, -1.8), RIGHT);     // Mur de droite : ma photo
  WP[STEP.desk] = W(V(-0.3, 2.5, -1.7), V(-0.5, 2.3, -4.3), LEFT);     // Retour au fond : le bureau (compétences)
  WP[STEP.projects] = W(V(2.0, 3.5, -1.2), V(-6, 3.5, -1.2), LEFT);    // Encore à gauche : le mur des projets
  // Vers la droite en repassant devant le bureau (regard baissé), puis assis dans le fauteuil
  WP[STEP.sofa] = W(V(3.75, 1.75, -4.0), V(6, 1.6, 0), RIGHT, V(-0.8, 2.4, -1.2), -0.5);
  // Toujours vers la droite : on pivote dans le fauteuil jusqu'à la télé
  WP[STEP.tv] = W(V(3.75, 1.7, -3.9), V(3.75, 1.75, 5.93), RIGHT);
  // On se lève, on traverse le milieu du salon (en contournant la chaise) en tournant encore
  // à droite, et on se penche sur le téléphone
  WP[STEP.phone] = W(V(-1.2, 2.4, -2.95), V(-1.25, 1.67, -3.5), RIGHT, V(-0.5, 2.8, 1.5));
  // Déroule les angles : chaque lacet devient continu avec le précédent, dans le sens demandé
  for (i = 1; i < WP.length; i++) {
    var da = WP[i].a - WP[i - 1].a;
    da -= Math.round(da / (2 * Math.PI)) * 2 * Math.PI;       // écart ramené dans [-π, π]
    if (WP[i].sens === LEFT && da < 0) da += 2 * Math.PI;
    if (WP[i].sens === RIGHT && da > 0) da -= 2 * Math.PI;
    WP[i].a = WP[i - 1].a + da;
  }
  var pp = new T.Vector3(), tt = new T.Vector3(), q0 = new T.Vector3(), q1 = new T.Vector3();
  function resize() {
    r.setSize(innerWidth, innerHeight, false);
    cam.aspect = innerWidth / innerHeight;
    cam.fov = cam.aspect < 0.8 ? 62 : 40;
    cam.updateProjectionMatrix();
  }
  resize(); addEventListener("resize", resize);

  // Survol et clic sur les cadres et les icônes du téléphone
  var ray = new T.Raycaster(), m2 = new T.Vector2();
  function hit(e) {
    m2.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(m2, cam);
    var list = pick.filter(function (o) { var z = o.userData.z || [STEP.projects - 0.4, STEP.projects + 0.4]; return S.p > z[0] && S.p < z[1]; });
    return ray.intersectObjects(list)[0] || null;
  }
  addEventListener("pointermove", function (e) {
    S.mx = e.clientX / innerWidth - 0.5; S.my = e.clientY / innerHeight - 0.5;
    var k = hit(e); S.hv = k ? k.object : null; document.body.style.cursor = k ? "pointer" : "";
  }, { passive: true });
  addEventListener("click", function (e) { var k = hit(e); if (k) openLink(k.object.userData.url); });

  // Animation
  var cur = 0, intro = reduce ? 0 : 1, last = performance.now(), raf = 0, ls = -1, la = -1;
  function anim(t) {
    var up = reduce ? 0 : 1, s = Math.sin(t / 420) * 0.6 * up;
    nb[0].rotation.z = -Math.max(0, s); nb[4].rotation.z = Math.max(0, -s);
    ph.rotation.z = 0.3 + Math.sin(t / 1700) * 0.03 * up;
    dust.position.x = Math.sin(t / 6000) * 0.4 * up; dust.position.y = Math.sin(t / 4000) * 0.15 * up;
    var q = Date.now() / 1000 | 0; if (q !== ls) { if ((q / 60 | 0) !== (ls / 60 | 0)) pscr.redraw(); ls = q; clk.redraw(); }
    // La télé ne se redessine que lorsqu'on s'en approche
    if (S.p > STEP.tv - 0.8) { if (!tvStart) tvStart = t; tvScroll = reduce ? 330 : 330 + (t - tvStart) * 0.045; tvT.redraw(); } else tvStart = 0;
    ttlP.material.opacity = reduce ? 1 : Math.max(0, 1 - Math.abs(S.p - STEP.projects) * 1.8);
    var ai = Math.round(S.p); if (ai !== la) { la = ai; dots.forEach(function (b, k) { b.classList.toggle("on", k === ai); }); }
    pick.forEach(function (o) {
      var f = o.userData.fr, tg = f ? o.parent : o, k = o === S.hv ? (f ? 1.06 : 1.15) : 1;
      tg.scale.x += (k - tg.scale.x) * 0.15; tg.scale.y = tg.scale.z = tg.scale.x;
    });
  }
  function tick(t) {
    raf = requestAnimationFrame(tick);
    var dt = Math.min(Math.max((t - last) / 1000, 0), 0.05); last = t;
    onScroll();
    cur += (S.p - cur) * (reduce ? 1 : 1 - Math.exp(-dt * 3.2));
    intro += (0 - intro) * (1 - Math.exp(-dt * 1.6));
    var k = Math.max(0, Math.min(Math.floor(cur), LAST - 1)), f = cur - k, e = f * f * (3 - 2 * f);
    var A = WP[k], Bw = WP[k + 1];
    if (Bw.via) {
      // Courbe de Bézier quadratique : départ, point de passage, arrivée
      q0.lerpVectors(A.p, Bw.via, e); q1.lerpVectors(Bw.via, Bw.p, e); pp.lerpVectors(q0, q1, e);
    } else pp.lerpVectors(A.p, Bw.p, e);
    var yaw = A.a + (Bw.a - A.a) * e, vb = Bw.vb === undefined ? (A.b + Bw.b) / 2 : Bw.vb;
    var pitch = (1 - e) * (1 - e) * A.b + 2 * e * (1 - e) * vb + e * e * Bw.b;
    if (!reduce) { yaw += Math.sin(t / 2500) * 0.012 - S.mx * 0.09; pitch -= S.my * 0.05; ch.rotation.y = 0.2 + Math.sin(t / 1800) * 0.18; }
    anim(t);
    pp.z += intro * 0.6; pp.y += intro * 1.2; // arrivée douce, sans traverser le mur d’en face
    tt.set(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)).add(pp);
    cam.position.copy(pp); cam.lookAt(tt);
    r.render(sc, cam);
  }
  document.addEventListener("visibilitychange", function () {
    cancelAnimationFrame(raf);
    if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); }
  });
  raf = requestAnimationFrame(tick);
})();
