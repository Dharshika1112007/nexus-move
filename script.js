/* =====================================================
   COMMUTE AI - FRONTEND
   =====================================================

   IMPORTANT FOR TEAM INTEGRATION:

   Currently:
       USE_MOCK_DATA = true

   When backend is ready:
       Change it to false

   Then update:
       API_BASE_URL

   ===================================================== */


/* =====================================================
   CONFIGURATION
===================================================== */

const USE_MOCK_DATA = true;

// Change this when your teammate gives you the backend URL.
const API_BASE_URL = "http://localhost:5000";


/* =====================================================
   GET HTML ELEMENTS
===================================================== */

const fromLocation =
    document.getElementById("fromLocation");

const toLocation =
    document.getElementById("toLocation");

const departureTime =
    document.getElementById("departureTime");

const speedPreference =
    document.getElementById("speedPreference");

const costPreference =
    document.getElementById("costPreference");

const ecoPreference =
    document.getElementById("ecoPreference");

const comfortPreference =
    document.getElementById("comfortPreference");

const preferenceValue =
    document.getElementById("preferenceValue");

const planButton =
    document.getElementById("planJourney");

const loadingSection =
    document.getElementById("loadingSection");

const resultsSection =
    document.getElementById("resultsSection");

const whatIfSection =
    document.getElementById("whatIfSection");

const recommendedRoute =
    document.getElementById("recommendedRoute");

const alternativeRoutes =
    document.getElementById("alternativeRoutes");

const simulationResult =
    document.getElementById("simulationResult");


/* =====================================================
   PREFERENCE SLIDERS
===================================================== */

function updatePreferenceLabel() {

    const speed =
        Number(speedPreference.value);

    const cost =
        Number(costPreference.value);

    const eco =
        Number(ecoPreference.value);

    const comfort =
        Number(comfortPreference.value);


    const average =
        (speed + cost + eco + comfort) / 4;


    if (average < 35) {

        preferenceValue.textContent =
            "Comfort focused";

    } else if (average < 65) {

        preferenceValue.textContent =
            "Balanced";

    } else {

        preferenceValue.textContent =
            "High priority";
    }
}


speedPreference.addEventListener(
    "input",
    updatePreferenceLabel
);

costPreference.addEventListener(
    "input",
    updatePreferenceLabel
);

ecoPreference.addEventListener(
    "input",
    updatePreferenceLabel
);

comfortPreference.addEventListener(
    "input",
    updatePreferenceLabel
);


/* =====================================================
   GET USER INPUT
===================================================== */

function getJourneyInput() {

    return {

        from: fromLocation.value.trim(),

        to: toLocation.value.trim(),

        departureTime:
            departureTime.value,

        preferences: {

            speed:
                Number(speedPreference.value),

            cost:
                Number(costPreference.value),

            eco:
                Number(ecoPreference.value),

            comfort:
                Number(comfortPreference.value)
        }
    };
}


/* =====================================================
   VALIDATE USER INPUT
===================================================== */

function validateJourney(data) {

    if (!data.from) {

        alert(
            "Please enter your starting location."
        );

        fromLocation.focus();

        return false;
    }


    if (!data.to) {

        alert(
            "Please enter your destination."
        );

        toLocation.focus();

        return false;
    }


    if (!data.departureTime) {

        alert(
            "Please select a departure time."
        );

        departureTime.focus();

        return false;
    }


    return true;
}


/* =====================================================
   MAIN PLAN JOURNEY FUNCTION
===================================================== */

async function planJourney() {

    const journeyData =
        getJourneyInput();


    if (!validateJourney(journeyData)) {

        return;
    }


    showLoading();


    try {

        let data;


        /*
         * =============================================
         * MOCK MODE
         * =============================================
         */

        if (USE_MOCK_DATA) {

            await delay(1200);

            data =
                getMockJourneyData(journeyData);

        }


        /*
         * =============================================
         * REAL BACKEND MODE
         * =============================================
         */

        else {

            data =
                await requestJourneyFromBackend(
                    journeyData
                );
        }


        hideLoading();

        displayJourney(data);


    } catch (error) {

        hideLoading();

        console.error(
            "Journey error:",
            error
        );

        showError(
            "Unable to plan your journey. Please try again."
        );
    }
}


