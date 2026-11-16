"""
Make the "locked" silhouette pictures for the Collection.

Originals in jpg_and_gif/ are only READ, never changed.
Output goes to thumbs/:

    thumbs/<id>-sil-400.webp   grid tiles
    thumbs/<id>-sil-800.webp   big 2x2 grid tiles and the popup
    thumbs/sil-sheet.jpg       contact sheet of all silhouettes, to spot bad ones

Run from the project folder (needs Pillow):

    python3 tools/make_silhouettes.py

How it works, for each artwork:
  1. Find the "ink": Ding Ding's thick black outlines and black fur.
  2. Flood-fill the background from the top and side edges. The fill goes
     through anything that is not ink, so hills, clouds and branches (which
     have no black outline) count as background. It stops at black outlines.
  3. Everything the fill could not reach is the shape. Narrow gaps (a whisker
     or a piece of yarn crossing the outline) are sealed and all holes are
     filled, so the shape is solid.
  4. Remove thin lines, then keep only the biggest shape that touches the
     bottom edge (that is Ding Ding). Loose objects are dropped.
  5. Smooth the edge and save: dark grey on the light grey tile colour.

If a silhouette still looks wrong, add its id to PLAIN below. It then gets
a plain Ding Ding silhouette (made from PLAIN_SOURCE) instead.
"""
import os
from PIL import Image, ImageChops, ImageDraw, ImageFilter

SRC = 'jpg_and_gif'
OUT = 'thumbs'
SIZE = 800                 # working size
BG = (242, 242, 240)       # light grey tile colour (same as --tile in the CSS)
INK = (44, 44, 44)         # silhouette colour
DARK = 70                  # pixels darker than this are "ink"
THIN = 7                   # lines thinner than this many pixels are removed
SEAL = 13                  # gaps narrower than this are sealed before filling holes

# Ids that get the plain silhouette instead of their own.
PLAIN = ['010', '013', '044', '046', '059', '063']
PLAIN_SOURCE = '041'       # a plain Ding Ding with no props


def background_colour(im):
    """The most common colour among four sample points near the edges."""
    w, h = im.size
    points = [(3, 3), (w - 4, 3), (3, int(h * 0.4)), (w - 4, int(h * 0.4))]
    colours = [im.getpixel(p) for p in points]

    def close(a, b):
        return all(abs(x - y) < 30 for x, y in zip(a, b))

    return max(colours, key=lambda c: sum(close(c, other) for other in colours))


def fill_holes(shape):
    """Seal narrow gaps, then fill every hole. 'L' image, 255 = shape."""
    # grow the shape so narrow gaps close up
    grown = shape.filter(ImageFilter.MaxFilter(SEAL))
    # flood the outside from the top and sides; what is not reached is inside
    px = grown.load()
    seeds = [(x, 0) for x in range(SIZE)]
    for y in range(int(SIZE * 0.6)):
        seeds += [(0, y), (SIZE - 1, y)]
    for x, y in seeds:
        if px[x, y] == 0:
            ImageDraw.floodfill(grown, (x, y), 128)
    solid = grown.point(lambda v: 0 if v == 128 else 255)
    # shrink back to the original outline (the filled holes stay filled)
    solid = solid.filter(ImageFilter.MinFilter(SEAL))
    return ImageChops.lighter(solid, shape)


