/* ============================================================
   CONFIGURAÇÃO DO SITE — Anderson Mário (proposta / demo)
   Para activar o painel e os dados dinâmicos:
   1) Cria um projecto no Firebase (Firestore + Authentication + Storage)
   2) Cola abaixo as credenciais da tua Web App
   3) Põe firebaseEnabled: true
   Enquanto estiver false, o site funciona com os dados de js/defaults.js
   ============================================================ */
window.SITE_CONFIG = {
  firebaseEnabled: true,
  firebase: {
    apiKey: "AIzaSyBbBMT3i_yrFwOiEJzctkVw2IKnu020l3U",
    authDomain: "andersonmario-646de.firebaseapp.com",
    projectId: "andersonmario-646de",
    storageBucket: "andersonmario-646de.firebasestorage.app",
    messagingSenderId: "1080515138524",
    appId: "1:1080515138524:web:a78f7fe16a77e0af1f7519"
  },


  // Firebase Storage exige o plano Blaze (cartão). Deixa false para usar links
  // de imagem ou ficheiros na pasta img/ (ex.: img/foto1.jpg). Põe true só se activares o Storage.
  useStorage: false,

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
