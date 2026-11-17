# DING DING Website

A small, cute website for **DING DING**, a black-and-white cat character drawn by Ing.
DING DING has **no gender**: never use he/she/his/her (anywhere on the site, including `dingding.json`).
Every artwork is a **half-body** cat peeking up from the bottom edge of a square frame.

## Folders

```
ding_ding_project/
├── jpg_and_gif/   # ORIGINAL ARTWORK (.jpg stills only) — read only. The GIFs are kept outside this project.
├── logos/         # logo and heading images — read only
├── font/          # local font files (reference only, not used on the web)
├── design-ref/    # screenshots of websites Ing likes — look at these before designing
├── data/          # JSON (dingding.json, quiz.json)
├── thumbs/        # GENERATED small WebP copies of the artwork, logos and reward art (400 / 800 / 900px)
├── video/         # GENERATED MP4 + WebM animations (900px), made from the GIFs (and logos/winner.gif)
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
- Show the still by default (WebP copies from `thumbs/`) and load the animation (`video/`) only on hover/tap, so the page stays light. Use `<video autoplay loop muted playsinline>` with the still as poster; if the video fails, the still stays. `js/motion.js` also restarts a video on `ended` (some iPhones ignore `loop`), and if `play()` is blocked (e.g. Low Power Mode) it shows the still with a small round play button. No GIFs on the site.
- After adding or changing artwork, rerun `tools/make_thumbs.py` and `tools/make_videos.py <folder with the GIFs>`.
- Saving a card (quiz result, certificate) goes through `js/share.js` and must never fail silently: the share sheet when `navigator.canShare({ files })` is true, else a download (`<a download>`), and if that can't run (or the card can't be made) a full-screen view of the card with "Press and hold the image to save". In in-app browsers (Instagram, Facebook, LINE: `Share.isInApp()`), it goes straight to the full-screen view, and a small dismissible banner at the top says "For the best experience, open in your browser" (closed once = closed for good, `dd.inappBanner`).
- Save progress in `localStorage`. Wrap every read/write in `try/catch` and keep the site working if storage is unavailable.

## Languages

- English, Thai and Japanese. The toggle shows **EN / TH / JP**.
- Language codes in the code are the standard ones: `en`, `th`, `ja` (`data-lang`, `<html lang>`, the keys in `i18n.js` and the JSON, the saved setting). Only the button label says "JP".
- First visit: follow the browser's main language (`th…` → Thai, `ja…` → Japanese, anything else → English). After that, remember the chosen language in `localStorage`.
- The name: **DING DING** (all caps) in English, ดิงดิง in Thai, ディンディン in Japanese. The link group titles and the footer stay in English in every language.
- Thai and Japanese should sound natural, playful and cute, not like a literal translation. In Thai, never use gendered particles or pronouns for DING DING (no ครับ/ค่ะ, no เขา/เธอ for DING DING).
- Every text needs all three languages: UI text in `js/i18n.js`, names and descriptions in `data/dingding.json`, questions and answers in `data/quiz.json`.
- Thai line breaking: Thai has no spaces between words, and the browser's dictionary does not know some words (our name, loanwords like ทาโกะยากิ), so it can cut them in half. Words in `THAI_KEEP` in `js/i18n.js` are kept together automatically (invisible word joiners are added when the text loads; the JSON stays plain). If a Thai word breaks badly, add it there. The joiners must never reach a `<canvas>`: use `I18n.plain()` for any drawn text, and `I18n.fontsReady()` to wait for the fonts before drawing (quiz card, certificate). Thai paragraphs use `text-wrap: balance`, so no short word is left alone on a line.

## Fonts (Google Fonts, SIL OFL 1.1)

- **Yusei Magic** for headings, buttons, and labels (English and Japanese).
- **Yomogi** for body text (English and Japanese).
- **Mali** for all Thai text, headings (weight 600) and body (400). It is only downloaded when Thai is shown (`js/i18n.js` adds the stylesheet link), and the quiz story card uses it too.
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
  "name": { "en": "", "th": "", "ja": "" },
  "description": { "en": "", "th": "", "ja": "" },
  "category": "",
  "rarity": ""
}
```

- `category`: one of the approved categories: `food`, `music`, `outfit`, `seasonal`, `spooky`, `love`, `daily`, `other` (plus `secret`, only for the Secret).
- `rarity`: the gacha tier, set mostly by category. The badge is shown on unlocked tiles, in the popup and in the gacha reveal:
  - `common` (no badge): food, daily, outfit, other, love
  - `rare` (badge "R"): music and seasonal, except the 4 Legend pieces
  - `super-rare` (badge "SR"): spooky, plus the 4 Legend pieces `067`, `068`, `069`, `070`
  - `secret` (badge "SECRET"): only the Secret
- Thumbnail and video paths are derived from the `id` in code (`thumbs/<id>-400.webp`, `video/<id>.mp4`), so they are not stored in the JSON.
- **The Secret** is the last entry: id `000`, "Just DING DING", category and rarity `secret`. It is the plain blinking DING DING from Home, so it has one extra field, `"media": "ding-normal"`, and uses `thumbs/ding-normal.webp` and `video/ding-normal.mp4/.webm` instead of files named after its id. It has no silhouette.
- All pieces are drawn by Ing. There are no collaborations and no `credit` field.

## Pages

