from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from assistant import ask
from rag import rag

# This is to log modules at runtime, to exlucde modules not required and improve bundle size from pyinstaller
# for module_name, module in sys.modules.items():
#     if hasattr(module, "__file__") and module.__file__ is not None:
#         module_path = os.path.abspath(module.__file__)
#         if "site-packages" in module_path.lower():
#             print(f"{module_name}")

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


@app.post("/rag")
async def respond_rag(request: Request):
    body = await request.json()
    question = body.get("question")
    if not question:
        return {"error": "Missing question"}
    rag_result = rag(question)

    return {"response": rag_result.response}


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
