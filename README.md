# I Love My Country — React version

This is a React (Vite) port of the original static HTML/CSS/JS "ilovemycountry" site.
Instead of ~190 near-duplicate `.html` files (one per country), the app now has
3 real pages plus one data file:

- `src/pages/Home.jsx` — landing page with the country dropdown (was `index.html`)
- `src/pages/CountryPage.jsx` — the upload/zoom/crop editor, driven by the `:country`
  route param (was `afghanistan.html`, `france.html`, `usa.html`, ... — all 190 pages)
- `src/pages/DonePage.jsx` — merges your cropped photo with the country's flag frames
  and lets you download them (was `done.html`)
- `src/data/countries.js` — the list of 192 countries (slug + display name), generated
  from the original file names

All the original behavior is preserved: uploading a photo, pinch/scroll to zoom,
drag to reposition, "Add frame" crops the photo to the frame area, and the results
page composites the crop with each country's `01/02/03` frame PNGs for download.
The GitHub-avatar popup (present in the markup but never wired up in the original
`script.js`) has been implemented for real: enter a GitHub username and it fetches
`https://github.com/<username>.png` to use as the source photo.

All original images and fonts live in `public/` and are referenced the same way the
original pages referenced them (e.g. `/france001.png`, `/france01.png`, `/Sketchy.ttf`).

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build      # production build into dist/
npm run preview    # preview the production build
```

## Routing

- `/` — home / country picker
- `/:country` — country editor page, e.g. `/france`, `/usa`, `/south-africa`
- `/done?country=<slug>` — results/download page

Country slugs match the original file names (`south-africa`, `usa`, `united-kingdom`,
`brunei-darussalam`, etc.) — see `src/data/countries.js` for the full list.
