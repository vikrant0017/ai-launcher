import json
from typing import Annotated

import ollama
from fastapi import APIRouter
from fastapi.exceptions import HTTPException
from fastapi.params import Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

models_router = APIRouter(
    prefix="/models",
    tags=["models"],  # Groups routes in OpenAPI dAdd necessary UI components shadcnocs
)


class PullModelRequest(BaseModel):
    model: str


class ShowModelRequest(BaseModel):
    model: str


def get_model_service():
    return ollama.Client()


CommonsDep = Annotated[ollama.Client, Depends(get_model_service)]


@models_router.post("/pull")
async def pull_model(req: PullModelRequest, service: CommonsDep):
    # This is based on the behaviour of ollama pull method.
    # https://github.com/ollama/ollama-python?tab=readme-ov-file#errors
    # IT raises ollama.ResponseError during streaming.
    # TODO: Better to put this logic behind a CustomService
    try:
        pull_stream = service.pull(model=req.model, stream=True)
        manifest_chunk = next(pull_stream)
        can_raise_error_chunk = next(pull_stream)
    except ollama.ResponseError as e:
        if "File Not Found" in e.error:
            raise HTTPException(404, "Model Not Found (Check the model name)")

        raise HTTPException(404, e.error)

    def generate():
        yield json.dumps(dict(manifest_chunk)) + "\n"
        yield json.dumps(dict(can_raise_error_chunk)) + "\n"

        # Continue with the rest of the stream
        try:
            for progress_update in pull_stream:
                yield json.dumps(dict(progress_update)) + "\n"
        except Exception as e:
            # Log errors that occur mid-stream
            print(f"Error during model pull: {e}")
            # Can't change HTTP status at this point, but can yield an error message
            yield json.dumps({"error": str(e)}) + "\n"

    return StreamingResponse(generate(), media_type="application/x-ndjson")
