import os
import shutil


ROOT = os.path.dirname(os.path.abspath(__file__))
PUBLISH_DIR = os.path.join(ROOT, "publish_site")

FILES = [
    "index.html",
    "styles.css",
    "script.js",
    "content.json",
]


def safe_rmtree(path):
    target = os.path.abspath(path)
    root = os.path.abspath(ROOT)
    if not target.startswith(root + os.sep):
        raise RuntimeError("Refusing to remove path outside project: {}".format(target))
    if os.path.isdir(target):
        shutil.rmtree(target)


def copy_file(name):
    shutil.copy2(os.path.join(ROOT, name), os.path.join(PUBLISH_DIR, name))


def main():
    safe_rmtree(PUBLISH_DIR)
    os.makedirs(os.path.join(PUBLISH_DIR, "assets"), exist_ok=True)

    for name in FILES:
        copy_file(name)

    shutil.copytree(
        os.path.join(ROOT, "assets", "web_photos"),
        os.path.join(PUBLISH_DIR, "assets", "web_photos"),
    )

    with open(os.path.join(PUBLISH_DIR, ".nojekyll"), "w", encoding="utf-8") as file:
        file.write("")

    print("Publish site built: {}".format(PUBLISH_DIR))


if __name__ == "__main__":
    main()
