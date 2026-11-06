/* Talks Marketing · configuração
   ENDPOINT = link do "App da Web" do Google Apps Script (planilha da equipe).
   Enquanto estiver vazio, cada aparelho guarda as mudanças só para si
   (modo local). Passo a passo para ligar a sincronização: README.md. */
window.TM_CONFIG = {
  ENDPOINT: '',
  // de quanto em quanto tempo o app busca as mudanças da equipe (segundos)
  INTERVALO: 30,
};
