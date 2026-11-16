"""
Make light video copies of the GIFs for the website.

The GIFs live OUTSIDE this project (they are too heavy for the website).
Give the folder that holds them (04.gif, 06.gif, ...) as the argument.
The GIFs are only READ, never changed. Output goes to video/:

    video/<id>.mp4    H.264, 900px wide, no sound, loops in the browser
    video/<id>.webm   VP9,   900px wide, no sound

It also converts the blinking Ding Ding for Home and About, which stays
inside the project (logos/ding_normal.gif):

    video/ding-normal.mp4 / .webm   720px wide, cropped to the cat, white background.
                                    Eyes stay open for HOME_CAT_HOLD seconds, then
                                    the blink plays at the GIF's own speed.

Needs Pillow and ffmpeg (for example: brew install ffmpeg).
Run from the project folder:

    python3 tools/make_videos.py ~/path/to/gifs          # only new or changed GIFs
    python3 tools/make_videos.py ~/path/to/gifs --all    # redo everything
    python3 tools/make_videos.py                         # only the Home / About cat

If ffmpeg is not on your PATH, point to it:

    FFMPEG=/path/to/ffmpeg python3 tools/make_videos.py ~/path/to/gifs
"""
import os
import subprocess
import sys
from PIL import Image

OUT = 'video'
WIDTH = 900
FPS = 25
FFMPEG = os.environ.get('FFMPEG', 'ffmpeg')
HOME_CAT_HOLD = 0.8   # seconds the Home / About cat keeps its eyes open before each blink


def gif_timing(path):
    """Total length and last-frame length in seconds.
    (ffmpeg forgets how long the last GIF frame is shown, so we tell it.)"""
    total = 0
    last = 0
    with Image.open(path) as im:
        for n in range(im.n_frames):
            im.seek(n)
            last = (im.info.get('duration') or 100) / 1000
            total += last
    return total, last


def convert(gif, out, codec_args, first_filters='', width=WIDTH, hold_first=0):
    """hold_first: seconds to hold the first frame before the animation starts."""
    total, last = gif_timing(gif)
    total += hold_first
    filters = (
        first_filters +
        f'tpad=start_mode=clone:start_duration={hold_first:.3f}:'
        f'stop_mode=clone:stop_duration={last:.3f},'
        f'fps={FPS},scale={width}:-2:flags=lanczos,format=yuv420p'
    )
    cmd = [FFMPEG, '-y', '-loglevel', 'error', '-i', gif,
           '-vf', filters, '-t', f'{total:.3f}', '-an'] + codec_args + [out]
    subprocess.run(cmd, check=True)


def codecs(stem):
    return [
        (os.path.join(OUT, stem + '.mp4'),
         ['-c:v', 'libx264', '-crf', '23', '-preset', 'slow', '-movflags', '+faststart']),
        (os.path.join(OUT, stem + '.webm'),
         ['-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0', '-row-mt', '1']),
    ]


def make_home_cat():
    """The blinking Ding Ding on Home and About (logos/ding_normal.gif)."""
    from make_thumbs import HOME_CAT, WHITE, home_cat_box   # same crop as the poster
    if not os.path.exists(HOME_CAT):
        return
    left, top, right, bottom = home_cat_box()
    level = WHITE / 255   # the GIF background is a very light grey; make it pure white
    first = (f'format=rgb24,crop={right - left}:{bottom - top}:{left}:{top},'
             f'colorlevels=rimax={level:.3f}:gimax={level:.3f}:bimax={level:.3f},')
    colour = ['-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709']
    for out, args in codecs('ding-normal'):
        convert(HOME_CAT, out, args + colour, first_filters=first, width=720, hold_first=HOME_CAT_HOLD)
        print('made', out)


def main():
    os.makedirs(OUT, exist_ok=True)
    make_home_cat()

    redo_all = '--all' in sys.argv
    folders = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not folders:
        print('No GIF folder given, so only the Home / About cat was made.')
        return
    if len(folders) != 1:
        sys.exit('Usage: python3 tools/make_videos.py <folder with the GIFs> [--all]')
    src = os.path.expanduser(folders[0])
    if not os.path.isdir(src):
        sys.exit(f'Not a folder: {src}')

    done = 0
    for name in sorted(os.listdir(src)):
        stem, ext = os.path.splitext(name)
        if ext.lower() != '.gif':
            continue
        gif = os.path.join(src, name)
        for out, args in codecs(stem):
            fresh = os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(gif)
            if fresh and not redo_all:
                continue
            convert(gif, out, args)
            done += 1
            print('made', out)
    print(f'{done} files written to {OUT}/')


if __name__ == '__main__':
    main()
