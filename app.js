(function () {
"use strict";
var WHATS = "5565996799714";
var ORDEM = ["Anéis", "Brincos", "Colares", "Pingentes", "Pulseiras", "Conjuntos"];
var dados = { categorias: [], pecas: [] };
var filtro = "Todas";

// Fotos passam pelo otimizador de imagens do Netlify (reduz fotos grandes do celular); se falhar, usa a original.
function caminho(f) { return String(f || "").replace(/^\/+/, ""); }
function srcFoto(f) {
  if (location.protocol === "file:" || /^(localhost|127\.)/.test(location.hostname)) return caminho(f);
  return "/.netlify/images?url=" + encodeURIComponent("/" + caminho(f)) + "&w=900&q=78";
}

function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function semAcento(s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }

var ZAP = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3z"/></svg>';

function linkZap(p) {
  return "https://wa.me/" + WHATS + "?text=" + encodeURIComponent("Olá! Vi no catálogo da Encantos e gostaria de saber o valor da peça " + p.cod + " – " + p.nome + ".");
}

function cartao(p) {
  var foto = p.foto
    ? (p.inteira ? '<img class="fundo" src="' + esc(srcFoto(p.foto)) + '" data-orig="' + esc(caminho(p.foto)) + '" alt="" aria-hidden="true" loading="lazy">' : "") +
      '<img src="' + esc(srcFoto(p.foto)) + '" data-orig="' + esc(caminho(p.foto)) + '" alt="' + esc(p.nome) + '" loading="lazy">'
    : '<span class="sem">Foto em breve</span>';
  return '<article class="peca" id="' + esc(p.cod) + '"><div class="foto' + (p.inteira ? " inteira" : "") + '"><span class="cod">' + esc(p.cod) + "</span>" + foto + "</div>" +
    '<div class="info"><h3>' + esc(p.nome) + "</h3>" + (p.desc ? "<p>" + esc(p.desc) + "</p>" : "") +
    '<a class="pedir" href="' + esc(linkZap(p)) + '" target="_blank" rel="noopener">' + ZAP + "Consultar valor</a></div></article>";
}

var chips = document.getElementById("chips"), vitrine = document.getElementById("vitrine"), busca = document.getElementById("busca");

function usadas() { return dados.categorias.filter(function (c) { return dados.pecas.some(function (p) { return p.cat === c; }); }); }

function desenharChips() {
  chips.innerHTML = ["Todas"].concat(usadas()).map(function (c) {
    return '<button class="chip" type="button" data-cat="' + esc(c) + '" aria-pressed="' + (c === filtro) + '">' + esc(c) + "</button>";
  }).join("");
}
function desenhar() {
  var termo = semAcento(busca.value.trim());
  var lista = dados.pecas.filter(function (p) {
    return (filtro === "Todas" || p.cat === filtro) && (!termo || semAcento(p.nome + " " + p.cod + " " + (p.desc || "")).indexOf(termo) >= 0);
  });
  if (!lista.length) { vitrine.innerHTML = '<p class="vazio">Nenhuma peça encontrada. Tente outro nome ou chame no WhatsApp.</p>'; return; }
  vitrine.innerHTML = dados.categorias.map(function (cat) {
    var g = lista.filter(function (p) { return p.cat === cat; });
    if (!g.length) return "";
    return '<section class="secao"><h2>' + esc(cat) + " <small>" + g.length + (g.length === 1 ? " peça" : " peças") + "</small></h2><div class=\"grade\">" + g.map(cartao).join("") + "</div></section>";
  }).join("");
}

chips.addEventListener("click", function (e) {
  var b = e.target.closest(".chip"); if (!b) return;
  filtro = b.getAttribute("data-cat"); desenharChips(); desenhar();
});
busca.addEventListener("input", desenhar);

document.getElementById("copiar").addEventListener("click", function (e) {
  var b = e.currentTarget;
  function selecionar() { var r = document.createRange(); r.selectNodeContents(document.getElementById("numero")); var s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = "Selecionado, é só copiar"; }
  if (navigator.clipboard) navigator.clipboard.writeText("65996799714").then(function () { b.textContent = "Número copiado"; }, selecionar); else selecionar();
  setTimeout(function () { b.textContent = "Copiar número"; }, 2500);
});

vitrine.addEventListener("error", function (e) {
  var img = e.target;
  if (img.tagName === "IMG" && img.dataset.orig && img.getAttribute("src") !== img.dataset.orig) img.src = img.dataset.orig;
}, true);

vitrine.innerHTML = '<p class="vazio">Carregando peças…</p>';
fetch("pecas.json", { cache: "no-cache" }).then(function (r) { return r.json(); }).then(function (j) {
  dados.pecas = (j.pecas || []).filter(function (p) { return p && p.nome && p.cat; });
  var extras = [];
  dados.pecas.forEach(function (p) { if (ORDEM.indexOf(p.cat) < 0 && extras.indexOf(p.cat) < 0) extras.push(p.cat); });
  dados.categorias = ORDEM.concat(extras);
  iniciar();
}).catch(function () {
  vitrine.innerHTML = '<p class="vazio">Não foi possível carregar as peças agora. Atualize a página ou chame no WhatsApp.</p>';
});

function iniciar() {
desenharChips(); desenhar();
// Abre direto numa peça quando o link tem #CODIGO (ex.: .../#PU04)
if (location.hash) { var alvo = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (alvo) alvo.scrollIntoView(); }
}
})();
