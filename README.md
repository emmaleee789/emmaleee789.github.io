# emmaleee789.github.io

Personal academic website for Ziying (Emma) Li.

## Local preview

Open `index.html` in a browser, or run a local server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploying to GitHub Pages

1. Create a repository named `emmaleee789.github.io` on GitHub.
2. Push this folder to the `main` branch.
3. In the repository settings, set Pages to deploy from the root of `main`.

The `.nojekyll` file is already included so GitHub Pages serves the files as-is.

## Editing content

All content lives in `index.html`. Publication links currently point to `#` — replace them with real URLs. To add a headshot, place an image in `assets/` and add an `<img>` tag in the hero section.

## Icon

The site mark is a Brogadier **L**, used as the favicon (`assets/icons/favicon.svg`) and as a small house mark in the nav. PNG and ICO fallbacks live alongside it for older browsers and iOS home-screen icons.

## Fonts

Headings and the name use **Brogadier**, self-hosted from `assets/fonts/brogadier-regular.ttf` and declared via `@font-face`. Body text uses Inter from Google Fonts.

`assets/fonts/glycerints-regular.ttf` is also present but unused. To switch back, change the `@font-face` block and the `--font-display` value in `assets/css/style.css`, plus the preload link in `index.html`.

## Theme

The site supports light and dark mode. Colors and spacing are controlled by CSS custom properties in `assets/css/style.css`.
