# 📊 Social Media Content Analyzer

An AI-powered tool to extract and analyze social media content from PDFs and images, and provide engagement improvement suggestions.

---

## 🚀 Features
- Upload **PDF or Image files** (drag & drop or browse).
- Extracts text from:
  - PDFs (using **PyPDF2**)
  - Images (using **Tesseract OCR**)
- Analyzes:
  - **Word Count** (with progress bar visualization)
  - **Sentiment Score** (positive/neutral/negative with emoji)
  - **Hashtags** (displayed as colorful tags)
- Smart **Suggestions**:
  - Word count adjustments
  - Sentiment improvements
  - Hashtag tips
  - Keyword inclusion for SEO
- Responsive **Glassmorphism UI** with smooth animations.

---

## 🛠️ Tech Stack
- **Backend**: Flask, PyPDF2, pytesseract, Pillow, TextBlob
- **Frontend**: HTML, CSS (Glassmorphism), JavaScript
- **Deployment**: Render / Railway

---

## ⚡ Installation & Run Locally
```bash
# Clone repo
git clone https://github.com/your-username/social-media-content-analyzer.git
cd social-media-content-analyzer

# Create venv (optional)
python3 -m venv venv
source venv/bin/activate   # macOS/Linux
venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Run the app
python app.py
