/* Dados por defeito (usados quando o Firebase não está activo ou a colecção está vazia).
   Só contém factos confirmados em fontes públicas. Nada aqui é inventado. */
(function () {
  var S = function (q) { return "https://open.spotify.com/search/" + encodeURIComponent("Anderson Mário " + q); };
  var Y = function (q) { return "https://www.youtube.com/results?search_query=" + encodeURIComponent("Anderson Mário " + q); };

  window.DEFAULT_DATA = {
    settings: {
      heroImage: "",
      aboutImage: "",
      pressKit: "",
      bio: "Cantor angolano que mistura R&B, afrobeat e kizomba. Vencedor da 1.ª edição do Unitel Estrelas ao Palco, construiu a sua própria identidade artística e leva o som de Angola a palcos dentro e fora do país.",
      releaseTitle: "Novo álbum",
      releaseDate: "",
      releaseDesc: "Novas músicas e um novo álbum a caminho em 2026. Fica atento às novidades.",
      releaseLink: ""
    },

    songs: [
      { id: "d1", title: "Voltas", feat: "feat. Claudio Fênix", year: "", cover: "", spotify: S("Voltas"), youtube: Y("Voltas"), desc: "Kizomba" },
      { id: "d2", title: "Waka Waka", feat: "", year: "2024", cover: "", spotify: S("Waka Waka"), youtube: Y("Waka Waka"), desc: "Single" },
      { id: "d3", title: "Boss", feat: "", year: "2024", cover: "", spotify: S("Boss"), youtube: Y("Boss"), desc: "Single" },
      { id: "d4", title: "Marionete", feat: "com Damásio Brothers", year: "", cover: "", spotify: S("Marionete"), youtube: Y("Marionete"), desc: "Participação" }
    ],

    downloads: [
      { id: "dl1", title: "Ouvir no Spotify", desc: "Todo o catálogo oficial na plataforma.", url: "https://open.spotify.com/artist/1CS75XxFYNouLuB55te4YO", label: "Abrir Spotify" },
      { id: "dl2", title: "Ver no YouTube", desc: "Videoclipes, actuações e lançamentos.", url: "https://www.youtube.com/andersonmario", label: "Abrir YouTube" },
      { id: "dl3", title: "Downloads em MP3", desc: "Em breve: faixas e remixes para descarregar aqui.", url: "", label: "Em breve" }
    ],

    news: [
      { id: "n1", title: "Anderson Mário no júri do Estrelas ao Palco — Edição de Ouro", date: "2025-07-19", text: "O artista integrou o júri dos castings do Unitel Estrelas ao Palco, Edição de Ouro, ao lado de Jorge Antunes e Chetekela.", image: "", link: "https://www.verangola.net/va/pt/072025/eventos/45208/Estreia-da-emiss%C3%A3o-dos-castings-do-%E2%80%9CUnitel-Estrelas-ao-Palco-Edi%C3%A7%C3%A3o-de-Ouro%E2%80%9D-TVCinema.htm" },
      { id: "n2", title: "Novo álbum previsto para 2026", date: "", text: "Em entrevista ao Expansão, o cantor anunciou novas músicas e um novo álbum em 2026, com passagem pelo Huambo.", image: "", link: "https://expansao.co.ao/weekend/lifestyle/detalhe/eu-nao-sou-um-produto-de-concurso-de-musica-so-fui-conhecido-la-67074.html" }
    ],

    curiosities: [
      { id: "c1", title: "O som dele", text: "Ele próprio descreve a sua música como uma mistura de R&B, afrobeat e kizomba.", icon: "music" },
      { id: "c2", title: "Vencedor do Estrelas ao Palco", text: "Venceu a 1.ª edição do concurso de imitação musical Unitel Estrelas ao Palco.", icon: "trophy" },
      { id: "c3", title: "De imitador a Anderson Mário", text: "Ficou conhecido como intérprete que imitava Michael Jackson, e depois trabalhou para mostrar a sua própria identidade.", icon: "mic" },
      { id: "c4", title: "Dois álbuns, grandes palcos", text: "Destaca os seus dois álbuns e ter sido cabeça de cartaz em alguns dos maiores concertos de Angola.", icon: "disc" },
      { id: "c5", title: "Natural do Huambo", text: "Nascido em 1997 no Huambo. (A confirmar com o artista antes de publicar.)", icon: "pin" }
    ]
  };
})();