def make_mask(path):
    """Returns an 'L' image: 255 = Ding Ding, 0 = background."""
    im = Image.open(path).convert('RGB').resize((SIZE, SIZE), Image.LANCZOS)
    grey = im.convert('L')
    bg = background_colour(im)
    bg_lum = 0.3 * bg[0] + 0.59 * bg[1] + 0.11 * bg[2]
    # On dark backgrounds the black cat is only a little darker than the
    # background, so use a threshold relative to the background.
    dark = bg_lum * 0.75 if bg_lum < 120 else DARK

    # 1. ink (slightly thickened, to close tiny gaps in the outline)
    ink = grey.point(lambda v: 255 if v < dark else 0).filter(ImageFilter.MaxFilter(3))

    # 2. flood the background: 255 = free, 0 = ink, 128 = reached by the flood
    free = ImageChops.invert(ink)
    px = free.load()
    rgb = im.load()

    def is_bg_seed(x, y):
        if px[x, y] != 255:
            return False
        r, g, b = rgb[x, y]
        return abs(r - bg[0]) < 22 and abs(g - bg[1]) < 22 and abs(b - bg[2]) < 22

    seeds = [(x, 0) for x in range(SIZE)]
    for y in range(int(SIZE * 0.6)):          # never the bottom: the body touches it
        seeds += [(0, y), (SIZE - 1, y)]
    for x, y in seeds:
        if is_bg_seed(x, y):
            ImageDraw.floodfill(free, (x, y), 128)

    # 3. the shape = everything the flood did not reach
    shape = free.point(lambda v: 0 if v == 128 else 255)
    shape = fill_holes(shape)

    # 4a. remove thin lines (erode, then grow back)
    shape = shape.filter(ImageFilter.MinFilter(THIN)).filter(ImageFilter.MaxFilter(THIN))

    # 4b. keep the biggest piece that touches the bottom edge
    #     (also looks a little higher: in 046 a strip of water covers the bottom)
    px = shape.load()
    best = None
    label = 1
    for y in (SIZE - 1, int(SIZE * 0.94), int(SIZE * 0.88)):
        for x in range(SIZE):
            if px[x, y] == 255 and label < 250:
                ImageDraw.floodfill(shape, (x, y), label)
                area = shape.histogram()[label]
                if best is None or area > best[1]:
                    best = (label, area)
                label += 1
    if best is None:
        return Image.new('L', (SIZE, SIZE), 0)
    keep = best[0]
    mask = shape.point(lambda v: 255 if v == keep else 0)

    # 5. smooth, anti-aliased edge
    mask = mask.filter(ImageFilter.GaussianBlur(3))
    mask = mask.point(lambda v: max(0, min(255, (v - 128) * 5 + 128)))
    return mask


def save(mask, stem):
    picture = Image.composite(Image.new('RGB', mask.size, INK),
                              Image.new('RGB', mask.size, BG), mask)
    picture.save(os.path.join(OUT, f'{stem}-sil-800.webp'), 'WEBP', quality=90, method=6)
    picture.resize((400, 400), Image.LANCZOS).save(
        os.path.join(OUT, f'{stem}-sil-400.webp'), 'WEBP', quality=90, method=6)
    return picture


def contact_sheet(pictures):
    """One picture with every silhouette and its id, to check them quickly."""
    cols, cell, label_h = 10, 150, 22
    rows = (len(pictures) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * cell, rows * (cell + label_h)), 'white')
    draw = ImageDraw.Draw(sheet)
    for i, (stem, picture, note) in enumerate(pictures):
        x, y = (i % cols) * cell, (i // cols) * (cell + label_h)
        sheet.paste(picture.resize((cell - 4, cell - 4), Image.LANCZOS), (x + 2, y + label_h))
        draw.text((x + 4, y + 5), stem + note, fill=(200, 0, 0))
    sheet.save(os.path.join(OUT, 'sil-sheet.jpg'), quality=88)


def main():
    os.makedirs(OUT, exist_ok=True)
    stems = sorted((os.path.splitext(n)[0] for n in os.listdir(SRC) if n.lower().endswith('.jpg')), key=int)
    plain = make_mask(os.path.join(SRC, PLAIN_SOURCE + '.jpg'))
    pictures = []
    for stem in stems:
        use_plain = stem in PLAIN
        mask = plain if use_plain else make_mask(os.path.join(SRC, stem + '.jpg'))
        area = round(100 * mask.histogram()[255] / (SIZE * SIZE))
        pictures.append((stem, save(mask, stem), ' (plain)' if use_plain else f' {area}%'))
    contact_sheet(pictures)
    print(f'{len(stems)} silhouettes -> {OUT}/ ({len(PLAIN)} plain). Check {OUT}/sil-sheet.jpg')


if __name__ == '__main__':
    main()
