/**
 * TALKS MARKETING · sincronização da equipe
 * ---------------------------------------------------------------
 * Cole este código em uma planilha Google:
 *   Extensões > Apps Script > apague o que tiver > cole > salvar.
 * Depois: Implantar > Nova implantação > tipo "App da Web"
 *   Executar como: Eu  ·  Quem pode acessar: Qualquer pessoa
 * Copie o link que termina em /exec e coloque em config.js (ENDPOINT).
 *
 * A planilha guarda só o andamento (etapa, link do Drive, passos,
 * travas, observações). O que precisa ser produzido fica no dados.js.
 */

var ABA_STATUS = 'Status';
var ABA_HIST = 'Histórico';
var COLS = ['id', 'status', 'link', 'travado', 'motivo', 'passos', 'nota', 'por', 'atualizado'];
var COLS_HIST = ['quando', 'quem', 'id', 'entrega', 'o que mudou'];
var CAMPOS = ['status', 'link', 'travado', 'motivo', 'passos', 'nota'];
var LIMITE_HIST = 60;

function doGet() {
  return saida_(estado_());
}

function doPost(e) {
  var corpo = {};
  try { corpo = JSON.parse((e && e.postData && e.postData.contents) || '{}'); }
  catch (err) { return saida_({ ok: false, erro: 'JSON inválido' }); }

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var aba = aba_(ABA_STATUS, COLS);
    var hist = aba_(ABA_HIST, COLS_HIST);
    var valores = aba.getDataRange().getValues();
    var linhaDe = {};
    for (var i = 1; i < valores.length; i++) linhaDe[String(valores[i][0])] = i + 1;

    (corpo.mudancas || []).forEach(function (m) {
      if (!m || !m.id) return;
      var id = String(m.id).slice(0, 200);
      var linha = linhaDe[id];
      var atual = linha ? aba.getRange(linha, 1, 1, COLS.length).getValues()[0] : [id, 'afazer', '', false, '', '[]', '', '', ''];
      var campos = m.campos || {};
      CAMPOS.forEach(function (c) {
        if (!(c in campos)) return;
        var v = campos[c];
        if (c === 'passos') v = JSON.stringify(Array.isArray(v) ? v : []);
        else if (c === 'travado') v = v === true;
        else v = String(v == null ? '' : v).slice(0, 2000);
        atual[COLS.indexOf(c)] = v;
      });
      atual[COLS.indexOf('por')] = String(m.por || '').slice(0, 40);
      atual[COLS.indexOf('atualizado')] = m.quando ? new Date(m.quando) : new Date();
      if (linha) {
        aba.getRange(linha, 1, 1, COLS.length).setValues([atual]);
      } else {
        aba.appendRow(atual);
        linhaDe[id] = aba.getLastRow();
      }
      hist.appendRow([m.quando ? new Date(m.quando) : new Date(), String(m.por || ''), id, String(m.entrega || '').slice(0, 200), String(m.texto || '').slice(0, 500)]);
    });
  } finally {
    lock.releaseLock();
  }
  return saida_(estado_());
}

function estado_() {
  var aba = aba_(ABA_STATUS, COLS);
  var valores = aba.getDataRange().getValues();
  var itens = {};
  for (var i = 1; i < valores.length; i++) {
    var l = valores[i];
    if (!l[0]) continue;
    var o = {};
    COLS.forEach(function (c, j) { o[c] = l[j]; });
    var passos = [];
    try { passos = JSON.parse(o.passos || '[]'); } catch (err) { passos = []; }
    itens[String(o.id)] = {
      status: String(o.status || 'afazer'),
      link: String(o.link || ''),
      travado: o.travado === true || String(o.travado).toUpperCase() === 'TRUE',
      motivo: String(o.motivo || ''),
      passos: passos,
      nota: String(o.nota || ''),
      por: String(o.por || ''),
      atualizado: o.atualizado instanceof Date ? o.atualizado.toISOString() : String(o.atualizado || ''),
    };
  }
  var hist = aba_(ABA_HIST, COLS_HIST);
  var ultima = hist.getLastRow();
  var historico = [];
  if (ultima > 1) {
    var n = Math.min(LIMITE_HIST, ultima - 1);
    var linhas = hist.getRange(ultima - n + 1, 1, n, COLS_HIST.length).getValues();
    for (var k = linhas.length - 1; k >= 0; k--) {
      var h = linhas[k];
      historico.push({
        quando: h[0] instanceof Date ? h[0].toISOString() : String(h[0] || ''),
        quem: String(h[1] || ''), id: String(h[2] || ''), entrega: String(h[3] || ''), texto: String(h[4] || ''),
      });
    }
  }
  return { ok: true, itens: itens, historico: historico, agora: new Date().toISOString() };
}

function aba_(nome, cabecalho) {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(nome);
  if (!aba) {
    aba = planilha.insertSheet(nome);
    aba.appendRow(cabecalho);
    aba.setFrozenRows(1);
    aba.getRange(1, 1, 1, cabecalho.length).setFontWeight('bold');
  }
  return aba;
}

function saida_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
