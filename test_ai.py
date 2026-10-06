import ollama

response = ollama.chat(
    model="llama3.2",
    messages=[
        {
            "role": "user",
            "content": "Give me two travel tips for visiting Goa."
        }
    ]
)

print(response["message"]["content"])