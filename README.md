# Dobble Trainer

A speed-training web app for the Dobble card game. Two cards are shown side by side — tap the symbol they share as fast as you can. The matched card slides to the other side, and a new card replaces it. A two-player mode turns it into a head-to-head race on a single phone.

## Features

- **Single-player training** — race against yourself with a full stats bar
- **Two-player mode** — a head-to-head match on one device, ideal for mobile (see below)
- **Mode toggle** — the square button in the top-right corner switches between one and two players (and shows the icon for the mode you'll switch to)
- **Stats bar** — live score, mistake count, accuracy %, cards per minute, and elapsed time
- **Pause** — click the stats bar to pause/resume the timer
- **Smooth animations** — matched card slides across to its new position
- **Responsive layout** — side-by-side on landscape, stacked on portrait/mobile
- **Image preloader** — all card images load upfront with a progress bar
- **Offline-ready (PWA)** — a service worker precaches the app and every card image on first visit, so after that the game runs with no network. Installable to home screen/desktop.

## Two-player mode

Designed for two people sharing one phone in portrait orientation. The cards stack vertically, with **Player 1 at the bottom** (the default screen orientation) and **Player 2 at the top**, whose score bar is rotated 180° to read right-way-up from their side.

Each player taps the matching symbol on the card nearest them. A correct tap scores **+1** and triggers the slide animation, revealing a fresh card; a wrong tap costs **−1** (never below zero). The first player to reach the target score (**10** by default, set by `WIN_SCORE` in `src/App.vue`) wins, and a winner overlay offers a quick rematch.

## Tech stack

Vue 3 + Vite, no additional UI framework.

## Development

```bash
npm install
npm run dev
```

## Build & deploy

```bash
npm run build   # outputs to dist/
```

The app is containerized (see `Dockerfile`) and deployed on [Fly.io](https://fly.io) via `fly.toml`.
