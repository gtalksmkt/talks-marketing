/* =====================================================================
   TALKS MARKETING · o que a equipe precisa produzir
   ---------------------------------------------------------------------
   É aqui que fica o planejamento do mês: linha do tempo, lançamentos,
   conteúdo fixo, prazos de produção e dias de publicar. A equipe não
   mexe neste arquivo: no app, cada um muda a etapa, cola o link do Drive,
   marca o passo a passo e avisa quando algo está travado.

   COMO A EQUIPE TRABALHA
   - Thiago: faz as artes (todas, menos as do Atualiza Talks) e cuida do
     conteúdo do Emergency e do Intensive: recebe do professor, faz o
     carrossel e publica. Arte sem copy? Cobra o Yuri.
   - Manu: edita os vídeos (pede o roteiro ao Yuri e o vídeo ao professor)
     e publica os posts e vídeos que não são de conteúdo.
   - Yuri: cronograma, copy das artes, roteiros, legendas (as de conteúdo
     vêm do professor), revisão, páginas e todas as artes do Atualiza Talks.

   Cada entrega tem:
     chave     identificador único dentro do projeto (não mude depois)
     titulo    o que precisa ser feito
     resp      quem é o responsável: 'thiago' | 'manu' | 'yuri'
     formato   Carrossel, Reels, Vídeo, Criativo, Stories, Página...
     categoria 'conteudo' | 'comercial' | 'trafego'
     prazo     dia em que precisa estar PRONTO (para dar tempo de agendar)
     publicar  dia em que sai nas redes (opcional) · hora (opcional)
     publica   quem programa a publicação (opcional; o padrão está em
               "publicacao", lá embaixo)
     depende   chaves de entregas que precisam ficar prontas antes
     passos    passo a passo; um passo de outra pessoa: { t: '...', r: 'yuri' }
     inicial   etapa de partida: 'pronto', 'programado'... ou
               { status, travado, motivo, passos } (só vale até alguém mexer)
   ===================================================================== */

/* ---------- Ajudantes (não precisa mexer) ---------- */
function somarDias(iso, n) {
  const [a, m, d] = iso.split('-').map(Number);
  const data = new Date(a, m - 1, d + n);
  return data.getFullYear() + '-' + String(data.getMonth() + 1).padStart(2, '0') + '-' + String(data.getDate()).padStart(2, '0');
}
/** n dias úteis antes (pula sábado e domingo). */
function diasUteisAntes(iso, n) {
  let d = iso;
  while (n > 0) {
    d = somarDias(d, -1);
    const [a, m, dia] = d.split('-').map(Number);
    const sem = new Date(a, m - 1, dia).getDay();
    if (sem !== 0 && sem !== 6) n--;
  }
  return d;
}
const dm = iso => iso.slice(8, 10) + '/' + iso.slice(5, 7);
function projeto(o) { return { tipo: 'conteudo', ...o, itens: o.itens || [] }; }

/* ---------- Passos que se repetem ---------- */
const COPY = { t: 'Copy da arte', r: 'yuri' };
const REVISAO = { t: 'Revisão do Yuri', r: 'yuri' };
const LEGENDA = { t: 'Legenda', r: 'yuri' };
const TRAFEGO_ENVIAR = { t: 'Enviar para quem cuida do tráfego', r: 'yuri' };
// artes do Thiago: copy do Yuri → arte → revisão → Drive → legenda do Yuri
const PASSOS_ESTATICO = [COPY, 'Criar a arte (feed e stories)', REVISAO, 'Exportar e subir no Drive', LEGENDA];
const PASSOS_STORIES = [COPY, 'Criar os stories', REVISAO, 'Exportar e subir no Drive'];
const PASSOS_CARROSSEL = [{ t: 'Copy da arte (texto dos cards)', r: 'yuri' }, 'Diagramar o carrossel', REVISAO, 'Exportar e subir no Drive', LEGENDA];
const PASSOS_TRAFEGO = [{ t: 'Copy dos anúncios', r: 'yuri' }, 'Criar 3 variações (1:1, 4:5 e 9:16)', REVISAO, 'Subir no Drive', TRAFEGO_ENVIAR];
// vídeos da Manu: roteiro vem do Yuri (entrega de roteiros), legenda do Yuri no fim
const PASSOS_VIDEO = ['Mandar o roteiro e pedir o vídeo a quem vai gravar', 'Receber o vídeo gravado', 'Editar (cortes e legenda na tela)', REVISAO, 'Exportar 9:16 e 16:9 e subir no Drive', LEGENDA];
const PASSOS_VIDEO_TRAFEGO = ['Escolher os melhores trechos (15 a 30 segundos)', 'Editar com legenda na tela', 'Exportar 9:16, 4:5 e 1:1', REVISAO, TRAFEGO_ENVIAR];
const PASSOS_TEXTOS = ['Mensagens de WhatsApp', 'E-mail'];
// artes do Atualiza Talks: inteiramente do Yuri
const PASSOS_ATUALIZA = ['Copy e arte (feed e stories)', 'Exportar e subir no Drive', 'Legenda'];
// conteúdo: o Thiago recebe do professor (a legenda vem do professor), faz e publica
const passosConteudo = prof => ['Receber o material e a legenda ' + prof, 'Diagramar o carrossel', 'Exportar e subir no Drive'];

/* =====================================================================
   DADOS
   ===================================================================== */
window.TM_DADOS = {
  exemplo: false,

  // quem pode criar entregas novas pelo app (desligado por enquanto; para ligar: ['yuri']
  // e atualizar o código da planilha para a versão 2, ver README)
  quemAdiciona: [],

  // quem programa a publicação quando a entrega fica pronta
  // (tráfego, páginas e lives não entram: quem é responsável já resolve)
  publicacao: { conteudo: 'thiago', outros: 'manu' },

  equipe: [
    { id: 'thiago', nome: 'Thiago', funcao: 'Designer e social media: artes e conteúdo', cor: '#FACC15', foto: 'img/avatar-thiago.png?v=2' },
    { id: 'manu',   nome: 'Manu',   funcao: 'Editora de vídeo e publicação dos posts', cor: '#E879F9', foto: 'img/avatar-manu.png' },
    { id: 'yuri',   nome: 'Yuri',   funcao: 'Cronograma, copy, legendas e produção', cor: '#FF8A4C', foto: 'img/avatar-yuri.png?v=2' },
  ],

  // aparece no app em "Quem faz o quê" (toque na sua foto, lá em cima)
  processo: [
    { quem: 'thiago', faz: ['Faz as artes de tudo, menos as do Atualiza Talks', 'Conteúdo do Emergency e do Intensive: recebe do professor (com a legenda), faz o carrossel e publica', 'Arte sem copy? Cobra o Yuri'] },
    { quem: 'manu',   faz: ['Edita os vídeos: pede o roteiro ao Yuri e o vídeo ao professor', 'Publica os posts e vídeos que não são de conteúdo, quando ficam prontos'] },
    { quem: 'yuri',   faz: ['Define o cronograma', 'Escreve a copy das artes e os roteiros dos vídeos', 'Escreve as legendas (as de conteúdo vêm do professor)', 'Revisa, cuida das páginas e faz todas as artes do Atualiza Talks'] },
  ],

  perfis: [
    { id: 'emergency', nome: 'Emergency Talks', curto: 'emergency', cor: '#D31C2B', texto: '#F04452' },
    { id: 'ped',       nome: 'Ped Talks',       curto: 'ped',       cor: '#0074F2', texto: '#5AA6FF' },
    { id: 'intensive', nome: 'Intensive Talks', curto: 'intensive', cor: '#2EE96F', texto: '#2EE96F' },
    { id: 'grupo',     nome: 'Grupo Talks',     curto: 'grupo',     cor: '#E9E6EE', texto: '#F5F3F7' },
  ],

  categorias: [
    { id: 'conteudo',  nome: 'Conteúdo',  explica: 'Matéria que os professores trazem para as redes' },
    { id: 'comercial', nome: 'Comercial', explica: 'Marketing de vendas e lançamentos' },
    { id: 'trafego',   nome: 'Tráfego',   explica: 'Peças para anúncios pagos' },
  ],

  /* Linha do tempo que aparece no topo do app */
  marcos: [
    { data: '2026-11-06', titulo: 'Vídeo do aquecimento Black Talks no ar', perfil: 'grupo', projeto: 'black-talks-nov26' },
    { data: '2026-11-11', titulo: 'Aquecimento Black Talks (só neste dia)', perfil: 'grupo', projeto: 'black-talks-nov26' },
    { data: '2026-11-16', ate: '2026-11-22', titulo: '“Vem aí” da Black Talks', perfil: 'grupo', projeto: 'black-talks-nov26' },
    { data: '2026-11-18', hora: '19h30', titulo: 'Live de lançamento do TEP (Rebecca e Natália)', perfil: 'ped', projeto: 'tep-lanc-nov26' },
    { data: '2026-11-23', titulo: 'Landing do TEP no ar', perfil: 'ped', projeto: 'tep-lanc-nov26' },
    { data: '2026-11-23', ate: '2026-11-29', titulo: 'Black Talks: cursos online com desconto', perfil: 'grupo', projeto: 'black-talks-nov26' },
    { data: '2026-11-25', titulo: 'Lançamento do Atualiza Talks no CBMEDE + R$ 9,90 no 1º mês', perfil: 'emergency', projeto: 'atualiza-lanc-nov26' },
    { data: '2026-11-27', titulo: 'Black Friday', perfil: 'grupo', projeto: 'black-talks-nov26' },
    { data: '2026-11-29', titulo: 'Último dia da Black Talks', perfil: 'grupo', projeto: 'black-talks-nov26' },
  ],

  projetos: [
    /* =================== BLACK TALKS =================== */
    projeto({
      id: 'black-talks-nov26', mes: '2026-11', perfil: 'grupo', tipo: 'lancamento',
      nome: 'Black Talks', data: '2026-11-23',
      resumo: 'Aquecimento em 11/11 · Black de 23 a 29/11 com o Atualiza Talks e os cursos online com desconto',
      itens: [
        // ---- Aquecimento (só no dia 11/11) ----
        { chave: 'aq-condicoes', fase: 'Aquecimento (11/11)', titulo: 'Definir o que entra no aquecimento de 11/11', resp: 'yuri', formato: 'Planejamento', categoria: 'comercial', prazo: '2026-11-06',
          passos: ['Confirmar com a diretoria os produtos e os descontos do dia 11/11', 'Passar as condições para o Thiago e a Manu', 'Pedir os links de checkout com desconto ao comercial'] },
        { chave: 'aq-criativo-0511', fase: 'Aquecimento (11/11)', titulo: 'Criativo do aquecimento (postado em 05/11)', resp: 'thiago', formato: 'Criativo', categoria: 'comercial', prazo: '2026-11-05', publicar: '2026-11-05',
          inicial: 'programado', descricao: 'Já foi postado em 05/11. Só falta colar o link do Drive.' },
        { chave: 'aq-video-0611', fase: 'Aquecimento (11/11)', titulo: 'Vídeo do aquecimento (sai em 06/11)', resp: 'manu', formato: 'Vídeo', categoria: 'comercial', prazo: '2026-11-05', publicar: '2026-11-06',
          inicial: 'pronto', descricao: 'Já foi gravado e editado. Falta colar o link do Drive e programar.' },
        { chave: 'aq-carrossel', fase: 'Aquecimento (11/11)', titulo: 'Carrossel: o que vai ter no dia 11/11', resp: 'thiago', formato: 'Carrossel', categoria: 'comercial', prazo: '2026-11-06', publicar: '2026-11-09', depende: ['aq-condicoes'], passos: PASSOS_CARROSSEL },
        { chave: 'aq-textos', fase: 'Aquecimento (11/11)', titulo: 'Mensagem de WhatsApp do aquecimento', resp: 'yuri', formato: 'Texto', categoria: 'comercial', prazo: '2026-11-09', depende: ['aq-condicoes'],
          passos: ['Mensagem de WhatsApp para a base'] },
        { chave: 'aq-trafego', fase: 'Aquecimento (11/11)', titulo: 'Criativos do aquecimento para tráfego', resp: 'thiago', formato: 'Criativo', categoria: 'trafego', prazo: '2026-11-09', publicar: '2026-11-10', depende: ['aq-condicoes'], passos: PASSOS_TRAFEGO },
        { chave: 'aq-amanha', fase: 'Aquecimento (11/11)', titulo: 'Post e stories “é amanhã”', resp: 'thiago', formato: 'Stories', categoria: 'comercial', prazo: '2026-11-09', publicar: '2026-11-10', passos: PASSOS_ESTATICO },
        { chave: 'aq-hoje', fase: 'Aquecimento (11/11)', titulo: 'Post e stories “é hoje”', resp: 'thiago', formato: 'Stories', categoria: 'comercial', prazo: '2026-11-10', publicar: '2026-11-11', hora: '8h',
          passos: [COPY, 'Post “é hoje” para o feed', 'Stories para repostar ao longo do dia', REVISAO, 'Exportar e subir no Drive', LEGENDA] },
        { chave: 'aq-video-hoje', fase: 'Aquecimento (11/11)', titulo: 'Vídeo curto “é hoje”', resp: 'manu', formato: 'Reels', categoria: 'comercial', prazo: '2026-11-10', publicar: '2026-11-11', hora: '12h',
          descricao: 'Pode reaproveitar trechos do vídeo de 06/11.',
          passos: ['Separar trechos do vídeo do aquecimento', 'Editar versão de 15 a 30 segundos', REVISAO, 'Exportar 9:16 e subir no Drive', LEGENDA] },
        { chave: 'aq-encerramento', fase: 'Aquecimento (11/11)', titulo: 'Post de encerramento: “a Black de verdade vem aí”', resp: 'thiago', formato: 'Criativo', categoria: 'comercial', prazo: '2026-11-11', publicar: '2026-11-12', passos: PASSOS_ESTATICO },

        // ---- Vem aí (16 a 22/11) ----
        { chave: 'bk-condicoes', fase: 'Vem aí (16 a 22/11)', titulo: 'Definir a programação e as condições da Black', resp: 'yuri', formato: 'Planejamento', categoria: 'comercial', prazo: '2026-11-11',
          passos: ['Lista dos cursos online e dos descontos', 'Confirmar o Atualiza Talks por R$ 9,90 no 1º mês a partir de 25/11', 'Links de checkout com desconto (comercial)', 'Passar tudo para a equipe'] },
        { chave: 'bk-roteiros', fase: 'Vem aí (16 a 22/11)', titulo: 'Roteiros dos vídeos da Black', resp: 'yuri', formato: 'Roteiro', categoria: 'comercial', prazo: '2026-11-12', depende: ['bk-condicoes'],
          passos: ['Roteiro do vídeo de divulgação', 'Roteiro do vídeo para tráfego', 'Mandar os roteiros para a Manu'] },
        { chave: 'bk-identidade', fase: 'Vem aí (16 a 22/11)', titulo: 'Identidade visual da Black Talks', resp: 'thiago', formato: 'Arte', categoria: 'comercial', prazo: '2026-11-13',
          passos: ['Proposta de arte', { t: 'Aprovação do Yuri', r: 'yuri' }, 'Kit: feed, stories e tráfego', 'Subir o kit no Drive'] },
        { chave: 'bk-vemai-1', fase: 'Vem aí (16 a 22/11)', titulo: 'Estático “vem aí” 1: anúncio da Black Talks', resp: 'thiago', formato: 'Criativo', categoria: 'comercial', prazo: '2026-11-13', publicar: '2026-11-16', depende: ['bk-identidade'], passos: PASSOS_ESTATICO },
        { chave: 'bk-video', fase: 'Vem aí (16 a 22/11)', titulo: 'Vídeo de divulgação da Black Talks', resp: 'manu', formato: 'Vídeo', categoria: 'comercial', prazo: '2026-11-17', publicar: '2026-11-20', depende: ['bk-roteiros'], passos: PASSOS_VIDEO },
        // contagem regressiva (feed e stories, na identidade da Black)
        { chave: 'bk-contagem-5', fase: 'Vem aí (16 a 22/11)', titulo: 'Contagem regressiva da Black: “faltam 5 dias”', resp: 'thiago', formato: 'Criativo', categoria: 'comercial', prazo: '2026-11-16', publicar: '2026-11-18', depende: ['bk-identidade'], passos: PASSOS_ESTATICO },
        { chave: 'bk-vemai-2', fase: 'Vem aí (16 a 22/11)', titulo: 'Estático “vem aí” 2: programação especial', resp: 'thiago', formato: 'Carrossel', categoria: 'comercial', prazo: '2026-11-17', publicar: '2026-11-19', depende: ['bk-identidade', 'bk-condicoes'],
          passos: [{ t: 'Copy da arte: lançamentos e condições especiais', r: 'yuri' }, 'Diagramar', REVISAO, 'Exportar e subir no Drive', LEGENDA] },
        { chave: 'bk-contagem-3', fase: 'Vem aí (16 a 22/11)', titulo: 'Contagem regressiva da Black: “faltam 3 dias”', resp: 'thiago', formato: 'Criativo', categoria: 'comercial', prazo: '2026-11-18', publicar: '2026-11-20', depende: ['bk-identidade'], passos: PASSOS_ESTATICO },
        { chave: 'bk-vemai-3', fase: 'Vem aí (16 a 22/11)', titulo: 'Contagem regressiva da Black: “faltam 2 dias, começa segunda!”', resp: 'thiago', formato: 'Criativo', categoria: 'comercial', prazo: '2026-11-19', publicar: '2026-11-21', depende: ['bk-identidade'], passos: PASSOS_ESTATICO },
        { chave: 'bk-contagem-1', fase: 'Vem aí (16 a 22/11)', titulo: 'Contagem regressiva da Black: “é amanhã!”', resp: 'thiago', formato: 'Criativo', categoria: 'comercial', prazo: '2026-11-20', publicar: '2026-11-22', depende: ['bk-identidade'], passos: PASSOS_ESTATICO },
        { chave: 'bk-textos', fase: 'Vem aí (16 a 22/11)', titulo: 'Textos da Black: WhatsApp e e-mail', resp: 'yuri', formato: 'Texto', categoria: 'comercial', prazo: '2026-11-19', depende: ['bk-condicoes'], passos: PASSOS_TEXTOS },

        // ---- Black (23 a 29/11) ----
        { chave: 'bk-comecou', fase: 'Black (23 a 29/11)', titulo: 'Contagem regressiva da Black: “começou!”', resp: 'thiago', formato: 'Criativo', categoria: 'comercial', prazo: '2026-11-20', publicar: '2026-11-23', hora: '8h', depende: ['bk-identidade'], passos: PASSOS_ESTATICO },
        { chave: 'bk-cursos', fase: 'Black (23 a 29/11)', titulo: 'Estáticos dos cursos online com desconto', resp: 'thiago', formato: 'Carrossel', categoria: 'comercial', prazo: '2026-11-20', publicar: '2026-11-23', depende: ['bk-identidade', 'bk-condicoes'],
          descricao: 'Uma arte por curso online e um carrossel com todos. Postar nos perfis do Grupo Talks, Emergency, Ped e Intensive.',
          passos: [COPY, 'Uma arte por curso', 'Carrossel com todos os cursos', REVISAO, 'Exportar e subir no Drive', LEGENDA] },
        { chave: 'bk-trafego', fase: 'Black (23 a 29/11)', titulo: 'Criativos da Black para tráfego', resp: 'thiago', formato: 'Criativo', categoria: 'trafego', prazo: '2026-11-20', publicar: '2026-11-23', depende: ['bk-identidade'], passos: PASSOS_TRAFEGO },
        { chave: 'bk-video-trafego', fase: 'Black (23 a 29/11)', titulo: 'Vídeo da Black para tráfego', resp: 'manu', formato: 'Vídeo', categoria: 'trafego', prazo: '2026-11-20', publicar: '2026-11-23', depende: ['bk-roteiros'], passos: PASSOS_VIDEO_TRAFEGO },
        { chave: 'bk-stories', fase: 'Black (23 a 29/11)', titulo: 'Stories de todos os dias da Black (23 a 29/11)', resp: 'thiago', formato: 'Stories', categoria: 'comercial', prazo: '2026-11-20', publicar: '2026-11-23', depende: ['bk-identidade'],
          descricao: 'Sequência de stories com o link do checkout. A Manu programa de 23 a 29/11.',
          passos: [{ t: 'Copy dos stories', r: 'yuri' }, 'Criar a sequência de stories', REVISAO, 'Exportar e subir no Drive'] },
        { chave: 'bk-atualiza-990', fase: 'Black (23 a 29/11)', titulo: 'Estáticos do Atualiza Talks por R$ 9,90 no 1º mês', resp: 'yuri', formato: 'Criativo', categoria: 'comercial', prazo: '2026-11-23', publicar: '2026-11-25', depende: ['bk-identidade'], passos: PASSOS_ATUALIZA },
        { chave: 'bk-blackfriday', fase: 'Black (23 a 29/11)', titulo: 'Post e stories “Black Friday é hoje”', resp: 'thiago', formato: 'Stories', categoria: 'comercial', prazo: '2026-11-25', publicar: '2026-11-27', hora: '8h', depende: ['bk-identidade'], passos: PASSOS_ESTATICO },
        { chave: 'bk-ultimos', fase: 'Black (23 a 29/11)', titulo: 'Contagem regressiva da Black: “últimos 2 dias”', resp: 'thiago', formato: 'Criativo', categoria: 'comercial', prazo: '2026-11-26', publicar: '2026-11-28', depende: ['bk-identidade'], passos: PASSOS_ESTATICO },
        { chave: 'bk-ultimo-dia', fase: 'Black (23 a 29/11)', titulo: 'Post e stories “último dia da Black”', resp: 'thiago', formato: 'Stories', categoria: 'comercial', prazo: '2026-11-26', publicar: '2026-11-29', hora: '8h', depende: ['bk-identidade'], passos: PASSOS_ESTATICO },
      ],
    }),

    /* =================== PREPARATÓRIO TEP (Ped) =================== */
    projeto({
      id: 'tep-lanc-nov26', mes: '2026-11', perfil: 'ped', tipo: 'lancamento',
      nome: 'Preparatório TEP 2027', data: '2026-11-23',
      resumo: 'E-book no pré-lançamento · live em 18/11 às 19h30 · landing no ar em 23/11 · divulgação do curso até 30/11',
      itens: [
        { chave: 'ebook', fase: 'Pré-lançamento: e-book', titulo: 'Divulgação do e-book do TEP (em andamento)', resp: 'manu', formato: 'Posts', categoria: 'comercial', prazo: '2026-11-20',
          inicial: 'producao', descricao: 'Pré-lançamento que já está rodando: posts e stories do e-book gratuito Guia do TEP até o lançamento.',
          passos: ['Programar os posts do e-book que faltam', 'Fixar o post do e-book no perfil', 'Repostar nos stories 2 vezes por semana até 22/11'] },
        { chave: 'roteiros', fase: 'Pré-lançamento: e-book', titulo: 'Roteiros dos vídeos do lançamento do TEP', resp: 'yuri', formato: 'Roteiro', categoria: 'comercial', prazo: '2026-11-12',
          passos: ['Roteiro do vídeo de divulgação', 'Roteiro do vídeo para tráfego', 'Mandar para a Manu pedir os vídeos aos professores'] },
        { chave: 'vem-ai', fase: 'Pré-lançamento: e-book', titulo: 'Criativo “vem aí”: Preparatório TEP 2027', resp: 'thiago', formato: 'Criativo', categoria: 'comercial', prazo: '2026-11-12', publicar: '2026-11-14', passos: PASSOS_ESTATICO },

        // ---- Live confirmada: quarta, 18/11, às 19h30 ----
        { chave: 'live-roteiros', fase: 'Live de lançamento (18/11, 19h30)', titulo: 'Live confirmada: tema e roteiros dos vídeos de divulgação', resp: 'yuri', formato: 'Roteiro', categoria: 'comercial', prazo: '2026-11-10',
          inicial: { status: 'producao', passos: [0] }, descricao: 'A Rebecca e a Natália confirmaram: quarta, 18/11, às 19h30.',
          passos: ['Live confirmada com a Rebecca e a Natália (18/11, 19h30)', 'Combinar o tema e o roteiro da live com as duas', 'Roteiros dos 2 vídeos de divulgação da live', 'Mandar os roteiros para a Manu pedir os vídeos às duas'] },
        { chave: 'live-arte', fase: 'Live de lançamento (18/11, 19h30)', titulo: 'Criativo de divulgação da live (feed e stories)', resp: 'thiago', formato: 'Criativo', categoria: 'comercial', prazo: '2026-11-11', publicar: '2026-11-12',
          descricao: 'Data, horário (19h30), fotos da Rebecca e da Natália e o tema da live.',
          passos: [{ t: 'Copy da arte: tema e título da live', r: 'yuri' }, 'Criar a arte (feed e stories)', REVISAO, 'Exportar e subir no Drive', LEGENDA] },
        { chave: 'live-trafego', fase: 'Live de lançamento (18/11, 19h30)', titulo: 'Criativo da live para tráfego', resp: 'thiago', formato: 'Criativo', categoria: 'trafego', prazo: '2026-11-12', publicar: '2026-11-13', depende: ['live-arte'],
          descricao: 'Para impulsionar a live de 13 a 18/11.', passos: PASSOS_TRAFEGO },
        { chave: 'live-video-1', fase: 'Live de lançamento (18/11, 19h30)', titulo: 'Vídeo 1 da live: Rebecca e Natália convidando', resp: 'manu', formato: 'Reels', categoria: 'comercial', prazo: '2026-11-12', publicar: '2026-11-14', depende: ['live-roteiros'],
          descricao: 'Também vai para o tráfego, para impulsionar a live.',
          passos: ['Mandar o roteiro e pedir o vídeo à Rebecca e à Natália', 'Receber os vídeos', 'Editar com legenda na tela', REVISAO, 'Exportar 9:16 e subir no Drive', LEGENDA] },
        { chave: 'live-amanha', fase: 'Live de lançamento (18/11, 19h30)', titulo: 'Criativo “é amanhã, às 19h30”', resp: 'thiago', formato: 'Stories', categoria: 'comercial', prazo: '2026-11-16', publicar: '2026-11-17', depende: ['live-arte'], passos: PASSOS_ESTATICO },
        { chave: 'live-video-2', fase: 'Live de lançamento (18/11, 19h30)', titulo: 'Vídeo 2 da live: “é hoje, às 19h30”', resp: 'manu', formato: 'Reels', categoria: 'comercial', prazo: '2026-11-16', publicar: '2026-11-18', hora: '12h', depende: ['live-roteiros'],
          passos: ['Pedir às duas um vídeo curto (ou usar trechos do vídeo 1)', 'Editar com legenda na tela', REVISAO, 'Exportar 9:16 e subir no Drive', LEGENDA] },
        { chave: 'live-lembrete', fase: 'Live de lançamento (18/11, 19h30)', titulo: 'Stories “hoje, às 19h30”', resp: 'thiago', formato: 'Stories', categoria: 'comercial', prazo: '2026-11-17', publicar: '2026-11-18', hora: '9h', depende: ['live-arte'], passos: PASSOS_STORIES },
        { chave: 'live-ao-vivo', fase: 'Live de lançamento (18/11, 19h30)', titulo: 'Stories “estamos ao vivo” com o link', resp: 'thiago', formato: 'Stories', categoria: 'comercial', prazo: '2026-11-17', publicar: '2026-11-18', hora: '19h30', depende: ['live-arte'], passos: PASSOS_STORIES },
        { chave: 'live', fase: 'Live de lançamento (18/11, 19h30)', titulo: 'Live de lançamento do TEP', resp: 'yuri', formato: 'Live', categoria: 'comercial', prazo: '2026-11-18', publicar: '2026-11-18', hora: '19h30', depende: ['live-roteiros'],
          passos: ['Preparar a transmissão: link, capa e perguntas', 'Fazer a live com a Rebecca e a Natália', 'Salvar a gravação no Drive para a Manu'] },
        { chave: 'live-cortes', fase: 'Live de lançamento (18/11, 19h30)', titulo: 'Cortes da live para reels', resp: 'manu', formato: 'Reels', categoria: 'comercial', prazo: '2026-11-20', publicar: '2026-11-21', depende: ['live'],
          passos: ['Escolher 3 trechos da live', 'Editar com legenda na tela', REVISAO, 'Exportar 9:16 e subir no Drive', LEGENDA] },

        { chave: 'data', fase: 'Lançamento (23/11)', titulo: 'Criativo com a data: inscrições a partir de 23/11', resp: 'thiago', formato: 'Criativo', categoria: 'comercial', prazo: '2026-11-18', publicar: '2026-11-20', passos: PASSOS_ESTATICO },
        { chave: 'video', fase: 'Lançamento (23/11)', titulo: 'Vídeo de divulgação do TEP', resp: 'manu', formato: 'Vídeo', categoria: 'comercial', prazo: '2026-11-19', publicar: '2026-11-23', depende: ['roteiros'],
          descricao: 'Vai na landing page e nos perfis.', passos: PASSOS_VIDEO },
        { chave: 'video-trafego', fase: 'Lançamento (23/11)', titulo: 'Vídeo do TEP para tráfego', resp: 'manu', formato: 'Vídeo', categoria: 'trafego', prazo: '2026-11-20', publicar: '2026-11-23', depende: ['roteiros'], passos: PASSOS_VIDEO_TRAFEGO },
        { chave: 'fixados', fase: 'Lançamento (23/11)', titulo: 'Estáticos para fixar no perfil do Ped', resp: 'thiago', formato: 'Carrossel', categoria: 'comercial', prazo: '2026-11-20', publicar: '2026-11-23',
          descricao: '3 posts para fixar no dia 23/11: o que é o curso, o que inclui e como se inscrever.', passos: PASSOS_CARROSSEL },
        { chave: 'trafego', fase: 'Lançamento (23/11)', titulo: 'Criativos do TEP para tráfego', resp: 'thiago', formato: 'Criativo', categoria: 'trafego', prazo: '2026-11-20', publicar: '2026-11-23', passos: PASSOS_TRAFEGO },
        { chave: 'textos', fase: 'Lançamento (23/11)', titulo: 'Textos do lançamento do TEP: WhatsApp e e-mail', resp: 'yuri', formato: 'Texto', categoria: 'comercial', prazo: '2026-11-20', passos: PASSOS_TEXTOS },
        { chave: 'landing', fase: 'Lançamento (23/11)', titulo: 'Landing page do TEP no ar', resp: 'yuri', formato: 'Página', categoria: 'comercial', prazo: '2026-11-20', publicar: '2026-11-23', depende: ['video'],
          descricao: 'A página já existe com dados de exemplo: falta trocar pelos dados reais, colocar o vídeo e o checkout.',
          passos: ['Revisar textos, preços e datas', 'Colocar o vídeo de divulgação', 'Colocar o link do checkout', 'Testar no celular', 'Publicar'] },

        // ---- Divulgação do curso depois do lançamento ----
      ].concat([
        ['curso-inclui', 'o que inclui o Preparatório TEP 2027', '2026-11-24'],
        ['curso-professores', 'os professores do curso', '2026-11-26'],
        ['curso-como', 'como funciona a preparação para o TEP', '2026-11-28'],
        ['curso-inscricao', 'inscrições abertas (link na bio)', '2026-11-30'],
      ].map(([chave, tema, d]) => ({
        chave, fase: 'Divulgação do curso (23 a 30/11)', titulo: 'Criativo de divulgação do curso: ' + tema, resp: 'thiago', formato: 'Criativo', categoria: 'comercial',
        prazo: diasUteisAntes(d, 2), publicar: d, passos: PASSOS_ESTATICO,
      }))),
    }),

    /* =================== ATUALIZA TALKS (Emergency) · artes do Yuri =================== */
    projeto({
      id: 'atualiza-lanc-nov26', mes: '2026-11', perfil: 'emergency', tipo: 'lancamento',
      nome: 'Atualiza Talks', data: '2026-11-25',
      resumo: 'Lançamento no evento do CBMEDE · posts no Emergency e no Grupo Talks · artes do Yuri',
      itens: [
        { chave: 'roteiros', fase: 'Pré-lançamento', titulo: 'Roteiros dos vídeos do Atualiza Talks', resp: 'yuri', formato: 'Roteiro', categoria: 'comercial', prazo: '2026-11-13',
          passos: ['Roteiro do vídeo de divulgação', 'Roteiro do vídeo para tráfego', 'Mandar para a Manu pedir os vídeos'] },
        { chave: 'vem-ai', fase: 'Pré-lançamento', titulo: 'Estáticos “vem aí” do Atualiza Talks', resp: 'yuri', formato: 'Criativo', categoria: 'comercial', prazo: '2026-11-16', publicar: '2026-11-18',
          descricao: 'Postar no Emergency e no Grupo Talks.', passos: PASSOS_ATUALIZA },
        { chave: 'data', fase: 'Pré-lançamento', titulo: 'Criativo com a data: lançamento no CBMEDE, 25/11', resp: 'yuri', formato: 'Criativo', categoria: 'comercial', prazo: '2026-11-19', publicar: '2026-11-21',
          descricao: 'Postar no Emergency e no Grupo Talks.', passos: PASSOS_ATUALIZA },
        { chave: 'video', fase: 'Lançamento (25/11, CBMEDE)', titulo: 'Vídeo de divulgação do Atualiza Talks', resp: 'manu', formato: 'Vídeo', categoria: 'comercial', prazo: '2026-11-20', publicar: '2026-11-25', depende: ['roteiros'],
          descricao: 'Vai na landing page e nos perfis do Emergency e do Grupo Talks.', passos: PASSOS_VIDEO },
        { chave: 'video-trafego', fase: 'Lançamento (25/11, CBMEDE)', titulo: 'Vídeo do Atualiza Talks para tráfego', resp: 'manu', formato: 'Vídeo', categoria: 'trafego', prazo: '2026-11-23', publicar: '2026-11-25', depende: ['roteiros'], passos: PASSOS_VIDEO_TRAFEGO },
        { chave: 'estaticos', fase: 'Lançamento (25/11, CBMEDE)', titulo: 'Estáticos de lançamento (Emergency e Grupo Talks)', resp: 'yuri', formato: 'Carrossel', categoria: 'comercial', prazo: '2026-11-23', publicar: '2026-11-25',
          passos: ['Copy dos cards', 'Diagramar o carrossel', 'Exportar e subir no Drive', 'Legenda'] },
        { chave: 'trafego', fase: 'Lançamento (25/11, CBMEDE)', titulo: 'Criativos do Atualiza Talks para tráfego', resp: 'yuri', formato: 'Criativo', categoria: 'trafego', prazo: '2026-11-23', publicar: '2026-11-25',
          passos: ['Copy dos anúncios', 'Criar 3 variações (1:1, 4:5 e 9:16)', 'Subir no Drive', 'Enviar para quem cuida do tráfego'] },
        { chave: 'landing', fase: 'Lançamento (25/11, CBMEDE)', titulo: 'Landing page do Atualiza Talks no ar', resp: 'yuri', formato: 'Página', categoria: 'comercial', prazo: '2026-11-23', publicar: '2026-11-25', depende: ['video'],
          descricao: 'A página já existe: falta preço (R$ 9,90 no 1º mês na Black), checkout, professores e o vídeo.',
          passos: ['Preço e link do checkout', 'Professores', 'Colocar o vídeo', 'Testar no celular', 'Publicar'] },
        { chave: 'cbmede', fase: 'Lançamento (25/11, CBMEDE)', titulo: 'Material do lançamento no CBMEDE', resp: 'yuri', formato: 'Produção', categoria: 'comercial', prazo: '2026-11-23',
          descricao: 'Combinar com a diretoria o que vai ser usado no evento (telão, QR code da página, banner).',
          passos: ['Combinar com a diretoria o que precisa', 'Artes para o evento', 'Enviar os arquivos para o evento'] },
        { chave: 'textos', fase: 'Lançamento (25/11, CBMEDE)', titulo: 'Textos do lançamento do Atualiza: WhatsApp e e-mail', resp: 'yuri', formato: 'Texto', categoria: 'comercial', prazo: '2026-11-23', passos: PASSOS_TEXTOS },
        { chave: 'stories-evento', fase: 'Lançamento (25/11, CBMEDE)', titulo: 'Stories no dia do lançamento (CBMEDE)', resp: 'yuri', formato: 'Stories', categoria: 'comercial', prazo: '2026-11-25', publicar: '2026-11-25', publica: null,
          descricao: 'Feito ao vivo, no evento.', passos: ['Mostrar o lançamento no evento', 'Repostar o link da página'] },
      ],
    }),

    /* =================== TEME 2027 (carro-chefe) =================== */
    projeto({
      id: 'teme-nov26', mes: '2026-11', perfil: 'emergency',
      nome: 'TEME 2027 (carro-chefe)',
      resumo: 'Criativos, vídeo e carrosséis novos para não deixar o TEME 2027 parado',
      itens: [
        { chave: 'roteiro', fase: 'TEME 2027', titulo: 'Roteiro do vídeo novo do TEME 2027', resp: 'yuri', formato: 'Roteiro', categoria: 'comercial', prazo: '2026-11-10',
          passos: ['Escrever o roteiro', 'Mandar para a Manu pedir o vídeo ao professor'] },
        { chave: 'carrossel-1', fase: 'TEME 2027', titulo: 'Carrossel TEME 2027: por que fazer com o Emergency', resp: 'thiago', formato: 'Carrossel', categoria: 'comercial', prazo: '2026-11-11', publicar: '2026-11-13', passos: PASSOS_CARROSSEL },
        { chave: 'video', fase: 'TEME 2027', titulo: 'Vídeo novo de divulgação do TEME 2027', resp: 'manu', formato: 'Vídeo', categoria: 'comercial', prazo: '2026-11-13', publicar: '2026-11-15', depende: ['roteiro'], passos: PASSOS_VIDEO },
        { chave: 'criativos', fase: 'TEME 2027', titulo: 'Criativos novos do TEME 2027 para tráfego', resp: 'thiago', formato: 'Criativo', categoria: 'trafego', prazo: '2026-11-13', passos: PASSOS_TRAFEGO },
        { chave: 'video-trafego', fase: 'TEME 2027', titulo: 'Corte do vídeo do TEME 2027 para tráfego', resp: 'manu', formato: 'Vídeo', categoria: 'trafego', prazo: '2026-11-16', depende: ['video'], passos: PASSOS_VIDEO_TRAFEGO },
        { chave: 'carrossel-2', fase: 'TEME 2027', titulo: 'Carrossel TEME 2027: o que está incluso', resp: 'thiago', formato: 'Carrossel', categoria: 'comercial', prazo: '2026-11-19', publicar: '2026-11-22', passos: PASSOS_CARROSSEL },
      ],
    }),

    /* =================== DEPOIMENTOS =================== */
    projeto({
      id: 'depoimentos-nov26', mes: '2026-11', perfil: 'emergency',
      nome: 'Depoimentos de alunos',
      resumo: 'Vídeos que já estão prontos ou quase: um por semana, salpicados no feed',
      itens: [
        { chave: 'fila', fase: 'Depoimentos', titulo: 'Separar os depoimentos prontos e editar os que faltam', resp: 'manu', formato: 'Vídeo', categoria: 'comercial', prazo: '2026-11-11',
          descricao: 'Para os dias sem vídeo novo para editar: deixar uma fila de depoimentos prontos no Drive.',
          passos: ['Listar no Drive os depoimentos que já estão prontos', 'Editar os que faltam (corte e legenda na tela)', 'Juntar as versões finais numa pasta só'] },
      ].concat(['2026-11-14', '2026-11-21', '2026-11-26', '2026-11-28'].map(d => ({
        chave: 'dep-' + d.slice(8), fase: 'Depoimentos', titulo: 'Depoimento de aluno · ' + dm(d), resp: 'manu', formato: 'Reels', categoria: 'comercial',
        prazo: diasUteisAntes(d, 2), publicar: d,
        descricao: 'Se o depoimento for de outro curso, postar no perfil certo.',
        passos: ['Escolher o depoimento na fila do Drive', 'Conferir corte e legenda na tela', 'Subir a versão final no Drive', LEGENDA],
      }))),
    }),

    /* =================== CONTEÚDO FIXO (Thiago recebe, faz e publica) =================== */
    projeto({
      id: 'emergency-thais-nov26', mes: '2026-11', perfil: 'emergency',
      nome: 'Carrosséis da Prof. Thaís · 2 por semana',
      resumo: 'Conteúdo fixo do Emergency: terça e quinta (dia sugerido, ajuste se precisar). A legenda vem da professora.',
      itens: ['2026-11-10', '2026-11-12', '2026-11-17', '2026-11-19', '2026-11-24', '2026-11-26'].map(d => ({
        chave: 'carrossel-' + d.slice(8), fase: 'Conteúdo fixo', titulo: 'Carrossel da Prof. Thaís · ' + dm(d), resp: 'thiago', formato: 'Carrossel', categoria: 'conteudo',
        prazo: diasUteisAntes(d, 1), publicar: d, passos: passosConteudo('da Prof. Thaís'),
      })),
    }),
    projeto({
      id: 'intensive-cont-nov26', mes: '2026-11', perfil: 'intensive',
      nome: 'Carrosséis do Intensive · 2 por semana',
      resumo: 'Conteúdo fixo do Intensive: segunda e quarta (dia sugerido, ajuste se precisar). A legenda vem do professor.',
      itens: ['2026-11-09', '2026-11-11', '2026-11-16', '2026-11-18', '2026-11-23', '2026-11-25', '2026-11-30'].map(d => ({
        chave: 'carrossel-' + d.slice(8), fase: 'Conteúdo fixo', titulo: 'Carrossel do Intensive · ' + dm(d), resp: 'thiago', formato: 'Carrossel', categoria: 'conteudo',
        prazo: diasUteisAntes(d, 1), publicar: d, passos: passosConteudo('do professor'),
      })),
    }),
  ],
};
