let selectedTravelType = "solo";

function selectTravelType(type, button) {
    selectedTravelType = type;

    document.getElementById("travelType").value = type;

    document.querySelectorAll(".travel-option").forEach(btn => {
        btn.classList.remove("selected");
    });

    button.classList.add("selected");
}


async function generatePlan() {

    const destination = document
        .getElementById("destination")
        .value
        .trim();

    const days = document.getElementById("days").value;

    const budget = document.getElementById("budget").value;

    const interests = document
        .getElementById("interests")
        .value
        .trim();

    const result = document.getElementById("result");


    // Check inputs
    if (!destination || !days || !budget || !interests) {

        result.innerHTML = `
            <div class="result-empty">
                <div class="result-icon">⚠️</div>
                <h2>Almost there!</h2>
                <p>Please fill in all the trip details before creating your plan.</p>
            </div>
        `;

        return;
    }


    // Loading screen
    result.innerHTML = `
        <div class="result-empty">
            <div class="result-icon">✨</div>
            <h2>Creating your trip...</h2>
            <p>Our AI is preparing your personalized itinerary.</p>
            <div class="loading-spinner"></div>
        </div>
    `;


    try {

        console.log("Sending request to backend...");

        const response = await fetch(
            "http://127.0.0.1:8000/plan",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    destination: destination,
                    days: Number(days),
                    budget: Number(budget),
                    travel_type: selectedTravelType,
                    interests: interests
                })
            }
        );


        console.log("Backend response:", response.status);


        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Server error ${response.status}: ${errorText}`
            );
        }


        const data = await response.json();

        console.log("Travel plan received:", data);


        if (!data.success) {
            throw new Error(
                data.error || "Failed to create travel plan."
            );
        }


        result.innerHTML = `
            <div class="result-content">

                <div class="result-header">
                    <span class="result-icon">🗺️</span>

                    <div>
                        <h2>Your ${days}-Day Trip to ${escapeHTML(destination)}</h2>

                        <p>
                            Personalized for your interests and budget
                        </p>
                    </div>
                </div>

                <div class="itinerary">
                    ${formatItinerary(data.itinerary)}
                </div>

                <button
                    class="new-trip-btn"
                    onclick="window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    })"
                >
                    ✈️ Plan Another Trip
                </button>

            </div>
        `;

    } catch (error) {

        console.error("Travel planner error:", error);

        result.innerHTML = `
            <div class="result-empty error-result">
                <div class="result-icon">❌</div>

                <h2>Something went wrong</h2>

                <p>${escapeHTML(error.message)}</p>

                <button
                    class="new-trip-btn"
                    onclick="generatePlan()"
                >
                    🔄 Try Again
                </button>
            </div>
        `;
    }
}


/* --------------------------------
   Format AI itinerary
-------------------------------- */

function formatItinerary(text) {

    let html = escapeHTML(text);

    // Main title
    html = html.replace(
        /^# (.+)$/gm,
        '<h1 class="trip-title">$1</h1>'
    );

    // Main sections
    html = html.replace(
        /^## (.+)$/gm,
        '<h2 class="trip-section">$1</h2>'
    );

    // Subsections
    html = html.replace(
        /^### (.+)$/gm,
        '<h3 class="trip-subsection">$1</h3>'
    );

    // Bold text
    html = html.replace(
        /\*\*(.+?)\*\*/g,
        '<strong>$1</strong>'
    );

    // Bullet points
    html = html.replace(
        /^- (.+)$/gm,
        '<div class="trip-bullet">• $1</div>'
    );

    // Numbered lists
    html = html.replace(
        /^\d+\.\s(.+)$/gm,
        '<div class="trip-bullet">• $1</div>'
    );

    // Remove escaped Markdown hash
    html = html.replace(
        /\\#/g,
        '#'
    );

    // Convert line breaks
    html = html.replace(
        /\n/g,
        '<br>'
    );

    return html;
}


/* --------------------------------
   Security helper
-------------------------------- */

function escapeHTML(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}