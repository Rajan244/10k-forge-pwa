# 10K Forge PWA

Mobile-first Svelte 5 + Vite + TypeScript PWA for 10K race preparation.

## Run

```bash
npm install
npm run dev
```

## Production check

```bash
npm run check
npm run build
npm run preview
```

## Data safety

The app stores data locally in IndexedDB. A normal phone restart/switch-off should not delete data. In Settings, use **Protect app storage** to request persistent browser storage. Still export backups regularly before browser resets, phone changes, cache cleaners, or reinstalling.

## What v2 adds

- Migration-safe local database layer. New exercises/sessions merge into existing saved app data without wiping logs.
- Body profile: 78kg default, desk/IT lifestyle, partially healthy diet, low stamina baseline.
- Exercise-level targets: beginner, improver, intermediate, advanced.
- Dashboard target cards: current achievement vs target.
- Expected 10K guidance based on recent run logs and longest run.
- Post-race target plan generator in Settings.
- Expanded exercise database for future beginner/improver/intermediate/advanced allocation.

## Adding tutorial media

Add media under:

```txt
public/tutorials/exercises/<exercise-slug>/main.webp
public/tutorials/exercises/<exercise-slug>/main.mp4
```

Then update the exercise in:

```txt
src/data/seed.ts
```

Example:

```ts
ex(..., { image: '/tutorials/exercises/goblet-squat/main.webp', video: '/tutorials/exercises/goblet-squat/main.mp4' })
```

The app shows the Help/View form guide button only when the exercise has tutorial media.
