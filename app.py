from flask import Flask, request, jsonify, render_template
import os
import pytesseract
from PIL import Image
import PyPDF2
from textblob import TextBlob
import re

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


# --- Helper Functions ---

def extract_text_from_pdf(file_path):
    text = ""
    with open(file_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            text += page.extract_text() or ""
    return text.strip()


def extract_text_from_image(file_path):
    img = Image.open(file_path)
    text = pytesseract.image_to_string(img)
    return text.strip()


def analyze_text(text):
    # Basic stats
    word_count = len(text.split())
    sentiment = TextBlob(text).sentiment.polarity

    # Hashtag extraction
    hashtags = re.findall(r"#(\w+)", text)

    # --- Dynamic Suggestions ---
    suggestions = []

    # Word count analysis
    if word_count < 50:
        suggestions.append("Your post is very short. Consider adding more context to engage readers.")
    elif word_count > 300:
        suggestions.append("Your post is too long. Try keeping it concise for better readability.")
    else:
        suggestions.append("Word count is good — concise and engaging.")

    # Sentiment analysis
    if sentiment < -0.3:
        suggestions.append("Your content feels negative 😞. Try making it more positive for better engagement.")
    elif sentiment > 0.3:
        suggestions.append("Great! Your content has a positive tone 😊.")
    else:
        suggestions.append("Your tone is neutral. Adding some excitement could boost engagement.")

    # Hashtag analysis
    if not hashtags:
        suggestions.append("Add relevant hashtags to increase discoverability (#tips, #growth, #trending).")
    elif len(hashtags) < 3:
        suggestions.append("Try using 3-5 hashtags to maximize reach.")
    else:
        suggestions.append("Good use of hashtags 👍.")

    # Keyword check (example: assume social media context)
    important_keywords = ["engagement", "followers", "growth", "content", "strategy"]
    missing_keywords = [kw for kw in important_keywords if kw not in text.lower()]
    if missing_keywords:
        suggestions.append(f"Consider including words like {', '.join(missing_keywords[:3])} for better SEO.")

    return {
        "word_count": word_count,
        "sentiment": sentiment,
        "hashtags": hashtags,
        "suggestions": suggestions
    }


# --- Routes ---

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    # Save uploaded file
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
    file.save(file_path)

    try:
        # Extract text
        if file.filename.lower().endswith(".pdf"):
            extracted_text = extract_text_from_pdf(file_path)
        elif file.filename.lower().endswith((".png", ".jpg", ".jpeg")):
            extracted_text = extract_text_from_image(file_path)
        else:
            return jsonify({"error": "Unsupported file type"}), 400

        if not extracted_text:
            return jsonify({"error": "No text could be extracted"}), 400

        # Analyze
        analysis = analyze_text(extracted_text)

        return jsonify({
            "extracted_text": extracted_text,
            **analysis
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
