from flask import Flask, request, jsonify
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch

app = Flask(__name__)

# Load model and tokenizer
model_name = "google/flan-t5-large"
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

model = AutoModelForSeq2SeqLM.from_pretrained(model_name).to(device)
tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=True)

# Chatbot role and instructions
chatbot_role = "Technician Support Chatbot"
chatbot_instructions = """
You are a technician support chatbot. Your primary goal is to assist users by identifying their technical problems and recommending the suitable technician...
"""

conversation_history = []  # Store conversation history

def generate_text(user_input, max_length=400):
    global conversation_history
    
    emergency_keywords = ["smoke", "fire"]
    complaint_keywords = ["didn't come", "not come", "never came", "wasn't there", "absent", "complaint"]
    
    # Emergency response
    if any(keyword in user_input.lower() for keyword in emergency_keywords):
        bot_response = ("It appears there are signs of smoke or fire. Please contact emergency services immediately.")
    # Complaint handling
    elif any(keyword in user_input.lower() for keyword in complaint_keywords):
        bot_response = ("I understand you're facing an issue. Please raise a complaint in our forum for assistance.")
    else:
        conversation_history.append(f"*User:* {user_input}")
        context_entries = conversation_history[-4:] if len(conversation_history) >= 4 else conversation_history
        prompt = f"{chatbot_instructions}\n\n*Role:* {chatbot_role}\n\n" + '\n'.join(context_entries) + "\n\n*Chatbot:*"
        
        inputs = tokenizer(prompt, return_tensors="pt").to(device)
        with torch.no_grad():
            outputs = model.generate(**inputs, max_length=max_length, num_beams=4, no_repeat_ngram_size=2, length_penalty=1.5, early_stopping=True)
        bot_response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        conversation_history.append(f"*Chatbot:* {bot_response}")
    
    while len(conversation_history) > 4:
        conversation_history.pop(0)
    
    return bot_response

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_input = data.get("message", "")
    response = generate_text(user_input)
    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(debug=True)





# from flask import Flask, request, jsonify
# from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
# import torch

# app = Flask(__name__)

# # Load model and tokenizer
# model_name = "google/flan-t5-large"
# device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
# model = AutoModelForSeq2SeqLM.from_pretrained(model_name).to(device)
# tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=True)

# conversation_history = []

# def generate_text(prompt, conversation_history, max_length=400, num_return_sequences=1):
#     conversation_history.append(prompt)
#     full_conversation = '\n'.join(conversation_history)
    
#     inputs = tokenizer(full_conversation, return_tensors="pt", truncation=True).to(device)
    
#     with torch.no_grad():
#         outputs = model.generate(
#             **inputs,
#             max_length=max_length,
#             num_beams=2,
#             do_sample=True,            
#             temperature=0.8,
#             top_k=50,
#             num_return_sequences=num_return_sequences,
#             no_repeat_ngram_size=1,
#             length_penalty=1.8,
#             early_stopping=True
#         )
    
#     generated_texts = tokenizer.batch_decode(outputs, skip_special_tokens=True)
#     return generated_texts if generated_texts else ["I didn't understand that."]

# @app.route('/chat', methods=['POST'])
# def chat():
#     data = request.get_json()
#     user_input = data.get("user_input", "")  # Fix key mismatch

#     if not user_input:
#         return jsonify({"error": "No message provided"}), 400
    
#     response = generate_text(user_input, conversation_history)
#     return jsonify({"response": response})  # Ensure response is a list

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000, debug=True)

