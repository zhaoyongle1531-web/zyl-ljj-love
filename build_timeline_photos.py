import os
import shutil
from PIL import Image


ROOT = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(os.path.expanduser("~"), "Desktop", "time_pic")
OUT_DIR = os.path.join(ROOT, "assets", "timeline_photos")
MAX_SIZE = (1600, 1600)
QUALITY = 80


def apply_exif_orientation(image):
    try:
        exif = image._getexif() or {}
        orientation = exif.get(274)
    except Exception:
        orientation = None

    if orientation == 2:
        image = image.transpose(Image.FLIP_LEFT_RIGHT)
    elif orientation == 3:
        image = image.rotate(180, expand=True)
    elif orientation == 4:
        image = image.transpose(Image.FLIP_TOP_BOTTOM)
    elif orientation == 5:
        image = image.transpose(Image.FLIP_LEFT_RIGHT).rotate(90, expand=True)
    elif orientation == 6:
        image = image.rotate(270, expand=True)
    elif orientation == 7:
        image = image.transpose(Image.FLIP_LEFT_RIGHT).rotate(270, expand=True)
    elif orientation == 8:
        image = image.rotate(90, expand=True)
    return image


def clear_output():
    if os.path.isdir(OUT_DIR):
        shutil.rmtree(OUT_DIR)
    os.makedirs(OUT_DIR, exist_ok=True)


def main():
    if not os.path.isdir(SRC_DIR):
        raise RuntimeError("Timeline photo directory not found: {}".format(SRC_DIR))

    names = [
        name for name in os.listdir(SRC_DIR)
        if name.lower().endswith((".jpg", ".jpeg", ".png"))
    ]
    names.sort()
    clear_output()

    for name in names:
        src = os.path.join(SRC_DIR, name)
        stem = os.path.splitext(name)[0]
        dst_name = "{}.jpg".format(stem)
        dst = os.path.join(OUT_DIR, dst_name)

        image = Image.open(src)
        image = apply_exif_orientation(image)
        resample = Image.LANCZOS if hasattr(Image, "LANCZOS") else Image.ANTIALIAS
        image.thumbnail(MAX_SIZE, resample)
        if image.mode != "RGB":
            image = image.convert("RGB")

        image.save(dst, "JPEG", quality=QUALITY, optimize=True, progressive=True)
        print("{} -> {}".format(name, dst_name))

    print("Generated {} timeline photos.".format(len(names)))


if __name__ == "__main__":
    main()
