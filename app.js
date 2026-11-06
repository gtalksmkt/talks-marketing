/* =====================================================================
   TALKS MARKETING · app
   HTML + CSS + JS puro (sem build). Dados em dados.js, configuração em
   config.js. Estado da equipe (status, links, travas) no Google Apps
   Script quando config.ENDPOINT estiver preenchido; senão, no aparelho.
   ===================================================================== */
(() => {
'use strict';

const D = window.TM_DADOS;
const CFG = window.TM_CONFIG || {};
const ENDPOINT = String(CFG.ENDPOINT || '').trim();
const INTERVALO = Math.max(10, Number(CFG.INTERVALO) || 30) * 1000;
const VERSAO = '1.0.0';

/* =========================== utilidades =========================== */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const LS = {
  get(k, d) { try { const v = localStorage.getItem('tm.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('tm.' + k, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } },
};

const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const DIAS_C = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MESES_C = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const isoData = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const hojeISO = () => isoData(new Date());
const lerData = s => { const [a, m, d] = String(s).split('-').map(Number); return new Date(a, m - 1, d); };
const diasAte = s => Math.round((lerData(s) - lerData(hojeISO())) / 864e5);
const fmtCurta = s => { const d = lerData(s); return DIAS_C[d.getDay()] + ', ' + d.getDate() + ' ' + MESES_C[d.getMonth()]; };
const fmtFalta = s => { const n = diasAte(s); if (n === 0) return 'hoje'; if (n === 1) return 'amanhã'; if (n === -1) return 'ontem'; return n > 0 ? 'em ' + n + ' dias' : 'há ' + (-n) + ' dias'; };
const fmtQuando = iso => {
  if (!iso) return '';
  const d = new Date(iso); if (isNaN(d)) return '';
  const seg = (Date.now() - d) / 1000;
  if (seg < 60) return 'agora';
  if (seg < 3600) return 'há ' + Math.floor(seg / 60) + ' min';
  const hh = pad(d.getHours()) + ':' + pad(d.getMinutes());
  const n = diasAte(isoData(d));
  if (n === 0) return 'hoje, ' + hh;
  if (n === -1) return 'ontem, ' + hh;
  return d.getDate() + ' ' + MESES_C[d.getMonth()] + ', ' + hh;
};
const cap = s => String(s).charAt(0).toUpperCase() + String(s).slice(1);
// A planilha pode devolver datas como "Thu Nov 05 2026 23:16:13 GMT-0300 (...)": converte para ISO
// sem depender do navegador (o Safari não lê esse formato com segurança).
const MES_EN = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
function paraISO(v) {
  if (!v) return '';
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s;
  const m = s.match(/^\w{3} (\w{3}) (\d{1,2}) (\d{4}) (\d{2}):(\d{2}):(\d{2}) GMT([+-])(\d{2})(\d{2})/);
  if (m && m[1] in MES_EN) {
    const off = (m[7] === '-' ? -1 : 1) * (Number(m[8]) * 60 + Number(m[9]));
    return new Date(Date.UTC(+m[3], MES_EN[m[1]], +m[2], +m[4], +m[5], +m[6]) - off * 60000).toISOString();
  }
  const d = new Date(s);
  return isNaN(d) ? '' : d.toISOString();
}
const nomeMes = k => { const [a, m] = k.split('-').map(Number); return cap(MESES[m - 1]) + ' de ' + a; };
const plural = (n, s, p) => n + ' ' + (n === 1 ? s : p);

/* ============================== ícones ============================== */
const I = {
  inicio: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h5v-6h4v6h5V9.5"/>',
  quadro: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 3v18M15 3v18"/>',
  foguete: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  agenda: '<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  alerta: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  externo: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  lista: '<path d="M10 6h10M10 12h10M10 18h10"/><path d="m3.5 6 1.2 1.2L7 5M3.5 12l1.2 1.2L7 11M3.5 18l1.2 1.2L7 17"/>',
  ajuda: '<circle cx="12" cy="12" r="9.5"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.6-3 4.4M12 17.6h.01"/>',
  compartilhar: '<path d="M12 3v12M8 7l4-4 4 4"/><path d="M8 11H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-2"/>',
  maisQuadrado: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/>',
  pontos: '<circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/>',
  pontosH: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  voltar: '<path d="m15 18-6-6 6-6"/>',
  seta: '<path d="m9 18 6-6-6-6"/>',
  sync: '<path d="M21 12a9 9 0 0 1-15.4 6.4L3 16"/><path d="M3 12a9 9 0 0 1 15.4-6.4L21 8"/><path d="M21 3v5h-5M3 21v-5h5"/>',
  olho: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  circulo: '<circle cx="12" cy="12" r="8.5" stroke-dasharray="3.2 3.2"/>',
  producao: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none"/>',
  feito: '<circle cx="12" cy="12" r="9"/><path d="m8 12.2 2.7 2.7L16 9.6"/>',
  agendado: '<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 15.5 2 2 4-4"/>',
  bandeira: '<path d="M5 22V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
  megafone: '<path d="m3 11 15-6v14L3 13z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  baixar: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  celular: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
  livro: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  abas: '<rect x="3" y="7" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>',
  estrela: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
  mao: '<path d="M8 13V4.5a1.5 1.5 0 0 1 3 0V12"/><path d="M11 11.5v-2a1.5 1.5 0 0 1 3 0V12"/><path d="M14 10.5a1.5 1.5 0 0 1 3 0V12"/><path d="M17 11.5a1.5 1.5 0 0 1 3 0V16a6 6 0 0 1-6 6h-2a6 6 0 0 1-5-2.7L4.3 15a1.5 1.5 0 0 1 2.4-1.8L8 15"/>',
  cadeado: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  nuvem: '<path d="M17.5 19H8a6 6 0 1 1 5.7-7.9A4.5 4.5 0 1 1 17.5 19z"/>',
  mais: '<path d="M12 5v14M5 12h14"/>',
};
const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[n] || ''}</svg>`;
const SIMBOLO = '<svg class="simbolo" viewBox="-1 -1 4 3.7321" aria-hidden="true"><path d="M-1 -1H0A1 1 0 1 1 -1 0Z"/><path d="M2 -1H3V0A1 1 0 1 1 2 -1Z"/><path d="M2 1.7321V2.7321H1A1 1 0 1 1 2 1.7321Z"/></svg>';

/* =========================== modelo de dados =========================== */
const STATUS = [
  { id: 'afazer',     nome: 'A fazer',      cor: '#A8A3AE', ic: 'circulo',  dica: 'Ainda não começou.' },
  { id: 'producao',   nome: 'Em produção',  cor: '#FBBF24', ic: 'producao', dica: 'Alguém já está fazendo.' },
  { id: 'aprovacao',  nome: 'Em aprovação', cor: '#C4B5FD', ic: 'olho',     dica: 'Feito, esperando revisão ou aprovação.' },
  { id: 'pronto',     nome: 'Pronto',       cor: '#5EEAD4', ic: 'feito',    dica: 'Finalizado, com o link do Drive.' },
  { id: 'programado', nome: 'Programado',   cor: '#F5F3F7', ic: 'agendado', dica: 'Já agendado para sair nas redes.' },
];
const ST = Object.fromEntries(STATUS.map(s => [s.id, s]));
const FEITO = new Set(['pronto', 'programado']);
const MOTIVOS = ['Esperando o professor', 'Esperando aprovação', 'Esperando a gravação', 'Falta informação', 'Falta arquivo ou acesso'];

const PESSOA = Object.fromEntries(D.equipe.map(p => [p.id, p]));
const PERFIL = Object.fromEntries(D.perfis.map(p => [p.id, p]));
const CATEG = Object.fromEntries(D.categorias.map(c => [c.id, c]));
function prepararItem(it, p) {
  return Object.assign({}, it, {
    id: p.id + '.' + it.chave,
    projeto: p.id,
    perfil: it.perfil || p.perfil,
    passos: (it.passos || []).map(x => (typeof x === 'string' ? { t: x } : x)),
    depende: (it.depende || []).map(c => (c.includes('.') ? c : p.id + '.' + c)),
  });
}
// projetos e entregas do dados.js (fixos) + entregas criadas pelo app (guardadas na planilha)
const BASE = D.projetos.map(p => Object.assign({}, p, { itens: (p.itens || []).map(it => prepararItem(it, p)) }));
const BASE_PROJ = Object.fromEntries(BASE.map(p => [p.id, p]));
let PROJETOS = BASE, PROJ = BASE_PROJ, ITENS = BASE.flatMap(p => p.itens), ITEM = Object.fromEntries(ITENS.map(i => [i.id, i]));
const MESES_DISP = Array.from(new Set(BASE.map(p => p.mes))).sort();

function itemExtra(id, d) {
  const p = BASE_PROJ[d.projeto];
  return {
    id, chave: id, projeto: p.id, extra: true,
    perfil: PERFIL[d.perfil] ? d.perfil : p.perfil,
    titulo: String(d.titulo || 'Entrega sem nome'),
    resp: PESSOA[d.resp] ? d.resp : (D.equipe[0] || {}).id,
    formato: String(d.formato || ''),
    categoria: CATEG[d.categoria] ? d.categoria : 'comercial',
    fase: String(d.fase || 'Entregas novas'),
    prazo: /^\d{4}-\d{2}-\d{2}$/.test(d.prazo || '') ? d.prazo : '',
    publicar: /^\d{4}-\d{2}-\d{2}$/.test(d.publicar || '') ? d.publicar : '',
    hora: String(d.hora || ''),
    descricao: String(d.descricao || ''),
    passos: (Array.isArray(d.passos) ? d.passos : []).filter(Boolean).map(t => ({ t: String(t) })),
    depende: [],
  };
}
function montarItens() {
  const extras = {};
  Object.keys(estado).forEach(id => {
    const d = estado[id] && estado[id].def;
    if (d && !d.apagado && BASE_PROJ[d.projeto]) (extras[d.projeto] = extras[d.projeto] || []).push(itemExtra(id, d));
  });
  // dia e perfil escolhidos no calendário da Semana (guardados na planilha) por cima do dados.js
  const ajustar = it => {
    const e = estado[it.id];
    const base = Object.assign({}, it, { publicarBase: it.publicar || '', perfilBase: it.perfil });
    if (!e || (!e.dia && !e.perfil)) return base;
    if (e.dia) base.publicar = e.dia === 'sem' ? '' : e.dia;
    if (e.perfil && PERFIL[e.perfil]) base.perfil = e.perfil;
    return base;
  };
  PROJETOS = BASE.map(p => Object.assign({}, p, { itens: p.itens.concat(extras[p.id] || []).map(ajustar) }));
  PROJ = Object.fromEntries(PROJETOS.map(p => [p.id, p]));
  ITENS = PROJETOS.flatMap(p => p.itens);
  ITEM = Object.fromEntries(ITENS.map(i => [i.id, i]));
}

/* ============================ plataforma ============================ */
const UA = navigator.userAgent || '';
const IOS = /iPad|iPhone|iPod/.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const ANDROID = /Android/i.test(UA);
const MOBILE = IOS || ANDROID || /Mobi/i.test(UA);
const STANDALONE = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
const IN_APP = /Instagram|FBAN|FBAV|FB_IAB|Line\/|; wv\)|GSA\//.test(UA);
const IOS_CHROME = IOS && /CriOS/.test(UA);
const TOQUE = window.matchMedia ? matchMedia('(pointer: coarse)').matches : MOBILE;
let promptInstalar = null;

/* ============================== estado ============================== */
let eu = LS.get('pessoa', null);
if (eu && !PESSOA[eu]) eu = null;
let estado = LS.get('estado', {});
let fila = LS.get('fila', []);
let historico = LS.get('historico', []);
let ultimoSync = LS.get('ultimoSync', null);

function escolherMes() {
  const atual = hojeISO().slice(0, 7);
  if (MESES_DISP.includes(atual)) return atual;
  return MESES_DISP.find(m => m > atual) || MESES_DISP[MESES_DISP.length - 1] || atual;
}
const ABAS = ['inicio', 'semana', 'quadro', 'lancamentos', 'agenda'];
// segunda-feira da semana (no fim de semana, já mostra a próxima)
function segundaDe(iso) {
  const d = lerData(iso), dow = d.getDay();
  d.setDate(d.getDate() + (dow === 0 ? 1 : dow === 6 ? 2 : 1 - dow));
  return isoData(d);
}
const somar = (iso, n) => { const d = lerData(iso); d.setDate(d.getDate() + n); return isoData(d); };
const ui = {
  aba: ABAS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'inicio',
  perfil: LS.get('filtroPerfil', 'todos'),
  pessoa: 'todos',
  destacar: LS.get('destacar', true),
  projeto: null,
  mes: escolherMes(),
  passado: false,
  semana: segundaDe(hojeISO()),
  intro: null,
  plataforma: ANDROID ? 'android' : 'iphone',
};
if (ui.perfil !== 'todos' && !PERFIL[ui.perfil]) ui.perfil = 'todos';

function normalizar(v) {
  v = v || {};
  let passos = v.passos;
  if (typeof passos === 'string') { try { passos = JSON.parse(passos || '[]'); } catch (e) { passos = []; } }
  if (!Array.isArray(passos)) passos = [];
  const trav = v.travado === true || v.travado === 'TRUE' || v.travado === 'true' || v.travado === 1;
  let def = v.def;
  if (typeof def === 'string') { try { def = def ? JSON.parse(def) : null; } catch (e) { def = null; } }
  return {
    status: ST[v.status] ? v.status : 'afazer',
    link: v.link ? String(v.link) : '',
    travado: trav,
    motivo: trav && v.motivo ? String(v.motivo) : '',
    passos: passos.map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b),
    nota: v.nota ? String(v.nota) : '',
    por: v.por ? String(v.por) : '',
    atualizado: paraISO(v.atualizado),
    def: def && typeof def === 'object' ? def : null,
    dia: /^(\d{4}-\d{2}-\d{2}|sem)$/.test(String(v.dia || '')) ? String(v.dia) : '',
    perfil: v.perfil && PERFIL[v.perfil] ? String(v.perfil) : '',
  };
}
Object.keys(estado).forEach(k => { estado[k] = normalizar(estado[k]); });
montarItens();

// etapa de partida definida no dados.js (vale até alguém mexer na entrega)
function padrao(id) {
  const ini = ITEM[id] && ITEM[id].inicial;
  return normalizar(!ini ? {} : typeof ini === 'string' ? { status: ini } : ini);
}
const st = id => estado[id] || padrao(id);
const feito = id => FEITO.has(st(id).status);
const atrasado = it => !feito(it.id) && !!it.prazo && diasAte(it.prazo) < 0;
// quem programa a publicação quando fica pronta (conteúdo → Thiago; o resto → Manu; ver dados.js)
function publicaDe(it) {
  if (Object.prototype.hasOwnProperty.call(it, 'publica')) return PESSOA[it.publica] ? it.publica : null;
  if (!it.publicar || it.categoria === 'trafego' || ['Página', 'Live'].includes(it.formato)) return null;
  const regra = D.publicacao || {};
  const p = it.categoria === 'conteudo' ? regra.conteudo : regra.outros;
  return PESSOA[p] ? p : null;
}
const faltaProgramar = it => st(it.id).status === 'pronto' && !!publicaDe(it);
const envolvidos = it => Array.from(new Set([it.resp, publicaDe(it)].concat(it.passos.map(p => p.r)).filter(Boolean))).filter(p => PESSOA[p]);
const proximoPasso = it => {
  const s = st(it.id);
  const i = it.passos.findIndex((p, k) => !s.passos.includes(k));
  return i < 0 ? null : it.passos[i];
};
// é "meu" se eu sou o responsável, se o próximo passo é meu (até a legenda de algo pronto)
// ou se ficou pronto, sem passo pendente, e eu programo ("Sua vez")
const meu = it => {
  if (!eu) return false;
  if (it.resp === eu) return true;
  const s = st(it.id);
  if (s.status === 'programado') return false;
  const p = proximoPasso(it);
  if (p) return p.r === eu;
  return faltaProgramar(it) && publicaDe(it) === eu;
};
// o que ainda depende de mim (fazer, um passo meu ou programar a publicação)
const pendenteParaMim = it => {
  if (!eu) return false;
  const s = st(it.id);
  if (s.status === 'programado') return false;
  if (it.resp !== eu) return meu(it);
  if (s.status !== 'pronto') return true;
  const p = proximoPasso(it);
  return p ? p.r === eu || !p.r : publicaDe(it) === eu;
};
// posts que aparecem no calendário da Semana (tráfego, páginas, roteiros etc. não entram)
const FORMATOS_POST = ['Carrossel', 'Criativo', 'Stories', 'Reels', 'Vídeo'];
const ehPost = it => it.categoria !== 'trafego' && FORMATOS_POST.includes(it.formato);
// plano do dia (dados.js → planos)
const planoDe = (pid, dia) => { const p = (D.planos || {})[dia || hojeISO()]; return p && Array.isArray(p[pid]) ? p[pid] : null; };
const itensDeHoje = () => new Set(Object.values((D.planos || {})[hojeISO()] || {}).flat().map(b => b.item).filter(id => ITEM[id]));
const podeAdicionar = () => !!eu && (D.quemAdiciona || []).includes(eu);
const aguardando = it => it.depende.filter(d => ITEM[d] && !feito(d));
const contaPassos = it => [st(it.id).passos.filter(i => i < it.passos.length).length, it.passos.length];
const doMes = it => PROJ[it.projeto].mes === ui.mes;
const comPrazo = (a, b) => ((a.prazo || '9999') < (b.prazo || '9999') ? -1 : (a.prazo || '9999') > (b.prazo || '9999') ? 1 : 0);
const ordenar = (a, b) => (st(b.id).travado - st(a.id).travado) || (atrasado(b) - atrasado(a)) || comPrazo(a, b) || a.titulo.localeCompare(b.titulo);

function itensFiltrados(o = {}) {
  const perfil = o.perfil || ui.perfil, pessoa = o.pessoa || ui.pessoa;
  return ITENS.filter(it => doMes(it)
    && (perfil === 'todos' || it.perfil === perfil)
    && (pessoa === 'todos' || envolvidos(it).includes(pessoa)));
}

/* =========================== mudanças =========================== */
function mudar(id, campos, texto) {
  const it = ITEM[id];
  if (!it || !eu) return;
  const agora = new Date().toISOString();
  const base = st(id);
  // primeira mudança numa entrega com etapa de partida: manda a etapa junto para a planilha
  const envio = estado[id] || !it.inicial ? campos : Object.assign({ status: base.status, travado: base.travado, motivo: base.motivo, passos: base.passos }, campos);
  estado[id] = normalizar(Object.assign({}, base, campos, { por: eu, atualizado: agora }));
  if ('def' in campos || 'dia' in campos || 'perfil' in campos) montarItens();
  LS.set('estado', estado);
  historico.unshift({ quando: agora, quem: eu, id, entrega: it.titulo, texto });
  historico = historico.slice(0, 80);
  LS.set('historico', historico);
  if (ENDPOINT) {
    fila.push({ id, campos: envio, por: eu, quando: agora, texto, entrega: it.titulo });
    LS.set('fila', fila);
    clearTimeout(sync.timer);
    sync.timer = setTimeout(enviar, 500);
  }
  pedirRender();
}

function mudarStatus(id, novo) {
  const s = st(id), it = ITEM[id];
  if (!it || s.status === novo) return;
  const campos = { status: novo };
  if (FEITO.has(novo) && s.travado) { campos.travado = false; campos.motivo = ''; }
  mudar(id, campos, 'moveu para ' + ST[novo].nome);
  if (FEITO.has(novo) && !s.link) pedirLink(id);
  else toast(`<b>${esc(it.titulo)}</b> foi para ${ST[novo].nome}`);
}

function alternarPasso(id, i) {
  const it = ITEM[id], s = st(id);
  if (!it || !it.passos[i]) return;
  const set = new Set(s.passos);
  const marcando = !set.has(i);
  if (marcando) set.add(i); else set.delete(i);
  const passos = Array.from(set).sort((a, b) => a - b);
  const campos = { passos };
  let texto = (marcando ? 'concluiu o passo "' : 'desmarcou o passo "') + it.passos[i].t + '"';
  const comecou = marcando && s.status === 'afazer';
  if (comecou) { campos.status = 'producao'; texto += ' e moveu para Em produção'; }
  mudar(id, campos, texto);
  if (comecou) toast('Começou! A entrega foi para <b>Em produção</b>.');
  const statusAgora = campos.status || s.status;
  if (marcando && passos.filter(n => n < it.passos.length).length === it.passos.length && !FEITO.has(statusAgora)) {
    toast('Todos os passos feitos.', { texto: 'Marcar como pronto', fn: () => mudarStatus(id, 'pronto') });
  }
}

function salvarLink(id, valor) {
  let v = String(valor || '').trim();
  if (v && !/^https?:\/\//i.test(v)) v = 'https://' + v;
  if (v === st(id).link) return false;
  mudar(id, { link: v }, v ? 'colocou o link do Drive' : 'apagou o link do Drive');
  toast(v ? 'Link do Drive salvo.' : 'Link apagado.');
  return true;
}

/* ========================== sincronização ========================== */
const sync = { estado: ENDPOINT ? 'carregando' : 'local', ocupado: false, repetir: false, timer: 0, erro: '', versao: LS.get('versaoPlanilha', 0) };
// entregas novas pelo app precisam do código da planilha versão 2 (coluna "def")
const suportaExtras = () => !ENDPOINT || sync.versao >= 2;
// arrastar no calendário guarda "dia" e "perfil": precisa do código da planilha versão 3
const suportaCal = () => !ENDPOINT || sync.versao >= 3;

function aplicarServidor(j) {
  const novo = {};
  Object.keys(j.itens || {}).forEach(id => { novo[id] = normalizar(j.itens[id]); });
  fila.forEach(m => { novo[m.id] = normalizar(Object.assign({}, novo[m.id], m.campos, { por: m.por, atualizado: m.quando })); });
  const pend = fila.map(m => ({ quando: m.quando, quem: m.por, id: m.id, entrega: m.entrega, texto: m.texto })).reverse();
  const hist = pend.concat((j.historico || []).map(h => ({ quando: paraISO(h.quando), quem: h.quem, id: h.id, entrega: h.entrega, texto: h.texto }))).slice(0, 80);
  const mudou = JSON.stringify(novo) !== JSON.stringify(estado) || JSON.stringify(hist.slice(0, 10)) !== JSON.stringify(historico.slice(0, 10));
  estado = novo; historico = hist;
  montarItens();
  sync.versao = Number(j.versao) || 1; LS.set('versaoPlanilha', sync.versao);
  LS.set('estado', estado); LS.set('historico', historico);
  ultimoSync = new Date().toISOString(); LS.set('ultimoSync', ultimoSync);
  if (mudou) pedirRender();
}

function falhou(e) {
  sync.estado = navigator.onLine === false ? 'offline' : 'erro';
  sync.erro = String((e && e.message) || e || '');
  clearTimeout(sync.timer);
  if (fila.length) sync.timer = setTimeout(enviar, 20000);
}

async function puxar() {
  if (!ENDPOINT) return;
  if (sync.ocupado) { sync.repetir = true; return; }
  sync.ocupado = true;
  try {
    const r = await fetch(ENDPOINT + (ENDPOINT.includes('?') ? '&' : '?') + 't=' + Date.now(), { cache: 'no-store' });
    const j = await r.json();
    if (!j || j.ok === false) throw new Error((j && j.erro) || 'resposta inválida');
    aplicarServidor(j);
    sync.estado = 'ok';
  } catch (e) { falhou(e); }
  finally { sync.ocupado = false; renderSync(); depoisSync(); }
}

async function enviar() {
  if (!ENDPOINT) return;
  if (!fila.length) return puxar();
  if (sync.ocupado) { sync.repetir = true; return; }
  sync.ocupado = true; sync.estado = 'enviando'; renderSync();
  const lote = fila.slice(0, 40);
  try {
    const r = await fetch(ENDPOINT, { method: 'POST', body: JSON.stringify({ mudancas: lote }) });
    const j = await r.json();
    if (!j || j.ok === false) throw new Error((j && j.erro) || 'resposta inválida');
    fila = fila.slice(lote.length); LS.set('fila', fila);
    aplicarServidor(j);
    sync.estado = 'ok';
  } catch (e) { falhou(e); }
  finally { sync.ocupado = false; renderSync(); depoisSync(); }
}

function depoisSync() {
  if (sync.repetir || (fila.length && sync.estado === 'ok')) { sync.repetir = false; setTimeout(fila.length ? enviar : puxar, 50); }
}

function atualizarAgora() { if (!ENDPOINT) return; if (fila.length) enviar(); else puxar(); }

/* ============================ pedaços de UI ============================ */
const avatar = (pid, cls = '') => {
  const p = PESSOA[pid]; if (!p) return '';
  if (p.foto) return `<span class="av foto ${cls}" style="--cor:${p.cor}" title="${esc(p.nome)}"><img src="${esc(p.foto)}" alt="" decoding="async"></span>`;
  return `<span class="av ${cls}" style="--cor:${p.cor}" title="${esc(p.nome)}">${esc(p.nome[0])}</span>`;
};
const dm = iso => iso.slice(8, 10) + '/' + iso.slice(5, 7);
const quandoMarco = m => cap(fmtCurta(m.data)) + (m.ate ? ' a ' + fmtCurta(m.ate) : '') + (m.hora ? ' · ' + m.hora : '');
const corPerfil = p => `--pf:${p.cor};--pf-t:${p.texto}`;
const chipStatus = sid => `<span class="st-chip" style="--st:${ST[sid].cor}">${ic(ST[sid].ic)}${ST[sid].nome}</span>`;
const pfChip = pid => { const p = PERFIL[pid]; return p ? `<span class="pf-chip" style="${corPerfil(p)}"><i></i>${esc(p.nome)}</span>` : ''; };

function textoPrazo(it) {
  if (!it.prazo) return '';
  const s = st(it.id), n = diasAte(it.prazo);
  if (FEITO.has(s.status)) return 'Entregue · prazo ' + fmtCurta(it.prazo);
  if (n < 0) return 'Atrasado ' + plural(-n, 'dia', 'dias');
  if (n === 0) return 'Entrega hoje';
  if (n === 1) return 'Entrega amanhã';
  return 'Entrega ' + fmtCurta(it.prazo);
}

function cardHTML(it, o = {}) {
  const s = st(it.id), p = PERFIL[it.perfil] || D.perfis[0], proj = PROJ[it.projeto];
  const [nf, nt] = contaPassos(it);
  const at = atrasado(it), n = it.prazo ? diasAte(it.prazo) : 99;
  const fe = FEITO.has(s.status);
  const ehMeu = meu(it);
  const esp = aguardando(it);
  const cls = ['card', ehMeu ? 'meu' : '', s.travado ? 'travado' : '', fe ? 'feito' : ''].join(' ');
  return `<article class="${cls}" data-acao="abrir" data-id="${it.id}" ${o.arrastar ? 'data-arrastar' : ''} ${o.tour ? `data-tour="${o.tour}"` : ''} style="${corPerfil(p)}" tabindex="0" role="button" aria-label="${esc(it.titulo)}">
    <div class="card-topo">
      <span class="card-pf"><i></i>${esc(p.curto)}</span>
      <span class="card-fmt">${esc(it.formato || '')}</span>
      ${ehMeu ? `<span class="tag-voce">${it.resp === eu ? 'Você' : 'Sua vez'}</span>` : ''}
      ${o.hoje ? '<span class="tag-hoje">Hoje</span>' : ''}
      ${o.status ? chipStatus(s.status) : ''}
    </div>
    <h3 class="card-titulo">${esc(it.titulo)}</h3>
    <p class="card-proj">${esc(proj.nome)}</p>
    ${s.travado ? `<p class="card-aviso trava">${ic('alerta')}<span>Travado: ${esc(s.motivo || 'sem motivo informado')}</span></p>` : ''}
    ${!s.travado && !fe && esp.length ? `<p class="card-aviso espera">${ic('relogio')}<span>Aguardando ${esc(ITEM[esp[0]].titulo)}${esp.length > 1 ? ' e mais ' + (esp.length - 1) : ''}</span></p>` : ''}
    ${(() => {
      if (s.status === 'programado') return '';
      // pronto: primeiro o passo que faltar (ex.: legenda), depois programar
      const px = !s.travado && (s.status === 'pronto' || (!fe && !esp.length)) ? proximoPasso(it) : null;
      const pub = !px && faltaProgramar(it) ? publicaDe(it) : null;
      if (pub) return `<p class="card-prox">${ic('agendado')}<span>${pub === eu ? 'Sua vez: programar' : 'Falta programar'} para ${fmtCurta(it.publicar)}${it.hora ? ', ' + esc(it.hora) : ''}${pub !== eu ? ` <b>(${esc(PESSOA[pub].nome)})</b>` : ''}</span></p>`;
      if (!px) return '';
      const outro = px.r && px.r !== it.resp && PESSOA[px.r];
      const txt = px.r === eu && it.resp !== eu ? 'Sua vez: ' + esc(px.t) : outro ? `Esperando ${esc(PESSOA[px.r].nome)}: ${esc(px.t)}` : 'Próximo: ' + esc(px.t);
      return `<p class="card-prox ${outro && px.r !== eu ? 'espera-outro' : ''}">${ic('seta')}<span>${txt}</span></p>`;
    })()}
    <div class="card-rodape">
      ${it.prazo ? `<span class="card-prazo ${at ? 'ruim' : !fe && n <= 2 ? 'perto' : ''}">${ic('relogio')}${textoPrazo(it)}</span>` : ''}
      ${nt ? `<span class="card-passos ${nf === nt ? 'completo' : ''}">${ic('lista')}${nf}/${nt}</span>` : ''}
      ${s.link ? `<span class="card-link" title="Tem link do Drive">${ic('link')}</span>` : ''}
      <span class="avs">${envolvidos(it).map(x => avatar(x, 'peq')).join('')}</span>
    </div>
  </article>`;
}

function linhaMini(it, extra = '') {
  const s = st(it.id);
  return `<button class="mini" data-acao="abrir" data-id="${it.id}" style="${corPerfil(PERFIL[it.perfil])}">
    <span class="mini-st" style="--st:${ST[s.status].cor}">${ic(s.travado ? 'alerta' : ST[s.status].ic)}</span>
    <span class="mini-txt"><b>${esc(it.titulo)}</b><small>${extra || `${esc(PESSOA[it.resp] ? PESSOA[it.resp].nome : '')} · ${s.travado ? 'Travado' : ST[s.status].nome}`}</small></span>
    ${ic('seta', 'mini-seta')}
  </button>`;
}

function seletorMes(sempre) {
  if (MESES_DISP.length < 2) return sempre ? `<span class="mes-rotulo">${nomeMes(ui.mes)}</span>` : '';
  const i = MESES_DISP.indexOf(ui.mes);
  return `<span class="mes-sel">
    <button class="btn-ic" data-acao="mes" data-v="${MESES_DISP[i - 1] || ''}" ${i <= 0 ? 'disabled' : ''} aria-label="Mês anterior">${ic('voltar')}</button>
    <span class="mes-rotulo">${nomeMes(ui.mes)}</span>
    <button class="btn-ic" data-acao="mes" data-v="${MESES_DISP[i + 1] || ''}" ${i >= MESES_DISP.length - 1 ? 'disabled' : ''} aria-label="Próximo mês">${ic('seta')}</button>
  </span>`;
}

function avisos() {
  let h = '';
  if (D.exemplo) h += `<div class="aviso aviso-exemplo">${ic('alerta')}<p><b>Lançamentos de exemplo.</b> Os nomes e as datas ainda são provisórios: o Yuri vai cadastrar os lançamentos reais.</p></div>`;
  if (!ENDPOINT) h += `<div class="aviso aviso-local">${ic('nuvem')}<p><b>Ainda não sincroniza com a equipe.</b> Por enquanto, o que você marca fica salvo só neste aparelho. Quando o Yuri ligar a sincronização, todo mundo passa a ver as mesmas coisas.</p></div>`;
  return h;
}

function filtrosHTML(o = {}) {
  const pessoas = [eu].concat(D.equipe.map(p => p.id).filter(x => x !== eu)).filter(Boolean);
  return `<div class="filtros" data-tour="filtros">
    <div class="chips" role="group" aria-label="Filtrar por perfil">
      <button class="chip ${ui.perfil === 'todos' ? 'ativo' : ''}" data-acao="filtro-perfil" data-v="todos">Todos os perfis</button>
      ${D.perfis.map(p => `<button class="chip chip-pf ${ui.perfil === p.id ? 'ativo' : ''}" data-acao="filtro-perfil" data-v="${p.id}" style="${corPerfil(p)}"><i></i>${esc(p.nome)}</button>`).join('')}
    </div>
    ${o.pessoa === false ? '' : `<div class="chips" role="group" aria-label="Filtrar por pessoa">
      <button class="chip ${ui.pessoa === 'todos' ? 'ativo' : ''}" data-acao="filtro-pessoa" data-v="todos">Toda a equipe</button>
      ${pessoas.map(pid => `<button class="chip ${ui.pessoa === pid ? 'ativo' : ''}" data-acao="filtro-pessoa" data-v="${pid}">${avatar(pid, 'peq')}${pid === eu ? 'Só o meu' : esc(PESSOA[pid].nome)}</button>`).join('')}
    </div>`}
  </div>`;
}

/* ============================== telas ============================== */
function saudacao() { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; }

function heroLancamentos() {
  const hoje = hojeISO();
  const lancs = PROJETOS.filter(p => p.tipo === 'lancamento' && p.data && p.data >= hoje).sort((a, b) => (a.data < b.data ? -1 : 1));
  if (!lancs.length) return '';
  const data = lancs[0].data;
  const grupo = lancs.filter(p => p.data === data);
  const itens = grupo.flatMap(p => p.itens);
  const nf = itens.filter(i => feito(i.id)).length;
  const pct = itens.length ? Math.round(nf / itens.length * 100) : 0;
  const n = diasAte(data);
  const C = 2 * Math.PI * 42;
  return `<section class="hero" data-acao="ir-lancamentos" role="button" tabindex="0">
    <div class="hero-txt">
      <span class="sobre">${grupo.length > 1 ? plural(grupo.length, 'lançamento', 'lançamentos') + ' no mesmo dia' : 'Próximo lançamento'}${grupo.some(p => p.provisoria) ? ' · data provisória' : ''}</span>
      <h2>${n === 0 ? 'É hoje!' : `Faltam <b>${n}</b> ${n === 1 ? 'dia' : 'dias'}`}</h2>
      <p class="hero-data">${ic('foguete')} ${cap(fmtCurta(data))}</p>
      <div class="hero-pfs">${grupo.map(p => {
        const its = p.itens, f = its.filter(i => feito(i.id)).length;
        return `<span class="hero-pf" style="${corPerfil(PERFIL[p.perfil])}"><i></i><span>${esc(PERFIL[p.perfil].nome)}</span><em>${f}/${its.length}</em></span>`;
      }).join('')}</div>
    </div>
    <div class="hero-anel" aria-label="${pct}% pronto">
      <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" class="anel-fundo"/><circle cx="50" cy="50" r="42" class="anel-valor" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct / 100)}"/></svg>
      <div><b>${pct}%</b><small>${nf} de ${itens.length}<br>prontas</small></div>
    </div>
    <span class="hero-ver">Ver o passo a passo ${ic('seta')}</span>
  </section>`;
}

function heroMarcos() {
  const hoje = hojeISO();
  const ms = (D.marcos || []).filter(m => (m.ate || m.data) >= hoje).sort((a, b) => (a.data < b.data ? -1 : a.data > b.data ? 1 : 0));
  if (!ms.length) return heroLancamentos();
  const m = ms[0];
  const n = diasAte(m.data);
  const titulo = m.data <= hoje ? (m.ate && m.ate > hoje && m.data < hoje ? 'Acontecendo agora' : 'É hoje!') : n === 1 ? 'É amanhã' : `Faltam <b>${n}</b> dias`;
  const pf = PERFIL[m.perfil] || D.perfis[0];
  const itens = ITENS.filter(doMes);
  const nf = itens.filter(i => feito(i.id)).length;
  const pct = itens.length ? Math.round(nf / itens.length * 100) : 0;
  const C = 2 * Math.PI * 42;
  return `<section class="hero" data-acao="ir-lancamentos" role="button" tabindex="0">
    <div class="hero-txt">
      <span class="sobre">Próximo na linha do tempo</span>
      <h2>${titulo}</h2>
      <p class="hero-marco" style="${corPerfil(pf)}"><i></i><span>${esc(m.titulo)}</span></p>
      <p class="hero-data">${ic('agenda')} ${quandoMarco(m)}</p>
    </div>
    <div class="hero-anel" aria-label="${pct}% do mês pronto">
      <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" class="anel-fundo"/><circle cx="50" cy="50" r="42" class="anel-valor" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct / 100)}"/></svg>
      <div><b>${pct}%</b><small>do mês<br>pronto</small></div>
    </div>
    ${ms.length > 1 ? `<ol class="hero-linha">${ms.slice(1, 6).map(x => `<li style="${corPerfil(PERFIL[x.perfil] || pf)}"><span class="hl-data">${dm(x.data)}${x.ate ? '–' + dm(x.ate) : ''}</span><i></i><span class="hl-tit">${esc(x.titulo)}${x.hora ? ' · ' + esc(x.hora) : ''}</span></li>`).join('')}</ol>` : ''}
    <span class="hero-ver">Ver lançamentos e linha do tempo ${ic('seta')}</span>
  </section>`;
}

const minutos = h => { const [a, b] = String(h).split(':').map(Number); return a * 60 + (b || 0); };
const fmtHora = h => { const [a, b] = String(h).split(':'); return Number(a) + 'h' + (b && b !== '00' ? b : ''); };

// blocos de horário do plano do dia
function blocosHTML(blocos, o = {}) {
  const agora = new Date(), min = agora.getHours() * 60 + agora.getMinutes();
  const vistos = new Set();
  return `<ol class="blocos ${o.compacto ? 'compacto' : ''}">${blocos.map(b => {
    const ini = minutos(b.das), fim = minutos(b.ate);
    const atual = min >= ini && min < fim, passou = min >= fim;
    const it = b.item && ITEM[b.item];
    const primeiro = it && !vistos.has(it.id);
    if (it) vistos.add(it.id);
    const faz = esc(b.faz || (it ? it.titulo : ''));
    return `<li class="bloco ${b.pausa ? 'pausa' : ''} ${atual ? 'agora' : ''} ${passou ? 'passou' : ''}">
      <span class="bl-hora"><b>${fmtHora(b.das)}</b><small>${fmtHora(b.ate)}</small></span>
      <div class="bl-corpo">
        ${o.compacto && it ? `<button class="bl-faz" data-acao="abrir" data-id="${it.id}">${faz}</button>` : `<p class="bl-faz">${faz}${atual ? ' <span class="tag-agora">agora</span>' : ''}</p>`}
        ${it && !o.compacto ? (primeiro ? cardHTML(it, { status: true }) : `<button class="bl-ver" data-acao="abrir" data-id="${it.id}">Continuar: abrir a entrega ${ic('seta')}</button>`) : ''}
      </div>
    </li>`;
  }).join('')}</ol>`;
}

function telaInicio() {
  const me = PESSOA[eu] || { nome: '' };
  const hojeIso = hojeISO();
  const doMesItens = ITENS.filter(doMes);
  const plano = planoDe(eu);
  const exp = (D.expediente || {})[eu];
  const hojeSet = itensDeHoje();
  // entregas de hoje de outras pessoas que esperam um passo meu (copy, roteiro, revisão, legenda...)
  const destravar = [...hojeSet].map(id => ITEM[id]).filter(it => it && it.resp !== eu && st(it.id).status !== 'programado'
    && it.passos.some((p, i) => p.r === eu && !st(it.id).passos.includes(i)));
  const noBacklog = doMesItens.filter(it => pendenteParaMim(it) && !hojeSet.has(it.id)).length;
  const travados = doMesItens.filter(i => st(i.id).travado && !feito(i.id)).sort(ordenar);
  const atrasados = doMesItens.filter(i => atrasado(i) && !st(i.id).travado).sort(ordenar);
  const limite = somar(hojeIso, 3);
  const prontosParaProgramar = doMesItens.filter(faltaProgramar).sort((a, b) => (a.publicar < b.publicar ? -1 : 1));
  const programar = prontosParaProgramar.filter(it => it.publicar <= limite);
  const depois = prontosParaProgramar.length - programar.length;
  const equipe = D.equipe.filter(p => p.id !== eu && planoDe(p.id));
  const total = doMesItens.length, prontos = doMesItens.filter(i => feito(i.id)).length;
  const hoje = new Date();

  return `<div class="pagina pagina-inicio">
    <header class="cab-tela">
      <div>
        <p class="sobre">${DIAS[hoje.getDay()]}, ${hoje.getDate()} de ${MESES[hoje.getMonth()]}</p>
        <h1>${saudacao()}, ${esc(me.nome)}</h1>
      </div>
      <div class="cab-dir">${seletorMes(true)}<span class="mes-prog">${prontos} de ${total} entregas prontas</span></div>
    </header>
    ${avisos()}
    <div class="inicio-grade">
      <div class="col-principal">
        <section class="secao" data-tour="minhas">
          <div class="secao-cab"><h2>Seu dia</h2>${exp ? `<span class="expediente">${ic('relogio')} Expediente: ${esc(exp)}</span>` : ''}</div>
          ${plano ? blocosHTML(plano)
            : `<div class="vazio">${ic('agenda')}<p><b>Nada marcado com horário para você hoje.</b><br>${destravar.length ? 'Veja abaixo o que a equipe precisa de você.' : 'Quando estiver livre, pegue algo do backlog.'}</p></div>`}
          <button class="btn btn-sec btn-backlog" data-acao="ver-meus">${ic('quadro')} Quando estiver livre: ver o backlog${noBacklog ? ` (${noBacklog} com você)` : ''}</button>
        </section>
        ${destravar.length ? `<section class="secao">
          <div class="secao-cab"><h2>Hoje a equipe precisa de você</h2></div>
          <div class="lista-mini">${destravar.map(it => {
            const ps = it.passos.filter((p, i) => p.r === eu && !st(it.id).passos.includes(i)).map(p => p.t);
            return linhaMini(it, `${esc(PESSOA[it.resp].nome)} precisa: ${esc(ps.join(', '))}`);
          }).join('')}</div>
        </section>` : ''}
        ${equipe.length ? `<section class="secao">
          <div class="secao-cab"><h2>O dia da equipe</h2></div>
          <div class="dia-equipe">${equipe.map(p => `<div class="de-pessoa">
            <div class="de-cab">${avatar(p.id)}<b>${esc(p.nome)}</b>${(D.expediente || {})[p.id] ? `<small>${esc(D.expediente[p.id])}</small>` : ''}</div>
            ${blocosHTML(planoDe(p.id), { compacto: true })}
          </div>`).join('')}</div>
        </section>` : ''}
        ${D.marcos ? heroMarcos() : heroLancamentos()}
      </div>
      <div class="col-lateral">
        <section class="secao" data-tour="travando">
          <div class="secao-cab"><h2>O que está travando</h2></div>
          ${travados.length || atrasados.length ? `<div class="lista-mini">
            ${travados.map(it => linhaMini(it, `${ic('alerta')} ${esc(st(it.id).motivo || 'Travado')} · ${esc(PESSOA[it.resp].nome)}`)).join('')}
            ${atrasados.slice(0, 8).map(it => linhaMini(it, `Atrasado ${plural(-diasAte(it.prazo), 'dia', 'dias')} · ${esc(PESSOA[it.resp].nome)}`)).join('')}
          </div>` : `<div class="vazio pequeno">${ic('feito')}<p>Nada travado e nada atrasado agora.</p></div>`}
        </section>
        <section class="secao">
          <div class="secao-cab"><h2>Falta programar</h2>${depois ? `<button class="ver" data-acao="aba" data-v="semana">+${depois} na Semana ${ic('seta')}</button>` : ''}</div>
          ${programar.length ? `<div class="lista-mini">${programar.map(it => linhaMini(it, `Publicar ${fmtCurta(it.publicar)}${it.hora ? ', ' + esc(it.hora) : ''} (${fmtFalta(it.publicar)}) · ${esc(PESSOA[publicaDe(it)].nome)} programa`)).join('')}</div>`
            : `<div class="vazio pequeno">${ic('agendado')}<p>Nada pronto para sair nos próximos dias.</p></div>`}
        </section>
        <section class="secao">
          <div class="secao-cab"><h2>Últimas mudanças</h2></div>
          ${historico.some(h => ITEM[h.id]) ? `<ul class="atividade">${historico.filter(h => ITEM[h.id]).slice(0, 8).map(h => `<li>
            ${avatar(h.quem, 'peq')}
            <p><b>${esc(PESSOA[h.quem] ? PESSOA[h.quem].nome : h.quem)}</b> ${esc(h.texto)} em <button class="link-txt" data-acao="abrir" data-id="${h.id}">${esc(ITEM[h.id].titulo)}</button><small>${fmtQuando(h.quando)}</small></p>
          </li>`).join('')}</ul>` : `<div class="vazio pequeno">${ic('relogio')}<p>Ninguém mexeu em nada ainda.</p></div>`}
        </section>
      </div>
    </div>
  </div>`;
}

function telaQuadro() {
  const itens = itensFiltrados();
  const porSt = Object.fromEntries(STATUS.map(s => [s.id, []]));
  itens.forEach(it => porSt[st(it.id).status].push(it));
  const hojeSet = itensDeHoje();
  const ord = (a, b) => (ui.destacar ? meu(b) - meu(a) : 0) || ordenar(a, b);
  let tourMarcado = false;
  const cardsCol = sid => porSt[sid].sort(ord).map(it => {
    let tour = '';
    if (!tourMarcado && (meu(it) || sid === 'afazer')) { tour = 'card-quadro'; tourMarcado = true; }
    return cardHTML(it, { arrastar: true, tour, hoje: hojeSet.has(it.id) });
  }).join('');
  return `<div class="pagina pagina-larga">
    <header class="cab-tela">
      <div><p class="sobre">${nomeMes(ui.mes)}</p><h1>Backlog</h1><p class="sub">Tudo o que ainda precisa ser feito no mês. Quando estiver livre, pegue algo daqui. ${TOQUE ? 'Segure um card e arraste para mudar a etapa.' : 'Arraste os cards para mudar a etapa.'}</p></div>
      <div class="cab-dir">${seletorMes()}
        <label class="interruptor"><input type="checkbox" data-campo="destacar" ${ui.destacar ? 'checked' : ''}><span class="int-trilho"><span></span></span>Destacar o que é meu</label>
        ${podeAdicionar() ? `<button class="btn btn-sec btn-nova" data-acao="nova">${ic('mais')} Nova entrega</button>` : ''}
      </div>
    </header>
    ${filtrosHTML()}
    <nav class="quadro-nav" aria-label="Etapas">${STATUS.map(s => `<button data-acao="coluna" data-v="${s.id}" style="--st:${s.cor}"><i></i>${s.nome}<b>${porSt[s.id].length}</b></button>`).join('')}</nav>
    <div class="quadro-rolagem ${ui.destacar && eu ? 'destacar' : ''}" data-tour="colunas">
      <div class="quadro">${STATUS.map(s => `<section class="coluna" data-drop="${s.id}" data-status-col="${s.id}" style="--st:${s.cor}">
        <header class="col-cab">${ic(s.ic)}<h2>${s.nome}</h2><span class="col-n">${porSt[s.id].length}</span></header>
        <p class="col-dica">${s.dica}</p>
        <div class="col-lista">${cardsCol(s.id) || `<div class="col-vazia">Nada aqui${TOQUE ? '' : '. Arraste um card para cá.'}</div>`}</div>
      </section>`).join('')}</div>
    </div>
  </div>`;
}

function barraStatus(itens) {
  const tot = itens.length || 1;
  return `<div class="barra-st">${STATUS.map(s => {
    const n = itens.filter(i => st(i.id).status === s.id).length;
    return n ? `<i style="--st:${s.cor};width:${(n / tot) * 100}%" title="${s.nome}: ${n}"></i>` : '';
  }).join('')}</div>`;
}

function resumoProjeto(itens) {
  const nf = itens.filter(i => feito(i.id)).length;
  const tr = itens.filter(i => st(i.id).travado && !feito(i.id)).length;
  const at = itens.filter(atrasado).length;
  return `<span>${nf} de ${itens.length} prontas</span>${tr ? `<span class="t-alerta">${plural(tr, 'travada', 'travadas')}</span>` : ''}${at ? `<span class="t-ruim">${plural(at, 'atrasada', 'atrasadas')}</span>` : ''}`;
}

function marcaPerfil(p) {
  return `<span class="marca-pf" style="${corPerfil(p)}">${SIMBOLO}<span>${esc(p.curto)}<b>talks</b></span></span>`;
}

function telaLancamentos() {
  if (ui.projeto && PROJ[ui.projeto]) return telaProjeto(PROJ[ui.projeto]);
  const projs = PROJETOS.filter(p => p.mes === ui.mes && (ui.perfil === 'todos' || p.perfil === ui.perfil));
  const lancs = projs.filter(p => p.tipo === 'lancamento').sort((a, b) => (a.data < b.data ? -1 : 1));
  const outros = projs.filter(p => p.tipo !== 'lancamento');
  const card = p => {
    const pf = PERFIL[p.perfil];
    return `<article class="proj-card" data-acao="abrir-proj" data-id="${p.id}" style="${corPerfil(pf)}" role="button" tabindex="0">
      <div class="proj-topo">${marcaPerfil(pf)}${p.data ? `<span class="proj-quando">${cap(fmtCurta(p.data))}<small>${p.provisoria ? 'data provisória' : fmtFalta(p.data)}</small></span>` : ''}</div>
      <h2>${esc(p.nome)}</h2>
      ${p.resumo ? `<p class="proj-sub">${esc(p.resumo)}</p>` : ''}
      ${barraStatus(p.itens)}
      <p class="proj-resumo">${resumoProjeto(p.itens)}</p>
      <div class="proj-pessoas">${D.equipe.map(pe => {
        const its = p.itens.filter(i => i.resp === pe.id);
        return its.length ? `<span>${avatar(pe.id, 'peq')}${its.filter(i => feito(i.id)).length}/${its.length}</span>` : '';
      }).join('')}<span class="proj-abrir">Ver passo a passo ${ic('seta')}</span></div>
    </article>`;
  };
  return `<div class="pagina">
    <header class="cab-tela"><div><p class="sobre">${nomeMes(ui.mes)}</p><h1>Lançamentos e projetos</h1><p class="sub">Toque num lançamento para ver o passo a passo completo.</p></div><div class="cab-dir">${seletorMes()}</div></header>
    ${linhaDoTempo()}
    ${filtrosHTML({ pessoa: false })}
    ${lancs.length ? `<h2 class="titulo-grupo">Lançamentos</h2><div class="projs">${lancs.map(card).join('')}</div>` : ''}
    ${outros.length ? `<h2 class="titulo-grupo">Conteúdo e produtos do mês</h2><div class="projs">${outros.map(card).join('')}</div>` : ''}
    ${!projs.length ? `<div class="vazio">${ic('foguete')}<p>Nenhum projeto ${ui.perfil !== 'todos' ? 'deste perfil ' : ''}neste mês.</p></div>` : ''}
  </div>`;
}

function linhaDoTempo() {
  const hoje = hojeISO();
  const ms = (D.marcos || []).filter(m => m.data.slice(0, 7) === ui.mes || (m.ate || '').slice(0, 7) === ui.mes);
  if (!ms.length) return '';
  return `<section class="linha-mes">
    <h2 class="titulo-grupo">Linha do tempo</h2>
    <ol class="marcos">${ms.map(m => {
      const passou = (m.ate || m.data) < hoje, agora = m.data <= hoje && (m.ate || m.data) >= hoje;
      const pf = PERFIL[m.perfil] || D.perfis[0];
      const clic = m.projeto && PROJ[m.projeto] ? `data-acao="abrir-proj" data-id="${m.projeto}" role="button" tabindex="0"` : '';
      return `<li class="marco ${passou ? 'passou' : ''} ${agora ? 'agora' : ''}" style="${corPerfil(pf)}" ${clic}>
        <span class="mc-ponto"></span>
        <span class="mc-txt"><small>${quandoMarco(m)}${agora ? ' · <b>agora</b>' : ''}</small><b>${esc(m.titulo)}</b></span>
      </li>`;
    }).join('')}</ol>
  </section>`;
}

function telaProjeto(p) {
  const pf = PERFIL[p.perfil];
  // fases na ordem em que aparecem no dados.js; entregas novas no fim
  const fases = Array.from(new Set(p.itens.map(i => i.fase || 'Entregas')));
  const nf = p.itens.filter(i => feito(i.id)).length;
  const pct = Math.round(nf / (p.itens.length || 1) * 100);
  const n = p.data ? diasAte(p.data) : null;
  const passo = it => {
    const s = st(it.id), at = atrasado(it), esp = aguardando(it);
    const fe = FEITO.has(s.status);
    return `<li class="lt ${fe ? 'feito' : ''} ${meu(it) ? 'meu' : ''}" style="--st:${s.travado ? 'var(--trava)' : ST[s.status].cor}">
      <span class="lt-marca">${ic(s.travado ? 'alerta' : ST[s.status].ic)}</span>
      <button class="lt-corpo" data-acao="abrir" data-id="${it.id}">
        <span class="lt-linha1"><b>${esc(it.titulo)}</b>${meu(it) ? `<span class="tag-voce">${it.resp === eu ? 'Você' : 'Sua vez'}</span>` : ''}</span>
        <span class="lt-linha2">${avatar(it.resp, 'peq')}${esc(PESSOA[it.resp].nome)} · <span class="${at ? 't-ruim' : ''}">${textoPrazo(it)}</span>${it.publicar ? ` · publicar ${fmtCurta(it.publicar)}${it.hora ? ', ' + esc(it.hora) : ''}` : ''}</span>
        ${s.travado ? `<span class="lt-aviso t-alerta">${ic('alerta')} Travado: ${esc(s.motivo)}</span>` : ''}
        ${!s.travado && !fe && esp.length ? `<span class="lt-aviso">${ic('relogio')} Aguardando ${esp.map(d => esc(ITEM[d].titulo)).join(', ')}</span>` : ''}
      </button>
      ${chipStatus(s.status)}
    </li>`;
  };
  return `<div class="pagina">
    <button class="voltar" data-acao="fechar-proj">${ic('voltar')} Todos os lançamentos</button>
    <header class="proj-hero" style="${corPerfil(pf)}">
      <div class="proj-hero-txt">
        ${marcaPerfil(pf)}
        <h1>${esc(p.nome)}</h1>
        ${p.resumo ? `<p class="proj-sub">${esc(p.resumo)}</p>` : ''}
        ${p.data ? `<p>${ic('foguete')} ${p.tipo === 'lancamento' ? 'Lançamento' : 'Data'}: <b>${fmtCurta(p.data)}</b> · ${n === 0 ? 'é hoje' : n > 0 ? 'faltam ' + plural(n, 'dia', 'dias') : 'já passou'}${p.provisoria ? ' · <span class="t-alerta">data provisória</span>' : ''}</p>` : ''}
        ${barraStatus(p.itens)}
        <p class="proj-resumo">${resumoProjeto(p.itens)}</p>
      </div>
      <div class="proj-hero-pct"><b>${pct}%</b><small>pronto</small></div>
    </header>
    <div class="proj-equipe">${D.equipe.map(pe => {
      const its = p.itens.filter(i => i.resp === pe.id);
      if (!its.length) return '';
      const f = its.filter(i => feito(i.id)).length;
      return `<div class="pe ${pe.id === eu ? 'eu' : ''}">${avatar(pe.id)}<div><b>${esc(pe.nome)}${pe.id === eu ? ' (você)' : ''}</b><small>${f} de ${its.length} prontas</small><span class="pe-barra"><i style="width:${(f / its.length) * 100}%"></i></span></div></div>`;
    }).join('')}</div>
    <h2 class="titulo-grupo">Passo a passo</h2>
    ${fases.map(f => `<section class="fase"><h3>${esc(f)}</h3><ol class="linha-tempo">${p.itens.filter(i => (i.fase || 'Entregas') === f).sort(comPrazo).map(passo).join('')}</ol></section>`).join('')}
    ${podeAdicionar() ? `<button class="btn btn-sec btn-nova" data-acao="nova" data-id="${p.id}">${ic('mais')} Nova entrega neste projeto</button>` : ''}
  </div>`;
}

/* ---------- Semana: calendário de posts (segunda a sexta + fim de semana, por perfil) ---------- */
function postHTML(it, arrastar) {
  const s = st(it.id);
  const cor = s.travado ? 'var(--trava)' : ST[s.status].cor;
  const nome = s.travado ? 'Travado' : ST[s.status].nome;
  return `<div class="post ${meu(it) ? 'meu' : ''} ${s.status === 'programado' ? 'prog' : ''}" ${arrastar ? 'data-arrastar' : ''} data-acao="abrir" data-id="${it.id}" role="button" tabindex="0" style="--st:${cor};${corPerfil(PERFIL[it.perfil])}" title="${esc(it.titulo)} · ${nome}">
    <span class="post-tit">${esc(it.titulo)}</span>
    <span class="post-meta"><i></i><span>${nome}${it.hora ? ' · ' + esc(it.hora) : ''}</span><span class="avs">${avatar(publicaDe(it) || it.resp, 'peq')}</span></span>
  </div>`;
}

function moverPost(id, dia, perfil) {
  const it = ITEM[id];
  if (!it) return;
  if (!suportaCal()) { toast('Falta atualizar o código da planilha para salvar o calendário.'); return; }
  const novoDia = dia === 'sem' ? '' : dia;
  const novoPerfil = perfil && PERFIL[perfil] ? perfil : it.perfil;
  if (novoDia === (it.publicar || '') && novoPerfil === it.perfil) return;
  const campos = {
    dia: novoDia === it.publicarBase ? '' : (novoDia || 'sem'),
    perfil: novoPerfil === it.perfilBase ? '' : novoPerfil,
  };
  const texto = novoDia ? `marcou para ${fmtCurta(novoDia)}${novoPerfil !== it.perfil ? ' no ' + PERFIL[novoPerfil].nome : ''}` : 'tirou do calendário';
  mudar(id, campos, texto);
  toast(`<b>${esc(it.titulo)}</b>: ${novoDia ? cap(fmtCurta(novoDia)) + ' · ' + esc(PERFIL[novoPerfil].nome) : 'sem dia'}`);
}

function telaSemana() {
  const seg = ui.semana, hoje = hojeISO();
  const dias = [0, 1, 2, 3, 4].map(i => somar(seg, i));
  const fds = [somar(seg, 5), somar(seg, 6)];
  const cols = dias.map(d => ({ chave: d, datas: [d], rotulo: cap(DIAS_C[lerData(d).getDay()]), num: dm(d) }))
    .concat([{ chave: fds[0], datas: fds, rotulo: 'Sáb e dom', num: dm(fds[0]) + ' e ' + dm(fds[1]), fds: true }]);
  const ok = suportaCal();
  const posts = ITENS.filter(ehPost);
  const daSemana = posts.filter(it => it.publicar && it.publicar >= seg && it.publicar <= fds[1]);
  // sem dia = posts que tinham dia e foram tirados do calendário (ou entregas novas com cara de post)
  const semDia = posts.filter(it => !it.publicar && doMes(it) && (it.publicarBase || it.extra));
  const ini = lerData(seg), sex = lerData(dias[4]);
  const titulo = `${ini.getDate()}${ini.getMonth() !== sex.getMonth() ? ' de ' + MESES[ini.getMonth()] : ''} a ${sex.getDate()} de ${MESES[sex.getMonth()]}`;
  const perfis = D.perfis;
  let grade = '<div class="cal-canto"></div>' + perfis.map(p => `<div class="cal-pf" style="${corPerfil(p)}">${marcaPerfil(p)}</div>`).join('');
  cols.forEach(c => {
    const ehHoje = c.datas.includes(hoje);
    grade += `<div class="cal-dia ${ehHoje ? 'hoje' : ''} ${c.fds ? 'fds' : ''}"><b>${c.rotulo}</b><small>${c.num}${ehHoje ? ' · hoje' : ''}</small></div>`;
    perfis.forEach(p => {
      const ps = daSemana.filter(it => c.datas.includes(it.publicar) && it.perfil === p.id)
        .sort((a, b) => (a.publicar + (a.hora || '')).localeCompare(b.publicar + (b.hora || '')));
      grade += `<div class="cal-cel ${ehHoje ? 'hoje' : ''} ${c.fds ? 'fds' : ''}" data-dia="${c.chave}" data-perfil="${p.id}" style="${corPerfil(p)}">
        <span class="cel-pf"><i></i>${esc(p.nome)}</span>${ps.map(it => postHTML(it, ok)).join('')}</div>`;
    });
  });
  return `<div class="pagina pagina-larga">
    <header class="cab-tela">
      <div><p class="sobre">Calendário de posts</p><h1>Semana</h1><p class="sub">${ok ? (TOQUE ? 'Segure um post e arraste para outro dia ou perfil.' : 'Arraste os posts para outro dia ou perfil.') : 'Veja como os posts da semana estão distribuídos.'} A cor mostra a etapa de cada um.</p></div>
      <div class="cab-dir">
        <div class="sem-nav">
          <button class="btn-ic" data-acao="semana" data-v="-7" aria-label="Semana anterior">${ic('voltar')}</button>
          <b>${titulo}</b>
          <button class="btn-ic" data-acao="semana" data-v="7" aria-label="Próxima semana">${ic('seta')}</button>
        </div>
        ${seg !== segundaDe(hoje) ? '<button class="btn btn-ghost" data-acao="semana" data-v="0">Voltar para esta semana</button>' : ''}
        <button class="btn btn-ghost" data-acao="aba" data-v="agenda">${ic('lista')} Prazos em lista</button>
      </div>
    </header>
    ${ok ? '' : `<div class="aviso aviso-exemplo">${ic('alerta')}<p><b>Falta um passo para arrastar e salvar para a equipe:</b> atualizar o código da planilha (versão 3). Até lá, o calendário só mostra.</p></div>`}
    <div class="cal-legenda">${STATUS.map(s => `<span style="--st:${s.cor}"><i></i>${s.nome}</span>`).join('')}<span style="--st:var(--trava)"><i></i>Travado</span></div>
    <div class="bandeja" data-dia="sem" data-perfil="">
      <div class="bandeja-cab"><b>Posts sem dia</b><small>${semDia.length ? (ok ? 'Arraste para um dia do calendário.' : '') : (ok ? 'Nenhum. Arraste um post para cá para tirar do calendário.' : 'Nenhum.')}</small></div>
      ${semDia.length ? `<div class="bandeja-lista">${semDia.map(it => postHTML(it, ok)).join('')}</div>` : ''}
    </div>
    <div class="cal-rolagem" data-tour="calendario">
      <div class="cal" style="--cols:${cols.length};--linhas:${perfis.length}">${grade}</div>
    </div>
  </div>`;
}

function telaAgenda() {
  const itens = itensFiltrados();
  const hoje = hojeISO();
  const ent = [];
  itens.forEach(it => {
    if (it.prazo) ent.push({ data: it.prazo, tipo: 'prazo', it });
    if (it.publicar) ent.push({ data: it.publicar, tipo: 'publicar', it });
  });
  const atrasadas = itens.filter(atrasado).sort(comPrazo);
  const visiveis = ent.filter(e => ui.passado || e.data >= hoje).sort((a, b) => (a.data < b.data ? -1 : a.data > b.data ? 1 : a.tipo === 'prazo' ? -1 : 1));
  const dias = [];
  visiveis.forEach(e => { const u = dias[dias.length - 1]; if (u && u.data === e.data) u.ent.push(e); else dias.push({ data: e.data, ent: [e] }); });
  const semanaFim = isoData(new Date(Date.now() + 6 * 864e5));
  const daSemana = ent.filter(e => e.data >= hoje && e.data <= semanaFim);

  const situacaoPub = it => {
    const s = st(it.id);
    if (s.status === 'programado') return `<span class="pub ok">${ic('agendado')} ${diasAte(it.publicar) < 0 ? 'Publicado' : 'Programado'}</span>`;
    if (s.status === 'pronto') return `<span class="pub falta">${ic('alerta')} Falta programar${publicaDe(it) ? ' · ' + esc(PESSOA[publicaDe(it)].nome) : ''}</span>`;
    const n = diasAte(it.publicar);
    return `<span class="pub ${n <= 2 ? 'ruim' : ''}">${ic('relogio')} Ainda não está pronto</span>`;
  };
  const entrada = e => {
    const it = e.it, s = st(it.id), pf = PERFIL[it.perfil];
    const pub = e.tipo === 'publicar' ? publicaDe(it) : null;
    const quem = pub || it.resp;
    const destaque = e.tipo === 'publicar' && pub ? pub === eu : meu(it);
    return `<button class="ag ${destaque ? 'meu' : ''} ${FEITO.has(s.status) && e.tipo === 'prazo' ? 'feito' : ''}" data-acao="abrir" data-id="${it.id}" style="${corPerfil(pf)}">
      <span class="ag-tipo ${e.tipo}">${ic(e.tipo === 'prazo' ? 'bandeira' : 'megafone')}</span>
      <span class="ag-txt">
        <small>${e.tipo === 'prazo' ? 'Entrega' : 'Publicação' + (it.hora ? ', ' + esc(it.hora) : '')} · <span class="ag-pf"><i></i>${esc(pf.curto)}</span></small>
        <b>${esc(it.titulo)}</b>
        <span class="ag-linha">${avatar(quem, 'peq')}${pub ? 'Publica: ' : ''}${esc(PESSOA[quem].nome)}${s.travado ? ` · <span class="t-alerta">${ic('alerta')} travado</span>` : ''}</span>
      </span>
      <span class="ag-dir">${e.tipo === 'publicar' ? situacaoPub(it) : chipStatus(s.status)}</span>
    </button>`;
  };
  return `<div class="pagina">
    <header class="cab-tela"><div><p class="sobre">${nomeMes(ui.mes)}</p><h1>Agenda</h1><p class="sub">Próximos 7 dias: ${plural(daSemana.filter(e => e.tipo === 'prazo').length, 'entrega', 'entregas')} e ${plural(daSemana.filter(e => e.tipo === 'publicar').length, 'publicação', 'publicações')}.</p></div><div class="cab-dir">${seletorMes()}</div></header>
    ${filtrosHTML()}
    <div class="legenda-ag"><span>${ic('bandeira')} Entrega = prazo para ficar pronto</span><span>${ic('megafone')} Publicação = dia de sair nas redes</span></div>
    ${atrasadas.length ? `<section class="dia dia-atrasado"><div class="dia-data"><b>${ic('alerta')}</b><span>Atrasadas</span></div><div class="dia-lista">${atrasadas.map(it => entrada({ tipo: 'prazo', it, data: it.prazo })).join('')}</div></section>` : ''}
    ${dias.length ? dias.map(d => {
      const dt = lerData(d.data), n = diasAte(d.data);
      return `<section class="dia ${n === 0 ? 'hoje' : ''} ${n < 0 ? 'passou' : ''}">
        <div class="dia-data"><b>${dt.getDate()}</b><span>${n === 0 ? 'Hoje' : n === 1 ? 'Amanhã' : cap(DIAS_C[dt.getDay()]) + ' · ' + MESES_C[dt.getMonth()]}</span></div>
        <div class="dia-lista">${d.ent.map(entrada).join('')}</div>
      </section>`;
    }).join('') : `<div class="vazio">${ic('agenda')}<p>Nada marcado daqui para frente com estes filtros.</p></div>`}
    <button class="btn btn-ghost centro" data-acao="passado">${ui.passado ? 'Esconder os dias que já passaram' : 'Mostrar também os dias que já passaram'}</button>
  </div>`;
}

/* ============================== render ============================== */
let renderPendente = false;
function pedirRender() { if (arr.ativo) { renderPendente = true; return; } render(); }

function render() {
  renderTopo();
  const tela = $('#tela');
  const rol = $('.quadro-rolagem');
  const sx = rol ? rol.scrollLeft : null;
  const cal = $('.cal-rolagem');
  const cx = cal ? cal.scrollLeft : null;
  const telas = { inicio: telaInicio, semana: telaSemana, quadro: telaQuadro, lancamentos: telaLancamentos, agenda: telaAgenda };
  tela.innerHTML = eu ? telas[ui.aba]() : '';
  const rol2 = $('.quadro-rolagem');
  if (rol2 && sx != null) rol2.scrollLeft = sx;
  const cal2 = $('.cal-rolagem');
  if (cal2 && cx != null) cal2.scrollLeft = cx;
  if (rol2) marcarColunaVisivel();
  $$('[data-acao="aba"]').forEach(b => { const at = b.dataset.v === ui.aba; b.classList.toggle('ativa', at); b.setAttribute('aria-current', at ? 'page' : 'false'); });
  if (folha) renderFolha();
  if (tour) requestAnimationFrame(() => posicionarTour(false));
}

function renderTopo() {
  const p = PESSOA[eu];
  const btn = $('#eu-btn');
  btn.innerHTML = p ? `${avatar(eu)}<span class="eu-nome">${esc(p.nome)}</span>` : ic('usuario');
  renderSync();
}

function renderSync() {
  const b = $('#sync-btn'); if (!b) return;
  const map = {
    local: ['local', 'Só neste aparelho'],
    carregando: ['ocupado', 'Sincronizando…'],
    enviando: ['ocupado', 'Salvando…'],
    ok: ['ok', 'Sincronizado'],
    offline: ['erro', 'Sem internet'],
    erro: ['erro', 'Não sincronizou'],
  };
  const [cls, txt] = map[sync.estado] || map.local;
  b.className = 'sync-btn ' + cls;
  b.innerHTML = `<i></i><span>${txt}${fila.length && sync.estado !== 'enviando' ? ` (${fila.length})` : ''}</span>`;
  b.title = textoSyncPuro();
}

function textoSyncPuro() {
  if (!ENDPOINT) return 'A sincronização ainda não foi ligada: o que você marca fica salvo só neste aparelho.';
  if (sync.estado === 'offline') return `Sem internet. ${plural(fila.length, 'mudança guardada', 'mudanças guardadas')} no aparelho; o app envia sozinho quando a conexão voltar.`;
  if (sync.estado === 'erro') return `Não foi possível falar com a planilha da equipe. ${fila.length ? plural(fila.length, 'mudança guardada', 'mudanças guardadas') + ' no aparelho; o app tenta de novo sozinho.' : 'O app tenta de novo sozinho.'}`;
  return ultimoSync ? 'Tudo sincronizado com a equipe. Última atualização: ' + fmtQuando(ultimoSync) + '.' : 'Sincronizando com a equipe…';
}

function irAba(aba) {
  if (!ABAS.includes(aba)) aba = 'inicio';
  const mudouAba = ui.aba !== aba;
  ui.aba = aba;
  if (aba !== 'lancamentos') ui.projeto = null;
  try { history.replaceState(history.state, '', '#' + aba); } catch (e) { /* ok */ }
  render();
  if (mudouAba && !tour) window.scrollTo(0, 0);
}

/* =========================== folha (painel) =========================== */
let folha = null;

function abrirFolha(f) {
  const jaAberta = !!folha;
  folha = f;
  renderFolha(true);
  if (!jaAberta) {
    try { history.pushState({ folha: 1 }, '', location.hash || '#' + ui.aba); } catch (e) { /* ok */ }
    document.body.classList.add('travar');
    requestAnimationFrame(() => $('#folha-raiz').classList.add('aberta'));
  }
}
function fecharFolha() {
  if (!folha) return;
  if (history.state && history.state.folha) history.back();
  else esconderFolha();
}
function esconderFolha() {
  if (!folha) return;
  const ativo = document.activeElement;
  if (ativo && ativo.blur && $('#folha-raiz').contains(ativo)) ativo.blur();
  folha = null;
  document.body.classList.remove('travar');
  const raiz = $('#folha-raiz');
  raiz.classList.remove('aberta');
  setTimeout(() => { if (!folha) raiz.innerHTML = ''; }, 300);
}
function renderFolha(forcar) {
  const raiz = $('#folha-raiz');
  if (!folha) return;
  const corpo = $('.folha-corpo', raiz);
  const foco = document.activeElement;
  if (!forcar && folha.tipo === 'nova') return;
  if (!forcar && corpo && foco && corpo.contains(foco) && /INPUT|TEXTAREA|SELECT/.test(foco.tagName)) return;
  const topo = corpo && !forcar ? corpo.scrollTop : 0;
  const conteudo = folha.tipo === 'item' ? folhaItem(folha.id) : folha.tipo === 'nova' ? folhaNova(folha.projeto) : folhaMenu();
  const pf = folha.tipo === 'item' && ITEM[folha.id] ? corPerfil(PERFIL[ITEM[folha.id].perfil]) : '';
  if (!$('.folha', raiz)) {
    raiz.innerHTML = `<div class="folha-fundo" data-acao="fechar-folha"></div>
      <section class="folha" role="dialog" aria-modal="true" aria-label="Detalhes">
        <div class="folha-cab"><span class="pega"></span><button class="btn-ic folha-x" data-acao="fechar-folha" aria-label="Fechar">${ic('x')}</button></div>
        <div class="folha-corpo"></div>
      </section>`;
  }
  $('.folha', raiz).setAttribute('style', pf);
  const c = $('.folha-corpo', raiz);
  c.innerHTML = conteudo;
  c.scrollTop = topo;
}

function folhaItem(id) {
  const it = ITEM[id];
  if (!it) return '<p>Entrega não encontrada.</p>';
  const s = st(id), proj = PROJ[it.projeto], cat = CATEG[it.categoria];
  const [nf, nt] = contaPassos(it);
  const at = atrasado(it), fe = FEITO.has(s.status);
  const deps = it.depende.map(d => ITEM[d]).filter(Boolean);
  const libera = ITENS.filter(x => x.depende.includes(id));
  const resp = PESSOA[it.resp] || { nome: it.resp };
  return `
    <div class="it-chips">${pfChip(it.perfil)}${cat ? `<span class="chip-neutro" title="${esc(cat.explica)}">${esc(cat.nome)}</span>` : ''}${it.formato ? `<span class="chip-neutro">${esc(it.formato)}</span>` : ''}</div>
    <h2 class="it-titulo">${esc(it.titulo)}</h2>
    <p class="it-proj">${esc(proj.nome)}${it.fase ? ' · ' + esc(it.fase) : ''}</p>
    ${it.descricao ? `<p class="it-desc">${esc(it.descricao)}</p>` : ''}
    ${s.travado ? `<div class="trava-alerta">${ic('alerta')}<div><b>Travado</b><p>${esc(s.motivo || 'Sem motivo informado')}</p></div><button class="btn btn-sec" data-acao="destravar" data-id="${id}">Já resolveu: destravar</button></div>` : ''}
    <div class="it-meta">
      <div class="meta"><small>Responsável</small><span>${avatar(it.resp, 'peq')}${esc(resp.nome)}${it.resp === eu ? ' (você)' : ''}</span></div>
      ${publicaDe(it) ? `<div class="meta"><small>Quem publica</small><span>${avatar(publicaDe(it), 'peq')}${esc(PESSOA[publicaDe(it)].nome)}${publicaDe(it) === eu ? ' (você)' : ''}</span></div>` : ''}
      ${it.prazo ? `<div class="meta ${at ? 'ruim' : ''}"><small>Prazo para ficar pronto</small><span>${cap(fmtCurta(it.prazo))} · ${at ? 'atrasado' : fmtFalta(it.prazo)}</span></div>` : ''}
      ${it.publicar ? `<div class="meta"><small>Dia de publicar</small><span>${cap(fmtCurta(it.publicar))}${it.hora ? ', ' + esc(it.hora) : ''} · ${fmtFalta(it.publicar)}</span></div>` : ''}
    </div>

    <section class="it-sec">
      ${faltaProgramar(it) && publicaDe(it) === eu ? `<div class="sua-vez">${ic('agendado')}<p><b>Sua vez: programar a publicação</b> para ${fmtCurta(it.publicar)}${it.hora ? ', ' + esc(it.hora) : ''}. Depois de agendar, mude a etapa para <b>Programado</b>.</p></div>` : ''}
      <h3>Em que etapa está?</h3>
      <div class="st-opcoes">${STATUS.map(x => `<button class="st-op ${x.id === s.status ? 'ativo' : ''}" data-acao="status" data-id="${id}" data-v="${x.id}" style="--st:${x.cor}" aria-pressed="${x.id === s.status}">${ic(x.ic)}<span>${x.nome}</span></button>`).join('')}</div>
      <p class="dica">${ST[s.status].dica}</p>
    </section>

    ${nt ? `<section class="it-sec">
      <h3>Passo a passo <span class="cont">${nf} de ${nt}</span></h3>
      <ol class="passos">${it.passos.map((ps, i) => {
        const f = s.passos.includes(i);
        return `<li><button class="passo ${f ? 'feito' : ''}" data-acao="passo" data-id="${id}" data-i="${i}" aria-pressed="${f}">
          <span class="caixa">${ic('check')}</span><span class="passo-txt">${esc(ps.t)}</span>${ps.r && ps.r !== it.resp ? `<span class="passo-quem">${avatar(ps.r, 'peq')}${esc(PESSOA[ps.r] ? PESSOA[ps.r].nome : ps.r)}</span>` : ''}
        </button></li>`;
      }).join('')}</ol>
    </section>` : ''}

    <section class="it-sec">
      <h3>Link do Drive</h3>
      ${s.link ? `<a class="btn btn-drive" href="${esc(s.link)}" target="_blank" rel="noopener">${ic('externo')} Abrir no Drive</a>` : `<p class="dica">${fe ? 'Está pronto, mas falta o link. Cole abaixo onde está o arquivo final.' : 'Quando ficar pronto, cole aqui o link da pasta ou do arquivo final.'}</p>`}
      <div class="campo-linha">
        <input type="url" inputmode="url" autocomplete="off" id="campo-link" placeholder="https://drive.google.com/..." value="${esc(s.link)}" data-campo="link" data-id="${id}" aria-label="Link do Drive">
        <button class="btn btn-sec" data-acao="salvar-link" data-id="${id}">${s.link ? 'Trocar' : 'Salvar link'}</button>
      </div>
    </section>

    ${!s.travado && !fe ? `<section class="it-sec trava-sec">
      <h3>Algo está travando?</h3>
      <p class="dica">Escolha o motivo. A equipe toda vê na tela de início.</p>
      <div class="motivos">${MOTIVOS.map(m => `<button class="chip" data-acao="travar" data-id="${id}" data-v="${esc(m)}">${esc(m)}</button>`).join('')}</div>
      <div class="campo-linha">
        <input type="text" id="campo-motivo" placeholder="Ou escreva outro motivo" aria-label="Outro motivo">
        <button class="btn btn-trava" data-acao="travar" data-id="${id}">Marcar como travado</button>
      </div>
    </section>` : ''}

    ${deps.length ? `<section class="it-sec"><h3>Precisa que fique pronto antes</h3><div class="lista-mini">${deps.map(d => linhaMini(d)).join('')}</div></section>` : ''}
    ${libera.length ? `<section class="it-sec"><h3>Quando ficar pronto, libera</h3><div class="lista-mini">${libera.map(d => linhaMini(d)).join('')}</div></section>` : ''}

    <section class="it-sec">
      <h3>Observações</h3>
      <textarea data-campo="nota" data-id="${id}" rows="3" placeholder="Algum recado para a equipe sobre esta entrega?" aria-label="Observações">${esc(s.nota)}</textarea>
      <p class="dica">Salva sozinho quando você sai do campo.</p>
    </section>
    <p class="it-rodape">${s.atualizado ? `Última mudança: ${esc(PESSOA[s.por] ? PESSOA[s.por].nome : s.por)}, ${fmtQuando(s.atualizado)}.` : 'Ninguém mexeu nesta entrega ainda.'}</p>
    ${it.extra && podeAdicionar() ? `<button class="btn btn-ghost btn-apagar" data-acao="apagar-extra" data-id="${id}">Apagar esta entrega</button>` : ''}`;
}

function folhaNova(pid) {
  const projs = PROJETOS.filter(p => p.mes === ui.mes);
  const sel = BASE_PROJ[pid] ? pid : (projs[0] && projs[0].id);
  const pf = sel ? BASE_PROJ[sel].perfil : D.perfis[0].id;
  const ok = suportaExtras();
  return `
    <h2 class="it-titulo">Nova entrega</h2>
    <p class="it-proj">Para o que surgir fora do planejamento. Aparece para toda a equipe.</p>
    ${ok ? '' : `<div class="aviso aviso-exemplo" style="margin-top:14px">${ic('alerta')}<p><b>Falta um passo para liberar.</b> Atualize o código da planilha no Apps Script (passo a passo no README do app). Depois disso, as entregas novas aparecem para todo mundo.</p></div>`}
    <form id="form-nova" class="form" autocomplete="off">
      <label class="campo"><span>O que precisa ser feito?</span><input type="text" name="titulo" required maxlength="120" placeholder="Ex.: Carrossel com dicas para a prova"></label>
      <label class="campo"><span>Faz parte de</span><select name="projeto">${projs.map(p => `<option value="${p.id}" ${p.id === sel ? 'selected' : ''}>${esc(p.nome)}</option>`).join('')}</select></label>
      <div class="campos-2">
        <label class="campo"><span>Perfil</span><select name="perfil">${D.perfis.map(x => `<option value="${x.id}" ${x.id === pf ? 'selected' : ''}>${esc(x.nome)}</option>`).join('')}</select></label>
        <label class="campo"><span>Quem faz</span><select name="resp">${D.equipe.map(x => `<option value="${x.id}" ${x.id === eu ? 'selected' : ''}>${esc(x.nome)}</option>`).join('')}</select></label>
      </div>
      <div class="campos-2">
        <label class="campo"><span>Tipo</span><select name="categoria">${D.categorias.map(c => `<option value="${c.id}" ${c.id === 'comercial' ? 'selected' : ''}>${esc(c.nome)}</option>`).join('')}</select></label>
        <label class="campo"><span>Formato</span><input type="text" name="formato" list="lista-formatos" maxlength="30" placeholder="Carrossel, Reels…"></label>
      </div>
      <datalist id="lista-formatos">${['Carrossel', 'Criativo', 'Stories', 'Reels', 'Vídeo', 'Arte', 'Texto', 'Página', 'Roteiro', 'Live'].map(f => `<option value="${f}"></option>`).join('')}</datalist>
      <div class="campos-2">
        <label class="campo"><span>Pronto até</span><input type="date" name="prazo" required></label>
        <label class="campo"><span>Publicar em (opcional)</span><input type="date" name="publicar"></label>
      </div>
      <label class="campo"><span>Horário de publicar (opcional)</span><input type="text" name="hora" maxlength="10" placeholder="Ex.: 17h"></label>
      <label class="campo"><span>Passo a passo (um por linha, opcional)</span><textarea name="passos" rows="4" placeholder="Criar a arte&#10;Revisão do Yuri&#10;Subir no Drive"></textarea></label>
      <label class="campo"><span>Detalhes (opcional)</span><textarea name="descricao" rows="2"></textarea></label>
      <button type="submit" class="btn btn-pri btn-grande" ${ok ? '' : 'disabled'}>${ic('check')} Criar entrega</button>
    </form>`;
}

function folhaMenu() {
  const me = PESSOA[eu];
  return `
    <div class="menu-eu">${avatar(eu, 'grande')}<div><small>Você está usando como</small><b>${esc(me.nome)}</b><span>${esc(me.funcao)}</span></div></div>
    <div class="menu-lista">
      <button class="menu-it" data-acao="trocar-pessoa">${ic('usuario')}<span><b>Trocar de pessoa</b><small>Se este aparelho for de outra pessoa da equipe</small></span>${ic('seta')}</button>
      <button class="menu-it" data-acao="tutorial">${ic('ajuda')}<span><b>Ver o tutorial de novo</b><small>Onde clicar em cada coisa</small></span>${ic('seta')}</button>
      ${STANDALONE ? '' : `<button class="menu-it" data-acao="instalar">${ic('celular')}<span><b>Como instalar no celular</b><small>Passo a passo para iPhone e Android</small></span>${ic('seta')}</button>`}
      ${promptInstalar && !STANDALONE ? `<button class="menu-it" data-acao="instalar-agora">${ic('baixar')}<span><b>Instalar neste ${MOBILE ? 'celular' : 'computador'}</b><small>Abre como um app, fora do navegador</small></span>${ic('seta')}</button>` : ''}
    </div>
    <section class="it-sec">
      <h3>Sincronização com a equipe</h3>
      <p class="dica">${esc(textoSyncPuro())}</p>
      ${ENDPOINT ? `<button class="btn btn-sec" data-acao="sincronizar">${ic('sync')} Sincronizar agora</button>` : ''}
    </section>
    <section class="it-sec">
      <h3>Quem faz o quê</h3>
      <div class="processo">${(D.processo || []).filter(p => PESSOA[p.quem]).map(p => `<div class="pp ${p.quem === eu ? 'eu' : ''}">
        ${avatar(p.quem)}<div><b>${esc(PESSOA[p.quem].nome)}${p.quem === eu ? ' (você)' : ''}</b><ul>${p.faz.map(f => `<li>${esc(f)}</li>`).join('')}</ul></div>
      </div>`).join('')}</div>
    </section>
    <section class="it-sec">
      <h3>O que cada cor quer dizer</h3>
      <div class="legenda">
        <p class="leg-tit">Perfis</p>
        ${D.perfis.map(p => `<div class="leg">${pfChip(p.id)}</div>`).join('')}
        <p class="leg-tit">Etapas</p>
        ${STATUS.map(s => `<div class="leg">${chipStatus(s.id)}<small>${s.dica}</small></div>`).join('')}
        <div class="leg"><span class="st-chip" style="--st:var(--trava)">${ic('alerta')}Travado</span><small>Parado por algum motivo. Diz qual.</small></div>
        <p class="leg-tit">Tipos de conteúdo</p>
        ${D.categorias.map(c => `<div class="leg"><span class="chip-neutro">${esc(c.nome)}</span><small>${esc(c.explica)}</small></div>`).join('')}
      </div>
    </section>
    <p class="it-rodape">Talks Marketing · versão ${VERSAO}</p>`;
}

/* ========================= modal e avisos ========================= */
function pedirLink(id) {
  const it = ITEM[id];
  $('#modal-raiz').innerHTML = `<div class="modal-fundo" data-acao="modal-fechar"></div>
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-tit">
      <span class="modal-ic">${ic('check')}</span>
      <h3 id="modal-tit">Ficou pronto! Qual é o link do Drive?</h3>
      <p>Cole o link da pasta ou do arquivo final de <b>${esc(it.titulo)}</b>. Assim todo mundo encontra.</p>
      <input type="url" inputmode="url" autocomplete="off" id="modal-link" placeholder="https://drive.google.com/..." aria-label="Link do Drive">
      <div class="modal-acoes">
        <button class="btn btn-ghost" data-acao="modal-fechar">Colocar depois</button>
        <button class="btn btn-pri" data-acao="modal-link" data-id="${id}">Salvar link</button>
      </div>
    </div>`;
  document.body.classList.add('com-modal');
  if (!TOQUE) setTimeout(() => { const i = $('#modal-link'); if (i) i.focus(); }, 60);
}
function fecharModal() { $('#modal-raiz').innerHTML = ''; document.body.classList.remove('com-modal'); }

const acoesToast = {};
let idToast = 0;
function toast(html, acao) {
  const caixa = $('#toasts');
  const t = document.createElement('div');
  t.className = 'toast';
  const n = ++idToast;
  if (acao) acoesToast[n] = acao.fn;
  t.innerHTML = `<span>${html}</span>${acao ? `<button data-acao="toast" data-v="${n}">${esc(acao.texto)}</button>` : ''}`;
  caixa.appendChild(t);
  while (caixa.children.length > 2) caixa.firstElementChild.remove();
  requestAnimationFrame(() => t.classList.add('on'));
  setTimeout(() => { t.classList.remove('on'); setTimeout(() => { t.remove(); delete acoesToast[n]; }, 300); }, acao ? 6000 : 3200);
}

/* ============================= arrastar ============================= */
const arr = { ativo: false, card: null, id: null, fantasma: null, x0: 0, y0: 0, x: 0, y: 0, dx: 0, dy: 0, alvo: null, timer: 0, tipo: '', raf: 0 };
let ignorarClique = false;

function prepararArrasto(card, x, y, tipo) {
  if (arr.ativo) return;
  clearTimeout(arr.timer);
  arr.card = card; arr.id = card.dataset.id; arr.x0 = arr.x = x; arr.y0 = arr.y = y; arr.tipo = tipo; arr.ativo = false;
  if (tipo === 'toque') arr.timer = setTimeout(() => { if (arr.tipo === 'toque' && arr.card === card && arr.tocando) iniciarArrasto(); }, 380);
}
function iniciarArrasto() {
  if (!arr.card || arr.ativo || !arr.card.isConnected) return;
  const r = arr.card.getBoundingClientRect();
  arr.dx = arr.x0 - r.left; arr.dy = arr.y0 - r.top;
  const f = arr.card.cloneNode(true);
  f.classList.add('fantasma');
  f.removeAttribute('data-tour');
  f.style.width = r.width + 'px';
  document.body.appendChild(f);
  arr.fantasma = f;
  arr.ativo = true;
  arr.card.classList.add('levantado');
  document.body.classList.add('arrastando');
  if (arr.card.classList.contains('post')) document.body.classList.add('arrastando-post');
  if (navigator.vibrate) { try { navigator.vibrate(12); } catch (e) { /* ok */ } }
  moverArrasto(arr.x, arr.y);
  arr.raf = requestAnimationFrame(autoRolar);
}
function moverArrasto(x, y) {
  arr.x = x; arr.y = y;
  if (!arr.ativo) return;
  arr.fantasma.style.transform = `translate(${x - arr.dx}px, ${y - arr.dy}px) rotate(2deg) scale(1.03)`;
  const el = document.elementFromPoint(x, y);
  const alvo = el ? el.closest('[data-drop], [data-dia]') : null;
  if (alvo !== arr.alvo) {
    if (arr.alvo) arr.alvo.classList.remove('sobre-alvo');
    if (alvo) alvo.classList.add('sobre-alvo');
    arr.alvo = alvo;
  }
}
function autoRolar() {
  if (!arr.ativo) return;
  const rol = $('.quadro-rolagem') || $('.cal-rolagem');
  const doca = $('#doca');
  const comDoca = doca && doca.offsetParent && !document.body.classList.contains('arrastando-post');
  const dockTopo = comDoca ? Math.min(doca.getBoundingClientRect().top, innerHeight) : innerHeight;
  if (rol && rol.scrollWidth > rol.clientWidth && arr.y < dockTopo - 10) {
    const r = rol.getBoundingClientRect();
    if (arr.x < r.left + 36) rol.scrollLeft -= 10;
    else if (arr.x > r.right - 36) rol.scrollLeft += 10;
  }
  const topo = $('.topo').getBoundingClientRect().bottom;
  if (arr.y < topo + 40) window.scrollBy(0, -12);
  else if (arr.y > dockTopo - 40 && arr.y < dockTopo) window.scrollBy(0, 12);
  moverArrasto(arr.x, arr.y);
  arr.raf = requestAnimationFrame(autoRolar);
}
function soltarArrasto() {
  clearTimeout(arr.timer);
  const eraAtivo = arr.ativo;
  const alvo = arr.alvo, id = arr.id;
  cancelAnimationFrame(arr.raf);
  if (arr.fantasma) arr.fantasma.remove();
  if (arr.card) arr.card.classList.remove('levantado');
  if (alvo) alvo.classList.remove('sobre-alvo');
  document.body.classList.remove('arrastando', 'arrastando-post');
  Object.assign(arr, { ativo: false, card: null, id: null, fantasma: null, alvo: null, tipo: '' });
  if (eraAtivo) {
    ignorarClique = true; setTimeout(() => { ignorarClique = false; }, 120);
    if (alvo && id && alvo.dataset.drop) mudarStatus(id, alvo.dataset.drop);
    else if (alvo && id && alvo.dataset.dia) moverPost(id, alvo.dataset.dia, alvo.dataset.perfil);
    if (renderPendente) { renderPendente = false; render(); }
  }
  return eraAtivo;
}

let ultimoToque = 0;
document.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'mouse' || e.button !== 0) return;
  if (Date.now() - ultimoToque < 900) return; // mouse "de mentira" gerado pelo toque
  const card = e.target.closest('[data-arrastar]');
  if (!card || tour) return;
  prepararArrasto(card, e.clientX, e.clientY, 'mouse');
});
document.addEventListener('pointermove', e => {
  if (arr.tipo !== 'mouse' || !arr.card) return;
  if (!arr.ativo && Math.hypot(e.clientX - arr.x0, e.clientY - arr.y0) > 6) { arr.x = e.clientX; arr.y = e.clientY; iniciarArrasto(); }
  if (arr.ativo) { e.preventDefault(); moverArrasto(e.clientX, e.clientY); }
});
document.addEventListener('pointerup', () => { if (arr.tipo === 'mouse') soltarArrasto(); });
window.addEventListener('blur', () => { if (arr.ativo) soltarArrasto(); });
document.addEventListener('touchstart', e => {
  ultimoToque = Date.now();
  arr.tocando = true;
  if (e.touches.length !== 1 || tour) return;
  const card = e.target.closest('[data-arrastar]');
  if (!card) return;
  const t = e.touches[0];
  prepararArrasto(card, t.clientX, t.clientY, 'toque');
}, { passive: true });
document.addEventListener('touchmove', e => {
  if (arr.tipo !== 'toque' || !arr.card) return;
  const t = e.touches[0];
  if (arr.ativo) { e.preventDefault(); moverArrasto(t.clientX, t.clientY); return; }
  if (Math.hypot(t.clientX - arr.x0, t.clientY - arr.y0) > 10) { clearTimeout(arr.timer); Object.assign(arr, { card: null, tipo: '' }); }
}, { passive: false });
document.addEventListener('touchend', e => {
  ultimoToque = Date.now();
  if (e.touches.length) return;
  arr.tocando = false;
  if (arr.tipo === 'toque') { if (soltarArrasto()) e.preventDefault(); }
}, { passive: false });
document.addEventListener('touchcancel', () => { arr.tocando = false; if (arr.tipo === 'toque') soltarArrasto(); });
document.addEventListener('contextmenu', e => { if (e.target.closest('[data-arrastar]') && TOQUE) e.preventDefault(); });

function marcarColunaVisivel() {
  const rol = $('.quadro-rolagem'); if (!rol) return;
  const cols = $$('.coluna', rol);
  if (!cols.length) return;
  const meio = rol.scrollLeft + rol.clientWidth / 2;
  let idx = 0;
  cols.forEach((c, i) => { if (c.offsetLeft <= meio) idx = i; });
  $$('.quadro-nav button').forEach((b, i) => b.classList.toggle('ativo', i === idx));
}

/* =========================== intro / instalar =========================== */
function marcaGrande() {
  return `<div class="marca-grande">${SIMBOLO}<span><b>talks</b>marketing</span></div>`;
}
function mostrarIntro(tela) { ui.intro = tela; renderIntro(); }
function renderIntro() {
  const raiz = $('#intro-raiz');
  if (!ui.intro) { raiz.innerHTML = ''; document.body.classList.remove('com-intro'); return; }
  document.body.classList.add('com-intro');
  const html = ui.intro === 'instalar' ? introInstalar() : ui.intro === 'abrir-icone' ? introAbrirIcone() : introQuem();
  raiz.innerHTML = `<div class="intro"><div class="intro-in">${html}</div></div>`;
  $('.intro', raiz).scrollTop = 0;
}
function fecharIntro() { ui.intro = null; renderIntro(); }

function introInstalar() {
  const plat = ui.plataforma;
  const passo = (n, titulo, texto, ilu) => `<li class="pi"><span class="pi-n">${n}</span><div class="pi-txt"><b>${titulo}</b>${texto ? `<p>${texto}</p>` : ''}</div>${ilu ? `<div class="pi-ilu">${ilu}</div>` : ''}</li>`;
  const icone = `<div class="ilu-icone"><img src="icons/icon-192.png" alt=""><span>Talks Mkt</span></div>`;
  const passosIphone = `<ol class="passos-inst">
    ${passo(1, 'Toque no botão Compartilhar', IOS_CHROME ? 'No Chrome do iPhone, ele fica no canto da barra de endereço, em cima.' : 'É o quadrado com a seta para cima, na barra do Safari. Se não aparecer, toque primeiro em <b>•••</b>.', `<div class="ilu-barra"><span>${ic('voltar')}</span><span>${ic('seta')}</span><span class="ilu-luz">${ic('compartilhar')}</span><span>${ic('livro')}</span><span>${ic('abas')}</span></div>`)}
    ${passo(2, 'Toque em “Adicionar à Tela de Início”', 'Se não estiver aparecendo, role a lista para baixo.', `<div class="ilu-menu"><div class="ilu-linha"><span>Adicionar aos Favoritos</span>${ic('estrela')}</div><div class="ilu-linha ilu-luz-linha"><span>Adicionar à Tela de Início</span>${ic('maisQuadrado')}</div></div>`)}
    ${passo(3, 'Toque em “Adicionar”', 'Fica no canto de cima, à direita. Se aparecer a opção “Abrir como App Web”, deixe ligada.', `<div class="ilu-topo"><span>Cancelar</span><b>Tela de Início</b><span class="ilu-luz-txt">Adicionar</span></div>`)}
    ${passo(4, 'Abra pelo ícone', 'Procure o ícone <b>Talks Mkt</b> na tela do celular e abra o app por ele.', icone)}
  </ol>`;
  const passosAndroid = `${promptInstalar ? `<button class="btn btn-pri btn-grande" data-acao="instalar-agora">${ic('baixar')} Instalar o app agora</button><p class="ou">ou, se preferir, pelo menu do Chrome:</p>` : ''}
  <ol class="passos-inst">
    ${passo(1, 'Toque nos três pontinhos', 'Ficam no canto de cima, à direita do Chrome.', `<div class="ilu-barra ilu-barra-topo"><span class="ilu-url">gtalksmkt.github.io</span><span class="ilu-luz">${ic('pontos')}</span></div>`)}
    ${passo(2, 'Toque em “Instalar app”', 'Em alguns celulares aparece “Adicionar à tela inicial”.', `<div class="ilu-menu"><div class="ilu-linha"><span>Nova guia</span>${ic('maisQuadrado')}</div><div class="ilu-linha ilu-luz-linha"><span>Instalar app</span>${ic('baixar')}</div></div>`)}
    ${passo(3, 'Confirme em “Instalar”', '', `<div class="ilu-dialogo"><b>Instalar app?</b><span>Talks Marketing</span><div><span>Cancelar</span><span class="ilu-luz-txt">Instalar</span></div></div>`)}
    ${passo(4, 'Abra pelo ícone', 'Procure o ícone <b>Talks Mkt</b> na tela do celular e abra o app por ele.', icone)}
  </ol>`;
  return `${marcaGrande()}
    <h1>Instale o app no seu celular</h1>
    <p class="intro-sub">Assim ele fica na tela inicial, como qualquer aplicativo. Leva menos de 1 minuto.</p>
    ${IN_APP ? `<div class="aviso aviso-exemplo">${ic('alerta')}<p>Parece que você abriu o link por dentro de outro app (Instagram, WhatsApp…). Para instalar, abra no <b>${plat === 'iphone' ? 'Safari' : 'Chrome'}</b>: toque em <b>•••</b> e escolha “Abrir no navegador”.</p></div>` : ''}
    <div class="seg" role="tablist" aria-label="Tipo de celular">
      <button role="tab" class="${plat === 'iphone' ? 'ativo' : ''}" aria-selected="${plat === 'iphone'}" data-acao="plataforma" data-v="iphone">iPhone</button>
      <button role="tab" class="${plat === 'android' ? 'ativo' : ''}" aria-selected="${plat === 'android'}" data-acao="plataforma" data-v="android">Android</button>
    </div>
    ${plat === 'iphone' ? passosIphone : passosAndroid}
    <div class="intro-acoes">
      <button class="btn btn-pri" data-acao="ja-instalei">${ic('check')} Já instalei</button>
      <button class="btn btn-ghost" data-acao="pular-instalar">Agora não, usar pelo navegador</button>
    </div>`;
}

function introAbrirIcone() {
  return `${marcaGrande()}
    <div class="abrir-icone"><img src="icons/icon-192.png" alt=""><span>Talks Mkt</span></div>
    <h1>Agora abra pelo ícone</h1>
    <p class="intro-sub">Procure o ícone <b>Talks Mkt</b> na tela do seu celular e abra o app por ele. Esta página do navegador pode ser fechada.</p>
    <div class="intro-acoes"><button class="btn btn-ghost" data-acao="pular-instalar">Continuar por aqui mesmo</button></div>`;
}

function introQuem() {
  return `${marcaGrande()}
    <h1>Quem é você?</h1>
    <p class="intro-sub">O app mostra primeiro o que é seu. O trabalho do resto da equipe continua aparecendo, só que com menos destaque.</p>
    <div class="quem-lista">${D.equipe.map(p => `<button class="quem ${p.id === eu ? 'ativo' : ''}" data-acao="escolher-pessoa" data-v="${p.id}" style="--cor:${p.cor}">
      ${avatar(p.id, 'enorme')}<span class="quem-txt"><b>${esc(p.nome)}</b><small>${esc(p.funcao)}</small></span>${ic('seta')}
    </button>`).join('')}</div>
    ${eu ? '<div class="intro-acoes"><button class="btn btn-ghost" data-acao="fechar-intro">Cancelar</button></div>' : ''}`;
}

function fluxoInicial() {
  if (MOBILE && !STANDALONE && !LS.get('instalacaoVista', false)) return mostrarIntro('instalar');
  if (!eu) return mostrarIntro('quem');
  fecharIntro();
  if (!LS.get('tutorialVisto', false)) setTimeout(iniciarTour, 350);
}

/* ============================= tutorial ============================= */
let tour = null;
function passosTour() {
  const nome = PESSOA[eu] ? PESSOA[eu].nome : '';
  return [
    { aba: 'inicio', titulo: `Oi, ${nome}!`, texto: 'Este é o app de produção do marketing do Grupo Talks. Em 1 minuto você vê onde tocar em cada coisa.' },
    { aba: 'inicio', alvo: '[data-tour="minhas"]', titulo: 'Seu dia', texto: 'Aqui fica o que você faz hoje, com horário. O resto do mês fica no Backlog, para pegar quando estiver livre.' },
    { aba: 'inicio', alvo: '[data-tour="minhas"] .card, [data-tour="minhas"] .vazio', titulo: 'Toque para abrir', texto: 'Cada entrega tem o passo a passo, o prazo, o link do Drive e a etapa em que está. Toque nela para abrir e marcar o que já fez.' },
    { aba: 'inicio', alvo: '[data-tour="travando"]', titulo: 'O que está travando', texto: 'Se algo está parado, abra a entrega e toque no motivo em “Algo está travando?”. Aparece aqui para a equipe toda.' },
    { aba: 'semana', alvo: '[data-tour="aba-semana"]', titulo: 'Semana', texto: 'O calendário de posts da semana, de segunda a sexta, separado por perfil.' },
    { aba: 'semana', alvo: '[data-tour="calendario"]', titulo: 'Arraste os posts', texto: (TOQUE ? 'Segure um post e arraste' : 'Arraste um post') + ' para outro dia ou perfil para organizar a semana. A cor mostra a etapa: cinza a fazer, amarelo em produção, lilás em aprovação, verde-água pronto e branco programado.' },
    { aba: 'quadro', alvo: '[data-tour="aba-quadro"]', titulo: 'Backlog', texto: 'Tudo o que ainda precisa ser feito no mês, separado por etapa. Quando estiver livre, pegue algo daqui.' },
    { aba: 'quadro', alvo: '[data-tour="card-quadro"]', titulo: 'Arraste para mudar a etapa', texto: 'A fazer → Em produção → Em aprovação → Pronto → Programado. ' + (TOQUE ? 'Segure o card por meio segundo e arraste: embaixo aparecem as etapas.' : 'Clique, segure e arraste o card até a coluna certa.') },
    { aba: 'quadro', alvo: '[data-status-col="pronto"]', titulo: 'Ficou pronto? Link do Drive', texto: 'Quando uma entrega vai para Pronto, o app pede o link do Drive onde está o arquivo. Assim todo mundo encontra.' },
    { aba: 'quadro', alvo: '[data-tour="filtros"]', titulo: 'Perfis e pessoas', texto: 'Vermelho é Emergency Talks, azul é Ped Talks, verde é Intensive Talks e branco é Grupo Talks. Dá para ver só um perfil ou só o que é de uma pessoa.' },
    { aba: 'lancamentos', alvo: '[data-tour="aba-lancamentos"]', titulo: 'Lançamentos', texto: 'O passo a passo completo de cada lançamento, quem faz o quê e quanto falta.' },
    { aba: 'inicio', alvo: '[data-tour="perfil"]', titulo: 'Seu perfil e ajuda', texto: 'Toque aqui para ver quem faz o quê na equipe, trocar de pessoa ou ver este tutorial de novo. O botão “?” também abre o tutorial.' },
  ];
}
function acharVisivel(sel) {
  return $$(sel).find(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; }) || null;
}
function iniciarTour() {
  if (!eu) return;
  if (folha) esconderFolha();
  fecharModal();
  tour = { i: 0, passos: passosTour() };
  document.body.classList.add('em-tour');
  $('#tour-raiz').innerHTML = `<div class="tour-veu"></div><div class="tour-buraco sem-alvo"></div>
    <div class="tour-balao" role="dialog" aria-modal="true" aria-live="polite">
      <div class="tb-topo"><span class="tb-n"></span><button class="tb-pular" data-acao="tour-fim">Pular tutorial</button></div>
      <h3 class="tb-tit"></h3><p class="tb-txt"></p>
      <div class="tb-acoes"><button class="btn btn-ghost" data-acao="tour-voltar">Voltar</button><button class="btn btn-pri" data-acao="tour-prox">Próximo</button></div>
    </div>`;
  mostrarPassoTour();
}
function mostrarPassoTour() {
  const p = tour.passos[tour.i];
  const mudouAba = p.aba && ui.aba !== p.aba;
  if (p.aba === 'lancamentos') ui.projeto = null;
  if (mudouAba || p.aba === 'lancamentos') irAba(p.aba);
  if (mudouAba) window.scrollTo(0, 0);
  const raiz = $('#tour-raiz');
  $('.tb-n', raiz).textContent = (tour.i + 1) + ' de ' + tour.passos.length;
  $('.tb-tit', raiz).textContent = p.titulo;
  $('.tb-txt', raiz).textContent = p.texto;
  $('[data-acao="tour-voltar"]', raiz).style.visibility = tour.i ? 'visible' : 'hidden';
  $('[data-acao="tour-prox"]', raiz).textContent = tour.i === tour.passos.length - 1 ? 'Começar a usar' : 'Próximo';
  const el = p.alvo ? acharVisivel(p.alvo) : null;
  if (el) rolarAte(el); else window.scrollTo(0, 0);
  requestAnimationFrame(() => requestAnimationFrame(() => posicionarTour(true)));
}
function rolarAte(el) {
  const rol = el.closest('.quadro-rolagem');
  if (rol && rol.scrollWidth > rol.clientWidth) {
    const col = el.classList.contains('quadro-rolagem') ? null : (el.closest('.coluna') || el);
    rol.scrollLeft = col ? col.offsetLeft - 16 : 0;
  }
  if (el.closest('.topo, .abas-baixo')) return;
  const r = el.getBoundingClientRect();
  const topoH = $('.topo').getBoundingClientRect().height;
  const ja = r.top >= topoH + 8 && r.bottom <= innerHeight - 220;
  if (ja) return;
  const alvo = r.height > innerHeight * 0.5 ? r.top - topoH - 12 : r.top - Math.max(topoH + 12, (innerHeight - r.height) / 2 - 90);
  window.scrollTo(0, Math.max(0, scrollY + alvo));
}
function posicionarTour() {
  if (!tour) return;
  const p = tour.passos[tour.i];
  const raiz = $('#tour-raiz');
  const buraco = $('.tour-buraco', raiz), balao = $('.tour-balao', raiz);
  if (!buraco || !balao) return;
  const el = p.alvo ? acharVisivel(p.alvo) : null;
  const vw = document.documentElement.clientWidth, vh = innerHeight;
  const bw = Math.min(360, vw - 32);
  balao.style.width = bw + 'px';
  const bh = balao.offsetHeight;
  if (!el) {
    buraco.classList.add('sem-alvo');
    buraco.style.cssText = `top:${vh / 2}px;left:${vw / 2}px;width:0;height:0`;
    balao.style.top = Math.max(16, (vh - bh) / 2) + 'px';
    balao.style.left = (vw - bw) / 2 + 'px';
    return;
  }
  buraco.classList.remove('sem-alvo');
  const r = el.getBoundingClientRect(), m = 6;
  const top = Math.max(r.top - m, 6);
  let bottom = Math.min(r.bottom + m, vh - 6);
  // alvo muito alto: corta o destaque para o balão caber embaixo sem cobrir
  if (vh - bottom < bh + 20 && top < bh + 20) bottom = Math.max(top + 80, vh - bh - 28);
  const left = Math.max(r.left - m, 4), right = Math.min(r.right + m, vw - 4);
  buraco.style.cssText = `top:${top}px;left:${left}px;width:${right - left}px;height:${Math.max(0, bottom - top)}px`;
  let bt;
  if (vh - bottom >= bh + 20) bt = bottom + 12;
  else if (top >= bh + 20) bt = top - bh - 12;
  else bt = vh - bh - 16;
  const bl = Math.min(Math.max(r.left + r.width / 2 - bw / 2, 16), vw - bw - 16);
  balao.style.top = Math.max(12, bt) + 'px';
  balao.style.left = bl + 'px';
}
function fimTour() {
  tour = null;
  LS.set('tutorialVisto', true);
  $('#tour-raiz').innerHTML = '';
  document.body.classList.remove('em-tour');
  irAba('inicio');
  window.scrollTo(0, 0);
  toast('Pronto! O tutorial fica no botão <b>?</b> se precisar.');
}

/* ============================== eventos ============================== */
function acao(nome, el, e) {
  const id = el.dataset.id, v = el.dataset.v;
  switch (nome) {
    case 'aba': irAba(v); break;
    case 'abrir': if (ITEM[id]) abrirFolha({ tipo: 'item', id }); break;
    case 'abrir-proj': ui.projeto = id; irAba('lancamentos'); window.scrollTo(0, 0); break;
    case 'fechar-proj': ui.projeto = null; render(); window.scrollTo(0, 0); break;
    case 'ir-lancamentos': ui.projeto = null; irAba('lancamentos'); break;
    case 'ver-meus': ui.pessoa = eu; irAba('quadro'); break;
    case 'fechar-folha': fecharFolha(); break;
    case 'menu': if (eu) abrirFolha({ tipo: 'menu' }); break;
    case 'sync': if (eu) abrirFolha({ tipo: 'menu' }); else toast(esc(textoSyncPuro())); break;
    case 'sincronizar': atualizarAgora(); toast('Sincronizando…'); break;
    case 'tutorial': iniciarTour(); break;
    case 'tour-prox': if (tour.i < tour.passos.length - 1) { tour.i++; mostrarPassoTour(); } else fimTour(); break;
    case 'tour-voltar': if (tour.i > 0) { tour.i--; mostrarPassoTour(); } break;
    case 'tour-fim': fimTour(); break;
    case 'status': mudarStatus(id, v); break;
    case 'passo': alternarPasso(id, Number(el.dataset.i)); break;
    case 'salvar-link': { const i = $('#campo-link'); if (i && !salvarLink(id, i.value)) toast(i.value.trim() ? 'Esse link já está salvo.' : 'Cole o link no campo primeiro.'); break; }
    case 'travar': {
      let motivo = v;
      if (!motivo) { const i = $('#campo-motivo'); motivo = i ? i.value.trim() : ''; if (!motivo) { toast('Escreva o motivo ou toque num dos botões acima.'); if (i) i.focus(); break; } }
      mudar(id, { travado: true, motivo }, 'marcou como travado: ' + motivo);
      toast('Marcado como travado. A equipe vai ver na tela de início.');
      break;
    }
    case 'destravar': mudar(id, { travado: false, motivo: '' }, 'destravou'); toast('Destravado.'); break;
    case 'filtro-perfil': ui.perfil = v; LS.set('filtroPerfil', v); render(); break;
    case 'filtro-pessoa': ui.pessoa = v; render(); break;
    case 'coluna': { const col = $(`.coluna[data-status-col="${v}"]`), rol = $('.quadro-rolagem'); if (col && rol) rol.scrollTo({ left: col.offsetLeft - 16, behavior: 'smooth' }); break; }
    case 'passado': ui.passado = !ui.passado; render(); break;
    case 'semana': ui.semana = v === '0' ? segundaDe(hojeISO()) : somar(ui.semana, Number(v) || 0); render(); break;
    case 'mes': if (v) { ui.mes = v; ui.projeto = null; render(); } break;
    case 'trocar-pessoa': if (folha) esconderFolha(); mostrarIntro('quem'); break;
    case 'escolher-pessoa': {
      const trocou = eu !== v;
      eu = v; LS.set('pessoa', v); ui.pessoa = 'todos';
      fecharIntro(); render();
      if (!LS.get('tutorialVisto', false)) setTimeout(iniciarTour, 300);
      else if (trocou) toast(`Agora você está como <b>${esc(PESSOA[v].nome)}</b>.`);
      break;
    }
    case 'fechar-intro': fecharIntro(); break;
    case 'instalar': if (folha) esconderFolha(); mostrarIntro('instalar'); break;
    case 'plataforma': ui.plataforma = v; renderIntro(); break;
    case 'ja-instalei': LS.set('instalacaoVista', true); mostrarIntro('abrir-icone'); break;
    case 'pular-instalar': LS.set('instalacaoVista', true); if (!eu) mostrarIntro('quem'); else { fecharIntro(); if (!LS.get('tutorialVisto', false)) setTimeout(iniciarTour, 300); } break;
    case 'instalar-agora':
      if (promptInstalar) { promptInstalar.prompt(); promptInstalar.userChoice.finally(() => { promptInstalar = null; if (ui.intro) renderIntro(); if (folha) renderFolha(true); }); }
      else toast('Use o menu do navegador para instalar.');
      break;
    case 'modal-fechar': fecharModal(); toast('Tudo bem. Dá para colar o link depois, abrindo a entrega.'); break;
    case 'modal-link': {
      const i = $('#modal-link'), val = i ? i.value.trim() : '';
      if (!val) { toast('Cole o link no campo ou toque em “Colocar depois”.'); if (i) i.focus(); break; }
      fecharModal(); salvarLink(id, val); break;
    }
    case 'toast': { const fn = acoesToast[v]; if (fn) fn(); const t = el.closest('.toast'); if (t) t.remove(); break; }
    case 'nova': if (podeAdicionar()) abrirFolha({ tipo: 'nova', projeto: id || ui.projeto || '' }); break;
    case 'apagar-extra': {
      const it = ITEM[id], d = estado[id] && estado[id].def;
      if (!it || !d) break;
      if (!window.confirm(`Apagar “${it.titulo}”? Ela some do app para toda a equipe.`)) break;
      fecharFolha();
      mudar(id, { def: Object.assign({}, d, { apagado: true }) }, 'apagou a entrega');
      toast('Entrega apagada.');
      break;
    }
    default: break;
  }
}

document.addEventListener('click', e => {
  if (ignorarClique) { e.preventDefault(); e.stopPropagation(); return; }
  const el = e.target.closest('[data-acao]');
  if (!el || el.disabled) return;
  if (el.tagName === 'A') return;
  acao(el.dataset.acao, el, e);
}, true);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (tour) return fimTour();
    if ($('#modal-raiz').innerHTML) return fecharModal();
    if (folha) return fecharFolha();
  }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[role="button"][data-acao]')) {
    e.preventDefault(); acao(e.target.dataset.acao, e.target, e);
  }
  if (e.key === 'Enter' && e.target.id === 'campo-link') { e.preventDefault(); salvarLink(e.target.dataset.id, e.target.value); }
  if (e.key === 'Enter' && e.target.id === 'modal-link') { e.preventDefault(); const b = $('[data-acao="modal-link"]'); if (b) acao('modal-link', b, e); }
  if (e.key === 'Enter' && e.target.id === 'campo-motivo') { e.preventDefault(); const b = $('.trava-sec .btn-trava'); if (b) acao('travar', b, e); }
});

document.addEventListener('submit', e => {
  if (!e.target || e.target.id !== 'form-nova') return;
  e.preventDefault();
  if (!podeAdicionar()) return;
  if (!suportaExtras()) { toast('Falta atualizar o código da planilha para liberar entregas novas.'); return; }
  const f = new FormData(e.target);
  const v = k => String(f.get(k) || '').trim();
  const def = {
    titulo: v('titulo'), projeto: v('projeto'), perfil: v('perfil'), resp: v('resp'), categoria: v('categoria'),
    formato: v('formato'), prazo: v('prazo'), publicar: v('publicar'), hora: v('hora'), descricao: v('descricao'),
    passos: v('passos').split(/\r?\n/).map(s => s.trim()).filter(Boolean).slice(0, 15),
    fase: 'Entregas novas', criadoPor: eu,
  };
  if (!def.titulo || !BASE_PROJ[def.projeto] || !def.prazo) { toast('Preencha o que precisa ser feito, o projeto e o prazo.'); return; }
  const id = 'extra.' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  estado[id] = normalizar({ def });
  montarItens();
  fecharFolha();
  mudar(id, { def, status: 'afazer' }, 'criou a entrega');
  toast(`Entrega criada: <b>${esc(def.titulo)}</b>`);
});

document.addEventListener('change', e => {
  if (e.target.name === 'projeto' && e.target.form && e.target.form.id === 'form-nova') {
    const p = BASE_PROJ[e.target.value];
    if (p) e.target.form.elements.perfil.value = p.perfil;
    return;
  }
  const c = e.target.dataset && e.target.dataset.campo;
  if (!c) return;
  if (c === 'destacar') { ui.destacar = e.target.checked; LS.set('destacar', ui.destacar); render(); }
  if (c === 'link') salvarLink(e.target.dataset.id, e.target.value);
  if (c === 'nota') {
    const id = e.target.dataset.id, val = e.target.value.trim();
    if (val !== st(id).nota) { mudar(id, { nota: val }, val ? 'escreveu uma observação' : 'apagou a observação'); toast('Observação salva.'); }
  }
});

window.addEventListener('popstate', () => { if (folha) esconderFolha(); });
window.addEventListener('hashchange', () => { const a = location.hash.slice(1); if (ABAS.includes(a) && a !== ui.aba) irAba(a); });
window.addEventListener('resize', () => { if (tour) posicionarTour(); marcarColunaVisivel(); });
window.addEventListener('scroll', () => { if (tour) posicionarTour(); }, { passive: true });
document.addEventListener('scroll', e => { if (e.target.classList && e.target.classList.contains('quadro-rolagem')) { marcarColunaVisivel(); if (tour) posicionarTour(); } }, true);

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  promptInstalar = e;
  if (ui.intro === 'instalar') renderIntro();
});
window.addEventListener('appinstalled', () => {
  promptInstalar = null;
  LS.set('instalacaoVista', true);
  if (ui.intro === 'instalar') mostrarIntro('abrir-icone');
});

/* =============================== início =============================== */
function montarCasca() {
  const abas = [['inicio', 'Hoje', 'inicio'], ['semana', 'Semana', 'agenda'], ['quadro', 'Backlog', 'quadro'], ['lancamentos', 'Lançamentos', 'foguete']];
  const botoes = abas.map(([v, nome, i]) => `<button class="aba-btn" data-acao="aba" data-v="${v}" data-tour="aba-${v}">${ic(i)}<span>${nome}</span></button>`).join('');
  $('#abas-topo').innerHTML = botoes;
  $('#abas-baixo').innerHTML = botoes;
  $('#marca').innerHTML = `${SIMBOLO}<span class="marca-txt"><b>talks</b>marketing</span>`;
  $('#ajuda-btn').innerHTML = ic('ajuda');
  $('#doca').innerHTML = `<p>${ic('mao')} Solte na etapa certa</p><div class="doca-alvos">${STATUS.map(s => `<div class="doca-alvo" data-drop="${s.id}" style="--st:${s.cor}">${ic(s.ic)}<span>${s.nome}</span></div>`).join('')}</div>`;
  if (STANDALONE) document.documentElement.classList.add('standalone');
  if (TOQUE) document.documentElement.classList.add('toque');
}

function iniciar() {
  montarCasca();
  render();
  fluxoInicial();
  if (ENDPOINT) {
    if (fila.length) enviar(); else puxar();
    setInterval(() => { if (document.visibilityState === 'visible') atualizarAgora(); }, INTERVALO);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') atualizarAgora(); });
    window.addEventListener('online', atualizarAgora);
    window.addEventListener('offline', () => { sync.estado = 'offline'; renderSync(); });
  }
  // atualiza "há x min" e o dia virando
  setInterval(() => { if (!folha && !tour && !arr.ativo && document.visibilityState === 'visible') render(); }, 60000);
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => { /* sem offline */ });
  }
}

iniciar();
})();
