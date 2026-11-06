/* =====================================================================
   TALKS MARKETING · o que a equipe precisa produzir
   ---------------------------------------------------------------------
   Este é o arquivo que muda todo mês. A equipe NÃO cadastra nada pelo
   app: Thiago, Manu e Yuri só mudam o status, colam o link do Drive,
   marcam o passo a passo e avisam quando algo está travado.

   Como cadastrar um mês novo:
   1. Em "projetos" (lá embaixo), adicione os lançamentos com
      lancamento({ ... }) e o conteúdo do mês com conteudo({ ... }).
   2. Cada lançamento já vem com as entregas padrão (MODELO_LANCAMENTO).
      Dá para tirar entregas (remover), mudar alguma (ajustes) ou
      acrescentar (extras).
   3. Não mude a "chave" de uma entrega depois que a equipe começou a
      usar: é por ela que o app guarda status e link.
   ===================================================================== */

/* ---------- Passos que se repetem ---------- */
const PASSOS_CARROSSEL_CONTEUDO = [
  { t: 'Receber o material do professor', r: 'yuri' },
  'Criar o carrossel',
  { t: 'Escrever a legenda', r: 'yuri' },
  { t: 'Revisão do professor', r: 'yuri' },
  'Exportar e subir no Drive',
];
const PASSOS_REELS_CONTEUDO = [
  { t: 'Receber o vídeo gravado pelo professor', r: 'yuri' },
  'Editar o vídeo',
  'Colocar legenda na tela',
  { t: 'Revisão do Yuri', r: 'yuri' },
  'Exportar 9:16 e subir no Drive',
];

/* ---------- Entregas padrão de todo lançamento ----------
   prazo e publicar = dias em relação à data do lançamento
   (-5 = cinco dias antes; 0 = no dia).
   resp = quem é o responsável principal. Um passo pode ter outra
   pessoa: { t: 'texto', r: 'yuri' }.                                  */
const MODELO_LANCAMENTO = [
  {
    chave: 'briefing', fase: 'Planejamento', titulo: 'Briefing e cronograma do lançamento',
    resp: 'yuri', formato: 'Planejamento', categoria: 'comercial', prazo: -18,
    passos: ['Reunir com a diretoria: oferta, preço e datas', 'Definir público e mensagem principal', 'Montar o cronograma de posts e vídeos', 'Dividir as tarefas com a equipe'],
  },
  {
    chave: 'identidade', fase: 'Planejamento', titulo: 'Identidade visual do lançamento',
    resp: 'thiago', formato: 'Arte', categoria: 'comercial', prazo: -14, depende: ['briefing'],
    passos: ['Separar referências', 'Criar a proposta de arte', { t: 'Aprovação do Yuri', r: 'yuri' }, 'Montar o kit: feed, stories e banner', 'Subir o kit no Drive'],
  },
  {
    chave: 'roteiros', fase: 'Planejamento', titulo: 'Roteiros dos vídeos',
    resp: 'yuri', formato: 'Roteiro', categoria: 'comercial', prazo: -13, depende: ['briefing'],
    passos: ['Roteiro do vídeo dos diretores', 'Roteiro dos reels de contagem regressiva', 'Aprovação da diretoria'],
  },
  {
    chave: 'gravacao', fase: 'Produção', titulo: 'Gravação com os diretores',
    resp: 'yuri', formato: 'Gravação', categoria: 'comercial', prazo: -10, depende: ['roteiros'],
    passos: ['Marcar o dia com os diretores', 'Separar local, luz e microfone', 'Gravar o vídeo e os reels', 'Subir o material bruto no Drive para a Manu'],
  },
  {
    chave: 'stories', fase: 'Produção', titulo: 'Stories de contagem regressiva',
    resp: 'thiago', formato: 'Stories', categoria: 'comercial', prazo: -7, publicar: -5, depende: ['identidade'],
    passos: ['Criar os stories: faltam 5, 3 e 1 dia e "é hoje"', { t: 'Revisão do Yuri', r: 'yuri' }, 'Exportar e subir no Drive'],
  },
  {
    chave: 'reels', fase: 'Produção', titulo: 'Reels de contagem regressiva (3)',
    resp: 'manu', formato: 'Reels', categoria: 'comercial', prazo: -6, publicar: -3, depende: ['gravacao'],
    passos: ['Editar os reels 1, 2 e 3', 'Colocar legenda na tela', { t: 'Revisão do Yuri', r: 'yuri' }, 'Exportar 9:16 e subir no Drive'],
  },
  {
    chave: 'video-diretores', fase: 'Produção', titulo: 'Vídeo dos diretores',
    resp: 'manu', formato: 'Vídeo', categoria: 'comercial', prazo: -5, publicar: 0, depende: ['gravacao'],
    passos: ['Separar os melhores trechos', 'Primeira versão da edição', 'Colocar legenda na tela', { t: 'Revisão do Yuri', r: 'yuri' }, 'Ajustes finais', 'Exportar 9:16 e 16:9', 'Subir no Drive'],
  },
  {
    chave: 'carrossel', fase: 'Produção', titulo: 'Carrossel de anúncio do lançamento',
    resp: 'thiago', formato: 'Carrossel', categoria: 'comercial', prazo: -5, publicar: 0, depende: ['identidade'],
    passos: [{ t: 'Texto dos cards', r: 'yuri' }, 'Diagramar o carrossel', { t: 'Revisão do Yuri', r: 'yuri' }, 'Exportar e subir no Drive'],
  },
  {
    chave: 'criativos', fase: 'Produção', titulo: 'Criativos estáticos para anúncios',
    resp: 'thiago', formato: 'Criativo', categoria: 'trafego', prazo: -4, depende: ['identidade'],
    passos: ['Criar 3 variações em 1:1 e 9:16', { t: 'Revisão do Yuri', r: 'yuri' }, 'Subir no Drive', { t: 'Enviar para quem cuida do tráfego', r: 'yuri' }],
  },
  {
    chave: 'cortes', fase: 'Produção', titulo: 'Cortes de vídeo para anúncios',
    resp: 'manu', formato: 'Vídeo', categoria: 'trafego', prazo: -3, depende: ['video-diretores'],
    passos: ['Escolher 3 trechos de 15 a 30 segundos', 'Editar com legenda na tela', 'Exportar 9:16 e 4:5', 'Subir no Drive'],
  },
  {
    chave: 'pagina', fase: 'Divulgação', titulo: 'Página de vendas do lançamento',
    resp: 'yuri', formato: 'Página', categoria: 'comercial', prazo: -3, depende: ['identidade'],
    passos: ['Texto da página', 'Montar o layout', 'Colocar o link do checkout', 'Testar no celular', 'Publicar'],
  },
  {
    chave: 'textos', fase: 'Divulgação', titulo: 'Legendas e textos de divulgação',
    resp: 'yuri', formato: 'Texto', categoria: 'comercial', prazo: -3, depende: ['briefing'],
    passos: ['Legendas dos posts e reels', 'Mensagens de WhatsApp', 'E-mail do lançamento'],
  },
];

