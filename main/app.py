from flask import Flask, render_template
import os
import shutil

app = Flask(__name__)

# =========================
# PROJECT DATA
# =========================
PROJECTS = [
    {
        "name": "Gaussian",
        "url": "gaussian/",
        "description": "Gaussian splatting experiments and 3D projects."
    }
]

# =========================
# FLASK ROUTE (optional local dev)
# =========================
@app.route("/")
def home():
    return render_template("index.html", projects=PROJECTS)


# =========================
# BUILD STATIC SITE (GitHub Pages)
# =========================
def build():
    dist_path = "main/dist"

    # clean + create dist
    os.makedirs(dist_path, exist_ok=True)

    # ensure Flask context for render_template
    with app.app_context():
        html = render_template("index.html", projects=PROJECTS)

    # write main page
    with open(f"{dist_path}/index.html", "w", encoding="utf-8") as f:
        f.write(html)

    # copy static assets (CSS + JS)
    shutil.copytree(
        "main/static",
        f"{dist_path}/static",
        dirs_exist_ok=True
    )

    # copy gaussian project into dist
    shutil.copytree(
        "projects/gaussian",
        f"{dist_path}/gaussian",
        dirs_exist_ok=True
    )

    print("✅ Build complete -> main/dist")


# =========================
# ENTRY POINT
# =========================
if __name__ == "__main__":
    build()