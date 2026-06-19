from flask import Flask, render_template
import os
import shutil

app = Flask(__name__)

PROJECTS = [
    {
        "name": "Gaussian",
        "url": "gaussian.html",
        "description": "Gaussian splatting experiments and 3D projects."
    }
]

@app.route("/")
def home():
    return render_template("index.html", projects=PROJECTS)

def build():
    os.makedirs("main/dist", exist_ok=True)

    # 🔥 FIX: create Flask context
    with app.app_context():
        html = render_template("index.html", projects=PROJECTS)

    with open("main/dist/index.html", "w", encoding="utf-8") as f:
        f.write(html)

    shutil.copytree(
        "main/static",
        "main/dist/static",
        dirs_exist_ok=True
    )

if __name__ == "__main__":
    build()