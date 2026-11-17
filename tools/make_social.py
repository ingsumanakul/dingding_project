"""
Make the images for the launch post on Instagram / Facebook (4:5, 1080 x 1350).

The logos in logos/ are only READ, never changed. Output goes to social/
(not part of the website, and not uploaded: social/ is in .gitignore):

    social/01-cover.png             big DING DING logo + DING DING peeking over a thin line
    social/05-dingding.png          DING DING, small, peeking over a thin line, the logo under it, lots of white

Run from the project folder (needs Pillow):

    python3 tools/make_social.py
"""
import os
from PIL import Image, ImageDraw

OUT = 'social'
W, H = 1080, 1350          # Instagram portrait post (4:5)
INK = (31, 31, 31)         # --ink in the CSS
WHITE = (255, 255, 255)


def load_logo():
    """The DING DING lettering, cropped to the letters."""
    im = Image.open('logos/logo_dingding2.png').convert('RGBA')
    return im.crop(im.getbbox())


def load_cat():
    """DING DING (logos/ding_normal.png), cropped to the cat. The body runs off the bottom."""
    im = Image.open('logos/ding_normal.png').convert('RGBA')
    dark = im.convert('L').point(lambda v: 255 if v < 235 else 0)
    left, top, right, _ = dark.getbbox()
    return im.crop((left, top, right, im.height))


def load_inginge():
    """INGINGE DESIGN logo: crop inside its thin frame, make the light grey paper pure white."""
    im = Image.open('logos/logo_inginge.jpg').convert('RGB')
    im = im.crop((8, 8, im.width - 8, im.height - 8))
    im = im.point(lambda v: min(255, round(v * 255 / 245)))
    dark = im.convert('L').point(lambda v: 255 if v < 200 else 0)
    return im.crop(dark.getbbox())


def fit_width(im, width):
    return im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)


def fit_height(im, height):
    return im.resize((round(im.width * height / im.height), height), Image.LANCZOS)


def paste(page, im, x, y):
    """Paste centred on x, with y = top."""
    x = round(x - im.width / 2)
    if im.mode == 'RGBA':
        page.paste(im, (x, round(y)), im)
    else:
        page.paste(im, (x, round(y)))


def counter_line(page, cx, y, width, thickness=4):
    ImageDraw.Draw(page).rectangle(
        [round(cx - width / 2), round(y), round(cx + width / 2), round(y + thickness - 1)], fill=INK)


def cover():
    page = Image.new('RGB', (W, H), WHITE)
    logo = fit_width(load_logo(), 860)
    cat = fit_width(load_cat(), 620)
    gap = 120
    top = (H - (logo.height + gap + cat.height)) / 2
    paste(page, logo, W / 2, top)
    cat_y = top + logo.height + gap
    paste(page, cat, W / 2, cat_y)
    counter_line(page, W / 2, cat_y + cat.height - 2, 760)   # the "counter edge", like on Home
    return page


def just_dingding():
    """DING DING, small, peeking over a thin line, with the logo under it, on a white page."""
    page = Image.new('RGB', (W, H), WHITE)
    cat = fit_width(load_cat(), 240)
    logo = fit_width(load_logo(), 260)
    gap = 34
    top = (H - (cat.height + gap + logo.height)) / 2
    paste(page, cat, W / 2, top)
    counter_line(page, W / 2, top + cat.height - 2, 300, 3)
    paste(page, logo, W / 2, top + cat.height + gap)
    return page


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, make in [('01-cover', cover), ('05-dingding', just_dingding)]:
        path = os.path.join(OUT, name + '.png')
        make().save(path)
        print('made', path)


if __name__ == '__main__':
    main()
