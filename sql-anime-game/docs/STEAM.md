# Publicar o Sakura Query na Steam

Este é um roteiro prático. Os valores e prazos da Steam mudam, então confira sempre a
[documentação do Steamworks](https://partner.steamgames.com/doc/home).

## 1. Antes de tudo: o que trocar no jogo

A versão atual é jogável, mas algumas partes são provisórias:

- **Arte das personagens.** Hana e Rei estão desenhadas em SVG pelo código. Para vender na Steam,
  vale encomendar sprites de verdade (corpo inteiro, 5 a 7 expressões cada) e fundos (sala, biblioteca,
  corredor). Ilustradores no Skeb, VGen, ArtStation ou Fiverr costumam fazer esse tipo de pacote.
  Guarde por escrito a **licença de uso comercial** de toda arte e música.
  Para trocar: coloque as imagens em `src/assets/` e mude `Characters.draw()` em `src/js/characters.js`
  para devolver um `<img>` com o arquivo da expressão.
- **Música.** A trilha atual é gerada pelo código. Uma trilha lo-fi licenciada deixa o jogo bem melhor.
- **Fontes.** O jogo usa as fontes do sistema. Se quiser uma fonte própria, coloque o arquivo em
  `src/assets/` (não carregue da internet: o jogo precisa funcionar offline).
- **Ícone** do executável (`build/icon.ico` para Windows, 256×256) e o `appId` em `package.json`.
- Não use nomes, personagens ou arte de outros jogos ou animes. Tudo aqui é original; mantenha assim.

## 2. Conta de desenvolvedor

1. Crie a conta em <https://partner.steamgames.com> e preencha os dados fiscais e bancários.
2. Pague a taxa do **Steam Direct** (US$ 100 por jogo, devolvida depois de US$ 1.000 em vendas).
3. Você recebe um **App ID**. Passe a usar esse número.

## 3. Página da loja ("Em breve")

Abra a página o quanto antes para juntar **listas de desejos**.

- Cápsulas (imagens da loja) nos tamanhos que o Steamworks pede, pelo menos 5 capturas de tela 1920×1080 e um trailer curto.
- Descrição em PT e EN. Marque os idiomas: interface e legendas em Português (Brasil) e Inglês.
- Tags sugeridas: *Educacional*, *Visual Novel*, *Anime*, *Programação*, *Quebra-cabeça*, *Casual*.
- A Valve revisa a página antes de publicar (alguns dias).

## 4. Integração com a Steam (conquistas)

O jogo já chama `window.desktop.unlockAchievement(id)` sempre que uma conquista é liberada.
Para ligar isso à Steam:

```bash
npm install steamworks.js
```

Em `main.js`:

```js
const steamworks = require('steamworks.js');
const steam = steamworks.init(SEU_APP_ID);
ipcMain.on('steam:achievement', (_e, id) => steam.achievement.activate(id));
```

Crie no Steamworks as conquistas com os **mesmos IDs** de `ACHIEVEMENTS` em `src/js/content.js`
(`first_query`, `first_correct`, `no_hints`, `m1` ... `m5`, `sql_error`, `playground`).
Para testar fora da Steam, crie um `steam_appid.txt` com o App ID ao lado do executável.

Opcional: **Steam Cloud** para o save. O save fica no `localStorage` do Electron
(pasta de dados do usuário). Dá para ligar o Auto-Cloud no Steamworks apontando para essa pasta.

## 5. Gerar e enviar a build

```bash
npm run dist:win
```

O executável fica em `dist/win-unpacked/`. Envie essa pasta com o **SteamPipe** (ferramenta `steamcmd`
do SDK do Steamworks) para um depot do Windows. Faça o mesmo com Linux se quiser marcar suporte ao Steam Deck.

## 6. Revisão e lançamento

1. Peça a revisão da build no Steamworks.
2. Distribua chaves de teste para amigos e confira tudo no cliente da Steam.
3. Escolha preço (jogos educativos pequenos costumam ficar entre US$ 4,99 e US$ 9,99) e data de lançamento.
4. Considere lançar uma **demo grátis** com o Módulo 1 e participar do **Steam Next Fest** para ganhar visibilidade.

## Ideias para depois do lançamento

- Mais módulos: `INSERT`/`UPDATE`/`DELETE`, transações, índices, criação de tabelas.
- Casos extras opcionais com um banco novo (por exemplo, uma loja de mangá).
- Mais línguas (espanhol tem bastante público na Steam).