/* ---------- Ajudantes (não precisa mexer) ---------- */
function somarDias(iso, n) {
  const [a, m, d] = iso.split('-').map(Number);
  const data = new Date(a, m - 1, d + n);
  return data.getFullYear() + '-' + String(data.getMonth() + 1).padStart(2, '0') + '-' + String(data.getDate()).padStart(2, '0');
}

/** Lançamento: já cria as entregas padrão a partir da data. */
function lancamento(o) {
  const remover = new Set(o.remover || []);
  const ajustes = o.ajustes || {};
  const itens = MODELO_LANCAMENTO
    .filter(m => !remover.has(m.chave))
    .map(m => {
      const it = Object.assign({}, m);
      it.prazo = somarDias(o.data, m.prazo);
      if (typeof m.publicar === 'number') it.publicar = somarDias(o.data, m.publicar);
      if (it.depende) it.depende = it.depende.filter(c => !remover.has(c));
      return Object.assign(it, ajustes[m.chave] || {});
    })
    .concat(o.extras || []);
  return { tipo: 'lancamento', ...o, itens };
}

/** Conteúdo do mês: entregas avulsas, com datas fixas. */
function conteudo(o) {
  return { tipo: 'conteudo', ...o, itens: (o.itens || []).map(it => ({ fase: 'Conteúdo do mês', ...it })) };
}

/* =====================================================================
   DADOS
   ===================================================================== */
