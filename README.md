# Site — Anderson Mário (proposta / demo)

Site estático (HTML, CSS, JavaScript) com painel de administração em Firebase.
Desenvolvido como proposta pela Nexora Systems. Não é o site oficial do artista.

## Ver já (sem Firebase)

```bash
cd anderson-mario-site
python3 -m http.server 8080      # ou: npx serve
```

Abre http://localhost:8080. Com `firebaseEnabled: false` (em `js/config.js`) o site
usa os dados de `js/defaults.js`. O painel (`/admin.html`) só funciona com Firebase.

## Activar o painel (Firebase)

1. Firebase Console → novo projecto → **Authentication** (e-mail/palavra-passe),
   **Firestore** e **Storage**.
2. Em Authentication, cria o utilizador do Anderson/equipa.
3. Em Definições do projecto → Web App, copia as credenciais para `js/config.js`
   e põe `firebaseEnabled: true`.
4. Cola `firestore.rules` em Firestore → Regras e `storage.rules` em Storage → Regras.
   **Substitui `ADMIN@EXEMPLO.COM` pelo e-mail real do admin** (sem isto ninguém consegue escrever).
5. Entra em `/admin.html` e começa a adicionar músicas, novidades, fotos, etc.

## Publicar

Vercel ou Netlify: arrasta a pasta (não precisa de build). `admin.html` tem `noindex`.

## O que o painel gere

Músicas, Downloads, Novidades, Curiosidades, Site & Lançamento (bio, foto principal,
press kit, data do próximo lançamento com contagem decrescente), Pedidos de show
e Contactos de fãs (leitura + botão de WhatsApp).

## Downloads com registo de fãs

Em `js/config.js` põe `downloadGate: true`: antes de abrir um ficheiro, o visitante
deixa nome e WhatsApp (guardados em "Contactos de fãs").

## Antes de publicar, confirmar com o artista

- Ano e local de nascimento (1997, Huambo) e se pode aparecer no site.
- Lista completa de músicas, capas e links directos (os botões Spotify/YouTube das
  músicas abrem uma pesquisa; substitui pelos links directos no painel).
- E-mail e telefones de `config.js` (vieram do Telsio / diretório público).
- Fotos oficiais (o site não inclui fotos; o artista envia as dele pelo painel).
- "+1M seguidores" e "2 álbuns" na página inicial: valores públicos aproximados.
- Se o site passar a ser oficial, remover a nota de "proposta" do rodapé.
