from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/pre-sessao", methods=["POST"])
def pre_sessao():
    data = request.get_json()
    print("Dados recebidos:", data)

    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)