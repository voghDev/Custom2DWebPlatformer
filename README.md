# Custom2DWebPlatformer

This project is a simple 2D platform game playable locally from the web browser. Fully based in Web technologies.

You can select your character and customize its face and aspect with the files found inside `characters/` folder.

<img width="793" height="444" alt="Captura de pantalla 2026-09-17 a las 16 26 58" src="https://github.com/user-attachments/assets/35aba2a5-5eb1-458a-b1f2-79313c98da9f" />

<img width="791" height="440" alt="Captura de pantalla 2026-09-18 a las 13 34 03" src="https://github.com/user-attachments/assets/05ad1551-f1d4-4276-af5f-291879e5dceb" />

## How to run

The game is plain HTML + JavaScript + Phaser (loaded from a CDN). There is no build step, but you do need to serve the files over HTTP — opening `index.html` directly with `file://` won't work because browsers block ES modules and `fetch()` on local files.

Pick any one of these from the project root:

**Python** (already installed on macOS/Linux):
```
python3 -m http.server 8000
```

**Node.js** (no install needed):
```
npx serve
```

**VS Code**: install the "Live Server" extension and click *Go Live*.

Then open the URL the server prints (e.g. `http://localhost:8000`).

## Controls

- **← →** or **A / D** — move
- **↑** or **SPACE** or **W** — jump
- **ESC** — quit to main menu
- **ENTER** — confirm menu selection

## Game flow

1. Main menu: `START GAME` or `OPTIONS` (options is a placeholder for now).
2. Character select: pick **male** or **female**.
3. Level 1: reach the red flag on the right. Stomp enemies from above, avoid side contact, and mind the pits.

## Customizing characters

The `characters/` folder ships with two defaults (`male.png`, `female.png`) that are tracked in git. Any other `.png` you drop in there stays local (ignored by git) — a good place for photos of your kids or friends.

Recommended format:
- **PNG** with **transparent background**
- Square canvas (e.g. 64×64 or 128×128)
- Lowercase filename, no spaces

## Customizing levels

Levels live in `levels/` as plain text files. Symbol legend:

| Char | Meaning        |
|------|----------------|
| `.`  | empty (sky)    |
| `X`  | solid ground   |
| `P`  | player spawn   |
| `E`  | enemy          |
| `G`  | goal (flag)    |

Files start with a small header, then `---`, then the ASCII grid:

```
name: Level 1
---
..................................................
..............XXXX.........XXXX...................
..................................................
.....XXXX...........XXXX.............XXXX........
..................................................
.P.......................E......................G.
XXXXXXXX....XXXXXXXX....XXXXXXXX....XXXXXXXXXXXXXX
XXXXXXXX....XXXXXXXX....XXXXXXXX....XXXXXXXXXXXXXX
```

## Project structure

```
index.html            entry point, boots Phaser
src/
  main.js             game config, scene registration
  levelLoader.js      parser for the .txt level format
  scenes/
    MenuScene.js
    OptionsScene.js
    CharacterSelectScene.js
    GameScene.js      loads the level and runs the platformer
characters/           character sprites (defaults tracked, rest ignored)
levels/               level files
```
