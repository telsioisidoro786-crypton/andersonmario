/* ============================================================
   CONFIGURAÇÃO DO SITE — Anderson Mário (proposta / demo)
   Para activar o painel e os dados dinâmicos:
   1) Cria um projecto no Firebase (Firestore + Authentication + Storage)
   2) Cola abaixo as credenciais da tua Web App
   3) Põe firebaseEnabled: true
   Enquanto estiver false, o site funciona com os dados de js/defaults.js
   ============================================================ */
window.SITE_CONFIG = {
  firebaseEnabled: false,
  firebase: {
    apiKey: "COLA_AQUI",
    authDomain: "COLA_AQUI.firebaseapp.com",
    projectId: "COLA_AQUI",
    storageBucket: "COLA_AQUI.appspot.com",
    messagingSenderId: "COLA_AQUI",
    appId: "COLA_AQUI"
  },

  // Se true, pede nome + WhatsApp antes de abrir um download (cria lista de fãs)
  downloadGate: false,

  // Redes oficiais (fornecidas por Telsio)
  social: {
    youtube:   "https://www.youtube.com/andersonmario",
    spotify:   "https://open.spotify.com/artist/1CS75XxFYNouLuB55te4YO",
    spotifyId: "1CS75XxFYNouLuB55te4YO",
    instagram: "https://www.instagram.com/iamandersonmario/",
    facebook:  "https://www.facebook.com/euandersonmario/",
    tiktok:    "https://www.tiktok.com/@anderson_mario"
  },

  // Contactos para espectáculos
  contact: {
    email: "shows@andersonmario.ao",
    phones: [
      { label: "Angola",   display: "+244 936 517 474", wa: "244936517474" },
      { label: "Portugal", display: "+351 915 208 575", wa: "351915208575" }
    ]
  }
};
