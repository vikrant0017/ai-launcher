import dataclasses
import json
from collections.abc import Iterator

import ollama
from fastapi.applications import FastAPI
from fastapi.testclient import TestClient
from typing_extensions import Any

from routers.models import get_model_service, models_router

app = FastAPI()
client = TestClient(app)
app.include_router(models_router)


@dataclasses.dataclass
class Model:
    model: str


# Must Match Ollamas interface for method names
class FakeModelService:
    def __init__(
        self, should_fail: bool = False, model_not_found: bool = False
    ) -> None:
        self.should_fail: bool = should_fail
        self.model_not_found: bool = model_not_found

    def list(self):
        return [Model(model="xyz"), Model(model="abc")]

    def pull(self, model: str, stream: bool) -> Iterator[Any]:
        print(model, stream)

        if self.model_not_found:
            yield {"status": "pulling manifest"}
            raise ollama.ResponseError("File Not Found")

        if self.should_fail:
            raise ConnectionError()
        stream_chunks = [
            {
                "status": "pulling manifest",
                "completed": None,
                "total": None,
                "digest": None,
            },
            {
                "status": "pulling 797b70c4edf8",
                "completed": None,
                "total": 10,
                "digest": "sha256:123a",
            },
            {
                "status": "pulling 797b70c4edf8",
                "completed": 10,
                "total": 10,
                "digest": "sha256:123a",
            },
            {
                "status": "writing manifest",
                "completed": None,
                "total": None,
                "digest": None,
            },
            {"status": "success", "completed": None, "total": None, "digest": None},
        ]

        for chunk in stream_chunks:
            yield chunk


def create_test_app(model_service: FakeModelService):
    app = FastAPI()
    app.include_router(models_router)
    app.dependency_overrides[get_model_service] = lambda: model_service
    return app


class TestPullModel:
    def test_model_streaming_success(self):
        model_service = FakeModelService()
        client = TestClient(create_test_app(model_service))

        streamed_response = client.request(
            "POST", "/models/pull", json={"model": "some-model"}
        )
        assert streamed_response.headers["content-type"] == "application/x-ndjson"
        assert streamed_response.status_code == 200
        # Last new line character leads an empty element in the end during split
        lines = streamed_response.text.split("\n")[:-1]
        assert len(lines) == 5
        assert json.loads(lines[-1])["status"] == "success"

    def test_model_not_found(self):
        model_service = FakeModelService(model_not_found=True)
        client = TestClient(create_test_app(model_service))
        streamed_response = client.request(
            "POST", "/models/pull", json={"model": "xyz"}
        )
        assert streamed_response.status_code == 404
        assert "Model Not Found" in streamed_response.json()["detail"]
