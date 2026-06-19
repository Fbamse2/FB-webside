from flask import Flask, render_template

app = Flask(__name__)

PROJECTS = [
    {
        "name": "Gaussian",
        "url": "/gaussian",
        "description": "Gaussian splatting experiments and 3D projects."
    },
    #{
    #    "name": "Comics",
    #    "url": "/comics",
    #    "description": "Comic collection database."
    #},
    #{
    #    "name": "Books",
    #    "url": "/books",
    #    "description": "Book collection database."
    #},
    #{
    #    "name": "Tools",
    #    "url": "/tools",
    #    "description": "Random utilities and experiments."
    #}
]

@app.route("/")
def home():
    return render_template(
        "index.html",
        projects=PROJECTS
    )

if __name__ == "__main__":
    app.run(debug=True)