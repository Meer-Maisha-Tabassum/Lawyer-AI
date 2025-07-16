# LAWYER AI Analyst Suite


## 🚀 Project Overview

The **LAWYER AI Analyst Suite** is a modern, production-ready AI web application specifically designed for Machine Learning Engineers working in the legal domain. Developed with a strong focus on Natural Language Processing (NLP), this suite demonstrates advanced capabilities in legal text analysis, showcasing skills in model deployment, clean code architecture, and full-stack development.

This application is built with a **React frontend** for a dynamic user interface and a **FastAPI backend** that integrates directly with powerful NLP libraries and Google's Gemini AI model to perform complex legal text analysis tasks. It serves as a comprehensive portfolio piece highlighting expertise in developing and deploying AI solutions for the legal industry.

---

## ✨ Features

The LAWYER AI Analyst Suite offers a range of sophisticated features tailored for legal professionals and AI engineers:

### 📊 Dashboard
Provides a quick overview of simulated model performance metrics, showcasing the accuracy of various NLP tasks like clause extraction and summarization, along with API uptime. This section highlights MLOps and evaluation capabilities.

### 📄 Document Analysis Engine
A core feature allowing users to upload legal text documents (e.g., case summaries, contracts) and perform various NLP analyses:
* **Legal Summary:** Generates a concise, professional summary of the document, focusing on key facts, legal issues, and outcomes.
* **Clause & Principle Extraction:** Identifies and extracts key clauses (for contracts like Liability, Termination, Confidentiality) or primary legal principles/arguments (for court cases). Results are presented in a structured JSON format.
* **Named Entity Recognition (NER):** Extracts crucial entities such as Persons, Organizations, Geographic Locations, Dates, and specifically identified Laws from the text.
* **Q&A on Document (Retrieval-Augmented Generation - RAG):** Allows users to ask specific questions about the uploaded document. The AI provides answers *based only on the content of the provided text*, simulating a RAG system.

### 🤖 Legal Q&A Chatbot
An interactive chatbot that provides answers to general legal questions based on a vast corpus of legal knowledge (simulated via Gemini AI). This demonstrates the application of large language models in a conversational legal assistant context.

### ⏱️ Timeline Generator
Extracts and chronologically organizes key events from unstructured legal case text (e.g., court judgments) and presents them in a clear, visual timeline format. This feature is invaluable for generating case chronologies.

### 🛠️ Skills & Stack
A dedicated section detailing the technologies and tools utilized in building the application, reinforcing the developer's proficiency across the entire ML lifecycle, from frontend development to MLOps.

---

## 🛠️ Tech Stack

This project leverages cutting-edge technologies across the full stack:

### Frontend
* **React:** A declarative, component-based JavaScript library for building user interfaces.
* **Tailwind CSS:** A utility-first CSS framework for rapid and responsive UI development.
* **Framer Motion:** A production-ready motion library for React to create smooth animations and interactive components.
* **Firebase (Authentication & Firestore):** Used for anonymous user authentication and persistent storage of user-specific data (document analyses, chat histories, timelines) to ensure a production-ready experience.

### Backend
* **FastAPI:** A modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints.
* **Google Gemini API (`google-generativeai`):** Used to power the core AI features (summarization, Q&A, entity/clause extraction, timeline generation) by interacting with Google's latest generative AI models.
* **spaCy:** Industrial-strength Natural Language Processing (NLP) library for tasks like Named Entity Recognition (NER) and tokenization.
* **NLTK (Natural Language Toolkit):** Used for various text preprocessing tasks.
* **`python-dotenv`:** For managing environment variables securely.
* **`firebase-admin`:** For Firebase authentication verification on the backend.

### MLOps & Deployment Considerations
* **Docker:** For containerizing the backend application, ensuring consistent environments for deployment.
* **GitHub Actions (Conceptual):** The project structure supports CI/CD pipelines using GitHub Actions for automated testing and deployment.
* **Cloud Deployment (Conceptual):** Designed for deployment to platforms like Google Cloud Run (for FastAPI) and Firebase Hosting (for React frontend) with robust API integration.

---

## ⚙️ Setup Instructions

Follow these steps to get the LAWYER AI Analyst Suite up and running on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

* **Git:** For cloning the repository.
    * [Download Git](https://git-scm.com/downloads)
* **Python 3.10+:** For the FastAPI backend and NLP libraries.
    * [Download Python](https://www.python.org/downloads/)
* **Node.js (LTS version):** For the React frontend and its package manager (npm or Yarn).
    * [Download Node.js](https://nodejs.org/en/download/)
* **Firebase Project:** You'll need an active Firebase project for authentication and database features.
    * [Create a Firebase Project](https://firebase.google.com/docs/web/setup)
* **Google Gemini API Key:** Required for the backend's AI functionalities.
    * [Get an API Key from Google AI Studio](https://aistudio.google.com/app/apikey)
* **Firebase Service Account Key (JSON file):** For backend authentication with Firebase.
    * Go to your Firebase project in Google Cloud Console.
    * Navigate to **Project settings (gear icon)** > **Service accounts tab**.
    * Click "Generate new private key" and download the JSON file. **Keep this file secure and never commit it to Git.**

### 1. Clone the Repository

Open your terminal or command prompt and clone the project:

```bash
git clone [https://github.com/Meer-Maisha-Tabassum/Lawyer-AI.git](https://github.com/Meer-Maisha-Tabassum/Lawyer-AI.git)
cd Lawyer-AI
