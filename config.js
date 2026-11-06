/* Talks Marketing · configuração
   ENDPOINT = link do "App da Web" do Google Apps Script (planilha da equipe).
   Enquanto estiver vazio, cada aparelho guarda as mudanças só para si
   (modo local). Passo a passo para ligar a sincronização: README.md. */
window.TM_CONFIG = {
  ENDPOINT: 'https://script.google.com/macros/s/AKfycbxwLEdzLVflL2I-Wd9GV7Xt3mjHu9k0Nq-VP4ck2lMdZtCzLpqaqQup1R93RlmHztY/exec',
  // de quanto em quanto tempo o app busca as mudanças da equipe (segundos)
  INTERVALO: 30,
};
