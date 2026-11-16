# Ding Ding Website

A small, cute website for **Ding Ding**, a black-and-white cat character drawn by Ing.
Ding Ding has **no gender**: never use he/she/his/her (anywhere on the site, including `dingding.json`).
Every artwork is a **half-body** cat peeking up from the bottom edge of a square frame.

## Folders

```
ding_ding_project/
├── jpg_and_gif/   # ORIGINAL ARTWORK (.jpg stills only) — read only. The GIFs are kept outside this project.
├── logos/         # logo and heading images — read only
├── font/          # local font files (reference only, not used on the web)
├── design-ref/    # screenshots of websites Ing likes — look at these before designing
├── data/          # JSON (dingding.json, quiz.json)
├── thumbs/        # GENERATED small WebP copies of the artwork and logos (400 / 800 / 900px)
├── video/         # GENERATED MP4 + WebM animations (900px), made from the GIFs
├── tools/         # scripts that build thumbs/ and video/ (make_thumbs.py, make_videos.py)
└── site files     # index.html, css/, js/
```

## Hard rules

- **Never modify, move, rename, or delete anything in `jpg_and_gif/` or `logos/`.** Copy or reference only.
- Files with the same number are the same character: `jpg_and_gif/NN.jpg` = still image, `video/NN.mp4` + `video/NN.webm` = animated version (made from `NN.gif`, which lives outside this project).
- Ask before deleting any file, adding a dependency, or making large structural changes.
- Do not invent facts about the artworks (sale prices, dates, owners). If unsure, leave the field empty.

## Tech

- Plain static site: HTML + CSS + vanilla JavaScript. No framework, no build step.
- Must work on GitHub Pages: use **relative paths only**.
- Single page with hash navigation: `#home`, `#collection`, `#gacha`, `#quiz`, `#about`.
- Mobile-first and responsive. Test at 375px and 1280px widths.
- Show the still by default (WebP copies from `thumbs/`) and load the animation (`video/`) only on hover/tap, so the page stays light. Use `<video autoplay loop muted playsinline>` with the still as poster; if the video fails, the still stays. No GIFs on the site.
- After adding or changing artwork, rerun `tools/make_thumbs.py` and `tools/make_videos.py <folder with the GIFs>`.
- Save progress in `localStorage`. Wrap every read/write in `try/catch` and keep the site working if storage is unavailable.

## Languages

- English and Japanese only, with an EN / JA toggle. No Thai.
- Remember the chosen language in `localStorage`.
- Japanese should sound natural and cute, not a literal translation.

## Fonts (Google Fonts, SIL OFL 1.1)

- **Yusei Magic** for headings, buttons, and labels.
- **Yomogi** for body text.
- Use images from `logos/` for the main logo and headings when available.

## Design

- Clean, minimal, cute illustration website. See `design-ref/`.
- White background, generous whitespace, the artwork is the hero.
- Image grid with light grey tiles and thin, even gaps.
- Small, light navigation text. Limited colours, taken from the artwork.
- No heavy shadows, gradients, or busy decorations. Gentle motion only (soft fades, small bounces).
- Reference mapping (see design-ref/):
  Home and gacha reveal → the "Apple" page (big handwritten title, one image, lots of space)
  Collection → "essence of life" (light grey tile grid, mixed tile sizes)
  Quiz result card and buttons → Growwwkit (labelled cards, black pill buttons)
  About → Sally Payne ("Hello!" section)

## Data: `data/dingding.json`

One entry per character:

```json
{
  "id": "04",
  "name": { "en": "", "ja": "" },
  "description": { "en": "", "ja": "" },
  "category": ""
}
```

- `category`: one of the approved categories: `food`, `music`, `outfit`, `seasonal`, `spooky`, `love`, `daily`, `other`.
- Thumbnail and video paths are derived from the `id` in code (`thumbs/<id>-400.webp`, `video/<id>.mp4`), so they are not stored in the JSON.
- All pieces are drawn by Ing. There are no collaborations and no `credit` field.

## Pages

1. **Home**: big logo and tagline, then the blinking Ding Ding (`logos/ding_normal.gif`, just the cat on white) peeking up from behind a thin line (the "counter edge"), with three text links underneath to Collection / Gacha / Quiz. The logo and the cat are the hero; the links are secondary and show small grey hints (collected count, "Try your luck!", "Which one are you?"). No boxes.
2. **Collection**: grid of all characters, filter by category, animation on hover (desktop) or in the popup (mobile tap), detail popup (not a separate page). Shows collection progress, e.g. "12 / 65 collected".
3. **Gacha**: spin a capsule machine, the capsule opens and reveals a Ding Ding.
   - **No daily limit**, and repeats are allowed. A repeat shows "Hello again!" instead of "NEW!".
   - Picking is random: a Ding Ding not collected yet is twice as likely as one already collected. There is no rarity.
   - Unlocked characters appear in colour in the Collection; locked ones show as a dark silhouette.
4. **Quiz**: "Which Ding Ding are you?" About 5 questions, the result is one character, with a button to save the result as a PNG card.
5. **About**: big handwritten "Hello!" / "こんにちは！", short centred text about Ding Ding and the artist, two small groups of text links (Ding Ding: Instagram, Facebook; Ing: Instagram, Facebook, Linktree) opening in a new tab, and Ding Ding peeking up from the footer line. No X/Twitter links anywhere.

## Workflow

- Work in small steps and show Ing the result after each step.
- After any UI change, open the site, take screenshots (mobile and desktop), compare with `design-ref/`, and fix issues before reporting back.
- Keep code simple and readable. Ing is an engineer and may edit it herself.
