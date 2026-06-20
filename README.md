# Dobble Trainer

A speed-training web app for the Dobble card game. Two cards are shown side by side — tap the symbol they share as fast as you can. The matched card slides to the other side, and a new card replaces it.

## Features

- **Stats bar** — live score, mistake count, accuracy %, cards per minute, and elapsed time
- **Pause** — click the stats bar to pause/resume the timer
- **Smooth animations** — matched card slides across to its new position
- **Responsive layout** — side-by-side on landscape, stacked on portrait/mobile
- **Image preloader** — all card images load upfront with a progress bar

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
