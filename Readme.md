# 🤖 Chatbot Summarizer

A versatile chatbot that summarizes content from multiple sources using modern technologies:

- **Input Sources:** Direct text, images, PDFs, or web articles
- **Core Technologies:** Rasa for conversation, FastAPI for backend, React for frontend
- **Summarization Engine:** Azure-hosted ChatGPT model via OpenAI SDK

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Testing](#testing)
- [License](#license)

## 🔍 Overview

This project combines several powerful technologies to create a comprehensive summarization tool:

- **Rasa Conversational Engine:** Handles natural language interactions and intent recognition
- **FastAPI Backend:** Processes various input types and communicates with the summarization service
- **Azure ChatGPT Integration:** Leverages advanced language models for high-quality summaries
- **React Frontend:** Provides an intuitive user interface for seamless interaction

## ✨ Features

- Multi-source summarization (text, images, PDFs, web articles)
- Conversational interface with natural language processing
- Fast and efficient backend processing
- Modern, responsive UI
- Scalable architecture

## 🏗️ Project Structure

```
chatbot-summarizer/
├── backend/
│   ├── assets/                    # Sample files for testing
│   ├── fastapi/
│   │   └── main.py                # FastAPI server implementation
│   ├── rasa/
│   │   ├── actions/               # Custom Rasa actions
│   │   ├── data/                  # NLU training data
│   │   ├── domain.yml             # Domain configuration
│   │   └── config.yml             # Rasa pipeline configuration
│   ├── services/
│   │   ├── ocr.py                 # Image text extraction
│   │   ├── pdf_extraction.py      # PDF text extraction
│   │   ├── article_scraper.py     # Web article scraping
│   │   └── summarizer.py          # ChatGPT summarization service
│   ├── .env                       # Environment variables
│   └── requirements.txt           # Python dependencies
├── frontend/
│   ├── package.json               # Node.js dependencies
│   ├── vite.config.js             # Vite configuration
│   ├── src/                       # React components
│   └── index.html                 # HTML template
├── venv/                          # Python virtual environment
├── .gitignore                     # Git ignore configurations
└── README.md                      # Project documentation
```

## 🚀 Installation

### Backend Setup

1. **Create and activate a Python virtual environment:**

   ```bash
   # Create virtual environment
   python -m venv venv
   
   # Activate on macOS/Linux
   source venv/bin/activate
   
   # Activate on Windows
   venv\Scripts\activate
   ```

2. **Install required Python packages:**

   ```bash
   pip install -r backend/requirements.txt
   ```

### Frontend Setup

1. **Navigate to the frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**

   ```bash
   npm install
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory:

```
GITHUB_TOKEN=<your-github-token-goes-here>
```

> **Note:** This token is used for authentication with the Azure-hosted ChatGPT model via the OpenAI SDK.

### Rasa Configuration

Ensure that your `backend/rasa/domain.yml` includes the following slots:
- `url`
- `file_type`
- `text`

## 🏃‍♂️ Running the Project

### 1. FastAPI Backend

```bash
# Navigate to the FastAPI directory
cd backend/fastapi

# Start the server
uvicorn main:app --reload
```

> The FastAPI server will be running at http://localhost:8000

### 2. Rasa Chatbot

```bash
# Navigate to the Rasa directory
cd backend/rasa

# Train the model
rasa train

# Start the Rasa shell
rasa shell

# In a separate terminal, start the action server
rasa run actions
```

### 3. React Frontend

```bash
# Navigate to the frontend directory
cd frontend

# Start the development server
npm run dev
```

> The frontend will be available at http://localhost:3000

## 🧪 Testing

You can test the FastAPI summarization endpoint using the following curl commands:

### Direct Text Input

```bash
curl -X POST "http://localhost:8000/summarize" \
  -H "Content-Type: application/json" \
  -d '{"text": "Your text to summarize goes here."}'
```

### URL Input (e.g., for an article)

```bash
curl -X POST "http://localhost:8000/summarize" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/article", "file_type": "article"}'
```

## 📜 License

This project is provided as-is under the MIT License.
