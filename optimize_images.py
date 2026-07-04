import json
import os
from PIL import Image


ROOT = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(ROOT, "assets", "original_photos")
LEGACY_SRC_DIR = os.path.join(ROOT, "assets", "photos")
OUT_DIR = os.path.join(ROOT, "assets", "web_photos")
CONTENT_PATH = os.path.join(ROOT, "content.json")
MAX_SIZE = (1800, 1800)
QUALITY = 82


def image_source_dir():
    if os.path.isdir(SRC_DIR):
        return SRC_DIR
    return LEGACY_SRC_DIR


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


def load_content():
    with open(CONTENT_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def save_content(content):
    with open(CONTENT_PATH, "w", encoding="utf-8") as file:
        json.dump(content, file, ensure_ascii=False, indent=2)
        file.write("\n")


def clear_generated_photos():
    if not os.path.isdir(OUT_DIR):
        os.makedirs(OUT_DIR)
        return

    for name in os.listdir(OUT_DIR):
        if name.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            os.remove(os.path.join(OUT_DIR, name))


def main():
    src_dir = image_source_dir()
    names = [
        name for name in os.listdir(src_dir)
        if name.lower().endswith((".jpg", ".jpeg", ".png"))
    ]
    names.sort()

    clear_generated_photos()
    generated = []

    for index, name in enumerate(names, 1):
        src = os.path.join(src_dir, name)
        web_name = "photo_{:02d}.jpg".format(index)
        dst = os.path.join(OUT_DIR, web_name)

        image = Image.open(src)
        image = apply_exif_orientation(image)
        resample = Image.LANCZOS if hasattr(Image, "LANCZOS") else Image.ANTIALIAS
        image.thumbnail(MAX_SIZE, resample)

        if image.mode != "RGB":
            image = image.convert("RGB")

        image.save(dst, "JPEG", quality=QUALITY, optimize=True, progressive=True)
        generated.append(web_name)
        print("{} -> {}".format(name, web_name))

    content = load_content()
    content["photos"] = generated
    if generated:
        content.setdefault("site", {})["heroImage"] = "assets/web_photos/{}".format(generated[-3] if len(generated) >= 3 else generated[0])
    save_content(content)
    print("Updated content.json with {} photos.".format(len(generated)))


if __name__ == "__main__":
    main()
