from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama

# --------------------------------
# Create FastAPI application
# --------------------------------

app = FastAPI(
    title="TripMate AI",
    description="AI-powered Smart Travel Planner",
    version="1.0"
)

# --------------------------------
# Allow frontend to communicate
# with the FastAPI backend
# --------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------
# Request data structure
# --------------------------------

class TravelRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travel_type: str
    interests: str


# --------------------------------
# Home / health check
# --------------------------------

@app.get("/")
def home():
    return {
        "message": "TripMate AI Travel Planner is running"
    }


# --------------------------------
# AI Travel Planner
# --------------------------------

@app.post("/plan")
def create_travel_plan(request: TravelRequest):

    prompt = f"""
You are TripMate AI, an expert travel planner.

Create a practical and realistic {request.days}-day travel itinerary
for {request.destination}.

Traveler type:
{request.travel_type}

Total budget:
₹{request.budget}

Interests:
{request.interests}

IMPORTANT REQUIREMENTS:

1. Create a clear day-by-day itinerary.
2. Suggest important and interesting places to visit.
3. Suggest activities for each day.
4. Suggest local food to try.
5. Give approximate expenses for each day.
6. Include transport expenses where useful.
7. Include food expenses.
8. Keep the estimated total cost within ₹{request.budget}.
9. Do not make unrealistic cost estimates.
10. If the budget is too low, clearly say so and suggest cheaper alternatives.
11. Avoid unnecessary luxury recommendations.
12. Make the itinerary easy for a student to understand.
13. Use simple language.
14. Give a final estimated total cost.
15. Give a short budget summary at the end.

FORMAT:

# 🌍 {request.destination} Travel Plan

## ✈️ Trip Overview
- Destination:
- Number of days:
- Traveler type:
- Budget:
- Interests:

## 📅 Day 1
### 📍 Places to Visit
- ...

### 🎯 Activities
- ...

### 🍴 Food
- ...

### 💰 Estimated Expense
- Transport: ₹...
- Food: ₹...
- Activities/Entry: ₹...
- Total: ₹...

## 📅 Day 2
Repeat the same format.

Continue for all {request.days} days.

## 💰 Budget Summary
- Estimated transport: ₹...
- Estimated food: ₹...
- Estimated activities: ₹...
- Estimated accommodation: ₹...
- Estimated total: ₹...
- Remaining budget: ₹...

## 💡 Smart Travel Tips
Give 3-5 useful tips for this trip.
"""

    try:

        response = ollama.chat(
            model="llama3.2",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        itinerary = response["message"]["content"]

        return {
            "success": True,
            "destination": request.destination,
            "itinerary": itinerary
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }