# Talks Marketing

App oficial da equipe de marketing do Grupo Talks (Thiago, Manu e Yuri) para acompanhar as produções do mês: o que já foi feito, o que falta, o passo a passo de cada entrega, o que está travando e o que precisa ser programado para sair.

**No ar:** https://gtalksmkt.github.io/talks-marketing/

Funciona no navegador do computador e pode ser instalado no celular (iPhone e Android): na primeira vez que alguém abre pelo celular, o próprio app ensina a instalar.

## Como a equipe usa

1. Abre o app e escolhe quem é (Thiago, Manu ou Yuri). O app destaca o que é dessa pessoa, mas mostra o trabalho de todos.
2. Um tutorial mostra onde tocar em cada coisa (dá para rever no botão **?**).
3. No **Quadro**, arrasta cada entrega para a etapa certa: A fazer, Em produção, Em aprovação, Pronto, Programado.
4. Ao colocar em **Pronto**, o app pede o **link do Drive** do arquivo final.
5. Se algo estiver parado, abre a entrega e marca **Travado**, com o motivo. Aparece para todo mundo na tela de início.

A equipe não cadastra entregas: elas já vêm definidas no `dados.js`.

## Arquivos

| Arquivo | Para que serve |
| --- | --- |
| `dados.js` | **O que precisa ser produzido.** Lançamentos, conteúdo do mês, entregas, responsáveis, prazos e passo a passo. É o arquivo que muda todo mês. |
| `config.js` | Link da planilha que sincroniza a equipe (`ENDPOINT`). |
| `app.js` | O app em si (telas, arrastar, tutorial, instalação, sincronização). |
| `estilo.css` | Visual (preto + vermelhos do brand, Inter Tight no lugar da Linear Grotesk). |
| `apps-script/Codigo.gs` | Código da planilha Google que guarda o andamento da equipe. |
| `sw.js`, `manifest.webmanifest`, `icons/` | O que faz o app ser instalável e abrir sem internet. |
| `tools/gerar-icones.ps1` | Gera os ícones (símbolo Talks em vetor). |

## Cadastrar lançamentos e conteúdo do mês

Tudo no `dados.js`, na lista `projetos`.

**Lançamento** (já cria as 12 entregas padrão com prazos contados a partir da data):

```js
lancamento({
  id: 'teme-2027-lanc',           // único e sem espaços; não mude depois que a equipe começar
  mes: '2026-11',                 // mês em que aparece no app
  perfil: 'emergency',            // emergency | ped | intensive
  nome: 'Lançamento TEME 2027',
  data: '2026-11-24',             // dia do lançamento
  provisoria: false,              // true mostra "data provisória"
  remover: ['cortes'],            // tira entregas do modelo que não fazem sentido
  ajustes: { 'video-diretores': { prazo: '2026-11-18' } },  // muda algo de uma entrega
  extras: [                       // entregas a mais, só deste lançamento
    { chave: 'live', fase: 'Divulgação', titulo: 'Arte da live de abertura', resp: 'thiago',
      formato: 'Arte', categoria: 'comercial', prazo: '2026-11-20', publicar: '2026-11-22',
      passos: ['Criar a arte', { t: 'Revisão do Yuri', r: 'yuri' }, 'Subir no Drive'] },
  ],
}),
```

O modelo padrão de lançamento (`MODELO_LANCAMENTO`) fica no topo do `dados.js`: briefing, identidade visual, roteiros, gravação com os diretores, stories e reels de contagem regressiva, vídeo dos diretores, carrossel de anúncio, criativos e cortes para anúncios, página de vendas e textos de divulgação. Mudou o padrão da equipe? Muda ali e vale para todos os lançamentos.

**Conteúdo do mês** (entregas avulsas, datas fixas):

```js
conteudo({
  id: 'emergency-cont-dez26', mes: '2026-12', perfil: 'emergency', nome: 'Conteúdo de dezembro · Emergency',
  itens: [
    { chave: 'carrossel-1', titulo: 'Carrossel: tema do Dr. Fulano', resp: 'thiago', formato: 'Carrossel',
      categoria: 'conteudo', prazo: '2026-12-08', publicar: '2026-12-09', passos: PASSOS_CARROSSEL_CONTEUDO },
  ],
}),
```

Categorias: `conteudo` (matéria dos professores), `comercial` (marketing de vendas), `trafego` (anúncios pagos).

Quando os lançamentos reais estiverem cadastrados, troque `exemplo: true` por `exemplo: false` para sumir o aviso amarelo.

> Não mude a `chave` de uma entrega (nem o `id` do projeto) depois que a equipe começar a usar: é por ela que o app guarda etapa, link e passos. Também evite reordenar os passos de uma entrega já em andamento.

## Ligar a sincronização da equipe (uma vez só, ~5 minutos)

Enquanto o `ENDPOINT` estiver vazio, cada aparelho guarda as mudanças só para si (o app avisa isso no topo). Para todo mundo ver as mesmas coisas:

1. Com a conta Google do marketing, crie uma planilha nova chamada **Talks Marketing · andamento**.
2. Na planilha: **Extensões > Apps Script**. Apague o que tiver e cole o conteúdo de `apps-script/Codigo.gs`. Salve.
3. **Implantar > Nova implantação**. Em "Selecionar tipo", escolha **App da Web**.
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
4. Clique em **Implantar** e autorize com a conta Google (aparece um aviso de "app não verificado": é o seu próprio script; clique em Avançado > Acessar).
5. Copie o **URL do app da Web** (termina em `/exec`) e coloque em `config.js`:
   ```js
   ENDPOINT: 'https://script.google.com/macros/s/XXXXXXXX/exec',
   ```
6. Commit + push. Em 1 ou 2 minutos o app de todo mundo passa a sincronizar (a cada 30 segundos e sempre que o app é aberto).

A planilha ganha duas abas: **Status** (uma linha por entrega) e **Histórico** (quem mudou o quê e quando). Se mudar o código do script depois, use **Implantar > Gerenciar implantações > editar > Nova versão** para manter o mesmo link.

O app é `noindex` e a planilha só guarda andamento e links do Drive (os arquivos continuam protegidos pelas permissões do próprio Drive).

## Ver no computador antes de publicar

Preview local: `.claude/launch.json` configuração **"marketing"** (porta 8135), servida pelo `serve-preview.ps1`.

## Publicação

GitHub Pages da conta **gtalksmkt**, branch `main`, pasta raiz. Qualquer push em `main` atualiza o app; os celulares pegam a versão nova na próxima vez que abrirem o app com internet.
