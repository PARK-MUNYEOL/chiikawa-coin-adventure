# Project: Chiikawa Coin Adventure

This is an existing playable Korean-language browser game. Read README.md before editing. Reply to the user in Korean.

## Run and validate

- No package installation or build is needed.
- Run `node server.cjs` and open http://127.0.0.1:4173.
- If port 4173 already serves this project, reuse it. Do not terminate unrelated processes.
- Run `node test-game.cjs` after gameplay changes.
- Open `dist/index.html` directly for a server-free preview.

## Current architecture

Scripts load in this order: `dist/game.js`, `dist/visuals.js`, `dist/adventure.js`, `dist/sprites.js`.
They share globals; later scripts override some earlier functions. Preserve load order until deliberately refactoring and verifying it.

- game.js: base game loop, controls, rendering helpers.
- visuals.js: four scenery chapters and story banners, vector character fallback.
- adventure.js: active gameplay rules, health, stages, items, collision, combos, completion.
- sprites.js: image sprite selection and animation.
- hero-sprites-v1.png: transparent 3-column, 2-row sheet with six poses.
- server.cjs: localhost-only static server with explicit asset allowlist. Add new assets here when needed.
- test-game.cjs: Node VM regression checks; rendering is mocked, so it does not replace visual browser checks.

## Preserve these mechanics

Two jumps maximum; 3 health; 4 stages of 30 seconds; finish at 120 seconds.
Normal coin 10, star 100, rainbow 300 before combo multipliers.
Rainbow grants 5 seconds of fast flight, immediate immunity, and coin attraction.
Shield absorbs one hit, magnet lasts 7 seconds, hearts restore one health up to 3.
Damage cooldown prevents repeated hits. Pause freezes all gameplay timers.
Restart clears all temporary effects. Keep the Korean UI and keyboard/touch controls.

## Suggested next work

First inspect and explain the shared-global/function-override structure. Then improve character state handling and object animation in small verified steps.
Keep the original sprite sheet; save generated replacements under new versioned names.
Do not commit or push unless the user requests it. Never put tokens or account credentials in project files.

GitHub: https://github.com/PARK-MUNYEOL/chiikawa-coin-adventure
