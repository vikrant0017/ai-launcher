from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from openai import AuthenticationError

from assistant import AIAssitant
from config import app_config
from file_rag import RAGService
from src.llm import load_gemini_lm

# Global variable to hold our service instance
rag_service: RAGService | None = None
ai_assitant: AIAssitant | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes services on application startup."""
    initialize_services()
    yield


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def initialize_services():
    """Loads config and initializes the RAG service if configured."""
    global rag_service, ai_assitant, app_config
    # Reload config from file in case it changed

    print(app_config)
    if app_config.watch_dir:
        print("Watch directory is configured. Initializing RAG service.")
        rag_service = RAGService(
            watch_dir=Path(app_config.watch_dir), data_dir=Path(app_config.data_dir)
        )
    else:
        print("Watch directory not configured. RAG service will not be started.")
        rag_service = None

    if app_config.gemini_api_key:
        print("API Key Configured. Initializing AI Assistant service.")
        ai_assitant = AIAssitant(lm=load_gemini_lm())
    else:
        print("LLM API KEY not configured")


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/api/status")
async def get_status():
    """Lets the UI know if the backend is configured."""
    return {"is_configured": rag_service is not None}


@app.get("/config")
async def get_config():
    return app_config.asdict()


@app.post("/config")
async def set_config(request: Request):
    """Receives new config, saves it, and re-initializes services."""
    body = await request.json()

    # Update the existing config with new values and write to disk
    app_config.update_fields(body)
    app_config.write()

    # Re-initialize services with the new configuration
    initialize_services()

    return {"status": "success", "new_config": app_config.asdict()}


@app.post("/rag")
async def respond_rag(request: Request):
    if not rag_service:
        raise HTTPException(
            status_code=409,  # 409 Conflict is a good choice here
            detail="RAG service is not configured. Please set a watch directory in the settings.",
        )

    body = await request.json()
    question = body.get("question")
    if not question:
        raise HTTPException(status_code=400, detail="Missing question")

    rag_result = rag_service.query(question)
    return {"response": rag_result.response if rag_result else None}


@app.post("/ask")
async def respond_ask(request: Request):
    if not ai_assitant:
        raise HTTPException(
            status_code=409,
            detail="AI Assistant Service is not intialized. Please set an API KEY",
        )
    body = await request.json()
    question = body.get("question")
    if not question:
        raise HTTPException(status_code=400, detail="Missing question")

    try:
        answer = ai_assitant.ask(question)
    except AuthenticationError:
        raise HTTPException(status_code=400, detail="API key Invalidi")
    return {"response": answer}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
