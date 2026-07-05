import os
import shutil


ROOT = os.path.dirname(os.path.abspath(__file__))
PUBLISH_DIR = os.path.join(ROOT, "publish_site")
DOCS_DIR = os.path.join(ROOT, "docs")

FILES = [
    "index.html",
    "styles.css",
    "styles.timeline-fix.css",
    "styles.timeline-v3.css",
    "script.js",
    "script.timeline-fix.js",
    "script.timeline-v3.js",
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
    safe_rmtree(DOCS_DIR)
    os.makedirs(os.path.join(PUBLISH_DIR, "assets"), exist_ok=True)

    for name in FILES:
        copy_file(name)

    shutil.copytree(
        os.path.join(ROOT, "assets", "web_photos"),
        os.path.join(PUBLISH_DIR, "assets", "web_photos"),
    )
    timeline_photos = os.path.join(ROOT, "assets", "timeline_photos")
    if os.path.isdir(timeline_photos):
        shutil.copytree(
            timeline_photos,
            os.path.join(PUBLISH_DIR, "assets", "timeline_photos"),
        )

    with open(os.path.join(PUBLISH_DIR, ".nojekyll"), "w", encoding="utf-8") as file:
        file.write("")

    shutil.copytree(PUBLISH_DIR, DOCS_DIR)
    print("Publish site built: {}".format(PUBLISH_DIR))
    print("GitHub Pages site built: {}".format(DOCS_DIR))


if __name__ == "__main__":
    main()