window.TM_DADOS = {
  // true = mostra o aviso "lançamentos de exemplo". Mude para false
  // quando cadastrar os lançamentos reais.
  exemplo: true,

  equipe: [
    { id: 'thiago', nome: 'Thiago', funcao: 'Designer', cor: '#FACC15' },
    { id: 'manu',   nome: 'Manu',   funcao: 'Editora de vídeo', cor: '#E879F9' },
    { id: 'yuri',   nome: 'Yuri',   funcao: 'Designer, social media e produção', cor: '#FF8A4C' },
  ],

  perfis: [
    { id: 'emergency', nome: 'Emergency Talks', curto: 'emergency', cor: '#D31C2B', texto: '#F04452' },
    { id: 'ped',       nome: 'Ped Talks',       curto: 'ped',       cor: '#0074F2', texto: '#5AA6FF' },
    { id: 'intensive', nome: 'Intensive Talks', curto: 'intensive', cor: '#2EE96F', texto: '#2EE96F' },
  ],

  categorias: [
    { id: 'conteudo',  nome: 'Conteúdo',  explica: 'Matéria que os professores trazem para as redes' },
    { id: 'comercial', nome: 'Comercial', explica: 'Marketing de vendas e lançamentos' },
    { id: 'trafego',   nome: 'Tráfego',   explica: 'Peças para anúncios pagos' },
  ],

  projetos: [
    /* ---------- NOVEMBRO 2026 (EXEMPLO) ----------
       Os 3 lançamentos da última semana de novembro. Nomes e data são
       provisórios: o Yuri vai trocar pelos reais.                     */
    lancamento({
      id: 'emergency-lanc-nov26', mes: '2026-11', perfil: 'emergency',
      nome: 'Lançamento Emergency Talks', data: '2026-11-24', provisoria: true,
    }),
    lancamento({
      id: 'ped-lanc-nov26', mes: '2026-11', perfil: 'ped',
      nome: 'Lançamento Ped Talks', data: '2026-11-24', provisoria: true,
    }),
    lancamento({
      id: 'intensive-lanc-nov26', mes: '2026-11', perfil: 'intensive',
      nome: 'Lançamento Intensive Talks', data: '2026-11-24', provisoria: true,
    }),

    conteudo({
      id: 'emergency-cont-nov26', mes: '2026-11', perfil: 'emergency', nome: 'Conteúdo de novembro · Emergency',
      itens: [
        { chave: 'carrossel-1', titulo: 'Carrossel de conteúdo 1', descricao: 'Tema a definir com o professor.', resp: 'thiago', formato: 'Carrossel', categoria: 'conteudo', prazo: '2026-11-10', publicar: '2026-11-11', passos: PASSOS_CARROSSEL_CONTEUDO },
        { chave: 'reels-1', titulo: 'Reels de conteúdo com professor', descricao: 'Tema a definir com o professor.', resp: 'manu', formato: 'Reels', categoria: 'conteudo', prazo: '2026-11-13', publicar: '2026-11-14', passos: PASSOS_REELS_CONTEUDO },
        { chave: 'carrossel-2', titulo: 'Carrossel de conteúdo 2', descricao: 'Tema a definir com o professor.', resp: 'thiago', formato: 'Carrossel', categoria: 'conteudo', prazo: '2026-11-17', publicar: '2026-11-18', passos: PASSOS_CARROSSEL_CONTEUDO },
      ],
    }),
    conteudo({
      id: 'ped-cont-nov26', mes: '2026-11', perfil: 'ped', nome: 'Conteúdo de novembro · Ped',
      itens: [
        { chave: 'carrossel-1', titulo: 'Carrossel de conteúdo 1', descricao: 'Tema a definir com o professor.', resp: 'thiago', formato: 'Carrossel', categoria: 'conteudo', prazo: '2026-11-11', publicar: '2026-11-12', passos: PASSOS_CARROSSEL_CONTEUDO },
        { chave: 'reels-1', titulo: 'Reels de conteúdo com professor', descricao: 'Tema a definir com o professor.', resp: 'manu', formato: 'Reels', categoria: 'conteudo', prazo: '2026-11-14', publicar: '2026-11-15', passos: PASSOS_REELS_CONTEUDO },
        { chave: 'carrossel-2', titulo: 'Carrossel de conteúdo 2', descricao: 'Tema a definir com o professor.', resp: 'thiago', formato: 'Carrossel', categoria: 'conteudo', prazo: '2026-11-18', publicar: '2026-11-19', passos: PASSOS_CARROSSEL_CONTEUDO },
      ],
    }),
    conteudo({
      id: 'intensive-cont-nov26', mes: '2026-11', perfil: 'intensive', nome: 'Conteúdo de novembro · Intensive',
      itens: [
        { chave: 'carrossel-1', titulo: 'Carrossel de conteúdo 1', descricao: 'Tema a definir com o professor.', resp: 'thiago', formato: 'Carrossel', categoria: 'conteudo', prazo: '2026-11-12', publicar: '2026-11-13', passos: PASSOS_CARROSSEL_CONTEUDO },
        { chave: 'reels-1', titulo: 'Reels de conteúdo com professor', descricao: 'Tema a definir com o professor.', resp: 'manu', formato: 'Reels', categoria: 'conteudo', prazo: '2026-11-15', publicar: '2026-11-16', passos: PASSOS_REELS_CONTEUDO },
        { chave: 'carrossel-2', titulo: 'Carrossel de conteúdo 2', descricao: 'Tema a definir com o professor.', resp: 'thiago', formato: 'Carrossel', categoria: 'conteudo', prazo: '2026-11-19', publicar: '2026-11-20', passos: PASSOS_CARROSSEL_CONTEUDO },
      ],
    }),
  ],
};
