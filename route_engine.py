def calculate_cost(distance_km, fuel_price=100, mileage=15):
    """Estimate fuel cost."""
    fuel_used = distance_km / mileage
    return round(fuel_used * fuel_price, 2)


def calculate_reliability(route):
    """Calculate reliability score from 0 to 100."""

    score = 100

    traffic_delay = route.get("traffic_delay", 0)
    stops = route.get("stops", 0)
    risk = route.get("risk", 0)

    # Traffic delay penalty
    score -= min(traffic_delay * 2, 40)

    # Stops/transfers penalty
    score -= min(stops * 3, 20)

    # Road risk penalty
    score -= min(risk, 30)

    return max(0, min(100, round(score, 2)))


def calculate_route(route):
    """Calculate time, cost and reliability."""

    distance = route["distance"]
    base_time = route["time"]

    traffic_delay = route.get("traffic_delay", 0)

    total_time = base_time + traffic_delay

    cost = route.get(
        "cost",
        calculate_cost(distance)
    )

    reliability = calculate_reliability(route)

    return {
        **route,
        "total_time": round(total_time, 2),
        "cost": round(cost, 2),
        "reliability": reliability
    }


def calculate_score(route, preferences):
    """Lower score means better route."""

    time_weight = preferences.get("time", 0.4)
    cost_weight = preferences.get("cost", 0.2)
    reliability_weight = preferences.get(
        "reliability", 0.4
    )

    time = route["total_time"]
    cost = route["cost"]

    reliability_penalty = 100 - route["reliability"]

    score = (
        time * time_weight
        + cost * cost_weight
        + reliability_penalty * reliability_weight
    )

    return round(score, 2)


def find_best_route(routes, preferences):

    processed_routes = []

    for route in routes:

        calculated = calculate_route(route)

        calculated["score"] = calculate_score(
            calculated,
            preferences
        )

        processed_routes.append(calculated)

    # Lowest score = best route
    processed_routes.sort(
        key=lambda x: x["score"]
    )

    return processed_routes