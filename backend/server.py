from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from assistant import ask

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/ask")
async def respond_ask(request: Request):
    body = await request.json()
    question = body.get("question")
    if not question:
        return {"error": "Missing question"}
    answer = ask(question)

    return {"response": answer}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
