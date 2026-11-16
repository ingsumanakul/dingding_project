"""
Make small WebP copies of the artwork for the website.

Originals in jpg_and_gif/ and logos/ are only READ, never changed.
Output goes to thumbs/:

    thumbs/<id>-400.webp   grid tiles
    thumbs/<id>-800.webp   big 2x2 grid tiles
    thumbs/<id>-900.webp   popup / gacha reveal (before the GIF loads)
    thumbs/logo-dingding.webp, thumbs/logo-dingding-800.webp, thumbs/logo-inginge.webp
    thumbs/ding-normal.webp   the Ding Ding on Home and About (first frame of logos/ding_normal.gif)

It also makes the browser tab icons, in the project folder (next to index.html):

    favicon.ico (16/32/48), favicon-32.png, apple-touch-icon.png (180px)

Run from the project folder (needs Pillow: pip install Pillow):

    python3 tools/make_thumbs.py
"""
import os
from PIL import Image, ImageChops, ImageDraw, ImageFilter

SRC = 'jpg_and_gif'
OUT = 'thumbs'
SIZES = [400, 800, 900]
QUALITY = 82


HOME_CAT = 'logos/ding_normal.gif'
WHITE = 249   # anything this light in the GIF becomes pure white


def home_cat_box():
    """Crop box for the Home cat: a small margin at the top and sides,
    none at the bottom (the body runs off the bottom edge)."""
    with Image.open(HOME_CAT) as im:
        im.seek(0)
        not_white = im.convert('L').point(lambda v: 255 if v < 235 else 0)
        left, top, right, bottom = not_white.getbbox()
        m = 16
        return (max(0, left - m), max(0, top - m), min(im.width, right + m), im.height)


def make_favicons():
    """Browser tab icons: Ding Ding's head from logos/ding_normal.png."""
    with Image.open('logos/ding_normal.png') as im:
        im = im.convert('RGB')
    # A square as wide as the head, starting just above the ears.
    # (The head is wider than it is tall, so a little of the chest shows below the chin.)
    dark = im.convert('L').point(lambda v: 255 if v < 70 else 0)
    left, top, right, bottom = dark.getbbox()
    side = right - left
    top = max(0, min(top - 30, im.height - side))
    head = im.crop((left, top, right, top + side))

    # iPhone home screen: plain white square (iOS needs an opaque icon
    # and rounds the corners itself)
    head.resize((180, 180), Image.LANCZOS).save('apple-touch-icon.png')

    # Browser tabs: transparent background. Flood-fill the white around the
    # head from the top and side edges (never the bottom, where the white
    # chest touches the edge), so the white muzzle and chest stay.
    white = head.convert('L').point(lambda v: 255 if v > 235 else 0)
    # The outline has a tiny gap where the fill would leak into the chest,
    # so shrink the white a little first (this closes gaps narrower than SEAL).
    SEAL = 9
    sealed = white.filter(ImageFilter.MinFilter(SEAL))
    px = sealed.load()
    seeds = [(x, 0) for x in range(side)]
    for y in range(side):
        seeds += [(0, y), (side - 1, y)]
    for x, y in seeds:
        if px[x, y] == 255:
            ImageDraw.floodfill(sealed, (x, y), 128)
    # grow the filled area back to the real edge of the white background
    outside = sealed.point(lambda v: 255 if v == 128 else 0).filter(ImageFilter.MaxFilter(SEAL + 2))
    outside = ImageChops.multiply(outside, white)
    alpha = ImageChops.invert(outside)
    # pull the edge in a little (no white fringe), then soften it
    alpha = alpha.filter(ImageFilter.MinFilter(7)).filter(ImageFilter.GaussianBlur(2))
    cat = head.convert('RGBA')
    cat.putalpha(alpha)

    big = cat.resize((192, 192), Image.LANCZOS)
    big.resize((32, 32), Image.LANCZOS).save('favicon-32.png')
    big.save('favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])


def save_webp(im, width, path):
    copy = im.copy()
    copy.thumbnail((width, width * 10), Image.LANCZOS)
    copy.save(path, 'WEBP', quality=QUALITY, method=6)


def main():
    os.makedirs(OUT, exist_ok=True)
    count = 0
    for name in sorted(os.listdir(SRC)):
        stem, ext = os.path.splitext(name)
        if ext.lower() != '.jpg':
            continue
        with Image.open(os.path.join(SRC, name)) as im:
            im = im.convert('RGB')
            for w in SIZES:
                save_webp(im, w, os.path.join(OUT, f'{stem}-{w}.webp'))
        count += 1

    # Main logo: the file has a lot of empty space around the letters,
    # so the web copies are cropped to the letters plus a small margin.
    with Image.open('logos/logo_dingding2.png') as im:
        im = im.convert('RGBA')
        left, top, right, bottom = im.getbbox()
        m = 24
        im = im.crop((max(0, left - m), max(0, top - m), min(im.width, right + m), min(im.height, bottom + m)))
        save_webp(im, 480, os.path.join(OUT, 'logo-dingding.webp'))       # header, quiz card
        save_webp(im, 800, os.path.join(OUT, 'logo-dingding-800.webp'))   # big Home logo
    # Home / About Ding Ding: the first frame of the blinking GIF, cropped to
    # the cat. This is the poster for video/ding-normal.mp4 (tools/make_videos.py),
    # so both use the same crop (home_cat_box).
    with Image.open(HOME_CAT) as im:
        im.seek(0)
        im = im.convert('RGB').crop(home_cat_box())
        # the GIF background is a very light grey (251); make it pure white
        im = im.point(lambda v: min(255, round(v * 255 / WHITE)))
        save_webp(im, 720, os.path.join(OUT, 'ding-normal.webp'))
    with Image.open('logos/logo_inginge.jpg') as im:
        save_webp(im.convert('RGB'), 160, os.path.join(OUT, 'logo-inginge.webp'))

    make_favicons()
    print(f'{count} artworks -> {OUT}/, plus the favicons')


if __name__ == '__main__':
    main()
