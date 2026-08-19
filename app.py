from flask import Flask, request, jsonify
import json
from flask_cors import CORS

from route_engine import find_best_route


app = Flask(__name__)

CORS(app)

with open("scenarios.json", "r") as file:
    SCENARIOS = json.load(file)

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
@app.route("/api/what-if", methods=["POST"])
def what_if():

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "No JSON data received"
        }), 400

    routes = data.get("routes", [])
    scenario_name = data.get("scenario", "normal")

    preferences = data.get(
        "preferences",
        {
            "time": 0.4,
            "cost": 0.2,
            "reliability": 0.4
        }
    )

    if not routes:
        return jsonify({
            "status": "error",
            "message": "No routes provided"
        }), 400

    if scenario_name not in SCENARIOS:
        return jsonify({
            "status": "error",
            "message": "Unknown scenario"
        }), 400

    scenario = SCENARIOS[scenario_name]

    modified_routes = []

    for route in routes:

        modified = route.copy()

        original_time = route["time"]

        modified["time"] = (
            original_time
            * scenario["traffic_multiplier"]
        )

        modified["traffic_delay"] = (
            route.get("traffic_delay", 0)
            + scenario["time_addition"]
        )

        modified["risk"] = (
            route.get("risk", 0)
            + scenario["reliability_penalty"]
        )

        modified_routes.append(modified)

    ranked_routes = find_best_route(
        modified_routes,
        preferences
    )

    return jsonify({
        "status": "success",
        "scenario": scenario_name,
        "recommended_route": ranked_routes[0],
        "routes": ranked_routes
    })

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )