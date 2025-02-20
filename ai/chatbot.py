from flask import Flask, request, jsonify
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch

app = Flask(__name__)

# Load the model and tokenizer
model_name = "google/flan-t5-large"
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

model = AutoModelForSeq2SeqLM.from_pretrained(model_name).to(device)
tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=True)

conversation_history = []

# Chatbot instructions
chatbot_role = "Technician Support Chatbot"
chatbot_instructions = """
You are a technician support chatbot.
Your primary goal is to assist users by identifying their technical problems and suggesting suitable technicians.
Additionally, you should handle other queries related to the application.

Your responses should be:
* Clear and concise: Avoid unnecessary jargon or overly complex explanations.
* Helpful and informative: Provide relevant and useful information to the user.
* Friendly and approachable: Maintain a positive and welcoming tone.
* Accurate and reliable: Ensure your responses are correct and trustworthy.
* Contextual: Consider the context of the conversation and tailor your responses accordingly.
* Domain-specific: Keep your responses within the application domain.

Your domain includes the following technician services:
- Electrician
- Plumber
- Carpenter
- Cleaner
- Painter
- AC & HVAC Technician
- Sewage and Drain Cleaner
- Welding and Metalwork
- Emergency Generator and Invertor Maintenance Worker

Example interactions:
- **User:** My tap is not working.
- **Chatbot:** It sounds like you're experiencing a plumbing issue. Would you like me to assist you in finding a plumber in your area?

- **User:** My tube light is not working.
- **Chatbot:** It sounds like you're having an issue with your tube light. Would you like me to assist you in finding an electrician nearby?
"""

def generate_text(prompt, conversation_history, max_length=400, num_return_sequences=1):
    if not model or not tokenizer:
        return ["Model and tokenizer are not loaded."]
    
    conversation_history.append(prompt)
    full_conversation = '\n'.join(conversation_history)
    inputs = tokenizer(full_conversation, return_tensors="pt").to(device)
    
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_length=max_length,
            num_beams=2,
            no_repeat_ngram_size=1,
            num_return_sequences=num_return_sequences,
            length_penalty=1.8,
            early_stopping=True
        )
    
    generated_texts = tokenizer.batch_decode(outputs, skip_special_tokens=True)
    return generated_texts

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_input = data.get("user_input", "")
    
    if not user_input:
        return jsonify({"error": "No input provided"}), 400
    
    prompt = f"{chatbot_instructions}\n\n**Role:** {chatbot_role}\n\n**User:** {user_input}\n\n**Chatbot:**"
    response_texts = generate_text(prompt, conversation_history)
    
    return jsonify({"response": response_texts})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