/* =====================================================
   SEND JOURNEY TO BACKEND
===================================================== */

async function requestJourneyFromBackend(
    journeyData
) {

    const response =
        await fetch(
            `${API_BASE_URL}/api/journey`,
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        journeyData
                    )
            }
        );


    if (!response.ok) {

        throw new Error(
            `Server error: ${response.status}`
        );
    }


    return await response.json();
}


/* =====================================================
   DISPLAY JOURNEY
===================================================== */

function displayJourney(data) {

    resultsSection
        .classList
        .remove("hidden");

    whatIfSection
        .classList
        .remove("hidden");


    displayRecommendedRoute(
        data.recommended
    );


    displayAlternativeRoutes(
        data.alternatives || []
    );


    resultsSection.scrollIntoView({
        behavior: "smooth"
    });
}


/* =====================================================
   RECOMMENDED ROUTE
===================================================== */

function displayRecommendedRoute(route) {

    const reliability =
        Number(route.reliability || 0);


    recommendedRoute.innerHTML = `

        <div class="route-card">

            <span class="recommended-badge">
                🏆 AI RECOMMENDED
            </span>

            <h3 class="route-title">
                ${route.icon || "🚇"}
                ${route.mode}
            </h3>


            <div class="route-metrics">

                <div class="metric">

                    <div class="metric-label">
                        Time
                    </div>

                    <div class="metric-value">
                        ⏱️ ${route.duration} min
                    </div>

                </div>


                <div class="metric">

                    <div class="metric-label">
                        Cost
                    </div>

                    <div class="metric-value">
                        💰 ₹${route.cost}
                    </div>

                </div>


                <div class="metric">

                    <div class="metric-label">
                        Crowd
                    </div>

                    <div class="metric-value">
                        👥 ${route.crowd}
                    </div>

                </div>


                <div class="metric">

                    <div class="metric-label">
                        CO₂
                    </div>

                    <div class="metric-value">
                        🌱 ${route.co2} kg
                    </div>

                </div>

            </div>


            <div class="reliability">

                <div class="reliability-header">

                    <span>
                        Journey reliability
                    </span>

                    <strong>
                        ${reliability}%
                    </strong>

                </div>


                <div class="progress">

                    <div
                        class="progress-bar"
                        style="width: ${reliability}%"
                    ></div>

                </div>

            </div>


            <div class="ai-explanation">

                <p>
                    🧠 <strong>Why this route?</strong>
                </p>

                <p>
                    ${route.reason}
                </p>

            </div>

        </div>
    `;
}


/* =====================================================
   ALTERNATIVE ROUTES
===================================================== */

function displayAlternativeRoutes(routes) {

    alternativeRoutes.innerHTML = "";


    if (!routes.length) {

        alternativeRoutes.innerHTML = `
            <p>
                No alternative routes available.
            </p>
        `;

        return;
    }


    routes.forEach((route) => {

        const card =
            document.createElement("div");

        card.className =
            "alternative-card";


        card.innerHTML = `

            <h3>
                ${route.icon || "🚌"}
                ${route.mode}
            </h3>

            <p>
                ⏱️ ${route.duration} minutes
            </p>

            <p>
                💰 ₹${route.cost}
            </p>

            <p>
                📊 Reliability:
                ${route.reliability}%
            </p>

        `;


        alternativeRoutes.appendChild(card);
    });
}


/* =====================================================
   WHAT-IF SIMULATION
===================================================== */

async function simulateJourney(
    scenario
) {

    simulationResult
        .classList
        .add("hidden");


    simulationResult.innerHTML = `
        <h3>🧠 AI is simulating...</h3>
        <p>
            Predicting how your journey changes.
        </p>
    `;


    simulationResult
        .classList
        .remove("hidden");


    try {

        let result;


        /*
         * MOCK
         */

        if (USE_MOCK_DATA) {

            await delay(900);

            result =
                getMockSimulation(
                    scenario
                );

        }


        /*
         * REAL BACKEND
         */

        else {

            result =
                await requestSimulationFromBackend(
                    scenario
                );
        }


        displaySimulation(result);


    } catch (error) {

        console.error(
            "Simulation error:",
            error
        );


        simulationResult.innerHTML = `

            <h3>⚠️ Simulation failed</h3>

            <p>
                Please try again.
            </p>

        `;
    }
}


/* =====================================================
   SEND WHAT-IF REQUEST TO BACKEND
===================================================== */

async function requestSimulationFromBackend(
    scenario
) {

    const journeyData =
        getJourneyInput();


    const response =
        await fetch(
            `${API_BASE_URL}/api/simulate`,
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    scenario:
                        scenario,

                    journey:
                        journeyData
                })
            }
        );


    if (!response.ok) {

        throw new Error(
            `Server error: ${response.status}`
        );
    }


    return await response.json();
}


/* =====================================================
   DISPLAY SIMULATION
===================================================== */

function displaySimulation(result) {

    simulationResult.innerHTML = `

        <h3>
            🔮 ${result.title}
        </h3>

        <p>
            ${result.message}
        </p>

        <strong>
            Recommended:
            ${result.recommendedRoute}
        </strong>

        <p>
            New estimated time:
            ${result.newDuration} minutes
        </p>

    `;


    simulationResult
        .classList
        .remove("hidden");
}


/* =====================================================
   MOCK JOURNEY DATA
   REMOVE/IGNORE WHEN BACKEND IS READY
===================================================== */

function getMockJourneyData(
    journeyData
) {

    return {

        recommended: {

            icon: "🚇",

            mode:
                "Metro + Walk",

            duration: 38,

            cost: 30,

            reliability: 94,

            crowd: "Low",

            co2: 0.6,

            reason:
                `Based on your preferences,
                Metro + Walk gives you the best
                balance of travel time, reliability,
                cost and environmental impact.`
        },


        alternatives: [

            {

                icon: "🚕",

                mode:
                    "Cab",

                duration: 25,

                cost: 250,

                reliability: 82
            },


            {

                icon: "🚌",

                mode:
                    "Bus",

                duration: 50,

                cost: 20,

                reliability: 71
            }

        ]
    };
}


/* =====================================================
   MOCK WHAT-IF DATA
===================================================== */

function getMockSimulation(
    scenario
) {

    const scenarios = {

        traffic: {

            title:
                "Traffic Increase Detected",

            message:
                "Road congestion is expected to increase. Your current route may become slower.",

            recommendedRoute:
                "Metro + Walk",

            newDuration:
                41
        },


        rain: {

            title:
                "Rain Scenario",

            message:
                "Walking conditions may become difficult. A route with less outdoor walking is recommended.",

            recommendedRoute:
                "Metro + Bus",

            newDuration:
                43
        },


        late: {

            title:
                "Late Departure",

            message:
                "Leaving 15 minutes later increases the risk of missing your connection.",

            recommendedRoute:
                "Metro Express",

            newDuration:
                35
        },


        delay: {

            title:
                "Bus Delay Detected",

            message:
                "Your bus may be delayed. Switching to the metro reduces your expected arrival time.",

            recommendedRoute:
                "Metro + Walk",

            newDuration:
                39
        }

    };


    return (
        scenarios[scenario] ||
        scenarios.traffic
    );
}


/* =====================================================
   LOADING
===================================================== */

function showLoading() {

    loadingSection
        .classList
        .remove("hidden");

    resultsSection
        .classList
        .add("hidden");

    whatIfSection
        .classList
        .add("hidden");
}


function hideLoading() {

    loadingSection
        .classList
        .add("hidden");
}


/* =====================================================
   ERROR
===================================================== */

function showError(message) {

    resultsSection
        .classList
        .remove("hidden");


    recommendedRoute.innerHTML = `

        <div class="route-card">

            <h3>
                ⚠️ Something went wrong
            </h3>

            <p>
                ${message}
            </p>

        </div>

    `;
}


/* =====================================================
   SMALL DELAY FOR MOCK LOADING
===================================================== */

function delay(milliseconds) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );
}


/* =====================================================
   BUTTON EVENT
===================================================== */

planButton.addEventListener(
    "click",
    planJourney
);


/* =====================================================
   INITIAL STATE
===================================================== */

updatePreferenceLabel();