1. **Home**: big logo and tagline, then the blinking DING DING (`logos/ding_normal.gif`, just the cat on white) peeking up from behind a thin line (the "counter edge"), with three text links underneath to Collection / Gacha / Quiz. The logo and the cat are the hero; the links are secondary and show small grey hints (collected count, "Try your luck!", "Which one are you?"). No boxes.
2. **Collection**: grid of all characters, filter by category, animation on hover (desktop) or in the popup (mobile tap), detail popup (not a separate page). Shows collection progress.
   - Unlocked tiles, the popup and the gacha reveal show a rarity sticker badge (R / SR / SECRET, none for Common) in the top-right corner, in Yusei Magic, slightly tilted: R white, SR eye yellow (both with a thick black outline), SECRET black with shimmering gold letters.
   - The Secret never appears (no tile, no silhouette, not counted) until it is found. Progress reads "12 / 67 + ???" before, and "13 / 68" after. The "Secret" filter chip is only added once it is found.
   - Once found, the Secret is not in the grid: it sits alone at the very bottom of the Collection, below the grid, on plain white with lots of space (`#secret-spot`). It shows with the "All" and "Secret" filters.
   - At the very bottom (after the grid and `#secret-spot`), a small grey note in footer style: "Your collection is saved in this browser on this device." (`collection.saved`).
3. **Gacha**: spin a capsule machine, the capsule opens and reveals a DING DING.
   - **No daily limit**, and repeats are allowed. A repeat shows "Hello again!" instead of "NEW!".
   - Each spin first picks a tier, then a piece in that tier: Common 65%, Rare 20%, Super Rare 13%, Secret 2% (`ODDS` in `js/gacha.js`). Inside the tier, a DING DING not collected yet is 10× as likely as one already collected (`NEW_WEIGHT`), so repeats still happen, just less often.
   - Target: a full collection in about 100–150 spins. Simulated (2,000 full collections): average about 115 spins, 90% finish within about 145. Re-check this if the odds or the number of pieces change.
   - Reveal effects: Common is plain; Rare has sparkles; Super Rare has sparkles, a gold glow, and the capsule shakes hard before it opens; the Secret shakes hard too, then the screen goes dark and two yellow eyes blink before the reveal, with a black "SECRET!" / 「シークレット！」 / "ตัวลับ!" badge. The capsule colour hints at the tier.
   - Unlocked characters appear in colour in the Collection; locked ones show as a dark silhouette.
4. **Reward for collecting everything** (`js/reward.js`): when the last of the 68 (including the Secret) is unlocked, after its normal reveal:
   - A full-screen celebration: confetti, the winner animation (`logos/winner.gif` → `video/winner.*`, still `thumbs/winner-*.webp` from `logos/winner.png`) in a card in the middle, all 68 DING DINGs popping in around it, and "COMPLETE!" / 「コンプリート！」 / "ครบแล้ว!". The winner art is a reward only, never a collectible, so it is not in `dingding.json`.
   - The completion date is saved once, when it happens (`dd.completed`, "YYYY-MM-DD"). It is shown in the player's language (Thai uses the Buddhist year).
   - A certificate, a 1080×1920 Instagram Story PNG with the same safe area as the quiz card: the winner picture, "DING DING MASTER" / 「ディンディンマスター」 / "นักสะสมดิงดิง", the player's name (typed in the certificate popup, remembered in `dd.player`), the completion date, a 17×4 grid of all 68 pieces, and "© DING DING THE CAT by INGINGE DESIGN". It uses the same save/share button as the quiz (`js/share.js`).
   - After completion, the Collection shows a COMPLETE! badge next to the progress and a "Certificate" button to open it again anytime.
5. **Quiz**: "Which DING DING are you?" About 5 questions, the result is one character (never the Secret), with a button to save the result as a PNG story card (white, 1080×1920, inside the 250px safe area, with the DING DING logo and "@dingding.thecat by @inginge.design" and the quiz link "ingsumanakul.github.io/dingding_project/#quiz" at the bottom). People post this card in Instagram "Add Yours".
   - Opening or leaving the Quiz page always goes back to the start screen (half-done answers are dropped). If a result was saved before, the start screen shows a small "See my last result" / 「前回の結果を見る」 / "ดูผลครั้งที่แล้ว" link that opens it.
6. **About**: big handwritten "Hello!" / "こんにちは！", short centred text about DING DING and the artist, two small groups of text links ("DING DING THE CAT": Instagram, Facebook; "INGINGE DESIGN": Instagram, Facebook, Linktree) opening in a new tab, and DING DING peeking up from the footer line. No X/Twitter links anywhere. Footer (all languages): "© DING DING THE CAT by INGINGE DESIGN".
   - On the About page only, the footer also has a small "Found a bug? Tell us" / "เจอ bug? แจ้งเราได้เลย" / 「バグを見つけたら教えてね」 link (`js/bug.js`). The site has no server, so it opens the @dingding.thecat Instagram DM (`ig.me/m/dingding.thecat`) and first copies a short report (the page they came from, language, collected count, screen size, browser, time) for them to paste. In Thai, "bug" stays in English.

## Workflow

- Work in small steps and show Ing the result after each step.
- After any UI change, open the site, take screenshots (mobile and desktop), compare with `design-ref/`, and fix issues before reporting back.
- Keep code simple and readable. Ing is an engineer and may edit it herself.
