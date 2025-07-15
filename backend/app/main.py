import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials

load_dotenv()
# Initialize Firebase Admin SDK
cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH")
if not cred_path:
    raise ValueError("FIREBASE_SERVICE_ACCOUNT_KEY_PATH not set in .env")
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

from . import models, services, security

app = FastAPI(
    title="LAWYER AI API",
    description="Backend services for the LAWYER AI legal analysis application.",
    version="1.0.0"
)

origins = [
    "http://localhost:3000",
    "http://localhost:4141", # Default for Vite
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "Welcome to the LAWYER AI API"}

@app.post("/api/analyze", tags=["Analysis"])
async def analyze_document(
    request: models.AnalysisRequest, 
    user: dict = Depends(security.get_current_user)
):
    if not request.text:
        raise HTTPException(status_code=400, detail="Document text cannot be empty.")
    
    print(f"User {user['uid']} requested analysis.")
    analysis_results = await services.process_document_analysis(request.text, user['uid'], request.question)
    return analysis_results

@app.post("/api/chat", tags=["Chatbot"])
async def legal_chatbot(
    request: models.ChatRequest,
    user: dict = Depends(security.get_current_user)
):
    if not request.prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    print(f"User {user['uid']} sent a chat message.")
    full_prompt = f"You are an expert legal AI assistant. Answer the following user query based on general legal principles and knowledge. User query: \"{request.prompt}\""
    response = await services.get_gemini_response(full_prompt, user['uid']) # Added user['uid']
    return {"response": response}

@app.post("/api/timeline", tags=["Timeline"])
async def create_timeline(
    request: models.TimelineRequest, # TimelineRequest now expects 'text' and 'user_id'
    user: dict = Depends(security.get_current_user)
):
    if not request.text:
        raise HTTPException(status_code=400, detail="Document text cannot be empty.")
    # Use user['uid'] for the request_user_id
    # If the request object has a user_id attribute, use that; otherwise, use the user from the dependency
    # This allows for flexibility in the request structure while ensuring user identification
    request_user_id = request.user_id if hasattr(request, 'user_id') else user['uid']

    print(f"User {request_user_id} requested a timeline.")
    timeline_result = await services.generate_event_timeline(request.text, request_user_id)
    
    if "error" in timeline_result:
        raise HTTPException(status_code=500, detail={"message": timeline_result.get("error", "An unknown error occurred on the server.")})
    
    return timeline_result