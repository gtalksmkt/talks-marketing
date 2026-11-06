# Talks Marketing

App oficial da equipe de marketing do Grupo Talks (Thiago, Manu e Yuri) para acompanhar as produções do mês: o que já foi feito, o que falta, o passo a passo de cada entrega, o que está travando e o cronograma de produção e de postagem.

**No ar:** https://gtalksmkt.github.io/talks-marketing/

Funciona no navegador do computador e pode ser instalado no celular (iPhone e Android): na primeira vez que alguém abre pelo celular, o próprio app ensina a instalar.

## Quem faz o quê

| Pessoa | Função |
| --- | --- |
| Thiago | Designer e social media |
| Manu | Editora de vídeo e responsável pelos vídeos (pede os vídeos aos professores com o roteiro do Yuri) |
| Yuri | Designer, social media e produção (roteiros, lives, páginas, textos, revisão) |

## Como a equipe usa

1. Abre o app e escolhe quem é. O app destaca o que é dessa pessoa ("Você") e o que está esperando um passo dela ("Sua vez").
2. Um tutorial mostra onde tocar em cada coisa (dá para rever no botão **?**).
3. Cada entrega tem prazo para ficar **pronta** (para dar tempo de agendar) e o dia de **publicar**. O card mostra o próximo passo e de quem ele é.
4. No **Quadro**, arrasta cada entrega para a etapa certa: A fazer, Em produção, Em aprovação, Pronto, Programado.
5. Ao colocar em **Pronto**, o app pede o **link do Drive** do arquivo final.
6. Se algo estiver parado, abre a entrega e marca **Travado**, com o motivo. Aparece para todo mundo na tela de início.
7. A **Agenda** mostra, dia a dia, o que precisa ficar pronto e o que precisa sair (com "Falta programar" quando já está pronto mas não foi agendado).

## Arquivos

| Arquivo | Para que serve |
| --- | --- |
| `dados.js` | **O planejamento do mês**: linha do tempo, projetos, entregas, responsáveis, prazos, dias de publicar e passo a passo. |
| `config.js` | Link da planilha que sincroniza a equipe (`ENDPOINT`). |
| `app.js` | O app em si (telas, arrastar, tutorial, instalação, sincronização, entregas novas). |
| `estilo.css` | Visual (preto + vermelhos do brand, Inter Tight no lugar da Linear Grotesk). |
| `img/` | Fotinhas de cada pessoa. |
| `apps-script/Codigo.gs` | Código da planilha Google que guarda o andamento da equipe. |
| `sw.js`, `manifest.webmanifest`, `icons/` | O que faz o app ser instalável e abrir sem internet. |
| `tools/gerar-icones.ps1` | Gera os ícones (símbolo Talks em vetor). |

## Planejamento do mês (`dados.js`)

- `marcos`: a linha do tempo que aparece no topo (data, `ate` opcional, `hora` opcional, título, perfil).
- `projetos`: cada lançamento ou frente de conteúdo, com `projeto({ id, mes, perfil, tipo, nome, data, resumo, itens })`.
- Cada entrega: `chave`, `titulo`, `resp`, `formato`, `categoria` (`conteudo` | `comercial` | `trafego`), `prazo` (pronto até), `publicar` e `hora` (opcionais), `depende` (chaves que precisam ficar prontas antes), `passos` (um passo de outra pessoa: `{ t: 'Revisão do Yuri', r: 'yuri' }`) e `inicial` (etapa de partida, por exemplo `'pronto'` ou `{ status: 'producao', travado: true, motivo: '...' }`).
- Perfis: `emergency`, `ped`, `intensive` e `grupo` (Grupo Talks).

> Não mude a `chave` de uma entrega (nem o `id` do projeto) depois que a equipe começar a usar: é por ela que o app guarda etapa, link e passos. Também evite reordenar os passos de uma entrega já em andamento.

## Entregas novas pelo app

Quem está em `quemAdiciona` (hoje só o Yuri) vê o botão **Nova entrega** no Quadro e na página de cada lançamento. A entrega nova fica guardada na planilha e aparece para toda a equipe; dá para apagar abrindo a entrega.

Isso precisa do código da planilha na **versão 2** (`apps-script/Codigo.gs`). Para atualizar (mesmo link, não muda nada no app):

1. Na planilha: **Extensões > Apps Script**.
2. Apague o código que está lá, cole o novo e salve (Ctrl+S).
3. **Implantar > Gerenciar implantações** > lápis (editar) > **Versão: Nova versão** > **Implantar**.

## Sincronização da equipe

A planilha Google do Yuri (abas **Status** e **Histórico**) guarda o andamento. O app busca as mudanças a cada 30 segundos e sempre que é aberto; sem internet, guarda no aparelho e envia quando a conexão volta.

Montar do zero (outra planilha): crie a planilha, cole `apps-script/Codigo.gs` em Extensões > Apps Script, **Implantar > Nova implantação > App da Web** (Executar como: Eu · Quem pode acessar: **Qualquer pessoa**), autorize e coloque o link `/exec` em `config.js`.

O app é `noindex` e a planilha só guarda andamento e links do Drive (os arquivos continuam protegidos pelas permissões do próprio Drive).

## Ver no computador antes de publicar

Preview local: `.claude/launch.json` configuração **"marketing"** (porta 8135), servida pelo `serve-preview.ps1`.

## Publicação

GitHub Pages da conta **gtalksmkt**, branch `main`, pasta raiz. Qualquer push em `main` atualiza o app; os celulares pegam a versão nova na próxima vez que abrirem o app com internet.
