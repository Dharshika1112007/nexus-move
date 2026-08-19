from flask import Flask, request, jsonify
from flask_cors import CORS

from route_engine import find_best_route


app = Flask(__name__)

CORS(app)


@app.route("/")
def home():

    return jsonify({
        "status": "success",
        "message": "NEXUS MOVE Backend Running"
    })


@app.route("/api/best-route", methods=["POST"])
def best_route():

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "No JSON data received"
        }), 400

    routes = data.get("routes", [])

    if not routes:
        return jsonify({
            "status": "error",
            "message": "No routes provided"
        }), 400

    preferences = data.get(
        "preferences",
        {
            "time": 0.4,
            "cost": 0.2,
            "reliability": 0.4
        }
    )

    ranked_routes = find_best_route(
        routes,
        preferences
    )

    return jsonify({
        "status": "success",
        "recommended_route": ranked_routes[0],
        "routes": ranked_routes
    })


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )